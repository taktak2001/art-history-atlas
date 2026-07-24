const sentenceEnd = /[。！？]/;

export function toDisplayText(text: string): string {
  return text.replaceAll('—', '-').replaceAll('–', '-');
}

/**
 * 既存データだけを使い、詳細ページの導入要旨を80〜120字に整える。
 * 元の summary は必ず全文を残し、不足時のみ coreIdea の第一文を補う。
 */
export function buildHeroSummary(
  summary: string,
  coreIdea: string,
  minLength = 80,
  maxLength = 120,
): string {
  const normalizedSummary = summary.trim();
  if (normalizedSummary.length >= minLength) {
    return toDisplayText(trimNaturally(normalizedSummary, minLength, maxLength));
  }

  const firstIdeaEnd = coreIdea.search(sentenceEnd);
  const firstIdea =
    firstIdeaEnd >= 0 ? coreIdea.slice(0, firstIdeaEnd + 1) : coreIdea.trim();
  const combined = `${normalizedSummary}${firstIdea}`;

  return toDisplayText(trimNaturally(combined, minLength, maxLength));
}

function trimNaturally(text: string, minLength: number, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const withinLimit = text.slice(0, maxLength);
  const punctuation = Math.max(
    withinLimit.lastIndexOf('。'),
    withinLimit.lastIndexOf('！'),
    withinLimit.lastIndexOf('？'),
  );

  if (punctuation + 1 >= minLength) {
    return withinLimit.slice(0, punctuation + 1);
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
