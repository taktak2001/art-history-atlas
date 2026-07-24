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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">Chronology</p>
      <h1 className="mt-3 font-serif text-3xl">縦型年表</h1>
      <p className="mt-3 text-sm text-muted">
        年代順（開始年）に並べたムーブメント。時代区分ごとに区切っています。
      </p>

      <div className="mt-6">
        <ChronologyView movements={ordered} />
      </div>
    </div>
  );
}
