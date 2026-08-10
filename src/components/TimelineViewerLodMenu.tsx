'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { AccordionChevron } from '@/components/AccordionChevron';
import { LOD_LEVELS } from '@/lib/movement-hierarchy';
import {
  VISIBILITY_LEVEL_LABELS,
  type VisibilityLevel,
} from '@/lib/schema';

type Props = {
  value: VisibilityLevel;
  counts: Record<VisibilityLevel, number>;
  onChange: (value: VisibilityLevel) => void;
};

type PanelPosition = {
  right: number;
  bottom: number;
};

export function TimelineViewerLodMenu({ value, counts, onChange }: Props) {
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({
    right: 12,
    bottom: 72,
  });

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const openMenu = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPanelPosition({
        right: Math.max(8, window.innerWidth - rect.right),
        bottom: Math.max(8, window.innerHeight - rect.top + 8),
      });
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      selectedOptionRef.current?.focus();
    });
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      close(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLButtonElement>(
          'button:not([disabled])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [close, open]);

  const panel = open
    ? createPortal(
        <div className="timeline-viewer-lod-overlay" data-viewer-lod-overlay>
          <button
            type="button"
            className="timeline-viewer-lod-backdrop"
            aria-label="表示する範囲を閉じる"
            tabIndex={-1}
            onClick={() => close()}
          />
          <div
            ref={panelRef}
            id={panelId}
            className="timeline-viewer-lod-panel"
            role="dialog"
            aria-label="表示する範囲"
            style={
              {
                '--timeline-viewer-lod-right': `${panelPosition.right}px`,
                '--timeline-viewer-lod-bottom': `${panelPosition.bottom}px`,
              } as CSSProperties
            }
          >
            <div className="timeline-viewer-lod-panel__header">
              <p>LEVEL OF DETAIL</p>
              <button
                type="button"
                className="timeline-viewer-lod-panel__close"
                onClick={() => close()}
              >
                閉じる
              </button>
            </div>
            <div
              className="timeline-viewer-lod-options"
              role="radiogroup"
              aria-label="表示する範囲"
            >
              {LOD_LEVELS.map((level) => {
                const selected = value === level;
                return (
                  <button
                    key={level}
                    ref={selected ? selectedOptionRef : undefined}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className="timeline-viewer-lod-option"
                    data-selected={selected || undefined}
                    onClick={() => {
                      if (!selected) onChange(level);
                      close();
                    }}
                  >
                    <span
                      className="timeline-viewer-lod-option__check"
                      aria-hidden="true"
                    >
                      {selected ? '✓' : ''}
                    </span>
                    <span className="timeline-viewer-lod-option__label">
                      {VISIBILITY_LEVEL_LABELS[level]}
                    </span>
                    <span className="timeline-viewer-lod-option__count">
                      {counts[level]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        triggerRef.current?.closest<HTMLElement>(
          '[data-timeline-viewer="active"]',
        ) ?? document.body,
      )
    : null;

  return (
    <div className="timeline-viewer-lod-menu">
      <button
        ref={triggerRef}
        type="button"
        className="timeline-viewer-lod-trigger"
        onClick={() => (open ? close(false) : openMenu())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`表示する範囲、現在は${VISIBILITY_LEVEL_LABELS[value]}`}
      >
        <span className="timeline-viewer-lod-trigger__label">
          {VISIBILITY_LEVEL_LABELS[value]}
        </span>
        <AccordionChevron
          open={open}
          className="timeline-viewer-lod-trigger__chevron"
        />
      </button>
      {panel}
    </div>
  );
}
