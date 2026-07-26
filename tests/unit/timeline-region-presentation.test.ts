import { describe, expect, it } from 'vitest';
import { RegionId } from '@/lib/schema';
import {
  TIMELINE_REGION_RGB,
  timelineRegionRgb,
} from '@/lib/timeline-region-presentation';

describe('timeline region presentation', () => {
  it('全地域へタイムライン色を割り当てる', () => {
    expect(Object.keys(TIMELINE_REGION_RGB).sort()).toEqual(
      [...RegionId.options].sort(),
    );
  });

  it('地域ごとに一貫した色を返す', () => {
    expect(timelineRegionRgb('italy')).toBe(TIMELINE_REGION_RGB.italy);
    expect(timelineRegionRgb('france')).toBe(TIMELINE_REGION_RGB.france);
    expect(timelineRegionRgb('italy')).not.toBe(timelineRegionRgb('france'));
  });
});
