import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t hairline bg-paper">
      <div className="mx-auto max-w-layout px-4 py-10 text-sm text-muted sm:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-[1.2fr_1fr_1fr] sm:gap-10">
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              className="inline-flex flex-col leading-none text-ink"
              aria-label="Art History Atlas"
            >
              <span
                className="font-serif text-lg tracking-[0.12em]"
                aria-hidden="true"
              >
                ART HISTORY ATLAS
              </span>
            </Link>
          </div>
          <nav aria-label="フッターナビゲーション">
            <p className="font-bold text-ink">主要画面</p>
            <ul className="mt-3 space-y-2">
              <li><Link className="hover:text-ink" href="/timeline/">横型タイムライン</Link></li>
              <li><Link className="hover:text-ink" href="/matrix/">時代×地域マトリクス</Link></li>
              <li><Link className="hover:text-ink" href="/network/">関係ネットワーク</Link></li>
              <li><Link className="hover:text-ink" href="/compare/">比較</Link></li>
            </ul>
          </nav>
          <div>
            <p className="font-bold text-ink">出典・編集方針</p>
            <ul className="mt-3 space-y-2">
              <li><Link className="hover:text-ink" href="/sources/">出典一覧</Link></li>
              <li><Link className="hover:text-ink" href="/about/">編集方針・分類基準</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t hairline pt-5 text-xs text-faint">
          © {new Date().getFullYear()} Art History Atlas｜教育目的の非営利プロジェクト
        </p>
      </div>
    </footer>
  );
}
