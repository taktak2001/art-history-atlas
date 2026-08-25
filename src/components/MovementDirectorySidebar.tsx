import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

const primaryNavigation = [
  { href: '/movements/', label: 'ムーブメント', english: 'Movements', current: true },
  { href: '/chronology/', label: '縦型', english: 'Chronology', current: false },
  { href: '/timeline/', label: '横型', english: 'Timeline', current: false },
  { href: '/compare/', label: '比較', english: 'Compare', current: false },
  { href: '/network/', label: '関係', english: 'Relationship', current: false },
] as const;

const referenceNavigation = [
  { href: '/sources/', label: '出典', english: 'Sources' },
  { href: '/about/', label: '編集方針', english: 'Methodology' },
] as const;

export function MovementDirectorySidebar() {
  return (
    <aside className="movement-directory-sidebar" aria-label="ムーブメント一覧のナビゲーション">
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
          <Link href="/" className="movement-directory-sidebar__home">
            <span className="movement-directory-sidebar__home-mark" aria-hidden="true">⌂</span>
            <span>
              <strong>ホーム</strong>
              <small>Home</small>
            </span>
          </Link>
          <ul className="movement-directory-sidebar__list">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="movement-directory-sidebar__link"
                  aria-current={item.current ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  <small>{item.english}</small>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="movement-directory-sidebar__reference" aria-label="出典と編集方針">
          <p className="movement-directory-sidebar__eyebrow">Reference</p>
          <ul className="movement-directory-sidebar__list">
            {referenceNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="movement-directory-sidebar__link">
                  <span>{item.label}</span>
                  <small>{item.english}</small>
                </Link>
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
