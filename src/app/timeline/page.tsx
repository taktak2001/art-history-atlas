import type { Metadata } from 'next';
import { movements, activeRegions } from '@/lib/dataset';
import { HorizontalTimeline } from '@/components/HorizontalTimeline';

export const metadata: Metadata = {
  title: '横型タイムライン',
  description: '美術史の流れと転換を、時代別の表示範囲と地域レーンでたどる横型タイムライン。',
};

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-layout px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">Timeline</p>
      <h1 className="mt-3 font-serif text-3xl">横型タイムライン</h1>
      <p className="mt-3 max-w-prose text-sm text-muted">
        通史では継承と転換を要約し、時代別表示では実年代に基づく線形軸で
        同時代の動きを詳しく比較できます。
      </p>
      <div className="mt-8">
        <HorizontalTimeline
          movements={movements}
          activeRegions={activeRegions()}
        />
      </div>
    </div>
  );
}
