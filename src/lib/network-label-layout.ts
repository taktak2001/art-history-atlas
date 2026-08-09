import type { NetworkEdgeGeometry, Point } from './network-geometry';

/**
 * 関係ラベルの衝突回避配置（純粋関数・単体テスト対象）。
 *
 * ラベルを非表示にせず、線の近くを保ったまま重なりを避ける。
 * エッジ上の複数の位置（progress）と法線方向のオフセットを候補にし、
 * 他のラベル・ノード・矢印・画面外との衝突を採点して最小の位置を選ぶ。
 */

export type Rect = { x: number; y: number; width: number; height: number };

/** エッジ上のラベル位置候補（中点だけに固定しない） */
export const LABEL_PROGRESS_CANDIDATES = [
  // 中点を最優先しつつ、線に沿って細かく逃がせるようにする
  // （縦に密な列ではノード間のすき間へ入り込めることが重要）
  0.5, 0.45, 0.55, 0.4, 0.6, 0.35, 0.65, 0.3, 0.7, 0.25, 0.75, 0.2, 0.8, 0.15,
  0.85,
];
/** 線からの法線方向オフセット候補（px） */
// バックプレートが線を隠すため、線上(0)も有効な候補にする
export const LABEL_NORMAL_OFFSETS = [0, -8, 8, -14, 14, -20, 20];
/** 第2フォールバックで使う拡張オフセット */
export const LABEL_FALLBACK_OFFSETS = [-26, 26, -32, 32, -40, 40];
/**
 * 第3フォールバック。ここまで離すと線との対応が視覚的に切れるため、
 * 採用した場合はリーダー線（引き出し線）を描いてどのエッジのラベルか示す。
 */
export const LABEL_LEADER_OFFSETS = [
  // ノード幅（148〜166px）を確実に越えられる距離まで用意する。
  // 引き出し線で対応関係を示すため、離れても「どのエッジのラベルか」は保てる。
  -56, 56, -72, 72, -96, 96, -118, 118, -140, 140,
];
/** リーダー線を描き始めるオフセットの閾値 */
export const LABEL_LEADER_THRESHOLD = 44;

export const LABEL_PENALTY = {
  label: 1000,
  /**
   * ノード（ブロック）への重なりは最優先で避ける。
   * 他の衝突より十分大きくして、「ラベル同士が近い」「線から遠い」を許容してでも
   * ブロックの上に載らないようにする。
   */
  node: 5000,
  arrow: 500,
  viewport: 1000,
  /** 引き出し線がノードを貫通する（＝謎の線に見える）のを避ける */
  leaderCrossesNode: 900,
  /**
   * 引き出し線は「元のエッジとの対応を示す最低限の補助線」に留める。
   * 距離ペナルティは頭打ちにするため、閾値を超えた分はここで別に加算し、
   * 衝突しない候補が複数あるときは短い引き出し線を選ばせる。
   */
  leaderLength: 3,
  /** 線から離れるほど小さなペナルティ */
  distance: 2,
} as const;

/** 距離ペナルティを頭打ちにする距離（px） */
export const LABEL_MAX_DISTANCE_PENALTY_AT = 40;

/** ラベル同士・ノードとの最小すき間（px） */
// ノードの隙間（モバイルは行間84 - ノード高58 = 26px）へ収まる値にする。
// 大きくしすぎると隙間に入れず、かえってノードの上に載る。
export const LABEL_GAP = { label: 4, node: 5, arrow: 4 } as const;

export type ObstacleKind = 'node' | 'arrow' | 'label';
export type Obstacle = { rect: Rect; kind: ObstacleKind };

const cubic = (a: number, b: number, c: number, d: number, t: number) => {
  const inv = 1 - t;
  return (
    inv ** 3 * a + 3 * inv ** 2 * t * b + 3 * inv * t ** 2 * c + t ** 3 * d
  );
};

/** 三次ベジェ上の点 */
export function cubicPointAt(geometry: NetworkEdgeGeometry, t: number): Point {
  return {
    x: cubic(
      geometry.start.x,
      geometry.firstControl.x,
      geometry.secondControl.x,
      geometry.end.x,
      t,
    ),
    y: cubic(
      geometry.start.y,
      geometry.firstControl.y,
      geometry.secondControl.y,
      geometry.end.y,
      t,
    ),
  };
}

/** 三次ベジェ上の単位法線（線に対して垂直な向き） */
export function cubicNormalAt(geometry: NetworkEdgeGeometry, t: number): Point {
  const delta = 0.001;
  const before = cubicPointAt(geometry, Math.max(0, t - delta));
  const after = cubicPointAt(geometry, Math.min(1, t + delta));
  const dx = after.x - before.x;
  const dy = after.y - before.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return { x: 0, y: -1 };
  // 法線は接線を90度回転したもの
  return { x: -dy / length, y: dx / length };
}

export function rectsOverlap(a: Rect, b: Rect, gap = 0): boolean {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

/** viewport からはみ出した面積の割合（0〜1） */
export function viewportOverflowRatio(rect: Rect, viewport: Rect): number {
  const overlapW = Math.max(
    0,
    Math.min(rect.x + rect.width, viewport.x + viewport.width) -
      Math.max(rect.x, viewport.x),
  );
  const overlapH = Math.max(
    0,
    Math.min(rect.y + rect.height, viewport.y + viewport.height) -
      Math.max(rect.y, viewport.y),
  );
  const area = rect.width * rect.height;
  if (area <= 0) return 0;
  return 1 - (overlapW * overlapH) / area;
}

/**
 * 線分が矩形と交差するか（スラブ法）。
 * 引き出し線がノードを横切らないか判定するために使う。
 */
export function segmentIntersectsRect(
  from: Point,
  to: Point,
  rect: Rect,
): boolean {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let tMin = 0;
  let tMax = 1;

  const clip = (delta: number, start: number, min: number, max: number) => {
    if (delta === 0) return start >= min && start <= max;
    const t1 = (min - start) / delta;
    const t2 = (max - start) / delta;
    const near = Math.min(t1, t2);
    const far = Math.max(t1, t2);
    tMin = Math.max(tMin, near);
    tMax = Math.min(tMax, far);
    return tMax >= tMin;
  };

  if (!clip(dx, from.x, rect.x, rect.x + rect.width)) return false;
  if (!clip(dy, from.y, rect.y, rect.y + rect.height)) return false;
  return tMax >= tMin;
}

/** ラベル候補の衝突スコア（小さいほど良い） */
export function scoreLabelPlacement(
  rect: Rect,
  obstacles: Obstacle[],
  viewport: Rect,
  distanceFromEdge: number,
  /** 引き出し線を引く場合の始点（エッジ上の点）。ノード貫通を採点する。 */
  leaderFrom?: Point,
): number {
  // 距離のペナルティには上限を設ける。
  // 上限が無いと「遠いが衝突しない位置」が「近いがノードに重なる位置」に負けてしまう。
  let score =
    Math.min(Math.abs(distanceFromEdge), LABEL_MAX_DISTANCE_PENALTY_AT) *
    LABEL_PENALTY.distance;

  if (leaderFrom) {
    // 閾値を超えて離した分だけ加点し、短い引き出し線を優先する
    score +=
      Math.max(0, Math.abs(distanceFromEdge) - LABEL_LEADER_THRESHOLD) *
      LABEL_PENALTY.leaderLength;
    const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    for (const obstacle of obstacles) {
      if (obstacle.kind !== 'node') continue;
      if (segmentIntersectsRect(leaderFrom, center, obstacle.rect)) {
        score += LABEL_PENALTY.leaderCrossesNode;
      }
    }
  }

  for (const obstacle of obstacles) {
    const gap =
      obstacle.kind === 'label'
        ? LABEL_GAP.label
        : obstacle.kind === 'node'
          ? LABEL_GAP.node
          : LABEL_GAP.arrow;
    if (!rectsOverlap(rect, obstacle.rect, gap)) continue;
    score +=
      obstacle.kind === 'label'
        ? LABEL_PENALTY.label
        : obstacle.kind === 'node'
          ? LABEL_PENALTY.node
          : LABEL_PENALTY.arrow;
  }

  score += viewportOverflowRatio(rect, viewport) * LABEL_PENALTY.viewport;
  return score;
}

export type LabelInput = {
  id: string;
  geometry: NetworkEdgeGeometry;
  width: number;
  height: number;
  /** 小さいほど先に配置する（選択ノード直結 → 1ホップ → その他） */
  priority: number;
};

export type LabelPlacement = {
  id: string;
  /** ラベル中心 */
  x: number;
  y: number;
  progress: number;
  offset: number;
  rect: Rect;
  /** ラベルが指すエッジ上の点（リーダー線の始点） */
  anchor: Point;
  /** 線から離れているため引き出し線が必要 */
  needsLeader: boolean;
  /** すべての候補が衝突した場合 true（それでも非表示にはしない） */
  collided: boolean;
};

const rectAround = (center: Point, width: number, height: number): Rect => ({
  x: center.x - width / 2,
  y: center.y - height / 2,
  width,
  height,
});

function findBestPlacement(
  input: LabelInput,
  placed: Obstacle[],
  viewport: Rect,
): LabelPlacement | null {
  let best: LabelPlacement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const offsets of [
    LABEL_NORMAL_OFFSETS,
    LABEL_FALLBACK_OFFSETS,
    LABEL_LEADER_OFFSETS,
  ]) {
    for (const progress of LABEL_PROGRESS_CANDIDATES) {
      const point = cubicPointAt(input.geometry, progress);
      const normal = cubicNormalAt(input.geometry, progress);
      for (const offset of offsets) {
        const center = {
          x: point.x + normal.x * offset,
          y: point.y + normal.y * offset,
        };
        const rect = rectAround(center, input.width, input.height);
        const needsLeader = Math.abs(offset) >= LABEL_LEADER_THRESHOLD;
        const score = scoreLabelPlacement(
          rect,
          placed,
          viewport,
          offset,
          needsLeader ? point : undefined,
        );
        if (score >= bestScore) continue;
        bestScore = score;
        best = {
          id: input.id,
          x: center.x,
          y: center.y,
          progress,
          offset,
          rect,
          anchor: point,
          needsLeader,
          collided: score >= LABEL_PENALTY.arrow,
        };
      }
    }
    // 通常候補で衝突ゼロの配置が見つかったら拡張候補は試さない
    if (bestScore < LABEL_PENALTY.arrow) break;
  }

  return best;
}

/**
 * 重要度順にラベル位置を確定する。確定済みラベルは以後の障害物になる。
 * 候補がすべて衝突する場合もラベルは消さず、最小ペナルティの位置へ置く。
 */
export function layoutEdgeLabels(
  inputs: LabelInput[],
  obstacles: Obstacle[],
  viewport: Rect,
): LabelPlacement[] {
  const placed: Obstacle[] = [...obstacles];
  const results: LabelPlacement[] = [];

  const ordered = [...inputs].sort(
    (a, b) => a.priority - b.priority || a.id.localeCompare(b.id),
  );

  for (const input of ordered) {
    const chosen = findBestPlacement(input, placed, viewport);
    if (!chosen) continue;
    results.push(chosen);
    placed.push({ rect: chosen.rect, kind: 'label' });
  }

  return results;
}

/**
 * ラベルの表示幅の見積り。実測（getBBox / measureText）が使えない環境の保険。
 * 日本語は約1em、英数字は約0.6em として概算する。
 */
export function estimateLabelWidth(text: string, fontSize: number): number {
  let units = 0;
  for (const char of text) {
    units += /[\x20-\x7e]/.test(char) ? 0.6 : 1;
  }
  return units * fontSize;
}
