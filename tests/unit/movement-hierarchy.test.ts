import { describe, expect, it } from 'vitest';
import { movements } from '@/data/movements';
import type { Movement } from '@/lib/schema';
import {
  MOVEMENT_GROUPS,
  buildMovementTree,
  filterMovementsByLod,
  flattenMovementTree,
  getMovementChildren,
  getMovementGroup,
  getMovementParent,
  getRepresentativeMovement,
  hasMovementHierarchyCycle,
  parseMovementLod,
} from '@/lib/movement-hierarchy';

const fixture = (
  id: string,
  visibilityLevel: Movement['visibilityLevel'],
  parentMovementId?: string,
): Movement => ({
  ...movements[0],
  id,
  nameJa: id,
  nameEn: id,
  aliases: [],
  visibilityLevel,
  parentMovementId,
  groupId: undefined,
  displayOrder: id === 'parent' ? 1 : 2,
});

describe('Movement LOD', () => {
  it('core / standard / detailedを累積表示する', () => {
    const core = filterMovementsByLod(movements, 'core');
    const standard = filterMovementsByLod(movements, 'standard');
    const detailed = filterMovementsByLod(movements, 'detailed');

    expect(core).toHaveLength(24);
    expect(standard).toHaveLength(30);
    expect(detailed).toHaveLength(30);
    expect(core.every((movement) => movement.visibilityLevel === 'core')).toBe(true);
  });

  it('URL値を安全に解釈する', () => {
    expect(parseMovementLod('standard')).toBe('standard');
    expect(parseMovementLod('unknown', 'detailed')).toBe('detailed');
  });
});

describe('Movement 親子階層', () => {
  const parent = fixture('parent', 'core');
  const child = fixture('child', 'standard', 'parent');
  const grandchild = fixture('grandchild', 'detailed', 'child');
  const items = [grandchild, child, parent];

  it('親と子を取得する', () => {
    expect(getMovementChildren('parent', items).map((movement) => movement.id)).toEqual([
      'child',
    ]);
    expect(getMovementParent('child', items)?.id).toBe('parent');
  });

  it('ツリーを構築し年代順のフラット列へ戻せる', () => {
    const tree = buildMovementTree(items);
    expect(tree).toHaveLength(1);
    expect(tree[0].children[0].children[0].movement.id).toBe('grandchild');
    expect(flattenMovementTree(tree).map((movement) => movement.id)).toEqual([
      'parent',
      'child',
      'grandchild',
    ]);
  });

  it('循環参照を検出する', () => {
    const a = fixture('a', 'core', 'b');
    const b = fixture('b', 'standard', 'a');
    expect(hasMovementHierarchyCycle([a, b])).toBe(true);
    expect(hasMovementHierarchyCycle(items)).toBe(false);
  });
});

describe('Movement グループ', () => {
  it('グループと代表ムーブメントを取得する', () => {
    expect(getMovementGroup('mannerism')?.id).toBe('renaissance-europe');
    expect(getRepresentativeMovement('renaissance-europe')?.id).toBe(
      'italian-renaissance',
    );
    expect(MOVEMENT_GROUPS).toHaveLength(6);
  });
});
