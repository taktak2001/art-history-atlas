import type { Metadata } from 'next';
import { movements, activeRegions } from '@/lib/dataset';
import { HorizontalTimeline } from '@/components/HorizontalTimeline';
import { EditorialPageHeader } from '@/components/EditorialPageHeader';

export const metadata: Metadata = {
  title: '横型タイムライン',
  description: '美術史の流れと転換を、時代別の表示範囲と地域レーンでたどる横型タイムライン。',
};

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-layout px-4 py-10">
      <EditorialPageHeader
        englishTitle="TIMELINE"
        japaneseTitle="横型タイムライン"
        description={
          <p>
            通史では継承と転換を要約し、時代別表示では実年代に基づく線形軸で
            同時代の動きを詳しく比較できます。
          </p>
        }
      />
      <div className="mt-6">
        <HorizontalTimeline
          movements={movements}
          activeRegions={activeRegions()}
        />
      </div>
    </div>
  );
}
