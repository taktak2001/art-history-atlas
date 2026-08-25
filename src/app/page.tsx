import Link from 'next/link';
import {
  movements,
  ERA_ORDER,
  ERA_LABELS,
  relationships,
  getMovement,
} from '@/lib/dataset';
import { MovementCard } from '@/components/MovementCard';
import { RelationBadge } from '@/components/Badges';

// 「何への反発として生まれたか」を示す代表的な反発関係
const reactionEdges = relationships.filter((r) => r.kind === 'reaction').slice(0, 5);

// 注目比較（要件の例に沿う）
const featuredComparisons = [
  { ids: ['gothic', 'italian-renaissance'], label: 'ゴシック × ルネサンス' },
  { ids: ['italian-renaissance', 'baroque'], label: 'ルネサンス × バロック' },
  { ids: ['neoclassicism', 'romanticism'], label: '新古典主義 × ロマン主義' },
  { ids: ['minimalism', 'mono-ha'], label: 'ミニマリズム × もの派' },
  { ids: ['light-and-space', 'immersive-digital'], label: 'Light and Space × 没入型' },
  { ids: ['gutai', 'abstract-expressionism'], label: '具体 × 抽象表現主義' },
];

const turningPoints = [
  'italian-renaissance',
  'baroque',
  'impressionism',
  'cubism',
  'dada',
  'minimalism',
];

const primaryExplorationLinks = [
  {
    // 利用頻度が高いため最上位に置く
    href: '/movements/',
    title: 'Movements',
    description: '名前・時代・地域から探す',
  },
  {
    href: '/timeline/',
    title: 'Timeline',
    description: '年代と地域の重なりを見る',
  },
  {
    href: '/chronology/',
    title: 'Chronology',
    description: '時代の流れを展示形式で読む',
  },
];

function HomeSectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div className="home-section-heading">
      <h2 id={id} className="home-section-heading__title">
        {title}
      </h2>
      <p className="home-section-heading__description">{description}</p>
    </div>
  );
}

export default function HomePage() {
  const recent = [...movements].slice(-4).reverse();

  return (
    <div className="mx-auto max-w-layout px-4">
      {/* 1. 主要な探索方法 */}
      <section className="home-hero border-b hairline" data-home-hero>
        <div>
          <h1 className="home-hero__title" aria-label="Art History Atlas">
            ART HISTORY ATLAS
          </h1>
        </div>
        <nav className="home-hero__actions" aria-label="主要な探索方法">
          {primaryExplorationLinks.map((item) => (
            <Link key={item.href} href={item.href} className="home-hero__cta">
              <span className="home-hero__cta-title">{item.title}</span>
              <span className="home-hero__cta-description">{item.description}</span>
            </Link>
          ))}
        </nav>
      </section>

      {/* 2. 時代を選ぶ入口 */}
      <section className="home-section" aria-labelledby="eras-heading">
        <HomeSectionHeading
          id="eras-heading"
          title="Explore by Era"
          description="時代ごとの価値基準から読む"
        />
        <div className="mt-5 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {ERA_ORDER.map((era, index) => {
            return (
              <Link
                key={era}
                href={`/chronology/#era-${era}`}
                className="home-compact-card flex flex-col gap-1 bg-raised hover:bg-surface"
                aria-label={`${ERA_LABELS[era]}を見る`}
              >
                {/* 章番号は時代名の左上に小さく添える（縦幅を増やさない） */}
                <span className="flex items-baseline gap-2">
                  <span className="home-era-index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-lg">{ERA_LABELS[era]}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. 主要な転換点 */}
      <section className="home-section border-t hairline" aria-labelledby="turning-heading">
        <HomeSectionHeading
          id="turning-heading"
          title="Turning Points"
          description="視点・空間・制度の前提が変わった局面"
        />
        <div className="home-card-grid mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {turningPoints.map((id) => {
            const m = getMovement(id);
            return m ? <MovementCard key={id} movement={m} /> : null;
          })}
        </div>
      </section>

      {/* 5. 何への反発として生まれたか */}
      <section className="home-section border-t hairline" aria-labelledby="reaction-heading">
        <HomeSectionHeading
          id="reaction-heading"
          title="Reactions & Breaks"
          description="前時代への応答と反発を辿る"
        />
        <ul className="mt-5 space-y-3">
          {reactionEdges.map((r) => {
            const from = getMovement(r.from);
            const to = getMovement(r.to);
            if (!from || !to) return null;
            return (
              <li key={r.id} className="home-compact-card bg-raised">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Link href={`/movements/${to.id}/`} className="font-serif text-ink hover:text-accent">
                    {to.nameJa}
                  </Link>
                  <RelationBadge kind={r.kind} />
                  <span className="text-faint">←</span>
                  <Link href={`/movements/${from.id}/`} className="text-muted hover:text-ink">
                    {from.nameJa}
                  </Link>
                </div>
                <p className="home-body-copy mt-1.5 text-sm text-muted">{r.note}</p>
              </li>
            );
          })}
        </ul>
        <Link href="/network/" className="mt-3 inline-block text-sm prose-link">
          関係ネットワーク全体を見る →
        </Link>
      </section>

      {/* 6. 注目比較 */}
      <section className="home-section border-t hairline" aria-labelledby="compare-heading">
        <HomeSectionHeading
          id="compare-heading"
          title="Comparisons"
          description="2つのムーブメントを並べて読む"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredComparisons.map((c) => (
            <Link
              key={c.label}
              href={`/compare/?ids=${c.ids.join(',')}`}
              className="home-compact-card bg-raised text-sm hover:bg-surface"
            >
              <span className="font-serif text-base text-ink">{c.label}</span>
              <span className="mt-1 block text-xs text-faint">比較して読む →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. 最近追加されたムーブメント */}
      <section className="home-section border-t hairline" aria-labelledby="recent-heading">
        <HomeSectionHeading
          id="recent-heading"
          title="Latest Additions"
          description="最近追加したムーブメント"
        />
        <div className="home-card-grid mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((m) => (
            <MovementCard key={m.id} movement={m} />
          ))}
        </div>
      </section>

      {/* 8. 情報の出典・編集方針 */}
      <section className="home-section border-t hairline" aria-labelledby="policy-heading">
        <HomeSectionHeading
          id="policy-heading"
          title="Sources & Methodology"
          description="出典・編集方針・分類基準"
        />
        <p className="home-body-copy mt-3 max-w-prose text-sm text-muted">
          記述は美術館・大学・研究機関等の公開資料に基づきます。複数資料で確認できない事項は断定せず、年代に諸説がある場合は幅を持たせ、
          学術的に議論のある内容は「見解の一つ」と明示します。事実と解釈を区別し、出典を各記述に紐づけています。
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/sources/" className="text-sm prose-link">出典一覧を見る →</Link>
          <Link href="/about/" className="text-sm prose-link">編集方針・分類基準の詳細 →</Link>
        </div>
      </section>
    </div>
  );
}
