import type { Movement, RegionId } from '@/lib/schema';
import { timelineModeById, yearToTimelineX } from '@/lib/timeline-presentation';

export type NetworkSemanticLevel = 'overview' | 'study' | 'detail';

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
  zoom: number;
};

export const NETWORK_ZOOM_MIN = 0.72;
export const NETWORK_ZOOM_MAX = 1.6;

export function clampNetworkZoom(value: number) {
  return Math.min(NETWORK_ZOOM_MAX, Math.max(NETWORK_ZOOM_MIN, value));
}

/**
 * 表示段階は倍率ではなく閲覧モードが決める（network-mode.ts）。
 * 倍率はカメラだけを担当するので、ここでは型のみを提供する。
 */

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
}: {
  movements: Movement[];
  regionOrder: RegionId[];
  zoom: number;
  compact: boolean;
  safePad?: number;
}): ChronologicalNetworkLayout {
  const resolvedZoom = clampNetworkZoom(zoom);
  const mode = timelineModeById('survey');
  const axisW = compact ? 104 : 142;
  const headerH = compact ? 48 : 52;
  const pad = compact ? 24 : 36;
  const nodeW = compact ? 150 : 174;
  const nodeH = compact ? 58 : 62;
  const trackStep = compact ? 72 : 76;
  const lanePadding = compact ? 22 : 26;
  const minimumLaneHeight = compact ? 108 : 116;
  const timelineW = Math.round((compact ? 1540 : 2240) * resolvedZoom);
  // The final historical years must be centerable even on a wide viewport.
  // This is display-safe space only; it never changes the time coordinate.
  const rightGutter = compact ? 560 : 720;
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
      const originX =
        safePad + axisW + pad + yearToTimelineX(movement.dates.start, mode, timelineW);
      const x = Math.max(
        safePad + axisW + 8,
        Math.min(originX - nodeW / 2, safePad + axisW + pad + timelineW - nodeW / 2),
      );
      const minimumGap = compact ? 12 : 16;
      let track = trackEnds.findIndex((end) => x >= end + minimumGap);
      if (track < 0) {
        track = trackEnds.length;
        trackEnds.push(x + nodeW);
      } else {
        trackEnds[track] = x + nodeW;
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

  return {
    positions,
    lanes,
    canvasW: safePad * 2 + axisW + pad * 2 + timelineW + rightGutter,
    canvasH: laneTop + pad + safePad,
    timelineW,
    nodeW,
    nodeH,
    axisW,
    headerH,
    pad,
    safePad,
    zoom: resolvedZoom,
  };
}
