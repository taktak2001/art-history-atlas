import { describe, expect, it } from 'vitest';
import {
  assignTimelineViewerTracks,
  clampTimelineViewerScale,
  fitTimelineViewer,
  fitTimelineViewerRect,
  panTimelineViewer,
  semanticTimelineTicks,
  timelineViewerMaxScale,
  timelineViewerRegionHeight,
  timelineViewerSemanticLevel,
  timelineViewerTrackCenter,
  TIMELINE_VIEWER_MAX_SCALE,
  TIMELINE_VIEWER_MOBILE_MAX_SCALE,
  TIMELINE_VIEWER_MIN_SCALE,
  viewerLabelVariant,
  worldToTimelineViewerScreen,
  zoomTimelineAtPoint,
} from '@/lib/timeline-viewer';
import { timelineModeById } from '@/lib/timeline-presentation';

describe('timeline viewer geometry', () => {
  it('拡大率を操作範囲へ収める', () => {
    expect(clampTimelineViewerScale(0.1)).toBe(TIMELINE_VIEWER_MIN_SCALE);
    expect(clampTimelineViewerScale(8)).toBe(TIMELINE_VIEWER_MAX_SCALE);
    expect(clampTimelineViewerScale(1.75)).toBe(1.75);
  });

  it('モバイルとPCで異なる最大倍率を使う', () => {
    expect(timelineViewerMaxScale(390)).toBe(
      TIMELINE_VIEWER_MOBILE_MAX_SCALE,
    );
    expect(timelineViewerMaxScale(1440)).toBe(TIMELINE_VIEWER_MAX_SCALE);
    expect(clampTimelineViewerScale(4, timelineViewerMaxScale(390))).toBe(3);
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

  it('年代座標を画面座標へ変換してもUI寸法を含めない', () => {
    expect(
      worldToTimelineViewerScreen(
        { x: 120, y: 80 },
        { x: -40, y: 20, scale: 2 },
      ),
    ).toEqual({ x: 200, y: 180 });
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

  it('固定軸と操作領域を除いた矩形へ全体を収める', () => {
    const fitted = fitTimelineViewerRect(
      { x: 144, y: 96, width: 1000, height: 540 },
      { width: 390, height: 844 },
      { top: 52, right: 0, bottom: 68, left: 112 },
    );

    expect(fitted.x + 144 * fitted.scale).toBeGreaterThanOrEqual(112);
    expect(fitted.y + 96 * fitted.scale).toBeGreaterThanOrEqual(52);
    expect(fitted.scale).toBeLessThan(1);
  });

  it('倍率を4段階のセマンティック表示へ対応させる', () => {
    expect(timelineViewerSemanticLevel(0.8)).toBe('overview');
    expect(timelineViewerSemanticLevel(1)).toBe('overview');
    expect(timelineViewerSemanticLevel(1.24)).toBe('overview');
    expect(timelineViewerSemanticLevel(1.25)).toBe('standard');
    expect(timelineViewerSemanticLevel(1.99)).toBe('standard');
    expect(timelineViewerSemanticLevel(2)).toBe('contextual');
    expect(timelineViewerSemanticLevel(3)).toBe('detailed');
  });

  it('拡大すると年代目盛りを細分化する', () => {
    const mode = timelineModeById('modern');
    const overview = semanticTimelineTicks(mode, 1000, 0.6);
    const detailed = semanticTimelineTicks(mode, 1000, 3);

    expect(detailed.length).toBeGreaterThan(overview.length);
    expect(overview[0]).toBe(mode.start);
    expect(detailed.at(-1)).toBe(mode.end);
  });

  it('縮小時は短縮名、拡大時は正式名称を選ぶ', () => {
    expect(viewerLabelVariant(0.8, true)).toBe('short');
    expect(viewerLabelVariant(1.1, true)).toBe('short');
    expect(viewerLabelVariant(1.25, true)).toBe('full');
    expect(viewerLabelVariant(0.6, false)).toBe('full');
  });

  it('同一地域で横方向に衝突するラベルを縦トラックへ積む', () => {
    const placements = assignTimelineViewerTracks([
      { key: 'impressionism', regionId: 'france', x: 100, width: 152 },
      { key: 'symbolism', regionId: 'france', x: 160, width: 152 },
      {
        key: 'post-impressionism',
        regionId: 'france',
        x: 230,
        width: 152,
      },
      { key: 'romanticism', regionId: 'germany', x: 160, width: 152 },
    ]);

    expect(placements.map(({ key, track }) => [key, track])).toEqual([
      ['impressionism', 0],
      ['symbolism', 1],
      ['post-impressionism', 2],
      ['romanticism', 0],
    ]);
  });

  it('十分な横間隔があるラベルは同じトラックへ置く', () => {
    const placements = assignTimelineViewerTracks([
      { key: 'a', regionId: 'france', x: 100, width: 100 },
      { key: 'b', regionId: 'france', x: 210, width: 100 },
    ]);

    expect(placements.map(({ track }) => track)).toEqual([0, 0]);
  });

  it('5段目以降を集約対象として返す', () => {
    const placements = assignTimelineViewerTracks(
      Array.from({ length: 5 }, (_, index) => ({
        key: `movement-${index}`,
        regionId: 'france',
        x: 100,
        width: 152,
      })),
    );

    expect(placements.map(({ track }) => track)).toEqual([0, 1, 2, 3, null]);
  });

  it('トラック数に応じて地域高と中心位置を調整する', () => {
    expect(timelineViewerRegionHeight(1)).toBe(64);
    expect(timelineViewerRegionHeight(2)).toBe(96);
    expect(timelineViewerRegionHeight(3)).toBe(128);
    expect(timelineViewerRegionHeight(4)).toBe(160);
    expect(timelineViewerTrackCenter(0, 1)).toBe(32);
    expect(timelineViewerTrackCenter(0, 3)).toBe(26);
    expect(timelineViewerTrackCenter(2, 3)).toBe(102);
  });
});
