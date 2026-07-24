'use client';

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import {
  RELATIONSHIP_DEFINITIONS,
  RELATION_KINDS,
} from '@/lib/relationship-definitions';
import type { RelationKind } from '@/lib/schema';
import { RelationLineSample } from '@/components/RelationLine';

function DefinitionList({
  items,
}: {
  items: string[];
}) {
  return (
    <ul className="relationship-detail-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function RelationshipStandards() {
  const [openKind, setOpenKind] = useState<RelationKind | null>(null);
  const [readingOpen, setReadingOpen] = useState(false);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (index + 1) % RELATION_KINDS.length;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex =
        (index - 1 + RELATION_KINDS.length) % RELATION_KINDS.length;
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = RELATION_KINDS.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="relationship-standards">
      <section className="relationship-reading" aria-labelledby="relationship-reading-heading">
        <h3 id="relationship-reading-heading">
          <button
            id="relationship-reading-button"
            type="button"
            aria-expanded={readingOpen}
            aria-controls="relationship-reading-panel"
            onClick={() => setReadingOpen((current) => !current)}
          >
            <span>関係データの読み方</span>
            <span aria-hidden="true">{readingOpen ? '−' : '＋'}</span>
          </button>
        </h3>
        <div
          id="relationship-reading-panel"
          role="region"
          aria-labelledby="relationship-reading-button"
          hidden={!readingOpen}
        >
          <ul>
            <li>sourceは作用の起点</li>
            <li>targetは作用を受けた到達先</li>
            <li>有向関係は矢印でsourceからtargetへ示す</li>
            <li>
              反発はデータの向きを保ちつつ、日本語では「targetはsourceに反発した」と読む
            </li>
          </ul>
        </div>
      </section>

      <div
        className="relationship-accordion"
        aria-label="関係タイプの定義"
      >
        {RELATION_KINDS.map((kind, index) => {
          const item = RELATIONSHIP_DEFINITIONS[kind];
          const isOpen = openKind === kind;
          const buttonId = `relationship-${kind}-button`;
          const panelId = `relationship-${kind}-panel`;

          return (
            <article
              key={kind}
              className="relationship-accordion__item"
              data-open={isOpen}
            >
              <h3>
                <button
                  ref={(node) => {
                    buttonRefs.current[index] = node;
                  }}
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenKind(isOpen ? null : kind)}
                  onKeyDown={(event) => moveFocus(event, index)}
                  className="relationship-accordion__trigger"
                >
                  <span className="relationship-accordion__heading">
                    <span className="relationship-accordion__name">
                      {item.label}
                    </span>
                    <span className="relationship-accordion__summary">
                      {item.shortDefinition}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="relationship-accordion__icon"
                  >
                    {isOpen ? '−' : '＋'}
                  </span>
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="relationship-accordion__panel"
                style={
                  {
                    '--relationship-color':
                      item.visualEncoding.color,
                    '--relationship-dark-color':
                      item.visualEncoding.darkColor,
                  } as CSSProperties
                }
              >
                <section className="relationship-detail relationship-detail--definition">
                  <h4>詳細定義</h4>
                  <p>{item.fullDefinition}</p>
                </section>

                <div className="relationship-detail-grid">
                  <section className="relationship-detail">
                    <h4>判定基準</h4>
                    <DefinitionList items={item.criteria} />
                  </section>

                  <section className="relationship-detail">
                    <h4>該当しないケース</h4>
                    <DefinitionList items={item.exclusions} />
                  </section>

                  <section className="relationship-detail">
                    <h4>典型例</h4>
                    <DefinitionList items={item.examples} />
                  </section>

                  <section className="relationship-detail">
                    <h4>判断上の注意</h4>
                    <DefinitionList items={item.cautions} />
                  </section>

                  <section className="relationship-detail relationship-detail--visual">
                    <h4>図上の表現</h4>
                    <div className="relationship-visual-sample">
                      <RelationLineSample kind={kind} />
                      <span>
                        {item.visualEncoding.colorLabel}
                        {' / '}
                        {item.visualEncoding.lineLabel}
                        {' / '}
                        {item.visualEncoding.arrow ? '矢印あり' : '矢印なし'}
                      </span>
                    </div>
                  </section>

                  <section className="relationship-detail">
                    <h4>source / target の読み方</h4>
                    <dl className="relationship-source-target">
                      <div>
                        <dt>source</dt>
                        <dd>{item.sourceTarget.source}</dd>
                      </div>
                      <div>
                        <dt>target</dt>
                        <dd>{item.sourceTarget.target}</dd>
                      </div>
                    </dl>
                  </section>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
