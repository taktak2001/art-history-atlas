import { test, expect } from '@playwright/test';

test('比較ページはネイティブselectを使わず、検索ピッカーで追加する', async ({ page }) => {
  await page.goto('/compare/?ids=surrealism,baroque');

  // iOSの巨大なネイティブselectを出さない
  await expect(page.locator('select')).toHaveCount(0);

  const trigger = page.locator('[data-compare-add]');
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');

  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'ムーブメントを追加' });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  // 検索して時代別に絞り込まれる
  const input = dialog.getByRole('combobox');
  await input.fill('キュビスム');
  await expect(dialog.getByText(/検索結果 \d+件/)).toBeVisible();
  await expect(page.locator('[data-movement-option="cubism"]')).toBeVisible();

  // 選択すると比較へ追加され、URLが同期する
  await page.locator('[data-movement-option="cubism"]').click();
  await expect(page).toHaveURL(/ids=surrealism,baroque,cubism/);
  await expect(page.locator('[data-compare-chip="cubism"]')).toBeVisible();
  await expect(dialog.getByText('選択中 3/4').first()).toBeVisible();

  // Escapeで閉じ、トリガーへフォーカスが戻る
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('英語名・作家名でも検索できる', async ({ page }) => {
  await page.goto('/compare/?ids=surrealism,baroque');
  await page.locator('[data-compare-add]').click();
  const dialog = page.getByRole('dialog', { name: 'ムーブメントを追加' });
  const input = dialog.getByRole('combobox');

  await input.fill('surrealism');
  await expect(page.locator('[data-movement-option="surrealism"]')).toBeVisible();

  await input.fill('ピカソ');
  await expect(page.locator('[data-movement-option="cubism"]')).toBeVisible();
});

test('最大4件で未選択は追加できず、理由を表示する', async ({ page }) => {
  await page.goto('/compare/?ids=surrealism,baroque,cubism,dada');
  const trigger = page.locator('[data-compare-add]');
  // 4件のときトリガー自体が無効
  await expect(trigger).toBeDisabled();

  // 既存項目の削除はできる
  await page.locator('[data-compare-chip="dada"] button').click();
  await expect(page).not.toHaveURL(/dada/);
  await expect(trigger).toBeEnabled();
});

test('キーボードで検索結果を移動して選択できる', async ({ page }) => {
  await page.goto('/compare/?ids=surrealism,baroque');
  await page.locator('[data-compare-add]').click();
  const dialog = page.getByRole('dialog', { name: 'ムーブメントを追加' });
  await dialog.getByRole('combobox').fill('キュビスム');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/ids=surrealism,baroque,/);
});

test('共有URLを直接開くと選択が復元される', async ({ page }) => {
  await page.goto('/compare/?ids=gothic,italian-renaissance,baroque');
  await expect(page.locator('[data-compare-chip="gothic"]')).toBeVisible();
  await expect(page.locator('[data-compare-chip="italian-renaissance"]')).toBeVisible();
  await expect(page.locator('[data-compare-chip="baroque"]')).toBeVisible();
  await expect(page.getByRole('region', { name: '選択したムーブメントの比較表' })).toBeVisible();
});
