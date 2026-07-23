import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MovementCard } from '@/components/MovementCard';
import { SourceList } from '@/components/SourceList';
import { VerificationBadge } from '@/components/Badges';
import { WorkImage } from '@/components/WorkImage';
import { getMovement, getSources } from '@/lib/dataset';
import type { Work } from '@/lib/schema';

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
