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
  estimateLabelWidth,
  layoutEdgeLabels,
  type LabelInput,
  type Obstacle,
} from '@/lib/network-label-layout';
import {
  getNetworkEdgeGeometry,
  getNetworkEdgeRouteOffset,
  getNetworkViewBox,
  getParallelEdgeRouteOffset,
  getSharedCorridorOffset,
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
import { VISIBILITY_LEVEL_LABELS } from '@/lib/schema';
import { useLodState } from '@/lib/use-lod-state';
import {
  parseRelationScope,
  resolveFocusContext,
  type RelationScope,
} from '@/lib/network-focus-context';
import { parseFocus, buildFocusQuery } from '@/lib/network';
import { AccordionChevron } from '@/components/AccordionChevron';

type Props = {
  movements: Movement[];
  relationships: Relationship[];
  eraOrder: EraId[];
};

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
  // 同じ縦の経路を共有する別ペアのエッジを分離し、線が重なって消えないようにする
  const corridorOffset = getSharedCorridorOffset(
    relationship,
    visibleEdges,
    layout.positions,
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
    corridorOffset,
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
  // 詳細ページ→ネットワークの文脈（?focus=）を扱うための参照
  const selectedNodeButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusSkipSyncRef = useRef(true);
  const focusCenteredForRef = useRef<string | null>(null);
  const focusInitialFocusDoneRef = useRef(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [focusedEdgeId, setFocusedEdgeId] = useState<string | null>(null);
  const [relationKindFilter, setRelationKindFilter] =
    useState<RelationKindFilter>('all');
  const [relationScope, setRelationScope] = useState<RelationScope>('important');
  // focus ごとに自動調整を1回だけ適用する（手動変更後に戻さないため）
  const focusAutoAppliedForRef = useRef<string | null>(null);
  // URL(?focus=)由来のfocusだけを自動調整の対象にする（グラフ内クリックは対象外）
  const urlFocusRef = useRef<string | null>(null);
  const [scopeTouched, setScopeTouched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLineGuideOpen, setIsLineGuideOpen] = useState(false);
  const [activeEra, setActiveEra] = useState<EraId>(eraOrder[0]);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());
  const { lod, setLod, applyPurposeDefault, clearLod, hasExplicitChoice } =
    useLodState('core');

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const movementIds = useMemo(
    () => new Set(movements.map((movement) => movement.id)),
    [movements],
  );

  // URL の ?focus=（Movement.id）を選択状態へ反映。初回マウントと戻る/進む(popstate)で復元。
  // Next Router を介さず window.history を使い、静的export/basePathを保つ（useLodStateと同方針）。
  useEffect(() => {
    const readFocus = () => {
      const url = new URL(window.location.href);
      const raw = url.searchParams.get('focus');
      const valid = parseFocus(raw, movementIds);
      urlFocusRef.current = valid;
      setSelectedNodeId(valid);
      setSelectedEdgeId(null);
      // 無効な focus はエラーにせず、URLから静かに除去（他クエリは保持）
      if (raw && !valid) {
        url.search = buildFocusQuery(url.search, null);
        window.history.replaceState(window.history.state, '', url);
      }
    };
    readFocus();
    window.addEventListener('popstate', readFocus);
    return () => window.removeEventListener('popstate', readFocus);
  }, [movementIds]);

  const focusScopeActive = relationScope === 'focus' && Boolean(selectedNodeId);
  // 自動でLODを上げた場合だけ理由を添える（ユーザーが自分で選んだ場合は出さない）
  const [autoAdjustedLod, setAutoAdjustedLod] = useState(false);

  // 詳細ページから ?focus= で来たときの文脈（直接関係・必要LOD）
  const focusContext = useMemo(
    () => resolveFocusContext(selectedNodeId, movements, relationships),
    [movements, relationships, selectedNodeId],
  );

  // URL の ?scope= を復元（focus付きなら既定は focus）
  useEffect(() => {
    const readScope = () => {
      const raw = new URL(window.location.href).searchParams.get('scope');
      const parsed = parseRelationScope(raw, 'important');
      if (raw) {
        setRelationScope(parsed);
        setScopeTouched(true);
      }
    };
    readScope();
    window.addEventListener('popstate', readScope);
    return () => window.removeEventListener('popstate', readScope);
  }, []);

  // focus 付き遷移の初期状態だけを自動調整する。
  // 直接関係を欠落なく出せる最小LODへ上げ、表示関係を「このムーブメント」にする。
  // 手動変更後や、同じfocusでの再適用はしない。
  useEffect(() => {
    if (!focusContext) return;
    // 詳細ページからの遷移（URLのfocus）に限定する
    if (focusContext.focusId !== urlFocusRef.current) return;
    if (focusAutoAppliedForRef.current === focusContext.focusId) return;
    focusAutoAppliedForRef.current = focusContext.focusId;
    applyPurposeDefault(focusContext.requiredLod);
    setAutoAdjustedLod(!hasExplicitChoice && focusContext.requiredLod !== 'core');
    if (!scopeTouched) setRelationScope('focus');
  }, [applyPurposeDefault, focusContext, hasExplicitChoice, scopeTouched]);

  // scope を URL(?scope=) へ反映（focus/lod と共有・復元できるように）
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (relationScope === 'important') params.delete('scope');
    else params.set('scope', relationScope);
    const next = params.toString();
    if (next !== new URLSearchParams(url.search).toString()) {
      url.search = next;
      window.history.replaceState(window.history.state, '', url);
    }
  }, [relationScope]);

  // 選択状態の変化を URL(?focus=) に反映（他クエリは保持）。初回の同期はURL読取と競合するため1回だけ抑止。
  useEffect(() => {
    if (focusSkipSyncRef.current) {
      focusSkipSyncRef.current = false;
      return;
    }
    const url = new URL(window.location.href);
    const nextSearch = buildFocusQuery(url.search, selectedNodeId);
    if (nextSearch !== new URLSearchParams(url.search).toString()) {
      url.search = nextSearch;
      window.history.replaceState(window.history.state, '', url);
    }
  }, [selectedNodeId]);

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
    // 詳細ページからの deep-link（?focus=）先が現在のLODで隠れていても必ず表示する
    if (selectedNodeId) ids.add(selectedNodeId);
    // 「このムーブメント」表示では、直接関係するノードはLODに関わらず必ず含める
    if (focusScopeActive && focusContext) {
      for (const id of focusContext.directNodeIds) ids.add(id);
    }
    return movements.filter((movement) => ids.has(movement.id));
  }, [expandedGroupIds, focusContext, focusScopeActive, lod, movements, selectedNodeId]);

  const aggregatedEdges = useMemo(
    () =>
      aggregateRelationshipsForVisibleMovements(
        relationships,
        movements,
        new Set(lodMovements.map((movement) => movement.id)),
      ),
    [lodMovements, movements, relationships],
  );

  const scopedEdges = useMemo(() => {
    // 「このムーブメント」表示では、focus へ直接つながる関係を
    // importance や LOD を理由に落とさない（関係タイプの手動選択のみ適用）。
    if (focusScopeActive && focusContext) {
      return focusContext.directEdges
        .filter(
          (relationship) =>
            relationKindFilter === 'all' || relationship.kind === relationKindFilter,
        )
        .map((relationship) => ({
          ...relationship,
          aggregateCount: 1,
          originalRelationshipIds: [relationship.id],
          hasDirectRelationship: true,
        }));
    }
    return aggregatedEdges.filter(
      (relationship) =>
        (relationKindFilter === 'all' ||
          relationship.kind === relationKindFilter) &&
        (relationScope === 'all' || isImportantRelationship(relationship)),
    );
  }, [
    aggregatedEdges,
    focusContext,
    focusScopeActive,
    relationKindFilter,
    relationScope,
  ]);

  const visibleEdges = useMemo(
    () =>
      isMobile && relationScope === 'important'
        ? limitMobileRelationships(scopedEdges)
        : scopedEdges,
    [isMobile, relationScope, scopedEdges],
  );

  const displayedMovements = useMemo(() => {
    const base =
      visibleEdges.length === 0
        ? [...lodMovements]
            .sort((a, b) => a.dates.start - b.dates.start)
            .slice(0, isMobile ? 12 : 18)
        : (() => {
            const visibleIds = new Set(
              visibleEdges.flatMap((relationship) => [
                relationship.from,
                relationship.to,
              ]),
            );
            return lodMovements.filter((movement) => visibleIds.has(movement.id));
          })();

    // フォーカス中のノードは関係が絞り込まれていても必ず表示（位置を確保し自動解除を防ぐ）
    if (selectedNodeId && !base.some((movement) => movement.id === selectedNodeId)) {
      const focused = movements.find((movement) => movement.id === selectedNodeId);
      if (focused) return [...base, focused];
    }
    return base;
  }, [isMobile, lodMovements, movements, selectedNodeId, visibleEdges]);

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

  // deep-link/戻る等でURLから選択されたノードを中央へ寄せ、初回のみキーボードフォーカスを移す。
  useEffect(() => {
    if (!selectedNodeId) {
      focusCenteredForRef.current = null;
      return;
    }
    if (!layout.positions.has(selectedNodeId)) return;
    if (focusCenteredForRef.current !== selectedNodeId) {
      focusCenteredForRef.current = selectedNodeId;
      window.requestAnimationFrame(() => centerNode(selectedNodeId));
    }
    if (!focusInitialFocusDoneRef.current && selectedNodeButtonRef.current) {
      focusInitialFocusDoneRef.current = true;
      selectedNodeButtonRef.current.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId, layout]);

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

  const labelFontSize = isMobile ? 11 : 10;

  /**
   * 関係ラベルの配置。中点固定をやめ、線の近くで衝突しない位置を選ぶ。
   * 選択ノード直結 → 1ホップ内 → その他 の順に位置を確定し、
   * 先に重要なラベルへ読める場所を与える。
   * 依存は選択・LOD・scope・レイアウト（=リサイズ/回転を含む）だけなので、
   * スクロール中に毎フレーム再計算されない。
   */
  const edgeLabelPlacements = useMemo(() => {
    const entries = visibleEdges
      .map((relationship) => {
        const geometry = getEdgeGeometry(relationship, layout, visibleEdges);
        if (!geometry) return null;
        const showLabel =
          selectedEdgeId === relationship.id ||
          focusedEdgeId === relationship.id ||
          (selectedNodeId &&
            (relationship.from === selectedNodeId ||
              relationship.to === selectedNodeId)) ||
          (!selectionActive && idleLabelIds.has(relationship.id));
        if (!showLabel) return null;

        const touchesSelection =
          selectedNodeId === relationship.from || selectedNodeId === relationship.to;
        const anchorSide: 'start' | 'middle' | 'end' =
          selectedNodeId === relationship.from
            ? 'start'
            : selectedNodeId === relationship.to
              ? 'end'
              : 'middle';
        const inSubgraph = Boolean(
          focusContext &&
            focusContext.directNodeIds.has(relationship.from) &&
            focusContext.directNodeIds.has(relationship.to),
        );
        const text = RELATION_LABELS[relationship.kind];
        return {
          relationship,
          geometry,
          anchor: anchorSide,
          input: {
            id: relationship.id,
            geometry,
            width: estimateLabelWidth(text, labelFontSize) + 6,
            height: labelFontSize + 4,
            priority: touchesSelection ? 0 : inSubgraph ? 1 : 2,
          } satisfies LabelInput,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (entries.length === 0) return [];

    // ノード矩形（タイトル・年代を含む枠）を障害物にする
    const obstacles: Obstacle[] = displayedMovements.flatMap((movement) => {
      const position = layout.positions.get(movement.id);
      if (!position) return [];
      return [
        {
          rect: {
            x: position.x,
            y: position.y,
            width: layout.nodeW,
            height: layout.nodeH,
          },
          kind: 'node' as const,
        },
      ];
    });
    // 矢印先端付近も避ける
    for (const entry of entries) {
      obstacles.push({
        rect: {
          x: entry.geometry.targetBoundary.x - 7,
          y: entry.geometry.targetBoundary.y - 7,
          width: 14,
          height: 14,
        },
        kind: 'arrow' as const,
      });
    }

    const placements = layoutEdgeLabels(
      entries.map((entry) => entry.input),
      obstacles,
      { x: 0, y: 0, width: layout.canvasW, height: layout.canvasH },
    );
    const byId = new Map(entries.map((entry) => [entry.relationship.id, entry]));
    return placements.flatMap((placement) => {
      const entry = byId.get(placement.id);
      return entry
        ? [{ placement, relationship: entry.relationship, anchor: entry.anchor }]
        : [];
    });
  }, [
    displayedMovements,
    focusContext,
    focusedEdgeId,
    idleLabelIds,
    labelFontSize,
    layout,
    selectedEdgeId,
    selectedNodeId,
    selectionActive,
    visibleEdges,
  ]);

  const setKindFilter = (kind: RelationKindFilter) => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setRelationKindFilter(kind);
  };

  const setScope = (scope: RelationScope) => {
    setRelationScope(scope);
    setScopeTouched(true);
    setRelationKindFilter('all');
    // 「このムーブメント」は選択ノードが前提なので選択を保持する
    if (scope !== 'focus') {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
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
      <p className="sr-only" role="status" aria-live="polite">
        {selectedMovement
          ? `${selectedMovement.nameJa}を選択中。直接関係${selectedNodeEdges.length}件`
          : '選択なし'}
      </p>
      <section className="network-controls" aria-label="ネットワーク表示設定">
        <LodControl
          value={lod}
          onChange={(next) => {
            // focus中はLODを手動変更しても選択を保持する
            // （focusノードと直接関係はLODに関わらず表示し続ける）
            if (!selectedNodeId) setSelectedNodeId(null);
            setSelectedEdgeId(null);
            setExpandedGroupIds(new Set());
            setLod(next);
          }}
          counts={{
            core: filterMovementsByLod(movements, 'core').length,
            standard: filterMovementsByLod(movements, 'standard').length,
            detailed: filterMovementsByLod(movements, 'detailed').length,
          }}
          catalogue
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
                ...(selectedNodeId
                  ? ([['focus', 'このムーブメント', '選択したムーブメントの直接関係のみ']] as const)
                  : []),
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
              線の見方
              <AccordionChevron open={isLineGuideOpen} />
            </summary>
            <div
              id="network-line-guide-panel"
              className="network-line-guide__panel"
              tabIndex={0}
              aria-label="関係線の詳しい見方"
            >
              <p className="text-xs leading-relaxed text-muted">
                線の形と説明を見比べながら、ムーブメント同士がなぜ結ばれているかを確認できます。
              </p>
              <ul className="network-line-guide__legend" aria-label="関係タイプの凡例">
                {ALL_KINDS.map((kind) => (
                  <li key={kind}>
                    <RelationLineSample kind={kind} />
                    <span>
                      <span className="block font-bold text-ink">
                        {RELATIONSHIP_DEFINITIONS[kind].label}
                      </span>
                      <span
                        className="network-line-guide__description block text-faint"
                        data-relationship-legend-description
                      >
                        {RELATIONSHIP_DEFINITIONS[kind].legendDescription}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          <p className="network-controls__count" aria-live="polite">
            {focusScopeActive && focusContext
              ? `直接関係${focusContext.directEdges.length}件・${focusContext.relatedNodeCount}ノード表示中`
              : `${visibleEdges.length}関係・${displayedMovements.length}ノード表示中`}
          </p>
          {focusScopeActive && focusContext && autoAdjustedLod && !hasExplicitChoice && (
            <p className="network-controls__auto-note">
              表示に合わせて「{VISIBILITY_LEVEL_LABELS[focusContext.requiredLod]}」へ自動調整
            </p>
          )}
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
              // 自動調整を巻き戻し、全体表示の既定へ戻す
              setRelationScope('important');
              setScopeTouched(false);
              focusAutoAppliedForRef.current = null;
              if (!hasExplicitChoice) clearLod();
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
                className={`absolute ${
                  isSelected
                    ? 'z-[35]'
                    : dimmed
                      ? 'z-10'
                      : isRelated
                        ? 'z-30'
                        : 'z-20'
                }`}
                style={{
                  left: position.x,
                  top: position.y,
                  width: layout.nodeW,
                  height: layout.nodeH,
                }}
              >
                <button
                  ref={isSelected ? selectedNodeButtonRef : undefined}
                  type="button"
                  onClick={(event) => {
                    if (event.detail > 1) return;
                    selectNode(movement);
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${movement.nameJa}を選択`}
                  className="network-node relative flex h-full w-full flex-col justify-center px-2 text-left text-xs"
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
                  <span
                    className="network-node__title truncate pr-7 font-serif text-ink"
                    data-network-node-title
                  >
                    {movement.nameJa}
                  </span>
                  <span
                    className="network-node__date truncate text-[10px] text-faint"
                    data-network-node-date
                  >
                    {movement.dates.start < 0
                      ? `前${Math.abs(movement.dates.start)}`
                      : movement.dates.start}
                    〜
                  </span>
                  {isSelected && (relationshipCountByNode.get(movement.id) ?? 0) > 1 && (
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
            {edgeLabelPlacements.map(({ placement, relationship, anchor }) => {
              const text = RELATION_LABELS[relationship.kind];
              return (
                <g key={relationship.id}>
                  {/* 線から離して置いた場合は、どのエッジのラベルか分かるよう引き出し線を描く */}
                  {placement.needsLeader && (
                    <line
                      x1={placement.anchor.x}
                      y1={placement.anchor.y}
                      x2={placement.x}
                      y2={placement.y}
                      stroke={RELATION_COLOR[relationship.kind]}
                      strokeWidth="1"
                      strokeOpacity="0.5"
                      data-edge-label-leader
                    />
                  )}
                  {/* 線が文字を貫通しないための小さな紙色バックプレート（pillにしない） */}
                  <rect
                    x={placement.rect.x}
                    y={placement.rect.y}
                    width={placement.rect.width}
                    height={placement.rect.height}
                    fill="rgb(var(--c-raised))"
                    fillOpacity="0.88"
                    data-edge-label-backplate
                  />
                  <text
                    x={placement.x}
                    y={placement.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={RELATION_COLOR[relationship.kind]}
                    fontSize={labelFontSize}
                    fontWeight="700"
                    data-edge-label
                    data-edge-label-anchor={anchor}
                  >
                    {text}
                  </text>
                </g>
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
