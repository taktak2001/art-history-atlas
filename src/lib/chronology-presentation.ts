import {
  ERA_LABELS,
  REGION_LABELS,
  RELATION_LABELS,
  type EraId,
  type Movement,
  type RelationKind,
  type Relationship,
  type Work,
} from '@/lib/schema';

export type ChronologyEraTone =
  | 'earth'
  | 'sacred'
  | 'humanist'
  | 'court'
  | 'industrial'
  | 'avant-garde'
  | 'material'
  | 'digital';

export type ChronologyEra = {
  id: EraId;
  label: string;
  range: string;
  catchphrase: string;
  tone: ChronologyEraTone;
};

export const CHRONOLOGY_ERAS: ChronologyEra[] = [
  {
    id: 'prehistoric-ancient',
    label: ERA_LABELS['prehistoric-ancient'],
    range: '前40000年頃〜前323年',
    catchphrase: '像を刻み、世界に秩序を与えはじめた時代',
    tone: 'earth',
  },
  {
    id: 'medieval',
    label: ERA_LABELS.medieval,
    range: '313〜1453年',
    catchphrase: '光と象徴で、見えない世界を形にした時代',
    tone: 'sacred',
  },
  {
    id: 'renaissance',
    label: ERA_LABELS.renaissance,
    range: '1400〜1600年頃',
    catchphrase: '人間と世界を、観察と比例から捉え直した時代',
    tone: 'humanist',
  },
  {
    id: 'baroque-rococo',
    label: ERA_LABELS['baroque-rococo'],
    range: '1600〜1830年頃',
    catchphrase: '権力、信仰、市民生活が多様な舞台を生んだ時代',
    tone: 'court',
  },
  {
    id: 'nineteenth',
    label: ERA_LABELS.nineteenth,
    range: '1800〜1910年頃',
    catchphrase: '革命と都市の速度が、見ることを更新した時代',
    tone: 'industrial',
  },
  {
    id: 'modern',
    label: ERA_LABELS.modern,
    range: '1907〜1950年頃',
    catchphrase: '既成の現実を解体し、芸術の前提を問い直した時代',
    tone: 'avant-garde',
  },
  {
    id: 'postwar',
    label: ERA_LABELS.postwar,
    range: '1943〜1980年頃',
    catchphrase: '物質、行為、制度へ作品の領域を広げた時代',
    tone: 'material',
  },
  {
    id: 'contemporary',
    label: ERA_LABELS.contemporary,
    range: '1980年代〜現在',
    catchphrase: '地域と媒体を横断し、鑑賞の場そのものを組み替える時代',
    tone: 'digital',
  },
];

export type HistoricEvent = {
  id: string;
  era: EraId;
  year: number;
  yearLabel: string;
  title: string;
  summary: string;
  impact: string;
  affectedMovementIds: string[];
};

export const HISTORIC_EVENTS: HistoricEvent[] = [
  {
    id: 'christianity-recognized',
    era: 'medieval',
    year: 313,
    yearLabel: '313',
    title: 'キリスト教公認',
    summary: 'ミラノ勅令を契機に、キリスト教共同体が公的な礼拝空間を築けるようになった。',
    impact: '大規模な聖堂建築と、信仰を伝える図像体系の形成を促した。',
    affectedMovementIds: ['early-christian-byzantine'],
  },
  {
    id: 'printing-press',
    era: 'renaissance',
    year: 1450,
    yearLabel: '1450頃',
    title: '活版印刷術の普及',
    summary: '文字と図像を複製し、知識を広い地域へ届ける基盤が整った。',
    impact: '版画、図像、理論書の流通を通じて北方とイタリアの表現交流を加速させた。',
    affectedMovementIds: ['northern-renaissance', 'italian-renaissance'],
  },
  {
    id: 'age-of-exploration',
    era: 'renaissance',
    year: 1492,
    yearLabel: '1492',
    title: '大航海時代の進展',
    summary: '航海と交易の拡大が、世界像と物質文化の範囲を急速に広げた。',
    impact: '異文化の物品と情報が集積する一方、植民地支配を伴う新たな視覚秩序も生んだ。',
    affectedMovementIds: ['northern-renaissance', 'baroque'],
  },
  {
    id: 'reformation',
    era: 'renaissance',
    year: 1517,
    yearLabel: '1517',
    title: '宗教改革',
    summary: '西方キリスト教世界の分裂が、宗教像の役割と制作環境を大きく変えた。',
    impact: '対抗宗教改革の劇的な宗教美術と、プロテスタント圏の世俗画市場を方向づけた。',
    affectedMovementIds: ['baroque', 'dutch-golden-age'],
  },
  {
    id: 'industrial-revolution',
    era: 'baroque-rococo',
    year: 1760,
    yearLabel: '1760頃',
    title: '産業革命',
    summary: '機械化、都市化、労働環境の変化が日常の時間と風景を作り替えた。',
    impact: '同時代の労働と都市を描く写実主義、近代生活を捉える印象派の背景となった。',
    affectedMovementIds: ['realism', 'impressionism'],
  },
  {
    id: 'photography',
    era: 'nineteenth',
    year: 1839,
    yearLabel: '1839',
    title: '写真の発明公表',
    summary: '光学像を定着させる技術が公表され、絵画と現実の関係が再検討された。',
    impact: '瞬間、構図、同時代性をめぐる問いを写実主義と印象派へ投げかけた。',
    affectedMovementIds: ['realism', 'impressionism'],
  },
  {
    id: 'world-war-one',
    era: 'modern',
    year: 1914,
    yearLabel: '1914',
    title: '第一次世界大戦',
    summary: '総力戦が進歩への信頼を崩し、芸術と社会の関係を根底から揺さぶった。',
    impact: '反芸術を掲げるダダと、戦後の無意識探究へ向かう前衛の土壌となった。',
    affectedMovementIds: ['dada', 'surrealism'],
  },
  {
    id: 'world-war-two',
    era: 'modern',
    year: 1939,
    yearLabel: '1939',
    title: '第二次世界大戦',
    summary: '戦争と亡命によって芸術家、思想、制作拠点の国際的な移動が進んだ。',
    impact: '戦後のニューヨークと日本で、身体、物質、自由を問い直す表現を促した。',
    affectedMovementIds: ['abstract-expressionism', 'gutai'],
  },
  {
    id: 'computer',
    era: 'postwar',
    year: 1946,
    yearLabel: '1946',
    title: '電子計算機の登場',
    summary: '計算と情報処理を機械化する基盤が、社会と表現媒体に加わった。',
    impact: '後のアルゴリズム表現、映像環境、没入型デジタル作品へつながる技術的条件を整えた。',
    affectedMovementIds: ['immersive-digital'],
  },
  {
    id: 'internet',
    era: 'contemporary',
    year: 1989,
    yearLabel: '1989',
    title: 'インターネット時代の始動',
    summary: 'ネットワークを介した情報共有が、制作、流通、鑑賞の場所を再編した。',
    impact: 'デジタル環境を作品空間として扱う実践と、境界を越える共同制作を後押しした。',
    affectedMovementIds: ['immersive-digital'],
  },
];

export type ChronologyTag = {
  kind: '地域' | '主題' | '技法' | '作品' | '背景';
  value: string;
};

export type MovementCause = {
  label: string;
  detail: string;
};

export type MovementConnection = {
  relationship: Relationship;
  label: string;
  description: string;
};

const DISPLAYED_RELATION_KINDS: RelationKind[] = [
  'succession',
  'reaction',
  'influence',
];

const PREFERRED_CAUSE_EVENT: Partial<Record<string, string>> = {
  baroque: 'reformation',
  realism: 'industrial-revolution',
  impressionism: 'photography',
  dada: 'world-war-one',
  'abstract-expressionism': 'world-war-two',
  'immersive-digital': 'internet',
};

const PREFERRED_NEXT_MOVEMENT: Partial<Record<string, string>> = {
  'italian-renaissance': 'mannerism',
};

const NEXT_RELATION_PRIORITY: Record<RelationKind, number> = {
  succession: 0,
  reaction: 1,
  influence: 2,
  'regional-variant': 3,
  revival: 4,
  technical: 5,
  theoretical: 6,
  'shared-idea': 7,
  contemporary: 8,
};

export function representativeWork(
  movement: Movement,
  allWorks: Work[],
): Work | undefined {
  return allWorks
    .filter((work) => work.movementIds.includes(movement.id))
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))[0];
}

export function movementCause(
  movement: Movement,
  allMovements: Movement[],
  allRelationships: Relationship[],
): MovementCause {
  const preferredEventId = PREFERRED_CAUSE_EVENT[movement.id];
  const relatedEvent = HISTORIC_EVENTS
    .filter(
      (event) =>
        event.affectedMovementIds.includes(movement.id) &&
        event.year <= movement.dates.start,
    )
    .sort((a, b) => {
      if (a.id === preferredEventId) return -1;
      if (b.id === preferredEventId) return 1;
      return b.year - a.year;
    })[0];

  if (relatedEvent) {
    return { label: relatedEvent.title, detail: relatedEvent.impact };
  }

  const incoming = allRelationships
    .filter(
      (relationship) =>
        relationship.to === movement.id &&
        DISPLAYED_RELATION_KINDS.includes(relationship.kind),
    )
    .sort(
      (a, b) =>
        NEXT_RELATION_PRIORITY[a.kind] - NEXT_RELATION_PRIORITY[b.kind],
    )[0];

  if (incoming) {
    const origin = allMovements.find((item) => item.id === incoming.from);
    return {
      label: origin?.nameJa ?? '先行する表現',
      detail: incoming.note,
    };
  }

  return {
    label: '社会と鑑賞環境の変化',
    detail: movement.socialContext,
  };
}

export function movementTags(
  movement: Movement,
  work: Work | undefined,
  cause: MovementCause,
): ChronologyTag[] {
  const tags: ChronologyTag[] = [];
  const region = movement.regionIds[0];
  if (region) tags.push({ kind: '地域', value: REGION_LABELS[region] });
  if (movement.keywords[0]) {
    tags.push({ kind: '主題', value: movement.keywords[0] });
  }
  if (movement.keywords[1]) {
    tags.push({ kind: '技法', value: movement.keywords[1] });
  }
  if (work) tags.push({ kind: '作品', value: work.titleJa });
  tags.push({ kind: '背景', value: cause.label });
  return tags.slice(0, 5);
}

export function nextMovement(
  movement: Movement,
  visibleMovements: Movement[],
  allRelationships: Relationship[],
): Movement | undefined {
  const visibleIds = new Set(visibleMovements.map((item) => item.id));
  const preferredId = PREFERRED_NEXT_MOVEMENT[movement.id];
  const preferred = preferredId
    ? visibleMovements.find((item) => item.id === preferredId)
    : undefined;
  if (preferred) return preferred;

  const direct = allRelationships
    .filter(
      (relationship) =>
        relationship.from === movement.id &&
        visibleIds.has(relationship.to) &&
        relationship.to !== movement.id,
    )
    .sort(
      (a, b) =>
        NEXT_RELATION_PRIORITY[a.kind] - NEXT_RELATION_PRIORITY[b.kind],
    )
    .map((relationship) =>
      visibleMovements.find((item) => item.id === relationship.to),
    )
    .find((item): item is Movement => Boolean(item));

  if (direct) return direct;

  return [...visibleMovements]
    .filter(
      (item) =>
        item.id !== movement.id &&
        item.dates.start >= movement.dates.start,
    )
    .sort((a, b) => a.dates.start - b.dates.start)[0];
}

export function incomingMovementConnection(
  movement: Movement,
  visibleMovements: Movement[],
  allRelationships: Relationship[],
): MovementConnection | undefined {
  const visibleIds = new Set(visibleMovements.map((item) => item.id));
  const relationship = allRelationships
    .filter(
      (item) =>
        item.to === movement.id &&
        visibleIds.has(item.from) &&
        DISPLAYED_RELATION_KINDS.includes(item.kind),
    )
    .sort(
      (a, b) =>
        NEXT_RELATION_PRIORITY[a.kind] - NEXT_RELATION_PRIORITY[b.kind],
    )[0];

  if (!relationship) return undefined;
  const origin = visibleMovements.find((item) => item.id === relationship.from);
  const label =
    relationship.kind === 'reaction'
      ? `${movement.nameJa}が${origin?.nameJa ?? '先行表現'}に反発`
      : `${origin?.nameJa ?? '先行表現'}から${RELATION_LABELS[relationship.kind]}`;

  return {
    relationship,
    label,
    description: relationship.note,
  };
}

export type ChronologyEntry =
  | { kind: 'event'; year: number; event: HistoricEvent }
  | { kind: 'movement'; year: number; movement: Movement };

export function chronologyEntries(
  era: EraId,
  visibleMovements: Movement[],
): ChronologyEntry[] {
  return [
    ...HISTORIC_EVENTS.filter((event) => event.era === era).map(
      (event): ChronologyEntry => ({
        kind: 'event',
        year: event.year,
        event,
      }),
    ),
    ...visibleMovements
      .filter((movement) => movement.era === era)
      .map(
        (movement): ChronologyEntry => ({
          kind: 'movement',
          year: movement.dates.start,
          movement,
        }),
      ),
  ].sort(
    (a, b) =>
      a.year - b.year ||
      (a.kind === 'event' ? -1 : 1),
  );
}
