export function toDisplayText(text: string): string {
  return text.replaceAll('—', '-').replaceAll('–', '-');
}

/**
 * 詳細ページの導入には、編集済みの短い summary をそのまま使う。
 * coreIdea を機械的に連結すると文の途中で切れるため、要旨の水増しや省略は行わない。
 */
export function buildHeroSummary(summary: string): string {
  return toDisplayText(summary.trim());
}
