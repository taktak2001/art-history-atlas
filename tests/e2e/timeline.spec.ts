import { test, expect, type Page } from '@playwright/test';

const modeButton = (page: Page, name: string) =>
  page.getByRole('group', { name: '表示モード' }).getByRole('button', { name, exact: true });

test('通史はコンパクトな俯瞰表示と1行ラベルを使う', async ({ page }) => {
  await page.goto('/timeline/');

  const track = page.locator('[data-timeline-track]');
  await expect(track).toHaveAttribute('data-timeline-mode', 'survey');
  await expect(modeButton(page, '通史')).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('button', { name: '通史へ戻る' })).toHaveCount(0);

  const width = await track.evaluate((element) => element.getBoundingClientRect().width);
  expect(width).toBeGreaterThanOrEqual(1100);
  expect(width).toBeLessThanOrEqual(1300);

  const surveyLabel = page.locator('[data-timeline-bar="impressionism"] .timeline-label-survey').first();
  await expect(surveyLabel).toBeVisible();
  expect(await surveyLabel.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe('nowrap');
});

test('時代別モードは密度に応じた詳細幅と目盛りを使う', async ({ page }) => {
  await page.goto('/timeline/');

  const expectations = [
    { label: '古代', min: 1000, max: 1200 },
    { label: '中世', min: 1200, max: 1500 },
    { label: '近世', min: 1600, max: 2000 },
    { label: '近代', min: 1800, max: 2400 },
    { label: '現代', min: 1800, max: 2400 },
  ];

  for (const expected of expectations) {
    await modeButton(page, expected.label).click();
    const width = await page
      .locator('[data-timeline-track]')
      .evaluate((element) => element.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(expected.min);
    expect(width).toBeLessThanOrEqual(expected.max);
    await expect(modeButton(page, expected.label)).toHaveAttribute('aria-current', 'true');
  }
});

test('近代では対象範囲、使用レーン、クリップ表示だけを描画する', async ({ page }) => {
  await page.goto('/timeline/');
  await modeButton(page, '近代').click();

  await expect(page.locator('[data-timeline-bar="cubism"]').first()).toBeVisible();
  await expect(page.locator('[data-timeline-bar="superflat"]')).toHaveCount(0);
  await expect(page.locator('[data-timeline-bar="rococo"]').first()).toHaveAttribute(
    'data-clipped-start',
    'true',
  );
  await expect(page.locator('[data-timeline-bar="abstract-expressionism"]').first()).toHaveAttribute(
    'data-clipped-end',
    'true',
  );

  const laneCount = await page.locator('[data-timeline-lane]').count();
  const labelCount = await page.locator('[data-region-lane-label]').count();
  expect(laneCount).toBe(labelCount);
  expect(laneCount).toBeGreaterThan(0);

  const emptyLanes = await page.locator('[data-timeline-lane]').evaluateAll((lanes) =>
    lanes.filter((lane) => lane.querySelectorAll('[data-timeline-bar]').length === 0).length,
  );
  expect(emptyLanes).toBe(0);
});

test('詳細ラベルは2行まで表示し、フォーカスで正式情報を示す', async ({ page }) => {
  await page.goto('/timeline/');
  await modeButton(page, '現代').click();

  const conceptual = page.locator('[data-timeline-bar="conceptual-art"]').first();
  await conceptual.focus();
  const inspector = page.locator('[data-movement-inspector]');
  await expect(inspector).toContainText('コンセプチュアル・アート');
  await expect(inspector).toContainText('方法論・理論');
  await expect(inspector).toContainText('国際的');

  const labelStyle = await conceptual.locator('.timeline-label-detail').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      whiteSpace: style.whiteSpace,
      lineClamp: style.getPropertyValue('-webkit-line-clamp'),
    };
  });
  expect(labelStyle.whiteSpace).toBe('normal');
  expect(labelStyle.lineClamp).toBe('2');
  expect(await conceptual.evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(136);
});

test('iPhone幅では表示状態と地域列が固定され、タップで詳細を示す', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/timeline/');
  await modeButton(page, '近代').tap();

  const status = page.locator('[data-timeline-status]');
  const regionColumn = page.locator('[data-region-column]');
  expect(await status.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
  expect(await regionColumn.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');

  const impressionism = page.locator('[data-timeline-bar="impressionism"]').first();
  await impressionism.tap();
  await expect(page).toHaveURL(/\/timeline\/?$/);
  await expect(page.locator('[data-movement-inspector]')).toContainText('印象派');

  const minimumTarget = await modeButton(page, '近代').evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  expect(minimumTarget).toBeGreaterThanOrEqual(44);
  const bottomPadding = await page.locator('main > div').evaluate(
    (element) => parseFloat(getComputedStyle(element).paddingBottom),
  );
  expect(bottomPadding).toBeGreaterThanOrEqual(16);
});

test('ダークモードとPWA standalone設定を維持する', async ({ page, request }) => {
  await page.addInitScript(() => localStorage.setItem('aha-theme', 'dark'));
  await page.goto('/timeline/');
  await modeButton(page, '中世').click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  expect((await manifest.json()).display).toBe('standalone');
});
