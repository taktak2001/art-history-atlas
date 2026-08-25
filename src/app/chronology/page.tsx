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
    <div className="chronology-page">
      <header className="chronology-page__header">
        <p className="text-xs uppercase tracking-[0.3em] text-faint">Chronology</p>
        <h1 className="mt-1.5 font-serif text-3xl tracking-tight sm:text-4xl">
          縦型年表
        </h1>
        <p className="mt-1 text-sm leading-6 text-muted">
          展示室を選んで、美術史を読む
        </p>
      </header>

      <div className="chronology-page__body">
        <ChronologyView movements={ordered} />
      </div>
    </div>
  );
}
