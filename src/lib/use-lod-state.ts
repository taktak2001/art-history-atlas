'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { VisibilityLevel } from '@/lib/schema';
import { parseMovementLod } from '@/lib/movement-hierarchy';

function replaceLodQuery(lod: VisibilityLevel) {
  const url = new URL(window.location.href);
  url.searchParams.set('lod', lod);
  window.history.replaceState(window.history.state, '', url);
}

/**
 * URLクエリを単一の共有状態として扱う軽量なLOD hook。
 * Next Routerを介さないため、静的exportとGitHub PagesのbasePathをそのまま保つ。
 */
export function useLodState(defaultLod: VisibilityLevel) {
  const [lod, setLodState] = useState<VisibilityLevel>(defaultLod);
  const [hasExplicitChoice, setHasExplicitChoice] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const readUrl = () => {
      const raw = new URL(window.location.href).searchParams.get('lod');
      const parsed = parseMovementLod(raw, defaultLod);
      setLodState(parsed);
      setHasExplicitChoice(raw === 'core' || raw === 'standard' || raw === 'detailed');
      initialized.current = true;
    };
    readUrl();
    window.addEventListener('popstate', readUrl);
    return () => window.removeEventListener('popstate', readUrl);
  }, [defaultLod]);

  const setLod = useCallback((next: VisibilityLevel, userInitiated = true) => {
    setLodState(next);
    if (userInitiated) setHasExplicitChoice(true);
    if (typeof window !== 'undefined') replaceLodQuery(next);
  }, []);

  const applyPurposeDefault = useCallback(
    (next: VisibilityLevel) => {
      if (hasExplicitChoice || !initialized.current) return;
      setLodState(next);
      replaceLodQuery(next);
    },
    [hasExplicitChoice],
  );

  /**
   * 既定値へ戻し、URLからも lod を取り除く。
   * （focus解除時など「遷移前の通常状態」へ復帰させるために使う）
   */
  const clearLod = useCallback(() => {
    setLodState(defaultLod);
    setHasExplicitChoice(false);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('lod');
    window.history.replaceState(window.history.state, '', url);
  }, [defaultLod]);

  return { lod, setLod, applyPurposeDefault, clearLod, hasExplicitChoice };
}
