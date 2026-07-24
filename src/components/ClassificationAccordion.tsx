'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

export type ClassificationItem = {
  id: string;
  name: string;
  summary: string;
  definition: string;
  criteria: string[];
  examples: string[];
};

export const classificationItems: ClassificationItem[] = [
  {
    id: 'period',
    name: '時代区分',
    summary: '政治・宗教・社会・文化の大きな変化に基づく、年代上の枠組み',
    definition:
      '美術史を、政治・宗教・社会・文化の大きな変化に基づいて分けた年代上の区分です。個別の表現様式や運動ではなく、複数の様式・流派・運動を含む上位概念です。',
    criteria: [
      '比較的長い年代幅を持つ',
      '複数の地域・様式・運動を含む',
      '美術以外の歴史区分とも関連する',
    ],
    examples: ['古代', '中世', '近世', '近代', '現代'],
  },
  {
    id: 'style',
    name: '様式',
    summary: '構図・空間・色彩・光・技法など、作品に共有される視覚的特徴のまとまり',
    definition:
      '作品に共通して現れる、視覚的・形式的な特徴のまとまりです。構図、空間表現、色彩、光、人物表現、装飾、技法などから識別します。必ずしも芸術家自身が名乗ったものではなく、後世の美術史家による分類も含みます。',
    criteria: [
      '視覚的特徴によって識別できる',
      '複数の作家・地域に共有される',
      '明確な組織や宣言文を必要としない',
    ],
    examples: ['ゴシック', 'ルネサンス', 'マニエリスム', 'バロック', 'ロココ'],
  },
  {
    id: 'movement',
    name: '芸術運動',
    summary: '共通する問題意識や理念から、既存の美術へ新しい表現を提示した動き',
    definition:
      '複数の芸術家が、共通する問題意識や理念のもとで、既存の美術に対して新しい表現を提示した動きです。',
    criteria: [
      '共通する理念や問題意識がある',
      '同時代の複数作家による動きである',
      '既存の制度や表現への応答がある',
      '展覧会、声明、批評などの活動が確認できる',
    ],
    examples: ['印象派', '未来派', 'ダダ', 'シュルレアリスム', 'ミニマリズム'],
  },
  {
    id: 'school',
    name: '流派',
    summary: '地域・師弟関係・工房・教育機関・技法的伝統を共有する芸術家の系譜',
    definition:
      '特定の地域、師弟関係、工房、教育機関、技法的伝統などを共有する芸術家の系譜です。芸術運動ほど明確な理念や宣言を持たず、地域性や人的ネットワークを中心に形成されます。',
    criteria: [
      '特定地域や教育系譜との結びつきが強い',
      '師弟・工房・人的交流がある',
      '共通する技法や主題が見られる',
      '明確な共同声明を必要としない',
    ],
    examples: ['フィレンツェ派', 'ヴェネツィア派', 'フランドル派', 'バルビゾン派'],
  },
  {
    id: 'collective',
    name: '芸術家集団',
    summary: '共同制作・展覧会・声明・出版などを行った、実在する組織',
    definition:
      '実際に組織として結成され、共同制作、展覧会、声明、出版などを行った具体的なグループです。',
    criteria: [
      '名称を持つ組織である',
      '構成員を特定できる',
      '共同展、出版、声明などの活動記録がある',
      '結成・解散または活動期間が確認できる',
    ],
    examples: ['具体美術協会', '青騎士', 'ブリュッケ', 'ゼロ', 'フルクサス'],
  },
  {
    id: 'tendency',
    name: '制作傾向',
    summary: '組織や声明を必須とせず、複数の作家に共通する表現・制作上の方向性',
    definition:
      '明確な組織や共通声明を持たないものの、複数の作家に共通して見られる表現上・制作上の方向性です。後世の批評家や美術史家がまとめて命名した場合も多くあります。',
    criteria: [
      '共通の制作方法や表現傾向がある',
      '組織的活動は必須ではない',
      '作家本人が名称を自称していない場合がある',
      '境界が比較的曖昧である',
    ],
    examples: ['写実主義', 'カラーフィールド', 'ハードエッジ', 'ポストミニマリズム'],
  },
  {
    id: 'method-theory',
    name: '方法論・理論',
    summary: '作品の様式ではなく、美術を制作・解釈・分析するための理論的枠組み',
    definition:
      '作品そのものの様式ではなく、美術を制作・解釈・分析するための考え方や理論的枠組みです。',
    criteria: [
      '作品の見た目ではなく分析方法を示す',
      '複数の時代・作品に適用できる',
      '理論家、批評家、美術史家によって体系化されている',
      '芸術家集団や運動を必ずしも伴わない',
    ],
    examples: [
      'フォーマリズム',
      'イコノロジー',
      '制度論',
      '精神分析批評',
      'マルクス主義美術史',
      'ポストコロニアル批評',
    ],
  },
];

export function ClassificationAccordion({
  items = classificationItems,
}: {
  items?: ClassificationItem[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowDown') nextIndex = (index + 1) % items.length;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="mt-6 border-y hairline">
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const buttonId = `classification-${item.id}-button`;
        const panelId = `classification-${item.id}-panel`;

        return (
          <article
            key={item.id}
            className={index === items.length - 1 ? undefined : 'border-b hairline'}
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
                onClick={() => setOpenId(isOpen ? null : item.id)}
                onKeyDown={(event) => moveFocus(event, index)}
                className="group flex w-full items-start gap-4 px-1 py-4 text-left sm:items-center sm:py-5"
              >
                <span className="min-w-0 flex-1 sm:grid sm:grid-cols-[8.5rem_1fr] sm:items-baseline sm:gap-5">
                  <span className="block font-serif text-lg text-ink">{item.name}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted sm:mt-0">
                    {item.summary}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border hairline font-sans text-lg leading-none text-accent transition-colors duration-150 group-hover:bg-surface sm:mt-0"
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
              className="pb-6 pl-1 pr-12 sm:pl-[10rem] sm:pr-8"
            >
              <p className="text-sm leading-relaxed text-ink">{item.definition}</p>

              <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_0.72fr]">
                <div>
                  <h4 className="font-sans text-xs font-semibold tracking-[0.08em] text-faint">
                    判定基準
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {item.criteria.map((criterion) => (
                      <li key={criterion} className="flex gap-2 text-sm leading-relaxed text-muted">
                        <span aria-hidden="true" className="text-accent">・</span>
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-sans text-xs font-semibold tracking-[0.08em] text-faint">
                    具体例
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.examples.join('、')}
                  </p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
