import { describe, expect, it } from 'vitest';
import { movements, regionOrder, relationships } from '@/lib/dataset';
import {
  buildChronologicalNetworkLayout,
  clampNetworkZoom,
  getNetworkFitZoom,
  getNetworkVisualBounds,
  NETWORK_OVERVIEW_EDITORIAL_ANCHORS,
  NETWORK_OVERVIEW_LABEL_LIMIT,
  NETWORK_OVERVIEW_NODE_LIMIT,
  NETWORK_OVERVIEW_ZOOM_MIN,
  networkNodeProminence,
  networkSemanticLevel,
  networkSemanticLevelForLod,
  selectNetworkOverviewMovements,
  selectNetworkOverviewLabelIds,
} from '@/lib/network-map-layout';

describe('chronological network map layout', () => {
  it('places later movements farther right on the shared time axis', () => {
    const selected = movements.filter((movement) =>
      ['italian-renaissance', 'baroque', 'cubism'].includes(movement.id),
    );
    const layout = buildChronologicalNetworkLayout({
      movements: selected,
      regionOrder,
      zoom: 1,
      compact: false,
    });

    expect(layout.positions.get('italian-renaissance')!.x).toBeLessThan(
      layout.positions.get('baroque')!.x,
    );
    expect(layout.positions.get('baroque')!.x).toBeLessThan(
      layout.positions.get('cubism')!.x,
    );
  });

  it('places different primary regions in separate vertical lanes', () => {
    const selected = movements.filter((movement) =>
      ['italian-renaissance', 'cubism', 'mono-ha'].includes(movement.id),
    );
    const layout = buildChronologicalNetworkLayout({
      movements: selected,
      regionOrder,
      zoom: 1,
      compact: false,
    });

    expect(layout.positions.get('italian-renaissance')!.y).not.toBe(
      layout.positions.get('cubism')!.y,
    );
    expect(layout.positions.get('cubism')!.y).not.toBe(
      layout.positions.get('mono-ha')!.y,
    );
  });

  it('uses additional tracks only to prevent overlap inside a region', () => {
    const selected = movements.filter((movement) =>
      ['impressionism', 'post-impressionism', 'cubism', 'surrealism'].includes(
        movement.id,
      ),
    );
    const layout = buildChronologicalNetworkLayout({
      movements: selected,
      regionOrder,
      zoom: 0.72,
      compact: true,
    });
    const france = layout.lanes.find((lane) => lane.region === 'france');

    expect(france).toBeDefined();
    expect(france!.trackCount).toBeGreaterThan(1);
    expect(new Set(selected.map((movement) => layout.positions.get(movement.id)!.y)).size)
      .toBeGreaterThan(1);
  });

  it('compacts unrelated mobile lanes while preserving related region order', () => {
    const selected = movements.filter((movement) =>
      ['italian-renaissance', 'baroque', 'impressionism', 'cubism'].includes(
        movement.id,
      ),
    );
    const overview = buildChronologicalNetworkLayout({
      movements: selected,
      regionOrder,
      zoom: 0.84,
      compact: true,
    });
    const focused = buildChronologicalNetworkLayout({
      movements: selected,
      regionOrder,
      zoom: 0.84,
      compact: true,
      focusNodeIds: new Set(['italian-renaissance', 'baroque']),
    });
    const overviewFrance = overview.lanes.find((lane) => lane.region === 'france')!;
    const focusedFrance = focused.lanes.find((lane) => lane.region === 'france')!;

    expect(focusedFrance.relevance).toBe('context');
    expect(focusedFrance.relevantNodeCount).toBe(0);
    expect(focusedFrance.height).toBeLessThan(overviewFrance.height);
    expect(focused.lanes.map((lane) => lane.region)).toEqual(
      overview.lanes.map((lane) => lane.region),
    );
  });
});

describe('network semantic zoom', () => {
  it('clamps zoom and maps it to overview, study, and detail levels', () => {
    expect(clampNetworkZoom(0.1)).toBe(0.18);
    expect(clampNetworkZoom(0.2)).toBe(0.2);
    expect(clampNetworkZoom(3)).toBe(1.6);
    expect(networkSemanticLevel(0.84)).toBe('overview');
    expect(networkSemanticLevel(1)).toBe('study');
    expect(networkSemanticLevel(1.4)).toBe('detail');
  });

  it('keeps information density independent from camera zoom', () => {
    expect(networkSemanticLevelForLod('core')).toBe('overview');
    expect(networkSemanticLevelForLod('standard')).toBe('study');
    expect(networkSemanticLevelForLod('detailed')).toBe('detail');
  });

  it('limits overview to an editorial set while preserving regional landmarks', () => {
    const degreeById = new Map<string, number>();
    for (const relationship of relationships) {
      degreeById.set(
        relationship.from,
        (degreeById.get(relationship.from) ?? 0) + 1,
      );
      degreeById.set(
        relationship.to,
        (degreeById.get(relationship.to) ?? 0) + 1,
      );
    }
    const overview = selectNetworkOverviewMovements(movements, degreeById);

    expect(overview).toHaveLength(NETWORK_OVERVIEW_NODE_LIMIT);
    expect(new Set(overview.map((movement) => movement.regionIds[0])).size).toBe(
      new Set(movements.map((movement) => movement.regionIds[0])).size,
    );
    expect(overview.map((movement) => movement.id)).toContain('italian-renaissance');

    const mobileOverview = selectNetworkOverviewMovements(
      movements,
      degreeById,
      12,
    );
    expect(mobileOverview).toHaveLength(12);
    expect(
      new Set(mobileOverview.map((movement) => movement.era)).size,
    ).toBeGreaterThanOrEqual(6);
    expect(
      new Set(mobileOverview.map((movement) => movement.regionIds[0])).size,
    ).toBeGreaterThanOrEqual(6);
  });

  it('uses five stable editorial labels while leaving every overview station present', () => {
    const degreeById = new Map<string, number>();
    for (const relationship of relationships) {
      degreeById.set(
        relationship.from,
        (degreeById.get(relationship.from) ?? 0) + 1,
      );
      degreeById.set(
        relationship.to,
        (degreeById.get(relationship.to) ?? 0) + 1,
      );
    }
    const overview = selectNetworkOverviewMovements(movements, degreeById, 16);
    const labels = selectNetworkOverviewLabelIds(overview, degreeById);

    expect(overview).toHaveLength(16);
    expect(labels).toHaveLength(NETWORK_OVERVIEW_LABEL_LIMIT);
    expect([...NETWORK_OVERVIEW_EDITORIAL_ANCHORS].every((id) => labels.has(id))).toBe(
      true,
    );
  });

  it('assigns stronger station hierarchy to connected representative movements', () => {
    const renaissance = movements.find(
      (movement) => movement.id === 'italian-renaissance',
    )!;
    const peripheral = movements.find((movement) => movement.id === 'land-art')!;

    expect(networkNodeProminence(renaissance, 7)).toBe('hub');
    expect(networkNodeProminence(peripheral, 0)).toBe('peripheral');
  });
});

describe('network visual bounds and camera fit', () => {
  it('includes the complete visual rectangles and a 32px gutter', () => {
    expect(
      getNetworkVisualBounds(
        [
          { x: 100, y: 80, width: 160, height: 60 },
          { x: 310, y: 160, width: 42, height: 18 },
        ],
        32,
      ),
    ).toEqual({
      minX: 68,
      minY: 48,
      maxX: 384,
      maxY: 210,
      width: 316,
      height: 162,
    });
  });

  it('derives overview zoom from the actual network viewport', () => {
    const bounds = getNetworkVisualBounds(
      [{ x: 0, y: 0, width: 1200, height: 620 }],
      32,
    );
    const zoom = getNetworkFitZoom({
      currentZoom: 1,
      bounds,
      viewportWidth: 1000,
      viewportHeight: 700,
      axisW: 142,
      headerH: 52,
      padding: 0,
    });

    expect(zoom).toBeCloseTo(0.678, 2);
  });

  it('lets Overview fit below the readable-label floor without changing Study', () => {
    const bounds = getNetworkVisualBounds(
      [{ x: 0, y: 0, width: 1800, height: 900 }],
      32,
    );
    const overviewZoom = getNetworkFitZoom({
      currentZoom: 0.18,
      bounds,
      viewportWidth: 390,
      viewportHeight: 520,
      axisW: 82,
      headerH: 42,
      padding: 8,
      minZoom: NETWORK_OVERVIEW_ZOOM_MIN,
    });
    const studyZoom = getNetworkFitZoom({
      currentZoom: 0.18,
      bounds,
      viewportWidth: 390,
      viewportHeight: 520,
      axisW: 88,
      headerH: 48,
      padding: 8,
    });

    expect(overviewZoom).toBeLessThan(0.18);
    expect(overviewZoom).toBeGreaterThanOrEqual(NETWORK_OVERVIEW_ZOOM_MIN);
    expect(studyZoom).toBe(0.18);
  });

  it('compacts only the dedicated Overview layout across all active regions', () => {
    const degreeById = new Map<string, number>();
    for (const relationship of relationships) {
      degreeById.set(
        relationship.from,
        (degreeById.get(relationship.from) ?? 0) + 1,
      );
      degreeById.set(
        relationship.to,
        (degreeById.get(relationship.to) ?? 0) + 1,
      );
    }
    const selected = selectNetworkOverviewMovements(movements, degreeById, 16);
    const regular = buildChronologicalNetworkLayout({
      movements: selected,
      regionOrder,
      zoom: 0.18,
      compact: true,
    });
    const overview = buildChronologicalNetworkLayout({
      movements: selected,
      regionOrder,
      zoom: 0.18,
      compact: true,
      overview: true,
    });

    expect(overview.lanes).toHaveLength(
      new Set(selected.map((movement) => movement.regionIds[0])).size,
    );
    expect(overview.canvasH).toBeLessThan(regular.canvasH);
    expect(overview.lanes.every((lane) => lane.height <= 50)).toBe(true);
  });

  it('keeps every node visual box inside the expanded canvas', () => {
    const selected = movements.filter((movement) =>
      ['italian-renaissance', 'abstract-expressionism', 'light-and-space'].includes(
        movement.id,
      ),
    );
    const layout = buildChronologicalNetworkLayout({
      movements: selected,
      regionOrder,
      zoom: 0.84,
      compact: false,
      visualGutter: 32,
    });

    expect(layout.visualGutter).toBe(32);
    expect(layout.visualBounds.minX).toBeGreaterThanOrEqual(0);
    expect(layout.visualBounds.minY).toBeGreaterThanOrEqual(0);
    expect(layout.canvasW - layout.visualBounds.maxX).toBeGreaterThanOrEqual(32);
    expect(layout.canvasH - layout.visualBounds.maxY).toBeGreaterThanOrEqual(32);
  });
});

describe('network editorial safeguards', () => {
  it('keeps Mono-ha and Arte Povera as a parallel comparison', () => {
    expect(
      relationships.find(
        (relationship) =>
          relationship.from === 'arte-povera' && relationship.to === 'mono-ha',
      ),
    ).toMatchObject({ kind: 'contemporary' });
  });

  it('does not present Light & Space and immersive digital as succession', () => {
    const relation = relationships.find(
      (relationship) =>
        relationship.from === 'light-and-space' &&
        relationship.to === 'immersive-digital',
    );
    expect(relation).toMatchObject({ kind: 'shared-idea' });
    expect(relation?.note).toContain('一本の発展史として結ばない');
  });
});
