import type { RelationKind, Relationship } from '@/lib/schema';

export type RelationLineStyle = {
  dasharray?: string;
  linecap: 'butt' | 'round';
  width: number;
  arrow: boolean;
};

export const RELATION_LINE_STYLE: Record<RelationKind, RelationLineStyle> = {
  succession: { linecap: 'round', width: 1.7, arrow: true },
  reaction: { dasharray: '9 6', linecap: 'butt', width: 1.7, arrow: true },
  influence: { dasharray: '18 8', linecap: 'butt', width: 1.7, arrow: true },
  contemporary: { dasharray: '1.5 6', linecap: 'round', width: 1.6, arrow: false },
  'regional-variant': { dasharray: '5 4', linecap: 'butt', width: 1.65, arrow: true },
  theoretical: { dasharray: '13 4 2 4', linecap: 'butt', width: 1.6, arrow: true },
  technical: { dasharray: '1 3.5', linecap: 'round', width: 1.55, arrow: true },
  revival: { dasharray: '9 5', linecap: 'butt', width: 1.65, arrow: true },
  'shared-idea': { dasharray: '2 6', linecap: 'round', width: 1.75, arrow: false },
};

/**
 * 「重要関係のみ」の編集上の定義。
 * 現行データでは、継承・反発・出典確認済みの主要な影響を全体像に不可欠な関係として扱う。
 * 収録件数が増えた段階で、影響には個別の editorialImportance を付与して細分化する。
 */
export const IMPORTANT_RELATION_KINDS: RelationKind[] = [
  'succession',
  'reaction',
  'influence',
];

export const MOBILE_PRIMARY_KINDS: RelationKind[] = [
  ...IMPORTANT_RELATION_KINDS,
];

export const MOBILE_EDGE_LIMIT = 18;
export const MOBILE_NODE_LIMIT = 24;

export function isImportantRelationship(
  relationship: Pick<Relationship, 'kind'>,
): boolean {
  return IMPORTANT_RELATION_KINDS.includes(relationship.kind);
}

/**
 * データの from は作用の起点、to は作用を受けた到達先。
 * 反発だけは自然な日本語の主語を to 側に置く。
 */
export function formatRelationshipStatement(
  relationship: Pick<Relationship, 'kind' | 'from' | 'to'>,
  movementName: (id: string) => string,
): string {
  const source = movementName(relationship.from);
  const target = movementName(relationship.to);

  if (relationship.kind === 'reaction') {
    return `${target}は${source}に反発した`;
  }

  return `${source}から${target}へ`;
}

export function limitMobileRelationships<T extends Relationship>(
  relationships: T[],
  edgeLimit = MOBILE_EDGE_LIMIT,
  nodeLimit = MOBILE_NODE_LIMIT,
): T[] {
  const nodeIds = new Set<string>();
  const result: T[] = [];

  for (const relationship of relationships) {
    const nextNodeIds = new Set(nodeIds);
    nextNodeIds.add(relationship.from);
    nextNodeIds.add(relationship.to);

    if (nextNodeIds.size > nodeLimit) continue;

    result.push(relationship);
    nodeIds.add(relationship.from);
    nodeIds.add(relationship.to);

    if (result.length >= edgeLimit) break;
  }

  return result;
}
