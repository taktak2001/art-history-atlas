import Link from 'next/link';
import type { Work } from '@/lib/schema';
import { toDisplayText } from '@/lib/movement-detail';
import { WorkImage } from './WorkImage';

function WorkMetadata({ work }: { work: Work }) {
  return (
    <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
      <div>
        <dt className="text-[13px] font-bold text-muted">作者</dt>
        <dd className="mt-1 text-ink">{toDisplayText(work.creatorName)}</dd>
      </div>
      <div>
        <dt className="text-[13px] font-bold text-muted">制作年</dt>
        <dd className="mt-1 tabular-nums text-ink">{toDisplayText(work.year)}</dd>
      </div>
      <div>
        <dt className="text-[13px] font-bold text-muted">素材・技法</dt>
        <dd className="mt-1 text-ink">{toDisplayText(work.medium)}</dd>
      </div>
      <div>
        <dt className="text-[13px] font-bold text-muted">所蔵先</dt>
        <dd className="mt-1 text-ink">{toDisplayText(work.collection)}</dd>
      </div>
    </dl>
  );
}

/**
 * 代表作品のサムネイル領域。
 * - 画像あり／(画像なし かつ imageReference なし) → 作品詳細への内部リンクで包む。
 * - 画像なし かつ imageReference あり → プレースホルダー全面が外部リンク（WorkImage が <a> を持つ）。
 *   内部リンクで包むと <a> がネストするため、この場合は包まない。
 */
function WorkThumb({
  work,
  sizes,
  className,
}: {
  work: Work;
  sizes: string;
  className?: string;
}) {
  const external = !work.image && Boolean(work.imageReference?.sourcePageUrl);
  if (external) {
    return (
      <WorkImage
        work={work}
        surface="gallery"
        sizes={sizes}
        className={className}
        showReferenceLink
      />
    );
  }
  return (
    <Link
      href={`/works/${work.id}/`}
      aria-label={`${work.titleJa}の作品詳細を見る`}
      className="group block focus-visible:outline-none"
    >
      <WorkImage work={work} surface="gallery" sizes={sizes} className={className} />
    </Link>
  );
}

function RightsLink({ work }: { work: Work }) {
  return (
    <p className="mt-5 text-xs leading-relaxed text-faint">
      {work.image ? '画像の権利・出典情報' : '画像は権利確認後に収録予定'}。
      <Link href={`/works/${work.id}/`} className="ml-1 prose-link">
        作品詳細で確認
      </Link>
    </p>
  );
}

export function CatalogueWorkList({ works }: { works: Work[] }) {
  if (works.length === 0) {
    return (
      <p className="max-w-[38em] border-l-2 hairline bg-raised/60 px-5 py-4 text-sm text-muted">
        個別の作品データは今後追加予定です。
      </p>
    );
  }

  const [featured, ...rest] = works;

  return (
    <ol aria-label="代表作品">
      <li className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.75fr)] lg:gap-12">
        <WorkThumb
          work={featured}
          sizes="(max-width: 1024px) 92vw, 720px"
          className="transition-opacity duration-200 group-hover:opacity-90"
        />
        <div className="self-end border-t hairline pt-5">
          <p className="text-[13px] font-bold text-muted">作品 01</p>
          <h3 className="mt-3 font-serif text-2xl leading-snug text-ink sm:text-3xl">
            <Link href={`/works/${featured.id}/`} className="hover:text-accent">
              {toDisplayText(featured.titleJa)}
            </Link>
          </h3>
          {featured.titleOriginal && (
            <p className="mt-1 text-sm text-faint">
              {toDisplayText(featured.titleOriginal)}
            </p>
          )}
          <p className="mt-5 max-w-[38em] leading-[1.9] text-muted">
            {toDisplayText(featured.description)}
          </p>
          <WorkMetadata work={featured} />
          <RightsLink work={featured} />
        </div>
      </li>

      {rest.length > 0 && (
        <li className="mt-16 list-none">
          <ol start={2} className="grid gap-x-10 gap-y-14 md:grid-cols-2">
            {rest.map((work, index) => (
              <li key={work.id} className="border-t hairline pt-5">
                <p className="mb-4 text-[13px] font-bold text-muted">
                  作品 {String(index + 2).padStart(2, '0')}
                </p>
                <WorkThumb
                  work={work}
                  sizes="(max-width: 768px) 92vw, 440px"
                  className="transition-opacity duration-200 group-hover:opacity-90"
                />
                <h3 className="mt-5 font-serif text-xl leading-snug text-ink sm:text-2xl">
                  <Link href={`/works/${work.id}/`} className="hover:text-accent">
                    {toDisplayText(work.titleJa)}
                  </Link>
                </h3>
                {work.titleOriginal && (
                  <p className="mt-1 text-sm text-faint">
                    {toDisplayText(work.titleOriginal)}
                  </p>
                )}
                <p className="mt-4 leading-[1.9] text-muted">
                  {toDisplayText(work.description)}
                </p>
                <WorkMetadata work={work} />
                <RightsLink work={work} />
              </li>
            ))}
          </ol>
        </li>
      )}
    </ol>
  );
}
