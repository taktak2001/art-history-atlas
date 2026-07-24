import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
  CLASSIFICATION_LABELS,
} from '@/lib/dataset';
import { buildHeroSummary, toDisplayText } from '@/lib/movement-detail';
import type { Movement } from '@/lib/schema';
import { VerificationBadge, RelationBadge } from '@/components/Badges';
import { SourceList } from '@/components/SourceList';
import { CatalogueWorkList } from '@/components/CatalogueWorkList';

export function generateStaticParams() {
  return movements.map((movement) => ({ slug: movement.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const movement = getMovement(slug);
  if (!movement) return { title: 'ムーブメントが見つかりません' };
  return {
    title: `${movement.nameJa}（${movement.nameEn}）`,
    description: movement.summary,
  };
}

const BAND_TONES = {
  paper: 'bg-paper',
  warm: 'bg-surface',
  white: 'bg-raised',
} as const;

const SUBSECTION_HEADING_CLASS =
  'font-serif text-xl leading-snug text-ink sm:text-[22px]';

function Chapter({
  id,
  number,
  title,
  tone,
  children,
}: {
  id: string;
  number: string;
  title: string;
  tone: keyof typeof BAND_TONES;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-32 border-t hairline ${BAND_TONES[tone]}`}
    >
      <div className="mx-auto max-w-layout px-4 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-7 md:grid-cols-[112px_minmax(0,1fr)] md:gap-10">
          <p
            aria-hidden="true"
            className="font-serif text-[56px] leading-none text-faint md:text-[76px]"
          >
            {number}
          </p>
          <div className="min-w-0">
            <h2
              id={`${id}-title`}
              className="font-serif text-[28px] leading-tight text-ink sm:text-[34px]"
            >
              {title}
            </h2>
            <div className="mt-10">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Subsection({
  id,
  title,
  children,
  className = '',
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className={className}>
      <h3 id={`${id}-title`} className={SUBSECTION_HEADING_CLASS}>
        {title}
      </h3>
      <div className="detail-body mt-4 max-w-[38em] text-[15px] leading-[1.95] text-ink sm:text-base">
        {children}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[13px] font-bold text-muted">{label}</dt>
      <dd className="mt-2 max-w-[38em] whitespace-pre-line leading-[1.95] text-ink">
        {toDisplayText(value)}
      </dd>
    </div>
  );
}

function Passage({
  kind,
  children,
}: {
  kind: '事実' | '学説上の注意' | '鑑賞ポイント';
  children: ReactNode;
}) {
  if (kind === '学説上の注意') {
    return (
      <aside
        aria-label={kind}
        className="max-w-[42em] border-l-2 border-accent/55 bg-surface/70 px-5 py-4 sm:px-6"
      >
        <p className="text-[13px] font-bold text-muted">{kind}</p>
        <div className="mt-2 leading-[1.9] text-ink">
          {typeof children === 'string' ? toDisplayText(children) : children}
        </div>
      </aside>
    );
  }

  return (
    <div className="max-w-[42em]">
      <p className="text-[13px] font-bold text-muted">{kind}</p>
      <div className="mt-2 leading-[1.95] text-ink">
        {typeof children === 'string' ? toDisplayText(children) : children}
      </div>
    </div>
  );
}

function MiniContents() {
  const items = [
    ['summary', '概要'],
    ['context', '思想'],
    ['visual', '技法'],
    ['system', '制度'],
    ['works', '作品'],
    ['network', '影響'],
    ['sources', '出典'],
  ];

  return (
    <nav
      aria-label="詳細ページ目次"
      className="sticky top-[68px] z-30 border-y hairline bg-paper/95 backdrop-blur"
    >
      <ul className="scroll-x mx-auto flex max-w-layout gap-1 px-4 py-2.5 sm:justify-center">
        {items.map(([id, label]) => (
          <li key={id} className="shrink-0">
            <a
              href={`#${id}`}
              className="block px-3 py-2 text-sm font-medium text-muted hover:text-ink"
            >
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
  const movement: Movement | undefined = getMovement(slug);
  if (!movement) notFound();

  const sources = getSources(movement.sourceIds);
  const artists = artistsOf(movement);
  const works = worksOf(movement);
  const outgoing = outgoingRelationships(movement.id);
  const incoming = incomingRelationships(movement.id);
  const heroSummary = buildHeroSummary(movement.summary);
  const dateLabel = formatDateRange(movement).replaceAll('–', '-');
  const regions = movement.regionIds.map((region) => REGION_LABELS[region]).join('、');
  const quickSummary = [
    ['中心テーマ', movement.coreIdea],
    ['主要素材', movement.materials],
    ['空間表現', movement.compositionSpace],
    ['鑑賞環境', movement.audience],
  ];

  return (
    <article>
      <header id="summary" className="scroll-mt-32 bg-paper">
        <div className="mx-auto max-w-layout px-4 pb-14 pt-7 sm:pb-16 sm:pt-10">
          <nav aria-label="パンくず" className="mb-10 text-sm text-faint">
            <Link href="/movements/" className="hover:text-ink">
              ムーブメント
            </Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-muted">{toDisplayText(movement.nameJa)}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
            <div className="min-w-0">
              <p className="text-sm font-bold text-muted">
                {CLASSIFICATION_LABELS[movement.classification]}
              </p>
              <h1 className="mt-4 max-w-[15em] font-serif text-5xl leading-[1.2] tracking-tight text-ink sm:text-[56px] lg:text-[64px]">
                {toDisplayText(movement.nameJa)}
              </h1>
              <p className="mt-3 font-serif text-base tracking-[0.08em] text-faint sm:text-lg">
                {toDisplayText(movement.nameEn)}
              </p>
              <p
                className="mt-8 max-w-[38em] font-serif text-lg leading-[1.95] text-ink sm:text-xl"
                data-hero-summary
              >
                {heroSummary}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#works"
                  className="whitespace-nowrap bg-ink px-5 py-3 text-sm font-bold text-paper transition-opacity hover:opacity-80 active:translate-y-px"
                >
                  代表作品を見る
                </a>
                <Link
                  href="/network/"
                  className="whitespace-nowrap border hairline bg-raised px-5 py-3 text-sm font-bold text-ink hover:border-ink/40 active:translate-y-px"
                >
                  関係ネットワーク
                </Link>
                <Link
                  href={`/compare/?ids=${movement.id}`}
                  className="whitespace-nowrap border hairline px-5 py-3 text-sm font-bold text-ink hover:border-ink/40 active:translate-y-px"
                >
                  比較に追加
                </Link>
              </div>
            </div>

            <dl className="self-end border-t hairline pt-5">
              <div className="grid grid-cols-[76px_1fr] gap-4 py-2">
                <dt className="text-[13px] font-bold text-muted">年代</dt>
                <dd className="tabular-nums text-ink">{dateLabel}</dd>
              </div>
              <div className="grid grid-cols-[76px_1fr] gap-4 py-2">
                <dt className="text-[13px] font-bold text-muted">地域</dt>
                <dd className="text-ink">{regions}</dd>
              </div>
              {movement.cities.length > 0 && (
                <div className="grid grid-cols-[76px_1fr] gap-4 py-2">
                  <dt className="text-[13px] font-bold text-muted">主な都市</dt>
                  <dd className="text-ink">
                    {toDisplayText(movement.cities.join('、'))}
                  </dd>
                </div>
              )}
              <div className="grid grid-cols-[76px_1fr] gap-4 py-2">
                <dt className="text-[13px] font-bold text-muted">確認状態</dt>
                <dd><VerificationBadge status={movement.verification} /></dd>
              </div>
              {movement.aliases.length > 0 && (
                <div className="mt-4 border-t hairline pt-4">
                  <dt className="text-[13px] font-bold text-muted">別名・関連名称</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-faint">
                    {toDisplayText(movement.aliases.join('、'))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <section aria-labelledby="quick-summary-title" className="border-t hairline bg-raised">
          <div className="mx-auto max-w-layout px-4 py-9">
            <h2 id="quick-summary-title" className="sr-only">クイックサマリー</h2>
            <dl className="grid grid-cols-2 gap-x-7 gap-y-8 lg:grid-cols-4 lg:gap-x-10">
              {quickSummary.map(([label, value]) => (
                <div key={label} className="border-t hairline pt-3">
                  <dt className="text-[13px] font-bold text-muted">{label}</dt>
                  <dd
                    className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink"
                    title={toDisplayText(value)}
                  >
                    {toDisplayText(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </header>

      <MiniContents />

      <Chapter id="context" number="01" title="思想と歴史的背景" tone="paper">
        <div className="space-y-10">
          <Subsection id="context-core-idea" title="中心となる考え">
            <p>{toDisplayText(movement.coreIdea)}</p>
          </Subsection>
          <dl className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
            <Field label="社会的背景" value={movement.socialContext} />
            <Field label="政治的背景" value={movement.politicalContext} />
            <Field label="宗教的背景" value={movement.religiousContext} />
            <Field label="哲学・思想史との関連" value={movement.philosophy} />
            <Field label="技術革新との関連" value={movement.technologyContext} />
          </dl>
          {movement.dates.note && (
            <Passage kind="学説上の注意">{movement.dates.note}</Passage>
          )}
        </div>
      </Chapter>

      <Chapter id="relation" number="02" title="何が新しかったか" tone="warm">
        <div className="grid gap-9 md:grid-cols-2 md:gap-12">
          <Subsection id="relation-changed" title="転換したこと">
            <p>{toDisplayText(movement.reactionAgainst)}</p>
          </Subsection>
          <Subsection
            id="relation-inherited"
            title="継承したこと"
            className="border-l hairline pl-6 md:pl-8"
          >
            <p>{toDisplayText(movement.inheritedFrom)}</p>
          </Subsection>
        </div>
      </Chapter>

      <Chapter id="visual" number="03" title="視覚的特徴と技法" tone="white">
        <div className="space-y-10">
          <Passage kind="事実">{movement.visualTraits}</Passage>
          <dl className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
            <Field label="構図・空間表現" value={movement.compositionSpace} />
            <Field label="色彩・光の扱い" value={movement.colorLight} />
            <Field label="技法" value={movement.technique} />
            <Field label="素材" value={movement.materials} />
            <Field label="主な主題" value={movement.subjects} />
          </dl>
        </div>
      </Chapter>

      <Chapter id="system" number="04" title="制作と受容" tone="paper">
        <div className="space-y-12">
          <Passage kind="事実">{movement.marketExhibition}</Passage>
          <dl className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
            <Field label="芸術家の社会的地位" value={movement.artistStatus} />
            <Field label="制作制度" value={movement.productionSystem} />
            <Field label="パトロン・注文主" value={movement.patronage} />
            <Field label="展示・流通・市場" value={movement.marketExhibition} />
            <Field label="主な鑑賞者" value={movement.audience} />
          </dl>

          <div>
            <h3 className={SUBSECTION_HEADING_CLASS}>主要作家</h3>
            {artists.length > 0 ? (
              <ul className="mt-5 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {artists.map((artist) => (
                  <li key={artist.id} className="border-t hairline pt-4">
                    <Link
                      href={`/artists/${artist.id}/`}
                      className="font-serif text-xl text-ink hover:text-accent"
                    >
                      {toDisplayText(artist.nameJa)}
                    </Link>
                    {artist.nameOriginal && (
                      <p className="mt-1 text-sm text-faint">
                        {toDisplayText(artist.nameOriginal)}
                      </p>
                    )}
                    <p className="mt-3 leading-relaxed text-muted">
                      {toDisplayText(artist.bio)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-faint">
                個別の作家データは今後追加予定です。
              </p>
            )}
          </div>
        </div>
      </Chapter>

      <Chapter id="works" number="05" title="代表作品" tone="warm">
        <span id="people" className="block scroll-mt-32" aria-hidden="true" />
        <CatalogueWorkList works={works} />
      </Chapter>

      <Chapter id="network" number="06" title="後世への影響" tone="white">
        <div className="space-y-12">
          <Subsection id="network-legacy" title="後世に残したもの">
            <p>{toDisplayText(movement.legacy)}</p>
            <p className="mt-5">{toDisplayText(movement.contemporaryConnection)}</p>
          </Subsection>

          {(outgoing.length > 0 || incoming.length > 0) && (
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              {outgoing.length > 0 && (
                <section aria-labelledby="outgoing-title">
                  <h3 id="outgoing-title" className={SUBSECTION_HEADING_CLASS}>
                    この運動から
                  </h3>
                  <ul className="mt-5 space-y-7">
                    {outgoing.map((relation) => {
                      const to = getMovement(relation.to);
                      return to ? (
                        <li key={relation.id} className="border-t hairline pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <RelationBadge kind={relation.kind} />
                            <span className="text-faint" aria-hidden="true">→</span>
                            <Link
                              href={`/movements/${to.id}/`}
                              className="font-serif text-lg text-ink hover:text-accent"
                            >
                              {toDisplayText(to.nameJa)}
                            </Link>
                          </div>
                          <p className="mt-3 leading-relaxed text-muted">
                            {toDisplayText(relation.note)}
                          </p>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </section>
              )}
              {incoming.length > 0 && (
                <section aria-labelledby="incoming-title">
                  <h3 id="incoming-title" className={SUBSECTION_HEADING_CLASS}>
                    この運動へ
                  </h3>
                  <ul className="mt-5 space-y-7">
                    {incoming.map((relation) => {
                      const from = getMovement(relation.from);
                      return from ? (
                        <li key={relation.id} className="border-t hairline pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/movements/${from.id}/`}
                              className="font-serif text-lg text-ink hover:text-accent"
                            >
                              {toDisplayText(from.nameJa)}
                            </Link>
                            <RelationBadge kind={relation.kind} />
                            <span className="text-faint" aria-hidden="true">→ 本項</span>
                          </div>
                          <p className="mt-3 leading-relaxed text-muted">
                            {toDisplayText(relation.note)}
                          </p>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      </Chapter>

      <Chapter id="viewing" number="07" title="鑑賞ガイド" tone="paper">
        <Passage kind="鑑賞ポイント">
          <ol className="grid gap-6 sm:grid-cols-2">
            {movement.viewingPoints.map((point, index) => (
              <li key={point} className="border-t hairline pt-4">
                <span className="mr-3 font-serif text-lg text-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {toDisplayText(point)}
              </li>
            ))}
          </ol>
        </Passage>
        <p className="mt-10 max-w-[38em] text-sm leading-relaxed text-muted">
          <span className="font-bold">検索用キーワード</span>
          <span className="ml-3">
            {toDisplayText(movement.keywords.join('、'))}
          </span>
        </p>
      </Chapter>

      <Chapter id="sources" number="08" title="出典" tone="warm">
        <p className="mb-6 max-w-[38em] text-sm leading-relaxed text-muted">
          対象地域は{regions}です。記述は以下の美術館・研究機関等の資料に基づきます。
        </p>
        <div className="max-w-[48em]">
          <SourceList sources={sources} />
        </div>
        <nav
          aria-label="詳細ページの関連リンク"
          className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t hairline pt-6 text-sm"
        >
          <Link href="/movements/" className="prose-link">一覧へ戻る</Link>
          <Link href={`/compare/?ids=${movement.id}`} className="prose-link">
            比較に追加
          </Link>
          <Link href="/network/" className="prose-link">関係ネットワーク</Link>
        </nav>
      </Chapter>
    </article>
  );
}
