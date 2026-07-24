import { describe, it, expect } from 'vitest';
import {
  searchDocs,
  matrixCell,
  formatYear,
  formatDateRange,
  getMovement,
  relationships,
} from '@/lib/dataset';
import {
  parseCompareIds,
  canCompare,
  compareMovements,
  compareRows,
  MAX_COMPARE,
} from '@/lib/compare';
import { buildHeroSummary } from '@/lib/movement-detail';
import {
  limitMobileRelationships,
  MOBILE_EDGE_LIMIT,
  MOBILE_NODE_LIMIT,
  MOBILE_PRIMARY_KINDS,
  RELATION_LINE_STYLE,
} from '@/lib/network-presentation';
import {
  TIMELINE_MODES,
  clipMovementToMode,
  movementOverlapsMode,
  timelineBarMinimumWidth,
  timelineModeById,
  timelineTicks,
  timelineWidthForMode,
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
  it('既存データから80〜120字の要旨を作る', () => {
    const movement = getMovement('italian-renaissance')!;
    const summary = buildHeroSummary(movement.summary, movement.coreIdea);

    expect(summary.length).toBeGreaterThanOrEqual(80);
    expect(summary.length).toBeLessThanOrEqual(120);
    expect(summary.startsWith(movement.summary)).toBe(true);
  });

  it('長文は120字以内で自然に切る', () => {
    const summary = buildHeroSummary(
      'これは導入要旨です。'.repeat(20),
      '補足の中心思想です。',
    );

    expect(summary.length).toBeLessThanOrEqual(120);
    expect(summary.length).toBeGreaterThanOrEqual(80);
  });
});

describe('関係ネットワークの表示設定', () => {
  it('9種類すべてに線種を定義する', () => {
    expect(Object.keys(RELATION_LINE_STYLE)).toHaveLength(9);
    expect(RELATION_LINE_STYLE.succession.dasharray).toBeUndefined();
    expect(RELATION_LINE_STYLE.reaction.dasharray).toBe('9 6');
    expect(RELATION_LINE_STYLE.influence.dasharray).toBe('18 8');
    expect(RELATION_LINE_STYLE.contemporary.dasharray).toBe('1.5 6');
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
  });

  it('すべての時代別モードが指定した幅の目安内に収まる', () => {
    for (const mode of TIMELINE_MODES) {
      const width = timelineWidthForMode(mode, 100);
      expect(width).toBeGreaterThanOrEqual(mode.minWidth);
      expect(width).toBeLessThanOrEqual(mode.maxWidth);
    }
  });

  it('詳細モードはバーの最低幅を136pxにする', () => {
    expect(timelineBarMinimumWidth(timelineModeById('survey'))).toBe(64);
    expect(timelineBarMinimumWidth(timelineModeById('early-modern'))).toBe(136);
    expect(timelineBarMinimumWidth(timelineModeById('modern'))).toBe(136);
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
});
