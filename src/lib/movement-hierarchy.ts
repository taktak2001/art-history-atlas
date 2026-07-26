import { movements as defaultMovements } from '@/data/movements';
import type {
  Movement,
  Relationship,
  VisibilityLevel,
} from '@/lib/schema';

export const LOD_ORDER: Record<VisibilityLevel, number> = {
  core: 0,
  standard: 1,
  detailed: 2,
};

export const LOD_LEVELS: VisibilityLevel[] = ['core', 'standard', 'detailed'];

export type MovementGroup = {
  id: string;
  label: string;
  representativeMovementId: string;
  displayOrder: number;
};

/**
 * groupId は検索・縮約表示のための非因果的なまとまり。
 * 親子関係、継承、影響、反発は表さない。
 */
export const MOVEMENT_GROUPS: MovementGroup[] = [
  {
    id: 'renaissance-europe',
    label: 'ヨーロッパのルネサンス',
    representativeMovementId: 'italian-renaissance',
    displayOrder: 10,
  },
  {
    id: 'baroque-and-rococo',
    label: 'バロックとロココ',
    representativeMovementId: 'baroque',
    displayOrder: 20,
  },
  {
    id: 'impressionism-circle',
    label: '印象派周辺',
    representativeMovementId: 'impressionism',
    displayOrder: 30,
  },
  {
    id: 'early-avant-garde',
    label: '20世紀初頭の前衛',
    representativeMovementId: 'cubism',
    displayOrder: 40,
  },
  {
    id: 'postwar-reduction',
    label: '戦後の還元と拡張',
    representativeMovementId: 'minimalism',
    displayOrder: 50,
  },
  {
    id: 'postwar-japan',
    label: '戦後日本美術',
    representativeMovementId: 'gutai',
    displayOrder: 60,
  },
];

const movementSort = (a: Movement, b: Movement) =>
  (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
    (b.displayOrder ?? Number.MAX_SAFE_INTEGER) ||
  a.dates.start - b.dates.start ||
  a.nameJa.localeCompare(b.nameJa, 'ja');

export function parseMovementLod(
  raw: string | null | undefined,
  fallback: VisibilityLevel = 'core',
): VisibilityLevel {
  return raw === 'core' || raw === 'standard' || raw === 'detailed'
    ? raw
    : fallback;
}

/** 選択LODまでに含まれる項目だけを返す */
export function filterMovementsByLod(
  items: Movement[],
  lod: VisibilityLevel,
): Movement[] {
  const threshold = LOD_ORDER[lod];
  return items
    .filter((movement) => LOD_ORDER[movement.visibilityLevel] <= threshold)
    .sort(movementSort);
}

export function isMovementVisibleAtLod(
  movement: Movement,
  lod: VisibilityLevel,
): boolean {
  return LOD_ORDER[movement.visibilityLevel] <= LOD_ORDER[lod];
}

export function getMovementChildren(
  id: string,
  items: Movement[] = defaultMovements,
): Movement[] {
  return items.filter((movement) => movement.parentMovementId === id).sort(movementSort);
}

export function getMovementParent(
  id: string,
  items: Movement[] = defaultMovements,
): Movement | undefined {
  const movement = items.find((item) => item.id === id);
  return movement?.parentMovementId
    ? items.find((item) => item.id === movement.parentMovementId)
    : undefined;
}

export function getMovementGroup(
  id: string,
  items: Movement[] = defaultMovements,
): MovementGroup | undefined {
  const groupId = items.find((item) => item.id === id)?.groupId;
  return groupId ? MOVEMENT_GROUPS.find((group) => group.id === groupId) : undefined;
}

export function getGroupMovements(
  groupId: string,
  items: Movement[] = defaultMovements,
): Movement[] {
  return items.filter((movement) => movement.groupId === groupId).sort(movementSort);
}

export function getRepresentativeMovement(
  groupId: string,
  items: Movement[] = defaultMovements,
): Movement | undefined {
  const definition = MOVEMENT_GROUPS.find((group) => group.id === groupId);
  if (!definition) return undefined;
  return items.find((movement) => movement.id === definition.representativeMovementId);
}

export type MovementTreeNode = {
  movement: Movement;
  children: MovementTreeNode[];
};

export function buildMovementTree(items: Movement[]): MovementTreeNode[] {
  const byParent = new Map<string | undefined, Movement[]>();
  for (const movement of items) {
    const key = movement.parentMovementId;
    const siblings = byParent.get(key) ?? [];
    siblings.push(movement);
    byParent.set(key, siblings);
  }

  const visit = (movement: Movement, trail: Set<string>): MovementTreeNode => {
    if (trail.has(movement.id)) {
      return { movement, children: [] };
    }
    const nextTrail = new Set(trail).add(movement.id);
    return {
      movement,
      children: (byParent.get(movement.id) ?? [])
        .sort(movementSort)
        .map((child) => visit(child, nextTrail)),
    };
  };

  return (byParent.get(undefined) ?? []).sort(movementSort).map((root) => visit(root, new Set()));
}

export function flattenMovementTree(nodes: MovementTreeNode[]): Movement[] {
  return nodes.flatMap((node) => [
    node.movement,
    ...flattenMovementTree(node.children),
  ]);
}

export function hasMovementHierarchyCycle(items: Movement[]): boolean {
  const parents = new Map(
    items
      .filter((movement) => movement.parentMovementId)
      .map((movement) => [movement.id, movement.parentMovementId!]),
  );

  for (const movement of items) {
    const visited = new Set<string>();
    let current: string | undefined = movement.id;
    while (current) {
      if (visited.has(current)) return true;
      visited.add(current);
      current = parents.get(current);
    }
  }
  return false;
}

/** 親が非表示なら、最も近い表示中の祖先へ集約する */
export function getVisibleAncestor(
  id: string,
  lod: VisibilityLevel,
  items: Movement[] = defaultMovements,
): Movement | undefined {
  const byId = new Map(items.map((movement) => [movement.id, movement]));
  let current = byId.get(id);
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    if (isMovementVisibleAtLod(current, lod)) return current;
    visited.add(current.id);
    current = current.parentMovementId
      ? byId.get(current.parentMovementId)
      : undefined;
  }
  return undefined;
}

/**
 * 親がない非表示項目は、同じ groupId の表示中代表項目へ集約する。
 * 因果ではなくLOD上の縮約だけに使用する。
 */
export function getLodRepresentative(
  id: string,
  lod: VisibilityLevel,
  items: Movement[] = defaultMovements,
): Movement | undefined {
  const movement = items.find((item) => item.id === id);
  if (!movement) return undefined;
  if (isMovementVisibleAtLod(movement, lod)) return movement;

  const ancestor = getVisibleAncestor(id, lod, items);
  if (ancestor) return ancestor;
  if (!movement.groupId) return undefined;

  const representative = getRepresentativeMovement(movement.groupId, items);
  return representative && isMovementVisibleAtLod(representative, lod)
    ? representative
    : undefined;
}

export function groupMovementsForDisplay(items: Movement[]) {
  const grouped = new Map<string, Movement[]>();
  const ungrouped: Movement[] = [];
  for (const movement of [...items].sort(movementSort)) {
    if (!movement.groupId) {
      ungrouped.push(movement);
      continue;
    }
    const members = grouped.get(movement.groupId) ?? [];
    members.push(movement);
    grouped.set(movement.groupId, members);
  }
  return { grouped, ungrouped };
}

export type AggregatedRelationship = Relationship & {
  aggregateCount: number;
  originalRelationshipIds: string[];
  hasDirectRelationship: boolean;
};

/**
 * DOMへ描画するノード集合に合わせてエッジを縮約する。
 * 非表示端点は表示中の祖先、次に同グループの代表へ寄せる。
 */
export function aggregateRelationshipsForVisibleMovements(
  relationships: Relationship[],
  items: Movement[],
  visibleIds: Set<string>,
): AggregatedRelationship[] {
  const byId = new Map(items.map((movement) => [movement.id, movement]));

  const resolve = (id: string): string | undefined => {
    if (visibleIds.has(id)) return id;
    const visited = new Set<string>();
    let current = byId.get(id);
    while (current?.parentMovementId && !visited.has(current.id)) {
      visited.add(current.id);
      if (visibleIds.has(current.parentMovementId)) return current.parentMovementId;
      current = byId.get(current.parentMovementId);
    }
    const original = byId.get(id);
    if (!original?.groupId) return undefined;
    const representative = getRepresentativeMovement(original.groupId, items);
    return representative && visibleIds.has(representative.id)
      ? representative.id
      : undefined;
  };

  const buckets = new Map<string, AggregatedRelationship>();
  for (const relationship of relationships) {
    const from = resolve(relationship.from);
    const to = resolve(relationship.to);
    if (!from || !to || from === to) continue;
    const key = `${from}:${to}:${relationship.kind}`;
    const isDirect =
      relationship.from === from &&
      relationship.to === to;
    const existing = buckets.get(key);
    if (existing) {
      existing.aggregateCount += 1;
      existing.originalRelationshipIds.push(relationship.id);
      existing.hasDirectRelationship ||= isDirect;
      continue;
    }
    buckets.set(key, {
      ...relationship,
      id: `lod-${relationship.kind}-${from}-${to}`,
      from,
      to,
      aggregateCount: 1,
      originalRelationshipIds: [relationship.id],
      hasDirectRelationship: isDirect,
    });
  }

  const aggregated = [...buckets.values()];
  const pairsWithDirectRelationship = new Set(
    aggregated
      .filter((relationship) => relationship.hasDirectRelationship)
      .map((relationship) => `${relationship.from}:${relationship.to}`),
  );

  return aggregated.filter(
    (relationship) =>
      relationship.hasDirectRelationship ||
      !pairsWithDirectRelationship.has(
        `${relationship.from}:${relationship.to}`,
      ),
  );
}
