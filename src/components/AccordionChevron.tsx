/**
 * アコーディオンの開閉を示すシェブロン。
 *
 * 記号の役割はサイト全体で固定する:
 * - `›` / `⌄`（本コンポーネント）: 開閉（アコーディオン）
 * - `＋`: 項目の追加など、実際に何かを加える操作だけ
 * - `→`: 別ページへの遷移
 * - `×`: 削除・解除・閉じる
 *
 * 閉じた状態は右向き、開くと90度回転して下向きになる。
 * 装飾のためボタン枠や丸背景は付けない。
 */
export function AccordionChevron({
  open,
  className = '',
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-open={open}
      data-accordion-chevron
      className={`accordion-chevron ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </span>
  );
}
