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
} from '@/lib/schema';
import { MovementCard } from './MovementCard';

const CLASSIFICATIONS = Object.keys(CLASSIFICATION_LABELS) as ClassificationKind[];
const VERIFICATIONS = Object.keys(VERIFICATION_LABELS) as VerificationStatus[];

export function MovementsExplorer() {
  const [query, setQuery] = useState('');
  const [era, setEra] = useState<EraId | 'all'>('all');
  const [region, setRegion] = useState<RegionId | 'all'>('all');
  const [cls, setCls] = useState<ClassificationKind | 'all'>('all');
  const [ver, setVer] = useState<VerificationStatus | 'all'>('all');

  const regions = activeRegions();

  // 検索：クエリがあれば横断検索でムーブメントIDに絞る
  const matchedIds = useMemo(() => {
    if (!query.trim()) return null;
    const docs = searchDocs(query);
    const ids = new Set<string>();
    for (const d of docs) {
      if (d.type === 'movement') ids.add(d.id);
      // 作家・作品ヒットはその関連ムーブメントを含める
    }
    // 作家・作品ヒットの関連ムーブメントも拾う
    for (const m of movements) {
      const hit = docs.some(
        (d) =>
          (d.type === 'artist' && m.artistIds.includes(d.id)) ||
          (d.type === 'work' && m.workIds.includes(d.id)),
      );
      if (hit) ids.add(m.id);
    }
    return ids;
  }, [query]);

  const filtered = useMemo(() => {
    return movements
      .filter((m) => (matchedIds ? matchedIds.has(m.id) : true))
      .filter((m) => (era === 'all' ? true : m.era === era))
      .filter((m) => (region === 'all' ? true : m.regionIds.includes(region)))
      .filter((m) => (cls === 'all' ? true : m.classification === cls))
      .filter((m) => (ver === 'all' ? true : m.verification === ver))
      .sort((a, b) => a.dates.start - b.dates.start);
  }, [matchedIds, era, region, cls, ver]);

  const reset = () => {
    setQuery('');
    setEra('all');
    setRegion('all');
    setCls('all');
    setVer('all');
  };

  const selectCls =
    'w-full rounded-sm border hairline bg-raised px-2 py-2 text-sm text-ink';

  return (
    <div>
      <div className="grid gap-3 border hairline bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="q" className="mb-1 block text-xs text-muted">
            検索（ムーブメント名・作家・作品・地域・思想・技法・素材・キーワード）
          </label>
          <input
            id="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例：遠近法、もの派、光、ウォーホル、油彩"
            className="w-full rounded-sm border hairline bg-raised px-3 py-2.5 text-sm text-ink placeholder:text-faint"
          />
        </div>

        <div>
          <label htmlFor="f-era" className="mb-1 block text-xs text-muted">時代区分</label>
          <select id="f-era" value={era} onChange={(e) => setEra(e.target.value as EraId | 'all')} className={selectCls}>
            <option value="all">すべての時代</option>
            {ERA_ORDER.map((e) => (
              <option key={e} value={e}>{ERA_LABELS[e]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-region" className="mb-1 block text-xs text-muted">地域</label>
          <select id="f-region" value={region} onChange={(e) => setRegion(e.target.value as RegionId | 'all')} className={selectCls}>
            <option value="all">すべての地域</option>
            {regions.map((r) => (
              <option key={r} value={r}>{REGION_LABELS[r]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-cls" className="mb-1 block text-xs text-muted">分類</label>
          <select id="f-cls" value={cls} onChange={(e) => setCls(e.target.value as ClassificationKind | 'all')} className={selectCls}>
            <option value="all">すべての分類</option>
            {CLASSIFICATIONS.map((c) => (
              <option key={c} value={c}>{CLASSIFICATION_LABELS[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-ver" className="mb-1 block text-xs text-muted">情報確認状態</label>
          <select id="f-ver" value={ver} onChange={(e) => setVer(e.target.value as VerificationStatus | 'all')} className={selectCls}>
            <option value="all">すべて</option>
            {VERIFICATIONS.map((v) => (
              <option key={v} value={v}>{VERIFICATION_LABELS[v]}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-between gap-2 sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-muted" aria-live="polite">
            {filtered.length}件表示
          </p>
          <button type="button" onClick={reset} className="rounded-sm border hairline px-3 py-2 text-xs text-muted hover:text-ink">
            条件をリセット
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          条件に一致するムーブメントがありません。
          <button type="button" onClick={reset} className="ml-2 prose-link">条件をリセット</button>
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <li key={m.id}>
              <MovementCard movement={m} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-faint">
        作品名・作家名でも検索できます。作品・作家の詳細は
        <Link href="/movements/" className="prose-link">各ムーブメント</Link>
        から辿れます。
      </p>
    </div>
  );
}
