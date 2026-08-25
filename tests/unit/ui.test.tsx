import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MovementCard } from '@/components/MovementCard';
import { SourceList } from '@/components/SourceList';
import { VerificationBadge } from '@/components/Badges';
import { WorkImage } from '@/components/WorkImage';
import {
  ClassificationAccordion,
  classificationItems,
} from '@/components/ClassificationAccordion';
import { RelationshipStandards } from '@/components/RelationshipStandards';
import { getMovement, getSources } from '@/lib/dataset';
import type { Work } from '@/lib/schema';
import {
  getLodLevelFromFanPointer,
  SemanticLodFab,
} from '@/components/SemanticLodFab';
import { MatrixView } from '@/components/MatrixView';
import { MovementsExplorer } from '@/components/MovementsExplorer';
import { MovementSubheading } from '@/components/MovementSubheading';
import { movements, activeRegions } from '@/lib/dataset';

describe('MovementSubheading', () => {
  it('詳細本文用のセリフ見出し規則を一元化する', () => {
    render(<MovementSubheading>社会的背景</MovementSubheading>);

    const heading = screen.getByRole('heading', {
      level: 3,
      name: '社会的背景',
    });
    expect(heading).toHaveAttribute('data-movement-subheading');
    expect(heading).toHaveClass('font-serif', 'font-medium', 'text-xl');
  });
});

describe('MovementCard', () => {
  it('ムーブメント名・英名・要約を表示する', () => {
    const m = getMovement('impressionism')!;
    render(<MovementCard movement={m} />);
    expect(screen.getByText('印象派')).toBeInTheDocument();
    expect(screen.getByText('Impressionism')).toBeInTheDocument();
  });
  it('詳細ページへのリンクを持つ', () => {
    const m = getMovement('cubism')!;
    render(<MovementCard movement={m} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toMatch(/^\/movements\/cubism\/?$/);
  });
});

describe('SourceList', () => {
  it('出典タイトルを外部リンクで表示する', () => {
    const sources = getSources(['tate-impressionism']);
    render(<SourceList sources={sources} />);
    const link = screen.getByRole('link', { name: /Impressionism/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});

describe('VerificationBadge', () => {
  it('確認状態のテキストを表示する（色のみに依存しない）', () => {
    render(<VerificationBadge status="verified" />);
    expect(screen.getByText(/確認済み/)).toBeInTheDocument();
  });
});

describe('WorkImage', () => {
  it('画像がない場合はプレースホルダーを表示し、架空画像を出さない', () => {
    const work: Work = {
      id: 'w-test',
      titleJa: 'テスト作品',
      creatorName: '作者',
      year: '2000年',
      medium: '油彩',
      collection: 'テスト美術館',
      movementIds: ['cubism'],
      description: '説明',
      image: null,
      sourceIds: ['tate-cubism'],
      verification: 'verified',
    };
    render(<WorkImage work={work} />);
    expect(screen.getByRole('img', { name: /プレースホルダー/ })).toBeInTheDocument();
    // <img> 要素（実画像）は描画されない
    expect(document.querySelector('img')).toBeNull();
  });
});

describe('ClassificationAccordion', () => {
  it('初期表示では分類名と要約だけを表示し、詳細を閉じている', () => {
    render(<ClassificationAccordion />);
    const button = screen.getByRole('button', { name: /時代区分/ });

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(/政治・宗教・社会・文化の大きな変化に基づく/)).toBeVisible();
    expect(screen.queryByText('比較的長い年代幅を持つ')).not.toBeVisible();
  });

  it('見出し横の要約を名詞止めまたは定義句で統一する', () => {
    const expectedSummaries = [
      '政治・宗教・社会・文化の大きな変化に基づく、年代上の枠組み',
      '構図・空間・色彩・光・技法など、作品に共有される視覚的特徴のまとまり',
      '共通する問題意識や理念から、既存の美術へ新しい表現を提示した動き',
      '地域・師弟関係・工房・教育機関・技法的伝統を共有する芸術家の系譜',
      '共同制作・展覧会・声明・出版などを行った、実在する組織',
      '組織や声明を必須とせず、複数の作家に共通する表現・制作上の方向性',
      '作品の様式ではなく、美術を制作・解釈・分析するための理論的枠組み',
    ];

    expect(classificationItems.map((item) => item.summary)).toEqual(expectedSummaries);
    expect(classificationItems.every((item) => !item.summary.endsWith('です。'))).toBe(true);
    expect(classificationItems.every((item) => !item.summary.endsWith('。'))).toBe(true);
  });

  it('選択した分類の判定基準と具体例を表示し、同時に開く項目は一つにする', () => {
    render(<ClassificationAccordion />);
    const periodButton = document.getElementById('classification-period-button')!;
    const styleButton = document.getElementById('classification-style-button')!;

    fireEvent.click(periodButton);
    expect(periodButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('比較的長い年代幅を持つ')).toBeVisible();
    expect(screen.getByText('古代、中世、近世、近代、現代')).toBeVisible();

    fireEvent.click(styleButton);
    expect(periodButton).toHaveAttribute('aria-expanded', 'false');
    expect(styleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('視覚的特徴によって識別できる')).toBeVisible();
  });

  it('矢印キーとHome・Endで分類見出し間を移動できる', () => {
    render(<ClassificationAccordion />);
    const periodButton = document.getElementById('classification-period-button')!;
    const styleButton = document.getElementById('classification-style-button')!;
    const theoryButton = document.getElementById('classification-method-theory-button')!;

    periodButton.focus();
    fireEvent.keyDown(periodButton, { key: 'ArrowDown' });
    expect(styleButton).toHaveFocus();

    fireEvent.keyDown(styleButton, { key: 'End' });
    expect(theoryButton).toHaveFocus();

    fireEvent.keyDown(theoryButton, { key: 'Home' });
    expect(periodButton).toHaveFocus();
  });
});

describe('RelationshipStandards', () => {
  it('9種類と関係データの読み方を初期状態ですべて閉じる', () => {
    render(<RelationshipStandards />);

    const triggers = document.querySelectorAll<HTMLButtonElement>(
      '.relationship-accordion__trigger',
    );
    expect(triggers).toHaveLength(9);
    for (const trigger of triggers) {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      const panelId = trigger.getAttribute('aria-controls')!;
      expect(document.getElementById(panelId)).not.toBeVisible();
    }

    expect(
      document.getElementById('relationship-reading-button'),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('選択した関係だけを開き、詳細7項目を表示する', () => {
    render(<RelationshipStandards />);
    const succession = document.getElementById(
      'relationship-succession-button',
    )!;
    const influence = document.getElementById(
      'relationship-influence-button',
    )!;
    const panel = document.getElementById(
      'relationship-succession-panel',
    )!;

    fireEvent.click(succession);
    expect(succession).toHaveAttribute('aria-expanded', 'true');
    expect(within(panel).getByText('詳細定義')).toBeVisible();
    expect(within(panel).getByText('判定基準')).toBeVisible();
    expect(within(panel).getByText('該当しないケース')).toBeVisible();
    expect(within(panel).getByText('典型例')).toBeVisible();
    expect(within(panel).getByText('判断上の注意')).toBeVisible();
    expect(within(panel).getByText('図上の表現')).toBeVisible();
    expect(within(panel).getByText('source / target の読み方')).toBeVisible();

    fireEvent.click(influence);
    expect(succession).toHaveAttribute('aria-expanded', 'false');
    expect(influence).toHaveAttribute('aria-expanded', 'true');
  });

  it('矢印キーとHome・Endで関係見出し間を移動できる', () => {
    render(<RelationshipStandards />);
    const succession = document.getElementById(
      'relationship-succession-button',
    )!;
    const reaction = document.getElementById(
      'relationship-reaction-button',
    )!;
    const sharedIdea = document.getElementById(
      'relationship-shared-idea-button',
    )!;

    succession.focus();
    fireEvent.keyDown(succession, { key: 'ArrowRight' });
    expect(reaction).toHaveFocus();

    fireEvent.keyDown(reaction, { key: 'End' });
    expect(sharedIdea).toHaveFocus();

    fireEvent.keyDown(sharedIdea, { key: 'Home' });
    expect(succession).toHaveFocus();
  });
});

describe('LOD UI', () => {
  it('90度fanをdead zoneの外で基本・充実・すべてへ分割する', () => {
    expect(getLodLevelFromFanPointer(36, 4)).toBeNull();
    expect(getLodLevelFromFanPointer(110, 20)).toBe('core');
    expect(getLodLevelFromFanPointer(78, 78)).toBe('standard');
    expect(getLodLevelFromFanPointer(20, 110)).toBe('detailed');
    expect(getLodLevelFromFanPointer(-20, 110)).toBeNull();
    expect(getLodLevelFromFanPointer(180, 20)).toBeNull();
  });

  it('通常時は親FABだけを表示し、展開後に銀杏形の3項目を選択する', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SemanticLodFab
        value="core"
        counts={{ core: 32, standard: 48, detailed: 54 }}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole('button', {
      name: '表示密度を変更',
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu', { name: '表示密度' })).toBeNull();
    expect(document.querySelector('[data-semantic-lod-menu]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const options = screen.getByRole('menu', { name: '表示密度' });
    expect(
      within(options).getByRole('menuitemradio', { name: /基本に切り替え、32件/ }),
    ).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      within(options).getByRole('menuitemradio', { name: /充実に切り替え、48件/ }),
    ).toBeVisible();
    expect(
      within(options).getByRole('menuitemradio', { name: /すべてに切り替え、54件/ }),
    ).toBeVisible();

    fireEvent.click(
      within(options).getByRole('menuitemradio', { name: /充実に切り替え/ }),
    );
    expect(onChange).toHaveBeenCalledWith('standard');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <SemanticLodFab
        value="standard"
        counts={{ core: 32, standard: 48, detailed: 54 }}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('button', { name: '表示密度を変更' })).toHaveAttribute(
      'title',
      '表示密度: 充実',
    );
  });

  it('外側のpointerdownで閉じる', () => {
    render(
      <SemanticLodFab
        value="detailed"
        counts={{ core: 32, standard: 48, detailed: 54 }}
        onChange={vi.fn()}
      />,
    );

    const trigger = screen.getByRole('button', {
      name: '表示密度を変更',
    });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: '表示密度' })).toBeVisible();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole('menu', { name: '表示密度' })).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('矢印キーで項目間を移動し、Escapeで親FABへ戻る', async () => {
    render(
      <SemanticLodFab
        value="standard"
        counts={{ core: 32, standard: 48, detailed: 54 }}
        onChange={vi.fn()}
      />,
    );
    const trigger = screen.getByRole('button', {
      name: '表示密度を変更',
    });
    fireEvent.click(trigger);
    const menu = screen.getByRole('menu', { name: '表示密度' });
    const standard = within(menu).getByRole('menuitemradio', {
      name: /充実に切り替え/,
    });
    const detailed = within(menu).getByRole('menuitemradio', {
      name: /すべてに切り替え/,
    });
    await waitFor(() => expect(standard).toHaveFocus());
    fireEvent.keyDown(menu, { key: 'ArrowRight' });
    expect(detailed).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'Escape' });

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('マトリクスのセルを+Nで個別展開する', async () => {
    window.history.replaceState({}, '', '/matrix/?lod=core');
    render(<MatrixView movements={movements} regions={activeRegions()} />);

    const cell = document.querySelector(
      '[data-matrix-cell="france:nineteenth"]',
    ) as HTMLElement;
    const reveal = within(cell).getByRole('button', { name: /ほか2件/ });
    fireEvent.click(reveal);

    expect(reveal).toHaveAttribute('aria-expanded', 'true');
    expect(within(cell).getByText('ポスト印象派')).toBeVisible();
  });

  it('マトリクスに固定コーナー・時代ヘッダー・地域ヘッダーを持つ', () => {
    window.history.replaceState({}, '', '/matrix/?lod=core');
    render(<MatrixView movements={movements} regions={activeRegions()} />);

    const region = screen.getByRole('region', {
      name: '地域と時代のマトリクス表',
    });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region.querySelector('[data-sticky-cell="corner"]')).toHaveTextContent(
      /地域\s*時代 →/,
    );
    expect(region.querySelectorAll('[data-sticky-cell="column"]').length).toBeGreaterThan(0);
    expect(region.querySelectorAll('[data-sticky-cell="row"]').length).toBeGreaterThan(0);
    expect(region.querySelector('[data-matrix-region="france"] .matrix-region-dot')).toBeInTheDocument();
    expect(region.querySelector('.matrix-movement-link')).toBeInTheDocument();
  });

  it('一覧はLOD（表示範囲）を持たず、常に全件から検索する', () => {
    window.history.replaceState({}, '', '/movements/?lod=core');
    render(<MovementsExplorer />);

    // LODコントロールは無い
    expect(screen.queryByText('LEVEL OF DETAIL')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^基本/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^充実/ })).not.toBeInTheDocument();

    // 旧 ?lod=core が付いていても全件が対象
    expect(screen.getByText(`${movements.length}件のムーブメント`)).toBeInTheDocument();

    // LOD外だった項目もそのまま見つかり、「非表示」の注意書きも出ない
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '未来派' } });
    expect(screen.queryByText('現在の表示範囲では非表示')).not.toBeInTheDocument();
  });

  it('表示形式の切り替えUIを持たず、一覧は1種類に統一されている', () => {
    window.history.replaceState({}, '', '/movements/?lod=core');
    render(<MovementsExplorer />);

    expect(screen.queryByRole('group', { name: '表示形式' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '階層' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'フラット' })).not.toBeInTheDocument();
    expect(document.querySelector('[data-movement-view="hierarchy"]')).toBeNull();
    expect(document.querySelector('[data-movement-view="flat"]')).toBeInTheDocument();
  });

  it('詳細条件は初期状態で閉じており、開閉できる', () => {
    window.history.replaceState({}, '', '/movements/?lod=core');
    render(<MovementsExplorer />);

    const toggle = screen.getByRole('button', { name: /詳細条件/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'advanced-filters');
    expect(document.getElementById('advanced-filters')).toHaveAttribute('hidden');
    // 条件未設定なら「条件なし」と要約する
    expect(screen.getByText('条件なし')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('advanced-filters')).not.toHaveAttribute('hidden');
    expect(screen.getByLabelText('時代区分')).toBeInTheDocument();
  });

  it('検索欄は常時表示で、フォーム部品は16px以上（iOSの自動ズーム防止）', () => {
    window.history.replaceState({}, '', '/movements/?lod=core');
    render(<MovementsExplorer />);

    const input = screen.getByLabelText('ムーブメントを検索');
    expect(input).toBeVisible();
    expect(input).toHaveAttribute('placeholder', 'ムーブメント名・作家・作品など');
    expect(input).toHaveAttribute('aria-describedby', 'q-help');
    expect(input).toHaveClass('movements-search__input');
  });

  it('詳細条件を閉じても選択条件がチップと要約で分かり、クリアできる', () => {
    window.history.replaceState({}, '', '/movements/?lod=core');
    render(<MovementsExplorer />);

    const toggle = screen.getByRole('button', { name: /詳細条件/ });
    fireEvent.click(toggle);
    fireEvent.change(screen.getByLabelText('時代区分'), {
      target: { value: 'renaissance' },
    });
    // 閉じても条件は維持され、見出しの要約とチップの両方に出る
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('.movements-advanced__summary')).toHaveTextContent(
      'ルネサンス',
    );
    expect(document.querySelector('.movements-chip')).toHaveTextContent('ルネサンス');

    const clearChip = screen.getByRole('button', {
      name: '絞り込み条件「ルネサンス」を解除',
    });
    fireEvent.click(clearChip);
    expect(screen.getByText('条件なし')).toBeInTheDocument();
  });

  it('結果件数を「N件のムーブメント」で示し、条件がある時だけクリアを出す', () => {
    window.history.replaceState({}, '', '/movements/?lod=core');
    render(<MovementsExplorer />);

    expect(screen.getByText(/\d+件のムーブメント/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '条件をクリア' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('ムーブメントを検索'), {
      target: { value: 'バロック' },
    });
    expect(screen.getByRole('button', { name: '条件をクリア' })).toBeInTheDocument();
  });
});
