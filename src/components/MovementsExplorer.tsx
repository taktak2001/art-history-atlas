'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowsDownUp,
  CaretDown,
  Funnel,
  MagnifyingGlass,
} from '@phosphor-icons/react';
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
  type ClassificationKind,
  type RegionId,
  type EraId,
  type VerificationStatus,
  type Movement,
} from '@/lib/schema';
import { getMovementParent } from '@/lib/movement-hierarchy';
import { MovementCard } from './MovementCard';
import { AccordionChevron } from './AccordionChevron';

const CLASSIFICATIONS = Object.keys(CLASSIFICATION_LABELS) as ClassificationKind[];
const VERIFICATIONS = Object.keys(VERIFICATION_LABELS) as VerificationStatus[];
const PAGE_SIZE = 10;

type HierarchyScope = 'all' | 'parent' | 'child';
type SortMode = 'chronology' | 'name-ja' | 'name-en';

function ResultCard({ movement }: { movement: Movement }) {
  const parent = getMovementParent(movement.id, movements);

  return (
    <article className="movement-directory-result" data-movement-result={movement.id}>
      <MovementCard movement={movement} />
      {parent && (
        <div className="movement-directory-result__parent">
          上位分類：
          <Link href={`/movements/${parent.id}/`} className="prose-link">
            {parent.nameJa}
          </Link>
        </div>
      )}
    </article>
  );
}

export function MovementsExplorer() {
  const [query, setQuery] = useState('');
  const [era, setEra] = useState<EraId | 'all'>('all');
  const [region, setRegion] = useState<RegionId | 'all'>('all');
  const [cls, setCls] = useState<ClassificationKind | 'all'>('all');
  const [ver, setVer] = useState<VerificationStatus | 'all'>('all');
  const [hierarchyScope, setHierarchyScope] = useState<HierarchyScope>('all');
  const [sortMode, setSortMode] = useState<SortMode>('chronology');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
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
    const result = movements
      .filter((movement) => (matchedIds ? matchedIds.has(movement.id) : true))
      .filter((movement) => (era === 'all' ? true : movement.era === era))
      .filter((movement) => (region === 'all' ? true : movement.regionIds.includes(region)))
      .filter((movement) => (cls === 'all' ? true : movement.classification === cls))
      .filter((movement) => (ver === 'all' ? true : movement.verification === ver))
      .filter((movement) => {
        if (hierarchyScope === 'all') return true;
        const isChild =
          Boolean(movement.parentMovementId) ||
          Boolean(movement.groupId && !movement.isRepresentative);
        return hierarchyScope === 'child' ? isChild : !isChild;
      });

    return result.sort((a, b) => {
      if (sortMode === 'name-ja') return a.nameJa.localeCompare(b.nameJa, 'ja');
      if (sortMode === 'name-en') return a.nameEn.localeCompare(b.nameEn, 'en');
      return (
        (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.displayOrder ?? Number.MAX_SAFE_INTEGER)
      );
    });
  }, [matchedIds, era, region, cls, ver, hierarchyScope, sortMode]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, era, region, cls, ver, hierarchyScope, sortMode]);

  const visibleMovements = filtered.slice(0, visibleCount);
  const hasMore = visibleMovements.length < filtered.length;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setVisibleCount((count) => Math.min(filtered.length, count + PAGE_SIZE));
      },
      { rootMargin: '240px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [filtered.length, hasMore]);

  const reset = () => {
    setQuery('');
    setEra('all');
    setRegion('all');
    setCls('all');
    setVer('all');
    setHierarchyScope('all');
    setVisibleCount(PAGE_SIZE);
  };

  const selectClass = 'movement-directory-select';
  const queryActive = Boolean(query.trim());

  const activeFilters: { key: string; label: string; clear: () => void }[] = [
    era !== 'all' && {
      key: 'era',
      label: ERA_LABELS[era as EraId],
      clear: () => setEra('all'),
    },
    region !== 'all' && {
      key: 'region',
      label: REGION_LABELS[region as RegionId],
      clear: () => setRegion('all'),
    },
    cls !== 'all' && {
      key: 'cls',
      label: CLASSIFICATION_LABELS[cls as ClassificationKind],
      clear: () => setCls('all'),
    },
    ver !== 'all' && {
      key: 'ver',
      label: VERIFICATION_LABELS[ver as VerificationStatus],
      clear: () => setVer('all'),
    },
    hierarchyScope !== 'all' && {
      key: 'hierarchy',
      label: hierarchyScope === 'parent' ? '親・代表のみ' : '子・内訳のみ',
      clear: () => setHierarchyScope('all'),
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const advancedSummary =
    activeFilters.length === 0
      ? '条件なし'
      : `${activeFilters.slice(0, 3).map((filter) => filter.label).join('・')}${
          activeFilters.length > 3 ? `ほか${activeFilters.length - 3}件` : ''
        }`;
  const hasAnyCondition = queryActive || activeFilters.length > 0;

  return (
    <div className="movements-directory-explorer">
      <div className="movements-directory-toolbar">
        <div className="movements-search">
          <label htmlFor="q" className="sr-only">ムーブメントを検索</label>
          <span className="movements-search__icon" aria-hidden="true">
            <MagnifyingGlass size={19} weight="regular" />
          </span>
          <input
            id="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ムーブメント名・作家・作品など"
            aria-describedby="q-help"
            className="movements-search__input"
          />
          <p id="q-help" className="sr-only">
            名称・別名のほか、作家・作品・地域・思想・技法・素材・キーワードを対象に検索します。
          </p>
        </div>

        <div className="movements-directory-toolbar__utilities">
          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            aria-expanded={advancedOpen}
            aria-controls="advanced-filters"
            aria-label={`詳細条件・フィルター。${advancedSummary}`}
            className="movements-directory-toolbar__filter"
          >
            <Funnel
              className="movements-directory-toolbar__utility-icon"
              size={18}
              weight="regular"
              aria-hidden="true"
            />
            <span>フィルター</span>
            <span className="movements-advanced__summary sr-only">{advancedSummary}</span>
            {activeFilters.length > 0 && <span className="movements-directory-toolbar__badge">{activeFilters.length}</span>}
            <AccordionChevron open={advancedOpen} className="movements-directory-toolbar__chevron" />
          </button>

          <label className="movements-directory-sort">
            <span className="sr-only">並び順</span>
            <ArrowsDownUp
              className="movements-directory-toolbar__utility-icon movements-directory-sort__icon"
              size={18}
              weight="regular"
              aria-hidden="true"
            />
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              aria-label="並び順"
            >
              <option value="chronology">並び順：年代</option>
              <option value="name-ja">並び順：名称</option>
              <option value="name-en">並び順：英語名</option>
            </select>
            <CaretDown
              className="movements-directory-sort__chevron"
              size={14}
              weight="regular"
              aria-hidden="true"
            />
          </label>
        </div>
      </div>

      <div id="advanced-filters" hidden={!advancedOpen} className="movements-advanced__panel">
        <label htmlFor="f-era">
          <span>時代区分</span>
          <select id="f-era" aria-label="時代区分" value={era} onChange={(event) => setEra(event.target.value as EraId | 'all')} className={selectClass}>
            <option value="all">すべての時代</option>
            {ERA_ORDER.map((item) => <option key={item} value={item}>{ERA_LABELS[item]}</option>)}
          </select>
        </label>
        <label htmlFor="f-region">
          <span>地域</span>
          <select id="f-region" aria-label="地域" value={region} onChange={(event) => setRegion(event.target.value as RegionId | 'all')} className={selectClass}>
            <option value="all">すべての地域</option>
            {regions.map((item) => <option key={item} value={item}>{REGION_LABELS[item]}</option>)}
          </select>
        </label>
        <label htmlFor="f-cls">
          <span>分類</span>
          <select id="f-cls" aria-label="分類" value={cls} onChange={(event) => setCls(event.target.value as ClassificationKind | 'all')} className={selectClass}>
            <option value="all">すべての分類</option>
            {CLASSIFICATIONS.map((item) => <option key={item} value={item}>{CLASSIFICATION_LABELS[item]}</option>)}
          </select>
        </label>
        <label htmlFor="f-ver">
          <span>情報確認状態</span>
          <select id="f-ver" aria-label="情報確認状態" value={ver} onChange={(event) => setVer(event.target.value as VerificationStatus | 'all')} className={selectClass}>
            <option value="all">すべて</option>
            {VERIFICATIONS.map((item) => <option key={item} value={item}>{VERIFICATION_LABELS[item]}</option>)}
          </select>
        </label>
        <label htmlFor="f-hierarchy">
          <span>階層</span>
          <select id="f-hierarchy" aria-label="階層" value={hierarchyScope} onChange={(event) => setHierarchyScope(event.target.value as HierarchyScope)} className={selectClass}>
            <option value="all">すべて</option>
            <option value="parent">親・代表のみ</option>
            <option value="child">子・内訳のみ</option>
          </select>
        </label>
      </div>

      {activeFilters.length > 0 && (
        <ul className="movements-chips" aria-label="有効な絞り込み条件">
          {activeFilters.map((filter) => (
            <li key={filter.key}>
              <span className="movements-chip">
                {filter.label}
                <button
                  type="button"
                  onClick={filter.clear}
                  aria-label={`絞り込み条件「${filter.label}」を解除`}
                  className="movements-chip__clear"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="movements-resultbar">
        <p className="movements-resultbar__count" aria-live="polite">
          {filtered.length}件のムーブメント
        </p>
        {hasAnyCondition && (
          <button type="button" onClick={reset} className="movements-resultbar__clear">
            条件をクリア
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="movements-directory-empty">
          条件に一致するムーブメントがありません。
          <button type="button" onClick={reset} className="prose-link">条件をクリア</button>
        </p>
      ) : (
        <ul className="movement-directory-grid" data-movement-view="flat">
          {visibleMovements.map((movement) => (
            <li key={movement.id}>
              <ResultCard movement={movement} />
            </li>
          ))}
        </ul>
      )}

      <div
        ref={loadMoreRef}
        className="movements-directory-infinite"
        data-infinite-scroll-sentinel
        aria-live="polite"
      >
        {hasMore ? (
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) => Math.min(filtered.length, count + PAGE_SIZE))
            }
            className="movements-directory-load-more"
          >
            さらに表示
            <span>{visibleMovements.length} / {filtered.length}</span>
          </button>
        ) : (
          filtered.length > PAGE_SIZE && (
            <p className="movements-directory-end">全{filtered.length}件を表示しました</p>
          )
        )}
      </div>

      <p className="movements-directory-note">
        検索は表示中のページに限らず、収録済みの全{movements.length}件を対象とします。
      </p>
    </div>
  );
}
