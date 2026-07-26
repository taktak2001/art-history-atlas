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
  standard: 1,
  contextual: 1.8,
  detailed: 3,
} as const;
export const TIMELINE_VIEWER_LABEL_GAP = 10;
export const TIMELINE_VIEWER_MAX_TRACKS = 4;
export const TIMELINE_VIEWER_TRACK_PITCH = 40;

const TIMELINE_VIEWER_TICK_STEPS = [
  10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000,
] as const;

const roundTransformValue = (value: number) => Math.round(value * 1000) / 1000;

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
  if (trackCount <= 1) return 80;
  if (trackCount === 2) return 120;
  return 160;
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
  return scale >= 1 || !hasShortLabel ? 'full' : 'short';
}
