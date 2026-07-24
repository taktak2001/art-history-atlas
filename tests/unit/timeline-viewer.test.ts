import { describe, expect, it } from 'vitest';
import {
  clampTimelineViewerScale,
  fitTimelineViewer,
  panTimelineViewer,
  TIMELINE_VIEWER_MAX_SCALE,
  TIMELINE_VIEWER_MIN_SCALE,
  viewerLabelVariant,
  zoomTimelineAtPoint,
} from '@/lib/timeline-viewer';

describe('timeline viewer geometry', () => {
  it('拡大率を操作範囲へ収める', () => {
    expect(clampTimelineViewerScale(0.1)).toBe(TIMELINE_VIEWER_MIN_SCALE);
    expect(clampTimelineViewerScale(8)).toBe(TIMELINE_VIEWER_MAX_SCALE);
    expect(clampTimelineViewerScale(1.75)).toBe(1.75);
  });

  it('指の中点にある年代位置を保って拡大する', () => {
    const before = { x: -200, y: 40, scale: 1 };
    const center = { x: 180, y: 320 };
    const contentPoint = {
      x: (center.x - before.x) / before.scale,
      y: (center.y - before.y) / before.scale,
    };
    const after = zoomTimelineAtPoint(before, 2, center);

    expect(after).toEqual({ x: -580, y: -240, scale: 2 });
    expect(after.x + contentPoint.x * after.scale).toBe(center.x);
    expect(after.y + contentPoint.y * after.scale).toBe(center.y);
  });

  it('パン量を現在座標へ加算する', () => {
    expect(
      panTimelineViewer(
        { x: -120, y: 80, scale: 1.25 },
        { x: 36, y: -24 },
      ),
    ).toEqual({ x: -84, y: 56, scale: 1.25 });
  });

  it('現在モードの全レーンをviewportへ収める', () => {
    const fitted = fitTimelineViewer(
      { width: 1180, height: 620 },
      { width: 1440, height: 900 },
    );

    expect(fitted.scale).toBe(1);
    expect(fitted.x).toBe(130);
    expect(fitted.y).toBeGreaterThanOrEqual(72);
  });

  it('狭いviewportでは全体表示用の縮尺を再計算する', () => {
    const portrait = fitTimelineViewer(
      { width: 840, height: 620 },
      { width: 390, height: 844 },
    );
    const landscape = fitTimelineViewer(
      { width: 840, height: 620 },
      { width: 844, height: 390 },
    );

    expect(portrait.scale).toBeLessThan(TIMELINE_VIEWER_MIN_SCALE);
    expect(landscape.scale).not.toBe(portrait.scale);
    expect(portrait.x).toBeGreaterThanOrEqual(0);
  });

  it('縮小時は短縮名、拡大時は正式名称を選ぶ', () => {
    expect(viewerLabelVariant(0.8, true)).toBe('short');
    expect(viewerLabelVariant(1.1, true)).toBe('full');
    expect(viewerLabelVariant(0.6, false)).toBe('full');
  });
});
