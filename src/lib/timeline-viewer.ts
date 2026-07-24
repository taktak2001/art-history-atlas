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

export const TIMELINE_VIEWER_MIN_SCALE = 0.6;
export const TIMELINE_VIEWER_MAX_SCALE = 4;
export const TIMELINE_VIEWER_FIT_MIN_SCALE = 0.35;
export const TIMELINE_VIEWER_EDGE_PADDING = 20;
export const TIMELINE_VIEWER_CONTROL_INSET = 72;

const roundTransformValue = (value: number) => Math.round(value * 1000) / 1000;

export function clampTimelineViewerScale(scale: number) {
  return Math.min(
    TIMELINE_VIEWER_MAX_SCALE,
    Math.max(TIMELINE_VIEWER_MIN_SCALE, scale),
  );
}

export function zoomTimelineAtPoint(
  transform: TimelineViewerTransform,
  requestedScale: number,
  point: TimelineViewerPoint,
): TimelineViewerTransform {
  const scale = clampTimelineViewerScale(requestedScale);
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

export function fitTimelineViewer(
  content: TimelineViewerSize,
  viewport: TimelineViewerSize,
  padding = TIMELINE_VIEWER_EDGE_PADDING,
  controlInset = TIMELINE_VIEWER_CONTROL_INSET,
): TimelineViewerTransform {
  const availableWidth = Math.max(1, viewport.width - padding * 2);
  const availableHeight = Math.max(
    1,
    viewport.height - controlInset - padding * 2,
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
    x: roundTransformValue((viewport.width - renderedWidth) / 2),
    y: roundTransformValue(
      controlInset + (availableHeight - renderedHeight) / 2 + padding,
    ),
    scale: roundTransformValue(scale),
  };
}

export function viewerLabelVariant(
  scale: number,
  hasShortLabel: boolean,
): 'full' | 'short' {
  return scale >= 1.1 || !hasShortLabel ? 'full' : 'short';
}

