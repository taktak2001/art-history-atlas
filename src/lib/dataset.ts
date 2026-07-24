import {
  dataset,
  movements,
  artists,
  works,
  relationships,
  sources,
} from '@/data';
import {
  ERA_ORDER,
  ERA_LABELS,
  REGION_LABELS,
  CLASSIFICATION_LABELS,
  RELATION_LABELS,
  VISIBILITY_LEVEL_LABELS,
  type Movement,
  type Artist,
  type Work,
  type Relationship,
  type Source,
  type EraId,
  type RegionId,
} from '@/lib/schema';

export {
  dataset,
  movements,
  artists,
  works,
  relationships,
  sources,
  ERA_ORDER,
  ERA_LABELS,
  REGION_LABELS,
  CLASSIFICATION_LABELS,
  RELATION_LABELS,
  VISIBILITY_LEVEL_LABELS,
};

/* --- 参照ヘルパー --- */
const movementById = new Map(movements.map((m) => [m.id, m]));
const artistById = new Map(artists.map((a) => [a.id, a]));
const workById = new Map(works.map((w) => [w.id, w]));
const sourceById = new Map(sources.map((s) => [s.id, s]));

export const getMovement = (id: string): Movement | undefined => movementById.get(id);
export const getArtist = (id: string): Artist | undefined => artistById.get(id);
export const getWork = (id: string): Work | undefined => workById.get(id);
export const getSource = (id: string): Source | undefined => sourceById.get(id);

export const getSources = (ids: string[]): Source[] =>
  ids.map((id) => sourceById.get(id)).filter((s): s is Source => Boolean(s));

/** ムーブメントを年代順（開始年）に並べる */
export const movementsChronological = (): Movement[] =>
  [...movements].sort((a, b) => a.dates.start - b.dates.start);

/**
 * 指定ムーブメントの作家。作家側の movementIds から導出する
 * （movement.artistIds への手動登録に依存しない）。
 */
export const artistsOf = (m: Movement): Artist[] =>
  artists.filter((a) => a.movementIds.includes(m.id));

/**
 * 指定ムーブメントの作品。作品側の movementIds から導出し、
 * 画像付きの作品を先頭へ（詳細グリッドで代表作が見えやすいように）。
 */
export const worksOf = (m: Movement): Work[] =>
  works
    .filter((w) => w.movementIds.includes(m.id))
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));

/** 指定ムーブメントに接続する関係（両方向） */
export const relationshipsOf = (id: string): Relationship[] =>
  relationships.filter((r) => r.from === id || r.to === id);

export const outgoingRelationships = (id: string): Relationship[] =>
  relationships.filter((r) => r.from === id);

export const incomingRelationships = (id: string): Relationship[] =>
  relationships.filter((r) => r.to === id);

/* --- 時代・地域の軸 --- */
export const eras: EraId[] = ERA_ORDER;
export const regionOrder: RegionId[] = [
  'mediterranean',
  'italy',
  'netherlands',
  'france',
  'germany',
  'britain',
  'spain',
  'america',
  'japan',
  'east-asia',
  'pan-european',
  'global',
  'other',
];

/** マトリクス（時代×地域）のセル：各時代・地域に該当するムーブメント */
export const matrixCell = (era: EraId, region: RegionId): Movement[] =>
  movements.filter((m) => m.era === era && m.regionIds.includes(region));

/** 実際に使われている地域のみ（空行を避ける） */
export const activeRegions = (): RegionId[] =>
  regionOrder.filter((r) => movements.some((m) => m.regionIds.includes(r)));

/* --- 検索インデックス --- */
export type SearchDoc = {
  id: string;
  type: 'movement' | 'artist' | 'work';
  slug: string;
  title: string;
  subtitle: string;
  haystack: string;
};

let cachedIndex: SearchDoc[] | null = null;

/** 全エンティティを横断する軽量な検索ドキュメントを構築（クライアントで完結） */
export const buildSearchIndex = (): SearchDoc[] => {
  if (cachedIndex) return cachedIndex;
  const docs: SearchDoc[] = [];

  for (const m of movements) {
    docs.push({
      id: m.id,
      type: 'movement',
      slug: m.id,
      title: m.nameJa,
      subtitle: m.nameEn,
      haystack: [
        m.nameJa,
        m.nameEn,
        ...m.aliases,
        m.summary,
        m.coreIdea,
        m.technique,
        m.materials,
        ...m.keywords,
        ...m.regionIds.map((r) => REGION_LABELS[r]),
        CLASSIFICATION_LABELS[m.classification],
      ]
        .join(' ')
        .toLowerCase(),
    });
  }
  for (const a of artists) {
    docs.push({
      id: a.id,
      type: 'artist',
      slug: a.id,
      title: a.nameJa,
      subtitle: a.nameOriginal ?? '',
      haystack: [a.nameJa, a.nameOriginal ?? '', a.bio, a.country]
        .join(' ')
        .toLowerCase(),
    });
  }
  for (const w of works) {
    docs.push({
      id: w.id,
      type: 'work',
      slug: w.id,
      title: w.titleJa,
      subtitle: w.creatorName,
      haystack: [w.titleJa, w.titleOriginal ?? '', w.creatorName, w.medium, w.description]
        .join(' ')
        .toLowerCase(),
    });
  }
  cachedIndex = docs;
  return docs;
};

/** シンプルな部分一致検索（全語をAND） */
export const searchDocs = (query: string): SearchDoc[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return buildSearchIndex().filter((doc) =>
    terms.every((t) => doc.haystack.includes(t)),
  );
};

/** 年代を人間可読の表記に（紀元前対応） */
export const formatYear = (year: number): string =>
  year < 0 ? `前${Math.abs(year)}年` : `${year}年`;

export const formatDateRange = (m: Movement): string => {
  const start = formatYear(m.dates.start);
  const end = m.dates.end === null ? '現在' : formatYear(m.dates.end);
  const c = m.dates.circa ? '頃' : '';
  return `${start}${c} – ${end}${c && m.dates.end !== null ? '頃' : ''}`;
};
