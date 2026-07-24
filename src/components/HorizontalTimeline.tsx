'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Movement, RegionId } from '@/lib/schema';
import { REGION_LABELS } from '@/lib/schema';

type Props = {
  movements: Movement[];
  activeRegions: RegionId[];
};

type ModeId = 'survey' | 'ancient' | 'medieval' | 'early-modern' | 'modern' | 'contemporary';

type TimelineMode = {
  id: ModeId;
  label: string;
  start: number;
  end: number;
  width: number;
  tickStep: number;
  description: string;
};

type EraBand = {
  label: string;
  start: number;
  end: number;
  mode: ModeId;
  jumpYear: number;
};

const NOW = 2026;
const HEADER_H = 54;
const SURVEY_SUMMARY_H = 54;
const BAR_H = 24;
const BAR_GAP = 6;
const LANE_PAD_Y = 7;
const MIN_LANE_H = 42;

const MODES: TimelineMode[] = [
  {
    id: 'survey',
    label: '通史',
    start: -40000,
    end: NOW,
    width: 1180,
    tickStep: 0,
    description: '各時代に読める幅を配分し、先史と古代は要点に圧縮しています。',
  },
  {
    id: 'ancient',
    label: '古代',
    start: -3000,
    end: 500,
    width: 720,
    tickStep: 500,
    description: '紀元前3000年から500年まで。古代地中海世界を中心に表示します。',
  },
  {
    id: 'medieval',
    label: '中世',
    start: 300,
    end: 1450,
    width: 820,
    tickStep: 200,
    description: '300年から1450年まで。ビザンティンからゴシックへの流れを表示します。',
  },
  {
    id: 'early-modern',
    label: '近世',
    start: 1400,
    end: 1800,
    width: 850,
    tickStep: 50,
    description: '1400年から1800年まで。ルネサンスからバロック、ロココへの展開を表示します。',
  },
  {
    id: 'modern',
    label: '近代',
    start: 1750,
    end: 1950,
    width: 940,
    tickStep: 25,
    description: '1750年から1950年まで。古典の再編からモダニズムの成立までを表示します。',
  },
  {
    id: 'contemporary',
    label: '現代',
    start: 1900,
    end: NOW,
    width: 900,
    tickStep: 20,
    description: '1900年から現在まで。モダニズム、戦後美術、現代美術を表示します。',
  },
];

const ERA_BANDS: EraBand[] = [
  { label: '先史', start: -40000, end: -3000, mode: 'survey', jumpYear: -40000 },
  { label: '古代', start: -3000, end: 500, mode: 'ancient', jumpYear: -480 },
  { label: '中世', start: 500, end: 1400, mode: 'medieval', jumpYear: 700 },
  { label: 'ルネサンス', start: 1400, end: 1600, mode: 'early-modern', jumpYear: 1400 },
  { label: '近世', start: 1600, end: 1750, mode: 'early-modern', jumpYear: 1600 },
  { label: '19世紀', start: 1750, end: 1900, mode: 'modern', jumpYear: 1800 },
  { label: '20世紀', start: 1900, end: 2000, mode: 'contemporary', jumpYear: 1900 },
  { label: '現代', start: 2000, end: NOW, mode: 'contemporary', jumpYear: 2000 },
];

// 通史では年代の長さではなく、美術史を読むための情報量に応じて横幅を配分する。
const SURVEY_SEGMENTS = [
  { start: -40000, end: -3000, weight: 0.1 },
  { start: -3000, end: 500, weight: 0.1 },
  { start: 500, end: 1400, weight: 0.12 },
  { start: 1400, end: 1600, weight: 0.14 },
  { start: 1600, end: 1750, weight: 0.11 },
  { start: 1750, end: 1900, weight: 0.15 },
  { start: 1900, end: 1950, weight: 0.12 },
  { start: 1950, end: NOW, weight: 0.16 },
] as const;

const SURVEY_TICKS = [-40000, -3000, 500, 1400, 1600, 1750, 1900, 1950, 2000, NOW];

const fmtYear = (year: number) => {
  if (year === NOW) return '現在';
  return year < 0 ? `前${Math.abs(year).toLocaleString('ja-JP')}` : `${year}`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function yearToX(year: number, mode: TimelineMode) {
  const clampedYear = clamp(year, mode.start, mode.end);
  if (mode.id !== 'survey') {
    return ((clampedYear - mode.start) / (mode.end - mode.start)) * mode.width;
  }

  let progress = 0;
  for (const segment of SURVEY_SEGMENTS) {
    if (clampedYear >= segment.end) {
      progress += segment.weight;
      continue;
    }
    if (clampedYear >= segment.start) {
      const localProgress = (clampedYear - segment.start) / (segment.end - segment.start);
      progress += localProgress * segment.weight;
    }
    break;
  }
  return progress * mode.width;
}

function ticksForMode(mode: TimelineMode) {
  if (mode.id === 'survey') return SURVEY_TICKS;

  const ticks: number[] = [];
  const first = Math.ceil(mode.start / mode.tickStep) * mode.tickStep;
  for (let year = first; year <= mode.end; year += mode.tickStep) ticks.push(year);
  if (ticks.at(-1) !== mode.end) ticks.push(mode.end);
  return ticks;
}

function overlapsMode(movement: Movement, mode: TimelineMode) {
  const end = movement.dates.end ?? NOW;
  return movement.dates.start < mode.end && end > mode.start;
}

export function HorizontalTimeline({ movements, activeRegions }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingJump = useRef<number | null>(null);
  const drag = useRef<{ startX: number; scrollLeft: number; active: boolean }>({
    startX: 0,
    scrollLeft: 0,
    active: false,
  });
  const [modeId, setModeId] = useState<ModeId>('survey');

  const mode = MODES.find((item) => item.id === modeId) ?? MODES[0];
  const modeMovements = useMemo(
    () => movements.filter((movement) => overlapsMode(movement, mode)),
    [movements, mode],
  );

  // 通史では先史と古代を個別の長大バーにせず、専用の要約帯にまとめる。
  const plottedMovements = useMemo(
    () =>
      mode.id === 'survey'
        ? modeMovements.filter((movement) => movement.era !== 'prehistoric-ancient')
        : modeMovements,
    [modeMovements, mode.id],
  );

  const laneLayouts = useMemo(() => {
    return activeRegions
      .map((region) => {
        const candidates = plottedMovements
          .filter((movement) => movement.regionIds.includes(region))
          .map((movement) => {
            const startX = yearToX(Math.max(movement.dates.start, mode.start), mode);
            const endX = yearToX(Math.min(movement.dates.end ?? NOW, mode.end), mode);
            const minWidth = mode.id === 'survey' ? 58 : 76;
            return {
              movement,
              left: startX,
              width: Math.min(mode.width - startX, Math.max(minWidth, endX - startX)),
            };
          })
          .sort((a, b) => a.left - b.left || b.width - a.width);

        const rowEnds: number[] = [];
        const items = candidates.map((item) => {
          let row = rowEnds.findIndex((end) => item.left >= end + BAR_GAP);
          if (row === -1) {
            row = rowEnds.length;
            rowEnds.push(0);
          }
          rowEnds[row] = item.left + item.width;
          return { ...item, row };
        });

        return {
          region,
          items,
          height: Math.max(
            MIN_LANE_H,
            rowEnds.length * (BAR_H + BAR_GAP) + LANE_PAD_Y * 2 - BAR_GAP,
          ),
        };
      })
      .filter((lane) => lane.items.length > 0);
  }, [activeRegions, plottedMovements, mode]);

  const laneOffsets = useMemo(() => {
    let offset = HEADER_H + (mode.id === 'survey' ? SURVEY_SUMMARY_H : 0);
    return laneLayouts.map((lane) => {
      const top = offset;
      offset += lane.height;
      return { ...lane, top };
    });
  }, [laneLayouts, mode.id]);

  const chartHeight =
    HEADER_H +
    (mode.id === 'survey' ? SURVEY_SUMMARY_H : 0) +
    laneLayouts.reduce((sum, lane) => sum + lane.height, 0);

  const visibleEraBands = ERA_BANDS.filter(
    (era) => era.start < mode.end && era.end > mode.start,
  );
  const ticks = ticksForMode(mode);

  const scrollToYear = (year: number, behavior: ScrollBehavior = 'smooth') => {
    const element = scrollRef.current;
    if (!element) return;
    const left = Math.max(0, yearToX(year, mode) - element.clientWidth * 0.18);
    element.scrollTo({ left, behavior });
  };

  useEffect(() => {
    const targetYear = pendingJump.current;
    pendingJump.current = null;
    requestAnimationFrame(() => {
      if (targetYear === null) {
        scrollRef.current?.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        scrollToYear(targetYear);
      }
    });
    // modeの変更後、新しい尺度で移動する。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeId]);

  const selectMode = (nextMode: ModeId) => {
    pendingJump.current = null;
    if (nextMode === modeId) {
      scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    setModeId(nextMode);
  };

  const jumpToEra = (era: EraBand) => {
    if (era.mode === modeId) {
      scrollToYear(era.jumpYear);
      return;
    }
    pendingJump.current = era.jumpYear;
    setModeId(era.mode);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    const element = scrollRef.current;
    if (!element || event.pointerType !== 'mouse') return;
    if ((event.target as HTMLElement).closest('a,button')) return;
    drag.current = {
      startX: event.clientX,
      scrollLeft: element.scrollLeft,
      active: true,
    };
    element.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current.active || !scrollRef.current) return;
    scrollRef.current.scrollLeft =
      drag.current.scrollLeft - (event.clientX - drag.current.startX);
  };

  const onPointerUp = () => {
    drag.current.active = false;
  };

  return (
    <div>
      <div className="space-y-4 rounded-sm border hairline bg-surface p-3 sm:p-4">
        <nav aria-label="時代ナビゲーション">
          <p className="mb-2 text-xs font-medium text-muted">時代へ移動</p>
          <div className="grid grid-cols-4 overflow-hidden rounded-sm border hairline bg-raised sm:grid-cols-8">
            {ERA_BANDS.map((era, index) => (
              <button
                key={era.label}
                type="button"
                onClick={() => jumpToEra(era)}
                className={`min-h-10 px-1.5 py-2 text-xs text-muted transition-colors hover:bg-surface hover:text-ink active:translate-y-px ${
                  index % 4 !== 0 ? 'border-l hairline' : ''
                } ${index >= 4 ? 'border-t hairline sm:border-t-0' : ''} ${
                  index > 0 && index % 4 === 0 ? 'sm:border-l' : ''
                }`}
              >
                {era.label}
              </button>
            ))}
          </div>
        </nav>

        <div>
          <p className="mb-2 text-xs font-medium text-muted">表示範囲</p>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6" role="group" aria-label="表示範囲">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectMode(item.id)}
                aria-pressed={item.id === mode.id}
                className={`min-h-10 rounded-sm border hairline px-3 py-2 text-sm transition-colors active:translate-y-px ${
                  item.id === mode.id
                    ? 'bg-ink text-paper'
                    : 'bg-raised text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-sm text-ink">{mode.description}</p>
            <p className="whitespace-nowrap text-xs tabular-nums text-faint">
              {fmtYear(mode.start)} - {mode.end === NOW ? '現在' : fmtYear(mode.end)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex overflow-hidden rounded-sm border hairline bg-raised">
        <div className="w-[88px] shrink-0 border-r hairline sm:w-32">
          <div className="flex items-end px-2 pb-2 text-[10px] text-faint" style={{ height: HEADER_H }}>
            地域
          </div>
          {mode.id === 'survey' && (
            <div
              className="flex items-center border-t hairline px-2 text-xs text-muted"
              style={{ height: SURVEY_SUMMARY_H }}
            >
              起点
            </div>
          )}
          {laneLayouts.map((lane) => (
            <div
              key={lane.region}
              className="flex items-center border-t hairline px-2 text-[11px] leading-snug text-muted sm:text-xs"
              style={{ height: lane.height }}
            >
              {REGION_LABELS[lane.region]}
            </div>
          ))}
        </div>

        <div
          ref={scrollRef}
          className="scroll-x relative min-w-0 flex-1 cursor-grab touch-pan-x select-none overscroll-x-contain active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          role="group"
          aria-label={`${mode.label}の横型タイムライン。横にスワイプまたはドラッグして移動できます`}
        >
          <div
            className="relative"
            data-timeline-track
            style={{ width: mode.width, height: chartHeight }}
          >
            <div className="absolute inset-x-0 top-0 border-b hairline" style={{ height: HEADER_H }}>
              {visibleEraBands.map((era, index) => {
                const left = yearToX(Math.max(era.start, mode.start), mode);
                const right = yearToX(Math.min(era.end, mode.end), mode);
                return (
                  <div
                    key={era.label}
                    className={`absolute top-0 overflow-hidden border-r hairline px-2 pt-1 text-[10px] font-medium text-muted ${
                      index % 2 === 1 ? 'bg-surface/70' : 'bg-raised'
                    }`}
                    style={{ left, width: Math.max(1, right - left), height: 28 }}
                  >
                    <span className="whitespace-nowrap">{era.label}</span>
                  </div>
                );
              })}
            </div>

            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute bottom-0 top-7 border-l hairline"
                style={{ left: yearToX(tick, mode) }}
                aria-hidden="true"
              >
                <span
                  className={`absolute top-0 whitespace-nowrap bg-raised px-1 text-[10px] tabular-nums text-faint ${
                    tick === mode.start
                      ? ''
                      : tick === mode.end
                        ? '-translate-x-full'
                        : '-translate-x-1/2'
                  }`}
                >
                  {fmtYear(tick)}
                </span>
              </div>
            ))}

            {mode.id === 'survey' && (
              <div
                className="absolute inset-x-0 border-b hairline bg-surface/30"
                style={{ top: HEADER_H, height: SURVEY_SUMMARY_H }}
              >
                {[
                  {
                    id: 'prehistoric-ritual',
                    label: '先史の造形',
                    note: '像・洞窟画・祭祀',
                    start: -40000,
                    end: -3000,
                  },
                  {
                    id: 'ancient-greek-classical',
                    label: '古代の規範',
                    note: '比例・理想美・公共性',
                    start: -3000,
                    end: 500,
                  },
                ].map((summary) => {
                  const left = yearToX(summary.start, mode);
                  const right = yearToX(summary.end, mode);
                  return (
                    <Link
                      key={summary.id}
                      href={`/movements/${summary.id}/`}
                      prefetch={false}
                      className="absolute top-1.5 overflow-hidden rounded-sm border border-accent/40 bg-accent/20 px-2 py-1 leading-tight text-ink transition-colors hover:bg-accent/25 active:translate-y-px"
                      style={{ left: left + 4, width: Math.max(72, right - left - 8), height: 42 }}
                    >
                      <span className="block truncate text-[11px] font-medium">{summary.label}</span>
                      <span className="block truncate text-[9px] text-muted">{summary.note}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {laneOffsets.map((lane, index) => (
              <div
                key={lane.region}
                className={`absolute inset-x-0 border-b hairline ${
                  index % 2 === 1 ? 'bg-surface/35' : ''
                }`}
                style={{ top: lane.top, height: lane.height }}
              >
                {lane.items.map(({ movement, left, width, row }) => {
                  const start = Math.max(movement.dates.start, mode.start);
                  const end = Math.min(movement.dates.end ?? NOW, mode.end);
                  return (
                    <Link
                      key={movement.id}
                      href={`/movements/${movement.id}/`}
                      prefetch={false}
                      title={`${movement.nameJa}（${fmtYear(start)}-${movement.dates.end === null ? '現在' : fmtYear(end)}）`}
                      className="absolute flex items-center overflow-hidden rounded-sm border border-accent/40 bg-accent/20 px-1.5 text-left text-[11px] text-ink transition-colors hover:bg-accent/35 focus-visible:z-20 active:translate-y-px"
                      style={{
                        left,
                        top: LANE_PAD_Y + row * (BAR_H + BAR_GAP),
                        width,
                        height: BAR_H,
                      }}
                    >
                      <span className="truncate">{movement.nameJa}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-faint">
        横にスワイプ、または余白をドラッグして移動できます。バーを選ぶと詳細を開きます。
      </p>

      <details className="mt-4 rounded-sm border hairline bg-surface p-3">
        <summary className="cursor-pointer text-sm text-muted">
          {mode.label}をテキスト形式で表示
        </summary>
        <div className="scroll-x mt-3">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">
              {mode.label}に含まれるムーブメントの年代と地域の一覧
            </caption>
            <thead>
              <tr className="text-xs text-faint">
                <th scope="col" className="py-1 pr-3">ムーブメント</th>
                <th scope="col" className="py-1 pr-3">年代</th>
                <th scope="col" className="py-1">地域</th>
              </tr>
            </thead>
            <tbody>
              {[...modeMovements]
                .sort((a, b) => a.dates.start - b.dates.start)
                .map((movement) => (
                  <tr key={movement.id} className="border-t hairline">
                    <td className="py-1.5 pr-3">
                      <Link href={`/movements/${movement.id}/`} className="prose-link">
                        {movement.nameJa}
                      </Link>
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums text-muted">
                      {fmtYear(movement.dates.start)}-
                      {movement.dates.end === null ? '現在' : fmtYear(movement.dates.end)}
                    </td>
                    <td className="py-1.5 text-muted">
                      {movement.regionIds.map((region) => REGION_LABELS[region]).join('・')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
