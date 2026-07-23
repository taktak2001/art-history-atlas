'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Movement, Relationship, RelationKind, EraId } from '@/lib/schema';
import { RELATION_LABELS, ERA_LABELS } from '@/lib/schema';
import { RELATION_COLOR } from './Badges';

type Props = {
  movements: Movement[];
  relationships: Relationship[];
  eraOrder: EraId[];
};

const COL_STEP = 210;
const ROW_STEP = 82;
const NODE_W = 150;
const NODE_H = 54;
const TOP = 44;
const PAD = 24;

const ALL_KINDS = Object.keys(RELATION_LABELS) as RelationKind[];

export function NetworkGraph({ movements, relationships, eraOrder }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [active, setActive] = useState<Set<RelationKind>>(new Set(ALL_KINDS));

  // 時代カラムごとにノードを配置
  const { positions, canvasW, canvasH } = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    let maxRows = 0;
    eraOrder.forEach((era, col) => {
      const inEra = movements
        .filter((m) => m.era === era)
        .sort((a, b) => a.dates.start - b.dates.start);
      maxRows = Math.max(maxRows, inEra.length);
      inEra.forEach((m, row) => {
        pos.set(m.id, { x: PAD + col * COL_STEP, y: TOP + row * ROW_STEP });
      });
    });
    return {
      positions: pos,
      canvasW: PAD * 2 + eraOrder.length * COL_STEP,
      canvasH: TOP + maxRows * ROW_STEP + PAD,
    };
  }, [movements, eraOrder]);

  const center = (id: string) => {
    const p = positions.get(id);
    return p ? { x: p.x + NODE_W / 2, y: p.y + NODE_H / 2 } : null;
  };

  const visibleEdges = relationships.filter((r) => active.has(r.kind));

  const neighborIds = useMemo(() => {
    if (!selected) return new Set<string>();
    const s = new Set<string>();
    for (const r of visibleEdges) {
      if (r.from === selected) s.add(r.to);
      if (r.to === selected) s.add(r.from);
    }
    return s;
  }, [selected, visibleEdges]);

  const toggleKind = (k: RelationKind) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const isEdgeShown = (r: Relationship) =>
    selected ? r.from === selected || r.to === selected : true;

  const selectedMovement = selected ? movements.find((m) => m.id === selected) : null;

  return (
    <div>
      {/* 関係タイプのフィルタ */}
      <fieldset className="mb-3">
        <legend className="mb-2 text-xs text-muted">関係タイプで絞り込み（色と記号で識別）</legend>
        <div className="flex flex-wrap gap-1.5">
          {ALL_KINDS.map((k) => {
            const on = active.has(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleKind(k)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs ${
                  on ? 'border-transparent' : 'hairline opacity-45'
                }`}
                style={on ? { backgroundColor: RELATION_COLOR[k] + '22', color: RELATION_COLOR[k] } : {}}
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: RELATION_COLOR[k] }} />
                {RELATION_LABELS[k]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-faint">
          ノードを選ぶと前後の関係だけを表示します（段階的展開）。もう一度選ぶと解除。
        </p>
        {selected && (
          <button type="button" onClick={() => setSelected(null)} className="rounded-sm border hairline px-2 py-1 text-xs text-muted hover:text-ink">
            選択を解除
          </button>
        )}
      </div>

      {/* グラフ本体 */}
      <div className="scroll-x mt-3 rounded-sm border hairline bg-raised">
        <div className="relative" style={{ width: canvasW, height: canvasH }}>
          {/* 時代の見出し */}
          {eraOrder.map((era, col) => (
            <div
              key={era}
              className="absolute text-center text-[10px] uppercase tracking-wider text-faint"
              style={{ left: PAD + col * COL_STEP, top: 12, width: NODE_W }}
            >
              {ERA_LABELS[era]}
            </div>
          ))}

          {/* エッジ（SVG） */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={canvasW}
            height={canvasH}
            aria-hidden="true"
          >
            {visibleEdges.map((r) => {
              const a = center(r.from);
              const b = center(r.to);
              if (!a || !b) return null;
              const shown = isEdgeShown(r);
              const midX = (a.x + b.x) / 2;
              return (
                <path
                  key={r.id}
                  d={`M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`}
                  fill="none"
                  stroke={RELATION_COLOR[r.kind]}
                  strokeWidth={shown && selected ? 2 : 1}
                  opacity={shown ? (selected ? 0.9 : 0.28) : 0.05}
                />
              );
            })}
          </svg>

          {/* ノード（DOM） */}
          {movements.map((m) => {
            const p = positions.get(m.id);
            if (!p) return null;
            const isSel = selected === m.id;
            const isNeighbor = neighborIds.has(m.id);
            const dim = selected && !isSel && !isNeighbor;
            return (
              <div
                key={m.id}
                className="absolute"
                style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}
              >
                <button
                  type="button"
                  onClick={() => setSelected(isSel ? null : m.id)}
                  onDoubleClick={() => router.push(`/movements/${m.id}/`)}
                  aria-pressed={isSel}
                  className={`flex h-full w-full flex-col justify-center rounded-sm border px-2 text-left text-xs transition-opacity ${
                    isSel ? 'border-accent bg-accent/20' : 'hairline bg-surface hover:border-ink/40'
                  } ${dim ? 'opacity-30' : 'opacity-100'}`}
                >
                  <span className="truncate font-serif text-ink">{m.nameJa}</span>
                  <span className="truncate text-[10px] text-faint">
                    {m.dates.start < 0 ? `前${Math.abs(m.dates.start)}` : m.dates.start}〜
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 選択ノードの詳細 */}
      {selectedMovement && (
        <div className="mt-4 rounded-sm border hairline bg-surface p-4">
          <h3 className="font-serif text-lg">{selectedMovement.nameJa}</h3>
          <p className="mt-1 text-sm text-muted">{selectedMovement.summary}</p>
          <a href={`/movements/${selectedMovement.id}/`} className="mt-2 inline-block text-sm prose-link">
            詳細ページへ →
          </a>
        </div>
      )}

      {/* テキスト代替：関係の一覧 */}
      <details className="mt-4 rounded-sm border hairline bg-surface p-3">
        <summary className="cursor-pointer text-sm text-muted">
          テキスト形式で関係を一覧（モバイル・スクリーンリーダー向けの代替表現）
        </summary>
        <ul className="mt-3 space-y-2 text-sm">
          {visibleEdges.map((r) => {
            const from = movements.find((m) => m.id === r.from);
            const to = movements.find((m) => m.id === r.to);
            if (!from || !to) return null;
            return (
              <li key={r.id} className="border-t hairline pt-2">
                <span className="text-ink">{from.nameJa}</span>
                <span className="mx-1" style={{ color: RELATION_COLOR[r.kind] }}>
                  ―［{RELATION_LABELS[r.kind]}］→
                </span>
                <a href={`/movements/${to.id}/`} className="prose-link">{to.nameJa}</a>
                <p className="mt-0.5 text-muted">{r.note}</p>
              </li>
            );
          })}
        </ul>
      </details>
    </div>
  );
}
