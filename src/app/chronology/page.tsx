import type { Metadata } from 'next';
import Link from 'next/link';
import {
  movementsChronological,
  ERA_ORDER,
  ERA_LABELS,
  formatDateRange,
  artistsOf,
  worksOf,
} from '@/lib/dataset';
import { ClassificationBadge, RegionBadges } from '@/components/Badges';

export const metadata: Metadata = {
  title: '縦型年表',
  description: '年代順にムーブメントを閲覧する。モバイルでの主要な閲覧画面。',
};

export default function ChronologyPage() {
  const ordered = movementsChronological();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">Chronology</p>
      <h1 className="mt-3 font-serif text-3xl">縦型年表</h1>
      <p className="mt-3 text-sm text-muted">
        年代順（開始年）に並べたムーブメント。時代区分ごとに区切っています。
      </p>

      {/* 時代ナビ（スクロール位置と同期） */}
      <nav aria-label="時代ナビゲーション" className="sticky top-16 z-30 mt-6 -mx-4 border-y hairline bg-paper/95 px-4 py-2 backdrop-blur">
        <ul className="scroll-x flex gap-2 text-xs">
          {ERA_ORDER.map((era) => (
            <li key={era} className="shrink-0">
              <a href={`#era-${era}`} className="inline-block rounded-sm border hairline px-2.5 py-1 text-muted hover:text-ink">
                {ERA_LABELS[era]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8">
        {ERA_ORDER.map((era) => {
          const items = ordered.filter((m) => m.era === era);
          if (items.length === 0) return null;
          return (
            <section key={era} id={`era-${era}`} className="scroll-mt-28 pb-8">
              <h2 className="sticky top-28 font-serif text-sm uppercase tracking-widest text-accent">
                {ERA_LABELS[era]}
              </h2>
              <ol className="mt-3 border-l-2 hairline">
                {items.map((m) => {
                  const artists = artistsOf(m);
                  const works = worksOf(m);
                  return (
                    <li key={m.id} className="relative pl-6 pb-6">
                      <span aria-hidden="true" className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-accent" />
                      <Link href={`/movements/${m.id}/`} className="group block">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-xs tabular-nums text-faint">{formatDateRange(m)}</span>
                          <ClassificationBadge kind={m.classification} />
                        </div>
                        <h3 className="mt-1 font-serif text-xl text-ink group-hover:text-accent">
                          {m.nameJa}
                          <span className="ml-2 text-xs uppercase tracking-wider text-faint">{m.nameEn}</span>
                        </h3>
                        <p className="mt-1 text-sm text-muted">{m.summary}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <RegionBadges regionIds={m.regionIds} />
                          {works[0] && (
                            <span className="text-xs text-faint">代表作：{works[0].titleJa}</span>
                          )}
                          {!works[0] && artists[0] && (
                            <span className="text-xs text-faint">代表作家：{artists[0].nameJa}</span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
