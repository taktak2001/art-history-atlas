'use client';

import Link from 'next/link';
import { SemanticLodFab } from '@/components/SemanticLodFab';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from 'react';
import type { TimelineViewerFrameProps } from '@/components/TimelineViewerFrame';
import {
  formatTimelineYearLabel,
  timelineXToYear,
  yearToTimelineX,
} from '@/lib/timeline-presentation';
import {
  assignTimelineViewerTracks,
  clampTimelineViewerScale,
  layoutTimelineViewerDateCaptions,
  layoutTimelineViewerPeriodRails,
  selectTimelineViewerTickLabels,
  semanticTimelineTicks,
  snapTimelineViewerPixel,
  timelineViewerContentViewportAnchor,
  timelineViewerMaxScale,
  timelineViewerRegionAnchorAt,
  timelineViewerRegionHeight,
  timelineViewerRightGutter,
  timelineViewerScrollTopForRegionAnchor,
  timelineViewerSemanticLevel,
  timelineViewerTickPriority,
  timelineViewerTrackCenter,
  TIMELINE_VIEWER_DOUBLE_TAP_SCALE,
  TIMELINE_VIEWER_FIT_MIN_SCALE,
  type TimelineViewerPoint,
  type TimelineViewerRegionAnchor,
} from '@/lib/timeline-viewer';

type AxisMetrics = {
  regionWidth: number;
  timeHeight: number;
  controlBottom: number;
};

type NativeNodeLayout = {
  key: string;
  left: number;
  top: number;
  periodLeft: number;
  periodTop: number;
  periodWidth: number;
  periodOffsetY: number;
  dateOffsetY: number;
  track: number | null;
};

type NativeRegionLayout = {
  id: string;
  top: number;
  height: number;
  trackCount: number;
  overflowCount: number;
  overflowLeft: number;
};

type PendingZoom = {
  kind: 'zoom' | 'lod';
  anchorX: number;
  anchorY: number;
  year: number;
  regionAnchor: TimelineViewerRegionAnchor;
  regionIndex: number;
};

type PinchGesture = {
  initialDistance: number;
  initialScale: number;
  anchorX: number;
  anchorY: number;
  previewScale: number;
};

type DesktopDragGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
  active: boolean;
};

const CONTROLS_IDLE_DELAY = 2500;
const LABEL_GAP = 10;
const NODE_HEIGHT = 60;
const SURFACE_HEIGHT = 32;
const PERIOD_OFFSET = 37;
const DATE_OFFSET = 44;
const DATE_HEIGHT = 11;
const DATE_INLINE_INSET = 4;
const PERIOD_HEIGHT = 2;
const BOARD_EDGE_PADDING = 12;
const DESKTOP_DRAG_THRESHOLD = 6;

const viewerAxisMetrics = (viewportWidth: number): AxisMetrics => {
  if (viewportWidth <= 639) {
    return { regionWidth: 102, timeHeight: 50, controlBottom: 62 };
  }
  if (viewportWidth <= 1023) {
    return { regionWidth: 120, timeHeight: 50, controlBottom: 62 };
  }
  return { regionWidth: 144, timeHeight: 52, controlBottom: 62 };
};

const viewerTickStrength = (year: number) => {
  if (year % 100 === 0) return 'century';
  if (year % 50 === 0) return 'half-century';
  return 'minor';
};

const estimateLabelWidth = (label: string) => {
  const units = Array.from(label).reduce(
    (sum, character) => sum + (/[\u0000-\u00ff]/.test(character) ? 0.62 : 1),
    0,
  );
  return Math.min(230, Math.max(72, 28 + units * 15));
};

const estimateDateWidth = (label: string) => {
  const units = Array.from(label).reduce(
    (sum, character) =>
      sum + (/[\u0000-\u00ff]/.test(character) ? 0.58 : 1),
    0,
  );
  return Math.max(28, 8 + units * 6.25);
};

const touchDistance = (touches: TouchList) => {
  if (touches.length < 2) return 0;
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  );
};

const touchCenterX = (touches: TouchList) =>
  touches.length < 2
    ? 0
    : (touches[0].clientX + touches[1].clientX) / 2;

const touchCenterY = (touches: TouchList) =>
  touches.length < 2
    ? 0
    : (touches[0].clientY + touches[1].clientY) / 2;

export function NativeTimelineViewerFrame({
  active,
  initialScrollLeft,
  timelineMode,
  timelineWidth,
  nodes,
  regions,
  lod,
  lodCounts,
  onClose,
  onLodChange,
  children,
}: TimelineViewerFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);
  const scaleOutputRef = useRef<HTMLOutputElement>(null);
  const scaleRef = useRef(1);
  const renderedScaleRef = useRef(1);
  const pendingZoomRef = useRef<PendingZoom | null>(null);
  const controlsIdleTimerRef = useRef<number | null>(null);
  const pinchRef = useRef<PinchGesture | null>(null);
  const desktopDragRef = useRef<DesktopDragGesture | null>(null);
  const suppressClickRef = useRef(false);
  const fitModeRef = useRef(false);
  const [scale, setScale] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [controlsIdle, setControlsIdle] = useState(false);
  const [expandedRegionIds, setExpandedRegionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const semanticLevel = timelineViewerSemanticLevel(scale);
  const metrics = viewerAxisMetrics(viewportWidth);
  const rightGutter = timelineViewerRightGutter(viewportWidth);
  renderCountRef.current += 1;

  const writeScaleOutput = useCallback((nextScale: number) => {
    const label = `${Math.round(nextScale * 100)}%`;
    if (!scaleOutputRef.current) return;
    scaleOutputRef.current.value = label;
    scaleOutputRef.current.textContent = label;
  }, []);

  const wakeControls = useCallback(() => {
    setControlsIdle(false);
    if (controlsIdleTimerRef.current !== null) {
      window.clearTimeout(controlsIdleTimerRef.current);
    }
    controlsIdleTimerRef.current = window.setTimeout(() => {
      controlsIdleTimerRef.current = null;
      setControlsIdle(true);
    }, CONTROLS_IDLE_DELAY);
  }, []);

  const layout = useMemo(() => {
    const displayedLabel = (node: (typeof nodes)[number]) =>
      semanticLevel === 'overview' && node.shortLabel
        ? node.shortLabel
        : node.nameJa;
    const collisionItems = nodes.map((node) => ({
      key: node.key,
      regionId: node.regionId,
      x: snapTimelineViewerPixel(node.barStart * scale),
      width: estimateLabelWidth(displayedLabel(node)),
    }));
    const placements = regions.flatMap((region) =>
      assignTimelineViewerTracks(
        collisionItems.filter((item) => item.regionId === region.id),
        LABEL_GAP,
        expandedRegionIds.has(region.id)
          ? Number.MAX_SAFE_INTEGER
          : undefined,
      ),
    );
    const placementByKey = new Map(
      placements.map((placement) => [placement.key, placement]),
    );
    const trackCounts = new Map<string, number>();
    const overflowCounts = new Map<string, number>();
    const overflowLefts = new Map<string, number>();

    for (const placement of placements) {
      if (placement.track === null) {
        overflowCounts.set(
          placement.regionId,
          (overflowCounts.get(placement.regionId) ?? 0) + 1,
        );
        overflowLefts.set(
          placement.regionId,
          Math.max(
            overflowLefts.get(placement.regionId) ?? 0,
            placement.x + placement.width,
          ),
        );
        continue;
      }
      trackCounts.set(
        placement.regionId,
        Math.max(
          trackCounts.get(placement.regionId) ?? 1,
          placement.track + 1,
        ),
      );
    }

    let regionTop = 0;
    const regionLayouts: NativeRegionLayout[] = regions.map((region) => {
      const trackCount = Math.max(1, trackCounts.get(region.id) ?? 1);
      const height =
        region.id === 'origin' && trackCount === 1
          ? 56
          : timelineViewerRegionHeight(trackCount);
      const next = {
        id: region.id,
        top: regionTop,
        height,
        trackCount,
        overflowCount: overflowCounts.get(region.id) ?? 0,
        overflowLeft: overflowLefts.get(region.id) ?? 0,
      };
      regionTop += height;
      return next;
    });
    const regionById = new Map(
      regionLayouts.map((region) => [region.id, region]),
    );
    const nodeLayouts = new Map<string, NativeNodeLayout>();

    for (const node of nodes) {
      const placement = placementByKey.get(node.key);
      const region = regionById.get(node.regionId);
      if (!placement || !region || placement.track === null) {
        nodeLayouts.set(node.key, {
          key: node.key,
          left: 0,
          top: 0,
          periodLeft: 0,
          periodTop: 0,
          periodWidth: 0,
          periodOffsetY: 0,
          dateOffsetY: 0,
          track: null,
        });
        continue;
      }
      const center =
        region.top +
        timelineViewerTrackCenter(
          placement.track,
          region.trackCount,
          region.height,
        );
      const top = snapTimelineViewerPixel(center - NODE_HEIGHT / 2);
      nodeLayouts.set(node.key, {
        key: node.key,
        left: snapTimelineViewerPixel(node.barStart * scale),
        top,
        periodLeft: snapTimelineViewerPixel(node.barStart * scale),
        periodTop: snapTimelineViewerPixel(top + PERIOD_OFFSET),
        periodWidth: Math.max(
          1,
          snapTimelineViewerPixel((node.barEnd - node.barStart) * scale),
        ),
        periodOffsetY: 0,
        dateOffsetY: 0,
        track: placement.track,
      });
    }

    const separatedRails = layoutTimelineViewerPeriodRails(
      nodes.flatMap((node) => {
        const nodeLayout = nodeLayouts.get(node.key);
        if (!nodeLayout || nodeLayout.track === null) return [];
        return [
          {
            key: node.key,
            regionId: node.regionId,
            track: nodeLayout.track,
            start: node.barStart * scale,
            end: node.barEnd * scale,
          },
        ];
      }),
    );
    for (const rail of separatedRails) {
      const nodeLayout = nodeLayouts.get(rail.key);
      if (!nodeLayout) continue;
      nodeLayout.periodLeft = snapTimelineViewerPixel(rail.left);
      nodeLayout.periodTop = snapTimelineViewerPixel(
        nodeLayout.periodTop + rail.offsetY,
      );
      nodeLayout.periodWidth = Math.max(
        1,
        snapTimelineViewerPixel(rail.width),
      );
      nodeLayout.periodOffsetY = rail.offsetY;
    }

    const dateLayouts = layoutTimelineViewerDateCaptions(
      nodes.flatMap((node) => {
        const nodeLayout = nodeLayouts.get(node.key);
        const region = regionById.get(node.regionId);
        if (!nodeLayout || nodeLayout.track === null || !region) return [];
        return [
          {
            key: node.key,
            regionId: node.regionId,
            track: nodeLayout.track,
            left: nodeLayout.left + DATE_INLINE_INSET,
            top: nodeLayout.top + DATE_OFFSET,
            width: estimateDateWidth(node.dateLabel),
            height: DATE_HEIGHT,
            laneBottom: region.top + region.height,
          },
        ];
      }),
      nodes.flatMap((node) => {
        const nodeLayout = nodeLayouts.get(node.key);
        if (!nodeLayout || nodeLayout.track === null) return [];
        return [
          {
            key: node.key,
            regionId: node.regionId,
            track: nodeLayout.track,
            left: nodeLayout.periodLeft,
            top: nodeLayout.periodTop,
            width: nodeLayout.periodWidth,
            height: PERIOD_HEIGHT,
          },
        ];
      }),
    );
    for (const dateLayout of dateLayouts) {
      const nodeLayout = nodeLayouts.get(dateLayout.key);
      if (nodeLayout) nodeLayout.dateOffsetY = dateLayout.offsetY;
    }

    return {
      boardHeight: Math.max(1, regionTop),
      contentWidth: Math.max(
        1,
        snapTimelineViewerPixel(timelineWidth * scale + rightGutter),
      ),
      nodeLayouts,
      regionLayouts,
    };
  }, [
    expandedRegionIds,
    nodes,
    regions,
    rightGutter,
    scale,
    semanticLevel,
    timelineWidth,
  ]);

  const axisTicks = useMemo(() => {
    const ticks = semanticTimelineTicks(timelineMode, timelineWidth, scale);
    const compactEraBoundary = viewportWidth <= 639 || scale < 1;
    const candidates = ticks.map((year) => {
      const label = formatTimelineYearLabel(
        year,
        compactEraBoundary ? '0' : '紀元境界',
      );
      const width = Math.max(22, label.length * 8);
      const rawX = snapTimelineViewerPixel(
        yearToTimelineX(year, timelineMode, timelineWidth) * scale,
      );
      const renderedX =
        year === timelineMode.start
          ? rawX + 8
          : year === timelineMode.end
            ? rawX - width - 12
            : rawX;
      return {
        year,
        label,
        rawX,
        x: renderedX,
        width,
        priority: timelineViewerTickPriority(year, timelineMode),
      };
    });
    const selected = new Set(
      selectTimelineViewerTickLabels(
        candidates,
        viewportWidth <= 639 ? 72 : 64,
      ),
    );
    return candidates.map(({ year, label, rawX }) => ({
      year,
      label,
      left: rawX,
      visible: selected.has(year),
    }));
  }, [scale, timelineMode, timelineWidth, viewportWidth]);

  const captureViewportAnchor = useCallback(
    (
      kind: PendingZoom['kind'],
      requestedAnchor?: TimelineViewerPoint,
    ): PendingZoom | null => {
      const viewport = viewportRef.current;
      if (!viewport) return null;
      const viewportRect = viewport.getBoundingClientRect();
      const controlsRect = controlsRef.current?.getBoundingClientRect();
      const controlsTop = controlsRect
        ? controlsRect.top - viewportRect.top
        : viewport.clientHeight - metrics.controlBottom;
      const bottomInset = Math.max(
        0,
        viewport.clientHeight -
          Math.max(metrics.timeHeight, controlsTop - BOARD_EDGE_PADDING),
      );
      const contentCenter = timelineViewerContentViewportAnchor(
        { width: viewport.clientWidth, height: viewport.clientHeight },
        {
          top: metrics.timeHeight,
          right: 0,
          bottom: bottomInset,
          left: metrics.regionWidth,
        },
      );
      const resolvedAnchor = {
        x: Math.min(
          viewport.clientWidth,
          Math.max(metrics.regionWidth, requestedAnchor?.x ?? contentCenter.x),
        ),
        y: Math.min(
          viewport.clientHeight - bottomInset,
          Math.max(metrics.timeHeight, requestedAnchor?.y ?? contentCenter.y),
        ),
      };
      const renderedScale = Math.max(0.0001, renderedScaleRef.current);
      const worldX =
        (viewport.scrollLeft + resolvedAnchor.x - metrics.regionWidth) /
        renderedScale;
      const boardY =
        viewport.scrollTop + resolvedAnchor.y - metrics.timeHeight;
      const regionAnchor = timelineViewerRegionAnchorAt(
        layout.regionLayouts,
        boardY,
      ) ?? {
        regionId: layout.regionLayouts[0]?.id ?? regions[0]?.id ?? 'origin',
        ratio: 0.5,
      };
      return {
        kind,
        anchorX: resolvedAnchor.x,
        anchorY: resolvedAnchor.y,
        year: timelineXToYear(worldX, timelineMode, timelineWidth),
        regionAnchor,
        regionIndex: Math.max(
          0,
          layout.regionLayouts.findIndex(
            (region) => region.id === regionAnchor.regionId,
          ),
        ),
      };
    },
    [
      layout.regionLayouts,
      metrics.controlBottom,
      metrics.regionWidth,
      metrics.timeHeight,
      regions,
      timelineMode,
      timelineWidth,
    ],
  );

  const commitScale = useCallback(
    (
      requestedScale: number,
      requestedAnchor?: TimelineViewerPoint,
    ) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      wakeControls();
      fitModeRef.current = false;
      const currentScale = scaleRef.current;
      const maximumScale = timelineViewerMaxScale(viewport.clientWidth);
      const nextScale = clampTimelineViewerScale(
        requestedScale,
        maximumScale,
      );
      if (Math.abs(nextScale - currentScale) < 0.0001) return;

      const existingPending = pendingZoomRef.current;
      const captured = captureViewportAnchor('zoom', requestedAnchor);
      if (!captured) return;
      pendingZoomRef.current = existingPending ?? captured;
      scaleRef.current = nextScale;
      setScale(nextScale);
      writeScaleOutput(nextScale);
    },
    [
      captureViewportAnchor,
      wakeControls,
      writeScaleOutput,
    ],
  );

  const fitContent = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    wakeControls();
    const availableWidth = Math.max(
      1,
      viewport.clientWidth -
        metrics.regionWidth -
        rightGutter -
        BOARD_EDGE_PADDING * 2,
    );
    const nextScale = Math.min(
      1,
      Math.max(
        TIMELINE_VIEWER_FIT_MIN_SCALE,
        availableWidth / Math.max(1, timelineWidth),
      ),
    );
    pendingZoomRef.current = null;
    fitModeRef.current = true;
    scaleRef.current = nextScale;
    setScale(nextScale);
    writeScaleOutput(nextScale);
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
  }, [
    metrics.regionWidth,
    rightGutter,
    timelineWidth,
    wakeControls,
    writeScaleOutput,
  ]);

  const handleLodChange = useCallback(
    (nextLod: typeof lod) => {
      if (nextLod === lod) return;
      wakeControls();
      fitModeRef.current = false;
      pendingZoomRef.current = captureViewportAnchor('lod');
      onLodChange(nextLod);
    },
    [captureViewportAnchor, lod, onLodChange, wakeControls],
  );

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const pending = pendingZoomRef.current;
    renderedScaleRef.current = scale;
    if (!active || !viewport || !pending) return;
    pendingZoomRef.current = null;
    const chronologicalX =
      yearToTimelineX(pending.year, timelineMode, timelineWidth) * scale;
    viewport.scrollLeft = Math.min(
      Math.max(0, viewport.scrollWidth - viewport.clientWidth),
      Math.max(
        0,
        metrics.regionWidth + chronologicalX - pending.anchorX,
      ),
    );
    const restoredRegionAnchor = layout.regionLayouts.some(
      (region) => region.id === pending.regionAnchor.regionId,
    )
      ? pending.regionAnchor
      : {
          regionId:
            layout.regionLayouts[
              Math.min(
                pending.regionIndex,
                Math.max(0, layout.regionLayouts.length - 1),
              )
            ]?.id ?? layout.regionLayouts[0]?.id ?? 'origin',
          ratio: pending.regionAnchor.ratio,
        };
    viewport.scrollTop = timelineViewerScrollTopForRegionAnchor({
      anchor: restoredRegionAnchor,
      regions: layout.regionLayouts,
      anchorY: pending.anchorY,
      axisInset: metrics.timeHeight,
      maximumScrollTop: viewport.scrollHeight - viewport.clientHeight,
    });
    if (rootRef.current) {
      const prefix = pending.kind === 'lod' ? 'lastLodAnchor' : 'lastZoomAnchor';
      rootRef.current.dataset[`${prefix}Region`] = restoredRegionAnchor.regionId;
      rootRef.current.dataset[`${prefix}Year`] = String(Math.round(pending.year));
    }
  }, [
    active,
    layout.regionLayouts,
    metrics.regionWidth,
    metrics.timeHeight,
    scale,
    timelineMode,
    timelineWidth,
  ]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    if (!active) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => {
      setViewportWidth(viewport.clientWidth);
      if (fitModeRef.current) fitContent();
    });
    observer.observe(viewport);
    setViewportWidth(viewport.clientWidth);
    return () => observer.disconnect();
  }, [active, fitContent]);

  useEffect(() => {
    if (!active) return;
    const body = document.body;
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
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollLeft = Math.max(0, initialScrollLeft);
      viewport.scrollTop = 0;
      viewport.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      body.style.overflow = previousOverflow;
      body.classList.remove('timeline-viewer-open');
      for (const element of [header, footer]) {
        if (!element) continue;
        element.inert = false;
        element.removeAttribute('aria-hidden');
      }
      if (controlsIdleTimerRef.current !== null) {
        window.clearTimeout(controlsIdleTimerRef.current);
        controlsIdleTimerRef.current = null;
      }
      pinchRef.current = null;
      desktopDragRef.current = null;
      suppressClickRef.current = false;
      setControlsIdle(false);
    };
  }, [active, initialScrollLeft]);

  useEffect(() => {
    if (!active) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    let pinchMoveAttached = false;
    const detachPinchMove = () => {
      if (!pinchMoveAttached) return;
      viewport.removeEventListener('touchmove', onTouchMove);
      pinchMoveAttached = false;
    };
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;
      const rect = viewport.getBoundingClientRect();
      pinchRef.current = {
        initialDistance: Math.max(1, touchDistance(event.touches)),
        initialScale: scaleRef.current,
        anchorX: touchCenterX(event.touches) - rect.left,
        anchorY: touchCenterY(event.touches) - rect.top,
        previewScale: scaleRef.current,
      };
      if (!pinchMoveAttached) {
        viewport.addEventListener('touchmove', onTouchMove, {
          passive: false,
        });
        pinchMoveAttached = true;
      }
      wakeControls();
    };
    function onTouchMove(event: TouchEvent) {
      const pinch = pinchRef.current;
      if (!pinch || event.touches.length !== 2) return;
      event.preventDefault();
      const nextScale = clampTimelineViewerScale(
        pinch.initialScale *
          (touchDistance(event.touches) / pinch.initialDistance),
        timelineViewerMaxScale(
          viewportRef.current?.clientWidth ?? window.innerWidth,
        ),
      );
      pinch.previewScale = nextScale;
      writeScaleOutput(nextScale);
      rootRef.current?.setAttribute(
        'data-viewer-pinch-preview',
        String(nextScale),
      );
    }
    const onTouchEnd = (event: TouchEvent) => {
      const pinch = pinchRef.current;
      if (!pinch || event.touches.length >= 2) return;
      pinchRef.current = null;
      detachPinchMove();
      rootRef.current?.removeAttribute('data-viewer-pinch-preview');
      commitScale(pinch.previewScale, {
        x: pinch.anchorX,
        y: pinch.anchorY,
      });
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    viewport.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      detachPinchMove();
      viewport.removeEventListener('touchend', onTouchEnd);
      viewport.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [active, commitScale, wakeControls, writeScaleOutput]);

  const setMovementPeersHighlighted = useCallback(
    (movementId: string, highlighted: boolean) => {
      const selector = `[data-movement-id="${CSS.escape(movementId)}"]`;
      for (const element of rootRef.current?.querySelectorAll<HTMLElement>(
        selector,
      ) ?? []) {
        if (highlighted) element.dataset.peerHighlighted = 'true';
        else delete element.dataset.peerHighlighted;
      }
    },
    [],
  );

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a,button')) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    commitScale(
      scaleRef.current > 1.05 ? 1 : TIMELINE_VIEWER_DOUBLE_TAP_SCALE,
      {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    );
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      (event.pointerType !== 'mouse' && event.pointerType !== 'pen') ||
      event.button !== 0
    ) {
      return;
    }
    suppressClickRef.current = false;
    desktopDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
      active: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = desktopDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (
      !drag.active &&
      Math.hypot(deltaX, deltaY) < DESKTOP_DRAG_THRESHOLD
    ) {
      return;
    }
    if (!drag.active) {
      drag.active = true;
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.dataset.desktopDragging = 'true';
      wakeControls();
    }
    event.preventDefault();
    event.currentTarget.scrollLeft = drag.scrollLeft - deltaX;
    event.currentTarget.scrollTop = drag.scrollTop - deltaY;
  };

  const endDesktopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = desktopDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    desktopDragRef.current = null;
    delete event.currentTarget.dataset.desktopDragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!drag.active || event.type === 'pointercancel') {
      suppressClickRef.current = false;
    } else {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleNativeDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      commitScale(
        scaleRef.current * Math.exp(-event.deltaY * 0.002),
        {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      );
      return;
    }
    if (event.shiftKey && Math.abs(event.deltaX) < Math.abs(event.deltaY)) {
      event.preventDefault();
      event.currentTarget.scrollLeft += event.deltaY;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      commitScale(scaleRef.current * 1.25);
      return;
    }
    if (event.key === '-') {
      event.preventDefault();
      commitScale(scaleRef.current * 0.8);
      return;
    }
    if (event.key === '0') {
      event.preventDefault();
      fitContent();
      return;
    }
    if (
      event.target === viewportRef.current &&
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
    ) {
      event.preventDefault();
      event.currentTarget.scrollBy({
        left:
          event.key === 'ArrowLeft'
            ? -56
            : event.key === 'ArrowRight'
              ? 56
              : 0,
        top:
          event.key === 'ArrowUp'
            ? -56
            : event.key === 'ArrowDown'
              ? 56
              : 0,
        behavior: 'auto',
      });
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

  if (!active) {
    return <div className="timeline-viewer-frame">{children}</div>;
  }

  const style = {
    '--timeline-viewer-region-axis-width': `${metrics.regionWidth}px`,
    '--timeline-viewer-time-axis-height': `${metrics.timeHeight}px`,
    '--timeline-viewer-native-content-width': `${layout.contentWidth}px`,
    '--timeline-viewer-native-board-height': `${layout.boardHeight}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className="timeline-viewer-frame timeline-viewer-frame--active timeline-viewer-frame--native"
      role="dialog"
      aria-modal="true"
      aria-label="横型タイムライン閲覧モード"
      data-timeline-viewer="active"
      data-viewer-engine="native-scroll"
      data-native-one-finger-pan="browser"
      data-semantic-level={semanticLevel}
      data-viewer-lod={lod}
      data-viewer-scale={scale}
      data-viewer-dom-node-count={nodes.length}
      data-viewer-render-count={renderCountRef.current}
      data-controls-idle={controlsIdle || undefined}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <div className="timeline-viewer-ui-layer" data-viewer-ui-layer>
        <div
          ref={controlsRef}
          className="timeline-viewer-controls"
          aria-label="閲覧モード操作"
          data-viewer-controls
          data-idle={controlsIdle || undefined}
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
            onClick={() => commitScale(scaleRef.current * 0.8)}
            aria-label="縮小"
          >
            <span aria-hidden="true">−</span>
          </button>
          <output
            ref={scaleOutputRef}
            aria-live="polite"
            aria-label="現在倍率"
          >
            {Math.round(scale * 100)}%
          </output>
          <button
            type="button"
            onClick={() => commitScale(scaleRef.current * 1.25)}
            aria-label="拡大"
          >
            <span aria-hidden="true">＋</span>
          </button>
        </div>
        <SemanticLodFab
          value={lod}
          counts={lodCounts}
          onChange={handleLodChange}
          placement="viewer"
        />
      </div>

      <div
        ref={viewportRef}
        className="timeline-viewer-stage timeline-viewer-native-viewport"
        tabIndex={0}
        role="application"
        aria-label="マウスドラッグまたは1本指で縦横にスクロールできます。2本指またはコントロールキーとホイールで拡大縮小できます。上部に年代軸、左側に地域軸を固定表示します"
        data-timeline-viewer-stage
        data-native-scroll-viewport
        data-desktop-drag-pan="enabled"
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDesktopDrag}
        onPointerCancel={endDesktopDrag}
        onLostPointerCapture={endDesktopDrag}
        onClickCapture={handleClickCapture}
        onDragStart={handleNativeDragStart}
      >
        <div className="timeline-viewer-native-world">
          <div
            className="timeline-viewer-time-axis timeline-viewer-native-time-axis"
            aria-hidden="true"
          >
            <div className="timeline-viewer-native-time-track">
              {axisTicks.map((tick) => (
                <span
                  key={tick.year}
                  className="timeline-viewer-time-tick"
                  data-viewer-tick={tick.year}
                  data-axis-label-visible={tick.visible || undefined}
                  data-tick-strength={viewerTickStrength(tick.year)}
                  data-era-boundary={
                    tick.year === 0 ||
                    tick.year === timelineMode.start ||
                    tick.year === timelineMode.end ||
                    undefined
                  }
                  data-axis-edge={
                    tick.year === timelineMode.start
                      ? 'start'
                      : tick.year === timelineMode.end
                        ? 'end'
                        : undefined
                  }
                  style={{
                    left: tick.left,
                    visibility: tick.visible ? 'visible' : 'hidden',
                  }}
                >
                  {tick.label}
                </span>
              ))}
            </div>
          </div>

          <div
            className="timeline-viewer-region-axis timeline-viewer-native-region-axis"
            aria-hidden="true"
          >
            {regions.map((region) => {
              const regionLayout = layout.regionLayouts.find(
                (candidate) => candidate.id === region.id,
              );
              if (!regionLayout) return null;
              return (
                <span
                  key={region.id}
                  className={`timeline-viewer-region-label ${
                    region.id === 'origin'
                      ? 'timeline-viewer-region-label--origin'
                      : ''
                  }`}
                  data-viewer-region-id={region.id}
                  data-origin-band={region.id === 'origin' || undefined}
                  data-viewer-region-height={regionLayout.height}
                  data-viewer-track-count={regionLayout.trackCount}
                  style={
                    {
                      top: regionLayout.top,
                      height: regionLayout.height,
                      '--timeline-region-rgb': region.regionColor,
                    } as CSSProperties
                  }
                >
                  {region.id !== 'origin' && (
                    <span
                      className="timeline-viewer-region-dot"
                      aria-hidden="true"
                    />
                  )}
                  <span>{region.label}</span>
                </span>
              );
            })}
          </div>

          <div
            className="timeline-viewer-axis-origin timeline-viewer-native-origin"
            aria-hidden="true"
          >
            <strong>地域</strong>
            <span>年代 →</span>
          </div>

          <div
            className="timeline-viewer-native-board"
            data-viewer-board
            data-viewer-rail-layer
            data-viewer-node-layer
          >
            {axisTicks.map((tick) => (
              <span
                key={tick.year}
                className="timeline-viewer-gridline"
                data-viewer-gridline={tick.year}
                data-tick-strength={viewerTickStrength(tick.year)}
                style={{ left: tick.left, height: layout.boardHeight }}
                aria-hidden="true"
              />
            ))}
            {layout.regionLayouts.map((region) => (
              <span
                key={region.id}
                className={`timeline-viewer-region-guide ${
                  region.id === 'origin'
                    ? 'timeline-viewer-region-guide--origin'
                    : ''
                }`}
                data-viewer-region-guide={region.id}
                data-origin-band={region.id === 'origin' || undefined}
                style={{ top: region.top, height: region.height }}
                aria-hidden="true"
              />
            ))}
            {nodes.map((node) => {
              const nodeLayout = layout.nodeLayouts.get(node.key);
              if (!nodeLayout || nodeLayout.track === null) return null;
              return (
                <span
                  key={`period-${node.key}`}
                  className="timeline-viewer-period"
                  data-viewer-period={node.key}
                  data-movement-id={node.movementId}
                  data-secondary-occurrence={
                    node.secondaryOccurrence || undefined
                  }
                  data-priority={node.priority || undefined}
                  data-region-id={node.regionId}
                  data-period-offset-y={nodeLayout.periodOffsetY}
                  data-viewer-track={nodeLayout.track}
                  style={
                    {
                      left: nodeLayout.periodLeft,
                      top: nodeLayout.periodTop,
                      width: nodeLayout.periodWidth,
                      '--timeline-region-rgb': node.regionColor,
                    } as CSSProperties
                  }
                  aria-hidden="true"
                />
              );
            })}
            {layout.regionLayouts.map((regionLayout) =>
              regionLayout.overflowCount > 0 ? (
                <button
                  key={`overflow-${regionLayout.id}`}
                  type="button"
                  className="timeline-viewer-overflow"
                  data-viewer-overflow={regionLayout.id}
                  aria-label={`${
                    regions.find((region) => region.id === regionLayout.id)
                      ?.label ?? regionLayout.id
                  }の省略項目を展開`}
                  style={{
                    left: Math.min(
                      Math.max(0, layout.contentWidth - 56),
                      regionLayout.overflowLeft,
                    ),
                    top:
                      regionLayout.top + regionLayout.height - SURFACE_HEIGHT,
                  }}
                  onClick={() =>
                    setExpandedRegionIds((current) => {
                      const next = new Set(current);
                      next.add(regionLayout.id);
                      return next;
                    })
                  }
                >
                  他{regionLayout.overflowCount}件
                </button>
              ) : null,
            )}
            {nodes.map((node) => {
              const nodeLayout = layout.nodeLayouts.get(node.key);
              if (!nodeLayout || nodeLayout.track === null) return null;
              return (
                <Link
                  key={node.key}
                  href={node.href}
                  prefetch={false}
                  className="timeline-viewer-node"
                  data-viewer-node
                  data-viewer-key={node.key}
                  data-movement-id={node.movementId}
                  data-region-id={node.regionId}
                  data-period-offset-y={nodeLayout.periodOffsetY}
                  data-bar-start={node.barStart}
                  data-bar-end={node.barEnd}
                  data-viewer-start-x={nodeLayout.left}
                  data-viewer-visible="true"
                  data-viewer-track={nodeLayout.track}
                  data-date-offset-y={nodeLayout.dateOffsetY}
                  data-secondary-occurrence={
                    node.secondaryOccurrence || undefined
                  }
                  data-priority={node.priority || undefined}
                  style={
                    {
                      left: nodeLayout.left,
                      top: nodeLayout.top,
                      '--timeline-region-rgb': node.regionColor,
                    } as CSSProperties
                  }
                  onPointerEnter={() =>
                    setMovementPeersHighlighted(node.movementId, true)
                  }
                  onPointerLeave={() =>
                    setMovementPeersHighlighted(node.movementId, false)
                  }
                  onFocus={() =>
                    setMovementPeersHighlighted(node.movementId, true)
                  }
                  onBlur={() =>
                    setMovementPeersHighlighted(node.movementId, false)
                  }
                  aria-label={`${node.nameJa}。${node.dateLabel}。${node.regionLabel}。${node.classificationLabel}。${node.priority ? '基本項目' : '充実・詳細項目'}`}
                  title={`${node.nameJa} ${node.dateLabel}`}
                >
                  <span className="timeline-viewer-node__surface">
                    <span className="timeline-viewer-node__short">
                      {node.shortLabel ?? node.nameJa}
                    </span>
                    <span className="timeline-viewer-node__name">
                      {node.nameJa}
                    </span>
                    <span className="timeline-viewer-node__formal">
                      {node.nameJa}
                    </span>
                  </span>
                  <span
                    className="timeline-viewer-node__date"
                    data-viewer-date={node.key}
                    style={{
                      '--timeline-viewer-date-offset-y': `${nodeLayout.dateOffsetY}px`,
                    } as CSSProperties}
                  >
                    {node.dateLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
