import { describe, it, expect } from 'vitest';
import { movements, relationships } from '@/lib/dataset';
import {
  getDirectEdges,
  getDirectNodeIds,
  getHighestVisibilityLevel,
  parseRelationScope,
  resolveFocusContext,
} from '@/lib/network-focus-context';
import type { Movement, Relationship } from '@/lib/schema';

const movement = (
  id: string,
  visibilityLevel: Movement['visibilityLevel'],
): Pick<Movement, 'visibilityLevel'> & { id: string } => ({ id, visibilityLevel });

const edge = (id: string, from: string, to: string, kind: Relationship['kind']) =>
  ({ id, from, to, kind }) as Relationship;

describe('network focus context', () => {
  const edges = [
    edge('e1', 'a', 'b', 'influence'),
    edge('e2', 'c', 'a', 'succession'),
    edge('e3', 'b', 'c', 'reaction'), // a に無関係
    edge('e4', 'a', 'd', 'regional-variant'),
  ];

  it('focus に直接つながる関係だけを取り出す（1ホップ）', () => {
    const direct = getDirectEdges(edges, 'a');
    expect(direct.map((item) => item.id)).toEqual(['e1', 'e2', 'e4']);
    // 2ホップ（b–c）は含めない
    expect(direct.some((item) => item.id === 'e3')).toBe(false);
  });

  it('focus 自身を含む直接関係ノードIDを作る', () => {
    const direct = getDirectEdges(edges, 'a');
    expect([...getDirectNodeIds(direct, 'a')].sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('focus に関係が無い場合は自分だけになる', () => {
    const direct = getDirectEdges(edges, 'z');
    expect(direct).toEqual([]);
    expect([...getDirectNodeIds(direct, 'z')]).toEqual(['z']);
  });

  describe('必要な最小LODを選ぶ', () => {
    it('すべて core なら 基本(core)', () => {
      expect(
        getHighestVisibilityLevel([movement('a', 'core'), movement('b', 'core')]),
      ).toBe('core');
    });

    it('standard を含むなら 充実(standard)', () => {
      expect(
        getHighestVisibilityLevel([
          movement('a', 'core'),
          movement('b', 'standard'),
        ]),
      ).toBe('standard');
    });

    it('detailed を含むなら すべて(detailed)', () => {
      expect(
        getHighestVisibilityLevel([
          movement('a', 'core'),
          movement('b', 'standard'),
          movement('c', 'detailed'),
        ]),
      ).toBe('detailed');
    });

    it('不要に detailed へ上げない', () => {
      expect(
        getHighestVisibilityLevel([
          movement('a', 'standard'),
          movement('b', 'standard'),
        ]),
      ).toBe('standard');
    });
  });

  describe('resolveFocusContext', () => {
    it('無効な focus は null（通常表示へフォールバック）', () => {
      expect(resolveFocusContext('no-such-movement', movements, relationships)).toBeNull();
      expect(resolveFocusContext(null, movements, relationships)).toBeNull();
    });

    it('実データで直接関係・必要LOD・関係タイプを解決する', () => {
      const context = resolveFocusContext(
        'japanese-ink-painting',
        movements,
        relationships,
      );
      expect(context).not.toBeNull();
      const resolved = context!;

      // 直接関係はすべて focus を含む
      expect(resolved.directEdges.length).toBeGreaterThan(0);
      for (const item of resolved.directEdges) {
        expect(
          item.from === 'japanese-ink-painting' || item.to === 'japanese-ink-painting',
        ).toBe(true);
      }

      // ノード集合は focus を含み、関連ノード数と整合する
      expect(resolved.directNodeIds.has('japanese-ink-painting')).toBe(true);
      expect(resolved.relatedNodeCount).toBe(resolved.directNodeIds.size - 1);

      // 直接関係ノードは requiredLod で全件表示できる
      const rank = { core: 0, standard: 1, detailed: 2 } as const;
      for (const item of movements.filter((m) => resolved.directNodeIds.has(m.id))) {
        expect(rank[item.visibilityLevel]).toBeLessThanOrEqual(rank[resolved.requiredLod]);
      }

      // 関係タイプは直接関係に現れるものだけ
      expect(resolved.kinds.length).toBeGreaterThan(0);
      expect(new Set(resolved.kinds).size).toBe(resolved.kinds.length);
    });

    it('importance に関係なく直接エッジを落とさない', () => {
      const context = resolveFocusContext(
        'japanese-ink-painting',
        movements,
        relationships,
      )!;
      const expected = relationships.filter(
        (item) =>
          item.from === 'japanese-ink-painting' || item.to === 'japanese-ink-painting',
      );
      expect(context.directEdges.length).toBe(expected.length);
    });
  });

  describe('parseRelationScope', () => {
    it('有効な値をそのまま返す', () => {
      expect(parseRelationScope('focus', 'important')).toBe('focus');
      expect(parseRelationScope('all', 'important')).toBe('all');
      expect(parseRelationScope('important', 'focus')).toBe('important');
    });

    it('不正・未指定はフォールバックする', () => {
      expect(parseRelationScope(null, 'important')).toBe('important');
      expect(parseRelationScope('bogus', 'focus')).toBe('focus');
    });
  });
});
