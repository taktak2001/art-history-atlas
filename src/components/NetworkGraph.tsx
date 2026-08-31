'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
  type CSSProperties,
} from 'react';
import Link from 'next/link';
import type { Movement, Relationship, RelationKind, EraId } from '@/lib/schema';
import { RELATION_LABELS, REGION_LABELS } from '@/lib/schema';
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
import {
  DEFAULT_NETWORK_MODE,
  NETWORK_MODES,
  NETWORK_MODE_LABELS,
  NETWORK_MODE_PRESET,
  NETWORK_MODE_PURPOSES,
  edgeEmphasis,
  nodeEmphasis,
  parseNetworkMode,
  type NetworkMode,
} from '@/lib/network-mode';
import {
  ArrowMarkerDefs,
  RelationLine,
  RelationLineSample,
} from '@/components/RelationLine';
import {
  estimateLabelWidth,
  layoutEdgeLabels,
  segmentIntersectsRect,
  type LabelInput,
  type Obstacle,
} from '@/lib/network-label-layout';
import {
  getCollisionAvoidingNetworkMetroEdgeGeometry,
  getNetworkEdgeRouteOffset,
  getNetworkViewBox,
  getParallelEdgeRouteOffset,
  getSharedCorridorOffset,
  NETWORK_SVG_SAFE_PADDING,
  type NetworkEdgeGeometry,
  type NetworkRouteObstacle,
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
import { MovementPicker } from '@/components/MovementPicker';
import { artistsOf, formatDateRange, regionOrder, worksOf } from '@/lib/dataset';
import { regionRgb } from '@/lib/timeline-region-presentation';
import {
  buildChronologicalNetworkLayout,
  clampNetworkZoom,
  getNetworkFitZoom,
  networkNodeProminence,
  getNetworkVisualBounds,
  NETWORK_ZOOM_MAX,
  NETWORK_ZOOM_MIN,
  NETWORK_OVERVIEW_ZOOM_MIN,
  networkSemanticLevelForLod,
  selectNetworkOverviewLabelIds,
  selectNetworkOverviewMovements,
  type ChronologicalNetworkLayout,
  type NetworkVisualBounds,
  type NetworkVisualRect,
} from '@/lib/network-map-layout';
import {
  SURVEY_TICKS,
  timelineModeById,
  timelineXToYear,
  yearToTimelineX,
  formatTimelineYearLabel,
} from '@/lib/timeline-presentation';

type Props = {
  movements: Movement[];
  relationships: Relationship[];
  eraOrder: EraId[];
};

type RelationKindFilter = 'all' | RelationKind;

type Layout = ChronologicalNetworkLayout;

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

const ERA_TIME_RANGES: Array<{
  era: EraId;
  start: number;
  end: number;
  jumpYear: number;
}> = [
  { era: 'prehistoric-ancient', start: -40_000, end: 500, jumpYear: -480 },
  { era: 'medieval', start: 500, end: 1400, jumpYear: 1000 },
  { era: 'renaissance', start: 1400, end: 1600, jumpYear: 1450 },
  { era: 'baroque-rococo', start: 1600, end: 1750, jumpYear: 1650 },
  { era: 'nineteenth', start: 1750, end: 1900, jumpYear: 1820 },
  { era: 'modern', start: 1900, end: 1945, jumpYear: 1915 },
  { era: 'postwar', start: 1945, end: 1980, jumpYear: 1960 },
  { era: 'contemporary', start: 1980, end: 2027, jumpYear: 2000 },
];

const MOBILE_REGION_LABELS: Partial<Record<Movement['regionIds'][number], string>> = {
  germany: '中央ヨーロッパ',
  mediterranean: '地中海・古代',
  'pan-european': 'ヨーロッパ',
  global: '国際',
};

function getEdgeGeometry(
  relationship: AggregatedRelationship,
  layout: Layout,
  visibleEdges: AggregatedRelationship[],
  textObstacles: readonly NetworkRouteObstacle[] = [],
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

  return getCollisionAvoidingNetworkMetroEdgeGeometry({
    fromPosition,
    toPosition,
    nodeWidth: layout.nodeW,
    nodeHeight: layout.nodeH,
    directed: RELATION_LINE_STYLE[relationship.kind].arrow,
    routeOffset,
    corridorOffset,
    stationY: layout.stationY,
    obstacles: textObstacles,
  });
}

const ORBIT_POINTS = [
  { x: 130, y: 22, textX: 130, textY: 10, anchor: 'middle' as const },
  { x: 226, y: 76, textX: 236, textY: 80, anchor: 'start' as const },
  { x: 130, y: 130, textX: 130, textY: 148, anchor: 'middle' as const },
  { x: 34, y: 76, textX: 24, textY: 80, anchor: 'end' as const },
];

function NetworkLocalOrbit({
  movement,
  edges,
  movementById,
}: {
  movement: Movement;
  edges: AggregatedRelationship[];
  movementById: ReadonlyMap<string, Movement>;
}) {
  const orbitEdges = edges.slice(0, ORBIT_POINTS.length);
  if (orbitEdges.length === 0) return null;

  return (
    <figure className="network-detail-orbit" data-network-detail-orbit>
      <figcaption>LOCAL ORBIT</figcaption>
      <svg
        viewBox="0 0 260 156"
        role="img"
        aria-label={`${movement.nameJa}と直接関係するムーブメント`}
      >
        <title>{movement.nameJa}の直接関係</title>
        {orbitEdges.map((relationship, index) => {
          const point = ORBIT_POINTS[index];
          const otherId =
            relationship.from === movement.id
              ? relationship.to
              : relationship.from;
          const other = movementById.get(otherId);
          return (
            <g key={relationship.id} data-orbit-relation={relationship.kind}>
              <line
                x1="130"
                y1="76"
                x2={point.x}
                y2={point.y}
                stroke={RELATION_COLOR[relationship.kind]}
                strokeWidth="1.5"
                strokeDasharray={RELATION_LINE_STYLE[relationship.kind].dasharray}
                strokeLinecap="round"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="rgb(var(--c-paper))"
                stroke="rgb(var(--c-ink) / 0.72)"
                strokeWidth="1.25"
              />
              <text
                x={point.textX}
                y={point.textY}
                textAnchor={point.anchor}
                className="network-detail-orbit__label"
              >
                {other?.shortLabel ?? other?.nameJa ?? otherId}
              </text>
            </g>
          );
        })}
        <circle
          cx="130"
          cy="76"
          r="6"
          fill="rgb(var(--c-ink))"
          stroke="rgb(var(--c-paper))"
          strokeWidth="2"
        />
        <text x="130" y="96" textAnchor="middle" className="network-detail-orbit__center-label">
          {movement.shortLabel}
        </text>
      </svg>
    </figure>
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
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const lastNodeActivationRef = useRef({ id: '', at: 0 });
  const scrollRafRef = useRef<number | null>(null);
  const eraJumpTimerRef = useRef<number | null>(null);
  const eraJumpLockRef = useRef<EraId | null>(null);
  const zoomAnchorRef = useRef<{
    year: number;
    screenX: number;
    scrollTop: number;
  } | null>(null);
  const pendingCameraFitRef = useRef<{
    kind: 'overview' | 'focus';
    pass: number;
    allowWhileSelected: boolean;
  } | null>(null);
  const overviewFitAppliedRef = useRef(false);
  const focusFitAppliedForRef = useRef<string | null>(null);
  const cameraChangedAfterFocusRef = useRef(false);
  const returnToOverviewOnClearRef = useRef(false);
  // 詳細ページ→ネットワークの文脈（?focus=）を扱うための参照
  const selectedNodeButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusSkipSyncRef = useRef(true);
  const focusInitialFocusDoneRef = useRef(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNodeIdRef = useRef<string | null>(null);
  selectedNodeIdRef.current = selectedNodeId;
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
  const [networkZoom, setNetworkZoom] = useState(NETWORK_ZOOM_MIN);
  const [mode, setModeState] = useState<NetworkMode>(DEFAULT_NETWORK_MODE);
  const urlLodExplicitRef = useRef<boolean | null>(null);
  const modePreset = NETWORK_MODE_PRESET[mode];
  // 初期値は最小の収録範囲。モード/URLを読んだ後に確定させる（初回描画を軽く保つ）
  const { lod, setLod, applyPurposeDefault, clearLod, hasExplicitChoice } =
    useLodState('core');

  useLayoutEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // ?mode= を単一の共有状態として扱う。?focus= だけが来た場合はFOCUSとして開く。
  //
  // カメラの自動フィットは useLayoutEffect で走るので、こちらも layout effect にする。
  // passive effect のままだと、モードの倍率を入れる前に俯瞰フィットが要求され、
  // その2パス目に倍率を奪われる（STUDYで開いても9%まで引かれてしまう）。
  useLayoutEffect(() => {
    const readMode = () => {
      const params = new URL(window.location.href).searchParams;
      const parsed = parseNetworkMode(params.get('mode'));
      const next = parsed ?? (params.get('focus') ? 'focus' : DEFAULT_NETWORK_MODE);
      setModeState(next);

      // 起動時のカメラ。?focus= があるときは focus 側の自動調整に任せる。
      if (params.get('focus')) return;
      const { camera } = NETWORK_MODE_PRESET[next];
      if (typeof camera !== 'number') return;
      // 俯瞰へのフィットはOVERVIEWのものにする。
      // 倍率を持つモードで開いたときに、後から俯瞰へ引き戻されないようにする。
      overviewFitAppliedRef.current = true;
      setNetworkZoom(clampNetworkZoom(camera));
    };
    readMode();
    window.addEventListener('popstate', readMode);
    return () => window.removeEventListener('popstate', readMode);
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerTriggerRef = useRef<HTMLButtonElement | null>(null);

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

  // URL(?mode=)で開いた場合も収録範囲をモードに合わせる。
  // ただし ?lod= を明示していればそちらを尊重する（deep linkを壊さない）。
  useEffect(() => {
    // 入口のURLで ?lod= を明示していれば、そちらを最優先する（deep linkを壊さない）。
    // 判定は初回に一度だけ。以後のモード変更が自分の書いた ?lod= に阻まれないようにする。
    if (urlLodExplicitRef.current === null) {
      urlLodExplicitRef.current = Boolean(
        new URL(window.location.href).searchParams.get('lod'),
      );
    }
    if (urlLodExplicitRef.current) return;
    applyPurposeDefault(NETWORK_MODE_PRESET[mode].lod);
  }, [applyPurposeDefault, mode]);

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

  // Information density follows the explicit LOD control. Camera zoom only
  // changes how much of the historical map is visible.
  const semanticLevel = networkSemanticLevelForLod(lod);
  const overviewPresentation =
    mode === 'overview' && !selectedNodeId && !selectedEdgeId;

  const editorialDegreeByNode = useMemo(() => {
    const degrees = new Map<string, number>();
    for (const relationship of relationships) {
      degrees.set(relationship.from, (degrees.get(relationship.from) ?? 0) + 1);
      degrees.set(relationship.to, (degrees.get(relationship.to) ?? 0) + 1);
    }
    return degrees;
  }, [relationships]);

  const editorialBridgeByNode = useMemo(() => {
    const bridgeCounts = new Map<string, number>();
    const movementById = new Map(movements.map((movement) => [movement.id, movement]));
    for (const relationship of relationships) {
      const from = movementById.get(relationship.from);
      const to = movementById.get(relationship.to);
      if (!from || !to) continue;
      const crossesEra = from.era !== to.era;
      const crossesRegion =
        (from.regionIds[0] ?? 'other') !== (to.regionIds[0] ?? 'other');
      if (!crossesEra && !crossesRegion) continue;
      bridgeCounts.set(from.id, (bridgeCounts.get(from.id) ?? 0) + 1);
      bridgeCounts.set(to.id, (bridgeCounts.get(to.id) ?? 0) + 1);
    }
    return bridgeCounts;
  }, [movements, relationships]);

  const displayedMovements = useMemo(() => {
    const overviewBase =
      semanticLevel === 'overview'
        ? selectNetworkOverviewMovements(
            lodMovements,
            editorialDegreeByNode,
            16,
          )
        : lodMovements;
    const ids = new Set(overviewBase.map((movement) => movement.id));

    // An explicit relation-type filter must not yield an empty map merely
    // because both endpoints fell outside the compact overview landmarks.
    // Keep the normal overview quiet, but reveal the endpoints the user
    // explicitly asked to inspect.
    if (relationKindFilter !== 'all') {
      for (const relationship of scopedEdges) {
        ids.add(relationship.from);
        ids.add(relationship.to);
      }
    }

    // A focus remains a local map even when the camera is still at overview
    // scale. Keep the selected station and every direct destination visible.
    if (selectedNodeId) {
      ids.add(selectedNodeId);
      for (const relationship of scopedEdges) {
        if (
          relationship.from === selectedNodeId ||
          relationship.to === selectedNodeId
        ) {
          ids.add(relationship.from);
          ids.add(relationship.to);
        }
      }
    }

    return movements
      .filter((movement) => ids.has(movement.id))
      .sort(
        (a, b) => a.dates.start - b.dates.start || a.id.localeCompare(b.id),
      );
  }, [
    editorialDegreeByNode,
    lodMovements,
    movements,
    relationKindFilter,
    scopedEdges,
    selectedNodeId,
    semanticLevel,
  ]);

  const displayedMovementIds = useMemo(
    () => new Set(displayedMovements.map((movement) => movement.id)),
    [displayedMovements],
  );

  const overviewLandmarkIds = useMemo(
    () =>
      selectNetworkOverviewLabelIds(
        displayedMovements,
        editorialDegreeByNode,
        editorialBridgeByNode,
      ),
    [displayedMovements, editorialBridgeByNode, editorialDegreeByNode],
  );

  const visibleEdges = useMemo(() => {
    const withinMap = scopedEdges.filter(
      (relationship) =>
        displayedMovementIds.has(relationship.from) &&
        displayedMovementIds.has(relationship.to) &&
        (semanticLevel !== 'overview' ||
          selectedNodeId ||
          isImportantRelationship(relationship)),
    );
    return isMobile && relationScope === 'important'
      ? limitMobileRelationships(withinMap)
      : withinMap;
  }, [
    displayedMovementIds,
    isMobile,
    relationScope,
    scopedEdges,
    selectedNodeId,
    semanticLevel,
  ]);

  const layoutFocusNodeIds = useMemo(() => {
    if (!selectedNodeId && !selectedEdgeId) return undefined;
    const direct = new Set<string>();
    if (selectedNodeId) direct.add(selectedNodeId);
    const selectedRelationship = selectedEdgeId
      ? visibleEdges.find((relationship) => relationship.id === selectedEdgeId)
      : undefined;
    if (selectedRelationship) {
      direct.add(selectedRelationship.from);
      direct.add(selectedRelationship.to);
    }
    if (selectedNodeId) {
      for (const relationship of visibleEdges) {
        if (
          relationship.from === selectedNodeId ||
          relationship.to === selectedNodeId
        ) {
          direct.add(relationship.from);
          direct.add(relationship.to);
        }
      }
    }
    const focusIds = new Set(direct);
    for (const relationship of visibleEdges) {
      if (direct.has(relationship.from) || direct.has(relationship.to)) {
        focusIds.add(relationship.from);
        focusIds.add(relationship.to);
      }
    }
    return focusIds;
  }, [selectedEdgeId, selectedNodeId, visibleEdges]);

  const layout = useMemo<Layout>(
    () =>
      buildChronologicalNetworkLayout({
        movements: displayedMovements,
        regionOrder,
        zoom: networkZoom,
        compact: isMobile,
        safePad: NETWORK_SVG_SAFE_PADDING,
        focusNodeIds: layoutFocusNodeIds,
        overview: overviewPresentation,
      }),
    [
      displayedMovements,
      isMobile,
      layoutFocusNodeIds,
      networkZoom,
      overviewPresentation,
    ],
  );

  const visibleSurveyTicks = useMemo(() => {
    if (!overviewPresentation) return SURVEY_TICKS;
    const minimumGap = isMobile ? 42 : 52;
    const mode = timelineModeById('survey');
    const priority = [
      SURVEY_TICKS[0],
      SURVEY_TICKS.at(-1)!,
      1400,
      1900,
      1600,
      1750,
      -3000,
      1950,
      2000,
      500,
    ];
    const selected: number[] = [];
    for (const tick of priority) {
      const x = yearToTimelineX(tick, mode, layout.timelineW);
      if (
        selected.every(
          (existing) =>
            Math.abs(yearToTimelineX(existing, mode, layout.timelineW) - x) >=
            minimumGap,
        )
      ) {
        selected.push(tick);
      }
    }
    return selected.sort((a, b) => a - b);
  }, [isMobile, layout.timelineW, overviewPresentation]);

  const overviewLabelOffsets = useMemo(() => {
    const offsets = new Map<string, number>();
    if (!overviewPresentation) return offsets;
    const placed: NetworkVisualRect[] = [];
    const labels = displayedMovements
      .filter((movement) => overviewLandmarkIds.has(movement.id))
      .flatMap((movement) => {
        const position = layout.positions.get(movement.id);
        return position ? [{ movement, position }] : [];
      })
      .sort(
        (a, b) =>
          a.position.y - b.position.y ||
          a.position.x - b.position.x ||
          a.movement.id.localeCompare(b.movement.id),
      );

    for (const { movement, position } of labels) {
      // These values mirror the compact Overview label's rendered box. The
      // label is not scaled with the map, so offsets are expressed in screen
      // pixels as well. Wider steps keep close editorial anchors legible at
      // the mobile fit scale without changing the underlying station layout.
      const candidates = [0, 16, -16, 32, -32, 48, -48];
      const offset =
        candidates.find((candidate) => {
          const rect = {
            x: position.x + 19,
            y: position.y + layout.stationY - 40 + candidate,
            width: 124,
            height: 28,
          };
          return placed.every(
            (other) =>
              rect.x + rect.width + 4 <= other.x ||
              rect.x >= other.x + other.width + 4 ||
              rect.y + rect.height + 4 <= other.y ||
              rect.y >= other.y + other.height + 4,
          );
        }) ?? 0;
      offsets.set(movement.id, offset);
      placed.push({
        x: position.x + 19,
        y: position.y + layout.stationY - 40 + offset,
        width: 124,
        height: 28,
      });
    }
    return offsets;
  }, [displayedMovements, layout, overviewLandmarkIds, overviewPresentation]);

  useLayoutEffect(() => {
    const anchor = zoomAnchorRef.current;
    const viewport = scrollRef.current;
    if (!anchor || !viewport) return;
    zoomAnchorRef.current = null;
    const worldX =
      layout.safePad +
      layout.axisW +
      layout.pad +
      yearToTimelineX(anchor.year, timelineModeById('survey'), layout.timelineW);
    viewport.scrollLeft = Math.max(
      0,
      Math.min(worldX - anchor.screenX, viewport.scrollWidth - viewport.clientWidth),
    );
    viewport.scrollTop = Math.max(
      0,
      Math.min(anchor.scrollTop, viewport.scrollHeight - viewport.clientHeight),
    );
  }, [layout]);

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

  const secondHopNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedNodeId) return ids;
    for (const relationship of visibleEdges) {
      if (
        relatedNodeIds.has(relationship.from) ||
        relatedNodeIds.has(relationship.to)
      ) {
        if (!relatedNodeIds.has(relationship.from)) ids.add(relationship.from);
        if (!relatedNodeIds.has(relationship.to)) ids.add(relationship.to);
      }
    }
    return ids;
  }, [relatedNodeIds, visibleEdges, selectedNodeId]);

  /**
   * 強弱づけのための2ホップ先。
   *
   * 表示中の線ではなく収録関係の全体から求める。「このムーブメント」表示では
   * 直接関係しか線が出ないため、visibleEdges から数えると2ホップが常に空になり、
   * FOCUSで「直接 / 2ホップ / それ以外」の3段が作れない。
   * レーンの圧縮や node-state は従来どおり表示中の線に基づくので、ここには混ぜない。
   */
  const emphasisSecondHopIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedNodeId) return ids;
    for (const relationship of aggregatedEdges) {
      if (
        relatedNodeIds.has(relationship.from) ||
        relatedNodeIds.has(relationship.to)
      ) {
        if (!relatedNodeIds.has(relationship.from)) ids.add(relationship.from);
        if (!relatedNodeIds.has(relationship.to)) ids.add(relationship.to);
      }
    }
    return ids;
  }, [aggregatedEdges, relatedNodeIds, selectedNodeId]);

  const nodeTextObstacles = useMemo<NetworkRouteObstacle[]>(() => {
    return displayedMovements.flatMap((movement) => {
      const position = layout.positions.get(movement.id);
      if (!position) return [];
      const isSelected = movement.id === selectedNodeId;
      const contentVisible =
        isSelected ||
        (overviewPresentation
          ? overviewLandmarkIds.has(movement.id)
          : (!layoutFocusNodeIds || layoutFocusNodeIds.has(movement.id)) &&
            (networkZoom >= 0.52 || overviewLandmarkIds.has(movement.id)));
      if (!contentVisible) return [];

      const padding = isSelected ? 10 : 7;
      const overviewOffset = overviewLabelOffsets.get(movement.id) ?? 0;
      const labelWidth = isSelected
        ? Math.max(layout.nodeW - 18, 160)
        : networkZoom < 0.52
          ? Math.max(layout.nodeW - 18, 124)
          : Math.max(56, layout.nodeW - 18);
      const labelHeight = isSelected
        ? 44
        : semanticLevel === 'overview'
          ? 28
          : 31;
      const labelBottom = position.y + layout.stationY - 12 + overviewOffset;
      return [{
        id: movement.id,
        rect: {
          x: position.x + 18 - padding,
          y: labelBottom - labelHeight - padding,
          width: labelWidth + padding * 2,
          height: labelHeight + padding * 2,
        },
      }];
    });
  }, [
    displayedMovements,
    layout,
    layoutFocusNodeIds,
    networkZoom,
    overviewPresentation,
    overviewLandmarkIds,
    overviewLabelOffsets,
    selectedNodeId,
    semanticLevel,
  ]);

  const idleLabelIds = useMemo(
    () => {
      if (semanticLevel === 'overview') return new Set<string>();
      return new Set(
        visibleEdges
          .filter(isImportantRelationship)
          .slice(0, isMobile ? 3 : 8)
          .map((relationship) => relationship.id),
      );
    },
    [isMobile, semanticLevel, visibleEdges],
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
  }, [layout.positions, visibleEdges, selectedEdgeId, selectedNodeId]);

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollToCenter = (x: number, y?: number) => {
    const viewport = scrollRef.current;
    if (!viewport) return;
    viewport.scrollTo({
      left: Math.max(0, x - viewport.clientWidth / 2),
      top: y === undefined ? viewport.scrollTop : Math.max(0, y - viewport.clientHeight / 2),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const centerEdge = (relationship: AggregatedRelationship) => {
    const geometry = getEdgeGeometry(
      relationship,
      layout,
      visibleEdges,
      nodeTextObstacles,
    );
    if (geometry) scrollToCenter(geometry.midX, geometry.midY);
  };

  const jumpToEra = (era: EraId) => {
    const band = ERA_TIME_RANGES.find((candidate) => candidate.era === era);
    if (!band) return;
    cameraChangedAfterFocusRef.current = true;
    eraJumpLockRef.current = era;
    if (eraJumpTimerRef.current !== null) {
      window.clearTimeout(eraJumpTimerRef.current);
    }
    eraJumpTimerRef.current = window.setTimeout(() => {
      eraJumpLockRef.current = null;
      eraJumpTimerRef.current = null;
    }, 700);
    setActiveEra(era);
    const viewport = scrollRef.current;
    if (viewport && networkZoom < 0.72) {
      zoomAnchorRef.current = {
        year: band.jumpYear,
        screenX:
          layout.axisW + Math.max(0, viewport.clientWidth - layout.axisW) / 2,
        scrollTop: viewport.scrollTop,
      };
      setNetworkZoom(0.72);
      return;
    }
    scrollToCenter(
      layout.safePad +
        layout.axisW +
        layout.pad +
        yearToTimelineX(
          band.jumpYear,
          timelineModeById('survey'),
          layout.timelineW,
        ),
    );
  };

  const selectNode = (movement: Movement) => {
    const now = performance.now();
    if (
      lastNodeActivationRef.current.id === movement.id &&
      now - lastNodeActivationRef.current.at < 450
    ) {
      return;
    }
    lastNodeActivationRef.current = { id: movement.id, at: now };
    if (selectedNodeId === movement.id) {
      returnToOverviewOnClearRef.current = !cameraChangedAfterFocusRef.current;
      setSelectedNodeId(null);
      return;
    }
    cameraChangedAfterFocusRef.current = false;
    focusFitAppliedForRef.current = null;
    setSelectedEdgeId(null);
    setSelectedNodeId(movement.id);
    setActiveEra(movement.era);
    const group = getMovementGroup(movement.id, movements);
    if (group && movement.id === group.representativeMovementId) {
      setExpandedGroupIds((current) => new Set(current).add(group.id));
    }
  };

  const selectEdge = (relationship: AggregatedRelationship) => {
    setSelectedNodeId(null);
    setSelectedEdgeId((current) =>
      current === relationship.id ? null : relationship.id,
    );
    setActiveEra(movementById.get(relationship.to)?.era ?? activeEra);
    window.requestAnimationFrame(() => centerEdge(relationship));
  };

  // 注釈として読める大きさを確保する（縮小より配置で衝突を解く方針）
  const labelFontSize = semanticLevel === 'overview' ? 8 : 12;
  const showRelationLabels = modePreset.relationLabels;

  /**
   * 関係ラベルの配置。中点固定をやめ、線の近くで衝突しない位置を選ぶ。
   * 選択ノード直結 → 1ホップ内 → その他 の順に位置を確定し、
   * 先に重要なラベルへ読める場所を与える。
   * 依存は選択・LOD・scope・レイアウト（=リサイズ/回転を含む）だけなので、
   * スクロール中に毎フレーム再計算されない。
   */
  const edgeLabelPlacements = useMemo(() => {
    // OVERVIEWは線より配置を読むモードなので、関係ラベルは原則出さない
    if (!showRelationLabels) return [];
    const entries = visibleEdges
      .map((relationship) => {
        const geometry = getEdgeGeometry(
          relationship,
          layout,
          visibleEdges,
          nodeTextObstacles,
        );
        if (!geometry) return null;
        const showLabel =
          selectedEdgeId === relationship.id ||
          focusedEdgeId === relationship.id ||
          (selectedNodeId &&
            (relationship.from === selectedNodeId ||
              relationship.to === selectedNodeId)) ||
          // STUDY以上では、選択が無くても主要関係の意味を線の途中に出す
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
            // SVG text rendering differs slightly between Japanese fallback
            // fonts, especially on iOS. Reserve a real visual gutter so the
            // collision solver never treats touching glyph boxes as separate.
            width: estimateLabelWidth(text, labelFontSize) + 12,
            height: labelFontSize + 8,
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
      return [{
        rect: {
          x: position.x,
          y: position.y,
          width: layout.nodeW,
          height: layout.nodeH,
        },
        kind: 'node' as const,
      }];
    });
    for (const obstacle of nodeTextObstacles) {
      obstacles.push({ rect: obstacle.rect, kind: 'node' });
    }
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
      {
        x: layout.visualGutter,
        y: layout.visualGutter,
        width: Math.max(1, layout.canvasW - layout.visualGutter * 2),
        height: Math.max(1, layout.canvasH - layout.visualGutter * 2),
      },
    );
    const byId = new Map(entries.map((entry) => [entry.relationship.id, entry]));
    return placements.flatMap((placement) => {
      const entry = byId.get(placement.id);
      if (!entry) return [];
      const showLeader =
        placement.needsLeader &&
        !obstacles.some(
          (obstacle) =>
            obstacle.kind === 'node' &&
            segmentIntersectsRect(placement.anchor, { x: placement.x, y: placement.y }, obstacle.rect),
        );
      return [{
        placement,
        relationship: entry.relationship,
        anchor: entry.anchor,
        showLeader,
      }];
    });
  }, [
    showRelationLabels,
    displayedMovements,
    focusContext,
    focusedEdgeId,
    idleLabelIds,
    labelFontSize,
    layout,
    nodeTextObstacles,
    selectedEdgeId,
    selectedNodeId,
    selectionActive,
    visibleEdges,
  ]);

  const getCameraBounds = (nodeIds?: Set<string>): NetworkVisualBounds => {
    const rects: NetworkVisualRect[] = [];
    for (const movement of displayedMovements) {
      if (nodeIds && !nodeIds.has(movement.id)) continue;
      const position = layout.positions.get(movement.id);
      if (!position) continue;
      if (overviewPresentation) {
        // Overview fits the actual station mark for every movement. Only the
        // five editorial labels reserve text space; hidden cards must not make
        // the camera believe that the atlas is wider or taller than it looks.
        rects.push({
          x: position.x + 2,
          y: position.y + layout.stationY - 7,
          width: 48,
          height: 14,
        });
        if (overviewLandmarkIds.has(movement.id)) {
          const overviewOffset = overviewLabelOffsets.get(movement.id) ?? 0;
          rects.push({
            x: position.x + 19,
            y: position.y + layout.stationY - 40 + overviewOffset,
            width: 124,
            height: 28,
          });
        }
        continue;
      }
      const prominence = networkNodeProminence(
        movement,
        editorialDegreeByNode.get(movement.id) ?? 0,
      );
      const compactLabelWidth =
        networkZoom < 0.52 && (prominence === 'hub' || prominence === 'major')
          ? prominence === 'hub'
            ? 124
            : 108
          : 0;
      rects.push({
        x: position.x - 4,
        y: position.y - 4,
        width: Math.max(layout.nodeW, compactLabelWidth) + 8,
        height: layout.nodeH + 8,
      });
    }

    if (overviewPresentation) {
      for (const lane of layout.lanes) {
        rects.push({
          x: layout.safePad + layout.axisW,
          y: lane.top,
          width: 1,
          height: lane.height,
        });
      }
    }

    for (const relationship of visibleEdges) {
      if (
        nodeIds &&
        (!nodeIds.has(relationship.from) || !nodeIds.has(relationship.to))
      ) {
        continue;
      }
      const geometry = getEdgeGeometry(
        relationship,
        layout,
        visibleEdges,
        nodeTextObstacles,
      );
      if (!geometry) continue;
      const points = geometry.pathPoints ?? [
        geometry.start,
        geometry.end,
        geometry.firstControl,
        geometry.secondControl,
        geometry.targetBoundary,
      ];
      const minX = Math.min(...points.map((point) => point.x));
      const minY = Math.min(...points.map((point) => point.y));
      const maxX = Math.max(...points.map((point) => point.x));
      const maxY = Math.max(...points.map((point) => point.y));
      // 12px includes the marker head and the highlighted stroke.
      rects.push({
        x: minX - 12,
        y: minY - 12,
        width: maxX - minX + 24,
        height: maxY - minY + 24,
      });
    }

    for (const { placement, relationship } of edgeLabelPlacements) {
      if (
        nodeIds &&
        (!nodeIds.has(relationship.from) || !nodeIds.has(relationship.to))
      ) {
        continue;
      }
      rects.push(placement.rect);
    }

    return getNetworkVisualBounds(rects, layout.visualGutter);
  };

  const overviewCameraBounds = useMemo(
    () => getCameraBounds(),
    // getCameraBounds is intentionally derived from these stable layout inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayedMovements, edgeLabelPlacements, editorialDegreeByNode, layout, networkZoom, nodeTextObstacles, overviewLabelOffsets, overviewLandmarkIds, overviewPresentation, visibleEdges],
  );
  const focusedCameraBounds = useMemo(
    () => getCameraBounds(relatedNodeIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayedMovements, edgeLabelPlacements, editorialDegreeByNode, layout, networkZoom, nodeTextObstacles, relatedNodeIds, visibleEdges],
  );

  // Edge nodes need extra scrollable space while focused. This is camera
  // travel room, not part of the historical-map bounds, so overview fit still
  // uses only the visible visual bounds. Without it, right/bottom nodes cannot
  // reach the centre of the viewport once the desktop detail panel opens.
  const focusPanReserveX = selectedNodeId ? (isMobile ? 340 : 720) : 0;
  const focusPanReserveY = selectedNodeId ? (isMobile ? 320 : 560) : 0;
  const canvasWidth = Math.ceil(
    Math.max(layout.canvasW, overviewCameraBounds.maxX + layout.visualGutter) +
      focusPanReserveX,
  );
  const canvasHeight = Math.ceil(
    Math.max(layout.canvasH, overviewCameraBounds.maxY + layout.visualGutter) +
      focusPanReserveY,
  );

  const centerCameraBounds = (
    bounds: NetworkVisualBounds,
    behavior: ScrollBehavior,
    kind: 'overview' | 'focus',
  ) => {
    const viewport = scrollRef.current;
    if (!viewport) return;
    const contentWidth = Math.max(1, viewport.clientWidth - layout.axisW);
    const contentHeight = Math.max(1, viewport.clientHeight - layout.headerH);
    const screenCenterX = layout.axisW + contentWidth / 2;
    const screenCenterY = layout.headerH + contentHeight / 2;
    const selectedPosition = selectedNodeId
      ? layout.positions.get(selectedNodeId)
      : undefined;
    const anchorX =
      kind === 'focus' && selectedPosition
        ? selectedPosition.x + layout.nodeW / 2
        : (bounds.minX + bounds.maxX) / 2;
    const anchorY =
      kind === 'focus' && selectedPosition
        ? selectedPosition.y + layout.nodeH / 2
        : (bounds.minY + bounds.maxY) / 2;
    const left = anchorX - screenCenterX;
    const top = anchorY - screenCenterY;
    viewport.scrollTo({
      left: Math.max(0, Math.min(left, viewport.scrollWidth - viewport.clientWidth)),
      top: Math.max(0, Math.min(top, viewport.scrollHeight - viewport.clientHeight)),
      behavior,
    });
  };

  const requestCameraFit = (
    kind: 'overview' | 'focus',
    allowWhileSelected = false,
  ) => {
    if (
      kind === 'overview' &&
      selectedNodeIdRef.current &&
      !allowWhileSelected
    ) {
      return;
    }
    const viewport = scrollRef.current;
    if (!viewport) return;
    const bounds = kind === 'focus' ? focusedCameraBounds : overviewCameraBounds;
    const calculatedZoom = getNetworkFitZoom({
      currentZoom: networkZoom,
      bounds,
      viewportWidth: viewport.clientWidth,
      viewportHeight: viewport.clientHeight,
      axisW: layout.axisW,
      headerH: layout.headerH,
      padding: 8,
      maxZoom: kind === 'focus' ? 1.12 : 0.84,
      minZoom:
        kind === 'overview'
          ? NETWORK_OVERVIEW_ZOOM_MIN
          : NETWORK_ZOOM_MIN,
    });
    const targetZoom = kind === 'focus' ? Math.max(0.84, calculatedZoom) : calculatedZoom;
    zoomAnchorRef.current = null;
    if (Math.abs(targetZoom - networkZoom) > 0.015) {
      pendingCameraFitRef.current = { kind, pass: 1, allowWhileSelected };
      setNetworkZoom(targetZoom);
      return;
    }
    centerCameraBounds(
      bounds,
      kind === 'overview' || prefersReducedMotion() ? 'auto' : 'smooth',
      kind,
    );
  };

  useLayoutEffect(() => {
    const pending = pendingCameraFitRef.current;
    if (!pending) return;
    if (
      pending.kind === 'overview' &&
      selectedNodeIdRef.current &&
      !pending.allowWhileSelected
    ) {
      pendingCameraFitRef.current = null;
      return;
    }
    const viewport = scrollRef.current;
    if (!viewport) return;
    const bounds = pending.kind === 'focus' ? focusedCameraBounds : overviewCameraBounds;
    const calculatedZoom = getNetworkFitZoom({
      currentZoom: networkZoom,
      bounds,
      viewportWidth: viewport.clientWidth,
      viewportHeight: viewport.clientHeight,
      axisW: layout.axisW,
      headerH: layout.headerH,
      padding: 8,
      maxZoom: pending.kind === 'focus' ? 1.12 : 0.84,
      minZoom:
        pending.kind === 'overview'
          ? NETWORK_OVERVIEW_ZOOM_MIN
          : NETWORK_ZOOM_MIN,
    });
    const targetZoom =
      pending.kind === 'focus' ? Math.max(0.84, calculatedZoom) : calculatedZoom;
    if (pending.pass < 2 && Math.abs(targetZoom - networkZoom) > 0.015) {
      pendingCameraFitRef.current = { ...pending, pass: pending.pass + 1 };
      setNetworkZoom(targetZoom);
      return;
    }
    pendingCameraFitRef.current = null;
    window.requestAnimationFrame(() => {
      centerCameraBounds(
        bounds,
        pending.kind === 'overview' || prefersReducedMotion() ? 'auto' : 'smooth',
        pending.kind,
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedCameraBounds, layout, networkZoom, overviewCameraBounds]);

  useLayoutEffect(() => {
    if (selectedNodeId) {
      if (
        layout.positions.has(selectedNodeId) &&
        focusFitAppliedForRef.current !== selectedNodeId
      ) {
        focusFitAppliedForRef.current = selectedNodeId;
        cameraChangedAfterFocusRef.current = false;
        // Let a possible double-click/tap gesture finish before moving the
        // canvas, otherwise its second activation can land on another node.
        window.setTimeout(() => {
          if (
            selectedNodeIdRef.current === selectedNodeId &&
            !cameraChangedAfterFocusRef.current
          ) {
            requestCameraFit('focus');
          }
        }, 420);
        if (isMobile) {
          scrollRef.current?.scrollIntoView({
            block: 'start',
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          });
        }
      }
      if (!focusInitialFocusDoneRef.current && selectedNodeButtonRef.current) {
        focusInitialFocusDoneRef.current = true;
        selectedNodeButtonRef.current.focus({ preventScroll: true });
      }
      return;
    }

    focusFitAppliedForRef.current = null;
    if (!overviewFitAppliedRef.current || returnToOverviewOnClearRef.current) {
      overviewFitAppliedRef.current = true;
      returnToOverviewOnClearRef.current = false;
      window.requestAnimationFrame(() => requestCameraFit('overview'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, layout.positions, selectedNodeId]);

  /**
   * 検索から特定のムーブメントへフォーカスする。
   * 詳細ページからの ?focus= 到着と同じ扱いにして、
   * 「必要な最小LODへ自動調整 → このムーブメント表示 → 1ホップへ一度だけ寄せる」を再利用する。
   * 以後のユーザー操作（zoom/pan/LOD/scope）は上書きしない（自動調整はfocusごとに1回だけ）。
   */
  const focusMovement = (id: string) => {
    // URL由来のfocusと同じ経路に載せる（自動調整の対象にする）
    urlFocusRef.current = id;
    focusAutoAppliedForRef.current = null;
    focusFitAppliedForRef.current = null;
    cameraChangedAfterFocusRef.current = false;
    setScopeTouched(false);
    setRelationKindFilter('all');
    setSelectedEdgeId(null);
    setSelectedNodeId(id);
    // 検索やURLから1件を指した時点で、目的は「そのムーブメントを理解すること」になる
    if (mode !== 'focus') applyMode('focus');
  };

  /**
   * モードは閲覧目的そのもの。収録範囲とカメラは付随して決まる。
   * 倍率は数値としては見せない（内部実装をユーザーに意識させない）。
   */
  const applyMode = (next: NetworkMode) => {
    setModeState(next);
    const url = new URL(window.location.href);
    url.searchParams.set('mode', next);
    window.history.pushState(window.history.state, '', url);

    const preset = NETWORK_MODE_PRESET[next];
    // モードがLODを決めるので、ユーザーの明示選択としては扱わない
    setLod(preset.lod, false);
    applyModeCamera(next);
  };

  /** モードごとのカメラ。倍率を決め打ちするのはSTUDYだけ */
  const applyModeCamera = (next: NetworkMode) => {
    const { camera } = NETWORK_MODE_PRESET[next];
    if (camera === 'fit-all') {
      // Wait for the Overview-only layout and label visibility to commit.
      // The layout effect then applies exactly one fit using those new bounds.
      overviewFitAppliedRef.current = false;
      returnToOverviewOnClearRef.current = true;
      return;
    }
    if (camera === 'fit-selection') {
      // 選ばれていなければカメラは動かさない（選択時にfocus fitが走る）
      if (!selectedNodeIdRef.current) return;
      window.requestAnimationFrame(() => requestCameraFit('focus'));
      return;
    }
    zoomAnchorRef.current = null;
    setNetworkZoom(clampNetworkZoom(camera));
  };

  const setMode = (next: NetworkMode) => {
    if (next === mode) return;
    applyMode(next);
    setSelectedEdgeId(null);
    setExpandedGroupIds(new Set());

    if (next === 'focus') {
      // 深掘りする対象が無ければ、まず選んでもらう
      if (!selectedNodeId) setPickerOpen(true);
      return;
    }
    setRelationScope('important');
    setScopeTouched(false);
  };

  // URLで開いたときのカメラは、既存の overview / focus 自動調整に任せる。
  // モードのカメラを適用するのはユーザーがモードを選んだときだけにして、
  // 起動時のカメラ決定を二重に走らせない。

  const setKindFilter = (kind: RelationKindFilter) => {
    returnToOverviewOnClearRef.current = !cameraChangedAfterFocusRef.current;
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
      returnToOverviewOnClearRef.current = !cameraChangedAfterFocusRef.current;
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
      if (eraJumpLockRef.current) {
        setActiveEra(eraJumpLockRef.current);
        return;
      }
      const contentCenter =
        viewport.scrollLeft +
        layout.axisW +
        Math.max(0, viewport.clientWidth - layout.axisW) / 2;
      const timelineX =
        contentCenter - layout.safePad - layout.axisW - layout.pad;
      const year = timelineXToYear(
        timelineX,
        timelineModeById('survey'),
        layout.timelineW,
      );
      const timeRange = ERA_TIME_RANGES.find(
        (band) => year >= band.start && year < band.end,
      );
      const nearestEra = timeRange?.era ?? eraOrder[eraOrder.length - 1];

      setActiveEra((current) => (current === nearestEra ? current : nearestEra));
    });
  };

  useEffect(
    () => () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
      if (eraJumpTimerRef.current !== null) {
        window.clearTimeout(eraJumpTimerRef.current);
      }
    },
    [],
  );

  const handleGraphKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      changeNetworkZoom(0.16);
      return;
    }
    if (event.key === '-') {
      event.preventDefault();
      changeNetworkZoom(-0.16);
      return;
    }
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'ArrowDown'
    ) {
      return;
    }
    event.preventDefault();
    cameraChangedAfterFocusRef.current = true;
    event.currentTarget.scrollBy({
      left: event.key === 'ArrowLeft' ? -220 : event.key === 'ArrowRight' ? 220 : 0,
      top: event.key === 'ArrowUp' ? -180 : event.key === 'ArrowDown' ? 180 : 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      changeNetworkZoom(event.deltaY < 0 ? 0.12 : -0.12, event.clientX);
      return;
    }
    if (!event.shiftKey) return;
    event.preventDefault();
    cameraChangedAfterFocusRef.current = true;
    event.currentTarget.scrollLeft += event.deltaY;
  };

  function changeNetworkZoom(delta: number, pointerX?: number) {
    const viewport = scrollRef.current;
    if (!viewport) return;
    cameraChangedAfterFocusRef.current = true;
    const bounds = viewport.getBoundingClientRect();
    const screenX = Math.max(
      layout.axisW,
      Math.min(
        pointerX === undefined ? layout.axisW + (viewport.clientWidth - layout.axisW) / 2 : pointerX - bounds.left,
        viewport.clientWidth,
      ),
    );
    const worldTimelineX =
      viewport.scrollLeft + screenX - layout.safePad - layout.axisW - layout.pad;
    zoomAnchorRef.current = {
      year: timelineXToYear(
        worldTimelineX,
        timelineModeById('survey'),
        layout.timelineW,
      ),
      screenX,
      scrollTop: viewport.scrollTop,
    };
    setNetworkZoom((current) =>
      clampNetworkZoom(
        current + delta,
        overviewPresentation ? NETWORK_OVERVIEW_ZOOM_MIN : NETWORK_ZOOM_MIN,
      ),
    );
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const target = event.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) return;
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = 'true';
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    cameraChangedAfterFocusRef.current = true;
    event.currentTarget.scrollLeft =
      dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX);
    event.currentTarget.scrollTop =
      dragRef.current.scrollTop - (event.clientY - dragRef.current.startY);
  };

  const stopPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current.active = false;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const clearSelection = (restoreDefaults = false) => {
    returnToOverviewOnClearRef.current = !cameraChangedAfterFocusRef.current;
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    if (!restoreDefaults) return;
    setRelationScope('important');
    setScopeTouched(false);
    focusAutoAppliedForRef.current = null;
    if (!hasExplicitChoice) clearLod();
  };

  const showNetworkOverview = () => {
    returnToOverviewOnClearRef.current = false;
    overviewFitAppliedRef.current = true;
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setFocusedEdgeId(null);
    setExpandedGroupIds(new Set());
    if (relationScope === 'focus') setRelationScope('important');
    applyMode('overview');
  };

  const selectedMovement = selectedNodeId
    ? movementById.get(selectedNodeId) ?? null
    : null;
  const selectedGroup = selectedMovement
    ? getMovementGroup(selectedMovement.id, movements)
    : undefined;
  const selectedArtists = useMemo(
    () => (selectedMovement ? artistsOf(selectedMovement).slice(0, 3) : []),
    [selectedMovement],
  );
  const selectedWorks = useMemo(
    () => (selectedMovement ? worksOf(selectedMovement).slice(0, 3) : []),
    [selectedMovement],
  );
  const selectedContexts = useMemo(() => {
    if (!selectedMovement) return [];
    return [
      ...selectedMovement.keywords.slice(0, 2),
      selectedMovement.technique.split(/[、。]/)[0],
    ].filter((value, index, values): value is string =>
      Boolean(value && values.indexOf(value) === index),
    ).slice(0, 3);
  }, [selectedMovement]);

  const renderPath = (
    relationship: AggregatedRelationship,
    mode: 'base' | 'highlight',
  ) => {
    const geometry = getEdgeGeometry(
      relationship,
      layout,
      visibleEdges,
      nodeTextObstacles,
    );
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
        data-route-grammar="metro"
        data-route-offset={String(geometry.routeOffset)}
        data-route-collision-bends={String(geometry.collisionAvoidanceBends ?? 0)}
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
        <div className="network-controls__row">
          <div className="network-picker-control">
            <button
              ref={pickerTriggerRef}
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              aria-expanded={pickerOpen}
              aria-haspopup="dialog"
              className="network-picker-trigger"
              data-network-picker-trigger
            >
              ムーブメントを検索
            </button>
            <MovementPicker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              mode="navigate"
              title="ムーブメントを検索"
              selectedIds={selectedNodeId ? [selectedNodeId] : []}
              max={1}
              triggerRef={pickerTriggerRef}
              onToggle={(movement) => focusMovement(movement.id)}
            />
          </div>

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
            onClick={() => clearSelection(true)}
            className="network-clear-selection"
          >
            選択を解除
          </button>
        )}
      </div>

      {/* モード切替と時代選択は1本のツールバーとしてまとめ、
          検索・年代軸とは別の階層であることを面で示す */}
      <div className="network-toolbar">
        <div
          className="network-mode-switch"
          role="group"
          aria-label="表示モード"
          data-network-mode-switch
        >
          {NETWORK_MODES.map((candidate) => (
            <button
              key={candidate}
              type="button"
              onClick={() => setMode(candidate)}
              aria-pressed={mode === candidate}
              aria-label={`${NETWORK_MODE_LABELS[candidate]}：${NETWORK_MODE_PURPOSES[candidate]}`}
              className="network-mode-switch__option"
              data-network-mode-option={candidate}
            >
              {NETWORK_MODE_LABELS[candidate]}
            </button>
          ))}
        </div>

        <label className="network-era-select">
          <span className="sr-only">時代へ移動</span>
          <select
            value={activeEra}
            onChange={(event) => jumpToEra(event.target.value as EraId)}
            data-network-era-select
          >
            {eraOrder.map((era) => (
              <option key={era} value={era}>
                {ERA_JUMP_LABELS[era]}
              </option>
            ))}
          </select>
          <AccordionChevron open={false} />
        </label>
      </div>

      <p className="network-mode-purpose" aria-live="polite">
        {NETWORK_MODE_PURPOSES[mode]}
      </p>

      <div
        className="network-map-shell"
        data-has-detail={Boolean(selectedMovement || selectedEdge)}
      >
      <div className="network-map-viewport">
      <div
        ref={scrollRef}
        className="network-scroll cursor-grab overflow-auto border hairline bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[dragging=true]:cursor-grabbing"
        role="group"
        aria-label="美術運動の関係ネットワーク図"
        aria-describedby="network-operation-help"
        tabIndex={0}
        data-network-scope={relationScope}
        data-network-lod={lod}
        data-network-mode={mode}
        data-network-mobile={isMobile}
        data-network-semantic-level={semanticLevel}
        data-network-zoom={networkZoom.toFixed(2)}
        data-network-compact-overview={networkZoom < 0.52}
        data-network-overview-presentation={overviewPresentation}
        data-network-camera={selectedNodeId ? 'focused' : 'overview'}
        data-network-visual-gutter={layout.visualGutter}
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
          style={{ width: canvasWidth, height: canvasHeight }}
          data-network-canvas
        >
          {layout.lanes.map((lane) => (
            <div
              key={lane.region}
              className="network-region-lane pointer-events-none absolute"
              style={{
                top: lane.top,
                left: 0,
                width: canvasWidth,
                height: lane.height,
                '--network-region-rgb': regionRgb(lane.region),
              } as CSSProperties}
              data-network-region={lane.region}
              data-lane-relevance={lane.relevance}
              data-lane-height={Math.round(lane.height)}
              data-lane-visible-nodes={lane.visibleNodeCount}
              data-lane-relevant-nodes={lane.relevantNodeCount}
            >
              <div
                className="network-region-lane__label sticky left-0"
                style={{ width: layout.axisW, height: lane.height }}
                aria-label={REGION_LABELS[lane.region]}
              >
                <span aria-hidden="true" />
                {isMobile
                  ? MOBILE_REGION_LABELS[lane.region] ?? REGION_LABELS[lane.region]
                  : REGION_LABELS[lane.region]}
              </div>
            </div>
          ))}

          <div
            className="network-time-axis sticky top-0 z-50"
            style={{ width: canvasWidth, height: layout.headerH }}
            aria-hidden="true"
          >
            <div
              className="network-axis-corner sticky left-0 z-[2]"
              style={{ width: layout.axisW, height: layout.headerH }}
            >
              <strong>地域</strong>
              <span>年代 →</span>
            </div>
            {visibleSurveyTicks.map((tick) => (
              <span
                key={tick}
                className="network-time-axis__tick"
                style={{
                  left:
                    layout.safePad +
                    layout.axisW +
                    layout.pad +
                    yearToTimelineX(
                      tick,
                      timelineModeById('survey'),
                      layout.timelineW,
                    ),
                }}
              >
                {formatTimelineYearLabel(tick)}
              </span>
            ))}
          </div>

          <svg
            className="absolute inset-0 z-0"
            width={canvasWidth}
            height={canvasHeight}
            viewBox={getNetworkViewBox(canvasWidth, canvasHeight)}
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
                nodeTextObstacles,
              );
              if (!geometry) return null;

              return (
                <g
                  key={relationship.id}
                  data-relation-kind={relationship.kind}
                  data-edge-emphasis={edgeEmphasis({
                    mode,
                    kind: relationship.kind,
                    from: relationship.from,
                    to: relationship.to,
                    selectedId: selectedNodeId,
                    directNodeIds: relatedNodeIds,
                  })}
                >
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
            const isSecondHop = secondHopNodeIds.has(movement.id);
            const dimmed = selectionActive && !isRelated && !isSecondHop;
            const isEdgeSource = selectedEdge?.from === movement.id;
            const isEdgeTarget = selectedEdge?.to === movement.id;
            const prominence = networkNodeProminence(
              movement,
              editorialDegreeByNode.get(movement.id) ?? 0,
            );
            const movementRegion = movement.regionIds[0] ?? 'other';
            const laneRelevance =
              layout.lanes.find((lane) => lane.region === movementRegion)?.relevance ??
              'overview';

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
                        : isSecondHop
                          ? 'z-20'
                        : 'z-20'
                }`}
                style={{
                  left: position.x,
                  top: position.y,
                  width: layout.nodeW,
                  height: layout.nodeH,
                  '--network-station-y': `${layout.stationY}px`,
                  '--network-overview-label-offset-y': `${
                    overviewLabelOffsets.get(movement.id) ?? 0
                  }px`,
                } as CSSProperties}
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
                  className="network-node relative h-full w-full text-left"
                  data-network-node
                  data-network-node-id={movement.id}
                  data-node-prominence={prominence}
                  data-overview-landmark={overviewLandmarkIds.has(movement.id)}
                  data-lane-relevance={laneRelevance}
                  data-label-collision-padding={isSelected ? '10' : '7'}
                  data-node-state={
                    isSelected
                      ? 'selected'
                      : isRelated
                        ? 'related'
                        : isSecondHop
                          ? 'secondary'
                          : dimmed
                            ? 'dimmed'
                            : 'idle'
                  }
                  data-node-role={
                    isEdgeSource ? 'source' : isEdgeTarget ? 'target' : undefined
                  }
                  data-node-emphasis={nodeEmphasis({
                    mode,
                    nodeId: movement.id,
                    selectedId: selectedNodeId,
                    directNodeIds: relatedNodeIds,
                    secondHopNodeIds: emphasisSecondHopIds,
                  })}
                >
                  <span className="network-node__station" aria-hidden="true">
                    <span />
                  </span>
                  <span className="network-node__content">
                    {(isEdgeSource || isEdgeTarget) && (
                      <span className="network-node__role">
                        {isEdgeSource ? '起点' : '到達先'}
                      </span>
                    )}
                    <span
                      className="network-node__title"
                      data-network-node-title
                    >
                      {networkZoom < 0.52
                        ? movement.shortLabel || movement.nameJa
                        : movement.nameJa}
                    </span>
                    {semanticLevel !== 'overview' && (
                      <span
                        className="network-node__date"
                        data-network-node-date
                      >
                        {movement.dates.start < 0
                          ? `前${Math.abs(movement.dates.start)}`
                          : movement.dates.start}
                        〜
                      </span>
                    )}
                    {isSelected && (relationshipCountByNode.get(movement.id) ?? 0) > 1 && (
                      <span className="network-node__relation-count">
                        関連 {relationshipCountByNode.get(movement.id)}
                      </span>
                    )}
                  </span>
                </button>
              </div>
            );
          })}

          {selectedMovement && semanticLevel === 'detail' && (() => {
            const selectedPosition = layout.positions.get(selectedMovement.id);
            if (!selectedPosition) return null;
            const showDetail = semanticLevel === 'detail';
            const preferredLeft = selectedPosition.x + layout.nodeW + 24;
            const clusterWidth = showDetail ? 344 : 158;
            const left = Math.min(
              preferredLeft,
              canvasWidth - layout.visualGutter - clusterWidth,
            );
            const clusterHeight = showDetail ? 224 : 148;
            const top = Math.min(
              Math.max(
                layout.headerH + layout.visualGutter,
                selectedPosition.y - 10,
              ),
              canvasHeight - layout.visualGutter - clusterHeight,
            );

            return (
              <div
                className="network-entity-cluster"
                style={{ left, top, width: clusterWidth }}
                data-network-entity-layer
                data-semantic-level={semanticLevel}
                aria-label={`${selectedMovement.nameJa}の関連情報`}
              >
                <div className="network-entity-cluster__column">
                  <p>ARTISTS</p>
                  {selectedArtists.length > 0 ? (
                    selectedArtists.map((artist) => (
                      <Link
                        key={artist.id}
                        href={`/artists/${artist.id}/`}
                        className="network-entity-node"
                        data-network-entity="artist"
                      >
                        {artist.nameJa}
                      </Link>
                    ))
                  ) : (
                    <span className="network-entity-node network-entity-node--muted">
                      作家情報を確認中
                    </span>
                  )}
                </div>
                {showDetail && (
                  <>
                    <div className="network-entity-cluster__column">
                      <p>WORKS</p>
                      {selectedWorks.map((work) => (
                        <Link
                          key={work.id}
                          href={`/works/${work.id}/`}
                          className="network-entity-node"
                          data-network-entity="work"
                        >
                          <span>{work.titleJa}</span>
                          <small>{work.year}</small>
                        </Link>
                      ))}
                    </div>
                    <div className="network-entity-cluster__column network-entity-cluster__column--context">
                      <p>CONTEXT / IDEA / TECHNOLOGY</p>
                      {selectedContexts.map((context) => (
                        <span
                          key={context}
                          className="network-entity-node network-entity-node--context"
                          data-network-entity="context"
                        >
                          {context}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {highlightedEdges.length > 0 && (
            <svg
              className="pointer-events-none absolute inset-0 z-20"
              width={canvasWidth}
              height={canvasHeight}
              viewBox={getNetworkViewBox(canvasWidth, canvasHeight)}
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
            width={canvasWidth}
            height={canvasHeight}
            viewBox={getNetworkViewBox(canvasWidth, canvasHeight)}
            overflow="visible"
            aria-hidden="true"
            data-network-layer="edge-labels"
          >
            {edgeLabelPlacements.map(({ placement, relationship, anchor, showLeader }) => {
              const text = RELATION_LABELS[relationship.kind];
              return (
                <g key={relationship.id}>
                  {/* 線から離して置いた場合は、どのエッジのラベルか分かるよう引き出し線を描く */}
                  {showLeader && (
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
                  {/*
                    線が文字を貫通しないよう、矩形の板ではなく紙色のハローで抜く。
                    地域レーンに地色が入ったので、板だと背景から浮いた箱に見えてしまう。
                  */}
                  <text
                    x={placement.x}
                    y={placement.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={RELATION_COLOR[relationship.kind]}
                    fontSize={labelFontSize}
                    fontWeight="600"
                    stroke="rgb(var(--c-raised))"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    paintOrder="stroke fill"
                    data-edge-label
                    data-edge-label-halo
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

      {/* FOCUSはカメラが選択に合わせて決まるので、倍率の操作も数値も出さない */}
      {mode !== 'focus' && (
        <div
          className="network-zoom-fab"
          role="group"
          aria-label="ネットワーク倍率"
          data-network-zoom-fab
        >
          <button
            type="button"
            onClick={showNetworkOverview}
            aria-label="主要系譜の全体表示へ戻す"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => changeNetworkZoom(-0.16)}
            aria-label="ネットワークを縮小"
            disabled={
              networkZoom <=
              (overviewPresentation
                ? NETWORK_OVERVIEW_ZOOM_MIN
                : NETWORK_ZOOM_MIN)
            }
          >
            −
          </button>
          <button
            type="button"
            onClick={() => changeNetworkZoom(0.16)}
            aria-label="ネットワークを拡大"
            disabled={networkZoom >= NETWORK_ZOOM_MAX}
          >
            ＋
          </button>
        </div>
      )}
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
        <section className="network-detail-panel" data-network-detail-panel>
          <p className="network-detail-panel__eyebrow">選択中のムーブメント</p>
          <button
            type="button"
            className="network-detail-panel__close"
            onClick={() => clearSelection()}
            aria-label="選択中のムーブメント詳細を閉じる"
          >
            ×
          </button>
          <h3>{selectedMovement.nameJa}</h3>
          <p className="network-detail-panel__meta">
            {formatDateRange(selectedMovement)} ·{' '}
            {selectedMovement.regionIds.map((region) => REGION_LABELS[region]).join('・')}
          </p>
          <p className="network-detail-panel__summary">{selectedMovement.summary}</p>

          <NetworkLocalOrbit
            movement={selectedMovement}
            edges={selectedNodeEdges}
            movementById={movementById}
          />

          {/* 概要 → 代表作家 → 代表作品 → 関係 の順に読ませる（理解の入口として） */}
          <div className="network-detail-panel__grid">
            <section aria-labelledby="network-detail-artists">
              <h4 id="network-detail-artists">代表作家</h4>
              {selectedArtists.length > 0 ? (
                <ul>
                  {selectedArtists.map((artist) => (
                    <li key={artist.id}>
                      <Link href={`/artists/${artist.id}/`}>{artist.nameJa}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>収録作家を確認中</p>
              )}
            </section>
            <section aria-labelledby="network-detail-works">
              <h4 id="network-detail-works">代表作品</h4>
              {selectedWorks.length > 0 ? (
                <ul>
                  {selectedWorks.map((work) => (
                    <li key={work.id}>
                      <Link href={`/works/${work.id}/`}>{work.titleJa}</Link>
                      <small>{work.year}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>代表作品を確認中</p>
              )}
            </section>
            <section aria-labelledby="network-detail-relations">
              <h4 id="network-detail-relations">関係</h4>
              <ul>
                {selectedNodeEdges.slice(0, 5).map((relationship) => {
                  const outgoing = relationship.from === selectedMovement.id;
                  const otherId = outgoing ? relationship.to : relationship.from;
                  return (
                    <li key={relationship.id}>
                      <span aria-hidden="true">{outgoing ? '→' : '←'}</span>{' '}
                      {movementName(otherId)}
                      <small>{RELATION_LABELS[relationship.kind]}</small>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
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
                className="network-detail-panel__group-toggle"
              >
                {expandedGroupIds.has(selectedGroup.id)
                  ? `${selectedGroup.label}を集約`
                  : `${selectedGroup.label}の内訳を展開`}
              </button>
            )}
          <Link
            href={`/movements/${selectedMovement.id}/`}
            className="network-detail-panel__link prose-link"
          >
            詳細ページへ →
          </Link>
        </section>
      )}
      </div>

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
