import { test, expect } from '@playwright/test';

test('分類アコーディオンをキーボードで開閉・移動できる', async ({ page }) => {
  await page.goto('/about/');

  const periodButton = page.locator('#classification-period-button');
  const styleButton = page.locator('#classification-style-button');
  const periodPanel = page.locator('#classification-period-panel');

  await expect(periodButton).toHaveAttribute('aria-expanded', 'false');
  await expect(periodPanel).toBeHidden();

  await periodButton.focus();
  await page.keyboard.press('Enter');
  await expect(periodButton).toHaveAttribute('aria-expanded', 'true');
  await expect(periodPanel).toBeVisible();
  await expect(periodPanel.getByText('比較的長い年代幅を持つ')).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await expect(styleButton).toBeFocused();
  await page.keyboard.press('Space');
  await expect(styleButton).toHaveAttribute('aria-expanded', 'true');
  await expect(periodButton).toHaveAttribute('aria-expanded', 'false');
});

test('分類アコーディオンは小画面でも横方向にはみ出さない', async ({ page }) => {
  await page.goto('/about/');
  await page.locator('#classification-method-theory-button').click();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));

  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  await expect(page.getByText('ポストコロニアル批評')).toBeVisible();
});

test('分類アコーディオンをダークモードで表示できる', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aha-theme', 'dark'));
  await page.goto('/about/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#classification-collective-button').click();
  await expect(page.getByText('具体美術協会、青騎士、ブリュッケ、ゼロ、フルクサス')).toBeVisible();

  const colors = await page.locator('body').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      color: style.color,
    };
  });

  expect(colors.background).toBe('rgb(22, 22, 24)');
  expect(colors.color).toBe('rgb(234, 231, 224)');
});
