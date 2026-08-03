import type { Movement } from '@/lib/schema';

/** 完成後の見た目ではなく、制作方法として「技法」に置く語。 */
export const TECHNIQUE_ONLY_VISUAL_TERMS = [
  'たらし込み',
  '箔押し',
  '点描',
  'コラージュ',
  'フォトモンタージュ',
  'レディメイド',
  '自動記述',
  'フロッタージュ',
  'デカルコマニー',
  'シルクスクリーン',
  '破墨',
  '溌墨',
  '皴法',
  '引目鉤鼻',
  '厚塗り',
] as const;

/** 単独では制作方法を説明しないため、「媒体・素材」に置く語。 */
export const MATERIAL_ONLY_TECHNIQUE_ENTRIES = new Set([
  '油彩',
  '水彩',
  'パステル',
  '紙',
  '絹',
  '大理石',
  'ブロンズ',
  'ガラス',
  '樹脂',
  '金銀箔',
  '岩絵具',
  '墨',
  '陶器',
  'テラコッタ',
  '織物',
  '写真',
  '映像',
  '地図',
  '絵画',
  '彫刻',
  '版画',
  '建築',
  '家具',
  'フィギュア',
  'アニメーション',
  '雑誌',
  '出版',
]);

export interface MovementContentTaxonomyIssue {
  movementId: string;
  field: 'visualTraits' | 'technique';
  term: string;
}

/**
 * 詳細ページの5区分が今後のデータ追加でも崩れないよう、全Movementを監査する。
 * 文脈を伴う材料名（例: 「水彩のにじみ」）は許容し、単独列挙だけを検出する。
 */
export function auditMovementContentTaxonomy(
  movementList: readonly Movement[],
): MovementContentTaxonomyIssue[] {
  const issues: MovementContentTaxonomyIssue[] = [];

  for (const movement of movementList) {
    for (const term of TECHNIQUE_ONLY_VISUAL_TERMS) {
      if (movement.visualTraits.includes(term)) {
        issues.push({ movementId: movement.id, field: 'visualTraits', term });
      }
    }

    const techniqueEntries = movement.technique
      .split(/[、。]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    for (const entry of techniqueEntries) {
      if (MATERIAL_ONLY_TECHNIQUE_ENTRIES.has(entry)) {
        issues.push({ movementId: movement.id, field: 'technique', term: entry });
      }
    }
  }

  return issues;
}
