import { describe, it, expect } from 'vitest';
import { ImageMeta, resolveUsageBasis } from '@/lib/schema';
import {
  canDisplayImageOnSurface,
  isQuotationPublishable,
  QUOTATION_ALLOWED_SURFACES,
  QUOTATION_FORBIDDEN_SURFACES,
} from '@/lib/image-usage';

const pd = {
  title: '夜警',
  creator: 'レンブラント',
  date: '1642',
  provider: 'アムステルダム国立美術館',
  sourceUrl: 'https://example.org/work',
  fileUrl: 'https://example.org/file.jpg',
  license: 'public-domain' as const,
  credit: 'Rijksmuseum',
  isPublicDomain: true,
  alt: '夜警の全体',
  verifiedOn: '2026-01-01',
};

const licensed = {
  ...pd,
  license: 'cc-by' as const,
  isPublicDomain: false,
};

const quotationBase = {
  title: 'ある現代作品',
  creator: '現代作家',
  date: '1990',
  provider: '現代美術館',
  sourceUrl: 'https://example.org/modern',
  fileUrl: 'https://example.org/modern.jpg',
  credit: '現代美術館',
  alt: '対角線構図の作品',
  verifiedOn: '2026-01-01',
  usageBasis: 'quotation' as const,
  quotation: {
    sourcePageUrl: 'https://example.org/modern',
    provider: '現代美術館',
    creator: '現代作家',
    workTitle: 'ある現代作品',
    workDate: '1990',
    accessed: '2026-01-01',
    quotationPurpose: 'composition-analysis' as const,
    quotationContext: 'work-modern-visual-analysis',
    quotationRationale: '対角線構図を具体的に論じるために画像が必要',
    sourceCredit: '現代美術館 提供',
    isPublished: false,
    reviewStatus: 'pending' as const,
    reviewNote: '無加工。提供元の利用条件を確認済み',
  },
};

describe('resolveUsageBasis', () => {
  it('明示された usageBasis を優先する', () => {
    expect(resolveUsageBasis(quotationBase)).toBe('quotation');
  });
  it('未指定は license/isPublicDomain から導出する', () => {
    expect(resolveUsageBasis(pd)).toBe('public-domain');
    expect(resolveUsageBasis(licensed)).toBe('licensed');
    expect(resolveUsageBasis({})).toBe('unavailable');
  });
});

describe('ImageMeta スキーマの引用要件', () => {
  it('確認済み画像（PD / licensed）はそのまま通る', () => {
    expect(ImageMeta.safeParse(pd).success).toBe(true);
    expect(ImageMeta.safeParse(licensed).success).toBe(true);
  });
  it('quotation は quotation メタデータがあれば通る（license/isPublicDomain 無し）', () => {
    expect(ImageMeta.safeParse(quotationBase).success).toBe(true);
  });
  it('quotation に license を同時指定すると弾く', () => {
    const bad = { ...quotationBase, license: 'public-domain' as const };
    expect(ImageMeta.safeParse(bad).success).toBe(false);
  });
  it('quotation に isPublicDomain=true を同時指定すると弾く', () => {
    const bad = { ...quotationBase, isPublicDomain: true };
    expect(ImageMeta.safeParse(bad).success).toBe(false);
  });
  it('quotation メタデータ無しの quotation は弾く', () => {
    const { quotation: _omit, ...bad } = quotationBase;
    void _omit;
    expect(ImageMeta.safeParse(bad).success).toBe(false);
  });
  it('public-domain は license が必須', () => {
    const { license: _omit, ...bad } = pd;
    void _omit;
    expect(ImageMeta.safeParse(bad).success).toBe(false);
  });
});

describe('canDisplayImageOnSurface', () => {
  it('PD / licensed はどの許可サーフェスでも表示できる', () => {
    expect(canDisplayImageOnSurface(pd, 'home')).toBe(true);
    expect(canDisplayImageOnSurface(licensed, 'timeline')).toBe(true);
  });
  it('quotation は審査未通過なら表示しない', () => {
    expect(canDisplayImageOnSurface(quotationBase, 'work-analysis')).toBe(false);
  });
  it('quotation は承認・公開済みでも許可サーフェスだけに表示する', () => {
    const approved = {
      ...quotationBase,
      quotation: {
        ...quotationBase.quotation,
        reviewStatus: 'editorial-approved' as const,
        isPublished: true,
      },
    };
    for (const s of QUOTATION_ALLOWED_SURFACES) {
      expect(canDisplayImageOnSurface(approved, s)).toBe(true);
    }
    for (const s of QUOTATION_FORBIDDEN_SURFACES) {
      expect(canDisplayImageOnSurface(approved, s)).toBe(false);
    }
  });
});

describe('isQuotationPublishable', () => {
  it('editorial-approved かつ isPublished のときだけ本番表示可', () => {
    expect(isQuotationPublishable(quotationBase)).toBe(false);
    expect(
      isQuotationPublishable({
        ...quotationBase,
        quotation: {
          ...quotationBase.quotation,
          reviewStatus: 'editorial-approved',
          isPublished: true,
        },
      }),
    ).toBe(true);
    expect(
      isQuotationPublishable({
        ...quotationBase,
        quotation: {
          ...quotationBase.quotation,
          reviewStatus: 'legal-review-required',
          isPublished: true,
        },
      }),
    ).toBe(false);
  });
});
