import type { Metadata } from 'next';
import { MovementsExplorer } from '@/components/MovementsExplorer';
import { movements } from '@/lib/dataset';

export const metadata: Metadata = {
  title: 'ムーブメント一覧・検索',
  description: '収録している美術運動・様式・流派を検索・絞り込みで探す。',
};

export default function MovementsPage() {
  return (
    <div className="mx-auto max-w-layout px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">Movements</p>
      <h1 className="mt-3 font-serif text-3xl">ムーブメント一覧・検索</h1>
      <p className="mt-3 max-w-prose text-sm text-muted">
        全{movements.length}件。名称・作家・作品・地域・思想・技法・素材・キーワードで検索し、時代・地域・分類・情報確認状態で絞り込めます。
      </p>
      <div className="mt-8">
        <MovementsExplorer />
      </div>
    </div>
  );
}
