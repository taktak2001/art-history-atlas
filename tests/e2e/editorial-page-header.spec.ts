import { expect, test } from '@playwright/test';

const editorialPages = [
  ['/movements/', 'MOVEMENTS', 'ムーブメント一覧'],
  ['/chronology/', 'CHRONOLOGY', '縦型年表'],
  ['/timeline/', 'TIMELINE', '横型タイムライン'],
  ['/network/', 'RELATIONSHIP NETWORK', '関係ネットワーク'],
  ['/matrix/', 'MATRIX', '時代 × 地域マトリクス'],
  ['/compare/', 'COMPARE', 'ムーブメント比較'],
  ['/sources/', 'SOURCES', '出典一覧'],
  ['/about/', 'METHODOLOGY', '編集方針・分類基準・注意事項'],
] as const;

for (const [path, englishTitle, japaneseTitle] of editorialPages) {
  test(`${path} は英語を主役にした共通見出しを使う`, async ({ page }) => {
    await page.goto(path);

    const header = page.locator('.editorial-page-header');
    const english = header.locator('.editorial-page-header__english');
    const japanese = header.getByRole('heading', { level: 1, name: japaneseTitle });

    await expect(header).toBeVisible();
    await expect(english).toHaveText(englishTitle);
    await expect(japanese).toBeVisible();

    const sizes = await header.evaluate((element) => ({
      english: Number.parseFloat(
        getComputedStyle(element.querySelector<HTMLElement>('.editorial-page-header__english')!).fontSize,
      ),
      japanese: Number.parseFloat(
        getComputedStyle(element.querySelector<HTMLElement>('.editorial-page-header__japanese')!).fontSize,
      ),
    }));
    expect(sizes.english).toBeGreaterThan(sizes.japanese * 1.7);
  });
}

test('ムーブメント検索ツールバーはガラス面としてスクロール中も固定される', async ({
  page,
}) => {
  await page.goto('/movements/');

  const toolbar = page.locator('.movements-directory-toolbar');
  await expect(toolbar).toBeVisible();

  const initial = await toolbar.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      position: styles.position,
      top: Number.parseFloat(styles.top),
      y: element.getBoundingClientRect().top,
      backdrop: styles.backdropFilter || styles.webkitBackdropFilter,
    };
  });
  expect(initial.position).toBe('sticky');
  expect(initial.backdrop).toContain('blur');

  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
  await page.waitForTimeout(100);

  const stuckY = await toolbar.evaluate((element) => element.getBoundingClientRect().top);
  expect(Math.abs(stuckY - initial.top)).toBeLessThanOrEqual(2);
  expect(stuckY).toBeLessThan(initial.y);
});
