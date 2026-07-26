import type { RegionId } from '@/lib/schema';

/**
 * 横型タイムライン専用の地域色。
 *
 * 色は分類の主役ではなく、同じ地域の流れを追うための補助情報として使う。
 * 文字色には適用せず、ラベル枠・期間線・地域インデックスに限定する。
 */
export const TIMELINE_REGION_RGB = {
  mediterranean: '112 91 73',
  italy: '151 65 54',
  netherlands: '169 101 43',
  france: '64 103 137',
  germany: '47 111 108',
  britain: '73 116 76',
  spain: '157 119 44',
  america: '105 76 132',
  japan: '155 82 105',
  'east-asia': '139 72 66',
  'pan-european': '75 83 126',
  global: '72 82 91',
  other: '113 105 96',
} satisfies Record<RegionId, string>;

export const timelineRegionRgb = (region: RegionId) =>
  TIMELINE_REGION_RGB[region];
