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
        className="data-table-scroll matrix-scroll mt-8"
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
                className="data-table-corner matrix-corner p-3 text-left"
                data-sticky-cell="corner"
              >
                <span className="matrix-corner__region">地域</span>
                <span aria-hidden="true" className="matrix-corner__divider"> ＼ </span>
                <span className="matrix-corner__era">時代</span>
              </th>
              {ERA_ORDER.map((era) => (
                <th
                  key={era}
                  scope="col"
                  className="data-table-column-header matrix-era-header min-w-[160px] p-3 text-center"
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
                  className="data-table-row-header matrix-row-header p-3 text-left"
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
                      className="matrix-lane-cell align-middle"
                      data-matrix-cell={key}
                    >
                      {cell.length === 0 ? (
                        <span aria-hidden="true" className="matrix-empty">·</span>
                      ) : (
                        <>
                          <ul className="matrix-ribbon-list">
                            {shown.map((movement) => (
                              <li key={movement.id}>
                                <Link
                                  href={`/movements/${movement.id}/`}
                                  className="matrix-ribbon-link"
                                  aria-label={
                                    movement.shortLabel
                                      ? `${movement.shortLabel}（正式名称：${movement.nameJa}）`
                                      : movement.nameJa
                                  }
                                  title={movement.nameJa}
                                >
                                  <span className="matrix-ribbon-label">
                                    {movement.shortLabel ?? movement.nameJa}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          {(hiddenCount > 0 || expanded) && cell.length > CELL_LIMIT[lod] && (
                            <button
                              type="button"
                              onClick={() => toggleCell(key)}
                              aria-expanded={expanded}
                              className="matrix-cell-toggle"
                            >
                              {expanded ? '折りたたむ' : `+${hiddenCount}件を表示`}
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
