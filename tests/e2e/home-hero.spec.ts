import { test, expect } from '@playwright/test';

test('ホームのファーストビューに3つの探索導線を表示する', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-home-hero]');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('美術史アトラス');
  await expect(page.getByText('発生・継承・転換から読む美術史。')).toBeVisible();

  const navigation = page.getByRole('navigation', { name: '主要な探索方法' });
  await expect(navigation.getByRole('link', { name: '横型タイムライン' })).toHaveAttribute(
    'href',
    '/timeline/',
  );
  await expect(navigation.getByRole('link', { name: '縦型年表' })).toHaveAttribute(
    'href',
    '/chronology/',
  );
  await expect(navigation.getByRole('link', { name: '関係ネットワーク' })).toHaveAttribute(
    'href',
    '/network/',
  );
  await expect(page.getByText('美術史とは、様式名を暗記するものではない。')).toHaveCount(0);

  const geometry = await hero.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      bottom: rect.bottom,
      height: rect.height,
      viewportHeight: window.innerHeight,
    };
  });
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);
  expect(geometry.height).toBeGreaterThan(500);

  for (const link of await navigation.getByRole('link').all()) {
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('ヘッダーは英字3行ロゴと均衡した操作領域を持つ', async ({ page }) => {
  await page.goto('/');

  const wordmark = page.getByRole('link', { name: 'Art History Atlas ホーム' });
  await expect(wordmark).toBeVisible();
  await expect(wordmark.locator('.site-wordmark__line')).toHaveCount(3);
  await expect(wordmark.locator('.site-wordmark__line').nth(0)).toHaveText('ART');
  await expect(wordmark.locator('.site-wordmark__line').nth(1)).toHaveText('HISTORY');
  await expect(wordmark.locator('.site-wordmark__line').nth(2)).toHaveText('ATLAS');

  const controls = [
    page.getByRole('button', { name: /テーマ|モード/ }),
    page.getByRole('button', { name: /メニュー/ }),
  ];
  for (const control of controls) {
    if (await control.isVisible()) {
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  }
});
