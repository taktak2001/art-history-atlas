import type { Movement } from '@/lib/schema';

export const TIMELINE_NOW = 2026;
export const ERA_DOMAIN_PADDING_RATIO = 0.125;
export const ERA_DOMAIN_MIN_SPAN = 200;

export type TimelineModeId =
  | 'survey'
  | 'prehistoric'
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
  mobileMinWidth: number;
  mobileMaxWidth: number;
  tickStep: number;
  focusYear: number;
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
    mobileMinWidth: 760,
    mobileMaxWidth: 760,
    tickStep: 0,
    focusYear: -40000,
    description: '全体の流れと同時代の重なりを、少ない横移動で俯瞰します。',
  },
  {
    id: 'prehistoric',
    label: '先史',
    start: -40000,
    end: -3000,
    minWidth: 1000,
    maxWidth: 1200,
    mobileMinWidth: 720,
    mobileMaxWidth: 800,
    tickStep: 5000,
    focusYear: -40000,
    description: '先史美術の長い時間幅を、実年代に基づく線形軸で確認します。',
  },
  {
    id: 'ancient',
    label: '古代',
    start: -3000,
    end: 500,
    minWidth: 1000,
    maxWidth: 1200,
    mobileMinWidth: 740,
    mobileMaxWidth: 800,
    tickStep: 250,
    focusYear: -480,
    description: '古代地中海世界と初期キリスト教美術を、詳細な年代目盛りで比較します。',
  },
  {
    id: 'medieval',
    label: '中世',
    start: 300,
    end: 1450,
    minWidth: 1200,
    maxWidth: 1500,
    mobileMinWidth: 820,
    mobileMaxWidth: 900,
    tickStep: 100,
    focusYear: 330,
    description: 'ビザンティンからゴシック、初期ルネサンスへの連続と転換を比較します。',
  },
  {
    id: 'early-modern',
    label: '近世',
    start: 1400,
    end: 1800,
    minWidth: 1600,
    maxWidth: 2000,
    mobileMinWidth: 920,
    mobileMaxWidth: 1000,
    tickStep: 25,
    focusYear: 1400,
    description: 'ルネサンスからバロック、ロココまでの地域差と重なりを比較します。',
  },
  {
    id: 'modern',
    label: '近代',
    start: 1750,
    end: 1950,
    minWidth: 1800,
    maxWidth: 2400,
    mobileMinWidth: 1000,
    mobileMaxWidth: 1100,
    tickStep: 10,
    focusYear: 1750,
    description: '古典の再編からモダニズム成立までを、読めるラベル幅で比較します。',
  },
  {
    id: 'contemporary',
    label: '現代',
    start: 1900,
    end: TIMELINE_NOW,
    minWidth: 1800,
    maxWidth: 2400,
    mobileMinWidth: 1100,
    mobileMaxWidth: 1200,
    tickStep: 10,
    focusYear: 1900,
    description: 'モダニズム、戦後美術、現代美術の並行する動きを比較します。',
  },
];

export const TIMELINE_ERA_BANDS: TimelineEraBand[] = [
  { label: '先史', start: -40000, end: -3000, mode: 'prehistoric', jumpYear: -40000 },
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

export function formatTimelineYearLabel(
  year: number,
  zeroLabel: '紀元境界' | '0' = '紀元境界',
) {
  if (year === 0) return zeroLabel;
  if (year > 0) return `${year}`;

  const absoluteYear = Math.abs(year);
  if (absoluteYear >= 10000) {
    const tenThousands = Number((absoluteYear / 10000).toFixed(1));
    return `前${tenThousands}万`;
  }
  return `前${absoluteYear}`;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function timelineModeById(id: TimelineModeId) {
  return TIMELINE_MODES.find((mode) => mode.id === id) ?? TIMELINE_MODES[0];
}

export function movementOverlapsMode(movement: Movement, mode: TimelineMode) {
  const end = movement.dates.end ?? TIMELINE_NOW;
  return movement.dates.start < mode.end && end > mode.start;
}

function eraDomainRoundingStep(span: number) {
  if (span <= 800) return 100;
  if (span <= 2000) return 250;
  return 500;
}

/**
 * 時代区分は表示対象の抽出境界として維持し、描画軸だけを実データへ寄せる。
 * 境界をまたぐムーブメントは時代区分との交差部分を使うため、隣の時代まで
 * 不必要に拡大せず、端のバーには十分な余白を確保できる。
 */
export function fitTimelineModeToMovements(
  mode: TimelineMode,
  movements: Movement[],
) {
  if (mode.id === 'survey' || movements.length === 0) return mode;

  const extents = movements.map((movement) => clipMovementToMode(movement, mode));
  const minimumStart = Math.min(...extents.map((extent) => extent.start));
  const maximumEnd = Math.max(...extents.map((extent) => extent.end));
  const dataSpan = Math.max(1, maximumEnd - minimumStart);
  const paddedSpan = Math.max(
    ERA_DOMAIN_MIN_SPAN,
    dataSpan * (1 + ERA_DOMAIN_PADDING_RATIO * 2),
  );
  const center = (minimumStart + maximumEnd) / 2;
  const roundingStep = eraDomainRoundingStep(paddedSpan);
  const start =
    Math.floor((center - paddedSpan / 2) / roundingStep) * roundingStep;
  const end =
    Math.ceil((center + paddedSpan / 2) / roundingStep) * roundingStep;

  return {
    ...mode,
    start,
    end,
    tickStep: roundingStep,
    focusYear: clamp(mode.focusYear, start, end),
  };
}

export function timelineWidthForMode(
  mode: TimelineMode,
  movementCount: number,
  compact = false,
) {
  const minWidth = compact ? mode.mobileMinWidth : mode.minWidth;
  const maxWidth = compact ? mode.mobileMaxWidth : mode.maxWidth;
  if (mode.id === 'survey') return minWidth;
  const densityStep = compact ? 24 : 50;
  return clamp(
    minWidth + Math.max(0, movementCount - 2) * densityStep,
    minWidth,
    maxWidth,
  );
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

const niceMultiplier = (minimum: number) => {
  for (const multiplier of [1, 2, 4, 5, 10, 20, 50, 100]) {
    if (multiplier >= minimum) return multiplier;
  }
  return Math.ceil(minimum / 100) * 100;
};

export function timelineTicks(mode: TimelineMode, width?: number) {
  if (mode.id === 'survey') return SURVEY_TICKS;

  const span = mode.end - mode.start;
  const maximumTickCount = width
    ? Math.max(2, Math.floor(width / 72))
    : Number.POSITIVE_INFINITY;
  const rawTickCount = span / mode.tickStep;
  const multiplier = niceMultiplier(rawTickCount / maximumTickCount);
  const visibleTickStep = mode.tickStep * multiplier;
  const ticks: number[] = [];
  const first = Math.ceil(mode.start / visibleTickStep) * visibleTickStep;
  for (let year = first; year <= mode.end; year += visibleTickStep) {
    ticks.push(year);
  }
  if (ticks[0] !== mode.start) ticks.unshift(mode.start);
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

export function timelineBarVisualWidth(startX: number, endX: number) {
  return Math.max(1, endX - startX);
}

type FollowLabelInput = {
  barStart: number;
  barEnd: number;
  labelWidth: number;
  viewportLeft: number;
  viewportRight: number;
  innerPadding?: number;
  minimumTravel?: number;
};

export type FollowLabelResult = {
  x: number;
  followsViewport: boolean;
};

export function calculateFollowLabelX({
  barStart,
  barEnd,
  labelWidth,
  viewportLeft,
  viewportRight,
  innerPadding = 8,
  minimumTravel = 24,
}: FollowLabelInput): FollowLabelResult {
  const minimumX = barStart + innerPadding;
  const maximumX = Math.max(minimumX, barEnd - labelWidth - innerPadding);
  const barWidth = Math.max(0, barEnd - barStart);
  const intersectsViewport = barEnd > viewportLeft && barStart < viewportRight;
  const fullyVisible = barStart >= viewportLeft && barEnd <= viewportRight;
  const hasRoomToFollow =
    barWidth >= labelWidth + innerPadding * 2 + minimumTravel;
  const followsViewport = intersectsViewport && !fullyVisible && hasRoomToFollow;

  return {
    x: followsViewport
      ? clamp(viewportLeft + innerPadding, minimumX, maximumX)
      : minimumX,
    followsViewport,
  };
}

type TimelineLabelChoiceInput = {
  name: string;
  shortLabel?: string;
  availableWidth: number;
  nameWidth: number;
  shortLabelWidth?: number;
};

export type TimelineLabelChoice = {
  label: string;
  variant: 'full' | 'short' | 'ellipsis';
};

export function timelineJapaneseShortLabel(shortLabel?: string) {
  if (!shortLabel) return undefined;
  return /[\u3040-\u30ff\u3400-\u9fff]/u.test(shortLabel)
    ? shortLabel
    : undefined;
}

export function chooseTimelineLabel({
  name,
  shortLabel,
  availableWidth,
  nameWidth,
  shortLabelWidth,
}: TimelineLabelChoiceInput): TimelineLabelChoice {
  const japaneseShortLabel = timelineJapaneseShortLabel(shortLabel);
  if (nameWidth <= availableWidth) {
    return { label: name, variant: 'full' };
  }
  if (
    japaneseShortLabel &&
    (shortLabelWidth ?? Number.POSITIVE_INFINITY) <= availableWidth
  ) {
    return { label: japaneseShortLabel, variant: 'short' };
  }
  return {
    label: japaneseShortLabel ?? name,
    variant: 'ellipsis',
  };
}
