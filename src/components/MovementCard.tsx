import Link from 'next/link';
import type { Movement } from '@/lib/schema';
import { formatDateRange } from '@/lib/dataset';
import { ClassificationBadge, RegionBadges } from './Badges';

export function MovementCard({ movement: m }: { movement: Movement }) {
  return (
    <Link
      href={`/movements/${m.id}/`}
      className="group flex flex-col gap-2 border hairline bg-raised p-4 transition-colors hover:border-ink/30"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs tabular-nums text-faint">{formatDateRange(m)}</span>
        <ClassificationBadge kind={m.classification} />
      </div>
      <h3 className="font-serif text-lg leading-snug text-ink group-hover:text-accent">
        {m.nameJa}
      </h3>
      <p className="text-xs uppercase tracking-wider text-faint">{m.nameEn}</p>
      <p className="mt-1 line-clamp-3 text-sm text-muted">{m.summary}</p>
      <div className="mt-auto pt-2">
        <RegionBadges regionIds={m.regionIds} />
      </div>
    </Link>
  );
}
