/**
 * 画像の利用根拠（usageBasis）にもとづく表示可否ポリシー。
 *
 * 原則:
 * - public-domain / licensed: 全画面で使用可（licensed は許諾条件の範囲内）。
 * - quotation: 具体的な分析本文と一体の限定サーフェスでのみ、審査通過後に表示。
 * - unavailable: 画像を表示しない（作品情報のみ）。
 *
 * 「教育目的だから」「出典を書けば」「低解像度なら」「外部埋め込みなら」表示してよい、
 * という前提は採らない。
 */
import { resolveUsageBasis, type ImageMeta, type QuotationPurpose } from '@/lib/schema';

/** 引用画像を表示してよいサーフェス（分析本文と一体の場所のみ）。 */
export const QUOTATION_ALLOWED_SURFACES = [
  'movement-analysis', // Movement 詳細ページの作品分析セクション
  'work-analysis', // Work 詳細ページの視覚分析セクション
  'compare-analysis', // 画像を直接分析する比較セクション
] as const;

/** 引用画像を表示してはいけないサーフェス（列挙は文書・テスト用）。 */
export const QUOTATION_FORBIDDEN_SURFACES = [
  'home',
  'timeline',
  'chronology',
  'network',
  'movement-card',
  'search',
  'ogp',
  'background',
  'gallery', // 分析文を伴わない代表作品ギャラリー
] as const;

export type ImageSurface =
  | (typeof QUOTATION_ALLOWED_SURFACES)[number]
  | (typeof QUOTATION_FORBIDDEN_SURFACES)[number];

/** 引用画像が本番表示可能な審査・公開状態か。 */
export function isQuotationPublishable(img: ImageMeta): boolean {
  const q = img.quotation;
  if (!q) return false;
  // 最低でも editorial-approved まで到達し、かつ公開フラグが立っていること。
  return q.reviewStatus === 'editorial-approved' && q.isPublished === true;
}

/** その画像を、そのサーフェスに表示してよいか。 */
export function canDisplayImageOnSurface(
  img: ImageMeta,
  surface: ImageSurface,
): boolean {
  const basis = resolveUsageBasis(img);
  if (basis === 'unavailable') return false;
  if (basis === 'public-domain' || basis === 'licensed') return true;
  if (basis === 'quotation') {
    const allowed = (QUOTATION_ALLOWED_SURFACES as readonly string[]).includes(
      surface,
    );
    return allowed && isQuotationPublishable(img);
  }
  return false;
}

export const QUOTATION_PURPOSE_LABELS: Record<QuotationPurpose, string> = {
  'composition-analysis': '構図の分析',
  'color-light-analysis': '色彩・光の分析',
  'technique-comparison': '技法の比較',
  'movement-visual-difference': 'ムーブメント間の視覚的差異の説明',
  'iconography-critique': '図像・主題の批評',
};
