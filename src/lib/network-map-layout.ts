import type {
  Movement,
  RegionId,
  VisibilityLevel,
} from '@/lib/schema';
import { timelineModeById, yearToTimelineX } from '@/lib/timeline-presentation';

export type NetworkSemanticLevel = 'overview' | 'study' | 'detail';
export type NetworkNodeProminence = 'hub' | 'major' | 'normal' | 'peripheral';

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
  visibleNodeCount: number;
  relevantNodeCount: number;
  relevance: 'overview' | 'active' | 'context';
};

export type ChronologicalNetworkLayout = {
  positions: Map<string, { x: number; y: number }>;
  lanes: NetworkRegionLane[];
  canvasW: number;
  canvasH: number;
  timelineW: number;
  nodeW: number;
  nodeH: number;
  stationY: number;
  axisW: number;
  headerH: number;
  pad: number;
  safePad: number;
  visualGutter: number;
  visualBounds: NetworkVisualBounds;
  zoom: number;
};

// Overview keeps labels at their normal CSS size and reduces the dataset, so
// the camera can travel much farther out without turning text into microcopy.
export const NETWORK_ZOOM_MIN = 0.18;
export const NETWORK_ZOOM_MAX = 1.6;
export const NETWORK_VISUAL_GUTTER = 32;
export const NETWORK_OVERVIEW_NODE_LIMIT = 26;

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

export function networkNodeImportanceScore(
  movement: Movement,
  relationshipDegree: number,
): number {
  const visibilityScore =
    movement.visibilityLevel === 'core'
      ? 5
      : movement.visibilityLevel === 'standard'
        ? 2
        : 0;
  return relationshipDegree * 2 + visibilityScore + (movement.isRepresentative ? 5 : 0);
}

export function networkNodeProminence(
  movement: Movement,
  relationshipDegree: number,
): NetworkNodeProminence {
  const score = networkNodeImportanceScore(movement, relationshipDegree);
  if (score >= 23) return 'hub';
  if (score >= 17) return 'major';
  if (score >= 9) return 'normal';
  return 'peripheral';
}

/**
 * Overview is an editorial map rather than a smaller rendering of Detail.
 * Keep one strong landmark per active region, then fill the remaining places
 * by historical connectivity and editorial importance.
 */
export function selectNetworkOverviewMovements(
  movements: Movement[],
  relationshipDegreeById: ReadonlyMap<string, number>,
  limit = NETWORK_OVERVIEW_NODE_LIMIT,
): Movement[] {
  if (movements.length <= limit) return [...movements];

  const ranked = [...movements].sort((a, b) => {
    const scoreDifference =
      networkNodeImportanceScore(b, relationshipDegreeById.get(b.id) ?? 0) -
      networkNodeImportanceScore(a, relationshipDegreeById.get(a.id) ?? 0);
    return scoreDifference || a.dates.start - b.dates.start || a.id.localeCompare(b.id);
  });
  const remaining = new Map(ranked.map((movement) => [movement.id, movement]));
  const selected = new Map<string, Movement>();
  const seenRegions = new Set<RegionId>();
  const seenEras = new Set<Movement['era']>();

  // Give every active region one readable landmark before adding a second
  // movement from a well-connected Western cluster.
  for (const movement of ranked) {
    const region = primaryRegion(movement);
    if (seenRegions.has(region)) continue;
    selected.set(movement.id, movement);
    remaining.delete(movement.id);
    seenRegions.add(region);
    seenEras.add(movement.era);
    if (selected.size >= limit) break;
  }

  while (remaining.size > 0 && selected.size < limit) {
    const next = [...remaining.values()].sort((a, b) => {
      const adjustedScore = (movement: Movement) =>
        networkNodeImportanceScore(
          movement,
          relationshipDegreeById.get(movement.id) ?? 0,
        ) +
        (seenRegions.has(primaryRegion(movement)) ? 0 : 8) +
        (seenEras.has(movement.era) ? 0 : 10);
      return adjustedScore(b) - adjustedScore(a) || a.id.localeCompare(b.id);
    })[0];
    if (!next) break;
    selected.set(next.id, next);
    remaining.delete(next.id);
    seenRegions.add(primaryRegion(next));
    seenEras.add(next.era);
  }

  return [...selected.values()].sort(
    (a, b) => a.dates.start - b.dates.start || a.id.localeCompare(b.id),
  );
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
  focusNodeIds,
}: {
  movements: Movement[];
  regionOrder: RegionId[];
  zoom: number;
  compact: boolean;
  safePad?: number;
  visualGutter?: number;
  focusNodeIds?: ReadonlySet<string>;
}): ChronologicalNetworkLayout {
  const resolvedZoom = clampNetworkZoom(zoom);
  const mode = timelineModeById('survey');
  const axisW = compact ? 88 : 142;
  const headerH = compact ? 48 : 52;
  const basePad = compact ? 24 : 36;
  const baseNodeW = compact ? 150 : 174;
  const baseNodeH = compact ? 58 : 62;
  const baseTrackStep = compact ? 72 : 76;
  const baseLanePadding = compact ? 22 : 26;
  const baseMinimumLaneHeight = compact ? 108 : 116;
  const baseRegionGap = compact ? 12 : 18;
  const baseTimelineW = compact ? 1540 : 2240;
  const pad = Math.round(basePad * resolvedZoom);
  const nodeW = Math.round(baseNodeW * resolvedZoom);
  // Labels keep a readable CSS size while the historical world zooms. Give
  // every station enough physical height to keep its route below the label.
  const nodeH = Math.max(compact ? 34 : 40, Math.round(baseNodeH * resolvedZoom));
  const stationY = Math.max(20, nodeH - (compact ? 7 : 9));
  const trackStep = Math.max(
    compact ? 48 : 54,
    Math.round(baseTrackStep * resolvedZoom),
  );
  const lanePadding = Math.max(
    compact ? 3 : 4,
    Math.round(baseLanePadding * resolvedZoom),
  );
  const minimumLaneHeight = Math.max(
    nodeH + (compact ? 8 : 12),
    compact ? 0 : Math.round(baseMinimumLaneHeight * resolvedZoom),
  );
  const regionGap = Math.max(6, Math.round(baseRegionGap * resolvedZoom));
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
    const relevantInRegion = focusNodeIds
      ? inRegion.filter((movement) => focusNodeIds.has(movement.id))
      : inRegion;
    const relevance: NetworkRegionLane['relevance'] = focusNodeIds
      ? relevantInRegion.length > 0
        ? 'active'
        : 'context'
      : 'overview';
    // During focus, faded context stations remain as geographic context but
    // no longer reserve full collision tracks. This concentrates space in
    // the regions that actually participate in the selected subgraph.
    const movementsForTracks = focusNodeIds ? relevantInRegion : inRegion;
    const trackedIds = new Set(movementsForTracks.map((movement) => movement.id));
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
      let track = 0;
      if (trackedIds.has(movement.id)) {
        track = trackEnds.findIndex((end) => baseX >= end + minimumGap);
        if (track < 0) {
          track = trackEnds.length;
          trackEnds.push(baseX + baseNodeW);
        } else {
          trackEnds[track] = baseX + baseNodeW;
        }
      }
      return { movement, x, track };
    });

    const trackCount = trackEnds.length;
    const compactPadding = compact
      ? focusNodeIds
        ? 5
        : 8
      : Math.max(6, lanePadding);
    const contentHeight =
      nodeH + Math.max(0, trackCount - 1) * trackStep + compactPadding * 2;
    const contextHeight = nodeH + (compact ? 6 : 10);
    const height =
      relevance === 'context'
        ? contextHeight
        : Math.max(
            focusNodeIds ? nodeH + compactPadding * 2 : minimumLaneHeight,
            contentHeight,
          );
    lanes.push({
      region,
      top: laneTop,
      height,
      trackCount,
      visibleNodeCount: inRegion.length,
      relevantNodeCount: relevantInRegion.length,
      relevance,
    });
    for (const placement of placements) {
      positions.set(placement.movement.id, {
        x: placement.x,
        y:
          laneTop +
          (relevance === 'context' ? Math.max(0, (height - nodeH) / 2) : compactPadding) +
          placement.track * trackStep,
      });
    }
    laneTop += height + regionGap;
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
    stationY,
    axisW,
    headerH,
    pad,
    safePad,
    visualGutter,
    visualBounds,
    zoom: resolvedZoom,
  };
}
