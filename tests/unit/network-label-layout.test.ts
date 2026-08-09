import { describe, it, expect } from 'vitest';
import type { NetworkEdgeGeometry } from '@/lib/network-geometry';
import {
  segmentIntersectsRect,
  cubicNormalAt,
  cubicPointAt,
  estimateLabelWidth,
  layoutEdgeLabels,
  rectsOverlap,
  scoreLabelPlacement,
  viewportOverflowRatio,
  LABEL_GAP,
  type LabelInput,
  type Obstacle,
  type Rect,
} from '@/lib/network-label-layout';

/** 直線エッジ（制御点を線上に置いた三次ベジェ） */
const straightEdge = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): NetworkEdgeGeometry => ({
  d: '',
  start: { x: x1, y: y1 },
  end: { x: x2, y: y2 },
  firstControl: { x: x1 + (x2 - x1) / 3, y: y1 + (y2 - y1) / 3 },
  secondControl: { x: x1 + (2 * (x2 - x1)) / 3, y: y1 + (2 * (y2 - y1)) / 3 },
  targetBoundary: { x: x2, y: y2 },
  midX: (x1 + x2) / 2,
  midY: (y1 + y2) / 2,
  routeOffset: 0,
});

const viewport: Rect = { x: 0, y: 0, width: 1000, height: 600 };

const label = (id: string, geometry: NetworkEdgeGeometry, priority = 0): LabelInput => ({
  id,
  geometry,
  width: 48,
  height: 14,
  priority,
});

describe('network label layout', () => {
  describe('曲線上の点と法線', () => {
    it('水平な直線の中点を返す', () => {
      const point = cubicPointAt(straightEdge(0, 100, 200, 100), 0.5);
      expect(point.x).toBeCloseTo(100, 5);
      expect(point.y).toBeCloseTo(100, 5);
    });

    it('水平な線の法線は垂直方向になる', () => {
      const normal = cubicNormalAt(straightEdge(0, 100, 200, 100), 0.5);
      expect(Math.abs(normal.x)).toBeCloseTo(0, 5);
      expect(Math.abs(normal.y)).toBeCloseTo(1, 5);
    });

    it('垂直な線の法線は水平方向になる', () => {
      const normal = cubicNormalAt(straightEdge(100, 0, 100, 200), 0.5);
      expect(Math.abs(normal.x)).toBeCloseTo(1, 5);
      expect(Math.abs(normal.y)).toBeCloseTo(0, 5);
    });
  });

  describe('衝突判定と採点', () => {
    it('すき間を考慮して重なりを判定する', () => {
      const a: Rect = { x: 0, y: 0, width: 10, height: 10 };
      const b: Rect = { x: 12, y: 0, width: 10, height: 10 };
      expect(rectsOverlap(a, b)).toBe(false);
      expect(rectsOverlap(a, b, 4)).toBe(true);
    });

    it('viewport外へ出た割合を返す', () => {
      expect(
        viewportOverflowRatio({ x: 10, y: 10, width: 10, height: 10 }, viewport),
      ).toBeCloseTo(0, 5);
      expect(
        viewportOverflowRatio({ x: -10, y: 10, width: 10, height: 10 }, viewport),
      ).toBeCloseTo(1, 5);
    });

    it('衝突が無ければ距離ぶんの小さなスコアだけになる', () => {
      const score = scoreLabelPlacement(
        { x: 100, y: 100, width: 40, height: 12 },
        [],
        viewport,
        8,
      );
      expect(score).toBe(16);
    });

    it('ノード衝突は大きなペナルティになる', () => {
      const obstacles: Obstacle[] = [
        { rect: { x: 100, y: 100, width: 40, height: 12 }, kind: 'node' },
      ];
      const score = scoreLabelPlacement(
        { x: 100, y: 100, width: 40, height: 12 },
        obstacles,
        viewport,
        0,
      );
      expect(score).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('layoutEdgeLabels', () => {
    it('1本だけなら線の近くに置く（中点付近）', () => {
      const [placement] = layoutEdgeLabels(
        [label('a', straightEdge(0, 300, 400, 300))],
        [],
        viewport,
      );
      expect(placement.collided).toBe(false);
      expect(Math.abs(placement.offset)).toBeLessThanOrEqual(16);
      // 線（y=300）から大きく離れない
      expect(Math.abs(placement.y - 300)).toBeLessThanOrEqual(16);
    });

    it('選択ノードへ5本集中してもラベル同士が重ならない', () => {
      // 1点(500,300)から放射状に広がる5本
      const edges = [
        straightEdge(500, 300, 900, 120),
        straightEdge(500, 300, 900, 240),
        straightEdge(500, 300, 900, 300),
        straightEdge(500, 300, 900, 360),
        straightEdge(500, 300, 900, 480),
      ];
      const placements = layoutEdgeLabels(
        edges.map((geometry, index) => label(`e${index}`, geometry)),
        [],
        viewport,
      );
      expect(placements).toHaveLength(5);

      for (let i = 0; i < placements.length; i += 1) {
        for (let j = i + 1; j < placements.length; j += 1) {
          expect(
            rectsOverlap(placements[i].rect, placements[j].rect),
            `${placements[i].id} と ${placements[j].id} が重なっている`,
          ).toBe(false);
        }
      }
    });

    it('ノード矩形を避けて配置する', () => {
      const nodeRect: Rect = { x: 180, y: 288, width: 120, height: 40 };
      const obstacles: Obstacle[] = [{ rect: nodeRect, kind: 'node' }];
      const [placement] = layoutEdgeLabels(
        [label('a', straightEdge(0, 300, 480, 300))],
        obstacles,
        viewport,
      );
      expect(rectsOverlap(placement.rect, nodeRect, LABEL_GAP.node)).toBe(false);
    });

    it('viewport外へ出さない', () => {
      // 上端すれすれの線。上へ逃がすと画面外になるので下側へ回るはず
      const [placement] = layoutEdgeLabels(
        [label('a', straightEdge(100, 6, 500, 6))],
        [],
        viewport,
      );
      expect(placement.rect.y).toBeGreaterThanOrEqual(viewport.y - 0.001);
      expect(placement.rect.y + placement.rect.height).toBeLessThanOrEqual(
        viewport.y + viewport.height,
      );
    });

    it('優先度の高いラベルから先に位置を確定する', () => {
      const shared = straightEdge(0, 300, 400, 300);
      const placements = layoutEdgeLabels(
        [label('low', shared, 2), label('high', shared, 0)],
        [],
        viewport,
      );
      // 高優先のものが先に処理され、より線に近い（オフセットが小さい）
      const high = placements.find((item) => item.id === 'high')!;
      const low = placements.find((item) => item.id === 'low')!;
      expect(placements[0].id).toBe('high');
      expect(Math.abs(high.offset)).toBeLessThanOrEqual(Math.abs(low.offset));
      expect(rectsOverlap(high.rect, low.rect)).toBe(false);
    });

    it('ノードで塞がれていても引き出し線付きで逃がし、重ならない', () => {
      // 縦のエッジ経路上に大きなノードが居座るケース（北方ルネサンス相当）
      const nodeRect: Rect = { x: 420, y: 200, width: 166, height: 60 };
      const obstacles: Obstacle[] = [{ rect: nodeRect, kind: 'node' }];
      const [placement] = layoutEdgeLabels(
        [label('a', straightEdge(503, 120, 503, 340))],
        obstacles,
        viewport,
      );
      expect(rectsOverlap(placement.rect, nodeRect, LABEL_GAP.node)).toBe(false);
      // 大きく離した場合は引き出し線でどのエッジか示す
      if (Math.abs(placement.offset) >= 44) {
        expect(placement.needsLeader).toBe(true);
        // 引き出し線の始点はエッジ上にある
        expect(placement.anchor.x).toBeCloseTo(503, 5);
      }
    });

    it('引き出し線がノードを貫通する位置を選ばない', () => {
      // エッジの左側にノードがあるので、左へ逃がすと引き出し線がノードを横切る
      const blocking: Rect = { x: 300, y: 220, width: 166, height: 60 };
      const obstacles: Obstacle[] = [{ rect: blocking, kind: 'node' }];
      const [placement] = layoutEdgeLabels(
        [label('a', straightEdge(560, 120, 560, 360))],
        obstacles,
        viewport,
      );
      if (placement.needsLeader) {
        expect(
          segmentIntersectsRect(placement.anchor, { x: placement.x, y: placement.y }, blocking),
        ).toBe(false);
      }
      expect(rectsOverlap(placement.rect, blocking, LABEL_GAP.node)).toBe(false);
    });

    it('ラベルは常に返す（非表示にしない）', () => {
      // 密集した10本でも全件配置を返す
      const inputs = Array.from({ length: 10 }, (_, index) =>
        label(`e${index}`, straightEdge(400, 300, 460, 300 + index)),
      );
      expect(layoutEdgeLabels(inputs, [], viewport)).toHaveLength(10);
    });
  });

  describe('segmentIntersectsRect', () => {
    const rect: Rect = { x: 100, y: 100, width: 100, height: 50 };

    it('矩形を横切る線分を検出する', () => {
      expect(segmentIntersectsRect({ x: 50, y: 125 }, { x: 250, y: 125 }, rect)).toBe(true);
    });

    it('矩形を通らない線分は false', () => {
      expect(segmentIntersectsRect({ x: 50, y: 40 }, { x: 250, y: 40 }, rect)).toBe(false);
    });

    it('線分が矩形の手前で終わる場合は false', () => {
      expect(segmentIntersectsRect({ x: 0, y: 125 }, { x: 90, y: 125 }, rect)).toBe(false);
    });
  });

  describe('estimateLabelWidth', () => {
    it('日本語は約1em、英数字は約0.6emで見積る', () => {
      expect(estimateLabelWidth('継承', 10)).toBeCloseTo(20, 5);
      expect(estimateLabelWidth('abc', 10)).toBeCloseTo(18, 5);
    });
  });
});
