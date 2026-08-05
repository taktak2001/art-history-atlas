import { describe, it, expect } from 'vitest';
import { works } from '@/data/works';
import { imageReferences } from '@/data/expansion/image-references';
import { ImageReference } from '@/lib/schema';

/** PR #61 の引用審査5点。quotation-candidate を保持し image は null のまま。 */
const QUOTATION_FIVE = [
  'work-one-and-three-chairs',
  'work-judd-untitled-stack',
  'work-cut-with-kitchen-knife',
  'work-challenging-mud',
  'work-sekine-phase-earth',
];

describe('imageReference: 画像未収録作品の調査・審査用参照', () => {
  const nullWorks = works.filter((w) => w.image === null);

  it('image が null の作品はすべて imageReference を持つ', () => {
    const missing = nullWorks.filter((w) => !w.imageReference).map((w) => w.id);
    expect(missing).toEqual([]);
  });

  it('imageReference は image が null の作品にのみ付与される', () => {
    const wrong = works
      .filter((w) => w.image !== null && w.imageReference)
      .map((w) => w.id);
    expect(wrong).toEqual([]);
  });

  it('全 imageReference が ImageReference スキーマに適合する', () => {
    for (const w of nullWorks) {
      const parsed = ImageReference.safeParse(w.imageReference);
      expect(parsed.success, w.id).toBe(true);
    }
  });

  it('すべての URL が https で空白を含まない', () => {
    for (const w of nullWorks) {
      const ref = w.imageReference!;
      for (const url of [
        ref.sourcePageUrl,
        ref.imagePageUrl,
        ref.candidateFileUrl,
        ref.termsUrl,
      ]) {
        if (!url) continue;
        expect(url.startsWith('https://'), `${w.id}: ${url}`).toBe(true);
        expect(/\s/.test(url), `${w.id}: ${url}`).toBe(false);
      }
    }
  });

  it('sourcePageUrl に Wikipedia/SNS/販売サイト等を第一出典として使わない', () => {
    const bad = [
      'wikipedia.org',
      'pinterest.',
      'instagram.com',
      'facebook.com',
      'twitter.com',
      'x.com',
      'flickr.com',
      'wikiart.org',
      'artsy.net',
    ];
    for (const w of nullWorks) {
      const host = new URL(w.imageReference!.sourcePageUrl).host.toLowerCase();
      expect(bad.some((b) => host.includes(b)), `${w.id}: ${host}`).toBe(false);
    }
  });

  it('PD/Open Access 候補は判定根拠(verificationNote)を持つ', () => {
    for (const w of nullWorks) {
      const ref = w.imageReference!;
      if (
        ref.rightsStatus === 'public-domain-candidate' ||
        ref.rightsStatus === 'open-access-candidate'
      ) {
        expect(ref.verificationNote.trim().length, w.id).toBeGreaterThan(0);
      }
    }
  });

  it('quotation-candidate / rights-review-required は本番画像へ昇格しない（image は null）', () => {
    for (const w of works) {
      const ref = w.imageReference;
      if (!ref) continue;
      if (
        ref.rightsStatus === 'quotation-candidate' ||
        ref.verificationStatus === 'rights-review-required'
      ) {
        expect(w.image, w.id).toBeNull();
      }
    }
  });

  it('PR #61 の5点は quotation-candidate かつ image が null', () => {
    for (const id of QUOTATION_FIVE) {
      const w = works.find((x) => x.id === id);
      expect(w, id).toBeTruthy();
      expect(w!.image, id).toBeNull();
      expect(w!.imageReference?.rightsStatus, id).toBe('quotation-candidate');
    }
  });

  it('参照マップに存在しない workId が混入していない', () => {
    const ids = new Set(works.map((w) => w.id));
    const stray = Object.keys(imageReferences).filter((id) => !ids.has(id));
    expect(stray).toEqual([]);
  });

  it('同一 sourcePageUrl を3件以上で使い回していない', () => {
    const counts = new Map<string, number>();
    for (const w of nullWorks) {
      const u = w.imageReference!.sourcePageUrl;
      counts.set(u, (counts.get(u) ?? 0) + 1);
    }
    const overused = [...counts.entries()].filter(([, c]) => c >= 3);
    expect(overused).toEqual([]);
  });
});
