'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { movements } from '@/lib/dataset';
import {
  compareRows,
  parseCompareIds,
  MIN_COMPARE,
  MAX_COMPARE,
  compareMovements,
} from '@/lib/compare';

export function CompareBoard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = parseCompareIds(searchParams.get('ids'));
  const [ids, setIds] = useState<string[]>(initial);
  const [copied, setCopied] = useState(false);

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
    syncUrl(next);
  };
  const remove = (id: string) => {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    syncUrl(next);
  };

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

  return (
    <div>
      {/* 追加コントロール */}
      <div className="flex flex-wrap items-center gap-3 border hairline bg-surface p-4">
        <label htmlFor="add-movement" className="text-sm text-muted">
          比較に追加（{MIN_COMPARE}〜{MAX_COMPARE}件）
        </label>
        <select
          id="add-movement"
          value=""
          onChange={(e) => add(e.target.value)}
          disabled={ids.length >= MAX_COMPARE}
          className="rounded-sm border hairline bg-raised px-2 py-2 text-sm text-ink disabled:opacity-50"
        >
          <option value="">ムーブメントを選択…</option>
          {candidates.map((m) => (
            <option key={m.id} value={m.id}>{m.nameJa}</option>
          ))}
        </select>
        <span className="text-sm text-faint">{ids.length}/{MAX_COMPARE}件</span>
        {ids.length >= MIN_COMPARE && (
          <button type="button" onClick={share} className="ml-auto rounded-sm border hairline px-3 py-2 text-xs text-muted hover:text-ink">
            {copied ? 'URLをコピーしました' : '比較URLを共有'}
          </button>
        )}
      </div>

      {ids.length < MIN_COMPARE ? (
        <div className="mt-8 rounded-sm border hairline bg-raised p-8 text-center text-sm text-muted">
          <p>比較するムーブメントを{MIN_COMPARE}件以上選んでください。</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['gothic', 'italian-renaissance', 'baroque'].map((id) => {
              const m = movements.find((x) => x.id === id)!;
              return (
                <button key={id} type="button" onClick={() => add(id)} className="rounded-sm border hairline px-3 py-1.5 text-xs hover:text-ink">
                  + {m.nameJa}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="scroll-x mt-8 rounded-sm border hairline">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">選択したムーブメントの比較表</caption>
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-32 border-b border-r hairline bg-surface p-3 text-left text-xs text-muted">
                  項目
                </th>
                {selected.map((m) => (
                  <th key={m.id} scope="col" className="min-w-[220px] border-b border-l hairline bg-surface p-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/movements/${m.id}/`} className="font-serif text-base text-ink hover:text-accent">
                        {m.nameJa}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(m.id)}
                        aria-label={`${m.nameJa}を比較から外す`}
                        className="shrink-0 rounded-sm px-1.5 text-faint hover:text-ink"
                      >
                        ✕
                      </button>
                    </div>
                    <span className="mt-1 block text-[11px] uppercase tracking-wider text-faint">{m.nameEn}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className="sticky left-0 z-10 border-r border-t hairline bg-raised p-3 text-left align-top text-xs text-muted">
                    {row.label}
                  </th>
                  {selected.map((m) => (
                    <td key={m.id} className="border-l border-t hairline p-3 align-top leading-relaxed text-ink">
                      {row.get(m)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
