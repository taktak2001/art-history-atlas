import type { Work } from '@/lib/schema';

/**
 * 作品画像。
 * ライセンス確認済みのパブリックドメイン画像のみ表示する。
 * 画像が無い場合は架空画像を用いず、作品情報を持つプレースホルダーを表示する。
 */
export function WorkImage({ work, className = '' }: { work: Work; className?: string }) {
  if (work.image) {
    const img = work.image;
    return (
      <figure className={className}>
        {/* 静的エクスポートのため next/image 最適化は用いず、明示サイズ + lazy を指定 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.fileUrl ?? img.sourceUrl}
          alt={`${work.titleJa}（${work.creatorName}, ${work.year}）`}
          loading="lazy"
          decoding="async"
          className="h-auto w-full border hairline bg-surface"
        />
        <figcaption className="mt-2 text-xs text-faint">
          {img.credit}／{img.license}
          {img.isPublicDomain ? '（パブリックドメイン）' : ''}・提供：{img.provider}
        </figcaption>
      </figure>
    );
  }
  return (
    <div
      role="img"
      aria-label={`${work.titleJa}の画像は未収録（プレースホルダー）`}
      className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 border hairline bg-surface p-4 text-center ${className}`}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-faint" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M3 17l5-4 4 3 3-2 6 5" strokeLinejoin="round" />
      </svg>
      <p className="text-xs text-muted">画像は権利確認後に順次収録</p>
      <p className="text-[11px] text-faint">{work.medium}</p>
    </div>
  );
}
