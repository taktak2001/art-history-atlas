'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { LOD_LEVELS } from '@/lib/movement-hierarchy';
import {
  VISIBILITY_LEVEL_LABELS,
  type VisibilityLevel,
} from '@/lib/schema';

type Props = {
  value: VisibilityLevel;
  onChange: (value: VisibilityLevel) => void;
  counts?: Partial<Record<VisibilityLevel, number>>;
  placement?: 'page' | 'viewer';
  bottomOffset?: number | string;
};

const densityByLevel: Record<VisibilityLevel, number> = {
  core: 1,
  standard: 2,
  detailed: 3,
};

export function SemanticLodFab({
  value,
  onChange,
  counts,
  placement = 'page',
  bottomOffset,
}: Props) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      const selectedIndex = LOD_LEVELS.indexOf(value);
      optionRefs.current[selectedIndex]?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      close(false);
    };
    const onPopState = () => close(false);

    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('popstate', onPopState);
    };
  }, [close, open]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }

    const currentIndex = optionRefs.current.findIndex(
      (option) => option === document.activeElement,
    );
    let nextIndex: number | null = null;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + LOD_LEVELS.length) % LOD_LEVELS.length;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % LOD_LEVELS.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = LOD_LEVELS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      optionRefs.current[nextIndex]?.focus();
    }
  };

  const offset =
    typeof bottomOffset === 'number' ? `${bottomOffset}px` : bottomOffset;
  const style = offset
    ? ({ '--semantic-lod-bottom-offset': offset } as CSSProperties)
    : undefined;
  const currentLabel = VISIBILITY_LEVEL_LABELS[value];

  return (
    <div
      ref={rootRef}
      className={`semantic-lod-fab semantic-lod-fab--${placement}`}
      data-semantic-lod-fab
      data-lod-control
      data-lod-open={open || undefined}
      data-lod-value={value}
      style={style}
      onKeyDown={(event) => {
        if (!open || event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        close(true);
      }}
    >
      <div
        id={menuId}
        className="semantic-lod-fab__leaf"
        role="menu"
        aria-label="表示密度"
        aria-hidden={!open}
        inert={!open ? true : undefined}
        onKeyDown={handleMenuKeyDown}
        data-semantic-lod-menu
        data-open={open || undefined}
      >
          {LOD_LEVELS.map((level, index) => {
            const selected = level === value;
            const label = VISIBILITY_LEVEL_LABELS[level];
            const count = counts?.[level];
            return (
              <button
                key={level}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                className="semantic-lod-fab__segment"
                role="menuitemradio"
                aria-checked={selected}
                aria-label={`${label}に切り替え${count === undefined ? '' : `、${count}件`}`}
                data-selected={selected || undefined}
                data-lod-option={level}
                onClick={() => {
                  if (!selected) onChange(level);
                  close(true);
                }}
              >
                <span className="semantic-lod-fab__segment-label">{label}</span>
                {count !== undefined && (
                  <span className="semantic-lod-fab__segment-count">{count}</span>
                )}
                <span className="semantic-lod-fab__selection-mark" aria-hidden="true" />
              </button>
            );
          })}
      </div>

      <button
        ref={triggerRef}
        type="button"
        className="semantic-lod-fab__trigger"
        aria-label="表示密度を変更"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        title={`表示密度: ${currentLabel}`}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={(event) => {
          if (
            !open &&
            ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
              event.key,
            )
          ) {
            event.preventDefault();
            openMenu();
          }
        }}
      >
        <span className="semantic-lod-fab__density" aria-hidden="true">
          {[1, 2, 3].map((line) => (
            <span
              key={line}
              data-active={line <= densityByLevel[value] || undefined}
            />
          ))}
        </span>
        <span className="sr-only">現在は{currentLabel}</span>
      </button>
    </div>
  );
}
