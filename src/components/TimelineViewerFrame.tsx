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
  type CSSProperties,
  type WheelEvent,
} from 'react';
import {
  yearToTimelineX,
  type TimelineMode,
} from '@/lib/timeline-presentation';
import {
  assignTimelineViewerTracks,
  constrainTimelineViewerVerticalPan,
  fitTimelineViewerRect,
  panTimelineViewer,
  relativeTimelineViewerCompositeTransform,
  semanticTimelineTicks,
  timelineViewerVirtualNodeKeys,
  timelineViewerRegionHeight,
  timelineViewerMaxScale,
  timelineViewerSemanticLevel,
  timelineViewerTrackCenter,
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
  shortLabel?: string;
  dateLabel: string;
  regionLabel: string;
  classificationLabel: string;
  barStart: number;
  barEnd: number;
  regionId: string;
  regionColor?: string;
  secondaryOccurrence: boolean;
  priority: boolean;
};

export type TimelineViewerRegion = {
  id: string;
  label: string;
  regionColor?: string;
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
const CONTROLS_IDLE_DELAY = 2500;
const BOARD_EDGE_PADDING = 12;

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
    return { regionWidth: 102, timeHeight: 50, controlBottom: 62 };
  }
  if (viewportWidth <= 1023) {
    return { regionWidth: 120, timeHeight: 50, controlBottom: 62 };
  }
  return { regionWidth: 144, timeHeight: 52, controlBottom: 62 };
};

const formatViewerYear = (year: number) => {
  if (year === 0) return '紀元境界';
  return year < 0 ? `前${Math.abs(year).toLocaleString('ja-JP')}` : `${year}`;
};

const viewerTickStrength = (year: number) => {
  if (year % 100 === 0) return 'century';
  if (year % 50 === 0) return 'half-century';
  return 'minor';
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
  const railLayerRef = useRef<HTMLDivElement>(null);
  const boardContentRef = useRef<HTMLDivElement>(null);
  const railContentRef = useRef<HTMLDivElement>(null);
  const nodeLayerRef = useRef<HTMLDivElement>(null);
  const nodeContentRef = useRef<HTMLDivElement>(null);
  const timeAxisRef = useRef<HTMLDivElement>(null);
  const timeTrackRef = useRef<HTMLDivElement>(null);
  const regionAxisRef = useRef<HTMLDivElement>(null);
  const regionTrackRef = useRef<HTMLDivElement>(null);
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
  const fixedLayerFrameRef = useRef<number | null>(null);
  const interactionFrameRef = useRef<number | null>(null);
  const controlsIdleTimerRef = useRef<number | null>(null);
  const wheelSettleTimerRef = useRef<number | null>(null);
  const pendingFixedTransformRef =
    useRef<TimelineViewerTransform>(IDENTITY_TRANSFORM);
  const pendingInteractionTransformRef =
    useRef<TimelineViewerTransform>(IDENTITY_TRANSFORM);
  const settledTransformRef =
    useRef<TimelineViewerTransform>(IDENTITY_TRANSFORM);
  const semanticLevelRef = useRef<TimelineViewerSemanticLevel>('standard');
  const tickSignatureRef = useRef('');
  const virtualSignatureRef = useRef('');
  const viewportRef = useRef({
    width: 1024,
    height: 768,
    metrics: viewerAxisMetrics(1024),
  });
  const verticalBoundsRef = useRef({
    offsetY: regions[0]?.top ?? contentOriginY,
    height: regions.reduce(
      (sum, region) =>
        sum +
        (region.id === 'origin' ? 56 : timelineViewerRegionHeight(1)),
      0,
    ),
  });
  const [semanticLevel, setSemanticLevel] =
    useState<TimelineViewerSemanticLevel>('standard');
  const [controlsIdle, setControlsIdle] = useState(false);
  const [expandedRegionIds, setExpandedRegionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [virtualNodeKeys, setVirtualNodeKeys] = useState<Set<string>>(
    () => new Set(nodes.map((node) => node.key)),
  );
  const [axisTicks, setAxisTicks] = useState(() =>
    semanticTimelineTicks(timelineMode, timelineWidth, 1),
  );
  const renderedNodes = active
    ? nodes.filter((node) => virtualNodeKeys.has(node.key))
    : nodes;

  const updateFixedLayers = useCallback(
    (transform: TimelineViewerTransform) => {
      const stage = stageRef.current;
      const root = rootRef.current;
      const railLayer = railLayerRef.current;
      const nodeLayer = nodeLayerRef.current;
      if (!stage || !root || !railLayer || !nodeLayer) return;

      const metrics = viewerAxisMetrics(stage.clientWidth);
      viewportRef.current = {
        width: stage.clientWidth,
        height: stage.clientHeight,
        metrics,
      };
      for (const layer of [
        boardContentRef.current,
        railContentRef.current,
        nodeContentRef.current,
        timeTrackRef.current,
        regionTrackRef.current,
      ]) {
        layer?.style.removeProperty('transform');
      }
      delete root.dataset.viewerInteracting;
      root.dataset.viewerLayoutPasses = String(
        Number(root.dataset.viewerLayoutPasses ?? 0) + 1,
      );
      root.style.setProperty(
        '--timeline-viewer-region-axis-width',
        `${metrics.regionWidth}px`,
      );
      root.style.setProperty(
        '--timeline-viewer-time-axis-height',
        `${metrics.timeHeight}px`,
      );
      const horizontalBuffer = stage.clientWidth;

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
          screen.x >=
            metrics.regionWidth + AXIS_EDGE_PADDING - horizontalBuffer &&
          screen.x <=
            stage.clientWidth - AXIS_EDGE_PADDING + horizontalBuffer;
        tick.style.transform = `translate3d(${screen.x}px, 0, 0)`;
        tick.style.visibility = visible ? 'visible' : 'hidden';
      }

      const periodElements = new Map(
        Array.from(
          railLayer.querySelectorAll<HTMLElement>('[data-viewer-period]'),
        ).map((element) => [element.dataset.viewerPeriod, element]),
      );
      const guideElements = new Map(
        Array.from(
          railLayer.querySelectorAll<HTMLElement>('[data-viewer-region-guide]'),
        ).map((element) => [element.dataset.viewerRegionGuide, element]),
      );
      const gridElements = new Map(
        Array.from(
          railLayer.querySelectorAll<HTMLElement>('[data-viewer-gridline]'),
        ).map((element) => [element.dataset.viewerGridline, element]),
      );
      const board = railLayer.querySelector<HTMLElement>('[data-viewer-board]');
      const positionThumb = root.querySelector<HTMLElement>(
        '[data-viewer-position-thumb]',
      );
      const overflowElements = new Map(
        Array.from(
          nodeLayer.querySelectorAll<HTMLElement>('[data-viewer-overflow]'),
        ).map((element) => [element.dataset.viewerOverflow, element]),
      );
      const nodeElements = Array.from(
        nodeLayer.querySelectorAll<HTMLElement>('[data-viewer-node]'),
      );
      const contentLeft = metrics.regionWidth + AXIS_EDGE_PADDING;
      const contentRight = stage.clientWidth - AXIS_EDGE_PADDING;
      const nextVirtualKeys = timelineViewerVirtualNodeKeys(
        nodes,
        transform,
        contentOriginX,
        contentLeft,
        contentRight,
        Math.max(1, contentRight - contentLeft),
      );
      const virtualSignature = nextVirtualKeys.join(',');
      if (virtualSignature !== virtualSignatureRef.current) {
        virtualSignatureRef.current = virtualSignature;
        setVirtualNodeKeys(new Set(nextVirtualKeys));
      }
      root.dataset.viewerDomNodeCount = String(nodeElements.length);
      const collisionItems = nodeElements.flatMap((node) => {
        const barStart = Number(node.dataset.barStart) + contentOriginX;
        const barEnd = Number(node.dataset.barEnd) + contentOriginX;
        const startScreen = worldToTimelineViewerScreen(
          { x: barStart, y: 0 },
          transform,
        );
        const endScreen = worldToTimelineViewerScreen(
          { x: barEnd, y: 0 },
          transform,
        );
        const visible =
          endScreen.x >= contentLeft - horizontalBuffer &&
          startScreen.x <= contentRight + horizontalBuffer;
        node.dataset.viewerVisible = visible ? 'true' : 'false';
        node.dataset.viewerStartX = String(startScreen.x);
        node.dataset.viewerEndX = String(endScreen.x);
        if (!visible) {
          node.style.visibility = 'hidden';
          periodElements.get(node.dataset.viewerKey)?.style.setProperty(
            'visibility',
            'hidden',
          );
          return [];
        }

        const nodeWidth = node.offsetWidth;
        // Keep the caption and duration rail on the same chronological start.
        // A label near the right edge may be partially clipped until the user
        // pans, but it must not detach from the movement's actual start year.
        const x = startScreen.x;
        return [
          {
            key: node.dataset.viewerKey ?? '',
            regionId: node.dataset.regionId ?? '',
            x,
            width: nodeWidth,
          },
        ];
      });
      const placements = regions.flatMap((region) =>
        assignTimelineViewerTracks(
          collisionItems.filter((item) => item.regionId === region.id),
          undefined,
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
      const overflowPositions = new Map<string, number>();

      for (const placement of placements) {
        if (placement.track === null) {
          overflowCounts.set(
            placement.regionId,
            (overflowCounts.get(placement.regionId) ?? 0) + 1,
          );
          overflowPositions.set(
            placement.regionId,
            Math.max(
              overflowPositions.get(placement.regionId) ??
                Number.NEGATIVE_INFINITY,
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

      const firstRegionTop = regions[0]?.top ?? contentOriginY;
      // The fullscreen viewer zooms the chronological X axis semantically.
      // Region rows keep their screen-space height, so Y must not inherit the
      // horizontal scale or the lanes disappear above/below the viewport.
      let nextRegionTop = transform.y + firstRegionTop;
      const boardTop = nextRegionTop;
      const regionLayouts = new Map<
        string,
        { top: number; height: number; trackCount: number }
      >();

      for (const region of regions) {
        const trackCount = Math.max(1, trackCounts.get(region.id) ?? 1);
        const height =
          region.id === 'origin' && trackCount === 1
            ? 56
            : timelineViewerRegionHeight(trackCount);
        regionLayouts.set(region.id, {
          top: nextRegionTop,
          height,
          trackCount,
        });
        nextRegionTop += height;
      }
      const boardHeight = Math.max(1, nextRegionTop - boardTop);
      verticalBoundsRef.current = {
        offsetY: firstRegionTop,
        height: boardHeight,
      };
      const boardVisible =
        boardTop + boardHeight >= metrics.timeHeight &&
        boardTop <= stage.clientHeight - metrics.controlBottom;

      if (board) {
        board.style.width = `${Math.max(
          1,
          stage.clientWidth - metrics.regionWidth,
        )}px`;
        board.style.height = `${boardHeight}px`;
        board.style.transform = `translate3d(${metrics.regionWidth}px, ${boardTop}px, 0)`;
        board.style.visibility = boardVisible ? 'visible' : 'hidden';
      }

      for (const [year, grid] of gridElements) {
        const worldX =
          contentOriginX +
          yearToTimelineX(Number(year), timelineMode, timelineWidth);
        const screen = worldToTimelineViewerScreen(
          { x: worldX, y: 0 },
          transform,
        );
        const visible =
          screen.x >=
            metrics.regionWidth + AXIS_EDGE_PADDING - horizontalBuffer &&
          screen.x <=
            stage.clientWidth - AXIS_EDGE_PADDING + horizontalBuffer;
        grid.style.height = `${boardHeight}px`;
        grid.style.transform = `translate3d(${screen.x}px, ${boardTop}px, 0)`;
        grid.style.visibility =
          visible && boardVisible ? 'visible' : 'hidden';
      }

      if (positionThumb) {
        const viewportHeight = Math.max(
          1,
          stage.clientHeight -
            metrics.timeHeight -
            metrics.controlBottom -
            BOARD_EDGE_PADDING * 2,
        );
        if (boardHeight <= viewportHeight) {
          positionThumb.style.visibility = 'hidden';
        } else {
          const progress = Math.min(
            1,
            Math.max(
              0,
              (metrics.timeHeight + BOARD_EDGE_PADDING - boardTop) /
                Math.max(1, boardHeight - viewportHeight),
            ),
          );
          const thumbHeight = Math.max(
            32,
            (viewportHeight * viewportHeight) / boardHeight,
          );
          positionThumb.style.height = `${Math.min(
            viewportHeight,
            thumbHeight,
          )}px`;
          positionThumb.style.transform = `translate3d(0, ${
            progress * Math.max(0, viewportHeight - thumbHeight)
          }px, 0)`;
          positionThumb.style.visibility = 'visible';
        }
      }

      for (const region of regions) {
        const layout = regionLayouts.get(region.id);
        if (!layout) continue;
        const visible =
          layout.top + layout.height >= metrics.timeHeight &&
          layout.top <= stage.clientHeight - metrics.controlBottom;
        const label = regionAxisRef.current?.querySelector<HTMLElement>(
          `[data-viewer-region-id="${region.id}"]`,
        );
        if (label) {
          label.style.height = `${layout.height}px`;
          label.style.transform = `translate3d(0, ${layout.top}px, 0)`;
          label.style.visibility = visible ? 'visible' : 'hidden';
          label.dataset.viewerRegionHeight = String(layout.height);
          label.dataset.viewerTrackCount = String(layout.trackCount);
        }
        const guide = guideElements.get(region.id);
        if (guide) {
          guide.style.height = `${layout.height}px`;
          guide.style.transform = `translate3d(${metrics.regionWidth}px, ${layout.top}px, 0)`;
          guide.style.visibility = visible ? 'visible' : 'hidden';
        }
        const overflow = overflowElements.get(region.id);
        const overflowCount = overflowCounts.get(region.id) ?? 0;
        if (overflow) {
          overflow.textContent =
            overflowCount > 0 ? `他${overflowCount}件` : '';
          const overflowX = Math.min(
            contentRight - 42,
            Math.max(
              contentLeft,
              overflowPositions.get(region.id) ?? contentRight - 42,
            ),
          );
          overflow.style.transform = `translate3d(${overflowX}px, ${
            layout.top + layout.height - 28
          }px, 0)`;
          overflow.style.visibility =
            overflowCount > 0 && visible ? 'visible' : 'hidden';
        }
      }

      for (const node of nodeElements) {
        const key = node.dataset.viewerKey ?? '';
        const placement = placementByKey.get(key);
        const regionLayout = regionLayouts.get(node.dataset.regionId ?? '');
        const period = periodElements.get(key);
        if (
          !placement ||
          placement.track === null ||
          !regionLayout ||
          node.dataset.viewerVisible !== 'true'
        ) {
          node.style.visibility = 'hidden';
          if (period) period.style.visibility = 'hidden';
          continue;
        }

        const trackCenterY =
          regionLayout.top +
          timelineViewerTrackCenter(
            placement.track,
            regionLayout.trackCount,
            regionLayout.height,
          );
        const startX = Number(node.dataset.viewerStartX);
        const endX = Number(node.dataset.viewerEndX);
        const periodLeft = startX;
        const periodRight = endX;
        const visible =
          trackCenterY >= metrics.timeHeight &&
          trackCenterY <= stage.clientHeight - metrics.controlBottom;
        node.style.transform = `translate3d(${placement.x}px, ${
          trackCenterY - node.offsetHeight / 2
        }px, 0)`;
        node.style.visibility = visible ? 'visible' : 'hidden';
        node.dataset.viewerTrack = String(placement.track);
        if (period) {
          const surfaceHeight =
            node.querySelector<HTMLElement>('.timeline-viewer-node__surface')
              ?.offsetHeight ?? 32;
          const surfaceBottom =
            trackCenterY - surfaceHeight / 2 + surfaceHeight;
          const periodY = surfaceBottom + 6;
          period.style.width = `${Math.max(1, periodRight - periodLeft)}px`;
          period.style.transform = `translate3d(${periodLeft}px, ${periodY}px, 0)`;
          period.style.visibility =
            visible && periodRight >= periodLeft ? 'visible' : 'hidden';
        }
      }
      settledTransformRef.current = transform;
    },
    [
      contentOriginX,
      contentOriginY,
      expandedRegionIds,
      nodes,
      regions,
      timelineMode,
      timelineWidth,
    ],
  );

  const setMovementPeersHighlighted = useCallback(
    (movementId: string, highlighted: boolean) => {
      const selector = `[data-movement-id="${CSS.escape(movementId)}"]`;
      for (const element of [
        ...(nodeLayerRef.current?.querySelectorAll<HTMLElement>(selector) ?? []),
        ...(railLayerRef.current?.querySelectorAll<HTMLElement>(selector) ?? []),
      ]) {
        if (highlighted) element.dataset.peerHighlighted = 'true';
        else delete element.dataset.peerHighlighted;
      }
    },
    [],
  );

  const scheduleFixedLayers = useCallback(
    (transform: TimelineViewerTransform) => {
      pendingFixedTransformRef.current = transform;
      if (fixedLayerFrameRef.current !== null) return;
      fixedLayerFrameRef.current = window.requestAnimationFrame(() => {
        fixedLayerFrameRef.current = null;
        updateFixedLayers(pendingFixedTransformRef.current);
      });
    },
    [updateFixedLayers],
  );

  const wakeControls = useCallback(() => {
    setControlsIdle(false);
    if (controlsIdleTimerRef.current !== null) {
      window.clearTimeout(controlsIdleTimerRef.current);
    }
    controlsIdleTimerRef.current = window.setTimeout(() => {
      setControlsIdle(true);
      controlsIdleTimerRef.current = null;
    }, CONTROLS_IDLE_DELAY);
  }, []);

  const constrainTransform = useCallback(
    (next: TimelineViewerTransform) => {
      const viewport = viewportRef.current;
      return constrainTimelineViewerVerticalPan(
        next,
        verticalBoundsRef.current.offsetY,
        verticalBoundsRef.current.height,
        viewport.height,
        viewport.metrics.timeHeight,
        viewport.metrics.controlBottom,
        BOARD_EDGE_PADDING,
      );
    },
    [],
  );

  const writeScaleOutput = useCallback(
    (transform: TimelineViewerTransform) => {
      if (!scaleOutputRef.current) return;
      const label = `${Math.round(transform.scale * 100)}%`;
      scaleOutputRef.current.value = label;
      scaleOutputRef.current.textContent = label;
    },
    [],
  );

  const applyInteractiveFrame = useCallback(
    (next: TimelineViewerTransform) => {
      const constrained = constrainTransform(next);
      transformRef.current = constrained;
      pendingInteractionTransformRef.current = constrained;
      const root = rootRef.current;
      if (root) root.dataset.viewerInteracting = 'true';

      if (interactionFrameRef.current !== null) return;
      interactionFrameRef.current = window.requestAnimationFrame(() => {
        interactionFrameRef.current = null;
        const current = pendingInteractionTransformRef.current;
        const composite = relativeTimelineViewerCompositeTransform(
          settledTransformRef.current,
          current,
        );
        const movingTransform = `translate3d(${composite.x}px, ${composite.y}px, 0) scaleX(${composite.scaleX})`;
        const timeTransform = `translate3d(${composite.x}px, 0, 0) scaleX(${composite.scaleX})`;
        const regionTransform = `translate3d(0, ${composite.y}px, 0)`;

        if (railContentRef.current) {
          railContentRef.current.style.transform = movingTransform;
        }
        if (boardContentRef.current) {
          boardContentRef.current.style.transform =
            `translate3d(0, ${composite.y}px, 0)`;
        }
        if (nodeContentRef.current) {
          nodeContentRef.current.style.transform = movingTransform;
        }
        if (timeTrackRef.current) {
          timeTrackRef.current.style.transform = timeTransform;
        }
        if (regionTrackRef.current) {
          regionTrackRef.current.style.transform = regionTransform;
        }
        writeScaleOutput(current);
        if (rootRef.current) {
          rootRef.current.dataset.viewerScale = String(current.scale);
          rootRef.current.dataset.viewerX = String(current.x);
          rootRef.current.dataset.viewerY = String(current.y);
          rootRef.current.dataset.viewerCompositorFrames = String(
            Number(rootRef.current.dataset.viewerCompositorFrames ?? 0) + 1,
          );
        }
      });
    },
    [constrainTransform, writeScaleOutput],
  );

  const applyTransform = useCallback(
    (next: TimelineViewerTransform) => {
      wakeControls();
      const constrained = constrainTransform(next);
      transformRef.current = constrained;
      pendingInteractionTransformRef.current = constrained;
      if (interactionFrameRef.current !== null) {
        window.cancelAnimationFrame(interactionFrameRef.current);
        interactionFrameRef.current = null;
      }
      const canvas = canvasRef.current;
      const root = rootRef.current;
      if (canvas) {
        canvas.style.transform = `translate3d(${constrained.x}px, ${constrained.y}px, 0) scale(${constrained.scale})`;
      }
      if (root) {
        delete root.dataset.viewerInteracting;
        root.style.setProperty(
          '--timeline-viewer-scale',
          String(constrained.scale),
        );
        root.dataset.viewerScale = String(constrained.scale);
        root.dataset.viewerX = String(constrained.x);
        root.dataset.viewerY = String(constrained.y);
      }
      writeScaleOutput(constrained);

      const nextSemanticLevel = timelineViewerSemanticLevel(constrained.scale);
      if (nextSemanticLevel !== semanticLevelRef.current) {
        semanticLevelRef.current = nextSemanticLevel;
        setSemanticLevel(nextSemanticLevel);
        onSemanticLevelChange(nextSemanticLevel);
      }
      scheduleFixedLayers(constrained);
    },
    [
      constrainTransform,
      onSemanticLevelChange,
      scheduleFixedLayers,
      wakeControls,
      writeScaleOutput,
    ],
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
      const current = transformRef.current;
      const zoomed = zoomTimelineAtPoint(
        current,
        current.scale * factor,
        point,
        timelineViewerMaxScale(stage.clientWidth),
      );
      applyTransform({ ...zoomed, y: current.y });
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

  const scheduleWheelSettle = useCallback(() => {
    if (wheelSettleTimerRef.current !== null) {
      window.clearTimeout(wheelSettleTimerRef.current);
    }
    wheelSettleTimerRef.current = window.setTimeout(() => {
      wheelSettleTimerRef.current = null;
      applyTransform(transformRef.current);
    }, 96);
  }, [applyTransform]);

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
      viewportRef.current = {
        width: stage.clientWidth,
        height: stage.clientHeight,
        metrics,
      };
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
      viewportRef.current = {
        width: stage.clientWidth,
        height: stage.clientHeight,
        metrics: viewerAxisMetrics(stage.clientWidth),
      };
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
      if (fixedLayerFrameRef.current !== null) {
        window.cancelAnimationFrame(fixedLayerFrameRef.current);
        fixedLayerFrameRef.current = null;
      }
      if (interactionFrameRef.current !== null) {
        window.cancelAnimationFrame(interactionFrameRef.current);
        interactionFrameRef.current = null;
      }
      if (wheelSettleTimerRef.current !== null) {
        window.clearTimeout(wheelSettleTimerRef.current);
        wheelSettleTimerRef.current = null;
      }
      if (controlsIdleTimerRef.current !== null) {
        window.clearTimeout(controlsIdleTimerRef.current);
        controlsIdleTimerRef.current = null;
      }
      setControlsIdle(false);
    };
  }, [active]);

  useEffect(() => {
    virtualSignatureRef.current = '';
    setVirtualNodeKeys(new Set(nodes.map((node) => node.key)));
  }, [nodes]);

  useLayoutEffect(() => {
    if (!active) return;
    if (fitModeRef.current) fitContent();
    else scheduleFixedLayers(transformRef.current);
  }, [
    active,
    axisTicks,
    fitContent,
    nodes,
    regions,
    semanticLevel,
    scheduleFixedLayers,
    virtualNodeKeys,
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
    wakeControls();
    if (wheelSettleTimerRef.current !== null) {
      window.clearTimeout(wheelSettleTimerRef.current);
      wheelSettleTimerRef.current = null;
    }
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
      const zoomed = zoomTimelineAtPoint(
        translated,
        gesture.transform.scale * (distance / gesture.distance),
        center,
        timelineViewerMaxScale(viewportRef.current.width),
      );
      applyInteractiveFrame({ ...zoomed, y: translated.y });
      return;
    }

    applyInteractiveFrame(
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
        const current = transformRef.current;
        const zoomed = zoomTimelineAtPoint(
          current,
          targetScale,
          point,
          timelineViewerMaxScale(stageRef.current?.clientWidth ?? 1024),
        );
        applyTransform({ ...zoomed, y: current.y });
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
    if (pointersRef.current.size === 0 && wasMoved) {
      applyTransform(transformRef.current);
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
    const current = transformRef.current;
    const zoomed = zoomTimelineAtPoint(
      current,
      targetScale,
      { x: event.clientX, y: event.clientY },
      timelineViewerMaxScale(stageRef.current?.clientWidth ?? 1024),
    );
    applyTransform({ ...zoomed, y: current.y });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!active) return;
    wakeControls();
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.002);
      fitModeRef.current = false;
      const current = transformRef.current;
      const zoomed = zoomTimelineAtPoint(
        current,
        current.scale * factor,
        { x: event.clientX, y: event.clientY },
        timelineViewerMaxScale(viewportRef.current.width),
      );
      applyInteractiveFrame({ ...zoomed, y: current.y });
      scheduleWheelSettle();
      return;
    }

    event.preventDefault();
    fitModeRef.current = false;
    applyInteractiveFrame(
      panTimelineViewer(transformRef.current, {
        x: event.shiftKey ? -event.deltaY : -event.deltaX,
        y: event.shiftKey ? 0 : -event.deltaY,
      }),
    );
    scheduleWheelSettle();
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
      data-controls-idle={active && controlsIdle ? 'true' : undefined}
      onKeyDown={handleKeyDown}
    >
      {active && (
        <>
          <div
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
              全体
            </button>
          </div>

          <div
            className="timeline-viewer-time-axis"
            ref={timeAxisRef}
            aria-hidden="true"
          >
            <div className="timeline-viewer-time-track" ref={timeTrackRef}>
              {axisTicks.map((tick) => (
                <span
                  key={tick}
                  className="timeline-viewer-time-tick"
                  data-viewer-tick={tick}
                  data-tick-strength={viewerTickStrength(tick)}
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
          </div>
          <div
            className="timeline-viewer-region-axis"
            ref={regionAxisRef}
            aria-hidden="true"
          >
            <div className="timeline-viewer-region-track" ref={regionTrackRef}>
              {regions.map((region) => (
                <span
                  key={region.id}
                  className={`timeline-viewer-region-label ${
                    region.id === 'origin'
                      ? 'timeline-viewer-region-label--origin'
                      : ''
                  }`}
                  data-viewer-region-id={region.id}
                  data-origin-band={region.id === 'origin' || undefined}
                  style={
                    region.regionColor
                      ? ({
                          '--timeline-region-rgb': region.regionColor,
                        } as CSSProperties)
                      : undefined
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
              ))}
            </div>
          </div>
          <div className="timeline-viewer-axis-origin" aria-hidden="true">
            <strong>地域</strong>
            <span>年代 →</span>
          </div>

          <div
            ref={railLayerRef}
            className="timeline-viewer-rail-layer"
            aria-hidden="true"
            data-viewer-rail-layer
          >
            <div
              className="timeline-viewer-board-content"
              ref={boardContentRef}
            >
              <span className="timeline-viewer-board" data-viewer-board />
              {regions.map((region) => (
                <span
                  key={region.id}
                  className={`timeline-viewer-region-guide ${
                    region.id === 'origin'
                      ? 'timeline-viewer-region-guide--origin'
                      : ''
                  }`}
                  data-viewer-region-guide={region.id}
                  data-origin-band={region.id === 'origin' || undefined}
                />
              ))}
            </div>
            <div
              className="timeline-viewer-rail-content"
              ref={railContentRef}
            >
              {axisTicks.map((tick) => (
                <span
                  key={tick}
                  className="timeline-viewer-gridline"
                  data-viewer-gridline={tick}
                  data-tick-strength={viewerTickStrength(tick)}
                />
              ))}
              {renderedNodes.map((node) => (
                <span
                  key={node.key}
                  className="timeline-viewer-period"
                  data-viewer-period={node.key}
                  data-movement-id={node.movementId}
                  data-secondary-occurrence={
                    node.secondaryOccurrence || undefined
                  }
                  data-priority={node.priority || undefined}
                  data-region-id={node.regionId}
                  style={
                    node.regionColor
                      ? ({
                          '--timeline-region-rgb': node.regionColor,
                        } as CSSProperties)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
          <div className="timeline-viewer-position" aria-hidden="true">
            <span data-viewer-position-thumb />
          </div>

          <div
            ref={nodeLayerRef}
            className="timeline-viewer-node-layer"
            data-viewer-node-layer
          >
            <div
              className="timeline-viewer-node-content"
              ref={nodeContentRef}
            >
              {regions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  className="timeline-viewer-overflow"
                  data-viewer-overflow={region.id}
                  aria-label={`${region.label}の省略項目を展開`}
                  onClick={() =>
                    setExpandedRegionIds((current) => {
                      const next = new Set(current);
                      next.add(region.id);
                      return next;
                    })
                  }
                />
              ))}
              {renderedNodes.map((node) => (
                <Link
                  key={node.key}
                  href={node.href}
                  prefetch={false}
                  className="timeline-viewer-node"
                  data-viewer-node
                  data-viewer-key={node.key}
                  data-movement-id={node.movementId}
                  data-region-id={node.regionId}
                  data-bar-start={node.barStart}
                  data-bar-end={node.barEnd}
                  data-secondary-occurrence={
                    node.secondaryOccurrence || undefined
                  }
                  data-priority={node.priority || undefined}
                  style={
                    node.regionColor
                      ? ({
                          '--timeline-region-rgb': node.regionColor,
                        } as CSSProperties)
                      : undefined
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
                    <span className="timeline-viewer-node__date">
                      {node.dateLabel}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
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
