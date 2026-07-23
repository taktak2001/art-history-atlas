import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  artists,
  getArtist,
  getMovement,
  getWork,
  getSources,
  formatYear,
  REGION_LABELS,
} from '@/lib/dataset';
import { VerificationBadge } from '@/components/Badges';
import { SourceList } from '@/components/SourceList';
import { WorkImage } from '@/components/WorkImage';

export function generateStaticParams() {
  return artists.map((a) => ({ slug: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArtist(slug);
  if (!a) return { title: '作家が見つかりません' };
  return { title: `${a.nameJa}`, description: a.bio };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArtist(slug);
  if (!a) notFound();

  const relatedMovements = a.movementIds.map((id) => getMovement(id)).filter(Boolean);
  const keyWorks = a.keyWorkIds.map((id) => getWork(id)).filter(Boolean);
  const sources = getSources(a.sourceIds);

  const life =
    a.born === null && a.died === null
      ? a.lifeNote ?? '生没年不詳'
      : `${a.born !== null ? formatYear(a.born) : '?'} – ${a.died !== null ? formatYear(a.died) : '現存'}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav aria-label="パンくず" className="mb-6 text-sm text-faint">
        <Link href="/movements/" className="hover:text-ink">ムーブメント</Link>
        <span className="mx-2">/</span>
        <span className="text-muted">作家</span>
      </nav>

      <header className="border-b hairline pb-6">
        <h1 className="font-serif text-4xl">{a.nameJa}</h1>
        {a.nameOriginal && <p className="mt-1 text-sm uppercase tracking-wider text-faint">{a.nameOriginal}</p>}
        <p className="mt-3 text-sm text-muted">
          {life}
          {a.lifeNote && a.born !== null ? `（${a.lifeNote}）` : ''} ・ {a.country}
        </p>
        <p className="mt-1 text-sm text-muted">
          主な活動地域：{a.regionIds.map((r) => REGION_LABELS[r]).join('・')}
        </p>
        <div className="mt-3">
          <VerificationBadge status={a.verification} />
        </div>
      </header>

      <section className="py-6">
        <p className="leading-relaxed text-ink">{a.bio}</p>
      </section>

      <section className="border-t hairline py-6">
        <h2 className="font-serif text-xl">関連するムーブメント</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {relatedMovements.map((m) => m && (
            <li key={m.id}>
              <Link href={`/movements/${m.id}/`} className="rounded-sm border hairline px-3 py-1.5 text-sm hover:border-ink/40">
                {m.nameJa}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {keyWorks.length > 0 && (
        <section className="border-t hairline py-6">
          <h2 className="font-serif text-xl">代表作品</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {keyWorks.map((w) => w && (
              <li key={w.id}>
                <Link href={`/works/${w.id}/`} className="block">
                  <WorkImage work={w} />
                  <p className="mt-2 font-serif text-sm text-ink">{w.titleJa}</p>
                  <p className="text-xs text-faint">{w.year}・{w.medium}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t hairline py-6">
        <h2 className="font-serif text-xl">出典</h2>
        <div className="mt-3">
          <SourceList sources={sources} />
        </div>
      </section>
    </div>
  );
}
