'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
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

const DRAG_THRESHOLD = 10;
const INNER_DEAD_ZONE = 45;
const OUTER_RADIUS = 168;
const FAN_ANGLE = 90;
const fanSectorPaths = [
  'M 172 172 L 4 172 A 168 168 0 0 1 26.51 88 Z',
  'M 172 172 L 26.51 88 A 168 168 0 0 1 88 26.51 Z',
  'M 172 172 L 88 26.51 A 168 168 0 0 1 172 4 Z',
] as const;

type PointerGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  startedOpen: boolean;
  dragging: boolean;
};

export function getLodLevelFromFanPointer(
  towardLeft: number,
  towardTop: number,
): VisibilityLevel | null {
  const radius = Math.hypot(towardLeft, towardTop);
  if (
    radius < INNER_DEAD_ZONE ||
    radius > OUTER_RADIUS + 8 ||
    towardLeft < 0 ||
    towardTop < 0
  ) {
    return null;
  }

  const angle = (Math.atan2(towardTop, towardLeft) * 180) / Math.PI;
  if (angle < 0 || angle > FAN_ANGLE) return null;
  const index = Math.min(
    LOD_LEVELS.length - 1,
    Math.floor(angle / (FAN_ANGLE / LOD_LEVELS.length)),
  );
  return LOD_LEVELS[index];
}

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
  const gestureRef = useRef<PointerGesture | null>(null);
  const pointerOpeningRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [dragLevel, setDragLevel] = useState<VisibilityLevel | null>(null);
  const [hoverLevel, setHoverLevel] = useState<VisibilityLevel | null>(null);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    setDragLevel(null);
    setHoverLevel(null);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open || pointerOpeningRef.current) return;
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

  const levelAtPointer = useCallback((clientX: number, clientY: number) => {
    const trigger = triggerRef.current;
    if (!trigger) return null;

    const rect = trigger.getBoundingClientRect();
    const hingeX = rect.left + rect.width / 2;
    const hingeY = rect.top + rect.height / 2;
    const towardLeft = hingeX - clientX;
    const towardTop = hingeY - clientY;
    return getLodLevelFromFanPointer(towardLeft, towardTop);
  }, []);

  const handleTriggerPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.button !== 0) return;
    pointerOpeningRef.current = true;
    suppressNextClickRef.current = true;
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startedOpen: open,
      dragging: false,
    };
    setDragLevel(null);
    setOpen(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleTriggerPointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const distance = Math.hypot(
      event.clientX - gesture.startX,
      event.clientY - gesture.startY,
    );
    if (!gesture.dragging && distance >= DRAG_THRESHOLD) {
      gesture.dragging = true;
    }
    if (!gesture.dragging) return;
    event.preventDefault();
    setDragLevel(levelAtPointer(event.clientX, event.clientY));
  };

  const finishPointerGesture = (
    event: ReactPointerEvent<HTMLButtonElement>,
    cancelled = false,
  ) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    pointerOpeningRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (cancelled) {
      suppressNextClickRef.current = false;
      close(false);
      return;
    }

    const distance = Math.hypot(
      event.clientX - gesture.startX,
      event.clientY - gesture.startY,
    );
    const dragged = gesture.dragging || distance >= DRAG_THRESHOLD;
    if (dragged) {
      const level = levelAtPointer(event.clientX, event.clientY);
      if (level && level !== value) onChange(level);
      close(false);
      return;
    }

    setDragLevel(null);
    if (gesture.startedOpen) close(false);
  };

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
      data-lod-drag-active={dragLevel || undefined}
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
        data-fan-angle={FAN_ANGLE}
        data-fan-radius={OUTER_RADIUS}
        onPointerUp={(event) => {
          if ((event.target as Element).closest('[data-lod-option]')) return;
          const level = levelAtPointer(event.clientX, event.clientY);
          if (!level) return;
          if (level !== value) onChange(level);
          close(true);
        }}
      >
        <svg
          className="semantic-lod-fab__fan-lines"
          viewBox="0 0 172 172"
          aria-hidden="true"
        >
          {LOD_LEVELS.map((level, index) => (
            <path
              key={level}
              className="semantic-lod-fab__fan-sector-shape"
              d={fanSectorPaths[index]}
              data-selected={level === value || undefined}
              data-highlight={
                dragLevel === level || hoverLevel === level || undefined
              }
            />
          ))}
          <path
            className="semantic-lod-fab__fan-outline"
            d="M 172 172 L 4 172 A 168 168 0 0 1 172 4 Z"
          />
          <path
            className="semantic-lod-fab__fan-separator"
            d="M 172 172 L 26.51 88"
          />
          <path
            className="semantic-lod-fab__fan-separator"
            d="M 172 172 L 88 26.51"
          />
        </svg>
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
                data-drag-highlight={dragLevel === level || undefined}
                data-lod-option={level}
                onPointerEnter={() => setHoverLevel(level)}
                onPointerLeave={() => setHoverLevel(null)}
                onClick={() => {
                  if (!selected) onChange(level);
                  close(true);
                }}
              >
                <span className="semantic-lod-fab__segment-content">
                  <span className="semantic-lod-fab__segment-label">{label}</span>
                  {count !== undefined && (
                    <span className="semantic-lod-fab__segment-count">{count}</span>
                  )}
                  <span
                    className="semantic-lod-fab__selection-mark"
                    aria-hidden="true"
                  />
                </span>
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
        onPointerDown={handleTriggerPointerDown}
        onPointerMove={handleTriggerPointerMove}
        onPointerUp={(event) => finishPointerGesture(event)}
        onPointerCancel={(event) => finishPointerGesture(event, true)}
        onClick={() => {
          if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            return;
          }
          if (open) close(false);
          else openMenu();
        }}
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
