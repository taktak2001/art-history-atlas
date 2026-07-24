import { describe, it, expect } from 'vitest';
import { works } from '@/data/works';
import { movements } from '@/data/movements';
import { artists } from '@/data/artists';
import { ImageMeta } from '@/lib/schema';

describe('Phase 2: 作品と画像の不変条件', () => {
  it('全ムーブメントに2作品以上ある', () => {
    for (const m of movements) {
      const count = works.filter((w) => w.movementIds.includes(m.id)).length;
      expect(count, m.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('合計60作品以上を収録している', () => {
    expect(works.length).toBeGreaterThanOrEqual(60);
  });

  it('実画像が相当数（30点以上）ある', () => {
    expect(works.filter((w) => w.image).length).toBeGreaterThanOrEqual(30);
  });

  it('画像付き作品はImageMetaに適合し、必須フィールドを持つ', () => {
    for (const w of works) {
      if (!w.image) continue;
      expect(() => ImageMeta.parse(w.image), w.id).not.toThrow();
      expect(w.image.alt.trim().length, `${w.id} alt`).toBeGreaterThan(0);
      expect(w.image.credit, `${w.id} credit`).toBeTruthy();
      expect(() => new URL(w.image!.sourceUrl), `${w.id} sourceUrl`).not.toThrow();
      if (w.image.fileUrl) {
        expect(() => new URL(w.image!.fileUrl!), `${w.id} fileUrl`).not.toThrow();
      }
    }
  });

  it('Public Domain判定とライセンスが矛盾しない', () => {
    for (const w of works) {
      const img = w.image;
      if (!img) continue;
      if (img.isPublicDomain) {
        expect(['public-domain', 'cc0'], w.id).toContain(img.license);
      }
      if (img.license === 'cc-by' || img.license === 'cc-by-sa') {
        expect(img.isPublicDomain, w.id).toBe(false);
      }
    }
  });

  it('作品タイトルに重複がない', () => {
    const titles = works.map((w) => w.titleJa);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('同一画像URLの重複がない', () => {
    const urls = works.filter((w) => w.image?.fileUrl).map((w) => w.image!.fileUrl!);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('作品の creatorId は実在する作家を参照する', () => {
    const ids = new Set(artists.map((a) => a.id));
    for (const w of works) {
      if (w.creatorId) expect(ids.has(w.creatorId), `${w.id}->${w.creatorId}`).toBe(true);
    }
  });

  it('画像はライセンス確認済み（禁止ライセンスを含まない）', () => {
    const allowed = ['public-domain', 'cc0', 'cc-by', 'cc-by-sa'];
    for (const w of works) {
      if (w.image) expect(allowed, w.id).toContain(w.image.license);
    }
  });
});

describe('Phase 2: 出典の複数機関化', () => {
  it('single-source フラグのムーブメントが1件以下に減っている', () => {
    const ss = movements.filter((m) => m.verification === 'single-source');
    expect(ss.length).toBeLessThanOrEqual(1);
  });
});
