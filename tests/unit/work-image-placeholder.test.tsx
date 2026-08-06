import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkImage } from '@/components/WorkImage';
import { shortProviderName } from '@/lib/provider-display';
import type { ImageReference, Work } from '@/lib/schema';

const baseWork: Work = {
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

const ref: ImageReference = {
  sourcePageUrl: 'https://www.moma.org/collection/works/79766',
  provider: 'The Museum of Modern Art (MoMA), New York',
  rightsStatus: 'permission-required',
  accessed: '2026-08-06',
  verificationStatus: 'rights-review-required',
  verificationNote: 'テスト',
};

describe('shortProviderName', () => {
  it('長い正式名をUI用の短縮名にする', () => {
    expect(shortProviderName('The Museum of Modern Art (MoMA), New York')).toBe('MoMA');
    expect(shortProviderName('The Metropolitan Museum of Art, New York')).toBe('The Met');
    expect(shortProviderName('The Art Institute of Chicago')).toBe('AIC');
    expect(shortProviderName('Tate')).toBe('Tate');
    expect(shortProviderName('Wikimedia Commons')).toBe('Wikimedia Commons');
  });

  it('未知の provider は注記を落として短縮する', () => {
    expect(shortProviderName('Some Local Museum（所蔵：どこか）')).toBe('Some Local Museum');
  });
});

describe('WorkImage プレースホルダー', () => {
  it('image があるときは通常画像を表示する', () => {
    const work: Work = {
      ...baseWork,
      image: {
        title: 'テスト作品',
        creator: '作者',
        date: '2000年',
        provider: 'Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
        fileUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Test.jpg',
        license: 'public-domain',
        credit: 'テスト credit',
        isPublicDomain: true,
        alt: 'テスト代替テキスト',
        verifiedOn: '2026-08-06',
      },
    };
    render(<WorkImage work={work} />);
    expect(document.querySelector('img')).not.toBeNull();
  });

  it('image なし + imageReference あり + showReferenceLink → 全面が外部リンク', () => {
    const work: Work = { ...baseWork, imageReference: ref };
    render(<WorkImage work={work} showReferenceLink />);
    const link = screen.getByRole('link', {
      name: /テスト作品をMoMAの提供元ページで見る（外部サイト）/,
    });
    expect(link).toHaveAttribute('href', ref.sourcePageUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(screen.getByText('画像は提供元で確認')).toBeInTheDocument();
    expect(screen.getByText(/MoMAで作品を見る/)).toBeInTheDocument();
    // サムネイル（実画像）は出さない
    expect(document.querySelector('img')).toBeNull();
    // candidateFileUrl を画像として使わない
    expect(document.body.innerHTML).not.toContain('iiif');
  });

  it('showReferenceLink=false のときはリンクにしない（一覧・Timeline 等）', () => {
    const work: Work = { ...baseWork, imageReference: ref };
    render(<WorkImage work={work} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByRole('img', { name: /プレースホルダー/ })).toBeInTheDocument();
  });

  it('image なし + imageReference なし → 非リンクのプレースホルダー', () => {
    render(<WorkImage work={baseWork} showReferenceLink />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByRole('img', { name: /プレースホルダー/ })).toBeInTheDocument();
    expect(screen.getByText('画像は権利確認後に収録予定')).toBeInTheDocument();
  });
});
