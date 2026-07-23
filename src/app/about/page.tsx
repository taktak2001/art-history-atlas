import type { Metadata } from 'next';
import Link from 'next/link';
import { CLASSIFICATION_LABELS } from '@/lib/dataset';
import { VERIFICATION_LABELS } from '@/lib/schema';

export const metadata: Metadata = {
  title: '編集方針・分類基準',
  description: '本サイトの編集方針、分類の考え方、情報の確認状態、注意事項について。',
};

const principles = [
  {
    t: '発展史観を単純化しない',
    d: '「未熟な中世から写実的なルネサンスへ進歩した」という直線的な説明を避けます。各時代にはそれぞれ異なる目的・価値基準・鑑賞環境がありました。',
  },
  {
    t: 'カメラの発明を単純な断絶として扱わない',
    d: '写真の登場で絵画が写実から解放された、という単純化を避けます。写真以前の絵画にも、宗教・儀礼・権力の正当化・記憶・教育・装飾・身分表示・空間構成・想像世界の可視化といった多様な機能がありました。',
  },
  {
    t: '地域差を示す',
    d: '同時代のイタリア・北方ヨーロッパ・日本などを比較し、単一の時間軸へ無理に統合しません。時代×地域マトリクスはこの方針を体現しています。',
  },
  {
    t: '思想と形式を接続する',
    d: '「明暗が強い」「平面的である」といった形式上の特徴を、宗教・哲学・制度・技術・鑑賞者の身体とどう関係するかまで含めて説明します。',
  },
  {
    t: '鑑賞者の視点の変化を横断テーマとして扱う',
    d: '象徴的空間／単一視点遠近法／鑑賞者の空間への巻き込み／主観的知覚／平面性／物質性／身体性／展示空間／インスタレーション／没入環境／デジタル空間、という受容の変化を重要な軸として扱います。',
  },
];

const sourcePolicy = [
  '複数資料で確認できない事項は断定しない',
  '年代に諸説がある場合は幅を持たせ、注記する',
  '学術的に議論がある内容は「見解の一つ」と明示する',
  '事実と解釈を区別する',
  'AIの推論を歴史的事実として記載しない',
  '出典を確認できない項目には「要確認」フラグを付ける',
  '自動生成された架空の引用やURLを作らない',
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">About</p>
      <h1 className="mt-3 font-serif text-3xl">編集方針・分類基準・注意事項</h1>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">このサイトの目的</h2>
        <p className="mt-3 leading-relaxed text-muted">
          美術史とは様式名を暗記するものではなく、社会・思想・技術・制度と視覚表現の相互作用を理解するものだと考えます。
          本サイトは、各ムーブメントを「何を問題として生まれ、前時代の何を継承・否定し、どの思想・社会状況・制度と結びつき、
          同時代の他地域で何が起きていて、後世へ何を引き継いだか」という関係の中で捉える学習ツールです。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">編集原則</h2>
        <ol className="mt-4 space-y-4">
          {principles.map((p, i) => (
            <li key={i} className="border-l-2 hairline pl-4">
              <h3 className="font-serif text-lg text-ink">{i + 1}. {p.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{p.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">分類の基準</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          「時代区分」「様式」「芸術運動」「流派」「芸術家集団」「制作傾向」「方法論・理論」という異なる概念を区別し、同じ階層に混在させません。
          たとえば「バロック」は様式、「印象派」は芸術運動、「具体美術協会」は芸術家集団、「コンセプチュアル・アート」は方法論・理論として扱います。
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {(Object.keys(CLASSIFICATION_LABELS) as Array<keyof typeof CLASSIFICATION_LABELS>).map((k) => (
            <li key={k} className="rounded-sm border hairline bg-surface px-3 py-2 text-sm text-muted">
              {CLASSIFICATION_LABELS[k]}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">情報の品質と出典</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          初期データは、美術館・大学・研究機関・専門プラットフォーム（The Met、MoMA、Tate、Guggenheim、Smarthistory 等）の
          公開情報を実際に調査して作成しています。次の方針を守ります。
        </p>
        <ul className="mt-4 space-y-2">
          {sourcePolicy.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">情報の確認状態</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          各項目には確認状態を付しています。色だけに依存せず、記号とテキストでも示します。
        </p>
        <ul className="mt-4 space-y-1 text-sm text-muted">
          {(Object.keys(VERIFICATION_LABELS) as Array<keyof typeof VERIFICATION_LABELS>).map((k) => (
            <li key={k}>・{VERIFICATION_LABELS[k]}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">画像の扱い</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          作品画像は、著作権・ライセンスを確認できたパブリックドメイン画像（Wikimedia Commons、The Met Open Access、Art Institute of Chicago、
          Rijksmuseum 等）のみを掲載する方針です。ライセンス・出典・クレジット・最終確認日を各画像に保存し、確認できない画像は使用せず、
          架空画像を用いずにプレースホルダーを表示します。現行版では検証済み画像を同梱していない作品が多く、順次追加していきます。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">注意事項</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          本サイトは教育目的の非営利プロジェクトです。年代・解釈には学術的な議論があり、記述は入門的な整理にとどまります。
          正確な研究には、各ムーブメント詳細ページの
          <Link href="/sources/" className="prose-link">出典</Link>
          や専門文献を直接ご参照ください。誤りにお気づきの場合は出典に基づく修正を歓迎します。
        </p>
      </section>
    </div>
  );
}
