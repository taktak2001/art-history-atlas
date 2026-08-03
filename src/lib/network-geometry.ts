export type Point = {
  x: number;
  y: number;
};

export type NetworkEdgeGeometry = {
  d: string;
  start: Point;
  end: Point;
  firstControl: Point;
  secondControl: Point;
  targetBoundary: Point;
  midX: number;
  midY: number;
  routeOffset: number;
};

export const NETWORK_SVG_SAFE_PADDING = 16;
export const NETWORK_ARROW_GAP = 4;
export const NETWORK_EDGE_CLEARANCE = 12;
export const NETWORK_PARALLEL_EDGE_SPACING = 24;
export const NETWORK_SELECTED_LABEL_PROGRESS = 0.3;

type RoutableEdge = {
  id: string;
  from: string;
  to: string;
  kind: string;
};

export function getRectangleBoundaryPoint(
  center: Point,
  toward: Point,
  width: number,
  height: number,
): Point {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  if (dx === 0 && dy === 0) return center;

  const scale = 1 / Math.max(Math.abs(dx) / (width / 2), Math.abs(dy) / (height / 2));
  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
}

export function insetPointToward(
  point: Point,
  toward: Point,
  distance: number,
): Point {
  const dx = toward.x - point.x;
  const dy = toward.y - point.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return point;

  return {
    x: point.x + (dx / length) * distance,
    y: point.y + (dy / length) * distance,
  };
}

export function getNetworkEdgeGeometry(
  fromPosition: Point,
  toPosition: Point,
  nodeWidth: number,
  nodeHeight: number,
  directed: boolean,
  arrowGap = NETWORK_ARROW_GAP,
  curveOffset = 0,
): NetworkEdgeGeometry {
  const fromCenter = {
    x: fromPosition.x + nodeWidth / 2,
    y: fromPosition.y + nodeHeight / 2,
  };
  const toCenter = {
    x: toPosition.x + nodeWidth / 2,
    y: toPosition.y + nodeHeight / 2,
  };
  const startBoundary = getRectangleBoundaryPoint(
    fromCenter,
    toCenter,
    nodeWidth,
    nodeHeight,
  );
  const targetBoundary = getRectangleBoundaryPoint(
    toCenter,
    fromCenter,
    nodeWidth,
    nodeHeight,
  );
  const start = insetPointToward(startBoundary, toCenter, 2);
  const end = directed
    ? insetPointToward(targetBoundary, fromCenter, arrowGap)
    : insetPointToward(targetBoundary, fromCenter, 2);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const unit = { x: dx / distance, y: dy / distance };
  const handle = Math.min(64, Math.max(22, distance * 0.22));
  const firstControl = {
    x: start.x + Math.sign(dx || 1) * Math.min(Math.abs(dx) * 0.42, 92),
    y: start.y + curveOffset,
  };
  const secondControl = {
    x: end.x - unit.x * handle,
    y: end.y - unit.y * handle + curveOffset,
  };
  const midX =
    start.x * 0.125 +
    firstControl.x * 0.375 +
    secondControl.x * 0.375 +
    end.x * 0.125;
  const midY =
    start.y * 0.125 +
    firstControl.y * 0.375 +
    secondControl.y * 0.375 +
    end.y * 0.125;

  return {
    d: `M ${start.x} ${start.y} C ${firstControl.x} ${firstControl.y}, ${secondControl.x} ${secondControl.y}, ${end.x} ${end.y}`,
    start,
    end,
    firstControl,
    secondControl,
    targetBoundary,
    midX,
    midY,
    routeOffset: curveOffset,
  };
}

export function getNetworkEdgeLabelPoint(
  geometry: NetworkEdgeGeometry,
  anchor: 'start' | 'middle' | 'end' = 'middle',
): Point {
  const t =
    anchor === 'start'
      ? NETWORK_SELECTED_LABEL_PROGRESS
      : anchor === 'end'
        ? 1 - NETWORK_SELECTED_LABEL_PROGRESS
        : 0.5;
  const inverse = 1 - t;

  return {
    x:
      inverse ** 3 * geometry.start.x +
      3 * inverse ** 2 * t * geometry.firstControl.x +
      3 * inverse * t ** 2 * geometry.secondControl.x +
      t ** 3 * geometry.end.x,
    y:
      inverse ** 3 * geometry.start.y +
      3 * inverse ** 2 * t * geometry.firstControl.y +
      3 * inverse * t ** 2 * geometry.secondControl.y +
      t ** 3 * geometry.end.y,
  };
}

/**
 * 長距離線の直線経路上に別ノードがある場合、線を上下の迂回レーンへ送る。
 * 近距離の関係線は直線のまま保ち、同じ区間を共有する線だけを分離する。
 */
export function getNetworkEdgeRouteOffset(
  fromPosition: Point,
  toPosition: Point,
  nodeWidth: number,
  nodeHeight: number,
  nodePositions: Iterable<Point>,
  safeTop = NETWORK_SVG_SAFE_PADDING,
): number {
  const fromCenter = {
    x: fromPosition.x + nodeWidth / 2,
    y: fromPosition.y + nodeHeight / 2,
  };
  const toCenter = {
    x: toPosition.x + nodeWidth / 2,
    y: toPosition.y + nodeHeight / 2,
  };
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  if (Math.abs(dx) < nodeWidth * 1.5) return 0;

  const minX = Math.min(fromCenter.x, toCenter.x);
  const maxX = Math.max(fromCenter.x, toCenter.x);
  const collidesWithIntermediateNode = Array.from(nodePositions).some(
    (position) => {
      if (position === fromPosition || position === toPosition) return false;
      const center = {
        x: position.x + nodeWidth / 2,
        y: position.y + nodeHeight / 2,
      };
      if (center.x <= minX + nodeWidth / 2 || center.x >= maxX - nodeWidth / 2) {
        return false;
      }

      const progress = (center.x - fromCenter.x) / dx;
      const lineY = fromCenter.y + dy * progress;
      return (
        Math.abs(center.y - lineY) <=
        nodeHeight / 2 + NETWORK_EDGE_CLEARANCE
      );
    },
  );

  if (!collidesWithIntermediateNode) return 0;

  const offset = nodeHeight + NETWORK_EDGE_CLEARANCE;
  const upperControlY = Math.min(fromCenter.y, toCenter.y) - offset;
  return upperControlY >= safeTop + NETWORK_EDGE_CLEARANCE ? -offset : offset;
}

/**
 * 同一のsource / targetを結ぶ複数の関係は、継承を中心線に残して別レーンへ分ける。
 * LOD集約によって端点が一致した場合も、色と線種を個別に追えるようにする。
 */
export function getParallelEdgeRouteOffset(
  edge: RoutableEdge,
  edges: Iterable<RoutableEdge>,
  spacing = NETWORK_PARALLEL_EDGE_SPACING,
): number {
  const parallelEdges = Array.from(edges)
    .filter(
      (candidate) =>
        candidate.from === edge.from &&
        candidate.to === edge.to,
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  if (parallelEdges.length <= 1) return 0;

  const anchor =
    parallelEdges.find((candidate) => candidate.kind === 'succession') ??
    parallelEdges[0];
  if (edge.id === anchor.id) return 0;

  const alternatives = parallelEdges.filter(
    (candidate) => candidate.id !== anchor.id,
  );
  const index = alternatives.findIndex((candidate) => candidate.id === edge.id);
  if (index < 0) return 0;

  const lane = Math.floor(index / 2) + 1;
  return (index % 2 === 0 ? -1 : 1) * lane * spacing;
}

export function getNetworkViewBox(width: number, height: number): string {
  return `0 0 ${width} ${height}`;
}
