'use client';

import { useState } from 'react';
import type { Work } from '@/lib/schema';

/**
 * 作品画像。
 * - ライセンス確認済み（パブリックドメイン等）の画像のみ表示。
 * - 画像は Wikimedia Commons の Special:FilePath を width 付きで参照し、
 *   responsive な srcset とサイズ指定で配信量を抑える（画像はローカル保存しない）。
 * - 固定アスペクト枠 + object-contain で、比率の違いによるレイアウト崩れ（CLS）を防ぐ。
 * - loading="lazy" / decoding="async"。
 * - 読み込みに失敗した場合（URL 不達など）は架空画像を出さず、プレースホルダーへ退避する。
 */
const WIDTHS = [400, 640, 900, 1200];

export function WorkImage({
  work,
  className = '',
  sizes = '(max-width: 640px) 92vw, 360px',
  showCredit = false,
}: {
  work: Work;
  className?: string;
  sizes?: string;
  showCredit?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const img = work.image;

  if (img && img.fileUrl && !failed) {
    const base = img.fileUrl;
    const sep = base.includes('?') ? '&' : '?';
    const src = `${base}${sep}width=800`;
    const srcSet = WIDTHS.map((w) => `${base}${sep}width=${w} ${w}w`).join(', ');
    return (
      <figure className={className}>
        <div className="relative aspect-[4/3] w-full overflow-hidden border hairline bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={img.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
        {showCredit && (
          <figcaption className="mt-2 text-xs leading-relaxed text-faint">
            {img.credit}
            {img.isPublicDomain ? '（パブリックドメイン）' : `／${img.license}`}・提供：{img.provider}{' '}
            <a
              href={img.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="prose-link"
            >
              原典ページ ↗
            </a>
            <span className="block text-faint">最終確認日 {img.verifiedOn}</span>
          </figcaption>
        )}
      </figure>
    );
  }

  // 画像が無い／読み込み失敗：架空画像を用いずプレースホルダー
  return (
    <div className={className}>
      <div
        role="img"
        aria-label={`${work.titleJa}の画像は未収録（プレースホルダー）`}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border hairline bg-surface p-4 text-center"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-faint"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="1" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M3 17l5-4 4 3 3-2 6 5" strokeLinejoin="round" />
        </svg>
        <p className="text-xs text-muted">画像は権利確認後に順次収録</p>
        <p className="text-[11px] text-faint">{work.medium}</p>
      </div>
    </div>
  );
}
