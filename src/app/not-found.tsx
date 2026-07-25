import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-layout flex-col items-center px-4 py-24 text-center">
      <p className="text-xs tracking-[0.22em] text-faint" aria-label="Art History Atlas">
        <span aria-hidden="true">ART HISTORY ATLAS</span>
      </p>
      <p className="font-serif text-6xl text-faint">404</p>
      <h1 className="mt-4 font-serif text-2xl">ページが見つかりません</h1>
      <p className="mt-3 max-w-prose text-sm text-muted">
        お探しのページは移動または削除された可能性があります。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-sm bg-ink px-4 py-2.5 text-sm text-paper">ホームへ</Link>
        <Link href="/movements/" className="rounded-sm border hairline px-4 py-2.5 text-sm">ムーブメント一覧</Link>
      </div>
    </div>
  );
}
