import { test, expect } from '@playwright/test';

test('ホームからムーブメント詳細へ移動できる', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('美術史とは');
  // 主要な転換点のカードから印象派へ
  await page.getByRole('link', { name: /印象派/ }).first().click();
  await expect(page).toHaveURL(/\/movements\/impressionism\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('印象派');
  // 詳細ページに指定項目（出典）が表示される
  await expect(page.getByRole('heading', { name: '参考文献・出典' })).toBeVisible();
});

test('検索から作品を表示できる', async ({ page }) => {
  await page.goto('/movements/');
  await page.getByLabel(/検索/).fill('ウォーホル');
  // ウォーホルの関連ムーブメント（ポップアート）が残る
  const popCard = page.getByRole('link', { name: /ポップアート/ }).first();
  await expect(popCard).toBeVisible();
  await popCard.click();
  await expect(page).toHaveURL(/\/movements\/pop-art\/?$/);
  // 代表作品からキャンベルのスープ缶へ
  await page.getByRole('link', { name: /キャンベルのスープ缶/ }).first().click();
  await expect(page).toHaveURL(/\/works\/work-campbells-soup\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('キャンベルのスープ缶');
});

test('2件のムーブメントを比較できる', async ({ page }) => {
  await page.goto('/compare/?ids=gothic,italian-renaissance');
  await expect(page.getByRole('columnheader', { name: /ゴシック美術/ })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: /イタリア・ルネサンス/ })).toBeVisible();
  // 比較項目の行が存在する
  await expect(page.getByRole('rowheader', { name: '中心思想' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: '後世への影響' })).toBeVisible();
});

test('地域フィルタ（日本）を適用できる', async ({ page }) => {
  await page.goto('/movements/');
  await page.getByLabel('地域', { exact: true }).selectOption('japan');
  await expect(page.getByRole('link', { name: /もの派/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /具体美術協会/ })).toBeVisible();
  // 日本以外（バロック）は表示されない
  await expect(page.getByRole('link', { name: /^バロック/ })).toHaveCount(0);
});

test('横型タイムラインのテキスト代替が利用できる', async ({ page }) => {
  await page.goto('/timeline/');
  await page.getByText(/テキスト形式で表示/).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('cell', { name: /印象派/ }).first()).toBeVisible();
});

test('PWA: manifestとService Workerが提供される', async ({ page, request }) => {
  await page.goto('/');
  // manifestがリンクされている
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toContain('manifest.webmanifest');
  // manifestとsw.jsが取得できる
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  const manifestJson = await manifest.json();
  expect(manifestJson.name).toContain('美術史アトラス');
  expect(manifestJson.icons.length).toBeGreaterThanOrEqual(2);
  const sw = await request.get('/sw.js');
  expect(sw.ok()).toBeTruthy();
});
