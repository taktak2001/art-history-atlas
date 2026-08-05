import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  works,
  getWork,
  getMovement,
  getArtist,
  getSources,
} from '@/lib/dataset';
import { VerificationBadge } from '@/components/Badges';
import { SourceList } from '@/components/SourceList';
import { WorkImage } from '@/components/WorkImage';

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) return { title: '作品が見つかりません' };
  return { title: `${w.titleJa}`, description: w.description };
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="border-t hairline py-3">
      <dt className="text-xs uppercase tracking-wider text-faint">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getWork(slug);
  if (!w) notFound();

  const creator = w.creatorId ? getArtist(w.creatorId) : undefined;
  const relatedMovements = w.movementIds.map((id) => getMovement(id)).filter(Boolean);
  const sources = getSources(w.sourceIds);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav aria-label="パンくず" className="mb-6 text-sm text-faint">
        <Link href="/movements/" className="hover:text-ink">ムーブメント</Link>
        <span className="mx-2">/</span>
        <span className="text-muted">作品</span>
      </nav>

      <div className="grid gap-8 sm:grid-cols-2">
        <WorkImage
          work={w}
          className="w-full"
          sizes="(max-width: 640px) 92vw, 400px"
          showCredit
          showReferenceLink
        />
        <div>
          <h1 className="font-serif text-3xl leading-tight">{w.titleJa}</h1>
          {w.titleOriginal && <p className="mt-1 text-sm text-faint">{w.titleOriginal}</p>}
          <p className="mt-3 text-sm text-muted">
            {creator ? (
              <Link href={`/artists/${creator.id}/`} className="prose-link">{w.creatorName}</Link>
            ) : (
              w.creatorName
            )}
            ・{w.year}
          </p>
          <div className="mt-3">
            <VerificationBadge status={w.verification} />
          </div>
        </div>
      </div>

      <section className="mt-8">
        <p className="leading-relaxed text-ink">{w.description}</p>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-xl">作品情報</h2>
        <dl className="mt-2">
          <Row label="制作者" value={w.creatorName} />
          <Row label="制作年" value={w.year} />
          <Row label="素材・技法" value={w.medium} />
          <Row label="所蔵先" value={w.collection} />
        </dl>
      </section>

      <section className="mt-6">
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

      {!w.image && (
        <p className="mt-6 rounded-sm border hairline bg-surface p-3 text-xs text-muted">
          この作品の画像は、ライセンス・出典を確認できたパブリックドメイン画像のみを掲載する方針のため、現在はプレースホルダー表示です。
          出典不明・権利未確認の画像は使用しません。詳細は
          <Link href="/about/" className="prose-link">編集方針</Link>をご覧ください。
        </p>
      )}

      <section className="mt-6">
        <h2 className="font-serif text-xl">出典</h2>
        <div className="mt-3">
          <SourceList sources={sources} />
        </div>
      </section>
    </div>
  );
}
