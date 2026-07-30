'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  movements,
  searchDocs,
  ERA_ORDER,
  ERA_LABELS,
  activeRegions,
  REGION_LABELS,
  CLASSIFICATION_LABELS,
} from '@/lib/dataset';
import {
  VERIFICATION_LABELS,
  VISIBILITY_LEVEL_LABELS,
  type ClassificationKind,
  type RegionId,
  type EraId,
  type VerificationStatus,
  type Movement,
} from '@/lib/schema';
import {
  MOVEMENT_GROUPS,
  filterMovementsByLod,
  getMovementParent,
  groupMovementsForDisplay,
  isMovementVisibleAtLod,
} from '@/lib/movement-hierarchy';
import { useLodState } from '@/lib/use-lod-state';
import { LodControl } from './LodControl';
import { MovementCard } from './MovementCard';

const CLASSIFICATIONS = Object.keys(CLASSIFICATION_LABELS) as ClassificationKind[];
const VERIFICATIONS = Object.keys(VERIFICATION_LABELS) as VerificationStatus[];
type ViewMode = 'flat' | 'hierarchy';
type HierarchyScope = 'all' | 'parent' | 'child';

function ResultCard({
  movement,
  lod,
  queryActive,
  onReveal,
}: {
  movement: Movement;
  lod: Movement['visibilityLevel'];
  queryActive: boolean;
  onReveal: (lod: Movement['visibilityLevel']) => void;
}) {
  const hiddenByLod = queryActive && !isMovementVisibleAtLod(movement, lod);
  const parent = getMovementParent(movement.id, movements);

  return (
    <div data-movement-result={movement.id}>
      {(parent || hiddenByLod) && (
        <div className="border-x border-t hairline bg-surface px-3 py-2 text-xs text-muted">
          {parent && (
            <span className="mr-3">
              上位分類：
              <Link href={`/movements/${parent.id}/`} className="prose-link">
                {parent.nameJa}
              </Link>
            </span>
          )}
          {hiddenByLod && (
            <>
              <span>現在の表示範囲では非表示</span>
              <button
                type="button"
                onClick={() => onReveal(movement.visibilityLevel)}
                className="ml-2 min-h-11 font-bold text-accent underline underline-offset-4"
              >
                {VISIBILITY_LEVEL_LABELS[movement.visibilityLevel]}で表示
              </button>
            </>
          )}
        </div>
      )}
      <MovementCard movement={movement} />
    </div>
  );
}

export function MovementsExplorer() {
  const [query, setQuery] = useState('');
  const [era, setEra] = useState<EraId | 'all'>('all');
  const [region, setRegion] = useState<RegionId | 'all'>('all');
  const [cls, setCls] = useState<ClassificationKind | 'all'>('all');
  const [ver, setVer] = useState<VerificationStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('flat');
  const [hierarchyScope, setHierarchyScope] = useState<HierarchyScope>('all');
  const { lod, setLod } = useLodState('core');
  const regions = activeRegions();

  const matchedIds = useMemo(() => {
    if (!query.trim()) return null;
    const docs = searchDocs(query);
    const ids = new Set<string>();
    for (const doc of docs) {
      if (doc.type === 'movement') ids.add(doc.id);
    }
    for (const movement of movements) {
      const hit = docs.some(
        (doc) =>
          (doc.type === 'artist' && movement.artistIds.includes(doc.id)) ||
          (doc.type === 'work' && movement.workIds.includes(doc.id)),
      );
      if (hit) ids.add(movement.id);
    }
    return ids;
  }, [query]);

  const filtered = useMemo(() => {
    const queryActive = Boolean(matchedIds);
    const densityItems = queryActive ? movements : filterMovementsByLod(movements, lod);
    return densityItems
      .filter((movement) => (matchedIds ? matchedIds.has(movement.id) : true))
      .filter((movement) => (era === 'all' ? true : movement.era === era))
      .filter((movement) =>
        region === 'all' ? true : movement.regionIds.includes(region),
      )
      .filter((movement) =>
        cls === 'all' ? true : movement.classification === cls,
      )
      .filter((movement) =>
        ver === 'all' ? true : movement.verification === ver,
      )
      .filter((movement) => {
        if (hierarchyScope === 'all') return true;
        const isChild =
          Boolean(movement.parentMovementId) ||
          Boolean(movement.groupId && !movement.isRepresentative);
        return hierarchyScope === 'child' ? isChild : !isChild;
      })
      .sort(
        (a, b) =>
          (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.displayOrder ?? Number.MAX_SAFE_INTEGER),
      );
  }, [matchedIds, era, region, cls, ver, hierarchyScope, lod]);

  const reset = () => {
    setQuery('');
    setEra('all');
    setRegion('all');
    setCls('all');
    setVer('all');
    setHierarchyScope('all');
    setLod('core');
  };

  const selectClass =
    'min-h-11 w-full rounded-sm border hairline bg-raised px-2 py-2 text-sm text-ink';
  const { grouped, ungrouped } = groupMovementsForDisplay(filtered);
  const queryActive = Boolean(query.trim());

  return (
    <div>
      <LodControl
        value={lod}
        onChange={setLod}
        counts={{
          core: filterMovementsByLod(movements, 'core').length,
          standard: filterMovementsByLod(movements, 'standard').length,
          detailed: filterMovementsByLod(movements, 'detailed').length,
        }}
        catalogue
      />

      <div className="mt-5 grid gap-3 border hairline bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="q" className="mb-1 block text-xs text-muted">
            検索（ムーブメント名・作家・作品・地域・思想・技法・素材・キーワード）
          </label>
          <input
            id="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例：遠近法、もの派、光、ウォーホル、油彩"
            className="min-h-11 w-full rounded-sm border hairline bg-raised px-3 py-2.5 text-sm text-ink placeholder:text-faint"
          />
        </div>

        <div>
          <label htmlFor="f-era" className="mb-1 block text-xs text-muted">時代区分</label>
          <select id="f-era" value={era} onChange={(event) => setEra(event.target.value as EraId | 'all')} className={selectClass}>
            <option value="all">すべての時代</option>
            {ERA_ORDER.map((item) => <option key={item} value={item}>{ERA_LABELS[item]}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-region" className="mb-1 block text-xs text-muted">地域</label>
          <select id="f-region" value={region} onChange={(event) => setRegion(event.target.value as RegionId | 'all')} className={selectClass}>
            <option value="all">すべての地域</option>
            {regions.map((item) => <option key={item} value={item}>{REGION_LABELS[item]}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-cls" className="mb-1 block text-xs text-muted">分類</label>
          <select id="f-cls" value={cls} onChange={(event) => setCls(event.target.value as ClassificationKind | 'all')} className={selectClass}>
            <option value="all">すべての分類</option>
            {CLASSIFICATIONS.map((item) => <option key={item} value={item}>{CLASSIFICATION_LABELS[item]}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-ver" className="mb-1 block text-xs text-muted">情報確認状態</label>
          <select id="f-ver" value={ver} onChange={(event) => setVer(event.target.value as VerificationStatus | 'all')} className={selectClass}>
            <option value="all">すべて</option>
            {VERIFICATIONS.map((item) => <option key={item} value={item}>{VERIFICATION_LABELS[item]}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="f-hierarchy" className="mb-1 block text-xs text-muted">階層</label>
          <select id="f-hierarchy" value={hierarchyScope} onChange={(event) => setHierarchyScope(event.target.value as HierarchyScope)} className={selectClass}>
            <option value="all">すべて</option>
            <option value="parent">親・代表のみ</option>
            <option value="child">子・内訳のみ</option>
          </select>
        </div>

        <div className="flex items-end justify-between gap-2">
          <p className="text-sm text-muted" aria-live="polite">{filtered.length}件表示</p>
          <button type="button" onClick={reset} className="min-h-11 rounded-sm border hairline px-3 py-2 text-xs text-muted hover:text-ink">
            条件をリセット
          </button>
        </div>
      </div>

      <div className="mt-5 border-y hairline py-3">
        <p className="mb-2 text-xs font-bold text-ink">表示形式</p>
        <div role="group" aria-label="表示形式" className="inline-grid grid-cols-2 overflow-hidden rounded-sm border hairline">
          {([
            ['flat', 'フラット'],
            ['hierarchy', '階層'],
          ] as const).map(([value, label], index) => (
            <button
              key={value}
              type="button"
              onClick={() => setViewMode(value)}
              aria-pressed={viewMode === value}
              className={`min-h-11 px-5 text-sm ${index ? 'border-l hairline' : ''} ${
                viewMode === value ? 'bg-ink text-paper' : 'bg-raised text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          条件に一致するムーブメントがありません。
          <button type="button" onClick={reset} className="ml-2 prose-link">条件をリセット</button>
        </p>
      ) : viewMode === 'flat' ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-movement-view="flat">
          {filtered.map((movement) => (
            <li key={movement.id}>
              <ResultCard movement={movement} lod={lod} queryActive={queryActive} onReveal={setLod} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 space-y-8" data-movement-view="hierarchy">
          {[...grouped.entries()].map(([groupId, members]) => {
            const definition = MOVEMENT_GROUPS.find((group) => group.id === groupId);
            return (
              <section key={groupId} className="border-t hairline pt-4">
                <p className="text-xs uppercase tracking-[0.18em] text-faint">Group</p>
                <h2 className="mt-1 font-serif text-2xl">{definition?.label ?? groupId}</h2>
                <ul className="mt-4 grid gap-4 border-l-2 border-accent/35 pl-4 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((movement) => (
                    <li key={movement.id}>
                      <ResultCard movement={movement} lod={lod} queryActive={queryActive} onReveal={setLod} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {ungrouped.length > 0 && (
            <section className="border-t hairline pt-4">
              <h2 className="font-serif text-2xl">独立した項目</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ungrouped.map((movement) => (
                  <li key={movement.id}>
                    <ResultCard movement={movement} lod={lod} queryActive={queryActive} onReveal={setLod} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-faint">
        検索は表示する範囲に関係なく全{movements.length}件を対象とします。作品・作家の詳細は
        <Link href="/movements/" className="prose-link">各ムーブメント</Link>
        から辿れます。
      </p>
    </div>
  );
}
