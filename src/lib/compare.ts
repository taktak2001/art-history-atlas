import type { Movement } from '@/lib/schema';
import { getMovement, formatDateRange, REGION_LABELS } from '@/lib/dataset';

/** 比較表の行定義。各行はムーブメントから表示文字列を取り出す。 */
export type CompareRow = {
  key: string;
  label: string;
  get: (m: Movement) => string;
};

export type CompareSection = {
  key: 'overview' | 'background' | 'works' | 'institution' | 'influence';
  label: string;
  rows: CompareRow[];
  includesRepresentativeWorks?: boolean;
};

const overviewRows: CompareRow[] = [
  { key: 'dates', label: '年代', get: (m) => formatDateRange(m) },
  {
    key: 'region',
    label: '地域',
    get: (m) => m.regionIds.map((r) => REGION_LABELS[r]).join('・'),
  },
];

const backgroundRows: CompareRow[] = [
  { key: 'coreIdea', label: '思想', get: (m) => m.coreIdea },
  { key: 'social', label: '社会背景', get: (m) => m.socialContext },
  { key: 'reaction', label: '前時代への反応', get: (m) => m.reactionAgainst },
];

const workRows: CompareRow[] = [
  { key: 'visual', label: '視覚的特徴', get: (m) => m.visualTraits },
  {
    key: 'materials',
    label: '技法・素材',
    get: (m) => `${m.technique}／${m.materials}`,
  },
];

const institutionRows: CompareRow[] = [
  {
    key: 'market',
    label: 'パトロン・市場',
    get: (m) => `${m.patronage}／${m.marketExhibition}`,
  },
];

const influenceRows: CompareRow[] = [
  { key: 'legacy', label: '後世への影響', get: (m) => m.legacy },
];

export const compareSections: CompareSection[] = [
  { key: 'overview', label: '基本情報', rows: overviewRows },
  { key: 'background', label: '背景', rows: backgroundRows },
  {
    key: 'works',
    label: '作品',
    rows: workRows,
    includesRepresentativeWorks: true,
  },
  { key: 'institution', label: '制度', rows: institutionRows },
  { key: 'influence', label: '影響', rows: influenceRows },
];

export const compareRows: CompareRow[] = compareSections.flatMap(
  (section) => section.rows,
);

/** 比較対象へ割り当てる、紙面になじむ識別色。RGB値はCSS変数で共用する。 */
export const COMPARE_ACCENTS = [
  '155 81 57',
  '62 112 108',
  '103 91 143',
  '151 112 52',
] as const;

export type CompareAccent = (typeof COMPARE_ACCENTS)[number];
export type CompareAccentMap = Record<string, CompareAccent>;

/** 比較対象IDの検証（存在する2〜4件のみ許可） */
export const MIN_COMPARE = 2;
export const MAX_COMPARE = 4;

/**
 * 既存の割り当てを保ちながら、比較対象へ重複しない色を割り当てる。
 * 対象を削除しても残った列の色が入れ替わらないため、チップと表を追いやすい。
 */
export const assignCompareAccents = (
  ids: string[],
  current: CompareAccentMap = {},
): CompareAccentMap => {
  const next: CompareAccentMap = {};
  const used = new Set<CompareAccent>();

  ids.forEach((id) => {
    const accent = current[id];
    if (accent && !used.has(accent)) {
      next[id] = accent;
      used.add(accent);
    }
  });

  ids.forEach((id) => {
    if (next[id]) return;
    const accent = COMPARE_ACCENTS.find((candidate) => !used.has(candidate));
    if (!accent) return;
    next[id] = accent;
    used.add(accent);
  });

  return next;
};

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
