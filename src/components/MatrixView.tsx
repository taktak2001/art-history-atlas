'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { LodControl } from '@/components/LodControl';
import { ERA_LABELS, ERA_ORDER, REGION_LABELS } from '@/lib/dataset';
import { filterMovementsByLod } from '@/lib/movement-hierarchy';
import { regionRgb } from '@/lib/timeline-region-presentation';
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
        catalogue
      />

      <div
        className="data-table-scroll matrix-scroll mt-5"
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
                className="data-table-corner matrix-corner"
                data-sticky-cell="corner"
              >
                <span className="matrix-axis-title">地域</span>
                <span className="matrix-axis-direction">時代 →</span>
              </th>
              {ERA_ORDER.map((era) => (
                <th
                  key={era}
                  scope="col"
                  className="data-table-column-header matrix-column-header"
                  data-sticky-cell="column"
                >
                  {ERA_LABELS[era]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr
                key={region}
                data-matrix-region={region}
                style={
                  {
                    '--matrix-region-rgb': regionRgb(region),
                  } as CSSProperties
                }
              >
                <th
                  scope="row"
                  className="data-table-row-header matrix-row-header"
                  data-sticky-cell="row"
                >
                  <span className="matrix-region-dot" aria-hidden="true" />
                  <span className="matrix-region-name">{REGION_LABELS[region]}</span>
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
                      className="matrix-cell"
                      data-matrix-cell={key}
                    >
                      {cell.length === 0 ? (
                        <>
                          <span aria-hidden="true" className="matrix-empty">−</span>
                          <span className="sr-only">収録項目なし</span>
                        </>
                      ) : (
                        <>
                          <ul className="matrix-cell-list">
                            {shown.map((movement) => (
                              <li key={movement.id}>
                                <Link
                                  href={`/movements/${movement.id}/`}
                                  className="matrix-movement-link"
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
                              className="matrix-cell-toggle"
                            >
                              <span>
                                {expanded ? '折りたたむ' : `ほか${hiddenCount}件`}
                              </span>
                              <span aria-hidden="true">{expanded ? '−' : '＋'}</span>
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
