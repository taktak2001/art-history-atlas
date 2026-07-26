/**
 * 関係ネットワークの focus クエリの解析とURL構築（純粋関数・単体テスト対象）。
 * 日本語名はクエリに入れない。focus には Movement.id（正規slug）を使う。
 * URLは Next Router を介さず window.history で直接操作する（静的export/basePathを保つ）。
 */

/** focus クエリを検証。存在しない/typo/空文字は null（エラーにしない）。 */
export function parseFocus(
  raw: string | null | undefined,
  validIds: Set<string> | readonly string[],
): string | null {
  if (!raw) return null;
  const set = validIds instanceof Set ? validIds : new Set(validIds);
  return set.has(raw) ? raw : null;
}

/**
 * 既存クエリ（lod など）を保持したまま focus のみを設定/削除し、
 * クエリ文字列（先頭に `?` は付けない）を返す。
 */
export function buildFocusQuery(
  currentSearch: string,
  focus: string | null,
): string {
  const params = new URLSearchParams(currentSearch);
  if (focus) params.set('focus', focus);
  else params.delete('focus');
  return params.toString();
}
