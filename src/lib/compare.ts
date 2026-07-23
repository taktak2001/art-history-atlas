import type { Movement } from '@/lib/schema';
import { getMovement, formatDateRange, REGION_LABELS } from '@/lib/dataset';

/** 比較表の行定義。各行はムーブメントから表示文字列を取り出す。 */
export type CompareRow = {
  key: string;
  label: string;
  get: (m: Movement) => string;
};

export const compareRows: CompareRow[] = [
  { key: 'dates', label: '年代', get: (m) => formatDateRange(m) },
  {
    key: 'region',
    label: '地域',
    get: (m) => m.regionIds.map((r) => REGION_LABELS[r]).join('・'),
  },
  { key: 'coreIdea', label: '中心思想', get: (m) => m.coreIdea },
  { key: 'social', label: '社会背景', get: (m) => m.socialContext },
  { key: 'reaction', label: '前時代への反応', get: (m) => m.reactionAgainst },
  { key: 'visual', label: '視覚的特徴', get: (m) => m.visualTraits },
  {
    key: 'materials',
    label: '技法・素材',
    get: (m) => `${m.technique}／${m.materials}`,
  },
  {
    key: 'market',
    label: 'パトロン・市場',
    get: (m) => `${m.patronage}／${m.marketExhibition}`,
  },
  { key: 'legacy', label: '後世への影響', get: (m) => m.legacy },
];

/** 比較対象IDの検証（存在する2〜4件のみ許可） */
export const MIN_COMPARE = 2;
export const MAX_COMPARE = 4;

export const parseCompareIds = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const valid = ids.filter((id) => getMovement(id));
  // 重複除去し、最大件数で切る
  return Array.from(new Set(valid)).slice(0, MAX_COMPARE);
};

export const canCompare = (ids: string[]): boolean =>
  ids.length >= MIN_COMPARE && ids.length <= MAX_COMPARE;

export const compareMovements = (ids: string[]): Movement[] =>
  ids.map((id) => getMovement(id)).filter((m): m is Movement => Boolean(m));
