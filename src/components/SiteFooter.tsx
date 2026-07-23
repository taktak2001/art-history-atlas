import Link from 'next/link';
import { movements, sources } from '@/lib/dataset';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t hairline">
      <div className="mx-auto max-w-layout px-4 py-10 text-sm text-muted">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-serif text-base text-ink">美術史アトラス</p>
            <p className="mt-2 leading-relaxed">
              美術史とは様式名を暗記するものではなく、社会・思想・技術・制度と視覚表現の相互作用を理解するもの。
            </p>
          </div>
          <nav aria-label="フッターナビゲーション">
            <p className="text-ink">各画面</p>
            <ul className="mt-2 space-y-1">
              <li><Link className="hover:text-ink" href="/timeline/">横型タイムライン</Link></li>
              <li><Link className="hover:text-ink" href="/chronology/">縦型年表</Link></li>
              <li><Link className="hover:text-ink" href="/matrix/">時代×地域マトリクス</Link></li>
              <li><Link className="hover:text-ink" href="/network/">関係ネットワーク</Link></li>
              <li><Link className="hover:text-ink" href="/compare/">比較</Link></li>
            </ul>
          </nav>
          <div>
            <p className="text-ink">情報について</p>
            <ul className="mt-2 space-y-1">
              <li><Link className="hover:text-ink" href="/sources/">出典一覧（{sources.length}件）</Link></li>
              <li><Link className="hover:text-ink" href="/about/">編集方針・分類基準</Link></li>
              <li><Link className="hover:text-ink" href="/movements/">ムーブメント一覧（{movements.length}件）</Link></li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-faint">
              本サイトの記述は公開された美術館・研究機関等の資料に基づきます。年代に諸説がある場合は幅を持たせ、解釈は「見解の一つ」として示します。
            </p>
          </div>
        </div>
        <p className="mt-8 text-xs text-faint">
          © {new Date().getFullYear()} Art History Atlas — 教育目的の非営利プロジェクト
        </p>
      </div>
    </footer>
  );
}
