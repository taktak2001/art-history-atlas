'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Movement, Relationship, RelationKind, EraId } from '@/lib/schema';
import { RELATION_LABELS, ERA_LABELS } from '@/lib/schema';
import {
  limitMobileRelationships,
  MOBILE_PRIMARY_KINDS,
  RELATION_LINE_STYLE,
} from '@/lib/network-presentation';
import { RELATION_COLOR } from './Badges';

type Props = {
  movements: Movement[];
  relationships: Relationship[];
  eraOrder: EraId[];
};

const ALL_KINDS = Object.keys(RELATION_LABELS) as RelationKind[];

function LineSample({ kind, active = true }: { kind: RelationKind; active?: boolean }) {
  const style = RELATION_LINE_STYLE[kind];
  const color = RELATION_COLOR[kind];

  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      width="46"
      height="14"
      viewBox="0 0 46 14"
    >
      <line
        x1="2"
        y1="7"
        x2={style.arrow ? 38 : 44}
        y2="7"
        fill="none"
        stroke={color}
        strokeWidth={style.width}
        strokeDasharray={style.dasharray}
        strokeLinecap={style.linecap}
        opacity={active ? 1 : 0.3}
      />
      {style.arrow && (
        <path
          d="M 36 3.5 L 43 7 L 36 10.5"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={active ? 1 : 0.3}
        />
      )}
    </svg>
  );
}

export function NetworkGraph({ movements, relationships, eraOrder }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [active, setActive] = useState<Set<RelationKind>>(new Set(ALL_KINDS));
  const [isMobile, setIsMobile] = useState(false);
  const [showAllMobile, setShowAllMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      setShowAllMobile(false);
      setActive(new Set(mobile ? MOBILE_PRIMARY_KINDS : ALL_KINDS));
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const filteredEdges = useMemo(
    () => relationships.filter((relationship) => active.has(relationship.kind)),
    [active, relationships],
  );

  const visibleEdges = useMemo(
    () => isMobile && !showAllMobile
      ? limitMobileRelationships(filteredEdges)
      : filteredEdges,
    [filteredEdges, isMobile, showAllMobile],
  );

  const displayedMovements = useMemo(() => {
    if (!isMobile || showAllMobile) return movements;

    if (visibleEdges.length === 0) {
      return [...movements]
        .sort((a, b) => a.dates.start - b.dates.start)
        .slice(0, 18);
    }

    const visibleIds = new Set(
      visibleEdges.flatMap((relationship) => [relationship.from, relationship.to]),
    );
    return movements.filter((movement) => visibleIds.has(movement.id));
  }, [isMobile, movements, showAllMobile, visibleEdges]);

  const layout = useMemo(() => {
    const colStep = isMobile ? 176 : 210;
    const rowStep = isMobile ? 76 : 82;
    const nodeW = isMobile ? 132 : 150;
    const nodeH = isMobile ? 50 : 54;
    const top = 46;
    const pad = isMobile ? 16 : 24;
    const positions = new Map<string, { x: number; y: number }>();
    let maxRows = 0;

    eraOrder.forEach((era, col) => {
      const inEra = displayedMovements
        .filter((movement) => movement.era === era)
        .sort((a, b) => a.dates.start - b.dates.start);
      maxRows = Math.max(maxRows, inEra.length);
      inEra.forEach((movement, row) => {
        positions.set(movement.id, {
          x: pad + col * colStep,
          y: top + row * rowStep,
        });
      });
    });

    return {
      positions,
      canvasW: pad * 2 + eraOrder.length * colStep,
      canvasH: top + maxRows * rowStep + pad,
      colStep,
      nodeW,
      nodeH,
      pad,
    };
  }, [displayedMovements, eraOrder, isMobile]);

  const center = (id: string) => {
    const position = layout.positions.get(id);
    return position
      ? {
          x: position.x + layout.nodeW / 2,
          y: position.y + layout.nodeH / 2,
        }
      : null;
  };

  const selectedEdges = useMemo(
    () => selected
      ? visibleEdges.filter(
          (relationship) => relationship.from === selected || relationship.to === selected,
        )
      : [],
    [selected, visibleEdges],
  );

  const neighborIds = useMemo(() => {
    const ids = new Set<string>();
    for (const relationship of selectedEdges) {
      if (relationship.from === selected) ids.add(relationship.to);
      if (relationship.to === selected) ids.add(relationship.from);
    }
    return ids;
  }, [selected, selectedEdges]);

  const toggleKind = (kind: RelationKind) => {
    setSelected(null);
    setActive((previous) => {
      const next = new Set(previous);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  const toggleMobileScope = () => {
    const showAll = !showAllMobile;
    setShowAllMobile(showAll);
    setActive(new Set(showAll ? ALL_KINDS : MOBILE_PRIMARY_KINDS));
    setSelected(null);
  };

  const selectedMovement = selected
    ? movements.find((movement) => movement.id === selected)
    : null;

  const movementName = (id: string) =>
    movements.find((movement) => movement.id === id)?.nameJa ?? id;

  return (
    <div>
      <fieldset className="mb-4">
        <legend className="text-xs font-bold text-muted">関係タイプ</legend>
        <div className="mt-1 flex items-start justify-between gap-3">
          <p className="text-xs text-faint">
            色に加えて、実線・破線・点線の違いで関係を識別できます。
          </p>
          <button
            type="button"
            onClick={toggleMobileScope}
            aria-pressed={showAllMobile}
            className="shrink-0 rounded-sm border hairline px-3 py-1.5 text-xs text-ink active:translate-y-px sm:hidden"
          >
            {showAllMobile ? '重要関係のみ' : 'すべて表示'}
          </button>
        </div>
        <div
          className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5"
          aria-label="関係タイプの凡例と絞り込み"
        >
          {ALL_KINDS.map((kind) => {
            const on = active.has(kind);
            return (
              <button
                key={kind}
                type="button"
                onClick={() => toggleKind(kind)}
                aria-pressed={on}
                className={`flex min-h-10 items-center gap-2 rounded-sm border px-2 py-1.5 text-left text-xs transition-opacity active:translate-y-px ${
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
      </fieldset>

      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t hairline pt-3"
        aria-live="polite"
      >
        <p className="text-xs text-faint">
          {isMobile && !showAllMobile
            ? `重要関係を優先して${visibleEdges.length}件、${displayedMovements.length}ノードを表示中`
            : `${visibleEdges.length}件の関係を表示中`}
          {selectedMovement
            ? `。${selectedMovement.nameJa}に関連する${selectedEdges.length}件を強調中`
            : '。ノードを選ぶと関連線を強調します'}
        </p>
        {selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="rounded-sm border hairline px-3 py-1.5 text-xs text-muted hover:text-ink active:translate-y-px"
          >
            選択を解除
          </button>
        )}
      </div>

      <div
        className="scroll-x mt-3 rounded-sm border hairline bg-raised"
        role="group"
        aria-label="美術運動の関係ネットワーク図"
        data-network-scope={isMobile && !showAllMobile ? 'important' : 'all'}
      >
        <div
          className="relative"
          style={{ width: layout.canvasW, height: layout.canvasH }}
          data-network-canvas
        >
          {eraOrder.map((era, col) => (
            <div
              key={era}
              className="absolute text-center text-[10px] font-bold text-faint"
              style={{
                left: layout.pad + col * layout.colStep,
                top: 12,
                width: layout.nodeW,
              }}
            >
              {ERA_LABELS[era]}
            </div>
          ))}

          <svg
            className="pointer-events-none absolute inset-0"
            width={layout.canvasW}
            height={layout.canvasH}
            aria-hidden="true"
            data-network-edges
          >
            <defs>
              <marker
                id="network-revival-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke={RELATION_COLOR.revival} strokeWidth="2" />
              </marker>
            </defs>
            {visibleEdges.map((relationship) => {
              const start = center(relationship.from);
              const end = center(relationship.to);
              if (!start || !end) return null;

              const related = !selected
                || relationship.from === selected
                || relationship.to === selected;
              const style = RELATION_LINE_STYLE[relationship.kind];
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;
              const label = RELATION_LABELS[relationship.kind];
              const labelWidth = label.length * 11 + 14;

              return (
                <g key={relationship.id} data-relation-kind={relationship.kind}>
                  <path
                    d={`M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`}
                    fill="none"
                    stroke={RELATION_COLOR[relationship.kind]}
                    strokeWidth={selected ? (related ? 4.5 : 1.25) : style.width}
                    strokeDasharray={style.dasharray}
                    strokeLinecap={style.linecap}
                    opacity={selected ? (related ? 0.96 : 0.1) : 0.78}
                    markerEnd={style.arrow ? 'url(#network-revival-arrow)' : undefined}
                    className="transition-opacity"
                    data-network-edge
                    data-edge-related={selected ? String(related) : 'idle'}
                  />
                  {selected && related && (
                    <g data-edge-label>
                      <rect
                        x={midX - labelWidth / 2}
                        y={midY - 10}
                        width={labelWidth}
                        height="20"
                        rx="2"
                        fill="rgb(var(--c-raised))"
                        stroke="rgb(var(--c-line))"
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        fill="rgb(var(--c-ink))"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {displayedMovements.map((movement) => {
            const position = layout.positions.get(movement.id);
            if (!position) return null;
            const isSelected = selected === movement.id;
            const isNeighbor = neighborIds.has(movement.id);
            const dimmed = Boolean(selected && !isSelected && !isNeighbor);
            return (
              <div
                key={movement.id}
                className="absolute"
                style={{
                  left: position.x,
                  top: position.y,
                  width: layout.nodeW,
                  height: layout.nodeH,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(isSelected ? null : movement.id)}
                  onDoubleClick={() => router.push(`/movements/${movement.id}/`)}
                  aria-pressed={isSelected}
                  aria-label={`${movement.nameJa}を選択`}
                  className={`flex h-full w-full flex-col justify-center rounded-sm bg-surface px-2 text-left text-xs transition-opacity ${
                    isSelected
                      ? 'border-2 border-accent'
                      : isNeighbor
                        ? 'border-2 border-ink/60'
                        : 'border hairline hover:border-ink/40'
                  } ${dimmed ? 'opacity-70' : 'opacity-100'}`}
                  data-network-node
                  data-node-state={
                    isSelected ? 'selected' : isNeighbor ? 'related' : dimmed ? 'dimmed' : 'idle'
                  }
                >
                  <span className="truncate font-serif text-ink">{movement.nameJa}</span>
                  <span className="truncate text-[10px] text-faint">
                    {movement.dates.start < 0
                      ? `前${Math.abs(movement.dates.start)}`
                      : movement.dates.start}
                    〜
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedMovement && (
        <div className="mt-4 border-l-2 border-accent bg-surface px-4 py-3">
          <h3 className="font-serif text-lg">{selectedMovement.nameJa}</h3>
          <p className="mt-1 max-w-prose text-sm text-muted">{selectedMovement.summary}</p>
          <a
            href={`/movements/${selectedMovement.id}/`}
            className="mt-2 inline-block text-sm prose-link"
          >
            詳細ページへ →
          </a>
        </div>
      )}

      <section
        className="mt-5 border-t hairline pt-4"
        aria-labelledby="relationship-list-heading"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="relationship-list-heading" className="font-serif text-lg">
            関係一覧
          </h2>
          <p className="text-xs text-faint">図と同じ絞り込み結果をテキストで表示</p>
        </div>
        {visibleEdges.length > 0 ? (
          <ul className="mt-3 grid max-h-[28rem] gap-x-8 gap-y-3 overflow-y-auto pr-2 text-sm md:grid-cols-2">
            {visibleEdges.map((relationship) => (
              <li key={relationship.id} className="border-t hairline pt-2">
                <div className="flex items-center gap-2">
                  <LineSample kind={relationship.kind} />
                  <span className="font-bold text-ink">
                    {RELATION_LABELS[relationship.kind]}
                  </span>
                </div>
                <p className="mt-1 text-ink">
                  {movementName(relationship.from)}
                  <span className="mx-1 text-faint">→</span>
                  <a href={`/movements/${relationship.to}/`} className="prose-link">
                    {movementName(relationship.to)}
                  </a>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{relationship.note}</p>
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
