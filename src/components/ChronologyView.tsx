'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LodControl } from '@/components/LodControl';
import { WorkImage } from '@/components/WorkImage';
import { relationships, works } from '@/lib/dataset';
import { filterMovementsByLod, getMovementParent } from '@/lib/movement-hierarchy';
import { useLodState } from '@/lib/use-lod-state';
import {
  CHRONOLOGY_ERAS,
  chronologyEntries,
  incomingMovementConnection,
  movementCause,
  movementTags,
  nextMovement,
  representativeWork,
  type HistoricEvent,
  type MovementConnection,
} from '@/lib/chronology-presentation';
import {
  CLASSIFICATION_LABELS,
  RELATION_LABELS,
  type EraId,
  type Movement,
} from '@/lib/schema';
import { formatYear } from '@/lib/dataset';

function movementRange(movement: Movement) {
  const start = formatYear(movement.dates.start);
  const end =
    movement.dates.end === null ? '現在' : formatYear(movement.dates.end);
  const circa = movement.dates.circa ? '頃' : '';
  return `${start}${circa}〜${end}${movement.dates.end !== null && movement.dates.circa ? '頃' : ''}`;
}

function RelationshipBridge({
  connection,
}: {
  connection: MovementConnection;
}) {
  return (
    <div
      className="chronology-relationship"
      data-chronology-relationship={connection.relationship.kind}
      title={connection.description}
    >
      <span aria-hidden="true" className="chronology-relationship__line" />
      <span className="chronology-relationship__label">
        {RELATION_LABELS[connection.relationship.kind]}
      </span>
      <span className="chronology-relationship__description">
        {connection.label}
      </span>
      <span aria-hidden="true" className="chronology-relationship__arrow">
        ↓
      </span>
    </div>
  );
}

function HistoricEventEntry({
  event,
  movementById,
}: {
  event: HistoricEvent;
  movementById: Map<string, Movement>;
}) {
  return (
    <article
      className="chronology-event"
      data-chronology-event={event.id}
      aria-labelledby={`event-${event.id}-title`}
    >
      <div className="chronology-event__year" aria-label={`${event.yearLabel}年`}>
        {event.yearLabel}
      </div>
      <div className="chronology-event__body">
        <p className="chronology-kicker">歴史の転換点</p>
        <h3 id={`event-${event.id}-title`} className="chronology-event__title">
          {event.title}
        </h3>
        <p className="mt-3 max-w-prose text-sm leading-7 text-muted">
          {event.summary}
        </p>
        <div className="chronology-event__impact">
          <span className="chronology-event__impact-mark" aria-hidden="true">
            ↓
          </span>
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-faint">
              美術への作用
            </p>
            <p className="mt-1 text-sm leading-7 text-ink">{event.impact}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.affectedMovementIds.map((id) => {
                const movement = movementById.get(id);
                if (!movement) return null;
                return (
                  <Link
                    key={id}
                    href={`/movements/${id}/`}
                    className="chronology-impact-link"
                  >
                    {movement.nameJa}
                    <span aria-hidden="true"> →</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MovementEntry({
  movement,
  allMovements,
  visibleMovements,
}: {
  movement: Movement;
  allMovements: Movement[];
  visibleMovements: Movement[];
}) {
  const work = representativeWork(movement, works);
  const cause = movementCause(movement, allMovements, relationships);
  const tags = movementTags(movement, work, cause);
  const next = nextMovement(movement, visibleMovements, relationships);
  const parent = getMovementParent(movement.id, allMovements);
  const connection = incomingMovementConnection(
    movement,
    visibleMovements,
    relationships,
  );

  return (
    <>
      {connection && <RelationshipBridge connection={connection} />}
      <article
        className="chronology-movement"
        data-chronology-movement={movement.id}
        data-hierarchy-level={parent ? 'child' : 'root'}
        aria-labelledby={`movement-${movement.id}-title`}
      >
        <div className="chronology-movement__date">
          <span className="chronology-movement__start">
            {formatYear(movement.dates.start).replace('年', '')}
          </span>
          <span className="mt-1 block text-xs font-medium text-faint">
            {movement.dates.circa ? '頃から' : 'から'}
          </span>
        </div>

        <div className="chronology-movement__exhibit">
          <div className="chronology-movement__heading">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chronology-classification">
                  {CLASSIFICATION_LABELS[movement.classification]}
                </span>
                {parent && (
                  <span className="text-[11px] text-faint">
                    {parent.nameJa}の下位分類
                  </span>
                )}
              </div>
              <h3
                id={`movement-${movement.id}-title`}
                className="mt-3 font-serif text-[1.7rem] leading-tight tracking-tight text-ink sm:text-3xl"
              >
                <Link
                  href={`/movements/${movement.id}/`}
                  className="chronology-title-link"
                >
                  {movement.nameJa}
                </Link>
              </h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-faint">
                {movement.nameEn}
              </p>
              <p className="mt-3 text-sm tabular-nums text-muted">
                {movementRange(movement)}
              </p>
            </div>
          </div>

          {work ? (
            !work.image && work.imageReference?.sourcePageUrl ? (
              // 画像未収録：プレースホルダー全面が提供元への外部リンクになる。
              // WorkImage 自身が <a> を持つため内部リンクで包まず、
              // キャプションを作品詳細への内部リンクにする（<a>のネスト回避）。
              <div className="chronology-work">
                <WorkImage
                  work={work}
                  className="chronology-work__image"
                  sizes="(max-width: 640px) 100vw, 320px"
                  showReferenceLink
                />
                <Link
                  href={`/works/${work.id}/`}
                  className="chronology-work__caption"
                  aria-label={`${work.titleJa}の作品詳細を見る`}
                >
                  <span className="font-bold text-ink">{work.titleJa}</span>
                  <span>{work.creatorName}</span>
                  <span>{work.year}</span>
                </Link>
              </div>
            ) : (
              <Link
                href={`/works/${work.id}/`}
                className="chronology-work"
                aria-label={`${work.titleJa}の作品詳細を見る`}
              >
                <WorkImage
                  work={work}
                  className="chronology-work__image"
                  sizes="(max-width: 640px) 100vw, 320px"
                />
                <span className="chronology-work__caption">
                  <span className="font-bold text-ink">{work.titleJa}</span>
                  <span>{work.creatorName}</span>
                  <span>{work.year}</span>
                </span>
              </Link>
            )
          ) : (
            <div
              className="chronology-work chronology-work--empty"
              role="img"
              aria-label={`${movement.nameJa}の代表作品画像は未収録`}
            >
              <span className="text-xs text-muted">代表作品を確認中</span>
            </div>
          )}

          <div className="chronology-movement__text">
            <p className="max-w-prose text-[15px] leading-8 text-muted">
              {movement.summary}
            </p>

            <div className="chronology-cause" title={cause.detail}>
              <span className="chronology-cause__label">なぜ生まれたか</span>
              <span className="chronology-cause__flow">
                {cause.label}
                <span aria-hidden="true"> → </span>
                {movement.shortLabel ?? movement.nameJa}
              </span>
            </div>

            <ul
              className="chronology-tags"
              aria-label={`${movement.nameJa}の要点`}
              tabIndex={0}
            >
              {tags.map((tag) => (
                <li key={`${tag.kind}-${tag.value}`}>
                  <span>{tag.kind}</span>
                  {tag.value}
                </li>
              ))}
            </ul>

            <div className="chronology-card-footer">
              <Link
                href={`/movements/${movement.id}/`}
                className="chronology-read-link"
              >
                展示解説を読む
                <span aria-hidden="true"> →</span>
              </Link>
              {next && (
                <Link
                  href={`/movements/${next.id}/`}
                  className="chronology-next-link"
                >
                  <span>次に読む</span>
                  <strong>{next.nameJa}</strong>
                  <span aria-hidden="true"> →</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

export function ChronologyView({ movements }: { movements: Movement[] }) {
  const { lod, setLod } = useLodState('core');
  const [expandedEras, setExpandedEras] = useState<Set<EraId>>(
    () => new Set(),
  );
  const visible = filterMovementsByLod(movements, lod);
  const movementById = new Map(movements.map((movement) => [movement.id, movement]));
  const counts = {
    core: filterMovementsByLod(movements, 'core').length,
    standard: filterMovementsByLod(movements, 'standard').length,
    detailed: filterMovementsByLod(movements, 'detailed').length,
  };

  const toggleEra = (era: EraId) => {
    const willExpand = !expandedEras.has(era);
    setExpandedEras(willExpand ? new Set([era]) : new Set());

    if (willExpand) {
      window.requestAnimationFrame(() => {
        document.getElementById(`era-${era}`)?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start',
        });
      });
    }
  };

  return (
    <>
      <div className="chronology-controls">
        <LodControl
          value={lod}
          onChange={setLod}
          counts={counts}
          catalogue
        />
      </div>

      <div
        className="chronology-gallery"
        data-chronology-lod={lod}
        aria-label="時代別の常設展示"
      >
        {CHRONOLOGY_ERAS.map((era, eraIndex) => {
          const isExpanded = expandedEras.has(era.id);
          const eraMovements = visible.filter(
            (movement) => movement.era === era.id,
          );
          const entries = chronologyEntries(era.id, visible);
          const panelId = `era-${era.id}-panel`;

          return (
            <section
              key={era.id}
              id={`era-${era.id}`}
              className={`chronology-era chronology-era--${era.tone}`}
              data-era-expanded={isExpanded}
            >
              <button
                type="button"
                className="chronology-era__hero"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleEra(era.id)}
              >
                <span className="sr-only">第{eraIndex + 1}章</span>
                <span className="chronology-era__number" aria-hidden="true">
                  {String(eraIndex + 1).padStart(2, '0')}
                </span>
                <span className="chronology-era__identity">
                  <span className="chronology-era__names">
                    <span className="chronology-era__title-en">
                      {era.labelEn}
                    </span>
                    <span className="chronology-era__title">{era.label}</span>
                  </span>
                  <span className="chronology-era__details">
                    <span className="chronology-era__meta">
                      <span className="chronology-era__range">{era.range}</span>
                      <span>
                        {eraMovements.length}{' '}
                        {eraMovements.length === 1 ? 'movement' : 'movements'}
                      </span>
                    </span>
                    {isExpanded && (
                      <span className="chronology-era__catchphrase">
                        「{era.catchphrase}」
                      </span>
                    )}
                  </span>
                </span>
                <span className="chronology-era__chevron" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </span>
              </button>

              <div
                id={panelId}
                className="chronology-exhibit"
                data-era-panel={isExpanded ? era.id : undefined}
                hidden={!isExpanded}
              >
                {isExpanded && (
                  <>
                    <p className="chronology-exhibit__intro">
                      時代の背景、代表作品、ムーブメントの継承を年代順にたどります。
                    </p>
                    <div className="chronology-exhibit__rail">
                      {entries.map((entry) =>
                        entry.kind === 'event' ? (
                          <HistoricEventEntry
                            key={`event-${entry.event.id}`}
                            event={entry.event}
                            movementById={movementById}
                          />
                        ) : (
                          <MovementEntry
                            key={`movement-${entry.movement.id}`}
                            movement={entry.movement}
                            allMovements={movements}
                            visibleMovements={visible}
                          />
                        ),
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
