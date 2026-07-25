'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';
import {
  yearToTimelineX,
  type TimelineMode,
} from '@/lib/timeline-presentation';
import {
  fitTimelineViewerRect,
  panTimelineViewer,
  semanticTimelineTicks,
  timelineViewerMaxScale,
  timelineViewerSemanticLevel,
  TIMELINE_VIEWER_DOUBLE_TAP_SCALE,
  worldToTimelineViewerScreen,
  zoomTimelineAtPoint,
  type TimelineViewerPoint,
  type TimelineViewerSemanticLevel,
  type TimelineViewerTransform,
} from '@/lib/timeline-viewer';

export type TimelineViewerNode = {
  key: string;
  movementId: string;
  href: string;
  nameJa: string;
  nameEn: string;
  shortLabel?: string;
  dateLabel: string;
  regionLabel: string;
  classificationLabel: string;
  barStart: number;
  barEnd: number;
  centerY: number;
  priority: boolean;
};

export type TimelineViewerRegion = {
  id: string;
  label: string;
  top: number;
  height: number;
};

type Props = {
  active: boolean;
  contentHeight: number;
  contentOriginX: number;
  contentOriginY: number;
  initialScrollLeft: number;
  timelineMode: TimelineMode;
  timelineWidth: number;
  nodes: TimelineViewerNode[];
  regions: TimelineViewerRegion[];
  onClose: () => void;
  onSemanticLevelChange: (level: TimelineViewerSemanticLevel) => void;
  children: ReactNode;
};

type Gesture = {
  transform: TimelineViewerTransform;
  center: TimelineViewerPoint;
  distance: number;
};

type AxisMetrics = {
  regionWidth: number;
  timeHeight: number;
  controlBottom: number;
};

const IDENTITY_TRANSFORM: TimelineViewerTransform = {
  x: 0,
  y: 0,
  scale: 1,
};
const DOUBLE_TAP_DELAY = 320;
const DRAG_THRESHOLD = 5;
const AXIS_EDGE_PADDING = 10;

const pointerCenter = (points: TimelineViewerPoint[]) => ({
  x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
  y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
});

const pointerDistance = (points: TimelineViewerPoint[]) =>
  points.length < 2
    ? 0
    : Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

const viewerAxisMetrics = (viewportWidth: number): AxisMetrics => {
  if (viewportWidth <= 639) {
    return { regionWidth: 112, timeHeight: 52, controlBottom: 68 };
  }
  if (viewportWidth <= 1023) {
    return { regionWidth: 144, timeHeight: 54, controlBottom: 0 };
  }
  return { regionWidth: 176, timeHeight: 56, controlBottom: 0 };
};

const formatViewerYear = (year: number) => {
  if (year === 0) return '紀元境界';
  return year < 0 ? `前${Math.abs(year).toLocaleString('ja-JP')}` : `${year}`;
};

export function TimelineViewerFrame({
  active,
  contentHeight,
  contentOriginX,
  contentOriginY,
  initialScrollLeft,
  timelineMode,
  timelineWidth,
  nodes,
  regions,
  onClose,
  onSemanticLevelChange,
  children,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeLayerRef = useRef<HTMLDivElement>(null);
  const timeAxisRef = useRef<HTMLDivElement>(null);
  const regionAxisRef = useRef<HTMLDivElement>(null);
  const scaleOutputRef = useRef<HTMLOutputElement>(null);
  const transformRef = useRef<TimelineViewerTransform>(IDENTITY_TRANSFORM);
  const pointersRef = useRef(new Map<number, TimelineViewerPoint>());
  const gestureRef = useRef<Gesture | null>(null);
  const movedRef = useRef(false);
  const gestureTargetRef = useRef<EventTarget | null>(null);
  const lastTapRef = useRef<{ time: number; point: TimelineViewerPoint } | null>(
    null,
  );
  const fitModeRef = useRef(false);
  const clickResetTimerRef = useRef<number | null>(null);
  const semanticLevelRef = useRef<TimelineViewerSemanticLevel>('standard');
  const tickSignatureRef = useRef('');
  const [semanticLevel, setSemanticLevel] =
    useState<TimelineViewerSemanticLevel>('standard');
  const [axisTicks, setAxisTicks] = useState(() =>
    semanticTimelineTicks(timelineMode, timelineWidth, 1),
  );

  const updateFixedLayers = useCallback(
    (transform: TimelineViewerTransform) => {
      const stage = stageRef.current;
      const root = rootRef.current;
      const nodeLayer = nodeLayerRef.current;
      if (!stage || !root || !nodeLayer) return;

      const metrics = viewerAxisMetrics(stage.clientWidth);
      root.style.setProperty(
        '--timeline-viewer-region-axis-width',
        `${metrics.regionWidth}px`,
      );
      root.style.setProperty(
        '--timeline-viewer-time-axis-height',
        `${metrics.timeHeight}px`,
      );

      const nextTicks = semanticTimelineTicks(
        timelineMode,
        timelineWidth,
        transform.scale,
      );
      const tickSignature = nextTicks.join(',');
      if (tickSignature !== tickSignatureRef.current) {
        tickSignatureRef.current = tickSignature;
        setAxisTicks(nextTicks);
      }

      for (const tick of timeAxisRef.current?.querySelectorAll<HTMLElement>(
        '[data-viewer-tick]',
      ) ?? []) {
        const year = Number(tick.dataset.viewerTick);
        const worldX =
          contentOriginX + yearToTimelineX(year, timelineMode, timelineWidth);
        const screen = worldToTimelineViewerScreen(
          { x: worldX, y: 0 },
          transform,
        );
        const visible =
          screen.x >= metrics.regionWidth + AXIS_EDGE_PADDING &&
          screen.x <= stage.clientWidth - AXIS_EDGE_PADDING;
        tick.style.transform = `translate3d(${screen.x}px, 0, 0)`;
        tick.style.visibility = visible ? 'visible' : 'hidden';
      }

      for (const label of regionAxisRef.current?.querySelectorAll<HTMLElement>(
        '[data-viewer-region-top]',
      ) ?? []) {
        const top = Number(label.dataset.viewerRegionTop);
        const height = Number(label.dataset.viewerRegionHeight);
        const screen = worldToTimelineViewerScreen(
          { x: 0, y: top + height / 2 },
          transform,
        );
        const visible =
          screen.y >= metrics.timeHeight + 18 &&
          screen.y <= stage.clientHeight - metrics.controlBottom - 18;
        label.style.transform = `translate3d(0, ${screen.y}px, 0) translateY(-50%)`;
        label.style.visibility = visible ? 'visible' : 'hidden';
      }

      for (const node of nodeLayer.querySelectorAll<HTMLElement>(
        '[data-viewer-node]',
      )) {
        const barStart = Number(node.dataset.barStart) + contentOriginX;
        const barEnd = Number(node.dataset.barEnd) + contentOriginX;
        const centerY = Number(node.dataset.centerY);
        const startScreen = worldToTimelineViewerScreen(
          { x: barStart, y: centerY },
          transform,
        );
        const endScreen = worldToTimelineViewerScreen(
          { x: barEnd, y: centerY },
          transform,
        );
        const nodeWidth = node.offsetWidth;
        const nodeHeight = node.offsetHeight;
        const contentLeft = metrics.regionWidth + AXIS_EDGE_PADDING;
        const contentRight = stage.clientWidth - AXIS_EDGE_PADDING;
        const longBar = endScreen.x - startScreen.x >= nodeWidth + 32;
        const desiredX = longBar
          ? Math.min(
              Math.max(contentLeft, startScreen.x + 4),
              endScreen.x - nodeWidth - 4,
            )
          : Math.min(
              Math.max(
                contentLeft,
                (startScreen.x + endScreen.x - nodeWidth) / 2,
              ),
              contentRight - nodeWidth,
            );
        const visible =
          endScreen.x >= contentLeft &&
          startScreen.x <= contentRight &&
          startScreen.y + nodeHeight / 2 >= metrics.timeHeight &&
          startScreen.y - nodeHeight / 2 <=
            stage.clientHeight - metrics.controlBottom;

        node.style.transform = `translate3d(${desiredX}px, ${startScreen.y - nodeHeight / 2}px, 0)`;
        node.style.visibility = visible ? 'visible' : 'hidden';
      }
    },
    [contentOriginX, timelineMode, timelineWidth],
  );

  const applyTransform = useCallback(
    (next: TimelineViewerTransform) => {
      transformRef.current = next;
      const canvas = canvasRef.current;
      const root = rootRef.current;
      if (canvas) {
        canvas.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`;
      }
      if (root) {
        root.style.setProperty('--timeline-viewer-scale', String(next.scale));
        root.dataset.viewerScale = String(next.scale);
        root.dataset.viewerX = String(next.x);
        root.dataset.viewerY = String(next.y);
      }
      if (scaleOutputRef.current) {
        scaleOutputRef.current.value = `${Math.round(next.scale * 100)}%`;
        scaleOutputRef.current.textContent = `${Math.round(next.scale * 100)}%`;
      }

      const nextSemanticLevel = timelineViewerSemanticLevel(next.scale);
      if (nextSemanticLevel !== semanticLevelRef.current) {
        semanticLevelRef.current = nextSemanticLevel;
        setSemanticLevel(nextSemanticLevel);
        onSemanticLevelChange(nextSemanticLevel);
      }
      updateFixedLayers(next);
    },
    [onSemanticLevelChange, updateFixedLayers],
  );

  const fitContent = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const metrics = viewerAxisMetrics(stage.clientWidth);
    fitModeRef.current = true;
    applyTransform(
      fitTimelineViewerRect(
        {
          x: contentOriginX,
          y: contentOriginY,
          width: timelineWidth,
          height: Math.max(1, contentHeight - contentOriginY),
        },
        { width: stage.clientWidth, height: stage.clientHeight },
        {
          top: metrics.timeHeight,
          right: 0,
          bottom: metrics.controlBottom,
          left: metrics.regionWidth,
        },
      ),
    );
  }, [
    applyTransform,
    contentHeight,
    contentOriginX,
    contentOriginY,
    timelineWidth,
  ]);

  const zoomAt = useCallback(
    (point: TimelineViewerPoint, factor: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      fitModeRef.current = false;
      applyTransform(
        zoomTimelineAtPoint(
          transformRef.current,
          transformRef.current.scale * factor,
          point,
          timelineViewerMaxScale(stage.clientWidth),
        ),
      );
    },
    [applyTransform],
  );

  const zoomFromCenter = useCallback(
    (factor: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const metrics = viewerAxisMetrics(stage.clientWidth);
      zoomAt(
        {
          x:
            metrics.regionWidth +
            (stage.clientWidth - metrics.regionWidth) / 2,
          y:
            metrics.timeHeight +
            (stage.clientHeight -
              metrics.timeHeight -
              metrics.controlBottom) /
              2,
        },
        factor,
      );
    },
    [zoomAt],
  );

  const activeRuntimeRef = useRef({
    applyTransform,
    contentOriginX,
    contentOriginY,
    fitContent,
    initialScrollLeft,
  });
  useLayoutEffect(() => {
    activeRuntimeRef.current = {
      applyTransform,
      contentOriginX,
      contentOriginY,
      fitContent,
      initialScrollLeft,
    };
  }, [
    applyTransform,
    contentOriginX,
    contentOriginY,
    fitContent,
    initialScrollLeft,
  ]);

  useEffect(() => {
    if (!active) {
      canvasRef.current?.style.removeProperty('transform');
      rootRef.current?.style.removeProperty('--timeline-viewer-scale');
      return;
    }

    const body = document.body;
    const activePointers = pointersRef.current;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    body.classList.add('timeline-viewer-open');

    const header = document.querySelector<HTMLElement>('body > header');
    const footer = document.querySelector<HTMLElement>('body > footer');
    for (const element of [header, footer]) {
      if (!element) continue;
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    }

    const originalLinks = Array.from(
      canvasRef.current?.querySelectorAll<HTMLElement>(
        '[data-timeline-bar], .timeline-origin-rail',
      ) ?? [],
    );
    for (const link of originalLinks) {
      link.inert = true;
      link.setAttribute('aria-hidden', 'true');
    }

    const frame = window.requestAnimationFrame(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const metrics = viewerAxisMetrics(stage.clientWidth);
      const runtime = activeRuntimeRef.current;
      fitModeRef.current = false;
      runtime.applyTransform({
        x:
          metrics.regionWidth -
          runtime.contentOriginX -
          runtime.initialScrollLeft,
        y: metrics.timeHeight - runtime.contentOriginY,
        scale: 1,
      });
      stage.focus({ preventScroll: true });
    });

    const observer = new ResizeObserver(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const runtime = activeRuntimeRef.current;
      if (fitModeRef.current) {
        runtime.fitContent();
        return;
      }
      const maximumScale = timelineViewerMaxScale(stage.clientWidth);
      const current = transformRef.current;
      if (current.scale > maximumScale) {
        runtime.applyTransform(
          zoomTimelineAtPoint(
            current,
            maximumScale,
            {
              x: stage.clientWidth / 2,
              y: stage.clientHeight / 2,
            },
            maximumScale,
          ),
        );
      } else {
        runtime.applyTransform(current);
      }
    });
    if (stageRef.current) observer.observe(stageRef.current);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      body.style.overflow = previousOverflow;
      body.classList.remove('timeline-viewer-open');
      for (const element of [header, footer]) {
        if (!element) continue;
        element.inert = false;
        element.removeAttribute('aria-hidden');
      }
      for (const link of originalLinks) {
        link.inert = false;
        link.removeAttribute('aria-hidden');
      }
      activePointers.clear();
      gestureRef.current = null;
      fitModeRef.current = false;
      if (clickResetTimerRef.current !== null) {
        window.clearTimeout(clickResetTimerRef.current);
        clickResetTimerRef.current = null;
      }
    };
  }, [active]);

  useLayoutEffect(() => {
    if (!active) return;
    if (fitModeRef.current) fitContent();
    else updateFixedLayers(transformRef.current);
  }, [
    active,
    axisTicks,
    fitContent,
    nodes,
    regions,
    semanticLevel,
    updateFixedLayers,
  ]);

  const resetGesture = () => {
    const points = [...pointersRef.current.values()];
    if (points.length === 0) {
      gestureRef.current = null;
      return;
    }
    gestureRef.current = {
      transform: transformRef.current,
      center: pointerCenter(points),
      distance: pointerDistance(points),
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!active) return;
    if (
      (event.target as HTMLElement).closest(
        '[data-viewer-controls],[data-viewer-node-layer]',
      )
    ) {
      return;
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer events are not active browser pointers.
    }
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    gestureTargetRef.current = event.target;
    movedRef.current = false;
    resetGesture();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!active || !pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const gesture = gestureRef.current;
    if (!gesture) return;
    const points = [...pointersRef.current.values()];
    const center = pointerCenter(points);

    if (
      Math.hypot(center.x - gesture.center.x, center.y - gesture.center.y) >
        DRAG_THRESHOLD ||
      points.length > 1
    ) {
      movedRef.current = true;
    }

    fitModeRef.current = false;
    if (points.length > 1 && gesture.distance > 0) {
      const distance = pointerDistance(points);
      const translated = panTimelineViewer(gesture.transform, {
        x: center.x - gesture.center.x,
        y: center.y - gesture.center.y,
      });
      applyTransform(
        zoomTimelineAtPoint(
          translated,
          gesture.transform.scale * (distance / gesture.distance),
          center,
          timelineViewerMaxScale(stageRef.current?.clientWidth ?? 1024),
        ),
      );
      return;
    }

    applyTransform(
      panTimelineViewer(gesture.transform, {
        x: center.x - gesture.center.x,
        y: center.y - gesture.center.y,
      }),
    );
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!active || !pointersRef.current.has(event.pointerId)) return;
    const point = pointersRef.current.get(event.pointerId)!;
    const wasMoved = movedRef.current;
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const interactiveTarget =
      gestureTargetRef.current instanceof Element &&
      gestureTargetRef.current.closest('a,button');
    if (!wasMoved && event.pointerType === 'touch' && !interactiveTarget) {
      const previousTap = lastTapRef.current;
      const now = performance.now();
      if (
        previousTap &&
        now - previousTap.time <= DOUBLE_TAP_DELAY &&
        Math.hypot(
          previousTap.point.x - point.x,
          previousTap.point.y - point.y,
        ) <= 28
      ) {
        event.preventDefault();
        const targetScale =
          transformRef.current.scale > 1.05
            ? 1
            : TIMELINE_VIEWER_DOUBLE_TAP_SCALE;
        applyTransform(
          zoomTimelineAtPoint(
            transformRef.current,
            targetScale,
            point,
            timelineViewerMaxScale(stageRef.current?.clientWidth ?? 1024),
          ),
        );
        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, point };
      }
    }

    if (wasMoved) {
      clickResetTimerRef.current = window.setTimeout(() => {
        movedRef.current = false;
        clickResetTimerRef.current = null;
      }, 0);
    }
    resetGesture();
  };

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (
      !active ||
      (event.target as HTMLElement).closest('a,button,[data-viewer-node-layer]')
    ) {
      return;
    }
    event.preventDefault();
    const targetScale =
      transformRef.current.scale > 1.05
        ? 1
        : TIMELINE_VIEWER_DOUBLE_TAP_SCALE;
    applyTransform(
      zoomTimelineAtPoint(
        transformRef.current,
        targetScale,
        { x: event.clientX, y: event.clientY },
        timelineViewerMaxScale(stageRef.current?.clientWidth ?? 1024),
      ),
    );
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!active) return;
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.002);
      zoomAt({ x: event.clientX, y: event.clientY }, factor);
      return;
    }

    event.preventDefault();
    fitModeRef.current = false;
    applyTransform(
      panTimelineViewer(transformRef.current, {
        x: event.shiftKey ? -event.deltaY : -event.deltaX,
        y: event.shiftKey ? 0 : -event.deltaY,
      }),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!active) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomFromCenter(1.25);
      return;
    }
    if (event.key === '-') {
      event.preventDefault();
      zoomFromCenter(0.8);
      return;
    }
    if (event.key === '0') {
      event.preventDefault();
      fitContent();
      return;
    }
    if (
      event.target === stageRef.current &&
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
    ) {
      event.preventDefault();
      const delta = 56;
      applyTransform(
        panTimelineViewer(transformRef.current, {
          x:
            event.key === 'ArrowLeft'
              ? delta
              : event.key === 'ArrowRight'
                ? -delta
                : 0,
          y:
            event.key === 'ArrowUp'
              ? delta
              : event.key === 'ArrowDown'
                ? -delta
                : 0,
        }),
      );
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter(
      (element) =>
        element.getClientRects().length > 0 &&
        !element.closest('[inert]') &&
        element.getAttribute('aria-hidden') !== 'true',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`timeline-viewer-frame ${active ? 'timeline-viewer-frame--active' : ''}`}
      role={active ? 'dialog' : undefined}
      aria-modal={active ? 'true' : undefined}
      aria-label={active ? '横型タイムライン閲覧モード' : undefined}
      data-timeline-viewer={active ? 'active' : 'inactive'}
      data-semantic-level={active ? semanticLevel : undefined}
      onKeyDown={handleKeyDown}
    >
      {active && (
        <>
          <div
            className="timeline-viewer-controls"
            aria-label="閲覧モード操作"
            data-viewer-controls
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="閲覧モードを閉じる"
            >
              <span aria-hidden="true">×</span>
            </button>
            <button
              type="button"
              onClick={() => zoomFromCenter(0.8)}
              aria-label="縮小"
            >
              <span aria-hidden="true">−</span>
            </button>
            <output ref={scaleOutputRef} aria-live="polite" aria-label="現在倍率">
              100%
            </output>
            <button
              type="button"
              onClick={() => zoomFromCenter(1.25)}
              aria-label="拡大"
            >
              <span aria-hidden="true">＋</span>
            </button>
            <button
              type="button"
              onClick={fitContent}
              aria-label="全体表示へ戻す"
            >
              全体表示
            </button>
          </div>

          <div
            className="timeline-viewer-time-axis"
            ref={timeAxisRef}
            aria-hidden="true"
          >
            {axisTicks.map((tick) => (
              <span
                key={tick}
                className="timeline-viewer-time-tick"
                data-viewer-tick={tick}
                data-era-boundary={
                  tick === 0 ||
                  tick === timelineMode.start ||
                  tick === timelineMode.end ||
                  undefined
                }
              >
                {formatViewerYear(tick)}
              </span>
            ))}
          </div>
          <div
            className="timeline-viewer-region-axis"
            ref={regionAxisRef}
            aria-hidden="true"
          >
            {regions.map((region) => (
              <span
                key={region.id}
                className="timeline-viewer-region-label"
                data-viewer-region-top={region.top}
                data-viewer-region-height={region.height}
              >
                {region.label}
              </span>
            ))}
          </div>
          <div className="timeline-viewer-axis-origin" aria-hidden="true">
            <strong>地域</strong>
            <span>年代 →</span>
          </div>

          <div
            ref={nodeLayerRef}
            className="timeline-viewer-node-layer"
            data-viewer-node-layer
          >
            {nodes.map((node) => (
              <Link
                key={node.key}
                href={node.href}
                prefetch={false}
                className="timeline-viewer-node"
                data-viewer-node
                data-movement-id={node.movementId}
                data-bar-start={node.barStart}
                data-bar-end={node.barEnd}
                data-center-y={node.centerY}
                data-priority={node.priority || undefined}
                aria-label={`${node.nameJa}。${node.dateLabel}。${node.regionLabel}。${node.classificationLabel}`}
                title={`${node.nameJa} (${node.nameEn})`}
              >
                <span className="timeline-viewer-node__short">
                  {node.shortLabel ?? node.nameJa}
                </span>
                <span className="timeline-viewer-node__name">
                  {node.nameJa}
                </span>
                <span className="timeline-viewer-node__date">
                  {node.dateLabel}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      <div
        ref={stageRef}
        className="timeline-viewer-stage"
        tabIndex={active ? 0 : undefined}
        role={active ? 'application' : undefined}
        aria-label={
          active
            ? '1本指またはマウスで移動、2本指またはコントロールキーとホイールで拡大縮小できます。上部に年代軸、左側に地域軸を固定表示します'
            : undefined
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onClickCapture={(event) => {
          if (!movedRef.current) return;
          event.preventDefault();
          event.stopPropagation();
        }}
        data-timeline-viewer-stage
      >
        <div
          ref={canvasRef}
          className="timeline-viewer-canvas"
          style={
            active
              ? {
                  width: contentOriginX + timelineWidth,
                  height: contentHeight,
                }
              : undefined
          }
          data-timeline-viewer-canvas
        >
          {children}
        </div>
      </div>
    </div>
  );
}
