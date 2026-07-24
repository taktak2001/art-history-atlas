import Link from 'next/link';
import type { Work } from '@/lib/schema';
import { WorkImage } from './WorkImage';

/**
 * 代表作品の画像グリッド。
 * 画像を押すと作品詳細へ移動し、作者・作品名・制作年・所蔵先を簡潔に表示する。
 * 画像比率はアスペクト枠で吸収され、レイアウトは崩れない。
 */
export function WorkGrid({ works }: { works: Work[] }) {
  if (works.length === 0) {
    return (
      <p className="text-sm text-faint">個別の作品データは今後追加予定です。</p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {works.map((w) => (
        <li key={w.id}>
          <Link
            href={`/works/${w.id}/`}
            className="group block focus-visible:outline-none"
          >
            <WorkImage
              work={w}
              sizes="(max-width: 640px) 45vw, 220px"
              className="transition-opacity group-hover:opacity-90"
            />
            <p className="mt-2 line-clamp-2 font-serif text-sm leading-snug text-ink group-hover:text-accent">
              {w.titleJa}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted">{w.creatorName}</p>
            <p className="text-xs text-faint">
              {w.year}
              {w.collection ? `／${w.collection}` : ''}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
