import type { Metadata } from 'next';
import { movementsChronological } from '@/lib/dataset';
import { ChronologyView } from '@/components/ChronologyView';
import { EditorialPageHeader } from '@/components/EditorialPageHeader';

export const metadata: Metadata = {
  title: '縦型年表',
  description: '年代順にムーブメントを閲覧する。モバイルでの主要な閲覧画面。',
};

export default function ChronologyPage() {
  const ordered = movementsChronological();

  return (
    <div className="chronology-page">
      <EditorialPageHeader
        className="chronology-page__header"
        englishTitle="CHRONOLOGY"
        japaneseTitle="縦型年表"
        description={<p>展示室を選んで、美術史を読む</p>}
      />

      <div className="chronology-page__body">
        <ChronologyView movements={ordered} />
      </div>
    </div>
  );
}
