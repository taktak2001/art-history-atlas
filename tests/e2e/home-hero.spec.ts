import { test, expect } from '@playwright/test';

test('ホームのファーストビューに3つの探索導線を表示する', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-home-hero]');
  await expect(page).toHaveTitle(/美術史アトラス/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('美術史アトラス');
  await expect(page.getByText('発生・継承・転換から読む美術史。')).toBeVisible();

  const navigation = page.getByRole('navigation', { name: '主要な探索方法' });
  await expect(navigation.getByRole('link', { name: /Timeline.*年代と地域の重なりを見る/ })).toHaveAttribute(
    'href',
    '/timeline/',
  );
  await expect(navigation.getByRole('link', { name: /Chronology.*時代の流れを展示形式で読む/ })).toHaveAttribute(
    'href',
    '/chronology/',
  );
  await expect(navigation.getByRole('link', { name: /Relationship Network.*継承・反発・影響を辿る/ })).toHaveAttribute(
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
  expect(geometry.height).toBeGreaterThanOrEqual(400);
  expect(geometry.height).toBeLessThanOrEqual(geometry.viewportHeight * 0.72);

  for (const link of await navigation.getByRole('link').all()) {
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('ホームのセクション見出しは英語と短い日本語説明で対になる', async ({ page }) => {
  await page.goto('/');

  const sections = [
    ['Explore by Era', '時代ごとの価値基準から読む'],
    ['Turning Points', '視点・空間・制度の前提が変わった局面'],
    ['Reactions & Breaks', '前時代への応答と反発を辿る'],
    ['Across Regions', '同時代の地域差を比較する'],
    ['Comparisons', '2つのムーブメントを並べて読む'],
    ['Latest Additions', '最近追加したムーブメント'],
    ['Sources & Methodology', '出典・編集方針・分類基準'],
  ];

  for (const [heading, description] of sections) {
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
    expect(description.length).toBeLessThanOrEqual(40);
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
