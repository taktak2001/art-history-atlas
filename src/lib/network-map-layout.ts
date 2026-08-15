import type {
  Movement,
  RegionId,
  Relationship,
  VisibilityLevel,
} from '@/lib/schema';
import { timelineModeById, yearToTimelineX } from '@/lib/timeline-presentation';

export type NetworkSemanticLevel = 'overview' | 'study' | 'detail';
export type NetworkNodeProminence = 'hub' | 'major';

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

// Overview keeps labels at their normal CSS size and reduces the dataset, so
// the camera can travel much farther out without turning text into microcopy.
export const NETWORK_ZOOM_MIN = 0.18;
export const NETWORK_ZOOM_MAX = 1.6;

export function clampNetworkZoom(value: number) {
  return Math.min(NETWORK_ZOOM_MAX, Math.max(NETWORK_ZOOM_MIN, value));
}

export function networkSemanticLevel(zoom: number): NetworkSemanticLevel {
  if (zoom < 0.94) return 'overview';
  if (zoom < 1.28) return 'study';
  return 'detail';
}

/**
 * Information density is intentionally independent from camera scale.
 * The public LOD control remains the single user-facing density control.
 */
export function networkSemanticLevelForLod(
  lod: VisibilityLevel,
): NetworkSemanticLevel {
  if (lod === 'core') return 'overview';
  if (lod === 'standard') return 'study';
  return 'detail';
}

function movementDegree(
  movementId: string,
  relationships: Pick<Relationship, 'from' | 'to'>[],
) {
  return relationships.reduce(
    (count, relationship) =>
      count +
      Number(
        relationship.from === movementId || relationship.to === movementId,
      ),
    0,
  );
}

export function networkMovementImportance(
  movement: Movement,
  relationships: Pick<Relationship, 'from' | 'to'>[],
) {
  const visibilityScore =
    movement.visibilityLevel === 'core'
      ? 58
      : movement.visibilityLevel === 'standard'
        ? 24
        : 4;
  const representativeScore = movement.isRepresentative ? 34 : 0;
  const degreeScore = Math.min(8, movementDegree(movement.id, relationships)) * 6;
  const editorialOrderScore = Math.max(
    0,
    12 - Math.floor((movement.displayOrder ?? 120) / 10),
  );
  return visibilityScore + representativeScore + degreeScore + editorialOrderScore;
}

/**
 * Overview is an editorial map, not the entire graph made smaller. The greedy
 * pass balances historical importance with era and region coverage so a
 * degree-heavy cluster cannot consume the whole overview.
 */
export function selectNetworkOverviewMovements(
  movements: Movement[],
  relationships: Pick<Relationship, 'from' | 'to'>[],
  limit: number,
) {
  const remaining = new Map(movements.map((movement) => [movement.id, movement]));
  const selected: Movement[] = [];
  const coveredEras = new Set<string>();
  const coveredRegions = new Set<string>();

  while (remaining.size > 0 && selected.length < limit) {
    const next = [...remaining.values()].sort((a, b) => {
      const adjusted = (movement: Movement) =>
        networkMovementImportance(movement, relationships) +
        (coveredEras.has(movement.era) ? 0 : 20) +
        (coveredRegions.has(movement.regionIds[0] ?? 'other') ? 0 : 14);
      return adjusted(b) - adjusted(a) || a.id.localeCompare(b.id);
    })[0];
    if (!next) break;
    selected.push(next);
    remaining.delete(next.id);
    coveredEras.add(next.era);
    coveredRegions.add(next.regionIds[0] ?? 'other');
  }

  return selected.sort(
    (a, b) => a.dates.start - b.dates.start || a.id.localeCompare(b.id),
  );
}

export function networkNodeProminence(
  movement: Movement,
  relationships: Pick<Relationship, 'from' | 'to'>[],
): NetworkNodeProminence {
  const degree = movementDegree(movement.id, relationships);
  return movement.isRepresentative && degree >= 3 || degree >= 6
    ? 'hub'
    : 'major';
}

export function getNetworkMovementBounds(
  movementIds: Iterable<string>,
  layout: ChronologicalNetworkLayout,
  gutter = 32,
) {
  const positions = [...movementIds]
    .map((id) => layout.positions.get(id))
    .filter((position): position is { x: number; y: number } => Boolean(position));
  if (positions.length === 0) return null;
  const minX = Math.min(...positions.map((position) => position.x)) - gutter;
  const minY = Math.min(...positions.map((position) => position.y)) - gutter;
  const maxX =
    Math.max(...positions.map((position) => position.x + layout.nodeW)) + gutter;
  const maxY =
    Math.max(...positions.map((position) => position.y + layout.nodeH)) + gutter;
  return {
    x: Math.max(0, minX),
    y: Math.max(0, minY),
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
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
}: {
  movements: Movement[];
  regionOrder: RegionId[];
  zoom: number;
  compact: boolean;
  safePad?: number;
}): ChronologicalNetworkLayout {
  const resolvedZoom = clampNetworkZoom(zoom);
  const mode = timelineModeById('survey');
  const axisW = compact ? 88 : 142;
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
