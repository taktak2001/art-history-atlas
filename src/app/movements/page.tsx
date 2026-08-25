import type { Metadata } from 'next';
import { MovementsExplorer } from '@/components/MovementsExplorer';
import { EditorialPageHeader } from '@/components/EditorialPageHeader';
import { movements } from '@/lib/dataset';

export const metadata: Metadata = {
  title: 'ムーブメント一覧・検索',
  description: '収録している美術運動・様式・流派を検索・絞り込みで探す。',
};

export default function MovementsPage() {
  return (
    <div className="movements-directory-main">
      <EditorialPageHeader
        englishTitle="MOVEMENTS"
        japaneseTitle="ムーブメント一覧"
        description={
          <p>
            名称・作家・作品・地域・思想・技法・素材・キーワードから探し、時代や分類で絞り込めます。
          </p>
        }
        aside={
          <p className="movements-directory-total" aria-label={`${movements.length}件のムーブメント`}>
            <strong>{movements.length}</strong>
            <span>movements</span>
          </p>
        }
      />
      <MovementsExplorer />
    </div>
  );
}
