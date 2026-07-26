import { test, expect } from '@playwright/test';

test('詳細ページ→関係ネットワークでフォーカス選択状態へ遷移', async ({ page }) => {
  await page.goto('/movements/surrealism/');
  // ヒーローの「関係ネットワーク」ボタン
  await page.getByRole('link', { name: '関係ネットワーク', exact: true }).first().click();
  await expect(page).toHaveURL(/\/network\/?\?focus=surrealism/);
  // シュルレアリスムのノードが選択状態（aria-pressed=true）
  await expect(page.getByRole('button', { name: /シュルレアリスム/, pressed: true })).toBeVisible();
  // 選択解除ボタンが出る
  await expect(page.getByRole('button', { name: '選択を解除' })).toBeVisible();
});

test('選択解除でfocusのみURLから消え、全体表示に戻る', async ({ page }) => {
  await page.goto('/network/?focus=surrealism');
  await expect(page.getByRole('button', { name: '選択を解除' })).toBeVisible();
  await page.getByRole('button', { name: '選択を解除' }).click();
  await expect(page).toHaveURL(/\/network\/?$/);
  await expect(page.getByRole('button', { name: '選択を解除' })).toHaveCount(0);
});

test('再読込で選択状態が復元される', async ({ page }) => {
  await page.goto('/network/?focus=cubism');
  await expect(page.getByRole('button', { name: /キュビスム/, pressed: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /キュビスム/, pressed: true })).toBeVisible();
});

test('無効なfocusはエラーにせず全体表示（選択なし）', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/network/?focus=not-a-real-id');
  await expect(page.getByRole('heading', { level: 1, name: '関係ネットワーク' })).toBeVisible();
  await expect(page.getByRole('button', { name: '選択を解除' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('ブラウザバックで元の詳細ページへ戻れる', async ({ page }) => {
  await page.goto('/movements/dada/');
  await page.getByRole('link', { name: '関係ネットワーク', exact: true }).first().click();
  await expect(page).toHaveURL(/focus=dada/);
  await page.goBack();
  await expect(page).toHaveURL(/\/movements\/dada\/?$/);
});

test('iPhone幅でも選択状態が機能し横あふれしない', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/?focus=surrealism');
  await expect(page.getByRole('button', { name: /シュルレアリスム/, pressed: true })).toBeVisible();
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientW = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollW).toBeLessThanOrEqual(clientW + 1);
});
