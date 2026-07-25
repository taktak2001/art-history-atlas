'use client';

import { useId, type SVGProps } from 'react';
import type { RelationKind } from '@/lib/schema';
import { RELATION_LINE_STYLE } from '@/lib/network-presentation';
import { RELATION_COLOR } from '@/lib/relationship-definitions';

export const ARROW_MARKER_SPEC = {
  width: 10,
  height: 10,
  refX: 9,
  refY: 5,
  viewBox: '0 0 10 10',
} as const;

export function relationMarkerId(prefix: string, kind: RelationKind): string {
  return `${prefix}-arrow-${kind}`;
}

export function ArrowMarkerDefs({
  idPrefix,
  kinds,
}: {
  idPrefix: string;
  kinds: RelationKind[];
}) {
  return (
    <defs>
      {kinds
        .filter((kind) => RELATION_LINE_STYLE[kind].arrow)
        .map((kind) => (
          <marker
            key={kind}
            id={relationMarkerId(idPrefix, kind)}
            viewBox={ARROW_MARKER_SPEC.viewBox}
            refX={ARROW_MARKER_SPEC.refX}
            refY={ARROW_MARKER_SPEC.refY}
            markerWidth={ARROW_MARKER_SPEC.width}
            markerHeight={ARROW_MARKER_SPEC.height}
            markerUnits="userSpaceOnUse"
            orient="auto"
            overflow="visible"
            data-arrow-marker
            data-relation-kind={kind}
          >
            <path
              d="M 0.75 1 L 9 5 L 0.75 9 Z"
              fill={RELATION_COLOR[kind]}
            />
          </marker>
        ))}
    </defs>
  );
}

type RelationLineProps = Omit<
  SVGProps<SVGPathElement>,
  'd' | 'stroke' | 'strokeWidth' | 'strokeDasharray' | 'markerEnd'
> & {
  kind: RelationKind;
  d: string;
  markerPrefix: string;
  state?: 'normal' | 'highlighted' | 'dimmed';
  mobile?: boolean;
};

export function RelationLine({
  kind,
  d,
  markerPrefix,
  state = 'normal',
  mobile = false,
  ...props
}: RelationLineProps) {
  const style = RELATION_LINE_STYLE[kind];
  const strokeWidth =
    state === 'highlighted'
      ? mobile
        ? 3.6
        : 4.6
      : state === 'dimmed'
        ? 1.1
        : mobile
          ? Math.min(style.width, 2)
          : style.width;

  return (
    <path
      {...props}
      d={d}
      fill="none"
      stroke={RELATION_COLOR[kind]}
      strokeWidth={strokeWidth}
      strokeDasharray={style.dasharray}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={state === 'highlighted' ? 1 : state === 'dimmed' ? 0.075 : 0.82}
      markerEnd={
        style.arrow ? `url(#${relationMarkerId(markerPrefix, kind)})` : undefined
      }
      data-relation-line
      data-relation-kind={kind}
      data-line-state={state}
    />
  );
}

export function RelationLineSample({
  kind,
  active = true,
}: {
  kind: RelationKind;
  active?: boolean;
}) {
  const markerPrefix = `sample-${useId().replaceAll(':', '')}`;

  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      width="60"
      height="16"
      viewBox="0 0 60 16"
      overflow="visible"
    >
      <ArrowMarkerDefs idPrefix={markerPrefix} kinds={[kind]} />
      <RelationLine
        kind={kind}
        d={`M 2 8 L ${RELATION_LINE_STYLE[kind].arrow ? 50 : 58} 8`}
        markerPrefix={markerPrefix}
        state={active ? 'normal' : 'dimmed'}
      />
    </svg>
  );
}
