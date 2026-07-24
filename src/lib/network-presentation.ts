import type { RelationKind, Relationship } from '@/lib/schema';

export type RelationLineStyle = {
  dasharray?: string;
  linecap: 'butt' | 'round';
  width: number;
  arrow: boolean;
};

export const RELATION_LINE_STYLE: Record<RelationKind, RelationLineStyle> = {
  succession: { linecap: 'round', width: 2.8, arrow: false },
  reaction: { dasharray: '9 6', linecap: 'butt', width: 2.8, arrow: false },
  influence: { dasharray: '18 8', linecap: 'butt', width: 2.8, arrow: false },
  contemporary: { dasharray: '1.5 6', linecap: 'round', width: 2.8, arrow: false },
  'regional-variant': { dasharray: '5 4', linecap: 'butt', width: 2.8, arrow: false },
  theoretical: { dasharray: '13 4 2 4', linecap: 'butt', width: 2.8, arrow: false },
  technical: { dasharray: '1 3.5', linecap: 'round', width: 2.6, arrow: false },
  revival: { dasharray: '9 5', linecap: 'butt', width: 2.8, arrow: true },
  'shared-idea': { dasharray: '2 6', linecap: 'round', width: 3, arrow: false },
};

export const MOBILE_PRIMARY_KINDS: RelationKind[] = [
  'succession',
  'reaction',
  'influence',
];

export const MOBILE_EDGE_LIMIT = 18;
export const MOBILE_NODE_LIMIT = 24;

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
