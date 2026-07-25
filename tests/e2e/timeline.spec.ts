import { test, expect, type Page } from '@playwright/test';

const modeButton = (page: Page, name: string) =>
  page.getByRole('group', { name: '表示モード' }).getByRole('button', { name, exact: true });

test('通史はコンパクトな俯瞰表示と1行ラベルを使う', async ({ page }, testInfo) => {
  await page.goto('/timeline/');

  const track = page.locator('[data-timeline-track]');
  await expect(track).toHaveAttribute('data-timeline-mode', 'survey');
  await expect(modeButton(page, '通史')).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('button', { name: '通史へ戻る' })).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: '時代ナビゲーション' })).toHaveCount(0);
  await expect(page.getByText('時代へ移動', { exact: true })).toHaveCount(0);

  const width = await track.evaluate((element) => element.getBoundingClientRect().width);
  if (testInfo.project.name === 'mobile') {
    expect(width).toBe(760);
  } else {
    expect(width).toBeGreaterThanOrEqual(1100);
    expect(width).toBeLessThanOrEqual(1300);
  }

  const surveyLabel = page
    .locator(
      '[data-timeline-bar="early-christian-byzantine"] .timeline-label-survey',
    )
    .first();
  await expect(surveyLabel).toHaveCount(1);
  await expect
    .poll(() =>
      surveyLabel.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeGreaterThan(0);
  expect(await surveyLabel.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe('nowrap');
});

test('時代別モードは端末と密度に応じた幅と詳細目盛りを使う', async ({ page }, testInfo) => {
  await page.goto('/timeline/');

  const mobile = testInfo.project.name === 'mobile';
  const expectations = mobile
    ? [
        { label: '先史', min: 720, max: 800 },
        { label: '古代', min: 740, max: 800 },
        { label: '中世', min: 820, max: 900 },
        { label: '近世', min: 920, max: 1000 },
        { label: '近代', min: 1000, max: 1100 },
        { label: '現代', min: 1100, max: 1200 },
      ]
    : [
        { label: '先史', min: 1000, max: 1200 },
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

test('ラベルは短縮名と年代を1行で表示し、詳細ページへ直接リンクする', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/timeline/');
  await modeButton(page, '現代').click();

  const conceptual = page.locator('[data-timeline-bar="conceptual-art"]').first();
  await conceptual.focus();
  await expect(page.locator('[data-movement-inspector]')).toHaveCount(0);
  await expect(conceptual).toHaveAttribute(
    'href',
    /\/movements\/conceptual-art\/$/,
  );
  await expect(conceptual.locator('[data-label-text]')).toContainText(
    'コンセプチュアル',
  );
  await expect(conceptual.locator('[data-label-date]')).toHaveText('1965〜1975');

  const labelStyle = await conceptual.locator('.timeline-label-detail').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      whiteSpace: style.whiteSpace,
      textOverflow: style.textOverflow,
    };
  });
  expect(labelStyle.whiteSpace).toBe('nowrap');
  expect(labelStyle.textOverflow).toBe('ellipsis');
  expect(
    await conceptual
      .locator('[data-timeline-hit-area]')
      .evaluate((element) => element.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(44);
});

test('バーは44pxの操作領域内に薄い角丸ラベルとして表示する', async ({
  page,
}, testInfo) => {
  await page.goto('/timeline/');
  await modeButton(page, '近代').click();

  const bar = page.locator('[data-timeline-bar="impressionism"]').first();
  const visual = bar.locator('[data-timeline-bar-visual]');
  const label = bar.locator('[data-label-text]');
  const lane = page.locator('[data-timeline-lane]').first();

  const metrics = await bar.evaluate((element) => {
    const visualElement = element.querySelector<HTMLElement>(
      '[data-timeline-bar-visual]',
    );
    if (!visualElement) throw new Error('timeline bar visual is missing');
    return {
      targetHeight: element.getBoundingClientRect().height,
      visualHeight: visualElement.getBoundingClientRect().height,
      visualBorderTop: getComputedStyle(visualElement).borderTopWidth,
      visualRadius: getComputedStyle(visualElement).borderRadius,
      visualBackground: getComputedStyle(visualElement).backgroundColor,
    };
  });
  expect(metrics.targetHeight).toBeGreaterThanOrEqual(44);
  expect(metrics.visualHeight).toBe(22);
  expect(metrics.visualBorderTop).toBe('1px');
  expect(metrics.visualRadius).toBe('3px');
  expect(metrics.visualBackground).not.toBe('rgba(0, 0, 0, 0)');
  expect(await label.evaluate((element) => getComputedStyle(element).textAlign)).toBe(
    'center',
  );
  expect(await lane.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    'rgba(0, 0, 0, 0)',
  );

  const tickCounts = await page.locator('[data-timeline-tick]').evaluateAll((ticks) => ({
    all: ticks.length,
    major: ticks.filter((tick) => tick.getAttribute('data-major-tick') === 'true')
      .length,
  }));
  expect(tickCounts.major).toBeGreaterThanOrEqual(2);
  expect(tickCounts.major).toBeLessThan(tickCounts.all);
  await expect(page.locator('[data-timeline-relationship]')).toHaveCount(0);
  await expect(visual).toBeVisible();
  const neoclassicismName = page
    .locator('[data-timeline-bar="neoclassicism"]')
    .first()
    .locator('[data-label-text]');
  expect(
    await neoclassicismName.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path:
      testInfo.project.name === 'mobile'
        ? 'docs/screenshots/timeline-label-strips-iphone.png'
        : 'docs/screenshots/timeline-label-strips-desktop.png',
    fullPage: false,
  });
});

test('iPhone幅では表示状態と地域列が固定され、1タップで詳細へ移動する', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/timeline/');
  await modeButton(page, '近代').tap();

  const status = page.locator('[data-timeline-status]');
  const regionColumn = page.locator('[data-region-column]');
  expect(await status.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
  expect(await regionColumn.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');

  const minimumTarget = await modeButton(page, '近代').evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  expect(minimumTarget).toBeGreaterThanOrEqual(44);

  const impressionism = page.locator('[data-timeline-bar="impressionism"]').first();
  await impressionism.tap();
  await expect(page).toHaveURL(/\/movements\/impressionism\/$/);
  await expect(page.locator('[data-movement-inspector]')).toHaveCount(0);

  await page.goBack();
  await expect(page.locator('[data-timeline-track]')).toBeVisible();
  const bottomPadding = await page.locator('main > div').evaluate((element) =>
    parseFloat(getComputedStyle(element).paddingBottom),
  );
  expect(bottomPadding).toBeGreaterThanOrEqual(16);
});

test('先史と古代の主要ムーブメントを正しいモードへ表示する', async ({ page }) => {
  await page.goto('/timeline/');

  await modeButton(page, '先史').click();
  await expect(page.locator('[data-timeline-bar="prehistoric-ritual"]').first()).toBeVisible();

  await modeButton(page, '古代').click();
  const greek = page.locator('[data-timeline-bar="ancient-greek-classical"]').first();
  const byzantine = page.locator('[data-timeline-bar="early-christian-byzantine"]').first();
  await expect(greek).toBeVisible();
  await expect(byzantine).toBeVisible();

  const trackWidth = await page
    .locator('[data-timeline-track]')
    .evaluate((element) => element.getBoundingClientRect().width);
  const coordinates = await greek.evaluate((element) => ({
    start: Number((element as HTMLElement).dataset.barStart),
    end: Number((element as HTMLElement).dataset.barEnd),
    width: element.getBoundingClientRect().width,
  }));
  expect(coordinates.start).toBeCloseTo((2520 / 3500) * trackWidth, 1);
  expect(coordinates.end).toBeCloseTo((2677 / 3500) * trackWidth, 1);
  expect(coordinates.width).toBeCloseTo(coordinates.end - coordinates.start, 1);
});

test('空レーンを描画せず、スマホのタイムライン高を圧縮する', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/timeline/');
  await modeButton(page, '中世').tap();

  const laneCount = await page.locator('[data-timeline-lane]').count();
  const emptyLaneCount = await page.locator('[data-timeline-lane]').evaluateAll((lanes) =>
    lanes.filter((lane) => lane.querySelector('[data-timeline-bar]') === null).length,
  );
  expect(laneCount).toBeGreaterThan(0);
  expect(emptyLaneCount).toBe(0);

  const trackHeight = await page
    .locator('[data-timeline-track]')
    .evaluate((element) => element.getBoundingClientRect().height);
  expect(trackHeight).toBeLessThanOrEqual(844 * 0.75);
});

test('長期間バーのラベルは横スクロール後も可視領域へ追従する', async ({ page }) => {
  await page.goto('/timeline/');
  await modeButton(page, '中世').click();

  const viewport = page.locator('[data-timeline-scroll]');
  const bar = page.locator('[data-timeline-bar="early-christian-byzantine"]').first();
  const label = bar.locator('[data-follow-label]');
  await expect(label).toBeVisible();

  await viewport.evaluate((element) => {
    element.scrollLeft = Math.min(500, element.scrollWidth - element.clientWidth);
    element.dispatchEvent(new Event('scroll'));
  });
  await expect(label).toHaveAttribute('data-label-following', 'true');

  await expect
    .poll(async () => {
      const [viewportBox, labelBox] = await Promise.all([
        viewport.evaluate((element) => element.getBoundingClientRect()),
        label.evaluate((element) => element.getBoundingClientRect()),
      ]);
      return (
        labelBox.left >= viewportBox.left &&
        labelBox.right <= viewportBox.right + 1
      );
    })
    .toBe(true);
});

test('先史美術の追従ラベルは正式名称か短縮名を維持する', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/timeline/');
  await modeButton(page, '先史').click();

  const viewport = page.locator('[data-timeline-scroll]');
  const bar = page.locator('[data-timeline-bar="prehistoric-ritual"]').first();
  const label = bar.locator('[data-follow-label]');
  await viewport.evaluate((element) => {
    element.scrollLeft = Math.min(320, element.scrollWidth - element.clientWidth);
    element.dispatchEvent(new Event('scroll'));
  });
  await expect(label).toHaveAttribute('data-label-following', 'true');
  await expect(label).toHaveAttribute('data-label-variant', /full|short/);
  await expect(bar).toHaveAttribute('title', /先史美術/);
});

test('ダークモードとPWA standalone設定を維持する', async ({
  page,
  request,
}, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('aha-theme', 'dark'));
  await page.goto('/timeline/');
  await modeButton(page, '中世').click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  expect((await manifest.json()).display).toBe('standalone');
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({
      path: 'docs/screenshots/timeline-label-strips-dark-desktop.png',
      fullPage: false,
    });
  }
});
