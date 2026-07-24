import { test, expect } from '@playwright/test';

// 注意: ローカル配信では外部(Wikimedia)画像は読み込めないため onError でプレースホルダーへ退避する。
// 本E2Eは画像そのものの表示ではなく、グリッド/導線/レイアウトの健全性を検証する。

test('ムーブメント詳細に代表作品グリッドが表示され、作品詳細へ遷移できる', async ({ page }) => {
  await page.goto('/movements/impressionism/');
  await expect(page.getByRole('heading', { name: '代表作品', exact: true })).toBeVisible();
  // 代表作品グリッドの作品リンク（href指定で確実に）から作品詳細へ
  const workLink = page.locator('a[href="/works/work-impression-sunrise/"]').first();
  await expect(workLink).toBeVisible();
  await workLink.click();
  await expect(page).toHaveURL(/\/works\/work-impression-sunrise\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('印象・日の出');
});

test('作品詳細に情報と出典が表示される', async ({ page }) => {
  await page.goto('/works/work-mona-lisa/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('モナ・リザ');
  await expect(page.getByRole('heading', { name: '作品情報' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '出典' })).toBeVisible();
  // figure（画像）またはプレースホルダーのいずれかが存在する
  const hasFigureOrPlaceholder =
    (await page.locator('figure').count()) > 0 ||
    (await page.getByRole('img', { name: /プレースホルダー/ }).count()) > 0;
  expect(hasFigureOrPlaceholder).toBeTruthy();
});

test('比較ページに各ムーブメントの代表作品が並ぶ', async ({ page }) => {
  await page.goto('/compare/?ids=gothic,italian-renaissance');
  await expect(page.getByRole('rowheader', { name: '代表作品' })).toBeVisible();
  // 代表作品行に作品リンクが存在する
  await expect(page.getByRole('link', { name: /モナ・リザ|アテナイの学堂|マエスタ/ }).first()).toBeVisible();
});

test('iPhone幅で作品グリッドが横あふれしない', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/movements/baroque/');
  await expect(page.getByRole('heading', { name: '代表作品', exact: true })).toBeVisible();
  // 本文が横スクロールしない（document幅がビューポート幅を超えない）
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientW = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollW).toBeLessThanOrEqual(clientW + 1);
});
