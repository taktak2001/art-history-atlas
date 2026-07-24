import { test, expect, type Locator } from '@playwright/test';

const position = async (locator: Locator) => {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
};

const expectNear = (actual: number, expected: number, tolerance = 2) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
};

test('マトリクスは左上・時代・地域を表内スクロール中も固定する', async ({ page }) => {
  await page.goto('/matrix/?lod=detailed');

  const scroll = page.getByRole('region', { name: '地域と時代のマトリクス表' });
  const corner = scroll.locator('[data-sticky-cell="corner"]');
  const column = scroll.locator('[data-sticky-cell="column"]').first();
  const row = scroll.locator('[data-sticky-cell="row"]').first();
  const scrollBox = await position(scroll);

  await scroll.evaluate((element) => {
    element.scrollLeft = 520;
  });
  await expect.poll(() => scroll.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

  const rowAfterHorizontal = await position(row);
  const cornerAfterHorizontal = await position(corner);
  expectNear(rowAfterHorizontal.x, scrollBox.x + 1);
  expectNear(cornerAfterHorizontal.x, scrollBox.x + 1);

  await scroll.evaluate((element) => {
    element.scrollTop = 280;
  });
  await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  const columnAfterVertical = await position(column);
  const cornerAfterVertical = await position(corner);
  expectNear(columnAfterVertical.y, scrollBox.y + 1);
  expectNear(cornerAfterVertical.y, scrollBox.y + 1);
});

test('比較表は対象別アクセントと固定行列を共通利用する', async ({ page }) => {
  await page.goto('/compare/?ids=gothic,italian-renaissance,baroque');

  const scroll = page.getByRole('region', {
    name: '選択したムーブメントの比較表',
  });
  const corner = scroll.locator('[data-sticky-cell="corner"]');
  const column = scroll.locator('[data-sticky-cell="column"]').first();
  const row = scroll.getByRole('rowheader', { name: '思想' });
  const scrollBox = await position(scroll);

  await expect(page.getByText('現在比較中')).toBeVisible();
  await expect(page.getByText('背景', { exact: true })).toBeVisible();
  await expect(page.getByText('作品', { exact: true })).toBeVisible();
  await expect(page.getByText('制度', { exact: true })).toBeVisible();
  await expect(page.getByText('影響', { exact: true })).toBeVisible();
  await expect(page.locator('option[value="gothic"]')).toHaveCount(0);

  const chipAccent = await page
    .locator('[data-compare-chip="gothic"]')
    .evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--compare-accent').trim(),
    );
  const columnAccent = await page
    .locator('[data-compare-column="gothic"]')
    .evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--compare-accent').trim(),
    );
  expect(chipAccent).toBe(columnAccent);

  const hasHorizontalOverflow = await scroll.evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  );
  if (hasHorizontalOverflow) {
    await scroll.evaluate((element) => {
      element.scrollLeft = 260;
    });
    await expect.poll(() => scroll.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

    const rowAfterHorizontal = await position(row);
    const cornerAfterHorizontal = await position(corner);
    expectNear(rowAfterHorizontal.x, scrollBox.x + 1);
    expectNear(cornerAfterHorizontal.x, scrollBox.x + 1);
  } else {
    await expect(row).toBeVisible();
  }

  await scroll.evaluate((element) => {
    element.scrollTop = 320;
  });
  await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  const columnAfterVertical = await position(column);
  const cornerAfterVertical = await position(corner);
  expectNear(columnAfterVertical.y, scrollBox.y + 1);
  expectNear(cornerAfterVertical.y, scrollBox.y + 1);
});

test('比較対象が1件でもチップと不足件数を表示する', async ({ page }) => {
  await page.goto('/compare/?ids=gothic');

  await expect(page.locator('[data-compare-chip="gothic"]')).toBeVisible();
  await expect(page.getByText('あと1件選択してください', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', {
    name: '選択したムーブメントの比較表',
  })).toHaveCount(0);
});

test('比較対象の削除を短くアニメーションし、残る対象の色を維持する', async ({ page }) => {
  await page.goto('/compare/?ids=gothic,italian-renaissance,baroque');

  const baroqueChip = page.locator('[data-compare-chip="baroque"]');
  const accentBefore = await baroqueChip.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--compare-accent').trim(),
  );
  const gothicChip = page.locator('[data-compare-chip="gothic"]');

  await gothicChip
    .getByRole('button', { name: 'ゴシック美術を比較から外す' })
    .click();

  await expect(gothicChip).toHaveAttribute('data-exiting', 'true');
  await expect(gothicChip).toHaveCount(0);

  const accentAfter = await baroqueChip.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--compare-accent').trim(),
  );
  expect(accentAfter).toBe(accentBefore);
});

test('ダークモードでも固定セルに不透明な背景を持つ', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/compare/?ids=gothic,baroque');

  const paperColor = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--c-paper').trim(),
  );
  const corner = page.locator('[data-sticky-cell="corner"]');
  const background = await corner.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(paperColor).toBe('22 22 24');
  expect(background).toMatch(/^rgb\(/);
  expect(background).not.toContain('rgba');
});
