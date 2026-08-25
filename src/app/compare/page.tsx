import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareBoard } from '@/components/CompareBoard';
import { EditorialPageHeader } from '@/components/EditorialPageHeader';

export const metadata: Metadata = {
  title: 'ムーブメント比較',
  description: '2〜4件のムーブメントを、思想・社会背景・視覚表現・制度の観点で横並びに比較する。URLで共有可能。',
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-layout px-4 py-10">
      <EditorialPageHeader
        englishTitle="COMPARE"
        japaneseTitle="ムーブメント比較"
        description={
          <p>
            2〜4件のムーブメントを、年代・地域・中心思想・社会背景・前時代への反応・視覚的特徴・技法素材・パトロン市場・後世への影響で比較します。
            比較状態はURLに反映され、共有できます。
          </p>
        }
      />
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-muted">読み込み中…</p>}>
          <CompareBoard />
        </Suspense>
      </div>
    </div>
  );
}
