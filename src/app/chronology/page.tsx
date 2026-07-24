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
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
          縦型年表
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
          八つの時代から展示室を選び、歴史の転換点、代表作品、
          ムーブメントの背景と次の展開を年代順にたどります。
        </p>
      </header>

      <div className="chronology-page__body">
        <ChronologyView movements={ordered} />
      </div>
    </main>
  );
}
