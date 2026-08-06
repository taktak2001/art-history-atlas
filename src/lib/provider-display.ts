/**
 * imageReference.provider の「UI 表示用の短縮名」。
 *
 * データ側の provider 文字列（正式名・所蔵注記つき）は一切変更せず、
 * プレースホルダーのリンク表記だけを短く読みやすくするためのヘルパー。
 */
const RULES: Array<[RegExp, string]> = [
  [/museum of modern art|moma/i, 'MoMA'],
  [/metropolitan museum/i, 'The Met'],
  [/art institute of chicago/i, 'AIC'],
  [/museum of contemporary art|moca/i, 'MOCA'],
  [/buffalo akg|albright/i, 'Buffalo AKG'],
  [/san francisco museum of modern art|sfmoma/i, 'SFMOMA'],
  [/centre pompidou/i, 'Centre Pompidou'],
  [/nationalgalerie|staatliche museen/i, 'Nationalgalerie (SMB)'],
  [/dia art foundation/i, 'Dia'],
  [/whitney/i, 'Whitney'],
  [/pushkin/i, 'Pushkin Museum'],
  [/art platform japan/i, 'Art Platform Japan'],
  [/tokyo museum collection/i, 'Tokyo Museum Collection'],
  [/teamlab/i, 'teamLab'],
  [/kaikai kiki/i, 'Kaikai Kiki'],
  [/fondazione merz/i, 'Fondazione Merz'],
  [/google arts/i, 'Google Arts & Culture'],
  [/smarthistory/i, 'Smarthistory'],
  [/magritte/i, 'Musée Magritte'],
  [/james turrell/i, 'James Turrell'],
  [/\btate\b/i, 'Tate'],
  [/wikimedia commons/i, 'Wikimedia Commons'],
];

/** provider の正式名から、UI 表示用の短い提供元名を返す。 */
export function shortProviderName(provider: string): string {
  for (const [pattern, label] of RULES) {
    if (pattern.test(provider)) return label;
  }
  // 未知の provider は、日本語注記「（…）」や「, / — / -」以降を落として短縮する。
  const trimmed = provider
    .replace(/[（(].*$/s, '')
    .replace(/\s*[—–-].*$/s, '')
    .replace(/,.*$/s, '')
    .trim();
  return trimmed.length > 0 ? trimmed : provider;
}
