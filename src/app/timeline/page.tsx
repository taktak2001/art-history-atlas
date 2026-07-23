import type { Metadata } from 'next';
import { movements, activeRegions } from '@/lib/dataset';
import { HorizontalTimeline } from '@/components/HorizontalTimeline';

export const metadata: Metadata = {
  title: '横型タイムライン',
  description: '年代を横軸に、複数ムーブメントの期間の重なりを地域別レーンで表示する。',
};

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-layout px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">Timeline</p>
      <h1 className="mt-3 font-serif text-3xl">横型タイムライン</h1>
      <p className="mt-3 max-w-prose text-sm text-muted">
        年代を横軸に、地域別のレーンでムーブメントの期間の重なりを示します。長期間の運動と短期間の運動の違い、
        同時代に異なる地域で起きていたことが読み取れます。バーを選ぶと詳細へ移動します。
      </p>
      <div className="mt-8">
        <HorizontalTimeline movements={movements} activeRegions={activeRegions()} />
      </div>
    </div>
  );
}
