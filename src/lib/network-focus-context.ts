import type { Movement, Relationship, VisibilityLevel } from './schema';

/**
 * 関係ネットワークの表示範囲。
 * - focus: 選択ムーブメントの直接関係（1ホップ）だけを表示する
 * - important: 重要関係のみ
 * - all: すべて
 */
export type RelationScope = 'focus' | 'important' | 'all';

const SCOPES: RelationScope[] = ['focus', 'important', 'all'];

export function parseRelationScope(
  raw: string | null,
  fallback: RelationScope,
): RelationScope {
  return SCOPES.includes(raw as RelationScope) ? (raw as RelationScope) : fallback;
}

/** focus ノードに直接つながる関係（1ホップ）。2ホップ以上へは広げない。 */
export function getDirectEdges(
  relationships: Relationship[],
  focusId: string,
): Relationship[] {
  return relationships.filter(
    (edge) => edge.from === focusId || edge.to === focusId,
  );
}

/** focus ノード自身と、直接つながるノードのID。 */
export function getDirectNodeIds(
  directEdges: Relationship[],
  focusId: string,
): Set<string> {
  return new Set<string>([
    focusId,
    ...directEdges.flatMap((edge) => [edge.from, edge.to]),
  ]);
}

const LOD_RANK: Record<VisibilityLevel, number> = {
  core: 0,
  standard: 1,
  detailed: 2,
};

/** 与えられたムーブメントをすべて表示するために必要な最小のLOD。 */
export function getHighestVisibilityLevel(
  items: Pick<Movement, 'visibilityLevel'>[],
): VisibilityLevel {
  return items.reduce<VisibilityLevel>(
    (acc, item) =>
      LOD_RANK[item.visibilityLevel] > LOD_RANK[acc] ? item.visibilityLevel : acc,
    'core',
  );
}

export type FocusContext = {
  focusId: string;
  /** focus に直接つながる関係 */
  directEdges: Relationship[];
  /** focus 自身を含む、直接関係するノードのID */
  directNodeIds: Set<string>;
  /** 直接関係を欠落なく表示するために必要な最小LOD */
  requiredLod: VisibilityLevel;
  /** focus を除いた関連ノード数 */
  relatedNodeCount: number;
  /** 直接関係に実際に現れる関係タイプ */
  kinds: Relationship['kind'][];
};

/**
 * 詳細ページから ?focus= で遷移したときの文脈を解決する。
 * 無効な focus は null を返し、呼び出し側で通常表示へフォールバックさせる。
 */
export function resolveFocusContext(
  focusId: string | null,
  movements: Movement[],
  relationships: Relationship[],
): FocusContext | null {
  if (!focusId) return null;
  if (!movements.some((movement) => movement.id === focusId)) return null;

  const directEdges = getDirectEdges(relationships, focusId);
  const directNodeIds = getDirectNodeIds(directEdges, focusId);
  const directMovements = movements.filter((movement) =>
    directNodeIds.has(movement.id),
  );

  return {
    focusId,
    directEdges,
    directNodeIds,
    requiredLod: getHighestVisibilityLevel(directMovements),
    relatedNodeCount: Math.max(directNodeIds.size - 1, 0),
    kinds: [...new Set(directEdges.map((edge) => edge.kind))],
  };
}
