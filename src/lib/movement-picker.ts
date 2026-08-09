import { movements, searchDocs, formatDateRange } from './dataset';
import { ERA_LABELS, ERA_ORDER, REGION_LABELS } from './schema';
import type { EraId, Movement } from './schema';
import { filterMovementsByLod } from './movement-hierarchy';

/**
 * 検索可能なムーブメントピッカーの純粋ロジック。
 *
 * 比較ページ・ホーム検索・ネットワークのフォーカス選択・タイムラインのジャンプで
 * 共通して使えるよう、UIから独立させている。
 */

export const RECENT_STORAGE_KEY = 'aha:recent-movements';
/** 履歴はMovement IDのみ、最大8件。個人情報は保存しない */
export const RECENT_LIMIT = 8;

/**
 * ムーブメントを検索する。日本語名・英語名・別名に加え、
 * 作家・作品にヒットした場合もそのムーブメントを返す（既存の検索インデックスを再利用）。
 */
export function searchMovements(query: string): Movement[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const docs = searchDocs(trimmed);
  const ids = new Set<string>();
  for (const doc of docs) {
    if (doc.type === 'movement') ids.add(doc.id);
  }
  for (const movement of movements) {
    const hit = docs.some(
      (doc) =>
        (doc.type === 'artist' && movement.artistIds.includes(doc.id)) ||
        (doc.type === 'work' && movement.workIds.includes(doc.id)),
    );
    if (hit) ids.add(movement.id);
  }
  return movements.filter((movement) => ids.has(movement.id));
}

export type MovementGroup = { era: EraId; label: string; items: Movement[] };

/** 時代別にグループ化する（空の時代は落とす）。 */
export function groupMovementsByEra(items: Movement[]): MovementGroup[] {
  return ERA_ORDER.map((era) => ({
    era,
    label: ERA_LABELS[era],
    items: items
      .filter((movement) => movement.era === era)
      .sort((a, b) => a.dates.start - b.dates.start),
  })).filter((group) => group.items.length > 0);
}

/** 結果行の補助表記（年代｜主要地域）。 */
export function describeMovement(movement: Movement): string {
  const regions = movement.regionIds
    .slice(0, 2)
    .map((region) => REGION_LABELS[region])
    .join('・');
  return `${formatDateRange(movement)}｜${regions}`;
}

/**
 * 検索文字列が空のときの初期表示。
 * 最近選んだもの → 基本LODの主要ムーブメント の順で、重複なく返す。
 */
export function getInitialMovements(recentIds: string[]): Movement[] {
  const byId = new Map(movements.map((movement) => [movement.id, movement]));
  const recent = recentIds
    .map((id) => byId.get(id))
    .filter((movement): movement is Movement => Boolean(movement));
  const recentIdSet = new Set(recent.map((movement) => movement.id));
  const core = filterMovementsByLod(movements, 'core').filter(
    (movement) => !recentIdSet.has(movement.id),
  );
  return [...recent, ...core];
}

/** 履歴の読み出し（壊れた値は無視して空配列にする）。 */
export function readRecentIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = new Set(movements.map((movement) => movement.id));
    return parsed
      .filter((id): id is string => typeof id === 'string' && valid.has(id))
      .slice(0, RECENT_LIMIT);
  } catch {
    return [];
  }
}

/** 履歴の更新（最新を先頭に、重複を除いて上限まで）。 */
export function pushRecentId(current: string[], id: string): string[] {
  return [id, ...current.filter((item) => item !== id)].slice(0, RECENT_LIMIT);
}

export type SelectionState = {
  ids: string[];
  max: number;
};

/** 追加可能か（重複・上限を判定）。 */
export function canAdd(state: SelectionState, id: string): boolean {
  return !state.ids.includes(id) && state.ids.length < state.max;
}

/** 追加（選択順を保つ。重複・上限超過は現状のまま返す）。 */
export function addSelection(state: SelectionState, id: string): string[] {
  return canAdd(state, id) ? [...state.ids, id] : state.ids;
}

/** 解除。 */
export function removeSelection(state: SelectionState, id: string): string[] {
  return state.ids.filter((item) => item !== id);
}
