import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  movements,
  getMovement,
  getSources,
  artistsOf,
  worksOf,
  outgoingRelationships,
  incomingRelationships,
  formatDateRange,
  REGION_LABELS,
} from '@/lib/dataset';
import type { Movement } from '@/lib/schema';
import { ClassificationBadge, RegionBadges, VerificationBadge, RelationBadge } from '@/components/Badges';
import { SourceList } from '@/components/SourceList';
import { WorkImage } from '@/components/WorkImage';

export function generateStaticParams() {
  return movements.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getMovement(slug);
  if (!m) return { title: 'ムーブメントが見つかりません' };
  return {
    title: `${m.nameJa}（${m.nameEn}）`,
    description: m.summary,
  };
}

/** ラベル付きの本文ブロック（任意項目は空なら描画しない） */
function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="border-t hairline py-4">
      <dt className="text-xs uppercase tracking-wider text-faint">{label}</dt>
      <dd className="mt-1.5 whitespace-pre-line leading-relaxed text-ink">{value}</dd>
    </div>
  );
}

function SectionNav() {
  const items = [
    ['summary', '要約'],
    ['context', '思想・背景'],
    ['relation', '前時代との関係'],
    ['visual', '視覚・技法'],
    ['system', '制作・流通制度'],
    ['people', '作家・作品'],
    ['network', '同時代・後世'],
    ['viewing', '鑑賞ポイント'],
    ['sources', '出典'],
  ];
  return (
    <nav aria-label="ページ内ナビゲーション" className="hidden xl:block">
      <ul className="sticky top-24 space-y-1 text-sm">
        {items.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} className="block rounded px-2 py-1 text-muted hover:text-ink">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default async function MovementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m: Movement | undefined = getMovement(slug);
  if (!m) notFound();

  const sources = getSources(m.sourceIds);
  const artists = artistsOf(m);
  const works = worksOf(m);
  const outgoing = outgoingRelationships(m.id);
  const incoming = incomingRelationships(m.id);

  return (
    <div className="mx-auto max-w-layout px-4 py-8">
      <nav aria-label="パンくず" className="mb-6 text-sm text-faint">
        <Link href="/movements/" className="hover:text-ink">ムーブメント</Link>
        <span className="mx-2">/</span>
        <span className="text-muted">{m.nameJa}</span>
      </nav>

      <div className="grid gap-10 xl:grid-cols-[1fr_180px]">
        <article className="min-w-0 max-w-3xl">
          {/* ヘッダー */}
          <header className="border-b hairline pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <ClassificationBadge kind={m.classification} />
              <span className="text-sm tabular-nums text-muted">{formatDateRange(m)}</span>
            </div>
            <h1 className="mt-3 font-serif text-4xl leading-tight">{m.nameJa}</h1>
            <p className="mt-1 text-sm uppercase tracking-wider text-faint">{m.nameEn}</p>
            {m.aliases.length > 0 && (
              <p className="mt-2 text-sm text-muted">別名・関連名称：{m.aliases.join('、')}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <RegionBadges regionIds={m.regionIds} />
              {m.cities.length > 0 && (
                <span className="text-sm text-muted">主な都市：{m.cities.join('、')}</span>
              )}
            </div>
            <div className="mt-3">
              <VerificationBadge status={m.verification} />
            </div>
          </header>

          {/* 要約 */}
          <section id="summary" className="scroll-mt-24 py-6">
            <p className="font-serif text-lg leading-relaxed text-ink">{m.summary}</p>
          </section>

          {/* 思想・背景 */}
          <section id="context" className="scroll-mt-24">
            <h2 className="font-serif text-xl">思想と歴史的背景</h2>
            <dl className="mt-2">
              <Field label="中心思想" value={m.coreIdea} />
              <Field label="社会的背景" value={m.socialContext} />
              <Field label="政治的背景" value={m.politicalContext} />
              <Field label="宗教的背景" value={m.religiousContext} />
              <Field label="哲学・思想史との関連" value={m.philosophy} />
              <Field label="技術革新との関連" value={m.technologyContext} />
            </dl>
          </section>

          {/* 前時代との関係 */}
          <section id="relation" className="scroll-mt-24 pt-8">
            <h2 className="font-serif text-xl">前時代との関係</h2>
            <dl className="mt-2">
              <Field label="前時代・既存様式への反発" value={m.reactionAgainst} />
              <Field label="前時代から継承した要素" value={m.inheritedFrom} />
            </dl>
          </section>

          {/* 視覚・技法 */}
          <section id="visual" className="scroll-mt-24 pt-8">
            <h2 className="font-serif text-xl">視覚的特徴・技法</h2>
            <dl className="mt-2">
              <Field label="視覚的特徴" value={m.visualTraits} />
              <Field label="構図・空間表現" value={m.compositionSpace} />
              <Field label="色彩・光の扱い" value={m.colorLight} />
              <Field label="技法" value={m.technique} />
              <Field label="素材" value={m.materials} />
              <Field label="主な主題" value={m.subjects} />
            </dl>
          </section>

          {/* 制作・流通制度 */}
          <section id="system" className="scroll-mt-24 pt-8">
            <h2 className="font-serif text-xl">制作・流通の制度</h2>
            <dl className="mt-2">
              <Field label="芸術家の社会的地位" value={m.artistStatus} />
              <Field label="制作制度" value={m.productionSystem} />
              <Field label="パトロン・注文主" value={m.patronage} />
              <Field label="展示・流通・市場" value={m.marketExhibition} />
              <Field label="主な鑑賞者" value={m.audience} />
            </dl>
          </section>

          {/* 作家・作品 */}
          <section id="people" className="scroll-mt-24 pt-8">
            <h2 className="font-serif text-xl">主要作家・代表作品</h2>
            {artists.length > 0 && (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {artists.map((a) => (
                  <li key={a.id}>
                    <Link href={`/artists/${a.id}/`} className="block border hairline bg-raised p-3 hover:border-ink/30">
                      <span className="font-serif text-ink">{a.nameJa}</span>
                      {a.nameOriginal && <span className="ml-1 text-xs text-faint">{a.nameOriginal}</span>}
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{a.bio}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {works.length > 0 && (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {works.map((w) => (
                  <li key={w.id}>
                    <Link href={`/works/${w.id}/`} className="block">
                      <WorkImage work={w} />
                      <p className="mt-2 font-serif text-sm text-ink">{w.titleJa}</p>
                      <p className="text-xs text-faint">{w.creatorName}・{w.year}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {artists.length === 0 && works.length === 0 && (
              <p className="mt-3 text-sm text-faint">個別の作家・作品データは今後追加予定です。</p>
            )}
          </section>

          {/* 同時代・後世 */}
          <section id="network" className="scroll-mt-24 pt-8">
            <h2 className="font-serif text-xl">同時代の運動・後世への影響</h2>
            <dl className="mt-2">
              <Field label="後世への影響" value={m.legacy} />
              <Field label="現代美術との接続" value={m.contemporaryConnection} />
            </dl>

            {(outgoing.length > 0 || incoming.length > 0) && (
              <div className="mt-4 space-y-4">
                {outgoing.length > 0 && (
                  <div>
                    <h3 className="text-sm text-muted">このムーブメントから</h3>
                    <ul className="mt-2 space-y-2">
                      {outgoing.map((r) => {
                        const to = getMovement(r.to);
                        return to ? (
                          <li key={r.id} className="text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <RelationBadge kind={r.kind} />
                              <span className="text-faint">→</span>
                              <Link href={`/movements/${to.id}/`} className="font-serif text-ink hover:text-accent">{to.nameJa}</Link>
                            </div>
                            <p className="mt-0.5 text-muted">{r.note}</p>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
                {incoming.length > 0 && (
                  <div>
                    <h3 className="text-sm text-muted">このムーブメントへ</h3>
                    <ul className="mt-2 space-y-2">
                      {incoming.map((r) => {
                        const from = getMovement(r.from);
                        return from ? (
                          <li key={r.id} className="text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link href={`/movements/${from.id}/`} className="font-serif text-ink hover:text-accent">{from.nameJa}</Link>
                              <RelationBadge kind={r.kind} />
                              <span className="text-faint">→ 本項</span>
                            </div>
                            <p className="mt-0.5 text-muted">{r.note}</p>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 鑑賞ポイント */}
          <section id="viewing" className="scroll-mt-24 pt-8">
            <h2 className="font-serif text-xl">鑑賞時の着眼点</h2>
            <ul className="mt-3 space-y-2">
              {m.viewingPoints.map((p, i) => (
                <li key={i} className="flex gap-3 text-ink">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              検索用キーワード：{m.keywords.join('、')}
            </p>
          </section>

          {/* 出典 */}
          <section id="sources" className="scroll-mt-24 pt-8">
            <h2 className="font-serif text-xl">参考文献・出典</h2>
            <p className="mt-1 text-sm text-muted">
              地域：{m.regionIds.map((r) => REGION_LABELS[r]).join('・')}。記述はこれらの資料に基づきます。
            </p>
            <div className="mt-3">
              <SourceList sources={sources} />
            </div>
          </section>

          <div className="mt-10 flex flex-wrap gap-3 border-t hairline pt-6">
            <Link href="/movements/" className="text-sm prose-link">← 一覧へ戻る</Link>
            <Link href={`/compare/?ids=${m.id}`} className="text-sm prose-link">このムーブメントを比較に追加 →</Link>
            <Link href="/network/" className="text-sm prose-link">関係ネットワークで見る →</Link>
          </div>
        </article>

        <SectionNav />
      </div>
    </div>
  );
}
