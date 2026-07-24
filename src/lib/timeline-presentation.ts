import type { Movement } from '@/lib/schema';

export const TIMELINE_NOW = 2026;

export type TimelineModeId =
  | 'survey'
  | 'ancient'
  | 'medieval'
  | 'early-modern'
  | 'modern'
  | 'contemporary';

export type TimelineMode = {
  id: TimelineModeId;
  label: string;
  start: number;
  end: number;
  minWidth: number;
  maxWidth: number;
  tickStep: number;
  description: string;
};

export type TimelineEraBand = {
  label: string;
  start: number;
  end: number;
  mode: TimelineModeId;
  jumpYear: number;
};

export const TIMELINE_MODES: TimelineMode[] = [
  {
    id: 'survey',
    label: '通史',
    start: -40000,
    end: TIMELINE_NOW,
    minWidth: 1180,
    maxWidth: 1180,
    tickStep: 0,
    description: '全体の流れと同時代の重なりを、少ない横移動で俯瞰します。',
  },
  {
    id: 'ancient',
    label: '古代',
    start: -3000,
    end: 500,
    minWidth: 1000,
    maxWidth: 1200,
    tickStep: 250,
    description: '古代地中海世界と初期キリスト教美術を、詳細な年代目盛りで比較します。',
  },
  {
    id: 'medieval',
    label: '中世',
    start: 300,
    end: 1450,
    minWidth: 1200,
    maxWidth: 1500,
    tickStep: 100,
    description: 'ビザンティンからゴシック、初期ルネサンスへの連続と転換を比較します。',
  },
  {
    id: 'early-modern',
    label: '近世',
    start: 1400,
    end: 1800,
    minWidth: 1600,
    maxWidth: 2000,
    tickStep: 25,
    description: 'ルネサンスからバロック、ロココまでの地域差と重なりを比較します。',
  },
  {
    id: 'modern',
    label: '近代',
    start: 1750,
    end: 1950,
    minWidth: 1800,
    maxWidth: 2400,
    tickStep: 10,
    description: '古典の再編からモダニズム成立までを、読めるラベル幅で比較します。',
  },
  {
    id: 'contemporary',
    label: '現代',
    start: 1900,
    end: TIMELINE_NOW,
    minWidth: 1800,
    maxWidth: 2400,
    tickStep: 10,
    description: 'モダニズム、戦後美術、現代美術の並行する動きを比較します。',
  },
];

export const TIMELINE_ERA_BANDS: TimelineEraBand[] = [
  { label: '先史', start: -40000, end: -3000, mode: 'survey', jumpYear: -40000 },
  { label: '古代', start: -3000, end: 500, mode: 'ancient', jumpYear: -480 },
  { label: '中世', start: 500, end: 1400, mode: 'medieval', jumpYear: 700 },
  { label: 'ルネサンス', start: 1400, end: 1600, mode: 'early-modern', jumpYear: 1400 },
  { label: '近世', start: 1600, end: 1750, mode: 'early-modern', jumpYear: 1600 },
  { label: '19世紀', start: 1750, end: 1900, mode: 'modern', jumpYear: 1800 },
  { label: '20世紀', start: 1900, end: 2000, mode: 'contemporary', jumpYear: 1900 },
  { label: '現代', start: 2000, end: TIMELINE_NOW, mode: 'contemporary', jumpYear: 2000 },
];

const SURVEY_SEGMENTS = [
  { start: -40000, end: -3000, weight: 0.1 },
  { start: -3000, end: 500, weight: 0.1 },
  { start: 500, end: 1400, weight: 0.12 },
  { start: 1400, end: 1600, weight: 0.14 },
  { start: 1600, end: 1750, weight: 0.11 },
  { start: 1750, end: 1900, weight: 0.15 },
  { start: 1900, end: 1950, weight: 0.12 },
  { start: 1950, end: TIMELINE_NOW, weight: 0.16 },
] as const;

export const SURVEY_TICKS = [
  -40000,
  -3000,
  500,
  1400,
  1600,
  1750,
  1900,
  1950,
  2000,
  TIMELINE_NOW,
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function timelineModeById(id: TimelineModeId) {
  return TIMELINE_MODES.find((mode) => mode.id === id) ?? TIMELINE_MODES[0];
}

export function movementOverlapsMode(movement: Movement, mode: TimelineMode) {
  const end = movement.dates.end ?? TIMELINE_NOW;
  return movement.dates.start < mode.end && end > mode.start;
}

export function timelineWidthForMode(mode: TimelineMode, movementCount: number) {
  if (mode.id === 'survey') return mode.minWidth;
  return clamp(mode.minWidth + Math.max(0, movementCount - 2) * 50, mode.minWidth, mode.maxWidth);
}

export function yearToTimelineX(year: number, mode: TimelineMode, width: number) {
  const clampedYear = clamp(year, mode.start, mode.end);
  if (mode.id !== 'survey') {
    return ((clampedYear - mode.start) / (mode.end - mode.start)) * width;
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
  return progress * width;
}

export function timelineTicks(mode: TimelineMode) {
  if (mode.id === 'survey') return SURVEY_TICKS;

  const ticks: number[] = [];
  const first = Math.ceil(mode.start / mode.tickStep) * mode.tickStep;
  for (let year = first; year <= mode.end; year += mode.tickStep) ticks.push(year);
  if (ticks.at(-1) !== mode.end) ticks.push(mode.end);
  return ticks;
}

export function clipMovementToMode(movement: Movement, mode: TimelineMode) {
  const actualEnd = movement.dates.end ?? TIMELINE_NOW;
  return {
    start: Math.max(movement.dates.start, mode.start),
    end: Math.min(actualEnd, mode.end),
    clippedStart: movement.dates.start < mode.start,
    clippedEnd: actualEnd > mode.end,
  };
}

export function timelineBarMinimumWidth(mode: TimelineMode) {
  return mode.id === 'survey' ? 64 : 136;
}
