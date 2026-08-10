import type { Movement, RegionId } from '@/lib/schema';
import { timelineModeById, yearToTimelineX } from '@/lib/timeline-presentation';

export type NetworkSemanticLevel = 'overview' | 'study' | 'detail';

export type NetworkVisualBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

export type NetworkVisualRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type NetworkRegionLane = {
  region: RegionId;
  top: number;
  height: number;
  trackCount: number;
};

export type ChronologicalNetworkLayout = {
  positions: Map<string, { x: number; y: number }>;
  lanes: NetworkRegionLane[];
  canvasW: number;
  canvasH: number;
  timelineW: number;
  nodeW: number;
  nodeH: number;
  axisW: number;
  headerH: number;
  pad: number;
  safePad: number;
  visualGutter: number;
  visualBounds: NetworkVisualBounds;
  zoom: number;
};

export const NETWORK_ZOOM_MIN = 0.18;
export const NETWORK_ZOOM_MAX = 1.6;
export const NETWORK_VISUAL_GUTTER = 32;

export function clampNetworkZoom(value: number) {
  return Math.min(NETWORK_ZOOM_MAX, Math.max(NETWORK_ZOOM_MIN, value));
}

export function networkSemanticLevel(zoom: number): NetworkSemanticLevel {
  if (zoom < 0.94) return 'overview';
  if (zoom < 1.28) return 'study';
  return 'detail';
}

export function getNetworkVisualBounds(
  rects: NetworkVisualRect[],
  gutter = 0,
): NetworkVisualBounds {
  if (rects.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: gutter * 2,
      maxY: gutter * 2,
      width: gutter * 2,
      height: gutter * 2,
    };
  }

  const minX = Math.min(...rects.map((rect) => rect.x)) - gutter;
  const minY = Math.min(...rects.map((rect) => rect.y)) - gutter;
  const maxX = Math.max(...rects.map((rect) => rect.x + rect.width)) + gutter;
  const maxY = Math.max(...rects.map((rect) => rect.y + rect.height)) + gutter;
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getNetworkFitZoom({
  currentZoom,
  bounds,
  viewportWidth,
  viewportHeight,
  axisW,
  headerH,
  padding = NETWORK_VISUAL_GUTTER,
  maxZoom = NETWORK_ZOOM_MAX,
}: {
  currentZoom: number;
  bounds: NetworkVisualBounds;
  viewportWidth: number;
  viewportHeight: number;
  axisW: number;
  headerH: number;
  padding?: number;
  maxZoom?: number;
}) {
  const availableWidth = Math.max(1, viewportWidth - axisW - padding * 2);
  const availableHeight = Math.max(1, viewportHeight - headerH - padding * 2);
  const ratio = Math.min(
    availableWidth / Math.max(1, bounds.width),
    availableHeight / Math.max(1, bounds.height),
  );
  return Math.min(maxZoom, clampNetworkZoom(currentZoom * ratio));
}

const primaryRegion = (movement: Movement): RegionId =>
  movement.regionIds[0] ?? 'other';

/**
 * Time remains the primary horizontal coordinate while region remains the
 * primary vertical coordinate. Tracks only resolve collisions inside a lane;
 * they never change the historical or regional meaning of a node position.
 */
export function buildChronologicalNetworkLayout({
  movements,
  regionOrder,
  zoom,
  compact,
  safePad = 16,
  visualGutter = NETWORK_VISUAL_GUTTER,
}: {
  movements: Movement[];
  regionOrder: RegionId[];
  zoom: number;
  compact: boolean;
  safePad?: number;
  visualGutter?: number;
}): ChronologicalNetworkLayout {
  const resolvedZoom = clampNetworkZoom(zoom);
  const mode = timelineModeById('survey');
  const axisW = compact ? 104 : 142;
  const headerH = compact ? 48 : 52;
  const basePad = compact ? 24 : 36;
  const baseNodeW = compact ? 150 : 174;
  const baseNodeH = compact ? 58 : 62;
  const baseTrackStep = compact ? 72 : 76;
  const baseLanePadding = compact ? 22 : 26;
  const baseMinimumLaneHeight = compact ? 108 : 116;
  const baseTimelineW = compact ? 1540 : 2240;
  const pad = Math.round(basePad * resolvedZoom);
  const nodeW = Math.round(baseNodeW * resolvedZoom);
  const nodeH = Math.max(compact ? 12 : 14, Math.round(baseNodeH * resolvedZoom));
  const trackStep = Math.max(
    compact ? 16 : 18,
    Math.round(baseTrackStep * resolvedZoom),
  );
  const lanePadding = Math.max(
    compact ? 3 : 4,
    Math.round(baseLanePadding * resolvedZoom),
  );
  const minimumLaneHeight = Math.max(
    compact ? 21 : 25,
    Math.round(baseMinimumLaneHeight * resolvedZoom),
  );
  const timelineW = Math.round(baseTimelineW * resolvedZoom);
  // The final historical years must be centerable even on a wide viewport.
  // This is display-safe space only; it never changes the time coordinate.
  const rightGutter = Math.round((compact ? 560 : 720) * resolvedZoom);
  const positions = new Map<string, { x: number; y: number }>();

  const activeRegions = regionOrder.filter((region) =>
    movements.some((movement) => primaryRegion(movement) === region),
  );
  const lanes: NetworkRegionLane[] = [];
  let laneTop = safePad + headerH;

  for (const region of activeRegions) {
    const inRegion = movements
      .filter((movement) => primaryRegion(movement) === region)
      .sort((a, b) => a.dates.start - b.dates.start || a.id.localeCompare(b.id));
    const trackEnds: number[] = [];
    const placements = inRegion.map((movement) => {
      // Collision tracks are resolved in the unscaled historical world. This
      // keeps overview zoom from creating extra tracks merely because X was
      // compressed, so the same map can be fitted without changing topology.
      const baseOriginX =
        safePad +
        axisW +
        basePad +
        yearToTimelineX(movement.dates.start, mode, baseTimelineW);
      const baseX = Math.max(
        safePad + axisW + 8,
        Math.min(
          baseOriginX - baseNodeW / 2,
          safePad + axisW + basePad + baseTimelineW - baseNodeW / 2,
        ),
      );
      const originX =
        safePad + axisW + pad + yearToTimelineX(movement.dates.start, mode, timelineW);
      const x = Math.max(
        safePad + axisW + 8,
        Math.min(originX - nodeW / 2, safePad + axisW + pad + timelineW - nodeW / 2),
      );
      const minimumGap = compact ? 12 : 16;
      let track = trackEnds.findIndex((end) => baseX >= end + minimumGap);
      if (track < 0) {
        track = trackEnds.length;
        trackEnds.push(baseX + baseNodeW);
      } else {
        trackEnds[track] = baseX + baseNodeW;
      }
      return { movement, x, track };
    });

    const trackCount = Math.max(1, trackEnds.length);
    const height = Math.max(
      minimumLaneHeight,
      lanePadding * 2 + nodeH + (trackCount - 1) * trackStep,
    );
    lanes.push({ region, top: laneTop, height, trackCount });
    for (const placement of placements) {
      positions.set(placement.movement.id, {
        x: placement.x,
        y: laneTop + lanePadding + placement.track * trackStep,
      });
    }
    laneTop += height;
  }

  const nodeRects = [...positions.values()].map((position) => ({
    x: position.x,
    y: position.y,
    width: nodeW,
    height: nodeH,
  }));
  // The camera uses a visual box, not only node centers. The 4px expansion
  // accounts for selected/focus outlines before the shared safe gutter.
  const visualBounds = getNetworkVisualBounds(
    nodeRects.map((rect) => ({
      x: rect.x - 4,
      y: rect.y - 4,
      width: rect.width + 8,
      height: rect.height + 8,
    })),
    visualGutter,
  );
  const nominalCanvasW = safePad * 2 + axisW + pad * 2 + timelineW + rightGutter;
  const nominalCanvasH = laneTop + pad + safePad;

  return {
    positions,
    lanes,
    canvasW: Math.ceil(Math.max(nominalCanvasW, visualBounds.maxX + visualGutter)),
    canvasH: Math.ceil(Math.max(nominalCanvasH, visualBounds.maxY + visualGutter)),
    timelineW,
    nodeW,
    nodeH,
    axisW,
    headerH,
    pad,
    safePad,
    visualGutter,
    visualBounds,
    zoom: resolvedZoom,
  };
}
