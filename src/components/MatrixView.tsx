'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LodControl } from '@/components/LodControl';
import { ERA_LABELS, ERA_ORDER, REGION_LABELS } from '@/lib/dataset';
import { filterMovementsByLod } from '@/lib/movement-hierarchy';
import { useLodState } from '@/lib/use-lod-state';
import type { Movement, RegionId } from '@/lib/schema';

const CELL_LIMIT = {
  core: 2,
  standard: 5,
  detailed: Number.POSITIVE_INFINITY,
} as const;

export function MatrixView({
  movements,
  regions,
}: {
  movements: Movement[];
  regions: RegionId[];
}) {
  const { lod, setLod } = useLodState('core');
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());
  const visible = useMemo(() => filterMovementsByLod(movements, lod), [lod, movements]);
  const counts = {
    core: filterMovementsByLod(movements, 'core').length,
    standard: filterMovementsByLod(movements, 'standard').length,
    detailed: filterMovementsByLod(movements, 'detailed').length,
  };

  const toggleCell = (key: string) => {
    setExpandedCells((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
      <LodControl
        value={lod}
        onChange={(next) => {
          setExpandedCells(new Set());
          setLod(next);
        }}
        counts={counts}
      />

      <div
        className="data-table-scroll mt-8 rounded-sm border hairline"
        data-matrix-lod={lod}
        role="region"
        aria-label="地域と時代のマトリクス表"
        tabIndex={0}
      >
        <table className="data-table matrix-table w-full text-sm">
          <caption className="sr-only">
            時代を列、地域を行とし、該当するムーブメントを各セルに示した表
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="data-table-corner matrix-corner border-b border-r hairline p-3 text-left text-xs text-muted"
                data-sticky-cell="corner"
              >
                地域 ＼ 時代
              </th>
              {ERA_ORDER.map((era) => (
                <th
                  key={era}
                  scope="col"
                  className="data-table-column-header min-w-[160px] border-b border-l hairline p-3 text-left font-serif text-sm"
                  data-sticky-cell="column"
                >
                  {ERA_LABELS[era]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr key={region}>
                <th
                  scope="row"
                  className="data-table-row-header matrix-row-header border-r border-t hairline p-3 text-left text-xs text-muted"
                  data-sticky-cell="row"
                >
                  {REGION_LABELS[region]}
                </th>
                {ERA_ORDER.map((era) => {
                  const key = `${region}:${era}`;
                  const cell = visible
                    .filter(
                      (movement) =>
                        movement.era === era && movement.regionIds.includes(region),
                    )
                    .sort(
                      (a, b) =>
                        (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
                        (b.displayOrder ?? Number.MAX_SAFE_INTEGER),
                    );
                  const expanded = expandedCells.has(key);
                  const shown = expanded ? cell : cell.slice(0, CELL_LIMIT[lod]);
                  const hiddenCount = cell.length - shown.length;

                  return (
                    <td
                      key={era}
                      className="border-l border-t hairline align-top p-2"
                      data-matrix-cell={key}
                    >
                      {cell.length === 0 ? (
                        <span aria-hidden="true" className="text-faint">−</span>
                      ) : (
                        <>
                          <ul className="space-y-1">
                            {shown.map((movement) => (
                              <li key={movement.id}>
                                <Link
                                  href={`/movements/${movement.id}/`}
                                  className="block border-l-2 border-accent/45 bg-accent/10 px-2 py-1 text-xs text-ink hover:bg-accent/20"
                                >
                                  {movement.shortLabel ?? movement.nameJa}
                                </Link>
                              </li>
                            ))}
                          </ul>
                          {(hiddenCount > 0 || expanded) && cell.length > CELL_LIMIT[lod] && (
                            <button
                              type="button"
                              onClick={() => toggleCell(key)}
                              aria-expanded={expanded}
                              className="mt-2 min-h-11 w-full border-t hairline text-left text-xs font-bold text-muted hover:text-ink"
                            >
                              {expanded ? '折りたたむ' : `+${hiddenCount}`}
                              <span className="sr-only">
                                {REGION_LABELS[region]}、{ERA_LABELS[era]}のセル
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
