import type { Metadata } from 'next';
import { movementsChronological } from '@/lib/dataset';
import { ChronologyView } from '@/components/ChronologyView';

export const metadata: Metadata = {
  title: '縦型年表',
  description: '年代順にムーブメントを閲覧する。モバイルでの主要な閲覧画面。',
};

export default function ChronologyPage() {
  const ordered = movementsChronological();

  return (
    <main className="chronology-page">
      <header className="chronology-page__header">
        <p className="text-xs uppercase tracking-[0.3em] text-faint">Chronology</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">
          縦型年表
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-8 text-muted">
          美術史を八つの展示室としてたどります。時代を開くと、歴史の転換点、代表作品、
          ムーブメントが生まれた背景と次の展開を年代順に見ることができます。
        </p>
        <p className="mt-5 text-xs tracking-[0.14em] text-faint">
          時代名を選んで展示を開く
        </p>
      </header>

      <div className="chronology-page__body">
        <ChronologyView movements={ordered} />
      </div>
    </main>
  );
}
