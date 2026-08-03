import { describe, expect, it } from 'vitest';
import {
  assignTimelineViewerTracks,
  clampTimelineViewerScale,
  constrainTimelineViewerVerticalPan,
  fitTimelineViewer,
  fitTimelineViewerRect,
  layoutTimelineViewerDateCaptions,
  layoutTimelineViewerPeriodRails,
  panTimelineViewer,
  relativeTimelineViewerCompositeTransform,
  selectTimelineViewerTickLabels,
  semanticTimelineTicks,
  snapTimelineViewerPixel,
  timelineViewerContentViewportAnchor,
  timelineViewerMaxScale,
  timelineViewerRegionAnchorAt,
  timelineViewerRegionHeight,
  timelineViewerRightGutter,
  timelineViewerSemanticLevel,
  timelineViewerScrollAfterScale,
  timelineViewerScrollTopForRegionAnchor,
  timelineViewerTickPriority,
  timelineViewerTrackCenter,
  timelineViewerVirtualNodeKeys,
  TIMELINE_VIEWER_MAX_SCALE,
  TIMELINE_VIEWER_MOBILE_MAX_SCALE,
  TIMELINE_VIEWER_MIN_SCALE,
  viewerLabelVariant,
  worldToTimelineViewerScreen,
  zoomTimelineAtPoint,
} from '@/lib/timeline-viewer';
import {
  formatTimelineYearLabel,
  timelineXToYear,
  timelineModeById,
  yearToTimelineX,
} from '@/lib/timeline-presentation';

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

  it('native scrollでもviewport中央の年代位置を保って拡大する', () => {
    const beforeScrollLeft = 420;
    const anchorX = 195;
    const axisInset = 102;
    const contentPoint =
      (beforeScrollLeft + anchorX - axisInset) / 1;
    const afterScrollLeft = timelineViewerScrollAfterScale({
      scrollLeft: beforeScrollLeft,
      anchorX,
      axisInset,
      currentScale: 1,
      nextScale: 2,
    });

    expect(afterScrollLeft).toBe(933);
    expect(
      (afterScrollLeft + anchorX - axisInset) / 2,
    ).toBe(contentPoint);
  });

  it('native zoom後のscrollLeftを実寸worldの範囲へ収める', () => {
    expect(
      timelineViewerScrollAfterScale({
        scrollLeft: 1200,
        anchorX: 195,
        axisInset: 102,
        currentScale: 1,
        nextScale: 3,
        maximumScrollLeft: 1600,
      }),
    ).toBe(1600);
    expect(
      timelineViewerScrollAfterScale({
        scrollLeft: 0,
        anchorX: 195,
        axisInset: 102,
        currentScale: 2,
        nextScale: 0.6,
      }),
    ).toBe(0);
  });

  it('固定軸と操作帯を除いた表示領域の中央を返す', () => {
    expect(
      timelineViewerContentViewportAnchor(
        { width: 1440, height: 900 },
        { top: 52, right: 0, bottom: 90, left: 144 },
      ),
    ).toEqual({ x: 792, y: 431 });
  });

  it('地域IDとレーン内比率から異なる高さの縦アンカーを復元する', () => {
    const anchor = timelineViewerRegionAnchorAt(
      [
        { id: 'america', top: 0, height: 120 },
        { id: 'japan', top: 120, height: 100 },
        { id: 'east-asia', top: 220, height: 80 },
      ],
      195,
    );
    expect(anchor).toEqual({ regionId: 'japan', ratio: 0.75 });
    expect(
      timelineViewerScrollTopForRegionAnchor({
        anchor: anchor!,
        regions: [
          { id: 'america', top: 0, height: 180 },
          { id: 'japan', top: 180, height: 200 },
          { id: 'east-asia', top: 380, height: 120 },
        ],
        anchorY: 200,
        axisInset: 52,
      }),
    ).toBe(182); // 52 + (180 + 150) - 200.
  });

  it('地域アンカーの復元位置を上下端へ収める', () => {
    expect(
      timelineViewerScrollTopForRegionAnchor({
        anchor: { regionId: 'japan', ratio: 1 },
        regions: [{ id: 'japan', top: 700, height: 200 }],
        anchorY: 300,
        axisInset: 52,
        maximumScrollTop: 500,
      }),
    ).toBe(500);
  });

  it('通史の非線形座標を年代へ戻して連続ズームの基準にできる', () => {
    const survey = timelineModeById('survey');
    for (const year of [-40000, -3000, 0, 1400, 1900, 2026]) {
      const x = yearToTimelineX(year, survey, 1180);
      expect(timelineXToYear(x, survey, 1180)).toBeCloseTo(year, 5);
    }
  });

  it('ラベルと罫線の座標をdevice pixelへ揃える', () => {
    expect(snapTimelineViewerPixel(10.26, 2)).toBe(10.5);
    expect(snapTimelineViewerPixel(10.24, 2)).toBe(10);
    expect(snapTimelineViewerPixel(10.6, Number.NaN)).toBe(11);
  });

  it('接する別ムーブメントの期間線へ10pxの切れ目を作る', () => {
    const layouts = layoutTimelineViewerPeriodRails([
      {
        key: 'yamato-e',
        regionId: 'japan',
        track: 0,
        start: 100,
        end: 300,
      },
      {
        key: 'rinpa',
        regionId: 'japan',
        track: 0,
        start: 300,
        end: 420,
      },
    ]);
    const yamato = layouts.find(({ key }) => key === 'yamato-e')!;
    const rinpa = layouts.find(({ key }) => key === 'rinpa')!;

    expect(rinpa.left - (yamato.left + yamato.width)).toBe(10);
    expect(yamato.offsetY).toBe(0);
    expect(rinpa.offsetY).toBe(0);
  });

  it('実年代が重なる期間線は長さを変えず5pxずらす', () => {
    const layouts = layoutTimelineViewerPeriodRails([
      {
        key: 'islamic-art',
        regionId: 'spain',
        track: 0,
        start: 60,
        end: 300,
      },
      {
        key: 'baroque',
        regionId: 'spain',
        track: 0,
        start: 240,
        end: 280,
      },
    ]);
    const islamic = layouts.find(({ key }) => key === 'islamic-art')!;
    const baroque = layouts.find(({ key }) => key === 'baroque')!;

    expect(islamic).toMatchObject({ left: 60, width: 240, offsetY: 0 });
    expect(baroque).toMatchObject({ left: 240, width: 40, offsetY: 5 });
  });

  it('期間線から十分離れた年代キャプションは通常位置を維持する', () => {
    const [layout] = layoutTimelineViewerDateCaptions(
      [
        {
          key: 'symbolism',
          regionId: 'france',
          track: 0,
          left: 120,
          top: 44,
          width: 64,
          height: 11,
          laneBottom: 88,
        },
      ],
      [
        {
          key: 'symbolism',
          regionId: 'france',
          track: 0,
          left: 100,
          top: 37,
          width: 120,
          height: 2,
        },
      ],
    );

    expect(layout).toEqual({ key: 'symbolism', offsetY: 0 });
  });

  it('年代キャプションと期間線が衝突する項目だけ5px下へ逃がす', () => {
    const layouts = layoutTimelineViewerDateCaptions(
      [
        {
          key: 'symbolism',
          regionId: 'france',
          track: 0,
          left: 120,
          top: 44,
          width: 64,
          height: 11,
          laneBottom: 88,
        },
        {
          key: 'unrelated',
          regionId: 'italy',
          track: 0,
          left: 120,
          top: 44,
          width: 64,
          height: 11,
          laneBottom: 88,
        },
      ],
      [
        {
          key: 'fauvism',
          regionId: 'france',
          track: 1,
          left: 100,
          top: 42,
          width: 120,
          height: 2,
        },
      ],
    );

    expect(layouts).toEqual([
      { key: 'symbolism', offsetY: 5 },
      { key: 'unrelated', offsetY: 0 },
    ]);
  });

  it('高倍率で複数の近接線がある年代キャプションは最大12pxまで段階補正する', () => {
    const [layout] = layoutTimelineViewerDateCaptions(
      [
        {
          key: 'fauvism',
          regionId: 'france',
          track: 2,
          left: 4020,
          top: 44,
          width: 72,
          height: 11,
          laneBottom: 88,
        },
      ],
      [
        {
          key: 'symbolism',
          regionId: 'france',
          track: 1,
          left: 4000,
          top: 42,
          width: 180,
          height: 2,
        },
        {
          key: 'fauvism',
          regionId: 'france',
          track: 2,
          left: 4010,
          top: 47,
          width: 160,
          height: 2,
        },
      ],
    );

    expect(layout).toEqual({ key: 'fauvism', offsetY: 12 });
  });

  it('年代キャプションの補正を地域レーン下端で収める', () => {
    const [layout] = layoutTimelineViewerDateCaptions(
      [
        {
          key: 'origin',
          regionId: 'origin',
          track: 0,
          left: 120,
          top: 44,
          width: 64,
          height: 11,
          laneBottom: 60,
        },
      ],
      [
        {
          key: 'origin-rail',
          regionId: 'origin',
          track: 0,
          left: 100,
          top: 42,
          width: 120,
          height: 2,
        },
      ],
    );

    expect(layout).toEqual({ key: 'origin', offsetY: 3 });
  });

  it('終端にviewport別の固定gutterを確保する', () => {
    expect(timelineViewerRightGutter(390)).toBe(160);
    expect(timelineViewerRightGutter(1440)).toBe(192);
  });

  it('パン量を現在座標へ加算する', () => {
    expect(
      panTimelineViewer(
        { x: -120, y: 80, scale: 1.25 },
        { x: 36, y: -24 },
      ),
    ).toEqual({ x: -84, y: 56, scale: 1.25 });
  });

  it('操作中のscreen差分を単一のcompositor transformへ変換する', () => {
    expect(
      relativeTimelineViewerCompositeTransform(
        { x: -200, y: -40, scale: 1 },
        { x: -420, y: -92, scale: 2 },
      ),
    ).toEqual({ x: -20, y: -52, scaleX: 2 });
  });

  it('表示領域の前後1画面だけを仮想描画対象にする', () => {
    const nodes = [
      { key: 'far-left', barStart: -2400, barEnd: -2200 },
      { key: 'left-buffer', barStart: -800, barEnd: -700 },
      { key: 'visible', barStart: 200, barEnd: 300 },
      { key: 'right-buffer', barStart: 1200, barEnd: 1300 },
      { key: 'far-right', barStart: 2600, barEnd: 2800 },
    ];

    expect(
      timelineViewerVirtualNodeKeys(
        nodes,
        { x: 0, y: 0, scale: 1 },
        0,
        100,
        1100,
        1000,
      ),
    ).toEqual(['left-buffer', 'visible', 'right-buffer']);
  });

  it('短い展示年表は上端へ揃えて無限余白を作らない', () => {
    expect(
      constrainTimelineViewerVerticalPan(
        { x: -84, y: 480, scale: 1.25 },
        80,
        360,
        844,
        50,
        62,
      ),
    ).toEqual({ x: -84, y: -18, scale: 1.25 });
  });

  it('長い展示年表の縦パンを上下の終端内へ制限する', () => {
    const top = constrainTimelineViewerVerticalPan(
      { x: 0, y: 800, scale: 1 },
      80,
      1200,
      844,
      50,
      62,
    );
    const bottom = constrainTimelineViewerVerticalPan(
      { x: 0, y: -1600, scale: 1 },
      80,
      1200,
      844,
      50,
      62,
    );

    expect(top.y).toBe(-18);
    expect(bottom.y).toBe(-510);
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

  it('紀元前年代を軸用の短い表記へ統一する', () => {
    expect(formatTimelineYearLabel(-40000)).toBe('前4万');
    expect(formatTimelineYearLabel(-3000)).toBe('前3000');
    expect(formatTimelineYearLabel(-500)).toBe('前500');
    expect(formatTimelineYearLabel(0)).toBe('紀元境界');
    expect(formatTimelineYearLabel(0, '0')).toBe('0');
    expect(formatTimelineYearLabel(1400)).toBe('1400');
  });

  it('年代ラベルは重要tickを優先して画面上の重複を除く', () => {
    const mode = timelineModeById('survey');
    const visible = selectTimelineViewerTickLabels([
      {
        year: -40000,
        x: 110,
        width: 38,
        priority: timelineViewerTickPriority(-40000, mode),
      },
      {
        year: -3000,
        x: 148,
        width: 46,
        priority: timelineViewerTickPriority(-3000, mode),
      },
      {
        year: 0,
        x: 202,
        width: 12,
        priority: timelineViewerTickPriority(0, mode),
      },
      {
        year: 500,
        x: 236,
        width: 24,
        priority: timelineViewerTickPriority(500, mode),
      },
      {
        year: 1400,
        x: 302,
        width: 32,
        priority: timelineViewerTickPriority(1400, mode),
      },
    ]);

    expect(visible).toEqual([-40000, 0, 1400]);
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

  it('密集地域は5段まで使い、6段目以降を集約対象として返す', () => {
    const placements = assignTimelineViewerTracks(
      Array.from({ length: 6 }, (_, index) => ({
        key: `movement-${index}`,
        regionId: 'france',
        x: 100,
        width: 152,
      })),
    );

    expect(placements.map(({ track }) => track)).toEqual([
      0,
      1,
      2,
      3,
      4,
      null,
    ]);
  });

  it('トラック数に応じて地域高と中心位置を調整する', () => {
    expect(timelineViewerRegionHeight(1)).toBe(88);
    expect(timelineViewerRegionHeight(2)).toBe(152);
    expect(timelineViewerRegionHeight(3)).toBe(216);
    expect(timelineViewerRegionHeight(4)).toBe(280);
    expect(timelineViewerRegionHeight(5)).toBe(344);
    expect(timelineViewerTrackCenter(0, 1)).toBe(44);
    expect(timelineViewerTrackCenter(0, 3)).toBe(44);
    expect(timelineViewerTrackCenter(2, 3)).toBe(172);
  });
});
