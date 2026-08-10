export type Point = {
  x: number;
  y: number;
};

export type NetworkEdgeGeometry = {
  d: string;
  pathPoints?: Point[];
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
  /**
   * 線の進行方向に対して「垂直」へずらす量。
   * curveOffset は y にだけ加算するため横向きの線にしか効かない。
   * 縦に重なる線を分離するにはこちらを使う。
   */
  lateralOffset = 0,
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
  // 進行方向に垂直な単位ベクトル
  const perpendicular = { x: -unit.y, y: unit.x };
  const firstControl = {
    x:
      start.x +
      Math.sign(dx || 1) * Math.min(Math.abs(dx) * 0.42, 92) +
      perpendicular.x * lateralOffset,
    y: start.y + curveOffset + perpendicular.y * lateralOffset,
  };
  const secondControl = {
    x: end.x - unit.x * handle + perpendicular.x * lateralOffset,
    y: end.y - unit.y * handle + curveOffset + perpendicular.y * lateralOffset,
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

const uniquePathPoints = (points: Point[]) =>
  points.filter(
    (point, index) =>
      index === 0 ||
      point.x !== points[index - 1].x ||
      point.y !== points[index - 1].y,
  );

const metroPath = (points: Point[]) =>
  points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

/**
 * Metro-map geometry used by the historical network. Movement positions stay
 * tied to actual year and region, while the visible route is constrained to
 * horizontal and vertical corridors. The label box is not used as an edge
 * boundary: every relation meets the shared station point instead.
 */
export function getNetworkMetroEdgeGeometry(
  fromPosition: Point,
  toPosition: Point,
  nodeWidth: number,
  nodeHeight: number,
  directed: boolean,
  arrowGap = NETWORK_ARROW_GAP,
  routeOffset = 0,
  corridorOffset = 0,
): NetworkEdgeGeometry {
  const stationInset = Math.min(14, Math.max(8, nodeWidth * 0.08));
  const sourceStation = {
    x: fromPosition.x + stationInset,
    y: fromPosition.y + nodeHeight / 2,
  };
  const targetStation = {
    x: toPosition.x + stationInset,
    y: toPosition.y + nodeHeight / 2,
  };
  const direction = targetStation.x >= sourceStation.x ? 1 : -1;
  const start = insetPointToward(sourceStation, targetStation, 4);
  const targetBoundary = targetStation;
  const end = insetPointToward(
    targetBoundary,
    sourceStation,
    directed ? arrowGap + 4 : 4,
  );
  const horizontalDistance = Math.abs(end.x - start.x);
  const sameTrack = Math.abs(end.y - start.y) < 1;
  let points: Point[];

  if (sameTrack) {
    points = [start, end];
  } else if (horizontalDistance < 28) {
    const corridorX = start.x + corridorOffset;
    points = [
      start,
      { x: corridorX, y: start.y },
      { x: corridorX, y: end.y },
      end,
    ];
  } else {
    const minimumX = Math.min(start.x, end.x) + 12;
    const maximumX = Math.max(start.x, end.x) - 12;
    const corridorX = Math.max(
      minimumX,
      Math.min(
        maximumX,
        (start.x + end.x) / 2 + corridorOffset,
      ),
    );
    const routedY = start.y + routeOffset;
    const leadX = start.x + direction * Math.min(14, horizontalDistance / 4);
    points = [start];
    if (routeOffset !== 0) {
      points.push(
        { x: leadX, y: start.y },
        { x: leadX, y: routedY },
      );
    }
    points.push(
      { x: corridorX, y: routedY },
      { x: corridorX, y: end.y },
      end,
    );
  }

  points = uniquePathPoints(points);
  const middleIndex = Math.max(0, Math.floor((points.length - 1) / 2));
  const firstControl = points[Math.min(1, points.length - 1)] ?? start;
  const secondControl = points[Math.max(0, points.length - 2)] ?? end;
  const middleStart = points[middleIndex] ?? start;
  const middleEnd = points[Math.min(points.length - 1, middleIndex + 1)] ?? end;

  return {
    d: metroPath(points),
    pathPoints: points,
    start,
    end,
    firstControl,
    secondControl,
    targetBoundary,
    midX: (middleStart.x + middleEnd.x) / 2,
    midY: (middleStart.y + middleEnd.y) / 2,
    routeOffset,
  };
}

function pointOnPolyline(points: Point[], progress: number): Point {
  if (points.length < 2) return points[0] ?? { x: 0, y: 0 };
  const lengths = points.slice(1).map((point, index) =>
    Math.hypot(point.x - points[index].x, point.y - points[index].y),
  );
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  let distance = Math.max(0, Math.min(1, progress)) * totalLength;

  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index];
    if (distance <= length || index === lengths.length - 1) {
      const ratio = length === 0 ? 0 : distance / length;
      return {
        x: points[index].x + (points[index + 1].x - points[index].x) * ratio,
        y: points[index].y + (points[index + 1].y - points[index].y) * ratio,
      };
    }
    distance -= length;
  }
  return points[points.length - 1];
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

  if (geometry.pathPoints && geometry.pathPoints.length > 1) {
    return pointOnPolyline(geometry.pathPoints, t);
  }

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

/** 同じ縦の経路を共有する（＝重なって見えなくなる）エッジを分離するための間隔 */
export const NETWORK_CORRIDOR_SPACING = 22;

type PositionedEdge = {
  id: string;
  from: string;
  to: string;
};

/**
 * 同一列を縦に走るエッジ同士が完全に重なって「線が消える」のを防ぐ。
 *
 * 同じペア間の平行エッジは getParallelEdgeRouteOffset が扱うが、
 * 別ペアでも同じ列の同じ区間を通る場合（例: A→B と C→A が B を貫く）は
 * 軌道が一致してしまうため、y範囲が重なるものへ左右交互のオフセットを与える。
 */
export function getSharedCorridorOffset(
  edge: PositionedEdge,
  edges: Iterable<PositionedEdge>,
  positions: Map<string, Point>,
  spacing = NETWORK_CORRIDOR_SPACING,
): number {
  const from = positions.get(edge.from);
  const to = positions.get(edge.to);
  if (!from || !to) return 0;
  // 縦方向（同じ列）でなければ対象外
  if (Math.abs(from.x - to.x) > 1) return 0;

  const span = (a: Point, b: Point) => ({
    min: Math.min(a.y, b.y),
    max: Math.max(a.y, b.y),
  });
  const self = span(from, to);

  // 同じ列を縦に走り、y範囲が重なるエッジを集める
  const corridor = Array.from(edges)
    .filter((candidate) => {
      const candidateFrom = positions.get(candidate.from);
      const candidateTo = positions.get(candidate.to);
      if (!candidateFrom || !candidateTo) return false;
      if (Math.abs(candidateFrom.x - candidateTo.x) > 1) return false;
      if (Math.abs(candidateFrom.x - from.x) > 1) return false;
      const other = span(candidateFrom, candidateTo);
      return other.min < self.max && other.max > self.min;
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  if (corridor.length <= 1) return 0;

  const index = corridor.findIndex((candidate) => candidate.id === edge.id);
  if (index <= 0) return 0;
  // 1本目は中央のまま、以降を左右交互へ振り分ける
  const lane = Math.floor((index + 1) / 2);
  return (index % 2 === 1 ? -1 : 1) * lane * spacing;
}
