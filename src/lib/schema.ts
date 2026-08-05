import { z } from 'zod';

/**
 * Art History Atlasのデータスキーマ。
 *
 * すべてのシードデータはこのスキーマで検証される（scripts/validate-data.ts）。
 * - 年代は西暦の整数。紀元前は負値（例: 前2000年 = -2000）。
 * - 「概算」「諸説あり」はフラグと注記で明示し、断定を避ける。
 * - 事実と解釈を分離し、出典を紐づける。
 */

/* ------------------------------------------------------------------ *
 * 列挙型（分類の階層を混在させない）
 * ------------------------------------------------------------------ */

/** 分類：異なる概念（時代区分／様式／運動…）を同じ階層に混在させない */
export const ClassificationKind = z.enum([
  'period', // 時代区分
  'style', // 様式
  'movement', // 芸術運動
  'school', // 流派
  'collective', // 芸術家集団
  'tendency', // 制作傾向
  'method-theory', // 美術史上の方法論・理論
]);
export type ClassificationKind = z.infer<typeof ClassificationKind>;

export const CLASSIFICATION_LABELS: Record<ClassificationKind, string> = {
  period: '時代区分',
  style: '様式',
  movement: '芸術運動',
  school: '流派',
  collective: '芸術家集団',
  tendency: '制作傾向',
  'method-theory': '方法論・理論',
};

/** 地域：西洋を唯一の発展経路として扱わないため、地域を独立の軸として持つ */
export const RegionId = z.enum([
  'mediterranean', // 地中海・古代
  'italy', // イタリア
  'netherlands', // フランドル・オランダ
  'france', // フランス
  'germany', // ドイツ・中央ヨーロッパ
  'britain', // イギリス
  'spain', // スペイン
  'america', // アメリカ
  'japan', // 日本
  'east-asia', // 東アジア
  'pan-european', // 汎ヨーロッパ
  'global', // 国際的・地域横断
  'other', // その他
]);
export type RegionId = z.infer<typeof RegionId>;

export const REGION_LABELS: Record<RegionId, string> = {
  mediterranean: '地中海・古代',
  italy: 'イタリア',
  netherlands: 'フランドル・オランダ',
  france: 'フランス',
  germany: 'ドイツ・中央ヨーロッパ',
  britain: 'イギリス',
  spain: 'スペイン',
  america: 'アメリカ',
  japan: '日本',
  'east-asia': '東アジア',
  'pan-european': '汎ヨーロッパ',
  global: '国際的',
  other: 'その他',
};

/** 大まかな時代区分（マトリクスの横軸などに使用） */
export const EraId = z.enum([
  'prehistoric-ancient', // 先史・古代
  'medieval', // 中世
  'renaissance', // ルネサンス
  'baroque-rococo', // 17〜18世紀
  'nineteenth', // 19世紀
  'modern', // モダニズム
  'postwar', // 戦後美術
  'contemporary', // 現代美術
]);
export type EraId = z.infer<typeof EraId>;

export const ERA_LABELS: Record<EraId, string> = {
  'prehistoric-ancient': '先史・古代',
  medieval: '中世',
  renaissance: 'ルネサンス',
  'baroque-rococo': '17〜18世紀',
  nineteenth: '19世紀',
  modern: 'モダニズム',
  postwar: '戦後美術',
  contemporary: '現代美術',
};
export const ERA_ORDER: EraId[] = [
  'prehistoric-ancient',
  'medieval',
  'renaissance',
  'baroque-rococo',
  'nineteenth',
  'modern',
  'postwar',
  'contemporary',
];

/** 表示する範囲。値は「その項目が初めて現れるレベル」を表す */
export const VisibilityLevel = z.enum(['core', 'standard', 'detailed']);
export type VisibilityLevel = z.infer<typeof VisibilityLevel>;

export const VISIBILITY_LEVEL_LABELS: Record<VisibilityLevel, string> = {
  core: '基本',
  standard: '充実',
  detailed: 'すべて',
};

export const VISIBILITY_LEVEL_DESCRIPTIONS: Record<VisibilityLevel, string> = {
  core: '美術史の骨格となる主要項目を表示',
  standard: '重要な細分・派生ムーブメントも表示',
  detailed: '収録済みの全項目を表示',
};

/** 情報の確認状態：事実の確からしさを利用者に明示する */
export const VerificationStatus = z.enum([
  'verified', // 複数の信頼できる資料で確認
  'single-source', // 単一資料に基づく
  'contested', // 学術的に諸説あり（見解の一つ）
  'needs-review', // 要確認
]);
export type VerificationStatus = z.infer<typeof VerificationStatus>;

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified: '確認済み',
  'single-source': '単一資料',
  contested: '諸説あり',
  'needs-review': '要確認',
};

/** 出典の種類 */
export const SourceKind = z.enum([
  'museum', // 美術館
  'university', // 大学・研究機関
  'encyclopedia', // 事典・専門辞典
  'book', // 専門書
  'foundation', // 作家・作品の財団
  'archive', // アーカイブ
]);
export type SourceKind = z.infer<typeof SourceKind>;

/** 出典の信頼性区分 */
export const SourceReliability = z.enum(['high', 'medium']);
export type SourceReliability = z.infer<typeof SourceReliability>;

/** 画像ライセンス（実行時に確認済みのもののみ許可） */
export const ImageLicense = z.enum([
  'public-domain',
  'cc0',
  'cc-by',
  'cc-by-sa',
]);
export type ImageLicense = z.infer<typeof ImageLicense>;

/**
 * 画像の利用根拠（法的・編集上の区分）。
 * - public-domain: 保護期間満了/CC0。全画面で使用可。
 * - licensed: CC BY 等、許諾条件の範囲で使用可。
 * - quotation: 著作権法上の「引用」。具体的な分析本文と一体の場合だけ、限定された場所でのみ表示。
 * - unavailable: 画像を表示せず作品情報のみ（= image を持たない扱いと同等）。
 * 「教育目的だから」「出典を書けば」「低解像度なら」「外部埋め込みなら」使える、という前提は取らない。
 */
export const UsageBasis = z.enum([
  'public-domain',
  'licensed',
  'quotation',
  'unavailable',
]);
export type UsageBasis = z.infer<typeof UsageBasis>;

/** 引用画像の審査状態。editorial-approved 未満は本番表示しない。 */
export const ReviewStatus = z.enum([
  'pending',
  'editorial-approved',
  'legal-review-required',
  'rejected',
]);
export type ReviewStatus = z.infer<typeof ReviewStatus>;

/**
 * 引用目的。装飾・代表作品の展示・分かりやすさは引用目的として認めない。
 * 具体的な批評・分析に必要な資料としての目的のみを列挙する。
 */
export const QuotationPurpose = z.enum([
  'composition-analysis', // 構図の分析
  'color-light-analysis', // 色彩・光の分析
  'technique-comparison', // 技法の比較
  'movement-visual-difference', // ムーブメント間の視覚的差異の説明
  'iconography-critique', // 図像・主題の批評
]);
export type QuotationPurpose = z.infer<typeof QuotationPurpose>;

/** 引用画像に必須の編集・法務メタデータ。 */
export const QuotationMeta = z.object({
  /** 原典（作品の出所ページ）URL */
  sourcePageUrl: z.string().url(),
  /** デジタル画像の提供元（美術館・アーカイブ等） */
  provider: z.string().min(1),
  /** 作者 */
  creator: z.string().min(1),
  /** 作品名 */
  workTitle: z.string().min(1),
  /** 制作年（表記のまま） */
  workDate: z.string().min(1),
  /** 参照日 (YYYY-MM-DD) */
  accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** 引用目的（限定列挙） */
  quotationPurpose: QuotationPurpose,
  /** この画像と一体となる分析セクションの識別子（本文への紐付け） */
  quotationContext: z.string().min(1),
  /** なぜこの画像がなければ説明できないか（必要性の根拠） */
  quotationRationale: z.string().min(1),
  /** クレジット表記（提供元の指定に従う） */
  sourceCredit: z.string().min(1),
  /** 原典が公表済みの著作物か */
  isPublished: z.boolean(),
  /** 審査状態 */
  reviewStatus: ReviewStatus,
  /** 審査メモ（加工の有無・判断根拠・提供元条件など） */
  reviewNote: z.string().min(1),
});
export type QuotationMeta = z.infer<typeof QuotationMeta>;

/** 関係タイプ（ムーブメント間のエッジ） */
export const RelationKind = z.enum([
  'succession', // 継承
  'reaction', // 反発
  'influence', // 影響
  'contemporary', // 同時代
  'regional-variant', // 地域的展開
  'theoretical', // 理論的関連
  'technical', // 技術的関連
  'revival', // 後世に再評価
  'shared-idea', // 共通する思想
]);
export type RelationKind = z.infer<typeof RelationKind>;

export const RELATION_LABELS: Record<RelationKind, string> = {
  succession: '継承',
  reaction: '反発',
  influence: '影響',
  contemporary: '同時代',
  'regional-variant': '地域的展開',
  theoretical: '理論的関連',
  technical: '技術的関連',
  revival: '後世に再評価',
  'shared-idea': '共通する思想',
};

/* ------------------------------------------------------------------ *
 * 部品スキーマ
 * ------------------------------------------------------------------ */

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slugは英小文字・数字・ハイフンのみ');

/** 年代。紀元前は負値、概算はcirca、幅はstart/endで表現 */
export const DateRange = z
  .object({
    /** 開始年（西暦、紀元前は負） */
    start: z.number().int(),
    /** 終了年。継続中・不定はnull */
    end: z.number().int().nullable(),
    /** 最盛期（任意） */
    peak: z.tuple([z.number().int(), z.number().int()]).nullable().optional(),
    /** 年代が概算・諸説ありの場合の注記 */
    circa: z.boolean().default(false),
    note: z.string().optional(),
  })
  .refine((d) => d.end === null || d.end >= d.start, {
    message: '終了年は開始年以上でなければならない',
  })
  .refine((d) => !d.peak || (d.peak[0] <= d.peak[1]), {
    message: '最盛期の範囲が不正',
  });
export type DateRange = z.infer<typeof DateRange>;

/** 出典 */
export const Source = z.object({
  id: slug,
  /** ページタイトル */
  title: z.string().min(1),
  /** 発行主体 */
  publisher: z.string().min(1),
  url: z.string().url(),
  /** 参照日 (YYYY-MM-DD) */
  accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: SourceKind,
  reliability: SourceReliability,
  /** この出典が裏づける記述の要約 */
  supports: z.string().min(1),
});
export type Source = z.infer<typeof Source>;

/**
 * 画像の利用根拠を解決する。usageBasis が明示されていればそれを、
 * なければ既存の license / isPublicDomain から public-domain / licensed を導出する。
 * （権利確認済みの既存画像は usageBasis 未指定でも安全側に解決される。）
 */
export function resolveUsageBasis(img: {
  usageBasis?: UsageBasis;
  isPublicDomain?: boolean;
  license?: ImageLicense;
}): UsageBasis {
  if (img.usageBasis) return img.usageBasis;
  if (img.isPublicDomain) return 'public-domain';
  if (img.license) return 'licensed';
  return 'unavailable';
}

/** 画像メタデータ（権利処理のためのフィールドを必須化） */
export const ImageMeta = z
  .object({
    /** 作品名 */
    title: z.string().min(1),
    /** 作者 */
    creator: z.string().min(1),
    /** 制作年（表記のまま） */
    date: z.string().min(1),
    /** 画像提供元 */
    provider: z.string().min(1),
    /** 原典URL（画像の出所ページ = 原典ページURL） */
    sourceUrl: z.string().url(),
    /** 直接の画像ファイルURL（Wikimedia Commons Special:FilePath 等の安定エンドポイント） */
    fileUrl: z.string().url().optional(),
    /** 利用根拠。省略時は license / isPublicDomain から導出（resolveUsageBasis）。 */
    usageBasis: UsageBasis.optional(),
    /** 確認済みライセンス（public-domain / licensed 用。quotation では持たない）。 */
    license: ImageLicense.optional(),
    /** クレジット表記 */
    credit: z.string().min(1),
    /** public-domain / licensed 用。quotation では持たない。 */
    isPublicDomain: z.boolean().optional(),
    /** 代替テキスト（スクリーンリーダー向け・必須） */
    alt: z.string().min(1),
    /** 最終確認日 */
    verifiedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** 確認方法の注記（例: 取得経路・検証の限界） */
    verificationNote: z.string().optional(),
    /** usageBasis === 'quotation' のとき必須の引用メタデータ */
    quotation: QuotationMeta.optional(),
  })
  .superRefine((img, ctx) => {
    const basis = resolveUsageBasis(img);
    if (basis === 'quotation') {
      if (!img.quotation) {
        ctx.addIssue({ code: 'custom', message: 'quotation画像には quotation メタデータが必須' });
      }
      if (img.license !== undefined) {
        ctx.addIssue({ code: 'custom', message: '引用は許諾ライセンスではないため quotation画像に license を指定できない' });
      }
      if (img.isPublicDomain === true) {
        ctx.addIssue({ code: 'custom', message: 'public-domain と quotation を同時指定できない' });
      }
    } else if (basis === 'public-domain' || basis === 'licensed') {
      if (img.quotation) {
        ctx.addIssue({ code: 'custom', message: '非quotation画像に quotation メタデータを付与できない' });
      }
      if (!img.license) {
        ctx.addIssue({ code: 'custom', message: `${basis}画像には license が必須` });
      }
      if (basis === 'public-domain') {
        if (img.isPublicDomain !== true) {
          ctx.addIssue({ code: 'custom', message: 'public-domain は isPublicDomain=true が必須' });
        }
        if (img.license && img.license !== 'public-domain' && img.license !== 'cc0') {
          ctx.addIssue({ code: 'custom', message: 'public-domain のライセンスは public-domain / cc0 でなければならない' });
        }
      }
      if (basis === 'licensed' && img.isPublicDomain === true) {
        ctx.addIssue({ code: 'custom', message: 'ライセンス確認画像を public-domain として登録できない' });
      }
    }
  });
export type ImageMeta = z.infer<typeof ImageMeta>;

/** 作品 */
export const Work = z.object({
  id: slug,
  titleJa: z.string().min(1),
  titleOriginal: z.string().optional(),
  creatorId: slug.optional(),
  creatorName: z.string().min(1),
  year: z.string().min(1),
  medium: z.string().min(1),
  collection: z.string().min(1),
  movementIds: z.array(slug).min(1),
  description: z.string().min(1),
  image: ImageMeta.nullable(),
  sourceIds: z.array(slug).min(1),
  verification: VerificationStatus,
});
export type Work = z.infer<typeof Work>;

/** 作家 */
export const Artist = z.object({
  id: slug,
  nameJa: z.string().min(1),
  nameOriginal: z.string().optional(),
  born: z.number().int().nullable(),
  died: z.number().int().nullable(),
  lifeNote: z.string().optional(),
  regionIds: z.array(RegionId).min(1),
  country: z.string().min(1),
  movementIds: z.array(slug).min(1),
  bio: z.string().min(1),
  keyWorkIds: z.array(slug).default([]),
  sourceIds: z.array(slug).min(1),
  verification: VerificationStatus,
});
export type Artist = z.infer<typeof Artist>;

/** ムーブメント間の関係（独立したエッジデータ） */
export const Relationship = z.object({
  id: slug,
  from: slug,
  to: slug,
  kind: RelationKind,
  /** 短い説明 */
  note: z.string().min(1),
  sourceIds: z.array(slug).default([]),
});
export type Relationship = z.infer<typeof Relationship>;

/** ムーブメント本体 */
export const Movement = z.object({
  id: slug,
  nameJa: z.string().min(1),
  nameEn: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  /** この項目が初めて表示されるLOD */
  visibilityLevel: VisibilityLevel,
  /** 表示整理上の親。継承・影響などの因果関係には使用しない */
  parentMovementId: slug.optional(),
  /** 因果を意味しない表示上のまとまり */
  groupId: slug.optional(),
  /** グループを縮約表示するときの代表項目 */
  isRepresentative: z.boolean().optional(),
  /** 同一階層内の安定した表示順 */
  displayOrder: z.number().int().nonnegative().optional(),
  /** 高密度画面用の短縮表示 */
  shortLabel: z.string().min(1).max(24).optional(),
  classification: ClassificationKind,
  era: EraId,
  dates: DateRange,
  regionIds: z.array(RegionId).min(1),
  cities: z.array(z.string()).default([]),

  /** 解説項目 */
  summary: z.string().min(1),
  coreIdea: z.string().min(1),
  socialContext: z.string().min(1),
  politicalContext: z.string().optional(),
  religiousContext: z.string().optional(),
  philosophy: z.string().optional(),
  technologyContext: z.string().optional(),
  reactionAgainst: z.string().min(1),
  inheritedFrom: z.string().min(1),
  visualTraits: z.string().min(1),
  compositionSpace: z.string().min(1),
  colorLight: z.string().min(1),
  technique: z.string().min(1),
  materials: z.string().min(1),
  subjects: z.string().min(1),
  artistStatus: z.string().min(1),
  productionSystem: z.string().min(1),
  patronage: z.string().min(1),
  marketExhibition: z.string().min(1),
  audience: z.string().min(1),
  legacy: z.string().min(1),
  contemporaryConnection: z.string().min(1),
  viewingPoints: z.array(z.string()).min(1),

  keywords: z.array(z.string()).min(1),
  artistIds: z.array(slug).default([]),
  workIds: z.array(slug).default([]),
  sourceIds: z.array(slug).min(1),
  verification: VerificationStatus,
});
export type Movement = z.infer<typeof Movement>;

/* ------------------------------------------------------------------ *
 * データセット全体
 * ------------------------------------------------------------------ */

export const Dataset = z.object({
  movements: z.array(Movement),
  artists: z.array(Artist),
  works: z.array(Work),
  relationships: z.array(Relationship),
  sources: z.array(Source),
});
export type Dataset = z.infer<typeof Dataset>;
