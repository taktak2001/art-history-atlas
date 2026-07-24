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

test('関係の基準は9種類を初期状態で閉じ、PCでは2列で表示する', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/about/');

  const accordion = page.locator('.relationship-accordion');
  const triggers = accordion.locator('.relationship-accordion__trigger');
  await expect(triggers).toHaveCount(9);

  for (const trigger of await triggers.all()) {
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const panelId = await trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    await expect(page.locator(`#${panelId}`)).toBeHidden();
  }

  const layout = await accordion.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      columns: style.gridTemplateColumns.split(' ').length,
      height: element.getBoundingClientRect().height,
    };
  });
  expect(layout.columns).toBe(2);
  expect(layout.height).toBeLessThan(500);
});

test('関係の詳細7項目をキーボードで開き、他項目は閉じたままにする', async ({
  page,
}) => {
  await page.goto('/about/');

  const succession = page.locator('#relationship-succession-button');
  const reaction = page.locator('#relationship-reaction-button');
  const panel = page.locator('#relationship-succession-panel');

  await succession.focus();
  await page.keyboard.press('Enter');
  await expect(succession).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  for (const heading of [
    '詳細定義',
    '判定基準',
    '該当しないケース',
    '典型例',
    '判断上の注意',
    '図上の表現',
    'source / target の読み方',
  ]) {
    await expect(panel.getByRole('heading', { name: heading })).toBeVisible();
  }

  const expandedLayout = await page.evaluate(() => {
    const accordion = document.querySelector<HTMLElement>('.relationship-accordion');
    const item = document
      .querySelector<HTMLElement>('#relationship-succession-button')
      ?.closest<HTMLElement>('.relationship-accordion__item');
    return {
      accordionWidth: accordion?.getBoundingClientRect().width ?? 0,
      itemWidth: item?.getBoundingClientRect().width ?? 0,
    };
  });
  expect(expandedLayout.itemWidth).toBeCloseTo(expandedLayout.accordionWidth, 0);

  await succession.focus();
  await page.keyboard.press('ArrowRight');
  await expect(reaction).toBeFocused();
  await page.keyboard.press('Space');
  await expect(reaction).toHaveAttribute('aria-expanded', 'true');
  await expect(succession).toHaveAttribute('aria-expanded', 'false');
});

test('関係データの読み方を独立した小型アコーディオンで表示する', async ({
  page,
}) => {
  await page.goto('/about/');

  const button = page.locator('#relationship-reading-button');
  const panel = page.locator('#relationship-reading-panel');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.getByText('sourceは作用の起点')).toBeVisible();
  await expect(
    panel.getByText('反発はデータの向きを保ちつつ、日本語では「targetはsourceに反発した」と読む'),
  ).toBeVisible();
});

test('iPhone幅では閉じた関係項目を1列・72px以下で表示する', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about/');

  const accordion = page.locator('.relationship-accordion');
  const firstItem = accordion.locator('.relationship-accordion__item').first();
  const metrics = await firstItem.evaluate((element) => {
    const accordionElement = element.closest<HTMLElement>('.relationship-accordion');
    return {
      height: element.getBoundingClientRect().height,
      accordionHeight: accordionElement?.getBoundingClientRect().height ?? 0,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(metrics.height).toBeGreaterThanOrEqual(56);
  expect(metrics.height).toBeLessThanOrEqual(72);
  expect(metrics.accordionHeight).toBeLessThan(700);
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
  await expect(
    accordion.getByText('後世に再評価', { exact: true }),
  ).toBeVisible();
});

test('関係の基準をダークモードで展開できる', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aha-theme', 'dark'));
  await page.goto('/about/');

  await page.locator('#relationship-shared-idea-button').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(
    page.locator('#relationship-shared-idea-panel').getByText('太めの点線', {
      exact: false,
    }),
  ).toBeVisible();
});
