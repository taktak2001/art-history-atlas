'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { movements, worksOf } from '@/lib/dataset';
import { WorkImage } from './WorkImage';
import {
  compareSections,
  parseCompareIds,
  MIN_COMPARE,
  MAX_COMPARE,
  compareMovements,
  assignCompareAccents,
} from '@/lib/compare';
import { getMovementChildren } from '@/lib/movement-hierarchy';

export function CompareBoard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = parseCompareIds(searchParams.get('ids'));
  const [ids, setIds] = useState<string[]>(initial);
  const [accentById, setAccentById] = useState(() =>
    assignCompareAccents(initial),
  );
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = useMemo(() => compareMovements(ids), [ids]);

  const syncUrl = useCallback(
    (next: string[]) => {
      const qs = next.length ? `?ids=${next.join(',')}` : '';
      router.replace(`/compare/${qs}`, { scroll: false });
    },
    [router],
  );

  const add = (id: string) => {
    if (!id || ids.includes(id) || ids.length >= MAX_COMPARE) return;
    const next = [...ids, id];
    setIds(next);
    setAccentById((current) => assignCompareAccents(next, current));
    syncUrl(next);
  };

  const commitRemove = (id: string) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    setAccentById((current) => assignCompareAccents(next, current));
    setExitingId(null);
    syncUrl(next);
  };

  const remove = (id: string) => {
    if (exitingId) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commitRemove(id);
      return;
    }

    setExitingId(id);
    removeTimer.current = setTimeout(() => commitRemove(id), 160);
  };

  useEffect(
    () => () => {
      if (removeTimer.current) clearTimeout(removeTimer.current);
    },
    [],
  );

  const share = async () => {
    const url = `${window.location.origin}/compare/?ids=${ids.join(',')}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* クリップボード不可の環境では何もしない */
    }
  };

  const candidates = movements.filter((m) => !ids.includes(m.id));
  const missingCount = Math.max(0, MIN_COMPARE - ids.length);
  const accentStyle = (id: string) =>
    ({
      '--compare-accent': accentById[id],
    }) as CSSProperties;

  return (
    <div>
      {/* 追加コントロール */}
      <div className="compare-controls border hairline bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="add-movement" className="text-sm text-muted">
            比較に追加（{MIN_COMPARE}〜{MAX_COMPARE}件）
          </label>
          <select
            id="add-movement"
            value=""
            onChange={(e) => add(e.target.value)}
            disabled={ids.length >= MAX_COMPARE || Boolean(exitingId)}
            className="min-h-11 rounded-sm border hairline bg-raised px-2 py-2 text-sm text-ink disabled:opacity-50"
          >
            <option value="">ムーブメントを選択…</option>
            {candidates.map((m) => (
              <option key={m.id} value={m.id}>{m.nameJa}</option>
            ))}
          </select>
          <span className="text-sm tabular-nums text-faint">{ids.length}/{MAX_COMPARE}件</span>
          {ids.length >= MIN_COMPARE && (
            <button
              type="button"
              onClick={share}
              className="min-h-11 rounded-sm border hairline px-3 py-2 text-xs text-muted hover:text-ink sm:ml-auto"
            >
              {copied ? 'URLをコピーしました' : '比較URLを共有'}
            </button>
          )}
        </div>

        <div className="compare-selection mt-4 border-t hairline pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs font-bold text-muted">現在比較中</p>
            <p className="text-xs text-faint" aria-live="polite">
              {missingCount > 0
                ? `あと${missingCount}件選択してください`
                : `${ids.length}件を比較できます`}
            </p>
          </div>
          <ul
            className="compare-chip-list mt-2"
            aria-label="現在比較中のムーブメント"
          >
            {selected.length === 0 ? (
              <li className="compare-chip-empty">まだ選択されていません</li>
            ) : (
              selected.map((movement) => (
                <li
                  key={movement.id}
                  className="compare-chip"
                  style={accentStyle(movement.id)}
                  data-compare-chip={movement.id}
                  data-exiting={exitingId === movement.id ? 'true' : undefined}
                >
                  <span className="compare-chip__bar" aria-hidden="true" />
                  <Link
                    href={`/movements/${movement.id}/`}
                    className="compare-chip__link"
                    title={movement.nameJa}
                  >
                    {movement.shortLabel ?? movement.nameJa}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(movement.id)}
                    disabled={Boolean(exitingId)}
                    aria-label={`${movement.nameJa}を比較から外す`}
                    className="compare-chip__remove"
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {ids.length < MIN_COMPARE ? (
        <div className="mt-8 rounded-sm border hairline bg-raised p-8 text-center text-sm text-muted">
          <p>比較表を開くには、あと{missingCount}件選択してください。</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['gothic', 'italian-renaissance', 'baroque']
              .filter((id) => !ids.includes(id))
              .map((id) => {
                const m = movements.find((x) => x.id === id)!;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => add(id)}
                    className="min-h-11 rounded-sm border hairline px-3 py-1.5 text-xs hover:text-ink"
                  >
                    + {m.nameJa}
                  </button>
                );
              })}
          </div>
        </div>
      ) : (
        <div
          className="data-table-scroll mt-8 rounded-sm border hairline"
          role="region"
          aria-label="選択したムーブメントの比較表"
          tabIndex={0}
          data-compare-table-scroll
        >
          <table className="data-table compare-table w-full text-sm">
            <caption className="sr-only">選択したムーブメントの比較表</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="data-table-corner compare-corner border-b border-r hairline p-3 text-left text-xs text-muted"
                  data-sticky-cell="corner"
                >
                  比較項目
                </th>
                {selected.map((m) => (
                  <th
                    key={m.id}
                    scope="col"
                    className="data-table-column-header compare-column-header min-w-[220px] border-b border-l hairline p-3 text-left align-top"
                    style={accentStyle(m.id)}
                    data-sticky-cell="column"
                    data-compare-column={m.id}
                  >
                    <span className="compare-column-accent" aria-hidden="true" />
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/movements/${m.id}/`} className="font-serif text-base text-ink underline decoration-transparent underline-offset-4 hover:decoration-current">
                        {m.nameJa}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(m.id)}
                        disabled={Boolean(exitingId)}
                        aria-label={`${m.nameJa}を比較から外す`}
                        className="min-h-11 min-w-11 shrink-0 rounded-sm text-faint hover:text-ink"
                      >
                        ×
                      </button>
                    </div>
                    <span className="mt-1 block text-[11px] uppercase tracking-wider text-faint">{m.nameEn}</span>
                    {getMovementChildren(m.id, movements).length > 0 && (
                      <span className="compare-column-note mt-2 block border-l-2 pl-2 text-[11px] font-normal leading-relaxed text-muted">
                        この項目は複数のサブムーブメントを含む上位分類です
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            {compareSections.map((section) => (
              <tbody
                key={section.key}
                aria-labelledby={`compare-category-${section.key}`}
              >
                <tr className="compare-category-row">
                  <th
                    id={`compare-category-${section.key}`}
                    scope="row"
                    className="data-table-row-header compare-category-cell border-r border-t hairline px-3 py-2 text-left text-xs font-bold text-ink"
                    data-sticky-cell="category"
                  >
                    {section.label}
                  </th>
                  <td
                    colSpan={selected.length}
                    className="compare-category-fill border-t hairline"
                    aria-hidden="true"
                  />
                </tr>

                {section.includesRepresentativeWorks && (
                  <tr>
                    <th
                      scope="row"
                      className="data-table-row-header compare-row-header border-r border-t hairline p-3 text-left align-top text-xs text-muted"
                      data-sticky-cell="row"
                    >
                      代表作品
                    </th>
                    {selected.map((m) => {
                      const reps = worksOf(m).slice(0, 2);
                      return (
                        <td
                          key={m.id}
                          className="compare-value-cell border-l border-t hairline p-3 align-top"
                          style={accentStyle(m.id)}
                        >
                          <div className="grid grid-cols-2 gap-2">
                            {reps.map((w) => (
                              <Link key={w.id} href={`/works/${w.id}/`} className="group block">
                                <WorkImage work={w} sizes="140px" />
                                <span className="mt-1 line-clamp-1 block text-[11px] text-muted group-hover:text-ink">
                                  {w.titleJa}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )}

                {section.rows.map((row) => (
                  <tr key={row.key}>
                    <th
                      scope="row"
                      className="data-table-row-header compare-row-header border-r border-t hairline p-3 text-left align-top text-xs text-muted"
                      data-sticky-cell="row"
                    >
                      {row.label}
                    </th>
                    {selected.map((m) => (
                      <td
                        key={m.id}
                        className="compare-value-cell border-l border-t hairline p-3 align-top leading-relaxed text-ink"
                        style={accentStyle(m.id)}
                      >
                        {row.get(m)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </div>
  );
}
