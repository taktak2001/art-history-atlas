import { describe, it, expect } from 'vitest';
import {
  DEFAULT_NETWORK_MODE,
  NETWORK_MODE_PRESET,
  edgeEmphasis,
  isOverviewBackbone,
  nodeEmphasis,
  parseNetworkMode,
} from '@/lib/network-mode';

const empty = new Set<string>();

describe('network mode', () => {
  it('標準はSTUDY（日常利用のデフォルト）', () => {
    expect(DEFAULT_NETWORK_MODE).toBe('study');
  });

  it('モードごとに収録範囲とカメラ倍率が決まる', () => {
    expect(NETWORK_MODE_PRESET.overview.lod).toBe('core');
    expect(NETWORK_MODE_PRESET.study.lod).toBe('standard');
    expect(NETWORK_MODE_PRESET.focus.lod).toBe('detailed');
    expect(NETWORK_MODE_PRESET.overview.zoom).toBeLessThan(
      NETWORK_MODE_PRESET.study.zoom,
    );
    expect(NETWORK_MODE_PRESET.focus.zoom).toBeGreaterThan(
      NETWORK_MODE_PRESET.study.zoom,
    );
  });

  it('OVERVIEWでは関係ラベルを出さない', () => {
    expect(NETWORK_MODE_PRESET.overview.relationLabels).toBe(false);
    expect(NETWORK_MODE_PRESET.study.relationLabels).toBe(true);
    expect(NETWORK_MODE_PRESET.focus.relationLabels).toBe(true);
  });

  it('未知のモード名は受け付けない', () => {
    expect(parseNetworkMode('study')).toBe('study');
    expect(parseNetworkMode('detailed')).toBeNull();
    expect(parseNetworkMode(null)).toBeNull();
  });

  it('主幹は重要関係に復興を加えたもの', () => {
    expect(isOverviewBackbone('succession')).toBe(true);
    expect(isOverviewBackbone('reaction')).toBe(true);
    expect(isOverviewBackbone('influence')).toBe(true);
    expect(isOverviewBackbone('revival')).toBe(true);
    expect(isOverviewBackbone('contemporary')).toBe(false);
    expect(isOverviewBackbone('shared-idea')).toBe(false);
  });

  describe('nodeEmphasis', () => {
    const direct = new Set(['b']);
    const second = new Set(['c']);

    it('選択が無ければすべて通常', () => {
      expect(
        nodeEmphasis({
          mode: 'study',
          nodeId: 'a',
          selectedId: null,
          directNodeIds: empty,
          secondHopNodeIds: empty,
        }),
      ).toBe('normal');
    });

    it('選択・直接関係・2hopを区別する', () => {
      const of = (nodeId: string) =>
        nodeEmphasis({
          mode: 'focus',
          nodeId,
          selectedId: 'a',
          directNodeIds: direct,
          secondHopNodeIds: second,
        });
      expect(of('a')).toBe('selected');
      expect(of('b')).toBe('direct');
      expect(of('c')).toBe('second');
    });

    it('FOCUSだけ、無関係なノードを背景まで落とす', () => {
      const of = (mode: 'study' | 'focus') =>
        nodeEmphasis({
          mode,
          nodeId: 'z',
          selectedId: 'a',
          directNodeIds: direct,
          secondHopNodeIds: second,
        });
      expect(of('focus')).toBe('background');
      expect(of('study')).toBe('second');
    });
  });

  describe('edgeEmphasis', () => {
    it('OVERVIEWは主幹とそれ以外で強さを変える', () => {
      const of = (kind: 'succession' | 'contemporary') =>
        edgeEmphasis({
          mode: 'overview',
          kind,
          from: 'a',
          to: 'b',
          selectedId: null,
          directNodeIds: empty,
        });
      expect(of('succession')).toBe('backbone');
      expect(of('contemporary')).toBe('minor');
    });

    it('STUDYでは選択が無いかぎり線の強さを変えない', () => {
      expect(
        edgeEmphasis({
          mode: 'study',
          kind: 'contemporary',
          from: 'a',
          to: 'b',
          selectedId: null,
          directNodeIds: empty,
        }),
      ).toBe('normal');
    });

    it('選択中は、選択に触れる線を最優先にする', () => {
      const direct = new Set(['a', 'b', 'c']);
      expect(
        edgeEmphasis({
          mode: 'focus',
          kind: 'succession',
          from: 'a',
          to: 'b',
          selectedId: 'a',
          directNodeIds: direct,
        }),
      ).toBe('primary');
      expect(
        edgeEmphasis({
          mode: 'focus',
          kind: 'succession',
          from: 'b',
          to: 'c',
          selectedId: 'a',
          directNodeIds: direct,
        }),
      ).toBe('second');
      expect(
        edgeEmphasis({
          mode: 'focus',
          kind: 'succession',
          from: 'y',
          to: 'z',
          selectedId: 'a',
          directNodeIds: direct,
        }),
      ).toBe('background');
    });
  });
});
