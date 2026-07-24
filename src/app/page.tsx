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

export default function HomePage() {
  const recent = [...movements].slice(-4).reverse();

  return (
    <div className="mx-auto max-w-layout px-4">
      {/* 1. 主要な探索方法 */}
      <section className="home-hero border-b hairline" data-home-hero>
        <div>
          <h1 className="home-hero__title">
            美術史アトラス
          </h1>
          <p className="home-hero__tagline">
            発生・継承・転換から読む美術史。
          </p>
        </div>
        <nav className="home-hero__actions" aria-label="主要な探索方法">
          <Link href="/timeline/" className="home-hero__cta">
            横型タイムライン
          </Link>
          <Link href="/chronology/" className="home-hero__cta">
            縦型年表
          </Link>
          <Link href="/network/" className="home-hero__cta">
            関係ネットワーク
          </Link>
        </nav>
      </section>

      {/* 2. 時代を選ぶ入口 */}
      <section className="py-12" aria-labelledby="eras-heading">
        <h2 id="eras-heading" className="font-serif text-2xl">時代から入る</h2>
        <p className="mt-2 text-sm text-muted">
          各時代には、それぞれ異なる目的・価値基準・鑑賞環境があった。進歩の一本道としてではなく、並列する枠組みとして辿る。
        </p>
        <div className="mt-6 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {ERA_ORDER.map((era) => {
            const count = movements.filter((m) => m.era === era).length;
            return (
              <Link
                key={era}
                href={`/chronology/#era-${era}`}
                className="flex flex-col gap-1 bg-raised p-4 hover:bg-surface"
              >
                <span className="font-serif text-lg">{ERA_LABELS[era]}</span>
                <span className="text-xs text-faint">{count}件</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. 主要な転換点 */}
      <section className="border-t hairline py-12" aria-labelledby="turning-heading">
        <h2 id="turning-heading" className="font-serif text-2xl">主要な転換点</h2>
        <p className="mt-2 text-sm text-muted">視点・空間・制度の前提が大きく変わった局面。</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {turningPoints.map((id) => {
            const m = getMovement(id);
            return m ? <MovementCard key={id} movement={m} /> : null;
          })}
        </div>
      </section>

      {/* 5. 何への反発として生まれたか */}
      <section className="border-t hairline py-12" aria-labelledby="reaction-heading">
        <h2 id="reaction-heading" className="font-serif text-2xl">何への反発として生まれたか</h2>
        <p className="mt-2 text-sm text-muted">
          新しい様式は、前時代の何かへの応答として立ち上がる。反発の連鎖を辿る。
        </p>
        <ul className="mt-6 space-y-3">
          {reactionEdges.map((r) => {
            const from = getMovement(r.from);
            const to = getMovement(r.to);
            if (!from || !to) return null;
            return (
              <li key={r.id} className="border hairline bg-raised p-4">
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
                <p className="mt-2 text-sm text-muted">{r.note}</p>
              </li>
            );
          })}
        </ul>
        <Link href="/network/" className="mt-4 inline-block text-sm prose-link">
          関係ネットワーク全体を見る →
        </Link>
      </section>

      {/* 6. 地域別表示への導線 */}
      <section className="border-t hairline py-12" aria-labelledby="region-heading">
        <h2 id="region-heading" className="font-serif text-2xl">地域から見る</h2>
        <p className="mt-2 text-sm text-muted">
          同時代に、イタリア・北方ヨーロッパ・日本などで何が起きていたか。単一の時間軸へ無理に統合しない。
        </p>
        <Link href="/matrix/" className="mt-4 inline-block rounded-sm border hairline px-5 py-3 text-sm hover:border-ink/40">
          時代×地域マトリクスを開く →
        </Link>
      </section>

      {/* 7. 注目比較 */}
      <section className="border-t hairline py-12" aria-labelledby="compare-heading">
        <h2 id="compare-heading" className="font-serif text-2xl">注目の比較</h2>
        <p className="mt-2 text-sm text-muted">2つのムーブメントを、思想・制度・視覚表現の観点で並べて読む。</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredComparisons.map((c) => (
            <Link
              key={c.label}
              href={`/compare/?ids=${c.ids.join(',')}`}
              className="border hairline bg-raised p-4 text-sm hover:border-ink/30"
            >
              <span className="font-serif text-base text-ink">{c.label}</span>
              <span className="mt-1 block text-xs text-faint">比較して読む →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. 最近追加されたムーブメント */}
      <section className="border-t hairline py-12" aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="font-serif text-2xl">最近収録したムーブメント</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((m) => (
            <MovementCard key={m.id} movement={m} />
          ))}
        </div>
      </section>

      {/* 9. 情報の出典・編集方針 */}
      <section className="border-t hairline py-12" aria-labelledby="policy-heading">
        <h2 id="policy-heading" className="font-serif text-2xl">情報の出典と編集方針</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          記述は美術館・大学・研究機関等の公開資料に基づきます。複数資料で確認できない事項は断定せず、年代に諸説がある場合は幅を持たせ、
          学術的に議論のある内容は「見解の一つ」と明示します。事実と解釈を区別し、出典を各記述に紐づけています。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/sources/" className="text-sm prose-link">出典一覧を見る →</Link>
          <Link href="/about/" className="text-sm prose-link">編集方針・分類基準の詳細 →</Link>
        </div>
      </section>
    </div>
  );
}
