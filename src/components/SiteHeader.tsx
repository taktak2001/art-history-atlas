'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { href: '/timeline/', label: '横型タイムライン' },
  { href: '/chronology/', label: '縦型年表' },
  { href: '/matrix/', label: '時代×地域' },
  { href: '/network/', label: '関係' },
  { href: '/movements/', label: 'ムーブメント' },
  { href: '/compare/', label: '比較' },
  { href: '/sources/', label: '出典' },
  { href: '/about/', label: '編集方針' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="site-header__inner mx-auto flex max-w-layout items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="site-wordmark"
          aria-label="Art History Atlas ホーム"
          onClick={() => setOpen(false)}
        >
          <span className="sr-only">Art History Atlas</span>
          <span className="site-wordmark__stack" aria-hidden="true">
            <span className="site-wordmark__line"><span>A</span><span>R</span><span>T</span></span>
            <span className="site-wordmark__line"><span>H</span><span>I</span><span>S</span><span>T</span><span>O</span><span>R</span><span>Y</span></span>
            <span className="site-wordmark__line"><span>A</span><span>T</span><span>L</span><span>A</span><span>S</span></span>
          </span>
        </Link>

        <div className="site-header__actions flex items-center">
          <nav aria-label="主要ナビゲーション" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`rounded px-2.5 py-2 text-sm transition-colors hover:text-ink ${
                      isActive(item.href)
                        ? 'text-ink font-medium'
                        : 'text-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ThemeToggle />

          <button
            type="button"
            className="site-header-control inline-flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">メニューを{open ? '閉じる' : '開く'}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="モバイルナビゲーション"
          className="border-t hairline bg-paper lg:hidden"
        >
          <ul className="mx-auto grid max-w-layout grid-cols-2 gap-px px-2 py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`block rounded px-3 py-3 text-sm ${
                    isActive(item.href) ? 'bg-surface text-ink font-medium' : 'text-muted'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
