'use client';

import Link from 'next/link';
import { LodControl } from '@/components/LodControl';
import { ClassificationBadge, RegionBadges } from '@/components/Badges';
import {
  ERA_LABELS,
  ERA_ORDER,
  artistsOf,
  formatDateRange,
  worksOf,
} from '@/lib/dataset';
import {
  MOVEMENT_GROUPS,
  filterMovementsByLod,
  getMovementParent,
  groupMovementsForDisplay,
} from '@/lib/movement-hierarchy';
import { useLodState } from '@/lib/use-lod-state';
import type { Movement } from '@/lib/schema';

function MovementEntry({ movement, all }: { movement: Movement; all: Movement[] }) {
  const artists = artistsOf(movement);
  const works = worksOf(movement);
  const parent = getMovementParent(movement.id, all);

  return (
    <li
      className={`relative pb-6 ${parent ? 'ml-5 border-l hairline pl-5' : 'pl-6'}`}
      data-chronology-movement={movement.id}
      data-hierarchy-level={parent ? 'child' : 'root'}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-accent ${
          parent ? '-left-[7px]' : '-left-[7px]'
        }`}
      />
      <Link href={`/movements/${movement.id}/`} className="group block">
        {parent && (
          <span className="mb-1 block text-[11px] text-faint">
            {parent.nameJa}の下位分類
          </span>
        )}
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-xs tabular-nums text-faint">
            {formatDateRange(movement)}
          </span>
          <ClassificationBadge kind={movement.classification} />
        </div>
        <h3 className="mt-1 font-serif text-xl text-ink group-hover:text-accent">
          {movement.nameJa}
          <span className="ml-2 text-xs uppercase tracking-wider text-faint">
            {movement.nameEn}
          </span>
        </h3>
        <p className="mt-1 max-w-prose text-sm text-muted">{movement.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RegionBadges regionIds={movement.regionIds} />
          {works[0] && <span className="text-xs text-faint">代表作：{works[0].titleJa}</span>}
          {!works[0] && artists[0] && (
            <span className="text-xs text-faint">代表作家：{artists[0].nameJa}</span>
          )}
        </div>
      </Link>
    </li>
  );
}

export function ChronologyView({ movements }: { movements: Movement[] }) {
  const { lod, setLod } = useLodState('core');
  const visible = filterMovementsByLod(movements, lod);
  const counts = {
    core: filterMovementsByLod(movements, 'core').length,
    standard: filterMovementsByLod(movements, 'standard').length,
    detailed: filterMovementsByLod(movements, 'detailed').length,
  };

  return (
    <>
      <LodControl value={lod} onChange={setLod} counts={counts} />

      <nav
        aria-label="時代ナビゲーション"
        className="sticky top-16 z-30 -mx-4 border-y hairline bg-paper/95 px-4 py-2 backdrop-blur"
      >
        <ul className="scroll-x flex gap-2 text-xs">
          {ERA_ORDER.map((era) => (
            <li key={era} className="shrink-0">
              <a
                href={`#era-${era}`}
                className="inline-flex min-h-11 items-center rounded-sm border hairline px-3 text-muted hover:text-ink"
              >
                {ERA_LABELS[era]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8" data-chronology-lod={lod}>
        {ERA_ORDER.map((era) => {
          const items = visible.filter((movement) => movement.era === era);
          if (items.length === 0) return null;
          const { grouped, ungrouped } = groupMovementsForDisplay(items);
          const content = (
            <ol className="mt-4 border-l-2 hairline">
              {[...grouped.entries()].map(([groupId, members]) => {
                const definition = MOVEMENT_GROUPS.find((group) => group.id === groupId);
                return (
                  <li key={groupId} className="pb-3 pl-5" data-chronology-group={groupId}>
                    <details open={lod !== 'detailed'} className="border-l hairline pl-4">
                      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-ink">
                        {definition?.label ?? groupId}
                        <span className="ml-2 font-normal text-faint">{members.length}件</span>
                      </summary>
                      <ol className="mt-2">
                        {members.map((movement) => (
                          <MovementEntry key={movement.id} movement={movement} all={movements} />
                        ))}
                      </ol>
                    </details>
                  </li>
                );
              })}
              {ungrouped.map((movement) => (
                <MovementEntry key={movement.id} movement={movement} all={movements} />
              ))}
            </ol>
          );

          return (
            <section key={era} id={`era-${era}`} className="scroll-mt-28 pb-8">
              {lod === 'detailed' ? (
                <details open>
                  <summary className="sticky top-28 min-h-11 cursor-pointer bg-paper py-2 font-serif text-sm uppercase tracking-widest text-accent">
                    {ERA_LABELS[era]}
                    <span className="ml-2 font-sans text-xs normal-case tracking-normal text-faint">
                      {items.length}件
                    </span>
                  </summary>
                  {content}
                </details>
              ) : (
                <>
                  <h2 className="sticky top-28 bg-paper py-2 font-serif text-sm uppercase tracking-widest text-accent">
                    {ERA_LABELS[era]}
                  </h2>
                  {content}
                </>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
