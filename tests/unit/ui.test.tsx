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
import { getMovement, getSources } from '@/lib/dataset';
import type { Work } from '@/lib/schema';
import { LodControl } from '@/components/LodControl';
import { MatrixView } from '@/components/MatrixView';
import { MovementsExplorer } from '@/components/MovementsExplorer';
import { movements, activeRegions } from '@/lib/dataset';

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

describe('LOD UI', () => {
  it('表示密度をテキストとaria-pressedで切り替える', () => {
    const onChange = vi.fn();
    render(<LodControl value="core" onChange={onChange} />);

    expect(screen.getByRole('button', { name: '主要' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: '標準' }));
    expect(onChange).toHaveBeenCalledWith('standard');
  });

  it('マトリクスのセルを+Nで個別展開する', async () => {
    window.history.replaceState({}, '', '/matrix/?lod=core');
    render(<MatrixView movements={movements} regions={activeRegions()} />);

    const cell = document.querySelector(
      '[data-matrix-cell="france:nineteenth"]',
    ) as HTMLElement;
    const reveal = within(cell).getByRole('button', { name: /\+2/ });
    fireEvent.click(reveal);

    expect(reveal).toHaveAttribute('aria-expanded', 'true');
    expect(within(cell).getByText('ポスト印象派')).toBeVisible();
  });

  it('LOD外の検索結果を表示し、必要な密度へ切り替える', async () => {
    window.history.replaceState({}, '', '/movements/?lod=core');
    render(<MovementsExplorer />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '未来派' } });
    expect(screen.getByText('現在の表示密度では非表示')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: '標準で表示' }));
    await waitFor(() =>
      expect(window.location.search).toContain('lod=standard'),
    );
    expect(screen.queryByText('現在の表示密度では非表示')).not.toBeInTheDocument();
  });

  it('一覧をフラット表示から階層表示へ切り替える', () => {
    window.history.replaceState({}, '', '/movements/?lod=core');
    render(<MovementsExplorer />);

    fireEvent.click(screen.getByRole('button', { name: '階層' }));
    expect(document.querySelector('[data-movement-view="hierarchy"]')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '印象派周辺' })).toBeVisible();
  });
});
