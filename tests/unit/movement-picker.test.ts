import { describe, it, expect } from 'vitest';
import {
  addSelection,
  canAdd,
  describeMovement,
  getInitialMovements,
  groupMovementsByEra,
  pushRecentId,
  readRecentIds,
  removeSelection,
  searchMovements,
  RECENT_LIMIT,
} from '@/lib/movement-picker';
import { movements } from '@/lib/dataset';

const names = (items: { nameJa: string }[]) => items.map((item) => item.nameJa);

describe('ムーブメントピッカーの検索', () => {
  it('日本語名で見つかる', () => {
    expect(names(searchMovements('シュルレアリスム'))).toContain('シュルレアリスム');
  });

  it('英語名で見つかる', () => {
    expect(names(searchMovements('surrealism'))).toContain('シュルレアリスム');
  });

  it('別名で見つかる', () => {
    expect(names(searchMovements('超現実主義'))).toContain('シュルレアリスム');
  });

  it('作家名で該当ムーブメントが見つかる', () => {
    expect(names(searchMovements('ピカソ'))).toContain('キュビスム');
  });

  it('作品名で該当ムーブメントが見つかる', () => {
    expect(names(searchMovements('モナ・リザ'))).toContain('イタリア・ルネサンス');
  });

  it('部分一致する', () => {
    expect(searchMovements('ルネサ').length).toBeGreaterThan(0);
  });

  it('空文字は結果なし（初期表示は別で組み立てる）', () => {
    expect(searchMovements('')).toEqual([]);
    expect(searchMovements('   ')).toEqual([]);
  });

  it('該当なしは空配列', () => {
    expect(searchMovements('該当しない文字列xyzzy')).toEqual([]);
  });
});

describe('時代別グループ化と補助表記', () => {
  it('空の時代を含めず、時代順に並ぶ', () => {
    const groups = groupMovementsByEra(movements);
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) expect(group.items.length).toBeGreaterThan(0);
    expect(groups[0].label).toBe('先史・古代');
  });

  it('各グループ内は年代順', () => {
    for (const group of groupMovementsByEra(movements)) {
      const starts = group.items.map((item) => item.dates.start);
      expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    }
  });

  it('年代と地域を補助表記にする', () => {
    const surrealism = movements.find((m) => m.id === 'surrealism')!;
    const text = describeMovement(surrealism);
    expect(text).toContain('｜');
    expect(text).toMatch(/1924/);
  });
});

describe('初期表示と履歴', () => {
  it('履歴が無ければ基本LODの主要ムーブメントを返す', () => {
    const initial = getInitialMovements([]);
    expect(initial.length).toBeGreaterThan(0);
  });

  it('最近選んだものを先頭に、重複なく返す', () => {
    const initial = getInitialMovements(['surrealism', 'baroque']);
    expect(initial[0].id).toBe('surrealism');
    expect(initial[1].id).toBe('baroque');
    const ids = initial.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('壊れた履歴や未知IDは無視する', () => {
    expect(readRecentIds(null)).toEqual([]);
    expect(readRecentIds('not json')).toEqual([]);
    expect(readRecentIds('{"a":1}')).toEqual([]);
    expect(readRecentIds('["no-such-movement","surrealism"]')).toEqual(['surrealism']);
  });

  it('履歴は最新が先頭・重複なし・上限まで', () => {
    let recent: string[] = [];
    for (const id of ['baroque', 'surrealism', 'baroque']) {
      recent = pushRecentId(recent, id);
    }
    expect(recent).toEqual(['baroque', 'surrealism']);

    const many = movements.slice(0, RECENT_LIMIT + 3).map((m) => m.id);
    let acc: string[] = [];
    for (const id of many) acc = pushRecentId(acc, id);
    expect(acc.length).toBe(RECENT_LIMIT);
  });
});

describe('選択状態', () => {
  const max = 4;

  it('追加できる', () => {
    expect(addSelection({ ids: ['a'], max }, 'b')).toEqual(['a', 'b']);
  });

  it('選択順を保つ', () => {
    let ids: string[] = [];
    for (const id of ['c', 'a', 'b']) ids = addSelection({ ids, max }, id);
    expect(ids).toEqual(['c', 'a', 'b']);
  });

  it('重複を追加しない', () => {
    expect(canAdd({ ids: ['a'], max }, 'a')).toBe(false);
    expect(addSelection({ ids: ['a'], max }, 'a')).toEqual(['a']);
  });

  it('上限を超えて追加しない', () => {
    const full = { ids: ['a', 'b', 'c', 'd'], max };
    expect(canAdd(full, 'e')).toBe(false);
    expect(addSelection(full, 'e')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('上限に達していても削除はできる', () => {
    expect(removeSelection({ ids: ['a', 'b', 'c', 'd'], max }, 'b')).toEqual([
      'a',
      'c',
      'd',
    ]);
  });
});
