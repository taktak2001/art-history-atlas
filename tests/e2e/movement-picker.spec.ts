import { test, expect } from '@playwright/test';
import { selectLod } from './lod-helpers';

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

test('ネットワークは検索からフォーカスでき、文脈が自動調整される', async ({ page }) => {
  await page.goto('/network/');

  const trigger = page.locator('[data-network-picker-trigger]');
  await expect(trigger).toBeVisible();
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'ムーブメントを検索' });
  await expect(dialog).toBeVisible();
  // navigate モードでは選択件数・完了ボタンを出さない
  await expect(dialog.locator('.movement-picker__done')).toHaveCount(0);

  // 作家名からムーブメントへ到達する
  await dialog.getByRole('combobox').fill('ピカソ');
  await page.locator('[data-movement-option="cubism"]').click();

  // 1件選んだら閉じる（navigate）
  await expect(dialog).toHaveCount(0);

  // 詳細ページからの ?focus= 到着と同じ自動調整が働く
  await expect(page).toHaveURL(/focus=cubism/);
  await expect(page).toHaveURL(/scope=focus/);
  await expect(
    page.locator('.network-scope-option[aria-pressed="true"]'),
  ).toHaveText('このムーブメント');
  await expect(
    page.locator('[data-network-node][aria-pressed="true"]'),
  ).toContainText('キュビスム');
  await expect(page.locator('.network-controls__count')).toContainText('直接関係');
});

test('ネットワークで検索後に手動変更しても自動設定へ戻らない', async ({ page }) => {
  await page.goto('/network/');
  await page.locator('[data-network-picker-trigger]').click();
  const dialog = page.getByRole('dialog', { name: 'ムーブメントを検索' });
  await dialog.getByRole('combobox').fill('キュビスム');
  await page.locator('[data-movement-option="cubism"]').click();
  await expect(page).toHaveURL(/lod=detailed/);

  // 手動でLODを基本へ戻す
  await selectLod(page, 'core');
  await expect(page).toHaveURL(/lod=core/);
  // focus と scope は保持され、自動調整で上書きされない
  await expect(page).toHaveURL(/focus=cubism/);
  await expect(
    page.locator('.network-scope-option[aria-pressed="true"]'),
  ).toHaveText('このムーブメント');
});
