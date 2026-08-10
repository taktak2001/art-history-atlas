import { describe, expect, it } from 'vitest';
import { movements, regionOrder, relationships } from '@/lib/dataset';
import {
  buildChronologicalNetworkLayout,
  clampNetworkZoom,
  getNetworkFitZoom,
  getNetworkVisualBounds,
  networkSemanticLevel,
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
    expect(clampNetworkZoom(3)).toBe(1.6);
    expect(networkSemanticLevel(0.84)).toBe('overview');
    expect(networkSemanticLevel(1)).toBe('study');
    expect(networkSemanticLevel(1.4)).toBe('detail');
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
