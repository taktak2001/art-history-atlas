import Link from 'next/link';
import type { Movement } from '@/lib/schema';
import { formatDateRange, worksOf } from '@/lib/dataset';
import { ClassificationBadge, RegionBadges } from './Badges';
import { WorkImage } from './WorkImage';

export function MovementCard({
  movement: m,
  linkUnavailableImageToSource = false,
}: {
  movement: Movement;
  linkUnavailableImageToSource?: boolean;
}) {
  const representativeWork = worksOf(m)[0];

  const media = representativeWork ? (
    <WorkImage
      work={representativeWork}
      surface="movement-card"
      showReferenceLink={linkUnavailableImageToSource}
      sizes="(max-width: 767px) 36vw, (max-width: 1279px) 180px, 160px"
    />
  ) : (
    <div className="movement-directory-card__empty-media" aria-hidden="true">
      <span>{m.nameJa.slice(0, 1)}</span>
    </div>
  );

  const body = (
    <>
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
    </>
  );

  if (linkUnavailableImageToSource) {
    return (
      <article className="movement-directory-card movement-directory-card--split group">
        <div className="movement-directory-card__media" aria-hidden={!representativeWork}>
          {media}
        </div>
        <Link
          href={`/movements/${m.id}/`}
          className="movement-directory-card__body movement-directory-card__body--link"
        >
          {body}
        </Link>
      </article>
    );
  }

  return (
    <Link
      href={`/movements/${m.id}/`}
      className="movement-directory-card group"
    >
      <div className="movement-directory-card__media" aria-hidden={!representativeWork}>
        {media}
      </div>

      <div className="movement-directory-card__body">
        {body}
      </div>
    </Link>
  );
}
