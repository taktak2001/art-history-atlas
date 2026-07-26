import { describe, it, expect } from 'vitest';
import { parseFocus, buildFocusQuery } from '@/lib/network';
import { movements } from '@/data/movements';

const ids = new Set(movements.map((m) => m.id));

describe('parseFocus', () => {
  it('有効なMovement IDを返す', () => {
    expect(parseFocus('surrealism', ids)).toBe('surrealism');
  });
  it('存在しないID/typoはnull', () => {
    expect(parseFocus('surrealismx', ids)).toBeNull();
    expect(parseFocus('not-a-movement', ids)).toBeNull();
  });
  it('空文字・null・undefinedはnull', () => {
    expect(parseFocus('', ids)).toBeNull();
    expect(parseFocus(null, ids)).toBeNull();
    expect(parseFocus(undefined, ids)).toBeNull();
  });
  it('配列でも受け付ける', () => {
    expect(parseFocus('cubism', ['cubism', 'dada'])).toBe('cubism');
  });
});

describe('buildFocusQuery（他クエリを保持）', () => {
  it('focusを設定する', () => {
    expect(buildFocusQuery('', 'surrealism')).toBe('focus=surrealism');
  });
  it('先頭の ? があっても既存クエリ(lod)を保持してfocusを追加', () => {
    const out = buildFocusQuery('?lod=standard', 'surrealism');
    const p = new URLSearchParams(out);
    expect(p.get('lod')).toBe('standard');
    expect(p.get('focus')).toBe('surrealism');
  });
  it('focus=nullで既存focusのみ削除し、他は保持', () => {
    const out = buildFocusQuery('focus=surrealism&lod=standard', null);
    const p = new URLSearchParams(out);
    expect(p.get('focus')).toBeNull();
    expect(p.get('lod')).toBe('standard');
  });
  it('全クエリが消えれば空文字', () => {
    expect(buildFocusQuery('focus=dada', null)).toBe('');
  });
});
