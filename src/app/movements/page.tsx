import type { Metadata } from 'next';
import { MovementsExplorer } from '@/components/MovementsExplorer';
import { MovementDirectorySidebar } from '@/components/MovementDirectorySidebar';
import { movements } from '@/lib/dataset';

export const metadata: Metadata = {
  title: 'ムーブメント一覧・検索',
  description: '収録している美術運動・様式・流派を検索・絞り込みで探す。',
};

export default function MovementsPage() {
  return (
    <div className="movements-directory-shell">
      <MovementDirectorySidebar />
      <div className="movements-directory-main">
        <header className="movements-directory-header">
          <div>
            <div className="movements-directory-heading">
              <h1>MOVEMENTS</h1>
              <p>ムーブメント一覧</p>
            </div>
            <p className="movements-directory-introduction">
              名称・作家・作品・地域・思想・技法・素材・キーワードから探し、時代や分類で絞り込めます。
            </p>
          </div>
          <p className="movements-directory-total" aria-label={`${movements.length}件のムーブメント`}>
            <strong>{movements.length}</strong>
            <span>movements</span>
          </p>
        </header>
        <MovementsExplorer />
      </div>
    </div>
  );
}
