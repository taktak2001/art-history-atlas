'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | null;

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem('aha-theme') as Theme) ?? null;
    setTheme(stored);
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    const root = document.documentElement;
    if (next) {
      root.setAttribute('data-theme', next);
      localStorage.setItem('aha-theme', next);
    } else {
      root.removeAttribute('data-theme');
      localStorage.removeItem('aha-theme');
    }
  };

  // 現在の実効テーマ（未設定ならOS設定）で切り替え先を決める
  const toggle = () => {
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effective = theme ?? (prefersDark ? 'dark' : 'light');
    apply(effective === 'dark' ? 'light' : 'dark');
  };

  const label = mounted
    ? theme === 'dark'
      ? 'ライトモードに切り替え'
      : 'ダークモードに切り替え'
    : 'テーマを切り替え';

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-11 w-11 items-center justify-center rounded text-muted hover:text-ink"
      aria-label={label}
      title={label}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        {mounted && theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" strokeLinecap="round" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
