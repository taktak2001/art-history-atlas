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
  compact?: boolean;
  exhibition?: boolean;
  catalogue?: boolean;
};

const EXHIBITION_LABELS: Record<VisibilityLevel, string> = {
  core: 'Basic',
  standard: 'Standard',
  detailed: 'Complete',
};

export function LodControl({
  value,
  onChange,
  counts,
  compact = false,
  exhibition = false,
  catalogue = false,
}: Props) {
  return (
    <div
      className={
        exhibition
          ? 'lod-control lod-control--exhibition'
          : catalogue
          ? 'lod-control lod-control--catalogue'
          : compact
          ? 'lod-control lod-control--compact'
          : 'border-y hairline py-4'
      }
      data-lod-control
    >
      {!exhibition && (
        <p
          className={
            catalogue
              ? 'lod-control__catalogue-label'
              : compact
              ? 'lod-control__label'
              : 'mb-2 text-xs font-bold text-ink'
          }
        >
          {catalogue ? 'Level of detail' : '表示する範囲'}
        </p>
      )}
      <div
        className={
          exhibition
            ? 'lod-control__exhibition-options'
            : catalogue
            ? 'lod-control__catalogue-options'
            : `inline-grid grid-cols-3 overflow-hidden rounded-sm border hairline bg-raised ${
                compact ? 'lod-control__options' : 'min-w-[264px]'
              }`
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
            aria-label={
              exhibition
                ? `${EXHIBITION_LABELS[level]}（${VISIBILITY_LEVEL_LABELS[level]}）${
                    counts?.[level] !== undefined ? ` ${counts[level]}件` : ''
                  }`
                : undefined
            }
            title={exhibition ? VISIBILITY_LEVEL_DESCRIPTIONS[level] : undefined}
            className={
              exhibition
                ? `lod-control__exhibition-option ${
                    index > 0 ? 'border-l hairline' : ''
                  }`
                : catalogue
                ? 'lod-control__catalogue-option'
                : `min-h-11 text-sm font-medium transition-colors active:translate-y-px ${
                    compact ? 'px-2 py-1.5' : 'px-3 py-2'
                  } ${
                    index > 0 ? 'border-l hairline' : ''
                  } ${
                    value === level
                      ? 'bg-ink text-paper underline decoration-accent decoration-2 underline-offset-4'
                      : 'text-muted hover:bg-surface hover:text-ink'
                  }`
            }
          >
            {exhibition
              ? EXHIBITION_LABELS[level]
              : VISIBILITY_LEVEL_LABELS[level]}
            {counts?.[level] !== undefined && (
              <span
                className={
                  exhibition
                    ? 'lod-control__exhibition-count'
                    : catalogue
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
          exhibition || catalogue
            ? 'sr-only'
            : compact
            ? 'lod-control__description'
            : 'mt-2 text-xs leading-relaxed text-muted'
        }
        aria-live="polite"
      >
        {VISIBILITY_LEVEL_DESCRIPTIONS[value]}
      </p>
    </div>
  );
}
