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
  type ClassificationKind,
  type RegionId,
  type EraId,
  type VerificationStatus,
  type Movement,
} from '@/lib/schema';
import { getMovementParent } from '@/lib/movement-hierarchy';
import { MovementCard } from './MovementCard';

const CLASSIFICATIONS = Object.keys(CLASSIFICATION_LABELS) as ClassificationKind[];
const VERIFICATIONS = Object.keys(VERIFICATION_LABELS) as VerificationStatus[];
type HierarchyScope = 'all' | 'parent' | 'child';

function ResultCard({ movement }: { movement: Movement }) {
  const parent = getMovementParent(movement.id, movements);

  return (
    <div data-movement-result={movement.id}>
      {parent && (
        <div className="border-x border-t hairline bg-surface px-3 py-2 text-xs text-muted">
          <span>
            上位分類：
            <Link href={`/movements/${parent.id}/`} className="prose-link">
              {parent.nameJa}
            </Link>
          </span>
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
  const [hierarchyScope, setHierarchyScope] = useState<HierarchyScope>('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
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
    // 一覧は常に全件を対象にする（表示密度LODは持たない）
    return movements
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
  }, [matchedIds, era, region, cls, ver, hierarchyScope]);

  const reset = () => {
    setQuery('');
    setEra('all');
    setRegion('all');
    setCls('all');
    setVer('all');
    setHierarchyScope('all');
  };

  // iOSのフォーカス時オートズームを避けるため、フォーム部品は16px以上にする
  const selectClass =
    'min-h-11 w-full rounded-sm border hairline bg-raised px-2 py-2 text-base text-ink';
  const queryActive = Boolean(query.trim());

  /** 詳細条件のうち現在設定されているもの（閉じていても分かるように要約・チップで示す） */
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
    <div>
      {/* 名前・キーワード検索は常時表示。詳細条件はアコーディオン内へ畳む */}
      <div className="movements-search">
        <label htmlFor="q" className="movements-search__label">
          ムーブメントを検索
        </label>
        <input
          id="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ムーブメント名・作家・作品など"
          aria-describedby="q-help"
          className="movements-search__input"
        />
        <p id="q-help" className="movements-search__help">
          名称・別名のほか、作家・作品・地域・思想・技法・素材・キーワードを対象に検索します。
        </p>
      </div>

      <div className="movements-advanced">
        <button
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          aria-expanded={advancedOpen}
          aria-controls="advanced-filters"
          className="movements-advanced__toggle"
        >
          <span className="movements-advanced__title">詳細条件</span>
          <span className="movements-advanced__summary">{advancedSummary}</span>
          <span className="movements-advanced__icon" aria-hidden="true">
            {advancedOpen ? '−' : '＋'}
          </span>
        </button>

        {activeFilters.length > 0 && (
          <ul className="movements-chips">
            {activeFilters.slice(0, 3).map((filter) => (
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
            {activeFilters.length > 3 && (
              <li className="movements-chips__more">ほか{activeFilters.length - 3}件</li>
            )}
          </ul>
        )}

        <div
          id="advanced-filters"
          hidden={!advancedOpen}
          className="movements-advanced__panel"
        >
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
        </div>
      </div>

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
        <p className="mt-8 text-center text-sm text-muted">
          条件に一致するムーブメントがありません。
          <button type="button" onClick={reset} className="ml-2 prose-link">条件をクリア</button>
        </p>
      ) : (
        // 表示形式の切り替えは廃止し、一覧は1種類に統一する。
        // 親子関係は ResultCard 内の控えめな親カテゴリ表記で示す。
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-movement-view="flat">
          {filtered.map((movement) => (
            <li key={movement.id}>
              <ResultCard movement={movement} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-faint">
        検索は表示する範囲に関係なく全{movements.length}件を対象とします。作品・作家の詳細は
        <Link href="/movements/" className="prose-link">各ムーブメント</Link>
        から辿れます。
      </p>
    </div>
  );
}
