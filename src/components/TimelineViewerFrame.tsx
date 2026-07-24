'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';
import { calculateFollowLabelX } from '@/lib/timeline-presentation';
import {
  fitTimelineViewer,
  panTimelineViewer,
  viewerLabelVariant,
  zoomTimelineAtPoint,
  type TimelineViewerPoint,
  type TimelineViewerTransform,
} from '@/lib/timeline-viewer';

type Props = {
  active: boolean;
  contentWidth: number;
  contentHeight: number;
  initialScrollLeft: number;
  onClose: () => void;
  children: ReactNode;
};

type Gesture = {
  transform: TimelineViewerTransform;
  center: TimelineViewerPoint;
  distance: number;
};

const IDENTITY_TRANSFORM: TimelineViewerTransform = {
  x: 0,
  y: 0,
  scale: 1,
};
const VIEWER_LABEL_PADDING = 8;
const DOUBLE_TAP_DELAY = 320;
const DRAG_THRESHOLD = 5;

const pointerCenter = (points: TimelineViewerPoint[]) => ({
  x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
  y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
});

const pointerDistance = (points: TimelineViewerPoint[]) =>
  points.length < 2
    ? 0
    : Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);

export function TimelineViewerFrame({
  active,
  contentWidth,
  contentHeight,
  initialScrollLeft,
  onClose,
  children,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
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

  const updateLabels = useCallback((transform: TimelineViewerTransform) => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const track = canvas.querySelector<HTMLElement>('[data-timeline-track]');
    if (!track) return;

    const viewportLeft =
      (-transform.x / transform.scale) - track.offsetLeft;
    const viewportRight =
      (stage.clientWidth - transform.x) / transform.scale - track.offsetLeft;
    const innerPadding = VIEWER_LABEL_PADDING / transform.scale;

    for (const label of canvas.querySelectorAll<HTMLElement>(
      '[data-follow-label]',
    )) {
      const bar = label.closest<HTMLElement>('[data-timeline-bar]');
      const text = label.querySelector<HTMLElement>('[data-label-text]');
      if (!bar || !text) continue;

      const fullLabel = label.dataset.fullLabel ?? '';
      const shortLabel = label.dataset.shortLabel;
      const selected = bar.dataset.active === 'true';
      const variant = selected
        ? 'full'
        : viewerLabelVariant(transform.scale, Boolean(shortLabel));
      text.textContent =
        variant === 'short' && shortLabel ? shortLabel : fullLabel;
      label.dataset.labelVariant = variant;

      const barStart = Number(bar.dataset.barStart);
      const barEnd = Number(bar.dataset.barEnd);
      const labelWidth = Math.min(
        Math.max(text.scrollWidth + innerPadding, 1),
        Math.max(1, barEnd - barStart - innerPadding * 2),
      );
      const position = calculateFollowLabelX({
        barStart,
        barEnd,
        labelWidth,
        viewportLeft,
        viewportRight,
        innerPadding,
      });
      label.style.width = `${labelWidth}px`;
      label.style.maxWidth = `${Math.max(1, barEnd - barStart)}px`;
      label.style.transform = `translate3d(${position.x - barStart}px, 0, 0)`;
      label.dataset.labelFollowing = position.followsViewport ? 'true' : 'false';
    }
  }, []);

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
      updateLabels(next);
    },
    [updateLabels],
  );

  const fitContent = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    fitModeRef.current = true;
    applyTransform(
      fitTimelineViewer(
        { width: contentWidth, height: contentHeight },
        { width: stage.clientWidth, height: stage.clientHeight },
      ),
    );
  }, [applyTransform, contentHeight, contentWidth]);

  const zoomAt = useCallback(
    (point: TimelineViewerPoint, factor: number) => {
      fitModeRef.current = false;
      applyTransform(
        zoomTimelineAtPoint(
          transformRef.current,
          transformRef.current.scale * factor,
          point,
        ),
      );
    },
    [applyTransform],
  );

  const zoomFromCenter = useCallback(
    (factor: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      zoomAt(
        { x: stage.clientWidth / 2, y: stage.clientHeight / 2 },
        factor,
      );
    },
    [zoomAt],
  );

  useEffect(() => {
    if (!active) {
      const canvas = canvasRef.current;
      canvas?.style.removeProperty('transform');
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

    const frame = window.requestAnimationFrame(() => {
      fitModeRef.current = false;
      applyTransform({
        x: -initialScrollLeft,
        y: 88,
        scale: 1,
      });
      stageRef.current?.focus({ preventScroll: true });
    });
    const observer = new ResizeObserver(() => {
      if (fitModeRef.current) fitContent();
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
      activePointers.clear();
      gestureRef.current = null;
      fitModeRef.current = false;
      if (clickResetTimerRef.current !== null) {
        window.clearTimeout(clickResetTimerRef.current);
        clickResetTimerRef.current = null;
      }
    };
  }, [active, applyTransform, fitContent, initialScrollLeft]);

  useEffect(() => {
    if (!active) return;
    updateLabels(transformRef.current);
  }, [active, contentHeight, contentWidth, updateLabels]);

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
    if ((event.target as HTMLElement).closest('[data-viewer-controls]')) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer events used by automation are not active browser
      // pointers; physical mouse and touch events still receive capture.
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
        const targetScale = transformRef.current.scale > 1.05 ? 1 : 2;
        applyTransform(
          zoomTimelineAtPoint(transformRef.current, targetScale, point),
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
    if (!active || (event.target as HTMLElement).closest('a,button')) return;
    event.preventDefault();
    const targetScale = transformRef.current.scale > 1.05 ? 1 : 2;
    applyTransform(
      zoomTimelineAtPoint(
        transformRef.current,
        targetScale,
        { x: event.clientX, y: event.clientY },
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
    ).filter((element) => element.getClientRects().length > 0);
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
      onKeyDown={handleKeyDown}
    >
      {active && (
        <div
          className="timeline-viewer-controls"
          aria-label="閲覧モード操作"
          data-viewer-controls
        >
          <button type="button" onClick={onClose} aria-label="閲覧モードを閉じる">
            <span aria-hidden="true">×</span>
          </button>
          <button type="button" onClick={() => zoomFromCenter(0.8)} aria-label="縮小">
            <span aria-hidden="true">−</span>
          </button>
          <output ref={scaleOutputRef} aria-live="polite" aria-label="現在倍率">
            100%
          </output>
          <button type="button" onClick={() => zoomFromCenter(1.25)} aria-label="拡大">
            <span aria-hidden="true">＋</span>
          </button>
          <button type="button" onClick={fitContent} aria-label="全体表示へ戻す">
            全体表示
          </button>
        </div>
      )}

      <div
        ref={stageRef}
        className="timeline-viewer-stage"
        tabIndex={active ? 0 : undefined}
        role={active ? 'application' : undefined}
        aria-label={
          active
            ? '1本指またはマウスで移動、2本指またはコントロールキーとホイールで拡大縮小できます'
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
              ? { width: contentWidth, height: contentHeight }
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
