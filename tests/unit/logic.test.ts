import { describe, it, expect } from 'vitest';
import { searchDocs, matrixCell, formatYear, formatDateRange, getMovement } from '@/lib/dataset';
import {
  parseCompareIds,
  canCompare,
  compareMovements,
  compareRows,
  MAX_COMPARE,
} from '@/lib/compare';

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
