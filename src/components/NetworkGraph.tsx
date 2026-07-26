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
import Link from 'next/link';
import type { Movement, Relationship, RelationKind, EraId } from '@/lib/schema';
import { RELATION_LABELS, ERA_LABELS } from '@/lib/schema';
import {
  formatRelationshipStatement,
  isImportantRelationship,
  limitMobileRelationships,
  RELATION_LINE_STYLE,
} from '@/lib/network-presentation';
import {
  RELATION_COLOR,
  RELATIONSHIP_DEFINITIONS,
  RELATION_KINDS,
} from '@/lib/relationship-definitions';
import { LodControl } from '@/components/LodControl';
import {
  ArrowMarkerDefs,
  RelationLine,
  RelationLineSample,
} from '@/components/RelationLine';
import {
  getNetworkEdgeGeometry,
  getNetworkEdgeRouteOffset,
  getNetworkViewBox,
  getParallelEdgeRouteOffset,
  NETWORK_SVG_SAFE_PADDING,
  type NetworkEdgeGeometry,
} from '@/lib/network-geometry';
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
type RelationKindFilter = 'all' | RelationKind;

type Layout = {
  positions: Map<string, { x: number; y: number }>;
  canvasW: number;
  canvasH: number;
  colStep: number;
  nodeW: number;
  nodeH: number;
  pad: number;
  safePad: number;
};

const ALL_KINDS = RELATION_KINDS;

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

function getEdgeGeometry(
  relationship: AggregatedRelationship,
  layout: Layout,
  visibleEdges: AggregatedRelationship[],
): NetworkEdgeGeometry | null {
  const fromPosition = layout.positions.get(relationship.from);
  const toPosition = layout.positions.get(relationship.to);
  if (!fromPosition || !toPosition) return null;
  const obstacleOffset = getNetworkEdgeRouteOffset(
    fromPosition,
    toPosition,
    layout.nodeW,
    layout.nodeH,
    layout.positions.values(),
    layout.safePad,
  );
  const parallelOffset = getParallelEdgeRouteOffset(
    relationship,
    visibleEdges,
  );
  const routeOffset =
    obstacleOffset === 0
      ? parallelOffset
      : obstacleOffset + Math.sign(obstacleOffset) * Math.abs(parallelOffset);

  return getNetworkEdgeGeometry(
    fromPosition,
    toPosition,
    layout.nodeW,
    layout.nodeH,
    RELATION_LINE_STYLE[relationship.kind].arrow,
    undefined,
    routeOffset,
  );
}

export function NetworkGraph({ movements, relationships, eraOrder }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lineGuideRef = useRef<HTMLDetailsElement | null>(null);
  const lineGuideSummaryRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
  });
  const scrollRafRef = useRef<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [focusedEdgeId, setFocusedEdgeId] = useState<string | null>(null);
  const [relationKindFilter, setRelationKindFilter] =
    useState<RelationKindFilter>('all');
  const [relationScope, setRelationScope] = useState<RelationScope>('important');
  const [isMobile, setIsMobile] = useState(false);
  const [isLineGuideOpen, setIsLineGuideOpen] = useState(false);
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

  useEffect(() => {
    if (!isLineGuideOpen) return;

    const closeLineGuide = () => {
      if (lineGuideRef.current) {
        lineGuideRef.current.open = false;
      }
      setIsLineGuideOpen(false);
    };

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (
        event.target instanceof Node &&
        !lineGuideRef.current?.contains(event.target)
      ) {
        closeLineGuide();
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      closeLineGuide();
      lineGuideSummaryRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLineGuideOpen]);

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
          (relationKindFilter === 'all' ||
            relationship.kind === relationKindFilter) &&
          (relationScope === 'all' || isImportantRelationship(relationship)),
      ),
    [aggregatedEdges, relationKindFilter, relationScope],
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
    const safePad = NETWORK_SVG_SAFE_PADDING;
    const endPanSpace = isMobile ? 220 : 700;
    const positions = new Map<string, { x: number; y: number }>();
    let maxRows = 0;

    eraOrder.forEach((era, column) => {
      const inEra = displayedMovements
        .filter((movement) => movement.era === era)
        .sort((a, b) => a.dates.start - b.dates.start);
      maxRows = Math.max(maxRows, inEra.length);
      inEra.forEach((movement, row) => {
        positions.set(movement.id, {
          x: safePad + pad + column * colStep,
          y: safePad + top + row * rowStep,
        });
      });
    });

    return {
      positions,
      canvasW:
        safePad * 2 +
        pad * 2 +
        (eraOrder.length - 1) * colStep +
        nodeW +
        endPanSpace,
      canvasH:
        safePad * 2 + top + Math.max(maxRows, 1) * rowStep + pad,
      colStep,
      nodeW,
      nodeH,
      pad,
      safePad,
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
    const geometry = getEdgeGeometry(relationship, layout, visibleEdges);
    if (geometry) scrollToHorizontalCenter(geometry.midX);
  };

  const jumpToEra = (era: EraId) => {
    const column = eraOrder.indexOf(era);
    if (column < 0) return;
    setActiveEra(era);
    scrollToHorizontalCenter(
      layout.safePad + layout.pad + column * layout.colStep + layout.nodeW / 2,
    );
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

  const setKindFilter = (kind: RelationKindFilter) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setRelationKindFilter(kind);
  };

  const setScope = (scope: RelationScope) => {
    setRelationScope(scope);
    setRelationKindFilter('all');
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    window.requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ left: 0, behavior: 'auto' });
    });
  };

  const handleGraphScroll = () => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const viewport = scrollRef.current;
      if (!viewport) return;
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let nearestEra = eraOrder[0];
      let nearestDistance = Number.POSITIVE_INFINITY;

      eraOrder.forEach((era, column) => {
        const eraCenter =
          layout.safePad +
          layout.pad +
          column * layout.colStep +
          layout.nodeW / 2;
        const distance = Math.abs(eraCenter - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestEra = era;
        }
      });

      setActiveEra((current) => (current === nearestEra ? current : nearestEra));
    });
  };

  useEffect(
    () => () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    },
    [],
  );

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
    const geometry = getEdgeGeometry(relationship, layout, visibleEdges);
    if (!geometry) return null;
    const dimmed = selectionActive && mode === 'base';
    const isHighlighted = mode === 'highlight';

    return (
      <RelationLine
        key={`${mode}-${relationship.id}`}
        kind={relationship.kind}
        d={geometry.d}
        markerPrefix={mode}
        state={isHighlighted ? 'highlighted' : dimmed ? 'dimmed' : 'normal'}
        mobile={isMobile}
        className="transition-opacity"
        data-network-edge
        data-network-edge-id={relationship.id}
        data-route-offset={String(geometry.routeOffset)}
        data-edge-layer={mode}
        data-edge-related={
          selectionActive ? String(highlightedEdges.some((edge) => edge.id === relationship.id)) : 'idle'
        }
      />
    );
  };

  return (
    <div className="network-ui">
      <section className="network-controls" aria-label="ネットワーク表示設定">
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
          compact
        />

        <div className="network-controls__row">
          <div className="network-scope-control">
            <span className="network-control-label">表示関係</span>
            <div
              className="network-scope-options"
              role="group"
              aria-label="関係の表示範囲"
            >
              {([
                ['important', '重要関係', '重要関係のみ'],
                ['all', 'すべて', 'すべて表示'],
              ] as const).map(([scope, label, accessibleLabel]) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setScope(scope)}
                  aria-pressed={relationScope === scope}
                  aria-label={accessibleLabel}
                  className="network-scope-option"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="network-kind-filter">
            <span>関係タイプ</span>
            <select
              value={relationKindFilter}
              onChange={(event) =>
                setKindFilter(event.target.value as RelationKindFilter)
              }
              aria-label="表示する関係タイプ"
            >
              <option value="all">すべて</option>
              {ALL_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {RELATION_LABELS[kind]}
                </option>
              ))}
            </select>
          </label>

          <details
            ref={lineGuideRef}
            className="network-line-guide"
            onToggle={(event) => setIsLineGuideOpen(event.currentTarget.open)}
          >
            <summary
              ref={lineGuideSummaryRef}
              aria-controls="network-line-guide-panel"
              aria-expanded={isLineGuideOpen}
            >
              線の見方 <span aria-hidden="true">ⓘ</span>
            </summary>
            <div
              id="network-line-guide-panel"
              className="network-line-guide__panel"
              tabIndex={0}
              aria-label="関係線の詳しい見方"
            >
              <p className="text-xs leading-relaxed text-muted">
                色だけでなく、線種・矢印・名称を組み合わせて関係を示します。
              </p>
              <ul className="network-line-guide__legend" aria-label="関係タイプの凡例">
                {ALL_KINDS.map((kind) => (
                  <li key={kind}>
                    <RelationLineSample kind={kind} />
                    <span>
                      <span className="block font-bold text-ink">
                        {RELATIONSHIP_DEFINITIONS[kind].label}
                      </span>
                      <span className="block text-faint">
                        {RELATIONSHIP_DEFINITIONS[kind].shortDefinition}
                      </span>
                    </span>
                    <span className="text-faint">
                      {RELATIONSHIP_DEFINITIONS[kind].visualEncoding.lineLabel}
                      {' / '}
                      {RELATIONSHIP_DEFINITIONS[kind].visualEncoding.arrow
                        ? '有向'
                        : '無向'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          <p className="network-controls__count" aria-live="polite">
            {visibleEdges.length}関係・{displayedMovements.length}ノード表示中
          </p>
        </div>

      </section>

      <div className="network-operation-row">
        <p id="network-operation-help" className="text-xs leading-relaxed text-faint">
          <span className="sm:hidden">
            横にスワイプして移動。ノードをタップして関係を表示
          </span>
          <span className="hidden sm:inline">
            ドラッグ・横スクロール・左右キーで移動
          </span>
        </p>
        {(selectedNodeId || selectedEdgeId) && (
          <button
            type="button"
            onClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            className="network-clear-selection"
          >
            選択を解除
          </button>
        )}
      </div>

      <nav className="network-era-nav" aria-label="ネットワークの時代移動">
        <div className="scroll-x flex h-full items-stretch">
          {eraOrder.map((era) => (
            <button
              key={era}
              type="button"
              onClick={() => jumpToEra(era)}
              aria-current={activeEra === era ? 'true' : undefined}
              className="network-era-nav__button"
            >
              {ERA_JUMP_LABELS[era]}
            </button>
          ))}
        </div>
      </nav>

      <div
        ref={scrollRef}
        className="network-scroll scroll-x cursor-grab touch-pan-x overflow-y-hidden border hairline bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[dragging=true]:cursor-grabbing"
        role="group"
        aria-label="美術運動の関係ネットワーク図"
        aria-describedby="network-operation-help"
        tabIndex={0}
        data-network-scope={relationScope}
        data-network-lod={lod}
        data-network-mobile={isMobile}
        data-network-scroll
        onKeyDown={handleGraphKeyDown}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopPointerDrag}
        onPointerCancel={stopPointerDrag}
        onScroll={handleGraphScroll}
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
                left:
                  layout.safePad + layout.pad + column * layout.colStep,
                top: layout.safePad,
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
            viewBox={getNetworkViewBox(layout.canvasW, layout.canvasH)}
            overflow="visible"
            aria-label="関係線。Tabキーで線を選択できます"
            data-network-layer="base-edges"
            data-safe-padding={layout.safePad}
          >
            <ArrowMarkerDefs idPrefix="base" kinds={ALL_KINDS} />
            {visibleEdges.map((relationship) => {
              const geometry = getEdgeGeometry(
                relationship,
                layout,
                visibleEdges,
              );
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
                  onClick={(event) => {
                    if (event.detail > 1) return;
                    selectNode(movement);
                  }}
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
              viewBox={getNetworkViewBox(layout.canvasW, layout.canvasH)}
              overflow="visible"
              aria-hidden="true"
              data-network-layer="highlighted-edges"
              data-safe-padding={layout.safePad}
            >
              <ArrowMarkerDefs idPrefix="highlight" kinds={ALL_KINDS} />
              {highlightedEdges.map((relationship) =>
                renderPath(relationship, 'highlight'),
              )}
            </svg>
          )}

          <svg
            className="pointer-events-none absolute inset-0 z-40"
            width={layout.canvasW}
            height={layout.canvasH}
            viewBox={getNetworkViewBox(layout.canvasW, layout.canvasH)}
            overflow="visible"
            aria-hidden="true"
            data-network-layer="edge-labels"
          >
            {visibleEdges.map((relationship) => {
              const geometry = getEdgeGeometry(
                relationship,
                layout,
                visibleEdges,
              );
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
              <RelationLineSample kind={selectedEdge.kind} />
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
          <Link
            href={`/movements/${selectedMovement.id}/`}
            className="mt-2 inline-block text-sm prose-link"
          >
            詳細ページへ →
          </Link>
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
                  aria-describedby={`relationship-definition-${relationship.id}`}
                  className="w-full min-h-11 text-left"
                >
                  <span className="flex items-center gap-2">
                    <RelationLineSample kind={relationship.kind} />
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
                  <span
                    id={`relationship-definition-${relationship.id}`}
                    className="sr-only"
                  >
                    {RELATIONSHIP_DEFINITIONS[relationship.kind].shortDefinition}
                  </span>
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
