import { describe, expect, it } from 'vitest';
import { movements, regionOrder, relationships } from '@/lib/dataset';
import {
  buildChronologicalNetworkLayout,
  clampNetworkZoom,
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
