import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ERA_ORDER,
  ERA_LABELS,
  REGION_LABELS,
  activeRegions,
  matrixCell,
} from '@/lib/dataset';

export const metadata: Metadata = {
  title: '時代×地域マトリクス',
  description: '同時代に異なる地域で起きていた運動を比較する。西洋中心の一本道として表示しない。',
};

export default function MatrixPage() {
  const regions = activeRegions();

  return (
    <div className="mx-auto max-w-layout px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">Matrix</p>
      <h1 className="mt-3 font-serif text-3xl">時代 × 地域マトリクス</h1>
      <p className="mt-3 max-w-prose text-sm text-muted">
        横軸が時代、縦軸が地域。同時代に異なる地域で何が起きていたかを一望します。空欄は「その地域でこの時代の収録項目がない」ことを示すもので、
        美術活動の不在を意味しません。西洋美術史を唯一の発展経路として描かないための視点です。
      </p>

      <div className="scroll-x mt-8 rounded-sm border hairline">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">時代を列、地域を行とし、該当するムーブメントを各セルに示した表</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 border-b border-r hairline bg-surface p-3 text-left text-xs text-muted">
                地域 ＼ 時代
              </th>
              {ERA_ORDER.map((era) => (
                <th key={era} scope="col" className="min-w-[160px] border-b border-l hairline bg-surface p-3 text-left font-serif text-sm">
                  {ERA_LABELS[era]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr key={region}>
                <th scope="row" className="sticky left-0 z-10 border-r border-t hairline bg-raised p-3 text-left text-xs text-muted">
                  {REGION_LABELS[region]}
                </th>
                {ERA_ORDER.map((era) => {
                  const cell = matrixCell(era, region);
                  return (
                    <td key={era} className="border-l border-t hairline align-top p-2">
                      {cell.length === 0 ? (
                        <span aria-hidden="true" className="text-faint">—</span>
                      ) : (
                        <ul className="space-y-1">
                          {cell.map((m) => (
                            <li key={m.id}>
                              <Link
                                href={`/movements/${m.id}/`}
                                className="block rounded-sm bg-accent/10 px-2 py-1 text-xs text-ink hover:bg-accent/20"
                              >
                                {m.nameJa}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-faint">
        セルを選ぶと該当ムーブメントの詳細へ移動します。横スクロールで全時代を確認できます。
      </p>
    </div>
  );
}
