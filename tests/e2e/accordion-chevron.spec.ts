import { test, expect } from '@playwright/test';

test('Aboutのアコーディオンは＋ではなくシェブロンで開閉を示す', async ({ page }) => {
  await page.goto('/about/');

  // ＋／− をアコーディオンの記号として使わない
  const bodyText = await page.locator('body').innerText();
  expect(bodyText).not.toContain('＋');

  const chevrons = page.locator('[data-accordion-chevron]');
  expect(await chevrons.count()).toBeGreaterThanOrEqual(10);

  // 分類の基準・関係の基準の各項目がボタン＋aria属性を持つ
  const trigger = page.getByRole('button', { name: /時代区分/ }).first();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toHaveAttribute('aria-controls', /.+/);
  // 行全体が44px以上のタップ領域
  const box = await trigger.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);

  // アイコン自体は読み上げ対象にしない
  await expect(trigger.locator('[data-accordion-chevron]')).toHaveAttribute(
    'aria-hidden',
    'true',
  );

  // 閉：回転なし → 開：90度回転
  const state = async () =>
    trigger.locator('[data-accordion-chevron]').evaluate((element) => ({
      open: element.getAttribute('data-open'),
      transform: getComputedStyle(element.querySelector('svg')!).transform,
    }));

  expect((await state()).open).toBe('false');

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect
    .poll(async () => (await state()).transform)
    .toBe('matrix(0, 1, -1, 0, 0, 0)');

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(async () => (await state()).open).toBe('false');
});

test('キーボードでアコーディオンを開閉できる', async ({ page }) => {
  await page.goto('/about/');
  const trigger = page.getByRole('button', { name: /時代区分/ }).first();

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Space');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('他ページのアコーディオンも同じシェブロン仕様を使う', async ({ page }) => {
  // ムーブメント一覧の「詳細条件」
  await page.goto('/movements/');
  const advanced = page.getByRole('button', { name: /詳細条件/ });
  await expect(advanced.locator('[data-accordion-chevron]')).toHaveCount(1);
  await expect(advanced).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toContainText('＋');

  // 関係ネットワークの「線の見方」
  await page.goto('/network/');
  const guide = page.locator('summary[aria-expanded]').first();
  await expect(guide.locator('[data-accordion-chevron]')).toHaveCount(1);
});
