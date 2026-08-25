import Link from 'next/link';
import type { Movement } from '@/lib/schema';
import { formatDateRange, worksOf } from '@/lib/dataset';
import { ClassificationBadge, RegionBadges } from './Badges';
import { WorkImage } from './WorkImage';

export function MovementCard({ movement: m }: { movement: Movement }) {
  const representativeWork = worksOf(m)[0];

  return (
    <Link
      href={`/movements/${m.id}/`}
      className="movement-directory-card group"
    >
      <div className="movement-directory-card__media" aria-hidden={!representativeWork}>
        {representativeWork ? (
          <WorkImage
            work={representativeWork}
            surface="movement-card"
            sizes="(max-width: 767px) 36vw, (max-width: 1279px) 180px, 160px"
          />
        ) : (
          <div className="movement-directory-card__empty-media" aria-hidden="true">
            <span>{m.nameJa.slice(0, 1)}</span>
          </div>
        )}
      </div>

      <div className="movement-directory-card__body">
        <div className="movement-directory-card__heading">
          <div>
            <h3>{m.nameJa}</h3>
            <p>{m.nameEn}</p>
          </div>
          <span className="movement-directory-card__arrow" aria-hidden="true">→</span>
        </div>
        <p className="movement-directory-card__dates">{formatDateRange(m)}</p>
        <div className="movement-directory-card__meta">
          <RegionBadges regionIds={m.regionIds} />
          <ClassificationBadge kind={m.classification} />
        </div>
      </div>
    </Link>
  );
}
