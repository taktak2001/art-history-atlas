import type { Metadata } from 'next';
import { activeRegions, movements } from '@/lib/dataset';
import { MatrixView } from '@/components/MatrixView';

export const metadata: Metadata = {
  title: '時代×地域マトリクス',
  description: '同時代に異なる地域で起きていた運動を比較する。西洋中心の一本道として表示しない。',
};

export default function MatrixPage() {
  const regions = activeRegions();

  return (
    <div className="matrix-page mx-auto max-w-layout px-4 py-7 sm:py-8">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">Matrix</p>
      <h1 className="mt-2 font-serif text-3xl">時代 × 地域マトリクス</h1>
      <p className="matrix-page__intro mt-2 max-w-[62ch] text-sm text-muted">
        横軸が時代、縦軸が地域。同時代に異なる地域で何が起きていたかを一望します。空欄は「その地域でこの時代の収録項目がない」ことを示すもので、
        美術活動の不在を意味しません。西洋美術史を唯一の発展経路として描かないための視点です。
      </p>

      <div className="mt-5">
        <MatrixView movements={movements} regions={regions} />
      </div>
      <p className="mt-4 text-xs text-faint">
        セルを選ぶと該当ムーブメントの詳細へ移動します。表内を縦横にスクロールして、全地域・全時代を確認できます。
      </p>
    </div>
  );
}
