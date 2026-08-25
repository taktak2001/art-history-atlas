'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Books,
  ChartLine,
  Columns,
  House,
  ListNumbers,
  PencilLine,
  ShareNetwork,
  SquaresFour,
  type Icon,
} from '@phosphor-icons/react';
import { ThemeToggle } from './ThemeToggle';

const primaryNavigation = [
  { href: '/movements/', label: 'ムーブメント', english: 'Movements', icon: SquaresFour },
  { href: '/chronology/', label: '縦型', english: 'Chronology', icon: ListNumbers },
  { href: '/timeline/', label: '横型', english: 'Timeline', icon: ChartLine },
  { href: '/compare/', label: '比較', english: 'Compare', icon: Columns },
  { href: '/network/', label: '関係', english: 'Relationship', icon: ShareNetwork },
] as const;

const referenceNavigation = [
  { href: '/sources/', label: '出典', english: 'Sources', icon: Books },
  { href: '/about/', label: '編集方針', english: 'Methodology', icon: PencilLine },
] as const;

function SidebarLink({
  href,
  label,
  english,
  icon: IconComponent,
  current,
}: {
  href: string;
  label: string;
  english: string;
  icon: Icon;
  current: boolean;
}) {
  return (
    <Link
      href={href}
      className="movement-directory-sidebar__link"
      aria-current={current ? 'page' : undefined}
    >
      <IconComponent
        className="movement-directory-sidebar__icon"
        size={19}
        weight="regular"
        aria-hidden="true"
      />
      <span className="movement-directory-sidebar__copy">
        <strong>{label}</strong>
        <small>{english}</small>
      </span>
    </Link>
  );
}

export function MovementDirectorySidebar() {
  const pathname = usePathname();
  const isCurrent = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/movements/') {
      return ['/movements/', '/artists/', '/works/'].some((prefix) =>
        pathname.startsWith(prefix),
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="movement-directory-sidebar" aria-label="サイトナビゲーション">
      <div>
        <Link
          href="/"
          className="movement-directory-sidebar__brand"
          aria-label="Art History Atlas ホーム"
        >
          <span aria-hidden="true">ART</span>
          <span aria-hidden="true">HISTORY</span>
          <span aria-hidden="true">ATLAS</span>
        </Link>

        <nav className="movement-directory-sidebar__navigation" aria-label="主要画面">
          <p className="movement-directory-sidebar__eyebrow">Explore</p>
          <Link
            href="/"
            className="movement-directory-sidebar__home"
            aria-current={isCurrent('/') ? 'page' : undefined}
          >
            <House
              className="movement-directory-sidebar__icon"
              size={19}
              weight="regular"
              aria-hidden="true"
            />
            <span className="movement-directory-sidebar__copy">
              <strong>ホーム</strong>
              <small>Home</small>
            </span>
          </Link>
          <ul className="movement-directory-sidebar__list">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <SidebarLink {...item} current={isCurrent(item.href)} />
              </li>
            ))}
          </ul>
        </nav>

        <nav className="movement-directory-sidebar__reference" aria-label="出典と編集方針">
          <p className="movement-directory-sidebar__eyebrow">Reference</p>
          <ul className="movement-directory-sidebar__list">
            {referenceNavigation.map((item) => (
              <li key={item.href}>
                <SidebarLink {...item} current={isCurrent(item.href)} />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="movement-directory-sidebar__footer">
        <ThemeToggle />
        <p>© 2026 Art History Atlas</p>
        <p>教育目的の非営利プロジェクト</p>
      </div>
    </aside>
  );
}
