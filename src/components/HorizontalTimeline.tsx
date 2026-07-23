'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Movement, RegionId } from '@/lib/schema';
import { REGION_LABELS } from '@/lib/schema';

type Props = {
  movements: Movement[];
  activeRegions: RegionId[];
};

const NOW = 2026;
const LANE_H = 44;
const LABEL_W = 128;
const HEADER_H = 28;

// 年代粒度プリセット（1年あたりのピクセル）
const GRANULARITIES = [
  { label: '全体', px: 0.05 },
  { label: '広い', px: 0.2 },
  { label: '標準', px: 0.9 },
  { label: '詳細', px: 3 },
];

const fmtYear = (y: number) => (y < 0 ? `前${Math.abs(y)}` : `${y}`);

export function HorizontalTimeline({ movements, activeRegions }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [px, setPx] = useState(0.9);

  const minYear = useMemo(
    () => Math.min(...movements.map((m) => m.dates.start)),
    [movements],
  );
  const maxYear = useMemo(
    () => Math.max(...movements.map((m) => m.dates.end ?? NOW)),
    [movements],
  );

  const x = (year: number) => (year - minYear) * px;
  const totalW = x(maxYear) + 32;

  // ドラッグでパン
  const drag = useRef<{ startX: number; scrollLeft: number; active: boolean }>({
    startX: 0,
    scrollLeft: 0,
    active: false,
  });

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    // リンク/ボタン上ではパンしない
    if ((e.target as HTMLElement).closest('a,button')) return;
    drag.current = { startX: e.clientX, scrollLeft: el.scrollLeft, active: true };
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !scrollRef.current) return;
    scrollRef.current.scrollLeft = drag.current.scrollLeft - (e.clientX - drag.current.startX);
  };
  const onPointerUp = () => {
    drag.current.active = false;
  };

  // ホイール：カーソル位置を保ったままズーム（Ctrl/Meta）、通常は横スクロール
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const pointerX = e.clientX - rect.left + el.scrollLeft;
        const yearAtPointer = pointerX / px + minYear;
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        const next = Math.min(6, Math.max(0.03, px * factor));
        setPx(next);
        requestAnimationFrame(() => {
          if (!scrollRef.current) return;
          scrollRef.current.scrollLeft = (yearAtPointer - minYear) * next - (e.clientX - rect.left);
        });
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [px, minYear]);

  // 目盛り（500年 or 適応）
  const tickStep = px > 2 ? 100 : px > 0.6 ? 500 : px > 0.15 ? 2000 : 10000;
  const ticks: number[] = [];
  const firstTick = Math.ceil(minYear / tickStep) * tickStep;
  for (let y = firstTick; y <= maxYear; y += tickStep) ticks.push(y);

  return (
    <div>
      {/* 操作 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">粒度：</span>
        {GRANULARITIES.map((g) => (
          <button
            key={g.label}
            type="button"
            onClick={() => setPx(g.px)}
            aria-pressed={Math.abs(px - g.px) < 0.001}
            className={`rounded-sm border hairline px-2.5 py-1 text-xs ${
              Math.abs(px - g.px) < 0.001 ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
            }`}
          >
            {g.label}
          </button>
        ))}
        <span className="ml-2 flex items-center gap-1">
          <button type="button" onClick={() => setPx((p) => Math.max(0.03, p / 1.3))} className="h-8 w-8 rounded-sm border hairline text-muted hover:text-ink" aria-label="ズームアウト">−</button>
          <button type="button" onClick={() => setPx((p) => Math.min(6, p * 1.3))} className="h-8 w-8 rounded-sm border hairline text-muted hover:text-ink" aria-label="ズームイン">＋</button>
        </span>
        <span className="text-xs text-faint">ドラッグで移動・Ctrl+ホイールで拡大縮小</span>
      </div>

      {/* タイムライン本体：左に固定ラベル列、右にスクロール領域 */}
      <div className="flex rounded-sm border hairline bg-raised">
        {/* 固定ラベル列（地域） */}
        <div className="shrink-0 border-r hairline" style={{ width: LABEL_W }}>
          <div style={{ height: HEADER_H }} aria-hidden="true" />
          {activeRegions.map((region) => (
            <div
              key={region}
              className="flex items-center px-2 text-xs text-muted"
              style={{ height: LANE_H }}
            >
              {REGION_LABELS[region]}
            </div>
          ))}
        </div>

        {/* スクロール領域 */}
        <div
          ref={scrollRef}
          className="scroll-x relative min-w-0 flex-1 cursor-grab touch-pan-x select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          role="group"
          aria-label="横型タイムライン（ドラッグで移動、ボタンで拡大縮小）"
        >
          <div className="relative" style={{ width: totalW, height: HEADER_H + activeRegions.length * LANE_H }}>
            {/* 目盛り */}
            {ticks.map((t) => (
              <div key={t} className="absolute top-0 bottom-0 border-l hairline" style={{ left: x(t) }}>
                <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap bg-raised px-1 text-[10px] tabular-nums text-faint">
                  {fmtYear(t)}
                </span>
              </div>
            ))}

            {/* レーン（地域別） */}
            {activeRegions.map((region, i) => {
              const laneMovements = movements.filter((m) => m.regionIds.includes(region));
              const top = HEADER_H + i * LANE_H;
              return (
                <div
                  key={region}
                  className={`absolute left-0 right-0 ${i % 2 === 1 ? 'bg-surface/40' : ''}`}
                  style={{ top, height: LANE_H }}
                >
                  {laneMovements.map((m) => {
                    const start = m.dates.start;
                    const end = m.dates.end ?? NOW;
                    const left = x(start);
                    const w = Math.max(6, x(end) - x(start));
                    const short = end - start < 60;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => router.push(`/movements/${m.id}/`)}
                        title={`${m.nameJa}（${fmtYear(start)}–${m.dates.end === null ? '現在' : fmtYear(end)}）`}
                        className="absolute top-1.5 flex items-center overflow-hidden rounded-sm border border-accent/40 bg-accent/20 px-1.5 text-left text-[11px] text-ink hover:bg-accent/35 focus-visible:z-20"
                        style={{ left, width: w, height: LANE_H - 14 }}
                      >
                        <span className="truncate">{short ? '• ' : ''}{m.nameJa}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* テキスト代替（同じ情報にアクセスできる表） */}
      <details className="mt-4 rounded-sm border hairline bg-surface p-3">
        <summary className="cursor-pointer text-sm text-muted">
          テキスト形式で表示（スクリーンリーダー・キーボード向けの代替表現）
        </summary>
        <table className="mt-3 w-full text-left text-sm">
          <caption className="sr-only">ムーブメントの年代と地域の一覧</caption>
          <thead>
            <tr className="text-xs text-faint">
              <th scope="col" className="py-1 pr-3">ムーブメント</th>
              <th scope="col" className="py-1 pr-3">年代</th>
              <th scope="col" className="py-1">地域</th>
            </tr>
          </thead>
          <tbody>
            {[...movements]
              .sort((a, b) => a.dates.start - b.dates.start)
              .map((m) => (
                <tr key={m.id} className="border-t hairline">
                  <td className="py-1.5 pr-3">
                    <a href={`/movements/${m.id}/`} className="prose-link">{m.nameJa}</a>
                  </td>
                  <td className="py-1.5 pr-3 tabular-nums text-muted">
                    {fmtYear(m.dates.start)}–{m.dates.end === null ? '現在' : fmtYear(m.dates.end)}
                  </td>
                  <td className="py-1.5 text-muted">
                    {m.regionIds.map((r) => REGION_LABELS[r]).join('・')}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
