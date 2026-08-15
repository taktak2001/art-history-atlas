import { describe, expect, it } from 'vitest';
import { movements, regionOrder, relationships } from '@/lib/dataset';
import {
  buildChronologicalNetworkLayout,
  clampNetworkZoom,
  getNetworkMovementBounds,
  networkNodeProminence,
  networkSemanticLevel,
  networkSemanticLevelForLod,
  selectNetworkOverviewMovements,
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

  it('reduces mobile overview to a balanced editorial set', () => {
    const overview = selectNetworkOverviewMovements(
      movements,
      relationships,
      12,
    );
    expect(overview).toHaveLength(12);
    expect(new Set(overview.map((movement) => movement.era)).size).toBeGreaterThanOrEqual(6);
    expect(new Set(overview.map((movement) => movement.regionIds[0])).size).toBeGreaterThanOrEqual(6);
    expect(overview.every((movement) => movement.visibilityLevel !== 'detailed')).toBe(true);
  });

  it('derives hub prominence from editorial priority and relation degree', () => {
    const renaissance = movements.find(
      (movement) => movement.id === 'italian-renaissance',
    )!;
    expect(networkNodeProminence(renaissance, relationships)).toBe('hub');
  });

  it('includes the full visual node box and safe gutter in focus bounds', () => {
    const selected = movements.filter((movement) =>
      ['italian-renaissance', 'baroque'].includes(movement.id),
    );
    const layout = buildChronologicalNetworkLayout({
      movements: selected,
      regionOrder,
      zoom: 1,
      compact: true,
    });
    const bounds = getNetworkMovementBounds(
      selected.map((movement) => movement.id),
      layout,
      32,
    )!;
    const left = Math.min(
      ...selected.map((movement) => layout.positions.get(movement.id)!.x),
    );
    const right = Math.max(
      ...selected.map(
        (movement) => layout.positions.get(movement.id)!.x + layout.nodeW,
      ),
    );
    expect(bounds.x).toBeLessThanOrEqual(left - 32);
    expect(bounds.x + bounds.width).toBeGreaterThanOrEqual(right + 32);
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
