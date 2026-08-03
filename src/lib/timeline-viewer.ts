import { SURVEY_TICKS, type TimelineMode } from '@/lib/timeline-presentation';

export type TimelineViewerPoint = {
  x: number;
  y: number;
};

export type TimelineViewerSize = {
  width: number;
  height: number;
};

export type TimelineViewerTransform = TimelineViewerPoint & {
  scale: number;
};

export type TimelineViewerCompositeTransform = TimelineViewerPoint & {
  scaleX: number;
};

export type TimelineViewerRect = TimelineViewerPoint & TimelineViewerSize;

export type TimelineViewerInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type TimelineViewerSemanticLevel =
  | 'overview'
  | 'standard'
  | 'contextual'
  | 'detailed';

export type TimelineViewerCollisionItem = {
  key: string;
  regionId: string;
  x: number;
  width: number;
};

export type TimelineViewerTrackPlacement = TimelineViewerCollisionItem & {
  track: number | null;
};

export type TimelineViewerTickLabelCandidate = {
  year: number;
  x: number;
  width: number;
  priority: number;
};

export type TimelineViewerNativeZoom = {
  scrollLeft: number;
  anchorX: number;
  axisInset: number;
  currentScale: number;
  nextScale: number;
  maximumScrollLeft?: number;
};

export type TimelineViewerPeriodRail = {
  key: string;
  regionId: string;
  track: number;
  start: number;
  end: number;
};

export type TimelineViewerPeriodRailLayout = {
  key: string;
  left: number;
  width: number;
  offsetY: number;
};

export const TIMELINE_VIEWER_MIN_SCALE = 0.6;
export const TIMELINE_VIEWER_MAX_SCALE = 4;
export const TIMELINE_VIEWER_MOBILE_MAX_SCALE = 3;
// 「全体表示」だけは操作用の最小倍率を下回り、固定軸を除く表示域へ
// 現在の年代・レーンを確実に収める。文字とノードは別レイヤーなので読める。
export const TIMELINE_VIEWER_FIT_MIN_SCALE = 0.16;
export const TIMELINE_VIEWER_EDGE_PADDING = 20;
export const TIMELINE_VIEWER_CONTROL_INSET = 72;
export const TIMELINE_VIEWER_DOUBLE_TAP_SCALE = 1.75;
export const TIMELINE_VIEWER_SEMANTIC_THRESHOLDS = {
  standard: 1.25,
  contextual: 2,
  detailed: 3,
} as const;
export const TIMELINE_VIEWER_LABEL_GAP = 10;
export const TIMELINE_VIEWER_PERIOD_GAP = 10;
export const TIMELINE_VIEWER_PERIOD_MAX_TRIM = 6;
export const TIMELINE_VIEWER_PERIOD_OVERLAP_OFFSET = 5;
// Dense regions such as France can use one additional row before collapsing
// items. Sparse regions keep their natural height because row height is based
// on the tracks actually occupied, not this ceiling.
export const TIMELINE_VIEWER_MAX_TRACKS = 5;
export const TIMELINE_VIEWER_TRACK_PITCH = 64;
export const TIMELINE_VIEWER_REGION_BASE_HEIGHT = 88;

const TIMELINE_VIEWER_TICK_STEPS = [
  10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000,
] as const;

const roundTransformValue = (value: number) => Math.round(value * 1000) / 1000;

export function snapTimelineViewerPixel(value: number, devicePixelRatio = 1) {
  const ratio = Number.isFinite(devicePixelRatio)
    ? Math.max(1, devicePixelRatio)
    : 1;
  return Math.round(value * ratio) / ratio;
}

export function timelineViewerRightGutter(viewportWidth: number) {
  return viewportWidth <= 639 ? 160 : 192;
}

/**
 * Keeps independent duration rails visually distinct without changing the
 * underlying dates. Rails that only touch are inset to create a small break;
 * genuinely overlapping periods remain true to their range and use a subtle
 * vertical offset instead.
 */
export function layoutTimelineViewerPeriodRails(
  rails: TimelineViewerPeriodRail[],
  minimumGap = TIMELINE_VIEWER_PERIOD_GAP,
  maximumTrim = TIMELINE_VIEWER_PERIOD_MAX_TRIM,
  overlapOffset = TIMELINE_VIEWER_PERIOD_OVERLAP_OFFSET,
): TimelineViewerPeriodRailLayout[] {
  type MutableRail = TimelineViewerPeriodRailLayout & {
    regionId: string;
    track: number;
    right: number;
  };

  const grouped = new Map<string, MutableRail[]>();

  for (const rail of rails) {
    const left = Math.min(rail.start, rail.end);
    const right = Math.max(left + 1, rail.start, rail.end);
    const item: MutableRail = {
      key: rail.key,
      regionId: rail.regionId,
      track: rail.track,
      left,
      right,
      width: right - left,
      offsetY: 0,
    };
    const groupKey = `${rail.regionId}:${rail.track}`;
    const group = grouped.get(groupKey) ?? [];
    group.push(item);
    grouped.set(groupKey, group);
  }

  for (const group of grouped.values()) {
    group.sort(
      (first, second) =>
        first.left - second.left ||
        second.right - first.right ||
        first.key.localeCompare(second.key),
    );

    for (let index = 1; index < group.length; index += 1) {
      const previous = group[index - 1];
      const current = group[index];
      const gap = current.left - previous.right;
      if (gap < 0 || gap >= minimumGap) continue;

      const missingGap = minimumGap - gap;
      const previousAvailable = Math.max(0, previous.right - previous.left - 1);
      const currentAvailable = Math.max(0, current.right - current.left - 1);
      const previousTrim = Math.min(
        maximumTrim,
        previousAvailable,
        missingGap / 2,
      );
      const currentTrim = Math.min(
        maximumTrim,
        currentAvailable,
        missingGap - previousTrim,
      );
      previous.right -= previousTrim;
      previous.width = previous.right - previous.left;
      current.left += currentTrim;
      current.width = current.right - current.left;
    }

    const activeEndByOffset = new Map<number, number>();
    const offsets = [0, overlapOffset, -overlapOffset];
    for (const rail of group) {
      const availableOffset = offsets.find(
        (offset) =>
          rail.left >=
          (activeEndByOffset.get(offset) ?? Number.NEGATIVE_INFINITY) +
            minimumGap,
      );
      const offset =
        availableOffset ??
        offsets.reduce((best, candidate) =>
          (activeEndByOffset.get(candidate) ?? Number.NEGATIVE_INFINITY) <
          (activeEndByOffset.get(best) ?? Number.NEGATIVE_INFINITY)
            ? candidate
            : best,
        );
      rail.offsetY = offset;
      activeEndByOffset.set(
        offset,
        Math.max(activeEndByOffset.get(offset) ?? rail.right, rail.right),
      );
    }
  }

  return [...grouped.values()]
    .flat()
    .map(({ key, left, width, offsetY }) => ({
      key,
      left: roundTransformValue(left),
      width: roundTransformValue(Math.max(1, width)),
      offsetY,
    }));
}

/**
 * Keeps the same chronological point beneath a viewport anchor when a native
 * scroll world changes width. This only runs when zoom is committed, never
 * during one-finger scrolling.
 */
export function timelineViewerScrollAfterScale({
  scrollLeft,
  anchorX,
  axisInset,
  currentScale,
  nextScale,
  maximumScrollLeft = Number.POSITIVE_INFINITY,
}: TimelineViewerNativeZoom) {
  const safeCurrentScale = Math.max(0.0001, currentScale);
  const contentPoint =
    (Math.max(0, scrollLeft) + anchorX - axisInset) / safeCurrentScale;
  const nextScrollLeft =
    axisInset + contentPoint * Math.max(0.0001, nextScale) - anchorX;

  return roundTransformValue(
    Math.min(
      Math.max(0, maximumScrollLeft),
      Math.max(0, nextScrollLeft),
    ),
  );
}

export function timelineViewerTickPriority(
  year: number,
  mode: TimelineMode,
) {
  if (year === mode.start || year === mode.end) return 5;
  if (year === 0) return 4;
  if (year % 500 === 0) return 3;
  if (year % 100 === 0) return 2;
  return 1;
}

export function selectTimelineViewerTickLabels(
  candidates: TimelineViewerTickLabelCandidate[],
  minimumAnchorGap = 72,
  minimumLabelGap = 8,
) {
  const selected: TimelineViewerTickLabelCandidate[] = [];
  const prioritized = [...candidates].sort(
    (a, b) => b.priority - a.priority || a.x - b.x || a.year - b.year,
  );

  for (const candidate of prioritized) {
    const conflicts = selected.some((existing) => {
      const anchorsTooClose =
        Math.abs(existing.x - candidate.x) < minimumAnchorGap;
      const labelsOverlap =
        candidate.x < existing.x + existing.width + minimumLabelGap &&
        candidate.x + candidate.width + minimumLabelGap > existing.x;
      return anchorsTooClose || labelsOverlap;
    });
    if (!conflicts) selected.push(candidate);
  }

  return selected.sort((a, b) => a.x - b.x).map(({ year }) => year);
}

export function timelineViewerMaxScale(viewportWidth: number) {
  return viewportWidth <= 639
    ? TIMELINE_VIEWER_MOBILE_MAX_SCALE
    : TIMELINE_VIEWER_MAX_SCALE;
}

export function clampTimelineViewerScale(
  scale: number,
  maximumScale = TIMELINE_VIEWER_MAX_SCALE,
) {
  return Math.min(maximumScale, Math.max(TIMELINE_VIEWER_MIN_SCALE, scale));
}

export function zoomTimelineAtPoint(
  transform: TimelineViewerTransform,
  requestedScale: number,
  point: TimelineViewerPoint,
  maximumScale = TIMELINE_VIEWER_MAX_SCALE,
): TimelineViewerTransform {
  const scale = clampTimelineViewerScale(requestedScale, maximumScale);
  const contentX = (point.x - transform.x) / transform.scale;
  const contentY = (point.y - transform.y) / transform.scale;

  return {
    x: roundTransformValue(point.x - contentX * scale),
    y: roundTransformValue(point.y - contentY * scale),
    scale: roundTransformValue(scale),
  };
}

export function panTimelineViewer(
  transform: TimelineViewerTransform,
  delta: TimelineViewerPoint,
): TimelineViewerTransform {
  return {
    ...transform,
    x: roundTransformValue(transform.x + delta.x),
    y: roundTransformValue(transform.y + delta.y),
  };
}

export function relativeTimelineViewerCompositeTransform(
  settled: TimelineViewerTransform,
  current: TimelineViewerTransform,
): TimelineViewerCompositeTransform {
  const scaleX = current.scale / Math.max(0.0001, settled.scale);
  return {
    x: roundTransformValue(current.x - settled.x * scaleX),
    y: roundTransformValue(current.y - settled.y),
    scaleX: roundTransformValue(scaleX),
  };
}

export function timelineViewerVirtualNodeKeys<
  Node extends {
    key: string;
    barStart: number;
    barEnd: number;
  },
>(
  nodes: Node[],
  transform: TimelineViewerTransform,
  contentOriginX: number,
  viewportLeft: number,
  viewportRight: number,
  bufferWidth: number,
) {
  const left = viewportLeft - Math.max(0, bufferWidth);
  const right = viewportRight + Math.max(0, bufferWidth);

  return nodes
    .filter((node) => {
      const start =
        transform.x + (contentOriginX + node.barStart) * transform.scale;
      const end =
        transform.x + (contentOriginX + node.barEnd) * transform.scale;
      return Math.max(start, end) >= left && Math.min(start, end) <= right;
    })
    .map((node) => node.key);
}

export function constrainTimelineViewerVerticalPan(
  transform: TimelineViewerTransform,
  contentOffsetY: number,
  contentHeight: number,
  viewportHeight: number,
  topInset: number,
  bottomInset: number,
  padding = 12,
): TimelineViewerTransform {
  const viewportTop = topInset + padding;
  const viewportBottom = Math.max(
    viewportTop,
    viewportHeight - bottomInset - padding,
  );
  const availableHeight = Math.max(1, viewportBottom - viewportTop);
  const maximumY = viewportTop - contentOffsetY;

  if (contentHeight <= availableHeight) {
    return { ...transform, y: roundTransformValue(maximumY) };
  }

  const minimumY = viewportBottom - contentOffsetY - contentHeight;
  return {
    ...transform,
    y: roundTransformValue(
      Math.min(maximumY, Math.max(minimumY, transform.y)),
    ),
  };
}

export function worldToTimelineViewerScreen(
  point: TimelineViewerPoint,
  transform: TimelineViewerTransform,
): TimelineViewerPoint {
  return {
    x: roundTransformValue(transform.x + point.x * transform.scale),
    y: roundTransformValue(transform.y + point.y * transform.scale),
  };
}

export function timelineViewerSemanticLevel(
  scale: number,
): TimelineViewerSemanticLevel {
  if (scale < TIMELINE_VIEWER_SEMANTIC_THRESHOLDS.standard) return 'overview';
  if (scale < TIMELINE_VIEWER_SEMANTIC_THRESHOLDS.contextual) return 'standard';
  if (scale < TIMELINE_VIEWER_SEMANTIC_THRESHOLDS.detailed) {
    return 'contextual';
  }
  return 'detailed';
}

/**
 * Places fixed-size labels into the first available vertical track.
 * Coordinates are screen-space pixels, so zoom changes the number of tracks
 * while horizontal pan keeps the chronological X position intact.
 */
export function assignTimelineViewerTracks(
  items: TimelineViewerCollisionItem[],
  gap = TIMELINE_VIEWER_LABEL_GAP,
  maximumTracks = TIMELINE_VIEWER_MAX_TRACKS,
): TimelineViewerTrackPlacement[] {
  const placements = new Map<string, TimelineViewerTrackPlacement>();
  const grouped = new Map<string, TimelineViewerCollisionItem[]>();

  for (const item of items) {
    const regionItems = grouped.get(item.regionId) ?? [];
    regionItems.push(item);
    grouped.set(item.regionId, regionItems);
  }

  for (const regionItems of grouped.values()) {
    const trackEnds: number[] = [];
    const sortedItems = [...regionItems].sort(
      (a, b) => a.x - b.x || b.width - a.width || a.key.localeCompare(b.key),
    );

    for (const item of sortedItems) {
      let track = trackEnds.findIndex((end) => item.x >= end + gap);
      if (track === -1 && trackEnds.length < maximumTracks) {
        track = trackEnds.length;
        trackEnds.push(Number.NEGATIVE_INFINITY);
      }

      if (track === -1) {
        placements.set(item.key, { ...item, track: null });
        continue;
      }

      trackEnds[track] = item.x + item.width;
      placements.set(item.key, { ...item, track });
    }
  }

  return items.map(
    (item) =>
      placements.get(item.key) ?? {
        ...item,
        track: null,
      },
  );
}

export function timelineViewerRegionHeight(trackCount: number) {
  const visibleTrackCount = Math.max(
    1,
    Math.min(trackCount, TIMELINE_VIEWER_MAX_TRACKS),
  );
  return (
    TIMELINE_VIEWER_REGION_BASE_HEIGHT +
    (visibleTrackCount - 1) * TIMELINE_VIEWER_TRACK_PITCH +
    Math.max(0, trackCount - TIMELINE_VIEWER_MAX_TRACKS) *
      TIMELINE_VIEWER_TRACK_PITCH
  );
}

export function timelineViewerTrackCenter(
  track: number,
  trackCount: number,
  regionHeight = timelineViewerRegionHeight(trackCount),
) {
  const visibleTrackCount = Math.max(
    1,
    Math.min(trackCount, TIMELINE_VIEWER_MAX_TRACKS),
  );
  const occupiedHeight = (visibleTrackCount - 1) * TIMELINE_VIEWER_TRACK_PITCH;
  return (
    (regionHeight - occupiedHeight) / 2 +
    Math.min(track, visibleTrackCount - 1) * TIMELINE_VIEWER_TRACK_PITCH
  );
}

export function fitTimelineViewer(
  content: TimelineViewerSize,
  viewport: TimelineViewerSize,
  padding = TIMELINE_VIEWER_EDGE_PADDING,
  controlInset = TIMELINE_VIEWER_CONTROL_INSET,
): TimelineViewerTransform {
  return fitTimelineViewerRect(
    { x: 0, y: 0, ...content },
    viewport,
    {
      top: controlInset,
      right: 0,
      bottom: 0,
      left: 0,
    },
    padding,
  );
}

export function fitTimelineViewerRect(
  content: TimelineViewerRect,
  viewport: TimelineViewerSize,
  insets: TimelineViewerInsets,
  padding = TIMELINE_VIEWER_EDGE_PADDING,
): TimelineViewerTransform {
  const availableWidth = Math.max(
    1,
    viewport.width - insets.left - insets.right - padding * 2,
  );
  const availableHeight = Math.max(
    1,
    viewport.height - insets.top - insets.bottom - padding * 2,
  );
  const naturalScale = Math.min(
    1,
    availableWidth / Math.max(1, content.width),
    availableHeight / Math.max(1, content.height),
  );
  const scale = Math.max(TIMELINE_VIEWER_FIT_MIN_SCALE, naturalScale);
  const renderedWidth = content.width * scale;
  const renderedHeight = content.height * scale;

  return {
    x: roundTransformValue(
      insets.left +
        padding +
        (availableWidth - renderedWidth) / 2 -
        content.x * scale,
    ),
    y: roundTransformValue(
      insets.top +
        padding +
        (availableHeight - renderedHeight) / 2 -
        content.y * scale,
    ),
    scale: roundTransformValue(scale),
  };
}

export function semanticTimelineTicks(
  mode: TimelineMode,
  worldWidth: number,
  scale: number,
  targetScreenSpacing = 88,
) {
  if (mode.id === 'survey') {
    const ticks = [...SURVEY_TICKS];
    if (mode.start < 0 && mode.end > 0 && !ticks.includes(0)) ticks.push(0);
    return ticks.sort((a, b) => a - b);
  }

  const span = Math.max(1, mode.end - mode.start);
  const renderedWidth = Math.max(1, worldWidth * scale);
  const requestedStep = (span * targetScreenSpacing) / renderedWidth;
  const step =
    TIMELINE_VIEWER_TICK_STEPS.find(
      (candidate) => candidate >= requestedStep,
    ) ?? Math.ceil(requestedStep / 10000) * 10000;
  const first = Math.ceil(mode.start / step) * step;
  const ticks: number[] = [];

  for (let year = first; year <= mode.end; year += step) {
    ticks.push(year);
  }
  if (ticks[0] !== mode.start) ticks.unshift(mode.start);
  if (ticks.at(-1) !== mode.end) ticks.push(mode.end);
  if (mode.start < 0 && mode.end > 0 && !ticks.includes(0)) ticks.push(0);
  return ticks.sort((a, b) => a - b);
}

export function viewerLabelVariant(
  scale: number,
  hasShortLabel: boolean,
): 'full' | 'short' {
  return scale >= TIMELINE_VIEWER_SEMANTIC_THRESHOLDS.standard ||
    !hasShortLabel
    ? 'full'
    : 'short';
}
