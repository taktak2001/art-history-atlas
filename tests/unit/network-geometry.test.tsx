import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArrowMarkerDefs, RelationLine } from '@/components/RelationLine';
import {
  getNetworkEdgeGeometry,
  getNetworkViewBox,
  getRectangleBoundaryPoint,
  NETWORK_ARROW_GAP,
  NETWORK_SVG_SAFE_PADDING,
} from '@/lib/network-geometry';
import { RELATION_LINE_STYLE } from '@/lib/network-presentation';
import { RELATION_LABELS, type RelationKind } from '@/lib/schema';

const ALL_KINDS = Object.keys(RELATION_LABELS) as RelationKind[];

describe('network geometry', () => {
  it('矩形ノードの外周との交点を返す', () => {
    expect(
      getRectangleBoundaryPoint({ x: 50, y: 50 }, { x: 150, y: 50 }, 80, 40),
    ).toEqual({ x: 90, y: 50 });
    expect(
      getRectangleBoundaryPoint({ x: 50, y: 50 }, { x: 50, y: 150 }, 80, 40),
    ).toEqual({ x: 50, y: 70 });
  });

  it('有向線の終点をノード外周から矢印余白分だけ手前に置く', () => {
    const geometry = getNetworkEdgeGeometry(
      { x: 0, y: 0 },
      { x: 200, y: 40 },
      100,
      60,
      true,
    );
    const gap = Math.hypot(
      geometry.targetBoundary.x - geometry.end.x,
      geometry.targetBoundary.y - geometry.end.y,
    );

    expect(gap).toBeCloseTo(NETWORK_ARROW_GAP, 5);
    expect(geometry.end.x).toBeLessThan(geometry.targetBoundary.x);
  });

  it('描画領域に16pxの安全余白定数を持つ', () => {
    expect(NETWORK_SVG_SAFE_PADDING).toBe(16);
    expect(getNetworkViewBox(1200, 640)).toBe('0 0 1200 640');
  });
});

describe('shared relation markers', () => {
  it('全有向関係だけにuserSpaceOnUseのmarkerを定義する', () => {
    const { container } = render(
      <svg>
        <ArrowMarkerDefs idPrefix="test" kinds={ALL_KINDS} />
      </svg>,
    );
    const markers = Array.from(container.querySelectorAll('marker'));
    const directedKinds = ALL_KINDS.filter(
      (kind) => RELATION_LINE_STYLE[kind].arrow,
    );

    expect(markers).toHaveLength(directedKinds.length);
    for (const marker of markers) {
      expect(marker).toHaveAttribute('markerUnits', 'userSpaceOnUse');
      expect(marker).toHaveAttribute('markerWidth', '10');
      expect(marker).toHaveAttribute('markerHeight', '10');
      expect(marker).toHaveAttribute('refX', '9');
      expect(marker).toHaveAttribute('refY', '5');
      expect(marker).toHaveAttribute('orient', 'auto');
      expect(marker).toHaveAttribute('overflow', 'visible');
    }
  });

  it('有向線にmarkerを付け、無向線には付けない', () => {
    const { container } = render(
      <svg>
        <RelationLine
          kind="succession"
          d="M 0 0 L 100 0"
          markerPrefix="test"
        />
        <RelationLine
          kind="contemporary"
          d="M 0 10 L 100 10"
          markerPrefix="test"
        />
      </svg>,
    );
    const directed = container.querySelector(
      '[data-relation-kind="succession"]',
    );
    const undirected = container.querySelector(
      '[data-relation-kind="contemporary"]',
    );

    expect(directed).toHaveAttribute(
      'marker-end',
      'url(#test-arrow-succession)',
    );
    expect(undirected).not.toHaveAttribute('marker-end');
  });

  it('通常時と選択時で同じmarkerを再利用し、線幅だけを変える', () => {
    const { container } = render(
      <svg>
        <ArrowMarkerDefs idPrefix="test" kinds={['reaction']} />
        <RelationLine
          kind="reaction"
          d="M 0 0 L 100 0"
          markerPrefix="test"
        />
        <RelationLine
          kind="reaction"
          d="M 0 10 L 100 10"
          markerPrefix="test"
          state="highlighted"
        />
      </svg>,
    );
    const lines = container.querySelectorAll(
      '[data-relation-kind="reaction"][data-relation-line]',
    );

    expect(lines[0]).toHaveAttribute('marker-end', lines[1].getAttribute('marker-end'));
    expect(lines[0]).toHaveAttribute('stroke-width', '2.8');
    expect(lines[1]).toHaveAttribute('stroke-width', '4.6');
    expect(container.querySelectorAll('marker')).toHaveLength(1);
  });
});
