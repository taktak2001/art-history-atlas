'use client';

import { useState } from 'react';
import type { Work } from '@/lib/schema';
import { resolveUsageBasis } from '@/lib/schema';
import {
  canDisplayImageOnSurface,
  QUOTATION_PURPOSE_LABELS,
  type ImageSurface,
} from '@/lib/image-usage';
import { shortProviderName } from '@/lib/provider-display';

/**
 * 作品画像。
 * - public-domain / licensed（権利確認済み）は全画面で表示。
 * - quotation（引用）は分析本文と一体の限定サーフェスで、審査通過後のみ表示し、
 *   画像直下に「画像引用」クレジットを明示して自サイト本文と視覚的に区別する。
 * - 画像は width 付きの安定エンドポイントを参照し、responsive な srcset で配信量を抑える
 *   （ローカル保存・原寸配布・ダウンロードボタンは設けない）。
 * - 固定アスペクト枠 + object-contain で CLS を防ぐ。loading="lazy" / decoding="async"。
 * - 読み込み失敗時や表示不可の場合は架空画像を出さずプレースホルダーへ退避する。
 */
const WIDTHS = [400, 640, 900, 1200];

export function WorkImage({
  work,
  className = '',
  sizes = '(max-width: 640px) 92vw, 360px',
  showCredit = false,
  surface = 'work-analysis',
  showReferenceLink = false,
}: {
  work: Work;
  className?: string;
  sizes?: string;
  showCredit?: boolean;
  /** 表示コンテキスト。quotation画像はこのサーフェスが許可された場所でのみ表示される。 */
  surface?: ImageSurface;
  /**
   * 画像未収録時のプレースホルダーに、引用元の原典ページへの外部リンクを出すか。
   * 作品詳細およびホームの特集カードで使用し、Timeline・Network・Chronology では表示しない。
   * 画像の転載ではなく、提供元ページへの遷移導線のみを提供する。
   */
  showReferenceLink?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const img = work.image;
  const canShow = img ? canDisplayImageOnSurface(img, surface) : false;

  if (img && canShow && img.fileUrl && !failed) {
    const basis = resolveUsageBasis(img);
    const isQuotation = basis === 'quotation';
    const base = img.fileUrl;
    const sep = base.includes('?') ? '&' : '?';
    const src = `${base}${sep}width=800`;
    const srcSet = WIDTHS.map((w) => `${base}${sep}width=${w} ${w}w`).join(', ');
    const q = img.quotation;
    return (
      <figure className={className} data-usage-basis={basis}>
        <div
          className={`relative aspect-[4/3] w-full overflow-hidden bg-surface ${
            isQuotation ? 'border-l-2 border-ink/50' : 'border hairline'
          }`}
        >
          {isQuotation && (
            <span className="absolute left-0 top-0 z-10 bg-ink/80 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.08em] text-paper">
              画像引用
            </span>
          )}
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
        {isQuotation && q ? (
          // 引用の必須表示：本文と明確に区別した静かな脚注
          <figcaption className="mt-2 border-l-2 border-ink/30 pl-2 text-xs leading-relaxed text-faint">
            <span className="font-bold text-muted">画像引用</span>
            {`｜${q.creator}《${q.workTitle}》${q.workDate}`}
            <span className="mt-0.5 block">
              出典：{q.provider}／{q.sourceCredit}{' '}
              <a
                href={q.sourcePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="prose-link"
              >
                原典ページ ↗
              </a>
            </span>
            <span className="mt-0.5 block text-faint">
              引用目的：{QUOTATION_PURPOSE_LABELS[q.quotationPurpose]}・閲覧日 {q.accessed}
            </span>
          </figcaption>
        ) : (
          showCredit && (
            <figcaption className="mt-2 text-xs leading-relaxed text-faint">
              {img.credit}
              {img.isPublicDomain
                ? '（パブリックドメイン）'
                : img.license
                  ? `／${img.license}`
                  : ''}
              ・提供：{img.provider}{' '}
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
          )
        )}
      </figure>
    );
  }

  // 画像が無い／表示不可／読み込み失敗：架空画像を用いずプレースホルダー。
  // 権利未確認のサムネイル（sourcePageUrl先の画像・OGP・candidateFileUrl 等）は一切表示しない。
  const placeholderIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-faint transition-colors group-hover:text-muted"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M3 17l5-4 4 3 3-2 6 5" strokeLinejoin="round" />
    </svg>
  );

  // 外部導線を出す面では、未収録画像は imageReference、読込失敗画像は
  // ImageMeta の原典へ直接戻れるようプレースホルダー全面を外部リンクにする。
  const referenceUrl = work.imageReference?.sourcePageUrl ?? img?.sourceUrl;
  const referenceProvider = work.imageReference?.provider ?? img?.provider;
  if (showReferenceLink && referenceUrl && referenceProvider) {
    const provider = shortProviderName(referenceProvider);
    return (
      <div className={className}>
        <a
          href={referenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${work.titleJa}の画像を${provider}の引用元で確認する（外部サイト）`}
          className="group flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border hairline bg-surface p-4 text-center no-underline transition-colors hover:border-ink/40 hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {placeholderIcon}
          <span className="font-serif text-sm leading-snug text-muted transition-colors group-hover:text-ink">
            画像は引用元で確認
          </span>
          <span className="text-[11px] leading-snug text-faint transition-colors group-hover:text-muted">
            {provider}の原典を見る <span aria-hidden="true">↗</span>
          </span>
        </a>
      </div>
    );
  }

  // 通常のプレースホルダー（クリック不可）。
  return (
    <div className={className}>
      <div
        role="img"
        aria-label={`${work.titleJa}の画像は未収録（プレースホルダー）`}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border hairline bg-surface p-4 text-center"
      >
        {placeholderIcon}
        <p className="text-xs text-muted">画像は権利確認後に収録予定</p>
        <p className="text-[11px] text-faint">{work.medium}</p>
      </div>
    </div>
  );
}
