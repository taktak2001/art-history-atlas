'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { VisibilityLevel } from '@/lib/schema';
import { parseMovementLod } from '@/lib/movement-hierarchy';

function writeLodQuery(
  lod: VisibilityLevel,
  mode: 'push' | 'replace' = 'replace',
) {
  const url = new URL(window.location.href);
  if (url.searchParams.get('lod') === lod) return;
  url.searchParams.set('lod', lod);
  if (mode === 'push') {
    window.history.pushState(window.history.state, '', url);
    return;
  }
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
    if (typeof window !== 'undefined') {
      writeLodQuery(next, userInitiated ? 'push' : 'replace');
    }
  }, []);

  const applyPurposeDefault = useCallback(
    (next: VisibilityLevel) => {
      if (hasExplicitChoice || !initialized.current) return;
      setLodState(next);
      writeLodQuery(next);
    },
    [hasExplicitChoice],
  );

  return { lod, setLod, applyPurposeDefault, hasExplicitChoice };
}
