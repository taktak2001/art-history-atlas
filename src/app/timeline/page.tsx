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
        年代の厳密な長さよりも、様式の継承と転換を読みやすく配置しています。
        通史で全体像をつかみ、時代別の表示で同時代の動きを詳しく比較できます。
      </p>
      <div className="mt-8">
        <HorizontalTimeline movements={movements} activeRegions={activeRegions()} />
      </div>
    </div>
  );
}
