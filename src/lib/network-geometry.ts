export type Point = {
  x: number;
  y: number;
};

export type NetworkEdgeGeometry = {
  d: string;
  start: Point;
  end: Point;
  targetBoundary: Point;
  midX: number;
  midY: number;
};

export const NETWORK_SVG_SAFE_PADDING = 16;
export const NETWORK_ARROW_GAP = 4;

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
    y: start.y,
  };
  const secondControl = {
    x: end.x - unit.x * handle,
    y: end.y - unit.y * handle,
  };

  return {
    d: `M ${start.x} ${start.y} C ${firstControl.x} ${firstControl.y}, ${secondControl.x} ${secondControl.y}, ${end.x} ${end.y}`,
    start,
    end,
    targetBoundary,
    midX: (start.x + end.x) / 2,
    midY: (start.y + end.y) / 2,
  };
}

export function getNetworkViewBox(width: number, height: number): string {
  return `0 0 ${width} ${height}`;
}
