'use client';

import type { VisibilityLevel } from '@/lib/schema';
import {
  VISIBILITY_LEVEL_DESCRIPTIONS,
  VISIBILITY_LEVEL_LABELS,
} from '@/lib/schema';
import { LOD_LEVELS } from '@/lib/movement-hierarchy';

type Props = {
  value: VisibilityLevel;
  onChange: (value: VisibilityLevel) => void;
  counts?: Partial<Record<VisibilityLevel, number>>;
  catalogue?: boolean;
};

export function LodControl({
  value,
  onChange,
  counts,
  catalogue = false,
}: Props) {
  return (
    <div
      className={
        catalogue
          ? 'lod-control lod-control--catalogue'
          : 'border-y hairline py-4'
      }
      data-lod-control
    >
      <p
        className={
          catalogue
            ? 'lod-control__catalogue-label'
            : 'mb-2 text-xs font-bold text-ink'
        }
      >
        {catalogue ? 'LEVEL OF DETAIL' : '表示する範囲'}
      </p>
      <div
        className={
          catalogue
            ? 'lod-control__catalogue-options'
            : 'inline-grid min-w-[264px] grid-cols-3 overflow-hidden rounded-sm border hairline bg-raised'
        }
        role="group"
        aria-label="表示する範囲"
      >
        {LOD_LEVELS.map((level, index) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            aria-pressed={value === level}
            className={
              catalogue
                ? 'lod-control__catalogue-option'
                : `min-h-11 px-3 py-2 text-sm font-medium transition-colors active:translate-y-px ${
                    index > 0 ? 'border-l hairline' : ''
                  } ${
                    value === level
                      ? 'bg-ink text-paper underline decoration-accent decoration-2 underline-offset-4'
                      : 'text-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            {VISIBILITY_LEVEL_LABELS[level]}
            {counts?.[level] !== undefined && (
              <span
                className={
                  catalogue
                    ? 'lod-control__catalogue-count'
                    : 'ml-1 text-[10px] tabular-nums'
                }
              >
                {counts[level]}
              </span>
            )}
          </button>
        ))}
      </div>
      <p
        className={
          catalogue
            ? 'sr-only'
            : 'mt-2 text-xs leading-relaxed text-muted'
        }
        aria-live="polite"
      >
        {VISIBILITY_LEVEL_DESCRIPTIONS[value]}
      </p>
    </div>
  );
}
