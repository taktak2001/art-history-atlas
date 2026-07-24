'use client';

import type { VisibilityLevel } from '@/lib/schema';
import { VISIBILITY_LEVEL_LABELS } from '@/lib/schema';
import { LOD_LEVELS } from '@/lib/movement-hierarchy';

type Props = {
  value: VisibilityLevel;
  onChange: (value: VisibilityLevel) => void;
  counts?: Partial<Record<VisibilityLevel, number>>;
  compact?: boolean;
};

export function LodControl({ value, onChange, counts, compact = false }: Props) {
  return (
    <div className={compact ? '' : 'border-y hairline py-4'} data-lod-control>
      <p className="mb-2 text-xs font-bold text-ink">表示密度</p>
      <div
        className="inline-grid min-w-[264px] grid-cols-3 overflow-hidden rounded-sm border hairline bg-raised"
        role="group"
        aria-label="表示密度"
      >
        {LOD_LEVELS.map((level, index) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            aria-pressed={value === level}
            className={`min-h-11 px-3 py-2 text-sm font-medium transition-colors active:translate-y-px ${
              index > 0 ? 'border-l hairline' : ''
            } ${
              value === level
                ? 'bg-ink text-paper underline decoration-accent decoration-2 underline-offset-4'
                : 'text-muted hover:bg-surface hover:text-ink'
            }`}
          >
            {VISIBILITY_LEVEL_LABELS[level]}
            {counts?.[level] !== undefined && (
              <span className="ml-1 text-[10px] tabular-nums opacity-75">
                {counts[level]}
              </span>
            )}
          </button>
        ))}
      </div>
      {!compact && (
        <p className="mt-2 text-xs leading-relaxed text-muted">
          主要は全体像、標準は重要な細分、詳細は収録済みの全項目を表示
        </p>
      )}
    </div>
  );
}
