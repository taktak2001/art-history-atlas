import { describe, it, expect } from 'vitest';
import {
  searchDocs,
  matrixCell,
  formatYear,
  formatDateRange,
  getMovement,
  movements,
  relationships,
} from '@/lib/dataset';
import {
  parseCompareIds,
  canCompare,
  compareMovements,
  compareRows,
  compareSections,
  COMPARE_ACCENTS,
  assignCompareAccents,
  MAX_COMPARE,
} from '@/lib/compare';
import { buildHeroSummary } from '@/lib/movement-detail';
import {
  formatRelationshipStatement,
  IMPORTANT_RELATION_KINDS,
  isImportantRelationship,
  limitMobileRelationships,
  MOBILE_EDGE_LIMIT,
  MOBILE_NODE_LIMIT,
  MOBILE_PRIMARY_KINDS,
  RELATION_LINE_STYLE,
} from '@/lib/network-presentation';
import {
  RELATIONSHIP_DEFINITIONS,
  RELATION_KINDS,
} from '@/lib/relationship-definitions';
import {
  TIMELINE_MODES,
  calculateFollowLabelX,
  chooseTimelineLabel,
  clipMovementToMode,
  fitTimelineModeToMovements,
  movementOverlapsMode,
  timelineBarVisualWidth,
  timelineModeById,
  timelineTicks,
  timelineWidthForMode,
  yearToTimelineX,
} from '@/lib/timeline-presentation';

describe('検索', () => {
  it('ムーブメント名で検索できる', () => {
    const r = searchDocs('印象派');
    expect(r.some((d) => d.type === 'movement' && d.title.includes('印象派'))).toBe(true);
  });
  it('キーワード（技法・素材）で検索できる', () => {
    const r = searchDocs('油彩');
    expect(r.length).toBeGreaterThan(0);
  });
  it('作家名で検索できる', () => {
    const r = searchDocs('ウォーホル');
    expect(r.some((d) => d.type === 'artist')).toBe(true);
  });
  it('空クエリは空配列', () => {
    expect(searchDocs('   ')).toEqual([]);
  });
  it('複数語はAND検索', () => {
    const r = searchDocs('日本 物質');
    // すべての結果が両方の語を含む
    expect(r.every((d) => d.haystack.includes('日本') && d.haystack.includes('物質'))).toBe(true);
  });
});

describe('比較ロジック', () => {
  it('有効なIDのみを解釈する', () => {
    expect(parseCompareIds('baroque,not-real,rococo')).toEqual(['baroque', 'rococo']);
  });
  it('重複を除去する', () => {
    expect(parseCompareIds('baroque,baroque')).toEqual(['baroque']);
  });
  it('最大件数で切り詰める', () => {
    const many = 'gothic,italian-renaissance,baroque,rococo,neoclassicism';
    expect(parseCompareIds(many).length).toBe(MAX_COMPARE);
  });
  it('2件未満は比較不可、2〜4件は比較可', () => {
    expect(canCompare(['baroque'])).toBe(false);
    expect(canCompare(['baroque', 'rococo'])).toBe(true);
    expect(canCompare(['a', 'b', 'c', 'd', 'e'])).toBe(false);
  });
  it('比較行はすべてのムーブメントで値を返す', () => {
    const ms = compareMovements(['gothic', 'italian-renaissance']);
    for (const row of compareRows) {
      for (const m of ms) {
        expect(row.get(m), `${row.key}/${m.id}`).toBeTruthy();
      }
    }
  });
  it('null入力は空配列', () => {
    expect(parseCompareIds(null)).toEqual([]);
  });

  it('比較項目を基本情報・背景・作品・制度・影響へ整理する', () => {
    expect(compareSections.map((section) => section.label)).toEqual([
      '基本情報',
      '背景',
      '作品',
      '制度',
      '影響',
    ]);
    expect(
      compareSections.find((section) => section.key === 'background')?.rows
        .map((row) => row.label),
    ).toEqual(['思想', '社会背景', '前時代への反応']);
    expect(
      compareSections.find((section) => section.key === 'works')?.rows
        .map((row) => row.label),
    ).toEqual(['視覚的特徴', '技法・素材']);
  });

  it('最大4件へ重複しないアクセントカラーを割り当てる', () => {
    expect(COMPARE_ACCENTS).toHaveLength(MAX_COMPARE);
    expect(new Set(COMPARE_ACCENTS).size).toBe(MAX_COMPARE);
  });

  it('対象を削除しても残ったムーブメントのアクセントを維持する', () => {
    const initial = assignCompareAccents([
      'gothic',
      'italian-renaissance',
      'baroque',
    ]);
    const afterRemoval = assignCompareAccents(
      ['italian-renaissance', 'baroque'],
      initial,
    );

    expect(afterRemoval['italian-renaissance']).toBe(
      initial['italian-renaissance'],
    );
    expect(afterRemoval.baroque).toBe(initial.baroque);
    expect(new Set(Object.values(afterRemoval)).size).toBe(2);
  });
});

describe('マトリクス（時代×地域）', () => {
  it('該当セルにムーブメントを返す', () => {
    const cell = matrixCell('renaissance', 'italy');
    expect(cell.some((m) => m.id === 'italian-renaissance')).toBe(true);
  });
  it('該当なしのセルは空配列', () => {
    const cell = matrixCell('prehistoric-ancient', 'america');
    expect(cell).toEqual([]);
  });
});

describe('年代フォーマット', () => {
  it('紀元前は「前」を付ける', () => {
    expect(formatYear(-440)).toBe('前440年');
    expect(formatYear(1889)).toBe('1889年');
  });
  it('継続中のムーブメントは「現在」を含む', () => {
    const m = getMovement('superflat')!;
    expect(formatDateRange(m)).toContain('現在');
  });
});

describe('詳細ページの導入要旨', () => {
  it('全ムーブメントで編集済みの短い概要を省略せず表示する', () => {
    expect(movements).toHaveLength(30);

    for (const movement of movements) {
      const summary = buildHeroSummary(movement.summary);

      expect(summary).toBe(movement.summary.replaceAll('—', '-').replaceAll('–', '-'));
      expect(summary).toMatch(/[。！？]$/);
      expect(summary).not.toContain('…');
      expect(summary.length).toBeLessThanOrEqual(90);
    }
  });

  it('ゴシック美術の概要を自然な文末で終える', () => {
    const movement = getMovement('gothic')!;
    const summary = buildHeroSummary(movement.summary);

    expect(summary).toBe(
      '大聖堂建築を中心に展開した中世盛期の様式。尖頭アーチ・リブ・飛梁の構造革新が高く明るい内部空間を可能にし、ステンドグラスの光が神学的意味を担った。',
    );
  });
});

describe('関係ネットワークの表示設定', () => {
  it('9種類すべてに共通の完全な関係定義を持つ', () => {
    expect(RELATION_KINDS).toHaveLength(9);
    expect(Object.keys(RELATIONSHIP_DEFINITIONS)).toEqual(RELATION_KINDS);

    for (const kind of RELATION_KINDS) {
      const definition = RELATIONSHIP_DEFINITIONS[kind];
      expect(definition.label).toBeTruthy();
      expect(definition.shortDefinition).toBeTruthy();
      expect(definition.fullDefinition).toBeTruthy();
      expect(definition.criteria.length).toBeGreaterThan(0);
      expect(definition.exclusions.length).toBeGreaterThan(0);
      expect(definition.examples.length).toBeGreaterThan(0);
      expect(definition.cautions.length).toBeGreaterThan(0);
      expect(definition.sourceTarget.source).toBeTruthy();
      expect(definition.sourceTarget.target).toBeTruthy();
      expect(definition.visualEncoding.arrow).toBe(
        RELATION_LINE_STYLE[kind].arrow,
      );
    }
  });

  it('9種類すべてに線種を定義する', () => {
    expect(Object.keys(RELATION_LINE_STYLE)).toHaveLength(9);
    expect(RELATION_LINE_STYLE.succession.dasharray).toBeUndefined();
    expect(RELATION_LINE_STYLE.reaction.dasharray).toBe('9 6');
    expect(RELATION_LINE_STYLE.influence.dasharray).toBe('18 8');
    expect(RELATION_LINE_STYLE.contemporary.dasharray).toBe('1.5 6');
    expect(RELATION_LINE_STYLE.succession.arrow).toBe(true);
    expect(RELATION_LINE_STYLE.reaction.arrow).toBe(true);
    expect(RELATION_LINE_STYLE.influence.arrow).toBe(true);
    expect(RELATION_LINE_STYLE.contemporary.arrow).toBe(false);
    expect(RELATION_LINE_STYLE.revival.arrow).toBe(true);
    expect(RELATION_LINE_STYLE['shared-idea'].width).toBe(3);
  });

  it('通常時の線幅を2.5〜3pxに収める', () => {
    for (const style of Object.values(RELATION_LINE_STYLE)) {
      expect(style.width).toBeGreaterThanOrEqual(2.5);
      expect(style.width).toBeLessThanOrEqual(3);
    }
  });

  it('モバイル初期表示は継承・反発・影響に限定する', () => {
    expect(MOBILE_PRIMARY_KINDS).toEqual(['succession', 'reaction', 'influence']);
    expect(IMPORTANT_RELATION_KINDS).toEqual(MOBILE_PRIMARY_KINDS);
    expect(
      relationships
        .filter(isImportantRelationship)
        .every((relationship) => MOBILE_PRIMARY_KINDS.includes(relationship.kind)),
    ).toBe(true);
  });

  it('モバイルの初期エッジ数とノード数を制限する', () => {
    const primary = relationships.filter((relationship) =>
      MOBILE_PRIMARY_KINDS.includes(relationship.kind),
    );
    const limited = limitMobileRelationships(primary);
    const nodeIds = new Set(limited.flatMap((relationship) => [
      relationship.from,
      relationship.to,
    ]));

    expect(limited.length).toBeLessThanOrEqual(MOBILE_EDGE_LIMIT);
    expect(nodeIds.size).toBeLessThanOrEqual(MOBILE_NODE_LIMIT);
    expect(primary.length).toBeGreaterThan(limited.length);
  });

  it('反発は到達先を日本語の主語として表示する', () => {
    const reaction = relationships.find(
      (relationship) => relationship.id === 'rel-rococo-to-neoclassicism',
    )!;
    const names: Record<string, string> = {
      rococo: 'ロココ',
      neoclassicism: '新古典主義',
    };

    expect(formatRelationshipStatement(reaction, (id) => names[id] ?? id)).toBe(
      '新古典主義はロココに反発した',
    );
  });
});

describe('横型タイムラインの表示設定', () => {
  it('通史はコンパクト、時代別はデータ密度に応じて広くする', () => {
    const survey = timelineModeById('survey');
    const ancient = timelineModeById('ancient');
    const modern = timelineModeById('modern');
    const contemporary = timelineModeById('contemporary');

    expect(timelineWidthForMode(survey, 30)).toBe(1180);
    expect(timelineWidthForMode(ancient, 2)).toBe(1000);
    expect(timelineWidthForMode(modern, 12)).toBe(2300);
    expect(timelineWidthForMode(contemporary, 16)).toBe(2400);
    expect(timelineWidthForMode(ancient, 2, true)).toBe(740);
    expect(timelineWidthForMode(modern, 12, true)).toBe(1100);
  });

  it('すべての時代別モードが指定した幅の目安内に収まる', () => {
    for (const mode of TIMELINE_MODES) {
      const width = timelineWidthForMode(mode, 100);
      expect(width).toBeGreaterThanOrEqual(mode.minWidth);
      expect(width).toBeLessThanOrEqual(mode.maxWidth);
    }
  });

  it('バー本体は実年代の座標差を保ち、最低幅で伸ばさない', () => {
    expect(timelineBarVisualWidth(720, 765)).toBe(45);
    expect(timelineBarVisualWidth(200, 200)).toBe(1);
  });

  it('表示範囲外を除外し、またぐムーブメントを端でクリップする', () => {
    const modern = timelineModeById('modern');
    const rococo = getMovement('rococo')!;
    const cubism = getMovement('cubism')!;
    const superflat = getMovement('superflat')!;

    expect(movementOverlapsMode(rococo, modern)).toBe(true);
    expect(clipMovementToMode(rococo, modern)).toMatchObject({
      start: modern.start,
      clippedStart: true,
    });
    expect(clipMovementToMode(cubism, modern)).toMatchObject({
      clippedStart: false,
      clippedEnd: false,
    });
    expect(movementOverlapsMode(superflat, modern)).toBe(false);
  });

  it('時代別モードの年代目盛りを通史より詳細化する', () => {
    expect(timelineTicks(timelineModeById('modern'))).toHaveLength(21);
    expect(timelineTicks(timelineModeById('contemporary')).length).toBeGreaterThan(10);
  });

  it('BCEとCEを同じ線形座標関数で変換する', () => {
    const ancient = timelineModeById('ancient');
    expect(yearToTimelineX(-3000, ancient, 700)).toBe(0);
    expect(yearToTimelineX(-480, ancient, 700)).toBeCloseTo(504);
    expect(yearToTimelineX(500, ancient, 700)).toBe(700);
  });

  it('古代の描画範囲を表示データへ合わせ、前後余白を250年単位で丸める', () => {
    const ancient = timelineModeById('ancient');
    const fitted = fitTimelineModeToMovements(ancient, [
      getMovement('ancient-greek-classical')!,
      getMovement('early-christian-byzantine')!,
    ]);

    expect(fitted).toMatchObject({
      start: -750,
      end: 750,
      tickStep: 250,
    });
  });

  it('時代別の描画範囲には最低200年と10%以上の余白を確保する', () => {
    const modern = timelineModeById('modern');
    const fitted = fitTimelineModeToMovements(modern, [
      getMovement('impressionism')!,
    ]);

    expect(fitted.end - fitted.start).toBeGreaterThanOrEqual(200);
    expect(fitted.start).toBeLessThan(1860);
    expect(fitted.end).toBeGreaterThan(1890);
    expect([100, 250, 500]).toContain(fitted.tickStep);
  });

  it('通史の非線形スケール設定は自動フィットで変更しない', () => {
    const survey = timelineModeById('survey');
    expect(
      fitTimelineModeToMovements(survey, [getMovement('impressionism')!]),
    ).toBe(survey);
  });

  it('目盛りとバー開始年は同じ座標になる', () => {
    const ancient = timelineModeById('ancient');
    const greek = getMovement('ancient-greek-classical')!;
    const clipped = clipMovementToMode(greek, ancient);
    expect(yearToTimelineX(clipped.start, ancient, 1000)).toBe(
      yearToTimelineX(-480, ancient, 1000),
    );
  });

  it('先史美術と古代ギリシア美術を各時代モードに含める', () => {
    expect(
      movementOverlapsMode(
        getMovement('prehistoric-ritual')!,
        timelineModeById('prehistoric'),
      ),
    ).toBe(true);
    expect(
      movementOverlapsMode(
        getMovement('ancient-greek-classical')!,
        timelineModeById('ancient'),
      ),
    ).toBe(true);
  });
});

describe('横型タイムラインの追従ラベル', () => {
  it('バー開始位置より左へ出ない', () => {
    const result = calculateFollowLabelX({
      barStart: 200,
      barEnd: 900,
      labelWidth: 120,
      viewportLeft: 0,
      viewportRight: 390,
    });
    expect(result.x).toBe(208);
  });

  it('バー終了位置より右へ出ない', () => {
    const result = calculateFollowLabelX({
      barStart: 100,
      barEnd: 700,
      labelWidth: 120,
      viewportLeft: 650,
      viewportRight: 1040,
    });
    expect(result.x).toBe(572);
    expect(result.x + 120 + 8).toBeLessThanOrEqual(700);
  });

  it('長いバーではviewport左端へ追従する', () => {
    const result = calculateFollowLabelX({
      barStart: 0,
      barEnd: 1000,
      labelWidth: 140,
      viewportLeft: 360,
      viewportRight: 750,
    });
    expect(result).toEqual({ x: 368, followsViewport: true });
  });

  it('短いバーでは通常の開始位置を使う', () => {
    const result = calculateFollowLabelX({
      barStart: 300,
      barEnd: 430,
      labelWidth: 100,
      viewportLeft: 350,
      viewportRight: 740,
    });
    expect(result).toEqual({ x: 308, followsViewport: false });
  });

  it('正式名称、shortLabel、ellipsisの順に切り替える', () => {
    expect(
      chooseTimelineLabel({
        name: '初期キリスト教・ビザンティン美術',
        shortLabel: '初期キリスト教・ビザンティン',
        availableWidth: 220,
        nameWidth: 200,
        shortLabelWidth: 170,
      }),
    ).toMatchObject({ variant: 'full' });
    expect(
      chooseTimelineLabel({
        name: '初期キリスト教・ビザンティン美術',
        shortLabel: '初期キリスト教・ビザンティン',
        availableWidth: 180,
        nameWidth: 200,
        shortLabelWidth: 170,
      }),
    ).toMatchObject({ variant: 'short' });
    expect(
      chooseTimelineLabel({
        name: '初期キリスト教・ビザンティン美術',
        shortLabel: '初期キリスト教・ビザンティン',
        availableWidth: 120,
        nameWidth: 200,
        shortLabelWidth: 170,
      }),
    ).toMatchObject({ variant: 'ellipsis' });
  });
});
