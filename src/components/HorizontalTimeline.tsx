'use client';

import Link from 'next/link';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { Movement, RegionId } from '@/lib/schema';
import { CLASSIFICATION_LABELS, REGION_LABELS } from '@/lib/schema';
import { SemanticLodFab } from '@/components/SemanticLodFab';
import {
  TimelineViewerFrame,
  type TimelineViewerNode,
  type TimelineViewerRegion,
} from '@/components/TimelineViewerFrame';
import {
  filterMovementsByLod,
} from '@/lib/movement-hierarchy';
import { useLodState } from '@/lib/use-lod-state';
import {
  TIMELINE_ERA_BANDS,
  TIMELINE_MODES,
  TIMELINE_NOW,
  calculateFollowLabelX,
  chooseTimelineLabel,
  clipMovementToMode,
  fitTimelineModeToMovements,
  formatTimelineYearLabel,
  movementOverlapsMode,
  timelineJapaneseShortLabel,
  timelineBarVisualWidth,
  timelineModeById,
  timelineTicks,
  timelineWidthForMode,
  yearToTimelineX,
  type TimelineModeId,
} from '@/lib/timeline-presentation';
import { timelineRegionRgb } from '@/lib/timeline-region-presentation';

type Props = {
  movements: Movement[];
  activeRegions: RegionId[];
};

const DESKTOP_HEADER_H = 60;
const MOBILE_HEADER_H = 56;
const SURVEY_SUMMARY_H = 54;
const SURVEY_BAR_H = 44;
const DESKTOP_DETAIL_BAR_H = 44;
const MOBILE_DETAIL_BAR_H = 44;
const DESKTOP_BAR_GAP = 2;
const MOBILE_BAR_GAP = 2;
const DESKTOP_LANE_PAD_Y = 3;
const MOBILE_LANE_PAD_Y = 3;
const DESKTOP_MIN_LANE_H = 50;
const MOBILE_MIN_LANE_H = 50;
const LABEL_INNER_PADDING = 8;
const LABEL_TEXT_PADDING = 16;
const DESKTOP_DETAIL_LABEL_FOOTPRINT = 140;
const MOBILE_DETAIL_LABEL_FOOTPRINT = 120;

type LabelGeometry = {
  element: HTMLElement;
  textElement: HTMLElement;
  barStart: number;
  barEnd: number;
  labelWidth: number;
  maximumWidth: number;
  name: string;
  shortLabel?: string;
  nameWidth: number;
  shortLabelWidth?: number;
};

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

const SURVEY_SUMMARIES = [
  {
    id: 'prehistoric-ritual',
    label: '先史の造形',
    start: -40000,
    end: -3000,
  },
  {
    id: 'ancient-greek-classical',
    label: '古代の規範',
    start: -3000,
    end: 500,
  },
] as const;

const fmtYear = (year: number) => {
  if (year === TIMELINE_NOW) return '現在';
  return formatTimelineYearLabel(year);
};

export function HorizontalTimeline({
  movements,
  activeRegions,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pendingJump = useRef<number | null>(null);
  const labelAnimationFrame = useRef<number | null>(null);
  const labelGeometries = useRef<LabelGeometry[]>([]);
  const viewerTriggerRef = useRef<HTMLButtonElement>(null);
  const viewerScrollLeft = useRef(0);
  const wasViewerMode = useRef(false);
  const drag = useRef<{ startX: number; scrollLeft: number; active: boolean }>({
    startX: 0,
    scrollLeft: 0,
    active: false,
  });
  const [modeId, setModeId] = useState<TimelineModeId>('survey');
  const [isCompactTimeline, setIsCompactTimeline] = useState(false);
  const [isViewerMode, setIsViewerMode] = useState(false);
  const { lod, setLod, applyPurposeDefault } = useLodState('core');

  const mode = timelineModeById(modeId);
  const lodCounts = useMemo(
    () => ({
      core: filterMovementsByLod(movements, 'core').length,
      standard: filterMovementsByLod(movements, 'standard').length,
      detailed: filterMovementsByLod(movements, 'detailed').length,
    }),
    [movements],
  );
  const lodMovements = useMemo(
    () => filterMovementsByLod(movements, lod),
    [lod, movements],
  );
  const modeMovements = useMemo(
    () => lodMovements.filter((movement) => movementOverlapsMode(movement, mode)),
    [lodMovements, mode],
  );
  const displayMode = useMemo(
    () => fitTimelineModeToMovements(mode, modeMovements),
    [mode, modeMovements],
  );
  const timelineWidth = useMemo(
    () =>
      timelineWidthForMode(displayMode, modeMovements.length, isCompactTimeline),
    [displayMode, isCompactTimeline, modeMovements.length],
  );
  const headerHeight = isCompactTimeline ? MOBILE_HEADER_H : DESKTOP_HEADER_H;
  const barHeight =
    mode.id === 'survey'
      ? SURVEY_BAR_H
      : isCompactTimeline
        ? MOBILE_DETAIL_BAR_H
        : DESKTOP_DETAIL_BAR_H;
  const barGap = isCompactTimeline ? MOBILE_BAR_GAP : DESKTOP_BAR_GAP;
  const lanePaddingY = isCompactTimeline
    ? MOBILE_LANE_PAD_Y
    : DESKTOP_LANE_PAD_Y;
  const minimumLaneHeight = isCompactTimeline
    ? MOBILE_MIN_LANE_H
    : DESKTOP_MIN_LANE_H;
  const regionColumnWidth = isCompactTimeline ? 80 : 144;

  useEffect(() => {
    const coarsePointer = window.matchMedia(
      '(hover: none) and (pointer: coarse)',
    );
    const narrowViewport = window.matchMedia('(max-width: 639px)');
    const update = () =>
      setIsCompactTimeline(coarsePointer.matches || narrowViewport.matches);
    update();
    coarsePointer.addEventListener('change', update);
    narrowViewport.addEventListener('change', update);
    return () => {
      coarsePointer.removeEventListener('change', update);
      narrowViewport.removeEventListener('change', update);
    };
  }, []);

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
            const startX = yearToTimelineX(
              clipped.start,
              displayMode,
              timelineWidth,
            );
            const endX = yearToTimelineX(
              clipped.end,
              displayMode,
              timelineWidth,
            );
            const width = timelineBarVisualWidth(startX, endX);
            return {
              movement,
              left: startX,
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
          let row = rowEnds.findIndex((end) => item.left >= end + barGap);
          if (row === -1) {
            row = rowEnds.length;
            rowEnds.push(0);
          }
          const labelFootprint =
            mode.id === 'survey'
              ? item.width
              : Math.max(
                  item.width,
                  isCompactTimeline
                    ? MOBILE_DETAIL_LABEL_FOOTPRINT
                    : DESKTOP_DETAIL_LABEL_FOOTPRINT,
                );
          rowEnds[row] = item.left + labelFootprint;
          return { ...item, row };
        });

        return {
          region,
          items,
          height: Math.max(
            minimumLaneHeight,
            rowEnds.length * (barHeight + barGap) +
              lanePaddingY * 2 -
              barGap,
          ),
        };
      })
      .filter((lane) => lane.items.length > 0);
  }, [
    activeRegions,
    plottedMovements,
    mode,
    displayMode,
    timelineWidth,
    barHeight,
    barGap,
    isCompactTimeline,
    lanePaddingY,
    minimumLaneHeight,
  ]);

  const laneOffsets = useMemo(() => {
    let offset =
      headerHeight + (mode.id === 'survey' ? SURVEY_SUMMARY_H : 0);
    return laneLayouts.map((lane) => {
      const top = offset;
      offset += lane.height;
      return { ...lane, top };
    });
  }, [headerHeight, laneLayouts, mode.id]);

  const chartHeight =
    headerHeight +
    (mode.id === 'survey' ? SURVEY_SUMMARY_H : 0) +
    laneLayouts.reduce((sum, lane) => sum + lane.height, 0);

  const visibleEraBands = TIMELINE_ERA_BANDS.filter(
    (era) => era.start < mode.end && era.end > mode.start,
  );
  const ticks = timelineTicks(displayMode, timelineWidth);
  const majorTickStride =
    mode.id === 'survey' ? 1 : Math.max(1, Math.ceil((ticks.length - 1) / 4));
  const viewerNodes = useMemo<TimelineViewerNode[]>(() => {
    const nodes: TimelineViewerNode[] = laneOffsets.flatMap((lane) =>
      lane.items.map(({ movement, left, width }) => ({
        key: `${lane.region}-${movement.id}`,
        movementId: movement.id,
        href: `/movements/${movement.id}/`,
        nameJa: movement.nameJa,
        shortLabel: timelineJapaneseShortLabel(movement.shortLabel),
        dateLabel: `${fmtYear(movement.dates.start)}〜${
          movement.dates.end === null ? '現在' : fmtYear(movement.dates.end)
        }`,
        regionLabel: movement.regionIds
          .map((region) => REGION_LABELS[region])
          .join('・'),
        classificationLabel: CLASSIFICATION_LABELS[movement.classification],
        barStart: left,
        barEnd: left + width,
        regionId: lane.region,
        regionColor: timelineRegionRgb(lane.region),
        secondaryOccurrence: lane.region !== movement.regionIds[0],
        priority:
          movement.visibilityLevel === 'core' &&
          (mode.id !== 'survey' || SURVEY_PRIORITY.has(movement.id)),
      })),
    );

    if (mode.id !== 'survey') return nodes;
    const summaryNodes = SURVEY_SUMMARIES.flatMap((summary) => {
      const movement = movements.find((candidate) => candidate.id === summary.id);
      if (!movement) return [];
      return [
        {
          key: `origin-${summary.id}`,
          movementId: movement.id,
          href: `/movements/${movement.id}/`,
          nameJa: summary.label,
          shortLabel: timelineJapaneseShortLabel(movement.shortLabel),
          dateLabel: `${fmtYear(movement.dates.start)}〜${
            movement.dates.end === null ? '現在' : fmtYear(movement.dates.end)
          }`,
          regionLabel: movement.regionIds
            .map((region) => REGION_LABELS[region])
            .join('・'),
          classificationLabel: CLASSIFICATION_LABELS[movement.classification],
          barStart: yearToTimelineX(
            summary.start,
            displayMode,
            timelineWidth,
          ),
          barEnd: yearToTimelineX(summary.end, displayMode, timelineWidth),
          regionId: 'origin',
          regionColor: undefined,
          secondaryOccurrence: false,
          priority: true,
        },
      ];
    });
    return [...summaryNodes, ...nodes];
  }, [
    displayMode,
    laneOffsets,
    mode.id,
    movements,
    timelineWidth,
  ]);
  const viewerRegions = useMemo<TimelineViewerRegion[]>(
    () => [
      ...(mode.id === 'survey'
        ? [
            {
              id: 'origin',
              label: '背景・基盤',
              top: headerHeight,
              height: SURVEY_SUMMARY_H,
            },
          ]
        : []),
      ...laneOffsets.map((lane) => ({
        id: lane.region,
        label: REGION_LABELS[lane.region],
        regionColor: timelineRegionRgb(lane.region),
        top: lane.top,
        height: lane.height,
      })),
    ],
    [headerHeight, laneOffsets, mode.id],
  );

  const scheduleTimelineLabelUpdate = () => {
    if (isViewerMode) return;
    if (labelAnimationFrame.current !== null) return;
    labelAnimationFrame.current = requestAnimationFrame(() => {
      labelAnimationFrame.current = null;
      const viewport = scrollRef.current;
      if (!viewport) return;
      const viewportLeft = viewport.scrollLeft;
      const viewportRight = viewportLeft + viewport.clientWidth;

      for (const geometry of labelGeometries.current) {
        const visibleWidth = Math.max(
          1,
          Math.min(geometry.barEnd, viewportRight) -
            Math.max(geometry.barStart, viewportLeft) -
            LABEL_INNER_PADDING * 2,
        );
        const availableWidth = Math.min(geometry.maximumWidth, visibleWidth);
        const availableNameWidth = Math.max(
          1,
          availableWidth - LABEL_TEXT_PADDING,
        );
        const choice = chooseTimelineLabel({
          name: geometry.name,
          shortLabel: geometry.shortLabel,
          availableWidth: availableNameWidth,
          nameWidth: geometry.nameWidth,
          shortLabelWidth: geometry.shortLabelWidth,
        });
        const chosenWidth =
          choice.variant === 'full'
            ? geometry.nameWidth
            : choice.variant === 'short'
              ? geometry.shortLabelWidth ?? geometry.nameWidth
              : Math.min(
                  geometry.shortLabelWidth ?? geometry.nameWidth,
                  availableNameWidth,
                );
        const resolvedLabelWidth = Math.max(
          1,
          Math.min(chosenWidth + LABEL_TEXT_PADDING, availableWidth),
        );
        geometry.textElement.textContent = choice.label;
        geometry.element.dataset.labelVariant = choice.variant;
        geometry.element.style.maxWidth = `${availableWidth}px`;
        geometry.element.style.width = `${resolvedLabelWidth}px`;
        geometry.labelWidth = resolvedLabelWidth;

        const position = calculateFollowLabelX({
          barStart: geometry.barStart,
          barEnd: geometry.barEnd,
          labelWidth: geometry.labelWidth,
          viewportLeft,
          viewportRight,
          innerPadding: LABEL_INNER_PADDING,
        });
        const offset = position.x - geometry.barStart;
        geometry.element.style.transform = `translate3d(${offset}px, 0, 0)`;
        geometry.element.dataset.labelFollowing = position.followsViewport
          ? 'true'
          : 'false';
      }
    });
  };

  useLayoutEffect(() => {
    if (isViewerMode) {
      labelGeometries.current = [];
      return;
    }
    const track = trackRef.current;
    const viewport = scrollRef.current;
    if (!track || !viewport) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const nextGeometries: LabelGeometry[] = [];
    const labels = track.querySelectorAll<HTMLElement>('[data-follow-label]');

    for (const element of labels) {
      const bar = element.closest<HTMLElement>('[data-timeline-bar]');
      const textElement = element.querySelector<HTMLElement>('[data-label-text]');
      if (!bar || !textElement) continue;
      const barStart = Number(bar.dataset.barStart);
      const barEnd = Number(bar.dataset.barEnd);
      const barAvailableWidth = Math.max(
        1,
        barEnd - barStart - LABEL_INNER_PADDING * 2,
      );
      const availableWidth = barAvailableWidth;
      const availableNameWidth = Math.max(
        1,
        availableWidth - LABEL_TEXT_PADDING,
      );
      const name = element.dataset.fullLabel ?? '';
      const shortLabel = element.dataset.shortLabel || undefined;
      const computedStyle = getComputedStyle(textElement);
      if (context) {
        context.font = computedStyle.font;
      }
      const nameWidth = context?.measureText(name).width ?? element.scrollWidth;
      const shortLabelWidth = shortLabel
        ? context?.measureText(shortLabel).width
        : undefined;
      const choice = chooseTimelineLabel({
        name,
        shortLabel,
        availableWidth: availableNameWidth,
        nameWidth,
        shortLabelWidth,
      });

      textElement.textContent = choice.label;
      element.dataset.labelVariant = choice.variant;
      element.style.maxWidth = `${availableWidth}px`;
      const chosenWidth =
        choice.variant === 'full'
          ? nameWidth
          : choice.variant === 'short'
            ? shortLabelWidth ?? nameWidth
            : Math.min(shortLabelWidth ?? nameWidth, availableNameWidth);
      const resolvedLabelWidth = Math.max(
        1,
        Math.min(chosenWidth + LABEL_TEXT_PADDING, availableWidth),
      );
      element.style.width = `${resolvedLabelWidth}px`;
      nextGeometries.push({
        element,
        textElement,
        barStart,
        barEnd,
        labelWidth: resolvedLabelWidth,
        maximumWidth: availableWidth,
        name,
        shortLabel,
        nameWidth,
        shortLabelWidth,
      });
    }

    labelGeometries.current = nextGeometries;
    scheduleTimelineLabelUpdate();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleTimelineLabelUpdate);
    observer?.observe(viewport);

    return () => {
      observer?.disconnect();
      labelGeometries.current = [];
      if (labelAnimationFrame.current !== null) {
        cancelAnimationFrame(labelAnimationFrame.current);
        labelAnimationFrame.current = null;
      }
    };
    // Geometry is rebuilt when the rendered mode, width, or lane layout changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    displayMode.end,
    displayMode.start,
    isCompactTimeline,
    isViewerMode,
    laneOffsets,
    mode.id,
    timelineWidth,
  ]);

  useLayoutEffect(() => {
    const viewport = scrollRef.current;
    if (isViewerMode) {
      viewport?.scrollTo({ left: 0, behavior: 'auto' });
    } else if (wasViewerMode.current) {
      viewport?.scrollTo({
        left: viewerScrollLeft.current,
        behavior: 'auto',
      });
      window.requestAnimationFrame(() => {
        viewerTriggerRef.current?.focus({ preventScroll: true });
        scheduleTimelineLabelUpdate();
      });
    }
    wasViewerMode.current = isViewerMode;
    // Viewer mode temporarily replaces native scrolling with a transformed canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewerMode]);

  const scrollToYear = (year: number, behavior: ScrollBehavior = 'smooth') => {
    const element = scrollRef.current;
    if (!element) return;
    const left = Math.max(
      0,
      yearToTimelineX(year, displayMode, timelineWidth) -
        element.clientWidth * 0.18,
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
    const nextModeDefinition = timelineModeById(nextMode);
    pendingJump.current = nextModeDefinition.focusYear;
    if (nextMode === modeId) {
      scrollToYear(nextModeDefinition.focusYear);
      return;
    }
    applyPurposeDefault(nextMode === 'survey' ? 'core' : 'standard');
    setModeId(nextMode);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (isViewerMode) return;
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
    if (isViewerMode) return;
    if (!drag.current.active || !scrollRef.current) return;
    scrollRef.current.scrollLeft =
      drag.current.scrollLeft - (event.clientX - drag.current.startX);
  };

  const onPointerUp = () => {
    drag.current.active = false;
  };

  const openViewer = () => {
    viewerScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    setIsViewerMode(true);
  };

  return (
    <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
      <div className="timeline-controls">
        <div className="timeline-era-control">
          <p className="timeline-control-caption">Era</p>
          <div
            className="timeline-era-options scroll-x"
            role="group"
            aria-label="表示モード"
          >
            {TIMELINE_MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectMode(item.id)}
                aria-current={item.id === mode.id ? 'true' : undefined}
                className="timeline-era-option"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {!isViewerMode && (
        <SemanticLodFab value={lod} onChange={setLod} counts={lodCounts} />
      )}

      <section
        className="timeline-status sticky top-[69px] z-30 mt-3 bg-paper/95 backdrop-blur sm:static sm:mt-4 sm:bg-transparent"
        aria-label="現在の表示範囲"
        data-timeline-status
      >
        <div className="flex min-h-11 items-center justify-between gap-4">
          <div aria-live="polite">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="timeline-status__title">{mode.label}</span>
              <span className="timeline-status__range">
                {fmtYear(displayMode.start)}〜
                {displayMode.end === TIMELINE_NOW ? '現在' : fmtYear(displayMode.end)}
              </span>
            </p>
          </div>
          <div className="timeline-status__actions">
            {mode.id !== 'survey' && (
              <button
                type="button"
                onClick={() => selectMode('survey')}
                className="timeline-back-link"
              >
                <span aria-hidden="true">←</span> 通史
              </button>
            )}
            <button
              ref={viewerTriggerRef}
              type="button"
              onClick={openViewer}
              className="timeline-viewer-toggle"
              aria-label="タイムラインを全画面で表示"
              aria-haspopup="dialog"
            >
              <span aria-hidden="true">⛶</span>
            </button>
          </div>
        </div>
      </section>

      <TimelineViewerFrame
        active={isViewerMode}
        contentHeight={chartHeight}
        contentOriginX={regionColumnWidth}
        contentOriginY={headerHeight}
        initialScrollLeft={viewerScrollLeft.current}
        timelineMode={displayMode}
        timelineWidth={timelineWidth}
        nodes={viewerNodes}
        regions={viewerRegions}
        lod={lod}
        lodCounts={lodCounts}
        onClose={() => setIsViewerMode(false)}
        onLodChange={setLod}
      >
      <div className="timeline-shell timeline-chart mt-3 flex overflow-hidden">
        <div
          className="timeline-region-column sticky left-0 z-20 w-20 shrink-0 sm:w-36"
          data-region-column
        >
          <div
            className="timeline-region-heading flex items-end px-2 pb-2 text-[10px]"
            style={{ height: headerHeight }}
          >
            地域
          </div>
          {mode.id === 'survey' && (
            <div
              className="timeline-region-label flex items-center px-2 text-xs"
              data-origin-band
              style={{ height: SURVEY_SUMMARY_H }}
            >
              背景・基盤
            </div>
          )}
          {laneLayouts.map((lane) => (
            <div
              key={lane.region}
              data-region-lane-label={lane.region}
              className="timeline-region-label flex items-center px-2 text-[11px] leading-snug sm:text-xs"
              style={
                {
                  height: lane.height,
                  '--timeline-region-rgb': timelineRegionRgb(lane.region),
                } as CSSProperties
              }
            >
              <span className="timeline-region-dot" aria-hidden="true" />
              <span>{REGION_LABELS[lane.region]}</span>
            </div>
          ))}
        </div>

        <div
          ref={scrollRef}
          data-timeline-scroll
          className="scroll-x relative min-w-0 flex-1 cursor-grab touch-pan-x select-none overscroll-x-contain active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onScroll={scheduleTimelineLabelUpdate}
          role="group"
          aria-label={`${mode.label}の横型タイムライン。横にスワイプまたはドラッグして移動できます`}
        >
          <div
            ref={trackRef}
            className="timeline-track relative"
            data-timeline-track
            data-timeline-mode={mode.id}
            data-timeline-lod={lod}
            data-lane-count={laneLayouts.length}
            data-scale-start={displayMode.start}
            data-scale-end={displayMode.end}
            data-scale-rounding={displayMode.tickStep}
            style={{ width: timelineWidth, height: chartHeight }}
          >
            <div
              className="timeline-axis absolute inset-x-0 top-0"
              style={{ height: headerHeight }}
            >
              {visibleEraBands.map((era) => {
                const left = yearToTimelineX(
                  Math.max(era.start, mode.start),
                  displayMode,
                  timelineWidth,
                );
                const right = yearToTimelineX(
                  Math.min(era.end, mode.end),
                  displayMode,
                  timelineWidth,
                );
                return (
                  <div
                    key={era.label}
                    className="timeline-era-band absolute top-0 overflow-hidden px-2 pt-1 text-[10px] font-medium"
                    style={{ left, width: Math.max(1, right - left), height: 28 }}
                  >
                    <span className="whitespace-nowrap">{era.label}</span>
                  </div>
                );
              })}
            </div>

            {ticks.map((tick, index) => {
              const isMajorTick =
                index === 0 ||
                index === ticks.length - 1 ||
                index % majorTickStride === 0;
              return (
                <div
                  key={tick}
                  data-timeline-tick={tick}
                  data-major-tick={isMajorTick || undefined}
                  className={`timeline-gridline absolute bottom-0 top-7 ${
                    isMajorTick ? 'timeline-gridline--major' : 'timeline-gridline--minor'
                  }`}
                  style={{
                    left: yearToTimelineX(tick, displayMode, timelineWidth),
                  }}
                  aria-hidden="true"
                >
                  <span
                    className={`timeline-tick-label absolute top-0 whitespace-nowrap px-1 text-[10px] tabular-nums ${
                      tick === displayMode.start
                        ? ''
                        : tick === displayMode.end
                          ? '-translate-x-full'
                          : '-translate-x-1/2'
                    }`}
                  >
                    {fmtYear(tick)}
                  </span>
                </div>
              );
            })}

            {mode.id === 'survey' && (
              <div
                className="timeline-origin-lane absolute inset-x-0"
                style={{ top: headerHeight, height: SURVEY_SUMMARY_H }}
              >
                {SURVEY_SUMMARIES.map((summary) => {
                  const left = yearToTimelineX(
                    summary.start,
                    displayMode,
                    timelineWidth,
                  );
                  const right = yearToTimelineX(
                    summary.end,
                    displayMode,
                    timelineWidth,
                  );
                  return (
                    <Link
                      key={summary.id}
                      href={`/movements/${summary.id}/`}
                      prefetch={false}
                      className="timeline-origin-rail absolute top-[5px] flex min-h-11 items-center overflow-hidden px-2 leading-tight text-ink active:translate-y-px"
                      style={{ left: left + 4, width: Math.max(72, right - left - 8) }}
                    >
                      <span className="block truncate text-[11px] font-medium">{summary.label}</span>
                      <span className="block shrink-0 text-[9px] tabular-nums text-muted">
                        {fmtYear(summary.start)}〜{fmtYear(summary.end)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {laneOffsets.map((lane) => (
              <div
                key={lane.region}
                data-timeline-lane={lane.region}
                className="timeline-lane absolute inset-x-0"
                style={{ top: lane.top, height: lane.height }}
              >
                {lane.items.map(
                  ({ movement, left, width, row, clippedStart, clippedEnd }) => {
                  const isPriority = mode.id !== 'survey' || SURVEY_PRIORITY.has(movement.id);
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
                      data-bar-start={left}
                      data-bar-end={left + width}
                      data-visual-width={width}
                      data-timeline-region={lane.region}
                      className="timeline-bar group absolute text-left text-[11px] leading-tight focus-visible:z-20 active:translate-y-px"
                      style={
                        {
                          left,
                          top: lanePaddingY + row * (barHeight + barGap),
                          width,
                          height: barHeight,
                          '--timeline-region-rgb': timelineRegionRgb(lane.region),
                        } as CSSProperties
                      }
                    >
                      <span
                        className="absolute left-1/2 top-1/2 h-11 min-w-11 -translate-x-1/2 -translate-y-1/2"
                        aria-hidden="true"
                        data-timeline-hit-area
                      />
                      <span
                        className={`timeline-bar-visual pointer-events-none absolute inset-x-0 top-1/2 overflow-hidden ${
                          isPriority
                            ? 'timeline-bar-visual--priority'
                            : 'timeline-bar-visual--secondary'
                        }`}
                        aria-hidden="true"
                        data-timeline-bar-visual
                      >
                        {clippedStart && (
                          <span className="absolute inset-y-0 left-0 z-10 flex w-3 items-center bg-gradient-to-r from-paper/90 to-transparent text-[10px]">
                            ‹
                          </span>
                        )}
                        <span
                          data-follow-label
                          data-full-label={movement.nameJa}
                          data-short-label={timelineJapaneseShortLabel(
                            movement.shortLabel,
                          )}
                          className="timeline-follow-label pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden px-px"
                        >
                          <span
                            data-label-text
                            className={
                              mode.id === 'survey'
                                ? 'timeline-label-survey block min-w-0 flex-1'
                                : 'timeline-label-detail min-w-0 flex-1'
                            }
                          >
                            {movement.nameJa}
                          </span>
                        </span>
                        {clippedEnd && (
                          <span className="absolute inset-y-0 right-0 z-10 flex w-3 items-center justify-end bg-gradient-to-l from-paper/90 to-transparent text-[10px]">
                            ›
                          </span>
                        )}
                      </span>
                      <span
                        data-label-date
                        aria-hidden="true"
                        className="timeline-label-date pointer-events-none absolute bottom-0 left-0 tabular-nums"
                      >
                        {fmtYear(movement.dates.start)}〜
                        {movement.dates.end === null
                          ? '現在'
                          : fmtYear(movement.dates.end)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      </TimelineViewerFrame>

      <p className="mt-2 text-xs text-faint">
        <span className="sm:hidden">横にスワイプして移動。タップで詳細</span>
        <span className="hidden sm:inline">
          横スクロール、または余白をドラッグして移動できます。ラベルをクリックすると詳細を開きます。
        </span>
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
