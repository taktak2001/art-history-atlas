'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  describeMovement,
  getInitialMovements,
  groupMovementsByEra,
  pushRecentId,
  readRecentIds,
  searchMovements,
  RECENT_STORAGE_KEY,
} from '@/lib/movement-picker';
import type { Movement } from '@/lib/schema';

/**
 * 検索可能なムーブメントピッカー（共通コンポーネント）。
 *
 * 比較ページ・ホーム検索・ネットワークのフォーカス選択・タイムラインのジャンプで
 * 再利用できるよう、選択状態は呼び出し側が持ち、ここは「探して選ぶ」だけを担う。
 *
 * - モバイル: 画面下から立ち上がるシート（ヘッダーと検索欄は固定）
 * - デスクトップ: トリガー直下のポップオーバー
 * 検索・グループ化・行の表示はどちらも同じロジックを使う。
 */
export function MovementPicker({
  open,
  onClose,
  selectedIds,
  onToggle,
  max,
  title = 'ムーブメントを追加',
  triggerRef,
  mode = 'select',
  closeOnSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  /** 行を押したときの選択・解除。上限判定は呼び出し側と共有する */
  onToggle: (movement: Movement) => void;
  max: number;
  title?: string;
  /** 閉じたときにフォーカスを戻す先 */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /**
   * 用途。
   * - select: 複数選ぶ（比較ページ）。選択中の件数と上限を出す
   * - navigate: 1件選んで移動する（ネットワークのフォーカス、タイムラインのジャンプ）
   */
  mode?: 'select' | 'navigate';
  /** 選択したら閉じるか。既定は navigate のとき true */
  closeOnSelect?: boolean;
}) {
  const isNavigate = mode === 'navigate';
  const shouldCloseOnSelect = closeOnSelect ?? isNavigate;
  const [query, setQuery] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listId = useId();
  const headingId = useId();

  useEffect(() => {
    if (!open) return;
    setRecentIds(readRecentIds(window.localStorage.getItem(RECENT_STORAGE_KEY)));
    setQuery('');
    setActiveIndex(0);
    // 検索欄へフォーカス（モバイルのキーボード表示は許容）
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open]);

  const results = useMemo(
    () => (query.trim() ? searchMovements(query) : getInitialMovements(recentIds)),
    [query, recentIds],
  );
  const groups = useMemo(() => groupMovementsByEra(results), [results]);
  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  const close = useCallback(() => {
    onClose();
    triggerRef?.current?.focus();
  }, [onClose, triggerRef]);

  const choose = useCallback(
    (movement: Movement) => {
      onToggle(movement);
      if (!selectedIds.includes(movement.id)) {
        const next = pushRecentId(recentIds, movement.id);
        setRecentIds(next);
        window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      }
      if (shouldCloseOnSelect) close();
    },
    [close, onToggle, recentIds, selectedIds, shouldCloseOnSelect],
  );

  // Escapeで閉じる／外側クリックで閉じる／フォーカストラップ
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => {
          if (flat.length === 0) return 0;
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          return (current + delta + flat.length) % flat.length;
        });
        return;
      }
      if (event.key === 'Enter') {
        const movement = flat[activeIndex];
        if (movement) {
          event.preventDefault();
          choose(movement);
        }
        return;
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !triggerRef?.current?.contains(event.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [activeIndex, choose, close, flat, open, triggerRef]);

  if (!open) return null;

  const atLimit = !isNavigate && selectedIds.length >= max;

  return (
    <div className="movement-picker" data-movement-picker>
      {/* モバイルのシート背景。デスクトップでは透明のクリック捕捉のみ */}
      <div className="movement-picker__scrim" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="movement-picker__panel"
      >
        <div className="movement-picker__header">
          <h2 id={headingId} className="movement-picker__title">
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="ムーブメントの追加を閉じる"
            className="movement-picker__close"
          >
            ×
          </button>
        </div>

        <div className="movement-picker__search">
          <label htmlFor={`${listId}-input`} className="sr-only">
            ムーブメントを検索
          </label>
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="ムーブメント名・作家・作品など"
            className="movement-picker__input"
          />
          <p className="movement-picker__status" aria-live="polite">
            {query.trim()
              ? `検索結果 ${flat.length}件`
              : recentIds.length > 0
                ? '最近選んだムーブメントと主要な項目'
                : '主要なムーブメント'}
          </p>
        </div>

        {!isNavigate && (
          <div className="movement-picker__selected">
            <p className="movement-picker__count">
              選択中 {selectedIds.length}/{max}
            </p>
            {atLimit && (
              <p className="movement-picker__limit">比較できるのは最大{max}件です</p>
            )}
          </div>
        )}

        <div className="movement-picker__results" id={listId} role="listbox">
          {groups.length === 0 ? (
            <p className="movement-picker__empty">
              一致するムーブメントがありません。別の語で検索してください。
            </p>
          ) : (
            groups.map((group) => (
              <section key={group.era} className="movement-picker__group">
                <h3 className="movement-picker__group-title">{group.label}</h3>
                <ul>
                  {group.items.map((movement) => {
                    const isSelected = selectedIds.includes(movement.id);
                    const disabled = atLimit && !isSelected;
                    const index = flat.findIndex((item) => item.id === movement.id);
                    return (
                      <li key={movement.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={disabled}
                          data-active={index === activeIndex ? 'true' : undefined}
                          data-movement-option={movement.id}
                          onClick={() => choose(movement)}
                          className="movement-picker__option"
                        >
                          <span className="movement-picker__name">
                            {movement.nameJa}
                          </span>
                          <span className="movement-picker__meta">
                            {describeMovement(movement)}
                          </span>
                          {isSelected && (
                            <span className="movement-picker__selected-mark">
                              選択中
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>

        {!isNavigate && (
          <div className="movement-picker__footer">
            <p className="movement-picker__count">
              選択中 {selectedIds.length}/{max}
            </p>
            <button
              type="button"
              onClick={close}
              className="movement-picker__done"
            >
              完了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
