'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Movement, RegionId } from '@/lib/schema';
import { CLASSIFICATION_LABELS, REGION_LABELS } from '@/lib/schema';
import { LodControl } from '@/components/LodControl';
import {
  filterMovementsByLod,
  getGroupMovements,
  getMovementChildren,
  getMovementGroup,
  isMovementVisibleAtLod,
} from '@/lib/movement-hierarchy';
import { useLodState } from '@/lib/use-lod-state';
import {
  TIMELINE_ERA_BANDS,
  TIMELINE_MODES,
  TIMELINE_NOW,
  clipMovementToMode,
  movementOverlapsMode,
  timelineBarMinimumWidth,
  timelineModeById,
  timelineTicks,
  timelineWidthForMode,
  yearToTimelineX,
  type TimelineEraBand,
  type TimelineModeId,
} from '@/lib/timeline-presentation';

type Props = {
  movements: Movement[];
  activeRegions: RegionId[];
};

const HEADER_H = 60;
const SURVEY_SUMMARY_H = 54;
const SURVEY_BAR_H = 26;
const DETAIL_BAR_H = 44;
const BAR_GAP = 8;
const LANE_PAD_Y = 8;
const MIN_LANE_H = 46;

const SURVEY_PRIORITY = new Set([
  'gothic',
  'italian-renaissance',
  'baroque',
  'neoclassicism',
  'romanticism',
  'realism',
  'impressionism',
  'post-impressionism',
  'cubism',
  'dada',
  'surrealism',
  'abstract-expressionism',
  'pop-art',
  'minimalism',
  'conceptual-art',
  'mono-ha',
]);

const fmtYear = (year: number) => {
  if (year === TIMELINE_NOW) return '現在';
  return year < 0 ? `前${Math.abs(year).toLocaleString('ja-JP')}` : `${year}`;
};

export function HorizontalTimeline({ movements, activeRegions }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingJump = useRef<number | null>(null);
  const lastPointerType = useRef<string>('mouse');
  const touchNavigationTarget = useRef<string | null>(null);
  const drag = useRef<{ startX: number; scrollLeft: number; active: boolean }>({
    startX: 0,
    scrollLeft: 0,
    active: false,
  });
  const [modeId, setModeId] = useState<TimelineModeId>('survey');
  const [activeMovementId, setActiveMovementId] = useState<string | null>(null);
  const [expandedMovementIds, setExpandedMovementIds] = useState<Set<string>>(
    new Set(),
  );
  const { lod, setLod, applyPurposeDefault } = useLodState('core');

  const mode = timelineModeById(modeId);
  const lodMovements = useMemo(() => {
    const visible = filterMovementsByLod(movements, lod);
    const visibleIds = new Set(visible.map((movement) => movement.id));
    const expanded = movements.filter((movement) => {
      if (visibleIds.has(movement.id)) return false;
      return [...expandedMovementIds].some((expandedId) => {
        const group = getMovementGroup(expandedId, movements);
        return (
          movement.parentMovementId === expandedId ||
          (group && movement.groupId === group.id)
        );
      });
    });
    return [...visible, ...expanded];
  }, [expandedMovementIds, lod, movements]);
  const baseVisibleIds = useMemo(
    () => new Set(filterMovementsByLod(movements, lod).map((movement) => movement.id)),
    [lod, movements],
  );
  const modeMovements = useMemo(
    () => lodMovements.filter((movement) => movementOverlapsMode(movement, mode)),
    [lodMovements, mode],
  );
  const timelineWidth = useMemo(
    () => timelineWidthForMode(mode, modeMovements.length),
    [mode, modeMovements.length],
  );
  const barHeight = mode.id === 'survey' ? SURVEY_BAR_H : DETAIL_BAR_H;

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
            const clipped = clipMovementToMode(movement, mode);
            const startX = yearToTimelineX(clipped.start, mode, timelineWidth);
            const endX = yearToTimelineX(clipped.end, mode, timelineWidth);
            const minWidth = timelineBarMinimumWidth(mode);
            const width = Math.min(timelineWidth, Math.max(minWidth, endX - startX));
            return {
              movement,
              left: Math.min(startX, timelineWidth - width),
              width,
              ...clipped,
            };
          })
          .sort((a, b) => {
            if (mode.id === 'survey') {
              const priorityDifference =
                Number(SURVEY_PRIORITY.has(b.movement.id)) -
                Number(SURVEY_PRIORITY.has(a.movement.id));
              if (priorityDifference !== 0) return priorityDifference;
            }
            return a.left - b.left || b.width - a.width;
          });

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
            rowEnds.length * (barHeight + BAR_GAP) + LANE_PAD_Y * 2 - BAR_GAP,
          ),
        };
      })
      .filter((lane) => lane.items.length > 0);
  }, [activeRegions, plottedMovements, mode, timelineWidth, barHeight]);

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

  const visibleEraBands = TIMELINE_ERA_BANDS.filter(
    (era) => era.start < mode.end && era.end > mode.start,
  );
  const ticks = timelineTicks(mode);
  const activeMovement =
    modeMovements.find((movement) => movement.id === activeMovementId) ?? null;
  const activeExpansionMembers = useMemo(() => {
    if (!activeMovement) return [];
    const children = getMovementChildren(activeMovement.id, movements);
    const group = getMovementGroup(activeMovement.id, movements);
    const groupMembers = group
      ? getGroupMovements(group.id, movements).filter(
          (movement) => movement.id !== activeMovement.id,
        )
      : [];
    return [...children, ...groupMembers].filter(
      (movement, index, all) =>
        all.findIndex((candidate) => candidate.id === movement.id) === index &&
        !isMovementVisibleAtLod(movement, lod),
    );
  }, [activeMovement, lod, movements]);

  const scrollToYear = (year: number, behavior: ScrollBehavior = 'smooth') => {
    const element = scrollRef.current;
    if (!element) return;
    const left = Math.max(
      0,
      yearToTimelineX(year, mode, timelineWidth) - element.clientWidth * 0.18,
    );
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

  const selectMode = (nextMode: TimelineModeId) => {
    pendingJump.current = null;
    setActiveMovementId(null);
    if (nextMode === modeId) {
      scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    applyPurposeDefault(nextMode === 'survey' ? 'core' : 'standard');
    setModeId(nextMode);
  };

  const jumpToEra = (era: TimelineEraBand) => {
    setActiveMovementId(null);
    if (era.mode === modeId) {
      scrollToYear(era.jumpYear);
      return;
    }
    pendingJump.current = era.jumpYear;
    applyPurposeDefault(era.mode === 'survey' ? 'core' : 'standard');
    setModeId(era.mode);
  };

  const toggleExpansion = (id: string) => {
    setExpandedMovementIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
      <div className="space-y-5 border-y hairline py-4">
        <LodControl
          value={lod}
          onChange={(next) => {
            setExpandedMovementIds(new Set());
            setLod(next);
          }}
          counts={{
            core: filterMovementsByLod(movements, 'core').length,
            standard: filterMovementsByLod(movements, 'standard').length,
            detailed: filterMovementsByLod(movements, 'detailed').length,
          }}
          compact
        />
        <div>
          <p className="mb-2 text-xs font-bold text-ink">表示モード</p>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6" role="group" aria-label="表示モード">
            {TIMELINE_MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectMode(item.id)}
                aria-current={item.id === mode.id ? 'true' : undefined}
                className={`min-h-11 rounded-sm border px-3 py-2 text-sm font-medium transition-colors active:translate-y-px ${
                  item.id === mode.id
                    ? 'border-ink border-b-[3px] border-b-accent bg-ink text-paper'
                    : 'hairline bg-raised text-muted hover:border-ink hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <nav aria-label="時代ナビゲーション">
          <p className="mb-2 text-xs font-bold text-ink">時代へ移動</p>
          <div className="grid grid-cols-4 overflow-hidden rounded-sm border hairline bg-raised sm:grid-cols-8">
            {TIMELINE_ERA_BANDS.map((era, index) => (
              <button
                key={era.label}
                type="button"
                onClick={() => jumpToEra(era)}
                className={`min-h-11 px-1.5 py-2 text-xs text-muted transition-colors hover:bg-surface hover:text-ink active:translate-y-px ${
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
      </div>

      <section
        className="sticky top-[69px] z-30 mt-4 border-y hairline bg-paper/95 px-3 py-3 backdrop-blur sm:static sm:bg-surface sm:px-4 sm:py-4"
        aria-label="現在の表示範囲"
        data-timeline-status
      >
        <div className="flex min-h-11 items-center justify-between gap-4">
          <div aria-live="polite">
            <p className="text-[11px] font-bold tracking-[0.08em] text-muted">表示中</p>
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-serif text-xl text-ink">{mode.label}</span>
              <span className="text-xs tabular-nums text-muted">
                {fmtYear(mode.start)}〜{mode.end === TIMELINE_NOW ? '現在' : fmtYear(mode.end)}
              </span>
            </p>
          </div>
          {mode.id !== 'survey' && (
            <button
              type="button"
              onClick={() => selectMode('survey')}
              className="min-h-11 shrink-0 rounded-sm border hairline bg-raised px-3 text-xs font-medium text-ink hover:border-ink active:translate-y-px"
            >
              通史へ戻る
            </button>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{mode.description}</p>
      </section>

      {activeMovement && (
        <div
          className="border-x border-b hairline bg-raised px-3 py-3 sm:px-4"
          role="status"
          data-movement-inspector
        >
          <div className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-[minmax(180px,1.4fr)_1fr_1fr_1fr]">
            <p>
              <span className="block font-bold text-muted">正式名称</span>
              <span className="mt-0.5 block text-sm font-medium text-ink">
                {activeMovement.nameJa}
              </span>
            </p>
            <p>
              <span className="block font-bold text-muted">年代</span>
              <span className="mt-0.5 block tabular-nums text-ink">
                {fmtYear(activeMovement.dates.start)}〜
                {activeMovement.dates.end === null ? '現在' : fmtYear(activeMovement.dates.end)}
              </span>
            </p>
            <p>
              <span className="block font-bold text-muted">地域</span>
              <span className="mt-0.5 block text-ink">
                {activeMovement.regionIds.map((region) => REGION_LABELS[region]).join('・')}
              </span>
            </p>
            <p>
              <span className="block font-bold text-muted">分類</span>
              <span className="mt-0.5 block text-ink">
                {CLASSIFICATION_LABELS[activeMovement.classification]}
              </span>
            </p>
          </div>
          {activeExpansionMembers.length > 0 && (
            <button
              type="button"
              onClick={() => toggleExpansion(activeMovement.id)}
              aria-expanded={expandedMovementIds.has(activeMovement.id)}
              className="mt-3 min-h-11 border-l-2 border-accent px-3 text-left text-xs font-medium text-ink hover:bg-surface"
              data-timeline-expand={activeMovement.id}
            >
              {expandedMovementIds.has(activeMovement.id) ? '内訳を閉じる' : '内訳を展開'}
              <span className="ml-2 text-muted">
                {activeExpansionMembers.map((movement) => movement.nameJa).join('・')}
              </span>
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex overflow-hidden rounded-sm border hairline bg-raised">
        <div
          className="sticky left-0 z-20 w-[96px] shrink-0 border-r hairline bg-raised sm:w-36"
          data-region-column
        >
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
              data-region-lane-label={lane.region}
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
            data-timeline-mode={mode.id}
            data-timeline-lod={lod}
            data-lane-count={laneLayouts.length}
            style={{ width: timelineWidth, height: chartHeight }}
          >
            <div className="absolute inset-x-0 top-0 border-b hairline" style={{ height: HEADER_H }}>
              {visibleEraBands.map((era, index) => {
                const left = yearToTimelineX(
                  Math.max(era.start, mode.start),
                  mode,
                  timelineWidth,
                );
                const right = yearToTimelineX(
                  Math.min(era.end, mode.end),
                  mode,
                  timelineWidth,
                );
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
                style={{ left: yearToTimelineX(tick, mode, timelineWidth) }}
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
                  const left = yearToTimelineX(summary.start, mode, timelineWidth);
                  const right = yearToTimelineX(summary.end, mode, timelineWidth);
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
                data-timeline-lane={lane.region}
                className={`absolute inset-x-0 border-b hairline ${
                  index % 2 === 1 ? 'bg-surface/35' : ''
                }`}
                style={{ top: lane.top, height: lane.height }}
              >
                {lane.items.map(
                  ({ movement, left, width, row, clippedStart, clippedEnd }) => {
                  const isPriority = mode.id !== 'survey' || SURVEY_PRIORITY.has(movement.id);
                  const isExpandedDetail = !baseVisibleIds.has(movement.id);
                  const accessibleLabel = `${movement.nameJa}。${fmtYear(movement.dates.start)}から${
                    movement.dates.end === null ? '現在' : fmtYear(movement.dates.end)
                  }。${movement.regionIds.map((region) => REGION_LABELS[region]).join('・')}。${
                    CLASSIFICATION_LABELS[movement.classification]
                  }`;
                  return (
                    <Link
                      key={movement.id}
                      href={`/movements/${movement.id}/`}
                      prefetch={false}
                      aria-label={accessibleLabel}
                      title={accessibleLabel}
                      data-timeline-bar={movement.id}
                      data-clipped-start={clippedStart || undefined}
                      data-clipped-end={clippedEnd || undefined}
                      data-hierarchy-level={isExpandedDetail ? 'child' : 'root'}
                      onMouseEnter={(event) => {
                        // Touch browsers may synthesize mouseenter after a tap. Also keep a
                        // keyboard-focused bar authoritative so the inspector does not jump
                        // to whichever overlapping bar happens to sit under the pointer.
                        const focusedBar =
                          event.currentTarget.ownerDocument.querySelector(
                            '[data-timeline-bar]:focus',
                          );
                        if (
                          lastPointerType.current !== 'touch' &&
                          focusedBar === null
                        ) {
                          setActiveMovementId(movement.id);
                        }
                      }}
                      onFocus={() => setActiveMovementId(movement.id)}
                      onPointerDown={(event) => {
                        lastPointerType.current = event.pointerType;
                        if (event.pointerType === 'touch') {
                          // Capture the selection state before the tap focuses the link.
                          // The first tap opens the inspector; only a later tap navigates.
                          touchNavigationTarget.current =
                            activeMovementId === movement.id ? movement.id : null;
                        } else {
                          setActiveMovementId(movement.id);
                        }
                      }}
                      onClick={(event) => {
                        if (
                          lastPointerType.current === 'touch' &&
                          touchNavigationTarget.current !== movement.id
                        ) {
                          event.preventDefault();
                          setActiveMovementId(movement.id);
                        }
                      }}
                      className={`absolute flex items-center overflow-hidden rounded-sm border px-2 text-left text-[11px] leading-tight transition-colors hover:border-accent hover:bg-accent/30 focus-visible:z-20 active:translate-y-px ${
                        isPriority
                          ? 'border-accent/50 bg-accent/20 text-ink'
                          : 'hairline bg-raised/90 text-muted'
                      } ${isExpandedDetail ? 'ml-2 border-l-2 opacity-80' : ''}`}
                      style={{
                        left: left + (isExpandedDetail ? 8 : 0),
                        top: LANE_PAD_Y + row * (barHeight + BAR_GAP),
                        width: Math.max(1, width - (isExpandedDetail ? 8 : 0)),
                        height: isExpandedDetail ? barHeight - 6 : barHeight,
                      }}
                    >
                      {clippedStart && (
                        <span
                          className="absolute inset-y-0 left-0 z-10 flex w-3 items-center bg-gradient-to-r from-paper/90 to-transparent text-[10px]"
                          aria-hidden="true"
                        >
                          ‹
                        </span>
                      )}
                      <span
                        className={
                          mode.id === 'survey'
                            ? 'timeline-label-survey block w-full'
                            : 'timeline-label-detail block w-full'
                        }
                      >
                        {mode.id === 'survey' ? movement.shortLabel ?? movement.nameJa : movement.nameJa}
                      </span>
                      {clippedEnd && (
                        <span
                          className="absolute inset-y-0 right-0 z-10 flex w-3 items-center justify-end bg-gradient-to-l from-paper/90 to-transparent text-[10px]"
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-faint">
        横にスワイプ、または余白をドラッグして移動できます。バーはホバーまたはフォーカスで詳細を表示し、タッチでは2回目の選択で詳細ページを開きます。
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
                      {movement.dates.start < mode.start && '以前から '}
                      {fmtYear(Math.max(movement.dates.start, mode.start))}〜
                      {movement.dates.end === null && mode.end === TIMELINE_NOW
                        ? '現在'
                        : movement.dates.end === null || movement.dates.end > mode.end
                        ? `${fmtYear(mode.end)}以後へ`
                        : fmtYear(movement.dates.end)}
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
