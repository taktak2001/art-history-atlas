import type { CSSProperties } from 'react';
import {
  CLASSIFICATION_LABELS,
  REGION_LABELS,
  VERIFICATION_LABELS,
  RELATION_LABELS,
  type ClassificationKind,
  type RegionId,
  type VerificationStatus,
  type RelationKind,
} from '@/lib/schema';
import {
  RELATION_COLOR,
  RELATION_DARK_COLOR,
} from '@/lib/relationship-definitions';

export function ClassificationBadge({ kind }: { kind: ClassificationKind }) {
  return (
    <span className="inline-flex items-center rounded-sm border hairline px-2 py-0.5 text-xs text-muted">
      {CLASSIFICATION_LABELS[kind]}
    </span>
  );
}

export function RegionBadges({ regionIds }: { regionIds: RegionId[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {regionIds.map((r) => (
        <span
          key={r}
          className="inline-flex items-center rounded-sm bg-surface px-2 py-0.5 text-xs text-muted"
        >
          {REGION_LABELS[r]}
        </span>
      ))}
    </span>
  );
}

// 情報確認状態：色＋テキスト＋記号で、色のみに依存しない表現にする
const VERIFICATION_STYLE: Record<VerificationStatus, { cls: string; mark: string }> = {
  verified: { cls: 'text-emerald-700 dark:text-emerald-400', mark: '●' },
  'single-source': { cls: 'text-amber-700 dark:text-amber-400', mark: '◐' },
  contested: { cls: 'text-violet-700 dark:text-violet-400', mark: '◈' },
  'needs-review': { cls: 'text-rose-700 dark:text-rose-400', mark: '▲' },
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const s = VERIFICATION_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${s.cls}`}>
      <span aria-hidden="true">{s.mark}</span>
      <span>情報確認状態：{VERIFICATION_LABELS[status]}</span>
    </span>
  );
}

export function RelationBadge({ kind }: { kind: RelationKind }) {
  return (
    <span
      className="relation-badge inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs"
      style={{
        '--relation-color': RELATION_COLOR[kind],
        '--relation-color-dark': RELATION_DARK_COLOR[kind],
      } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="relation-badge__mark inline-block h-2 w-2 rounded-full"
      />
      {RELATION_LABELS[kind]}
    </span>
  );
}
