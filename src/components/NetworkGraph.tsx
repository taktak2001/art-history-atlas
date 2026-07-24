'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Movement, Relationship, RelationKind, EraId } from '@/lib/schema';
import { RELATION_LABELS, ERA_LABELS } from '@/lib/schema';
import {
  CORE_RELATIONSHIP_DEFINITIONS,
  formatRelationshipStatement,
  IMPORTANT_RELATION_KINDS,
  isImportantRelationship,
  limitMobileRelationships,
  RELATION_LINE_STYLE,
  RELATIONSHIP_DECISION_AID,
} from '@/lib/network-presentation';
import { RELATION_COLOR } from './Badges';
import { LodControl } from '@/components/LodControl';
import {
  aggregateRelationshipsForVisibleMovements,
  filterMovementsByLod,
  getGroupMovements,
  getMovementGroup,
  type AggregatedRelationship,
} from '@/lib/movement-hierarchy';
import { useLodState } from '@/lib/use-lod-state';

type Props = {
  movements: Movement[];
  relationships: Relationship[];
  eraOrder: EraId[];
};

type RelationScope = 'important' | 'all';

type Layout = {
  positions: Map<string, { x: number; y: number }>;
  canvasW: number;
  canvasH: number;
  colStep: number;
  nodeW: number;
  nodeH: number;
  pad: number;
};

type EdgeGeometry = {
  d: string;
  midX: number;
  midY: number;
};

const ALL_KINDS = Object.keys(RELATION_LABELS) as RelationKind[];

const ERA_JUMP_LABELS: Record<EraId, string> = {
  'prehistoric-ancient': '先史',
  medieval: '中世',
  renaissance: 'ルネサンス',
  'baroque-rococo': '17〜18世紀',
  nineteenth: '19世紀',
  modern: 'モダニズム',
  postwar: '戦後',
  contemporary: '現代',
};

function LineSample({ kind, active = true }: { kind: RelationKind; active?: boolean }) {
  const style = RELATION_LINE_STYLE[kind];
  const color = RELATION_COLOR[kind];

  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      width="54"
      height="16"
      viewBox="0 0 54 16"
    >
      <line
        x1="2"
        y1="8"
        x2={style.arrow ? 45 : 52}
        y2="8"
        fill="none"
        stroke={color}
        strokeWidth={style.width}
        strokeDasharray={style.dasharray}
        strokeLinecap={style.linecap}
        opacity={active ? 1 : 0.3}
      />
      {style.arrow && (
        <path
          d="M 43 4 L 51 8 L 43 12"
          fill="none"
          stroke={color}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={active ? 1 : 0.3}
        />
      )}
    </svg>
  );
}

function getBoundaryPoint(
  from: { x: number; y: number },
  toward: { x: number; y: number },
  width: number,
  height: number,
) {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const scale = 1 / Math.max(Math.abs(dx) / (width / 2), Math.abs(dy) / (height / 2));

  return {
    x: from.x + dx * scale,
    y: from.y + dy * scale,
  };
}

function getEdgeGeometry(
  relationship: Pick<Relationship, 'from' | 'to'>,
  layout: Layout,
): EdgeGeometry | null {
  const fromPosition = layout.positions.get(relationship.from);
  const toPosition = layout.positions.get(relationship.to);
  if (!fromPosition || !toPosition) return null;

  const fromCenter = {
    x: fromPosition.x + layout.nodeW / 2,
    y: fromPosition.y + layout.nodeH / 2,
  };
  const toCenter = {
    x: toPosition.x + layout.nodeW / 2,
    y: toPosition.y + layout.nodeH / 2,
  };
  const start = getBoundaryPoint(fromCenter, toCenter, layout.nodeW, layout.nodeH);
  const end = getBoundaryPoint(toCenter, fromCenter, layout.nodeW, layout.nodeH);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return {
    d: `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`,
    midX,
    midY,
  };
}

function ArrowMarkers() {
  return (
    <defs>
      {ALL_KINDS.filter((kind) => RELATION_LINE_STYLE[kind].arrow).map((kind) => (
        <marker
          key={kind}
          id={`network-arrow-${kind}`}
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path
            d="M 1 1 L 9 5 L 1 9"
            fill="none"
            stroke={RELATION_COLOR[kind]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      ))}
    </defs>
  );
}

export function NetworkGraph({ movements, relationships, eraOrder }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [focusedEdgeId, setFocusedEdgeId] = useState<string | null>(null);
  const [activeKinds, setActiveKinds] = useState<Set<RelationKind>>(
    new Set(IMPORTANT_RELATION_KINDS),
  );
  const [relationScope, setRelationScope] = useState<RelationScope>('important');
  const [isMobile, setIsMobile] = useState(false);
  const [activeEra, setActiveEra] = useState<EraId>(eraOrder[0]);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  const { lod, setLod } = useLodState('core');

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const lodMovements = useMemo(() => {
    const base = filterMovementsByLod(movements, lod);
    const ids = new Set(base.map((movement) => movement.id));
    for (const groupId of expandedGroupIds) {
      for (const movement of getGroupMovements(groupId, movements)) {
        ids.add(movement.id);
      }
    }
    return movements.filter((movement) => ids.has(movement.id));
  }, [expandedGroupIds, lod, movements]);

  const aggregatedEdges = useMemo(
    () =>
      aggregateRelationshipsForVisibleMovements(
        relationships,
        movements,
        new Set(lodMovements.map((movement) => movement.id)),
      ),
    [lodMovements, movements, relationships],
  );

  const scopedEdges = useMemo(
    () =>
      aggregatedEdges.filter(
        (relationship) =>
          activeKinds.has(relationship.kind) &&
          (relationScope === 'all' || isImportantRelationship(relationship)),
      ),
    [activeKinds, aggregatedEdges, relationScope],
  );

  const visibleEdges = useMemo(
    () =>
      isMobile && relationScope === 'important'
        ? limitMobileRelationships(scopedEdges)
        : scopedEdges,
    [isMobile, relationScope, scopedEdges],
  );

  const displayedMovements = useMemo(() => {
    if (visibleEdges.length === 0) {
      return [...lodMovements]
        .sort((a, b) => a.dates.start - b.dates.start)
        .slice(0, isMobile ? 12 : 18);
    }

    const visibleIds = new Set(
      visibleEdges.flatMap((relationship) => [relationship.from, relationship.to]),
    );
    return lodMovements.filter((movement) => visibleIds.has(movement.id));
  }, [isMobile, lodMovements, visibleEdges]);

  const layout = useMemo<Layout>(() => {
    const colStep = isMobile ? 212 : 248;
    const rowStep = isMobile ? 84 : 88;
    const nodeW = isMobile ? 148 : 166;
    const nodeH = isMobile ? 58 : 60;
    const top = 58;
    const pad = isMobile ? 22 : 34;
    const positions = new Map<string, { x: number; y: number }>();
    let maxRows = 0;

    eraOrder.forEach((era, column) => {
      const inEra = displayedMovements
        .filter((movement) => movement.era === era)
        .sort((a, b) => a.dates.start - b.dates.start);
      maxRows = Math.max(maxRows, inEra.length);
      inEra.forEach((movement, row) => {
        positions.set(movement.id, {
          x: pad + column * colStep,
          y: top + row * rowStep,
        });
      });
    });

    return {
      positions,
      canvasW: pad * 2 + (eraOrder.length - 1) * colStep + nodeW,
      canvasH: top + Math.max(maxRows, 1) * rowStep + pad,
      colStep,
      nodeW,
      nodeH,
      pad,
    };
  }, [displayedMovements, eraOrder, isMobile]);

  const movementById = useMemo(
    () => new Map(movements.map((movement) => [movement.id, movement])),
    [movements],
  );
  const movementName = (id: string) => movementById.get(id)?.nameJa ?? id;

  const selectedNodeEdges = useMemo(
    () =>
      selectedNodeId
        ? visibleEdges.filter(
            (relationship) =>
              relationship.from === selectedNodeId || relationship.to === selectedNodeId,
          )
        : [],
    [selectedNodeId, visibleEdges],
  );

  const selectedEdge = selectedEdgeId
    ? visibleEdges.find((relationship) => relationship.id === selectedEdgeId) ?? null
    : null;

  const focusedEdge = focusedEdgeId
    ? visibleEdges.find((relationship) => relationship.id === focusedEdgeId) ?? null
    : null;

  const highlightedEdges = useMemo(() => {
    if (selectedNodeId) return selectedNodeEdges;
    if (selectedEdge) return [selectedEdge];
    if (focusedEdge) return [focusedEdge];
    return [];
  }, [focusedEdge, selectedEdge, selectedNodeEdges, selectedNodeId]);

  const selectionActive = Boolean(selectedNodeId || selectedEdge);

  const relatedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedNodeId) ids.add(selectedNodeId);
    for (const relationship of highlightedEdges) {
      ids.add(relationship.from);
      ids.add(relationship.to);
    }
    return ids;
  }, [highlightedEdges, selectedNodeId]);

  const idleLabelIds = useMemo(
    () =>
      new Set(
        visibleEdges
          .filter(isImportantRelationship)
          .slice(0, isMobile ? 3 : 8)
          .map((relationship) => relationship.id),
      ),
    [isMobile, visibleEdges],
  );

  const relationshipCountByNode = useMemo(() => {
    const counts = new Map<string, number>();
    for (const relationship of visibleEdges) {
      counts.set(
        relationship.from,
        (counts.get(relationship.from) ?? 0) + relationship.aggregateCount,
      );
      counts.set(
        relationship.to,
        (counts.get(relationship.to) ?? 0) + relationship.aggregateCount,
      );
    }
    return counts;
  }, [visibleEdges]);

  useEffect(() => {
    if (selectedNodeId && !layout.positions.has(selectedNodeId)) {
      setSelectedNodeId(null);
    }
    if (selectedEdgeId && !visibleEdges.some((edge) => edge.id === selectedEdgeId)) {
      setSelectedEdgeId(null);
    }
  }, [layout.positions, selectedEdgeId, selectedNodeId, visibleEdges]);

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollToHorizontalCenter = (x: number) => {
    const viewport = scrollRef.current;
    if (!viewport) return;
    viewport.scrollTo({
      left: Math.max(0, x - viewport.clientWidth / 2),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const centerNode = (id: string) => {
    const position = layout.positions.get(id);
    if (!position) return;
    scrollToHorizontalCenter(position.x + layout.nodeW / 2);
  };

  const centerEdge = (relationship: AggregatedRelationship) => {
    const geometry = getEdgeGeometry(relationship, layout);
    if (geometry) scrollToHorizontalCenter(geometry.midX);
  };

  const jumpToEra = (era: EraId) => {
    const column = eraOrder.indexOf(era);
    if (column < 0) return;
    setActiveEra(era);
    scrollToHorizontalCenter(layout.pad + column * layout.colStep + layout.nodeW / 2);
  };

  const selectNode = (movement: Movement) => {
    if (selectedNodeId === movement.id) {
      setSelectedNodeId(null);
      return;
    }
    setSelectedEdgeId(null);
    setSelectedNodeId(movement.id);
    setActiveEra(movement.era);
    const group = getMovementGroup(movement.id, movements);
    if (group && movement.id === group.representativeMovementId) {
      setExpandedGroupIds((current) => new Set(current).add(group.id));
    }
    window.requestAnimationFrame(() => centerNode(movement.id));
  };

  const selectEdge = (relationship: AggregatedRelationship) => {
    setSelectedNodeId(null);
    setSelectedEdgeId((current) =>
      current === relationship.id ? null : relationship.id,
    );
    setActiveEra(movementById.get(relationship.to)?.era ?? activeEra);
    window.requestAnimationFrame(() => centerEdge(relationship));
  };

  const toggleKind = (kind: RelationKind) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setActiveKinds((previous) => {
      const next = new Set(previous);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  const setScope = (scope: RelationScope) => {
    setRelationScope(scope);
    setActiveKinds(new Set(scope === 'important' ? IMPORTANT_RELATION_KINDS : ALL_KINDS));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    window.requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ left: 0, behavior: 'auto' });
    });
  };

  const handleGraphKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    event.currentTarget.scrollBy({
      left: event.key === 'ArrowLeft' ? -220 : 220,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.shiftKey) return;
    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaY;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const target = event.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) return;
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = 'true';
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    event.currentTarget.scrollLeft =
      dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX);
  };

  const stopPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current.active = false;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const selectedMovement = selectedNodeId
    ? movementById.get(selectedNodeId) ?? null
    : null;
  const selectedGroup = selectedMovement
    ? getMovementGroup(selectedMovement.id, movements)
    : undefined;

  const renderPath = (
    relationship: AggregatedRelationship,
    mode: 'base' | 'highlight',
  ) => {
    const geometry = getEdgeGeometry(relationship, layout);
    if (!geometry) return null;
    const style = RELATION_LINE_STYLE[relationship.kind];
    const dimmed = selectionActive && mode === 'base';
    const isHighlighted = mode === 'highlight';

    return (
      <path
        key={`${mode}-${relationship.id}`}
        d={geometry.d}
        fill="none"
        stroke={RELATION_COLOR[relationship.kind]}
        strokeWidth={isHighlighted ? 4.6 : dimmed ? 1.2 : style.width}
        strokeDasharray={style.dasharray}
        strokeLinecap={style.linecap}
        opacity={isHighlighted ? 1 : dimmed ? 0.075 : 0.78}
        markerEnd={style.arrow ? `url(#network-arrow-${relationship.kind})` : undefined}
        className="transition-opacity"
        data-network-edge
        data-edge-layer={mode}
        data-edge-related={
          selectionActive ? String(highlightedEdges.some((edge) => edge.id === relationship.id)) : 'idle'
        }
      />
    );
  };

  return (
    <div>
      <LodControl
        value={lod}
        onChange={(next) => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
          setExpandedGroupIds(new Set());
          setLod(next);
        }}
        counts={{
          core: filterMovementsByLod(movements, 'core').length,
          standard: filterMovementsByLod(movements, 'standard').length,
          detailed: filterMovementsByLod(movements, 'detailed').length,
        }}
      />

      <div className="sticky top-[4.25rem] z-40 -mx-4 border-y hairline bg-paper/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:px-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-muted">表示する関係</p>
            <div className="mt-1 inline-flex border hairline" aria-label="関係の表示範囲">
              {([
                ['important', '重要関係のみ'],
                ['all', 'すべて表示'],
              ] as const).map(([scope, label]) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setScope(scope)}
                  aria-pressed={relationScope === scope}
                  className={`min-h-11 px-3 text-xs font-bold ${
                    relationScope === scope
                      ? 'bg-ink text-paper underline decoration-2 underline-offset-4'
                      : 'bg-paper text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs font-bold tabular-nums text-ink" aria-live="polite">
            {visibleEdges.length}関係・{displayedMovements.length}ノード表示中
          </p>
        </div>
      </div>

      <nav className="mt-4" aria-label="ネットワークの時代ジャンプ">
        <p className="text-xs font-bold text-muted">時代へ移動</p>
        <div className="scroll-x mt-2 flex gap-1 pb-1">
          {eraOrder.map((era) => (
            <button
              key={era}
              type="button"
              onClick={() => jumpToEra(era)}
              aria-current={activeEra === era ? 'true' : undefined}
              className={`min-h-11 shrink-0 border px-3 text-xs ${
                activeEra === era
                  ? 'border-ink bg-raised font-bold text-ink underline decoration-2 underline-offset-4'
                  : 'hairline text-muted hover:text-ink'
              }`}
            >
              {ERA_JUMP_LABELS[era]}
            </button>
          ))}
        </div>
      </nav>

      <details className="mt-4 border-y hairline" open>
        <summary className="min-h-11 cursor-pointer py-3 text-xs font-bold text-muted">
          関係タイプと線種
        </summary>
        <div className="pb-4">
          <p className="text-xs leading-relaxed text-faint">
            色だけでなく、実線・破線・点線と矢印で関係の種類と方向を示します。
          </p>
          <div
            className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5"
            aria-label="関係タイプの凡例と絞り込み"
          >
            {ALL_KINDS.map((kind) => {
              const on = activeKinds.has(kind);
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => toggleKind(kind)}
                  aria-pressed={on}
                  className={`flex min-h-11 items-center gap-2 border px-2 py-1.5 text-left text-xs transition-opacity active:translate-y-px ${
                    on
                      ? 'border-ink/30 bg-raised text-ink'
                      : 'hairline bg-surface text-faint'
                  }`}
                >
                  <LineSample kind={kind} active={on} />
                  <span>{RELATION_LABELS[kind]}</span>
                </button>
              );
            })}
          </div>
          <dl className="mt-4 grid gap-3 border-t hairline pt-3 text-xs sm:grid-cols-2">
            {(['succession', 'influence'] as const).map((kind) => (
              <div key={kind}>
                <dt className="font-bold text-ink">{RELATION_LABELS[kind]}</dt>
                <dd className="mt-1 leading-relaxed text-muted">
                  {CORE_RELATIONSHIP_DEFINITIONS[kind].definition}
                </dd>
                <dd className="mt-1 text-faint">
                  判定補助: {RELATIONSHIP_DECISION_AID[kind]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </details>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p id="network-operation-help" className="text-xs leading-relaxed text-faint">
          ドラッグ、横スクロール、Shift＋ホイール、左右キーで移動。ノード選択時は自動で中央へ移動します。
        </p>
        {(selectedNodeId || selectedEdgeId) && (
          <button
            type="button"
            onClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            className="min-h-11 border hairline px-3 text-xs text-muted hover:text-ink active:translate-y-px"
          >
            選択を解除
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="scroll-x mt-3 cursor-grab touch-pan-x overflow-y-hidden border hairline bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[dragging=true]:cursor-grabbing"
        role="group"
        aria-label="美術運動の関係ネットワーク図"
        aria-describedby="network-operation-help"
        tabIndex={0}
        data-network-scope={relationScope}
        data-network-lod={lod}
        data-network-scroll
        onKeyDown={handleGraphKeyDown}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopPointerDrag}
        onPointerCancel={stopPointerDrag}
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        <div
          className="relative"
          style={{ width: layout.canvasW, height: layout.canvasH }}
          data-network-canvas
        >
          {eraOrder.map((era, column) => (
            <div
              key={era}
              className="pointer-events-none absolute z-40 text-center text-[10px] font-bold text-faint"
              style={{
                left: layout.pad + column * layout.colStep,
                top: 16,
                width: layout.nodeW,
              }}
            >
              {ERA_LABELS[era]}
            </div>
          ))}

          <svg
            className="absolute inset-0 z-0"
            width={layout.canvasW}
            height={layout.canvasH}
            aria-label="関係線。Tabキーで線を選択できます"
            data-network-layer="base-edges"
          >
            <ArrowMarkers />
            {visibleEdges.map((relationship) => {
              const geometry = getEdgeGeometry(relationship, layout);
              if (!geometry) return null;

              return (
                <g key={relationship.id} data-relation-kind={relationship.kind}>
                  {renderPath(relationship, 'base')}
                  <path
                    d={geometry.d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    role="button"
                    tabIndex={0}
                    aria-label={`${movementName(relationship.from)}から${movementName(relationship.to)}への${RELATION_LABELS[relationship.kind]}を選択`}
                    className="cursor-pointer focus:outline-none"
                    onClick={() => selectEdge(relationship)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      selectEdge(relationship);
                    }}
                    onMouseEnter={() => setFocusedEdgeId(relationship.id)}
                    onMouseLeave={() =>
                      setFocusedEdgeId((current) =>
                        current === relationship.id ? null : current,
                      )
                    }
                    onFocus={() => setFocusedEdgeId(relationship.id)}
                    onBlur={() =>
                      setFocusedEdgeId((current) =>
                        current === relationship.id ? null : current,
                      )
                    }
                    data-network-edge-hit
                  />
                </g>
              );
            })}
          </svg>

          {displayedMovements.map((movement) => {
            const position = layout.positions.get(movement.id);
            if (!position) return null;
            const isSelected = selectedNodeId === movement.id;
            const isRelated = relatedNodeIds.has(movement.id);
            const dimmed = selectionActive && !isRelated;
            const isEdgeSource = selectedEdge?.from === movement.id;
            const isEdgeTarget = selectedEdge?.to === movement.id;

            return (
              <div
                key={movement.id}
                className={`absolute ${dimmed ? 'z-10' : isRelated ? 'z-30' : 'z-20'}`}
                style={{
                  left: position.x,
                  top: position.y,
                  width: layout.nodeW,
                  height: layout.nodeH,
                }}
              >
                <button
                  type="button"
                  onClick={() => selectNode(movement)}
                  onDoubleClick={() => router.push(`/movements/${movement.id}/`)}
                  aria-pressed={isSelected}
                  aria-label={`${movement.nameJa}を選択`}
                  className={`relative flex h-full w-full flex-col justify-center bg-surface px-2 text-left text-xs transition-opacity ${
                    isSelected
                      ? 'border-2 border-accent'
                      : isEdgeSource
                        ? 'border-2 border-dashed border-ink'
                        : isEdgeTarget
                          ? 'border-[3px] border-double border-accent'
                          : isRelated
                            ? 'border-2 border-ink/70'
                            : 'border hairline hover:border-ink/40'
                  } ${dimmed ? 'opacity-20' : 'opacity-100'}`}
                  data-network-node
                  data-node-state={
                    isSelected ? 'selected' : isRelated ? 'related' : dimmed ? 'dimmed' : 'idle'
                  }
                  data-node-role={
                    isEdgeSource ? 'source' : isEdgeTarget ? 'target' : undefined
                  }
                >
                  {(isEdgeSource || isEdgeTarget) && (
                    <span className="absolute right-1 top-0.5 text-[8px] font-bold tracking-[0.08em] text-muted">
                      {isEdgeSource ? '起点' : '到達先'}
                    </span>
                  )}
                  <span className="truncate pr-7 font-serif text-ink">{movement.nameJa}</span>
                  <span className="truncate text-[10px] text-faint">
                    {movement.dates.start < 0
                      ? `前${Math.abs(movement.dates.start)}`
                      : movement.dates.start}
                    〜
                  </span>
                  {(relationshipCountByNode.get(movement.id) ?? 0) > 1 && (
                    <span className="truncate text-[9px] font-bold text-muted">
                      関連 {relationshipCountByNode.get(movement.id)}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {highlightedEdges.length > 0 && (
            <svg
              className="pointer-events-none absolute inset-0 z-20"
              width={layout.canvasW}
              height={layout.canvasH}
              aria-hidden="true"
              data-network-layer="highlighted-edges"
            >
              <ArrowMarkers />
              {highlightedEdges.map((relationship) =>
                renderPath(relationship, 'highlight'),
              )}
            </svg>
          )}

          <svg
            className="pointer-events-none absolute inset-0 z-40"
            width={layout.canvasW}
            height={layout.canvasH}
            aria-hidden="true"
            data-network-layer="edge-labels"
          >
            {visibleEdges.map((relationship) => {
              const geometry = getEdgeGeometry(relationship, layout);
              if (!geometry) return null;
              const showLabel =
                selectedEdgeId === relationship.id ||
                focusedEdgeId === relationship.id ||
                (selectedNodeId &&
                  (relationship.from === selectedNodeId ||
                    relationship.to === selectedNodeId)) ||
                (!selectionActive && idleLabelIds.has(relationship.id));
              if (!showLabel) return null;

              return (
                <text
                  key={relationship.id}
                  x={geometry.midX}
                  y={geometry.midY - 6}
                  textAnchor="middle"
                  fill={RELATION_COLOR[relationship.kind]}
                  stroke="rgb(var(--c-raised))"
                  strokeWidth="3.5"
                  strokeOpacity="0.76"
                  paintOrder="stroke"
                  fontSize="10"
                  fontWeight="700"
                  data-edge-label
                >
                  {RELATION_LABELS[relationship.kind]}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {selectedEdge && (
        <section
          className="mt-4 border-l-2 border-accent bg-surface px-4 py-3 max-sm:sticky max-sm:bottom-[calc(0.75rem+env(safe-area-inset-bottom))] max-sm:z-40"
          aria-labelledby="selected-relationship-heading"
          data-selected-relationship
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-faint">
            選択中の関係
          </p>
          <h3 id="selected-relationship-heading" className="mt-1 font-serif text-lg text-ink">
            {formatRelationshipStatement(selectedEdge, movementName)}
          </h3>
          <dl className="mt-3 grid grid-cols-[4rem_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="font-bold text-faint">起点</dt>
            <dd className="text-ink">{movementName(selectedEdge.from)}</dd>
            <dt className="font-bold text-faint">終点</dt>
            <dd className="text-ink">{movementName(selectedEdge.to)}</dd>
            <dt className="font-bold text-faint">関係</dt>
            <dd className="flex items-center gap-2 text-ink">
              <LineSample kind={selectedEdge.kind} />
              {RELATION_LABELS[selectedEdge.kind]}
            </dd>
            <dt className="font-bold text-faint">説明</dt>
            <dd className="leading-relaxed text-muted">{selectedEdge.note}</dd>
          </dl>
        </section>
      )}

      {selectedMovement && (
        <section className="mt-4 border-l-2 border-accent bg-surface px-4 py-3">
          <h3 className="font-serif text-lg">{selectedMovement.nameJa}</h3>
          <p className="mt-1 max-w-prose text-sm text-muted">{selectedMovement.summary}</p>
          {selectedGroup &&
            selectedMovement.id === selectedGroup.representativeMovementId && (
              <button
                type="button"
                onClick={() =>
                  setExpandedGroupIds((current) => {
                    const next = new Set(current);
                    if (next.has(selectedGroup.id)) next.delete(selectedGroup.id);
                    else next.add(selectedGroup.id);
                    return next;
                  })
                }
                aria-expanded={expandedGroupIds.has(selectedGroup.id)}
                className="mt-3 min-h-11 border-l-2 border-accent px-3 text-xs font-bold text-ink hover:bg-raised"
              >
                {expandedGroupIds.has(selectedGroup.id)
                  ? `${selectedGroup.label}を集約`
                  : `${selectedGroup.label}の内訳を展開`}
              </button>
            )}
          <a
            href={`/movements/${selectedMovement.id}/`}
            className="mt-2 inline-block text-sm prose-link"
          >
            詳細ページへ →
          </a>
        </section>
      )}

      <section
        className="mt-5 border-t hairline pt-4"
        aria-labelledby="relationship-list-heading"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="relationship-list-heading" className="font-serif text-lg">
            関係一覧
          </h2>
          <p className="text-xs text-faint">図と同じ表示範囲をテキストでも確認できます</p>
        </div>
        {visibleEdges.length > 0 ? (
          <ul className="mt-3 grid max-h-[28rem] gap-x-8 gap-y-3 overflow-y-auto pr-2 text-sm md:grid-cols-2">
            {visibleEdges.map((relationship) => (
              <li
                key={relationship.id}
                className="border-t hairline pt-2"
                data-relation-list-item
                data-relation-kind={relationship.kind}
              >
                <button
                  type="button"
                  onClick={() => selectEdge(relationship)}
                  aria-pressed={selectedEdgeId === relationship.id}
                  className="w-full min-h-11 text-left"
                >
                  <span className="flex items-center gap-2">
                    <LineSample kind={relationship.kind} />
                    <span className="font-bold text-ink">
                      {RELATION_LABELS[relationship.kind]}
                    </span>
                  </span>
                  <span className="mt-1 block text-ink">
                    {formatRelationshipStatement(relationship, movementName)}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {relationship.note}
                  </span>
                  {relationship.aggregateCount > 1 && (
                    <span className="mt-1 block text-[11px] font-bold text-faint">
                      {relationship.aggregateCount}件を集約
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">
            選択中の関係タイプに該当する関係はありません。
          </p>
        )}
      </section>
    </div>
  );
}
