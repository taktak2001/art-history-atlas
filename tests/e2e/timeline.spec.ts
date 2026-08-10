import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const modeButton = (page: Page, name: string) =>
  page.getByRole('group', { name: '表示モード' }).getByRole('button', { name, exact: true });

const expectViewerLabelsNotToOverlap = async (page: Page) => {
  const labels = await page
    .locator('[data-viewer-node]:visible')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const node = element as HTMLElement;
        const rect = element.getBoundingClientRect();
        return {
          id: node.dataset.movementId,
          region: node.dataset.regionId,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      }),
    );

  for (let firstIndex = 0; firstIndex < labels.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < labels.length;
      secondIndex += 1
    ) {
      const first = labels[firstIndex];
      const second = labels[secondIndex];
      if (first.region !== second.region) continue;
      const overlaps =
        first.left < second.right &&
        first.right > second.left &&
        first.top < second.bottom &&
        first.bottom > second.top;
      expect(
        overlaps,
        `${first.region}: ${first.id} and ${second.id} overlap`,
      ).toBe(false);
      if (first.left < second.right && first.right > second.left) {
        const verticalGap = Math.max(
          second.top - first.bottom,
          first.top - second.bottom,
        );
        expect(
          verticalGap,
          `${first.region}: ${first.id} and ${second.id} need breathing room`,
        ).toBeGreaterThanOrEqual(4);
      }
    }
  }
};

test('通史はコンパクトな俯瞰表示と日本語名・年代の2段ラベルを使う', async ({
  page,
}, testInfo) => {
  await page.goto('/timeline/');

  const track = page.locator('[data-timeline-track]');
  await expect(track).toHaveAttribute('data-timeline-mode', 'survey');
  await expect(modeButton(page, '通史')).toHaveAttribute('aria-current', 'true');
  await expect(
    page.locator('[data-timeline-status]').getByRole('button', { name: '通史' }),
  ).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: '時代ナビゲーション' })).toHaveCount(0);
  await expect(page.getByText('時代へ移動', { exact: true })).toHaveCount(0);
  await expect(page.getByText('LEVEL OF DETAIL', { exact: true })).toBeVisible();
  await expect(page.getByText('Era', { exact: true })).toBeVisible();
  await expect(page.getByText('表示中', { exact: true })).toHaveCount(0);

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
  const surveyDate = page
    .locator(
      '[data-timeline-bar="early-christian-byzantine"] [data-label-date]',
    )
    .first();
  await expect(surveyDate).toContainText('330〜1453');
  expect(
    await surveyDate.evaluate((element) => element.getBoundingClientRect().y),
  ).toBeGreaterThan(
    await surveyLabel.evaluate((element) => element.getBoundingClientRect().y),
  );
  await expect(
    page.locator('[data-timeline-bar="light-and-space"]'),
  ).not.toContainText('Light and Space');
});

test('時代別の表示範囲は時代名と年代だけを示し、通史はリンク状に戻る', async ({ page }) => {
  await page.goto('/timeline/');
  await modeButton(page, '近代').click();

  const status = page.locator('[data-timeline-status]');
  await expect(status).toContainText('近代');
  await expect(status).toContainText('1700〜2000');
  await expect(status).not.toContainText('表示中');
  await expect(status).not.toContainText('同時代');

  const back = status.getByRole('button', { name: '通史' });
  await expect(back).toBeVisible();
  expect(
    await back.evaluate((element) => parseFloat(getComputedStyle(element).borderTopWidth)),
  ).toBe(0);
});

test('バーと追従ラベルは薄いラベル型で、フォーカス時も細い枠を保つ', async ({ page }) => {
  await page.goto('/timeline/');
  await modeButton(page, '近代').click();

  const bar = page.locator('[data-timeline-bar="impressionism"]').first();
  const visual = bar.locator('[data-timeline-bar-visual]');
  const label = bar.locator('[data-follow-label]');
  const statusTitle = page.locator('.timeline-status__title');
  const regionLabel = page.locator('[data-region-lane-label]').first();
  const tickLabel = page.locator('.timeline-tick-label').first();

  expect(await label.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
    'rgba(0, 0, 0, 0)',
  );
  const typography = await Promise.all([
    label.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        fontWeight: Number(style.fontWeight),
        paddingLeft: parseFloat(style.paddingLeft),
      };
    }),
    statusTitle.evaluate((element) => Number(getComputedStyle(element).fontWeight)),
    regionLabel.evaluate((element) => Number(getComputedStyle(element).fontWeight)),
    tickLabel.evaluate((element) => Number(getComputedStyle(element).fontWeight)),
  ]);
  expect(typography[0]).toEqual({
    color: 'rgb(28, 28, 30)',
    fontWeight: 600,
    paddingLeft: 1,
  });
  expect(typography[1]).toBe(600);
  expect(typography[2]).toBe(500);
  expect(typography[3]).toBe(400);
  const normalBorder = await visual.evaluate((element) =>
    parseFloat(getComputedStyle(element).borderTopWidth),
  );
  await bar.focus();
  const selectedBorder = await visual.evaluate((element) =>
    parseFloat(getComputedStyle(element).borderTopWidth),
  );
  // 細い枠（1px）を通常時もフォーカス時も保つ
  expect(normalBorder).toBeGreaterThanOrEqual(1);
  expect(normalBorder).toBeLessThanOrEqual(1.5);
  expect(selectedBorder).toBeLessThanOrEqual(1.5);
});

test('地域色を同一地域で統一し、副次地域も同じラベル強度で示す', async ({
  page,
}) => {
  await page.goto('/timeline/');
  await modeButton(page, '近代').click();

  const franceBars = page.locator('[data-timeline-region="france"]');
  await expect(franceBars.first()).toBeVisible();
  expect(await franceBars.count()).toBeGreaterThan(1);
  const franceColors = await franceBars.evaluateAll((elements) =>
    elements.map((element) =>
      getComputedStyle(element)
        .getPropertyValue('--timeline-region-rgb')
        .trim(),
    ),
  );
  expect(new Set(franceColors).size).toBe(1);
  const franceDot = page
    .locator('[data-region-lane-label="france"]')
    .locator('.timeline-region-dot');
  await expect(franceDot).toBeVisible();
  const dotStyle = await franceDot.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      width: parseFloat(style.width),
    };
  });
  expect(dotStyle.background).toBe('rgba(64, 103, 137, 0.78)');
  expect(dotStyle.width).toBeGreaterThanOrEqual(7);

  const italyColor = await page
    .locator('[data-timeline-region="italy"]')
    .first()
    .evaluate((element) =>
      getComputedStyle(element)
        .getPropertyValue('--timeline-region-rgb')
        .trim(),
    );
  expect(italyColor).not.toBe(franceColors[0]);

  await modeButton(page, '中世').click();
  const byzantineBars = page.locator(
    '[data-timeline-bar="early-christian-byzantine"]',
  );
  expect(await byzantineBars.count()).toBeGreaterThan(1);
  const appearances = await byzantineBars
    .locator('[data-timeline-bar-visual]')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return {
          borderWidth: parseFloat(style.borderTopWidth),
          radius: parseFloat(style.borderRadius),
          color: style.color,
          background: style.backgroundColor,
        };
      }),
    );
  expect(
    appearances.every(
      ({ borderWidth, radius, color, background }) =>
        borderWidth >= 1 &&
        radius === 3 &&
        color === 'rgb(28, 28, 30)' &&
        background !== 'rgba(0, 0, 0, 0)',
    ),
  ).toBe(true);
});

test('通史の起点を地域から独立した背景・基盤帯として示す', async ({
  page,
}) => {
  await page.goto('/timeline/');

  const origin = page.locator('[data-region-column] [data-origin-band]');
  await expect(origin).toHaveText('背景・基盤');
  await expect(
    page.locator('[data-region-lane-label="mediterranean"]'),
  ).toBeVisible();
  expect(
    await origin.evaluate((element) => getComputedStyle(element).fontSize),
  ).not.toBe(
    await page
      .locator('[data-region-lane-label="mediterranean"]')
      .evaluate((element) => getComputedStyle(element).fontSize),
  );
});

test('時代別モードは端末と密度に応じた幅と自動フィット目盛りを使う', async ({ page }, testInfo) => {
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

test('詳細ラベルは日本語名称と年代の2段表示で、PCでも直接詳細へ遷移する', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/timeline/');
  await modeButton(page, '現代').click();

  const conceptual = page.locator('[data-timeline-bar="conceptual-art"]').first();
  await conceptual.focus();
  await expect(page.locator('[data-movement-inspector]')).toHaveCount(0);
  await expect(conceptual).toHaveAttribute('href', '/movements/conceptual-art/');
  await expect(conceptual.locator('[data-label-date]')).toContainText('1965〜1975');

  const labelStyle = await conceptual.locator('.timeline-label-detail').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      whiteSpace: style.whiteSpace,
      fontWeight: style.fontWeight,
      color: style.color,
      opacity: style.opacity,
      wordBreak: style.wordBreak,
    };
  });
  expect(labelStyle.whiteSpace).toBe('nowrap');
  expect(labelStyle.fontWeight).toBe('600');
  expect(labelStyle.opacity).toBe('1');
  expect(labelStyle.wordBreak).toBe('keep-all');
  expect(labelStyle.color).not.toBe('rgb(92, 92, 96)');
  expect(
    await conceptual
      .locator('[data-timeline-hit-area]')
      .evaluate((element) => element.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(44);
});

test('バーは44pxの操作領域内に22pxの日本語名ブロックと枠外の年代を表示する', async ({ page }) => {
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
    };
  });
  expect(metrics.targetHeight).toBeGreaterThanOrEqual(44);
  expect(metrics.visualHeight).toBe(22);
  expect(metrics.visualBorderTop).toBe('1px');
  // 年代ラベルは枠（visual）の外に配置する
  await expect(
    bar.locator('[data-timeline-bar-visual] [data-label-date]'),
  ).toHaveCount(0);
  await expect(bar.locator('[data-label-date]')).toHaveCount(1);
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
  expect(tickCounts.major).toBeLessThanOrEqual(tickCounts.all);
  await expect(visual).toBeVisible();
  await expect(page.locator('[data-timeline-relationship]')).toHaveCount(0);
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
  const domain = await page.locator('[data-timeline-track]').evaluate((element) => ({
    start: Number((element as HTMLElement).dataset.scaleStart),
    end: Number((element as HTMLElement).dataset.scaleEnd),
    rounding: Number((element as HTMLElement).dataset.scaleRounding),
  }));
  expect(domain).toEqual({ start: -3500, end: 1000, rounding: 500 });
  await expect(greek.locator('[data-follow-label]')).toHaveAttribute(
    'data-label-variant',
    /full|short|ellipsis/,
  );
  const coordinates = await greek.evaluate((element) => ({
    start: Number((element as HTMLElement).dataset.barStart),
    end: Number((element as HTMLElement).dataset.barEnd),
    width: element.getBoundingClientRect().width,
  }));
  expect(coordinates.start).toBeCloseTo((3020 / 4500) * trackWidth, 1);
  expect(coordinates.end).toBeCloseTo((3177 / 4500) * trackWidth, 1);
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
  expect(trackHeight).toBeLessThanOrEqual(844 * 1.1);
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

test('ダークモードとPWA standalone設定を維持する', async ({ page, request }) => {
  await page.addInitScript(() => localStorage.setItem('aha-theme', 'dark'));
  await page.goto('/timeline/');
  await modeButton(page, '中世').click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  expect((await manifest.json()).display).toBe('standalone');
});

test('閲覧モードは全画面へ入り、倍率操作・LOD・終了後の復帰に対応する', async ({
  page,
}) => {
  await page.goto('/timeline/');
  await modeButton(page, '近代').click();

  const trigger = page.getByRole('button', {
    name: 'タイムラインを全画面で表示',
  });
  const normalStage = page.locator('[data-timeline-viewer-stage]');
  await expect(trigger).toBeVisible();
  expect(
    await trigger.evaluate((element) => element.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(44);
  await expect(normalStage).toHaveCount(0);

  await trigger.click();
  const viewer = page.locator('[data-timeline-viewer="active"]');
  const stage = viewer.locator('[data-timeline-viewer-stage]');
  await expect(viewer).toHaveAttribute('role', 'dialog');
  await expect(viewer).toHaveAttribute('aria-modal', 'true');
  await expect(stage).toBeFocused();
  await expect
    .poll(() =>
      viewer.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }),
    )
    .toEqual({
      width: await page.evaluate(() => window.innerWidth),
      height: await page.evaluate(() => window.innerHeight),
    });
  expect(
    await stage.evaluate((element) => getComputedStyle(element).touchAction),
  ).toContain('pan-x');

  await viewer.getByRole('button', { name: '拡大' }).click();
  await expect
    .poll(async () => Number((await viewer.getAttribute('data-viewer-scale')) ?? 0))
    .toBeGreaterThan(1);
  await expect(
    viewer.getByRole('button', { name: '全体表示へ戻す' }),
  ).toHaveCount(0);
  await expect(
    viewer.getByRole('button', {
      name: /表示する範囲、現在は(?:基本|充実|すべて)/,
    }),
  ).toBeVisible();

  await stage.press('Escape');
  await expect(page.locator('[data-timeline-viewer="active"]')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(modeButton(page, '近代')).toHaveAttribute('aria-current', 'true');
});

test('閲覧モード内でLODを切り替え、URLと年代・地域位置を維持する', async ({
  page,
}, testInfo) => {
  await page.goto('/timeline/?lod=core');
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const stage = viewer.locator('[data-timeline-viewer-stage]');
  const zoomIn = viewer.getByRole('button', { name: '拡大' });
  await zoomIn.click();
  await zoomIn.click();
  await stage.evaluate((element) => {
    element.scrollLeft = Math.min(
      420,
      Math.max(0, element.scrollWidth - element.clientWidth),
    );
    element.scrollTop = Math.min(
      260,
      Math.max(0, element.scrollHeight - element.clientHeight),
    );
  });

  const trigger = viewer.getByRole('button', {
    name: '表示する範囲、現在は基本',
  });
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();

  const panel = page.getByRole('dialog', { name: '表示する範囲' });
  const options = panel.getByRole('radiogroup', { name: '表示する範囲' });
  await expect(panel).toBeVisible();
  await expect(options.getByRole('radio', { name: /基本\s*32/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(options.getByRole('radio', { name: /充実\s*48/ })).toBeVisible();
  await expect(options.getByRole('radio', { name: /すべて\s*54/ })).toBeVisible();

  const panelRect = await panel.boundingBox();
  const triggerRect = await trigger.boundingBox();
  expect(panelRect).not.toBeNull();
  expect(triggerRect).not.toBeNull();
  if (panelRect && triggerRect) {
    if (testInfo.project.name === 'mobile') {
      expect(panelRect.width).toBeGreaterThanOrEqual(360);
      expect(panelRect.x).toBeLessThanOrEqual(10);
    } else {
      expect(panelRect.width).toBeLessThanOrEqual(220);
      expect(panelRect.y + panelRect.height).toBeLessThan(triggerRect.y);
    }
  }

  await options.getByRole('radio', { name: /充実\s*48/ }).click();
  await expect(viewer).toHaveAttribute('data-viewer-lod', 'standard');
  await expect(page).toHaveURL(/lod=standard/);
  await expect(page.getByRole('dialog', { name: '表示する範囲' })).toHaveCount(0);
  const standardTrigger = viewer.getByRole('button', {
    name: '表示する範囲、現在は充実',
  });
  await expect(standardTrigger).toBeFocused();
  await expect(viewer).toHaveAttribute('data-last-lod-anchor-region');
  await expect(viewer).toHaveAttribute('data-last-lod-anchor-year');
  const firstAnchor = {
    region: await viewer.getAttribute('data-last-lod-anchor-region'),
    year: Number(await viewer.getAttribute('data-last-lod-anchor-year')),
  };

  await standardTrigger.click();
  await page
    .getByRole('dialog', { name: '表示する範囲' })
    .getByRole('radio', { name: /すべて\s*54/ })
    .click();
  await expect(viewer).toHaveAttribute('data-viewer-lod', 'detailed');
  await expect(page).toHaveURL(/lod=detailed/);
  const secondAnchor = {
    region: await viewer.getAttribute('data-last-lod-anchor-region'),
    year: Number(await viewer.getAttribute('data-last-lod-anchor-year')),
  };
  expect(secondAnchor.region).toBe(firstAnchor.region);
  expect(Math.abs(secondAnchor.year - firstAnchor.year)).toBeLessThanOrEqual(5);

  await page.goBack();
  await expect(page).toHaveURL(/lod=standard/);
  await expect(viewer).toHaveAttribute('data-viewer-lod', 'standard');
  await expect(
    viewer.getByRole('button', { name: '表示する範囲、現在は充実' }),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/lod=detailed/);
  await expect(viewer).toHaveAttribute('data-viewer-lod', 'detailed');

  await viewer.getByRole('button', {
    name: '表示する範囲、現在はすべて',
  }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: '表示する範囲' })).toHaveCount(0);
  await expect(viewer).toBeVisible();
  await expect(
    viewer.getByRole('button', { name: '表示する範囲、現在はすべて' }),
  ).toBeFocused();

  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('[data-timeline-viewer="active"]')
    .analyze();
  expect(accessibilityScanResults.violations).toEqual([]);

  await viewer.getByRole('button', { name: '閲覧モードを閉じる' }).click();
  await expect(
    page
      .getByRole('group', { name: '表示する範囲' })
      .getByRole('button', { name: /すべて\s*54/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page).toHaveURL(/lod=detailed/);
  await expect(
    page
      .getByRole('group', { name: '表示する範囲' })
      .getByRole('button', { name: /すべて\s*54/ }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('閲覧モードの年代軸は縮小・拡大時も短い表記を重ねない', async ({
  page,
}) => {
  await page.goto('/timeline/');
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const stage = viewer.locator('[data-timeline-viewer-stage]');
  const assertReadableTicks = async () => {
    await viewer.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
    const tickLayout = await viewer
      .locator('[data-viewer-tick][data-axis-label-visible="true"]')
      .evaluateAll((elements) => {
        const originRight =
          document
            .querySelector('.timeline-viewer-axis-origin')
            ?.getBoundingClientRect().right ?? 0;
        const timeAxisRect = document
          .querySelector('.timeline-viewer-native-time-axis')
          ?.getBoundingClientRect();
        const visibleLeft = Math.max(originRight, timeAxisRect?.left ?? 0);
        const visibleRight = Math.min(
          window.innerWidth,
          timeAxisRect?.right ?? window.innerWidth,
        );
        return {
          originRight,
          viewportWidth: window.innerWidth,
          ticks: elements
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                left: rect.left,
                right: rect.right,
                text: element.textContent ?? '',
              };
            })
            .filter(
              ({ left, right }) =>
                left >= visibleLeft && right <= visibleRight,
            )
            .sort((a, b) => a.left - b.left),
        };
      });
    const visibleTicks = tickLayout.ticks;
    expect(visibleTicks.length).toBeGreaterThan(0);

    for (let index = 1; index < visibleTicks.length; index += 1) {
      expect(
        visibleTicks[index].left - visibleTicks[index - 1].left,
        JSON.stringify(visibleTicks),
      ).toBeGreaterThanOrEqual(63);
      expect(visibleTicks[index].left).toBeGreaterThanOrEqual(
        visibleTicks[index - 1].right + 7,
      );
    }
    expect(visibleTicks.map(({ text }) => text).join('')).not.toContain(
      '前40,000',
    );
    for (const tick of visibleTicks) {
      expect(tick.left).toBeGreaterThanOrEqual(tickLayout.originRight);
      expect(tick.right).toBeLessThanOrEqual(tickLayout.viewportWidth);
    }
  };

  await expect(viewer.locator('[data-viewer-tick="-40000"]')).toHaveText(
    '前4万',
  );
  await assertReadableTicks();

  const zoomOut = viewer.getByRole('button', { name: '縮小' });
  await zoomOut.click();
  await zoomOut.click();
  await expect
    .poll(async () => Number(await viewer.getAttribute('data-viewer-scale')))
    .toBeCloseTo(0.64, 2);
  await assertReadableTicks();
  await expect(viewer.locator('[data-viewer-tick="0"]')).toHaveText('0');

  await stage.dispatchEvent('dblclick', { clientX: 260, clientY: 260 });
  await expect
    .poll(async () => Number(await viewer.getAttribute('data-viewer-scale')))
    .toBeCloseTo(1.75, 2);
  await assertReadableTicks();

  const zoomIn = viewer.getByRole('button', { name: '拡大' });
  await zoomIn.click();
  await zoomIn.click();
  await expect
    .poll(async () => Number(await viewer.getAttribute('data-viewer-scale')))
    .toBeGreaterThanOrEqual(2.7);
  await assertReadableTicks();
});

test('閲覧モードはnative scroll・ダブルクリック・キーボード操作を共有する', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/timeline/');
  await page
    .getByRole('group', { name: '表示する範囲' })
    .getByRole('button', { name: /すべて/ })
    .click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const stage = viewer.locator('[data-timeline-viewer-stage]');
  await expect(viewer).toHaveAttribute('data-viewer-engine', 'native-scroll');
  await expect(viewer).toHaveAttribute(
    'data-native-one-finger-pan',
    'browser',
  );
  const nativeStyles = await stage.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      touchAction: style.touchAction,
      pointerMoveHandler: element.onpointermove,
    };
  });
  expect(nativeStyles.overflowX).toBe('auto');
  expect(nativeStyles.overflowY).toBe('auto');
  expect(nativeStyles.touchAction).toContain('pan-x');
  expect(nativeStyles.touchAction).toContain('pan-y');
  expect(nativeStyles.pointerMoveHandler).toBeNull();
  await expect(stage).toHaveAttribute('data-desktop-drag-pan', 'enabled');
  const beforeScrollLeft = await stage.evaluate((element) => element.scrollLeft);
  await stage.evaluate((element) => {
    element.scrollLeft = Math.min(
      element.scrollLeft + 180,
      element.scrollWidth - element.clientWidth,
    );
  });
  await expect
    .poll(async () => stage.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(beforeScrollLeft);

  await stage.dispatchEvent('dblclick', { clientX: 720, clientY: 520 });
  await expect(viewer).toHaveAttribute('data-viewer-scale', '1.75');
  await stage.press('0');
  await expect
    .poll(async () => Number((await viewer.getAttribute('data-viewer-scale')) ?? 0))
    .toBeLessThanOrEqual(1);
  await stage.press('+');
  await expect
    .poll(async () => Number((await viewer.getAttribute('data-viewer-scale')) ?? 0))
    .toBeGreaterThan(0);
});

test('PC閲覧モードはマウスドラッグで上下左右へパンできる', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/timeline/');
  await page
    .getByRole('group', { name: '表示する範囲' })
    .getByRole('button', { name: /すべて/ })
    .click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const stage = page.locator('[data-native-scroll-viewport]');
  const bounds = await stage.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;

  await page.waitForTimeout(180);
  await stage.evaluate((element) => {
    element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
    element.scrollTop = (element.scrollHeight - element.clientHeight) / 2;
  });
  const before = await stage.evaluate((element) => ({
    left: element.scrollLeft,
    top: element.scrollTop,
  }));

  await page.mouse.move(
    bounds.x + bounds.width * 0.65,
    bounds.y + bounds.height * 0.65,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.65 - 120,
    bounds.y + bounds.height * 0.65 - 90,
    { steps: 6 },
  );
  await page.mouse.up();

  await expect
    .poll(() => stage.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before.left + 80);
  await expect
    .poll(() => stage.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(before.top + 50);
  await expect(stage).not.toHaveAttribute('data-desktop-dragging', 'true');
});

test('PC閲覧モードはドラッグしていないムーブメントクリックで詳細へ遷移する', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/timeline/');
  await page
    .getByRole('group', { name: '表示する範囲' })
    .getByRole('button', { name: /すべて/ })
    .click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const baroque = viewer
    .locator('[data-viewer-node][data-movement-id="baroque"]:visible')
    .first();
  await expect(baroque).toBeVisible();
  await baroque.click();

  await expect(page).toHaveURL(/\/movements\/baroque\/$/);
  await expect(page.getByRole('heading', { name: 'バロック', level: 1 })).toBeVisible();
});

test('＋／−ズームは中央の年代と地域レーンを維持する', async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === 'desktop') {
    await page.setViewportSize({ width: 900, height: 800 });
  }
  await page.goto('/timeline/');
  await page
    .getByRole('group', { name: '表示する範囲' })
    .getByRole('button', { name: /すべて/ })
    .click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const stage = viewer.locator('[data-native-scroll-viewport]');
  const zoomOut = viewer.getByRole('button', { name: '縮小' });
  const zoomIn = viewer.getByRole('button', { name: '拡大' });
  await zoomOut.click();
  await zoomOut.click();
  await expect
    .poll(async () => Number(await viewer.getAttribute('data-viewer-scale')))
    .toBeCloseTo(0.64, 2);

  const centerOnJapanAnd1900 = async () =>
    stage.evaluate((element) => {
      const viewerElement = element.closest<HTMLElement>(
        '[data-timeline-viewer="active"]',
      );
      const region = viewerElement?.querySelector<HTMLElement>(
        '[data-viewer-region-id="japan"]',
      );
      const tick = viewerElement?.querySelector<HTMLElement>(
        '[data-viewer-gridline="1900"]',
      );
      const controls = viewerElement?.querySelector<HTMLElement>(
        '[data-viewer-controls]',
      );
      if (!viewerElement || !region || !tick || !controls) return;
      const stageRect = element.getBoundingClientRect();
      const regionRect = region.getBoundingClientRect();
      const tickRect = tick.getBoundingClientRect();
      const controlsRect = controls.getBoundingClientRect();
      const styles = getComputedStyle(viewerElement);
      const regionWidth = Number.parseFloat(
        styles.getPropertyValue('--timeline-viewer-region-axis-width'),
      );
      const timeHeight = Number.parseFloat(
        styles.getPropertyValue('--timeline-viewer-time-axis-height'),
      );
      const anchorX = regionWidth + (element.clientWidth - regionWidth) / 2;
      const contentBottom = Math.min(
        element.clientHeight,
        controlsRect.top - stageRect.top - 12,
      );
      const anchorY = timeHeight + (contentBottom - timeHeight) / 2;
      element.scrollLeft += tickRect.left - (stageRect.left + anchorX);
      element.scrollTop +=
        regionRect.top + regionRect.height / 2 - (stageRect.top + anchorY);
    });

  const measureAnchorOffsets = async () =>
    stage.evaluate((element) => {
      const viewerElement = element.closest<HTMLElement>(
        '[data-timeline-viewer="active"]',
      )!;
      const region = viewerElement.querySelector<HTMLElement>(
        '[data-viewer-region-id="japan"]',
      )!;
      const tick = viewerElement.querySelector<HTMLElement>(
        '[data-viewer-gridline="1900"]',
      )!;
      const controls = viewerElement.querySelector<HTMLElement>(
        '[data-viewer-controls]',
      )!;
      const stageRect = element.getBoundingClientRect();
      const regionRect = region.getBoundingClientRect();
      const tickRect = tick.getBoundingClientRect();
      const controlsRect = controls.getBoundingClientRect();
      const styles = getComputedStyle(viewerElement);
      const regionWidth = Number.parseFloat(
        styles.getPropertyValue('--timeline-viewer-region-axis-width'),
      );
      const timeHeight = Number.parseFloat(
        styles.getPropertyValue('--timeline-viewer-time-axis-height'),
      );
      const anchorX = stageRect.left +
        regionWidth +
        (element.clientWidth - regionWidth) / 2;
      const contentBottom = Math.min(
        element.clientHeight,
        controlsRect.top - stageRect.top - 12,
      );
      const anchorY =
        stageRect.top + timeHeight + (contentBottom - timeHeight) / 2;
      return {
        x: tickRect.left - anchorX,
        y: regionRect.top + regionRect.height / 2 - anchorY,
        regionHeight: regionRect.height,
        viewportWidth: element.clientWidth,
      };
    });

  await centerOnJapanAnd1900();
  const before = await measureAnchorOffsets();
  for (const expectedScale of [0.8, 1, 1.25]) {
    await zoomIn.click();
    await expect
      .poll(async () => Number(await viewer.getAttribute('data-viewer-scale')))
      .toBeCloseTo(expectedScale, 2);
    const after = await measureAnchorOffsets();
    expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(
      after.viewportWidth * 0.05,
    );
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(
      after.regionHeight * 0.1,
    );
    await expect(viewer).toHaveAttribute(
      'data-last-zoom-anchor-region',
      'japan',
    );
    await expect
      .poll(async () =>
        Number(await viewer.getAttribute('data-last-zoom-anchor-year')),
      )
      .toBeGreaterThanOrEqual(1898);
    await expect
      .poll(async () =>
        Number(await viewer.getAttribute('data-last-zoom-anchor-year')),
      )
      .toBeLessThanOrEqual(1902);
  }

  await zoomOut.click();
  await expect
    .poll(async () => Number(await viewer.getAttribute('data-viewer-scale')))
    .toBeCloseTo(1, 2);
  const afterZoomOut = await measureAnchorOffsets();
  expect(Math.abs(afterZoomOut.x - before.x)).toBeLessThanOrEqual(
    afterZoomOut.viewportWidth * 0.05,
  );
  expect(Math.abs(afterZoomOut.y - before.y)).toBeLessThanOrEqual(
    afterZoomOut.regionHeight * 0.1,
  );
});

test('native scroll中はReact render・DOM差替え・compositor transformを発生させない', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/timeline/');
  await page
    .getByRole('group', { name: '表示する範囲' })
    .getByRole('button', { name: /すべて/ })
    .click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const stage = viewer.locator('[data-timeline-viewer-stage]');
  await page.waitForTimeout(180);
  const before = await viewer.evaluate((element) => ({
    renders: Number(element.getAttribute('data-viewer-render-count') ?? 0),
    nodes: element.querySelectorAll('[data-viewer-node]').length,
  }));
  await stage.evaluate((element) => {
    element.scrollLeft = Math.min(
      520,
      element.scrollWidth - element.clientWidth,
    );
    element.scrollTop = Math.min(
      240,
      element.scrollHeight - element.clientHeight,
    );
    element.dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(180);
  const after = await viewer.evaluate((element) => ({
    renders: Number(element.getAttribute('data-viewer-render-count') ?? 0),
    nodes: element.querySelectorAll('[data-viewer-node]').length,
    interacting: element.hasAttribute('data-viewer-interacting'),
    transformedNodes: Array.from(
      element.querySelectorAll<HTMLElement>('[data-viewer-node]'),
    ).some((node) => getComputedStyle(node).transform !== 'none'),
  }));
  expect(after.renders).toBe(before.renders);
  expect(after.nodes).toBe(before.nodes);
  expect(after.interacting).toBe(false);
  expect(after.transformedNodes).toBe(false);
});

test('iPhone幅の閲覧モードは2本指の中点を保ってピンチズームする', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/timeline/');
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).tap();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const stage = viewer.locator('[data-timeline-viewer-stage]');
  await stage.evaluate((element) => {
    const emit = (type: string, points: number[]) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'touches', {
        value: points.map((clientX) => ({ clientX, clientY: 380 })),
      });
      element.dispatchEvent(event);
    };
    emit('touchstart', [130, 250]);
    emit('touchmove', [90, 290]);
    emit('touchend', []);
  });
  await expect
    .poll(async () => Number((await viewer.getAttribute('data-viewer-scale')) ?? 0))
    .toBeGreaterThan(1);

  await page.setViewportSize({ width: 844, height: 390 });
  await expect(viewer).toBeVisible();
  await stage.press('0');
  await expect
    .poll(async () => Number((await viewer.getAttribute('data-viewer-scale')) ?? 0))
    .toBeGreaterThan(0);
});

test('閲覧モードは固定軸と一定寸法のノードでセマンティックズームする', async ({
  page,
}, testInfo) => {
  await page.goto('/timeline/');
  await modeButton(page, '近代').click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const stage = viewer.locator('[data-timeline-viewer-stage]');
  const timeAxis = viewer.locator('.timeline-viewer-time-axis');
  const regionAxis = viewer.locator('.timeline-viewer-region-axis');
  const origin = viewer.locator('.timeline-viewer-axis-origin');
  const firstNode = viewer.locator('[data-viewer-node]:visible').first();
  const fixedBefore = await Promise.all([
    timeAxis.boundingBox(),
    regionAxis.boundingBox(),
    origin.boundingBox(),
    firstNode.boundingBox(),
  ]);
  const axisLayering = await viewer.evaluate(() => {
    const time = document.querySelector<HTMLElement>(
      '.timeline-viewer-time-axis',
    )!;
    const region = document.querySelector<HTMLElement>(
      '.timeline-viewer-region-axis',
    )!;
    const corner = document.querySelector<HTMLElement>(
      '.timeline-viewer-axis-origin',
    )!;
    return {
      timeZ: Number(getComputedStyle(time).zIndex),
      regionZ: Number(getComputedStyle(region).zIndex),
      cornerZ: Number(getComputedStyle(corner).zIndex),
      cornerBackground: getComputedStyle(corner).backgroundColor,
    };
  });
  expect(
    Math.abs(
      (fixedBefore[1]?.y ?? 0) -
        ((fixedBefore[0]?.y ?? 0) + (fixedBefore[0]?.height ?? 0)),
    ),
  ).toBeLessThanOrEqual(1);
  expect(axisLayering.cornerZ).toBeGreaterThan(axisLayering.timeZ);
  expect(axisLayering.cornerZ).toBeGreaterThan(axisLayering.regionZ);
  expect(axisLayering.cornerBackground).not.toMatch(/,\s*0(?:\.\d+)?\)$/);

  for (let index = 0; index < 4; index += 1) {
    const beforeScale = Number(await viewer.getAttribute('data-viewer-scale'));
    await viewer.getByRole('button', { name: '拡大' }).click();
    await expect
      .poll(async () => Number((await viewer.getAttribute('data-viewer-scale')) ?? 0))
      .toBeGreaterThan(beforeScale);
  }

  const maximumScale = testInfo.project.name === 'mobile' ? 3 : 4;
  await expect
    .poll(async () => Number((await viewer.getAttribute('data-viewer-scale')) ?? 0))
    .toBeLessThanOrEqual(maximumScale);
  await expect(viewer).toHaveAttribute('data-semantic-level', /contextual|detailed/);

  const fixedAfter = await Promise.all([
    timeAxis.boundingBox(),
    regionAxis.boundingBox(),
    origin.boundingBox(),
    viewer.locator('[data-viewer-node]').first().evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
  ]);
  expect(fixedAfter[0]?.height).toBe(fixedBefore[0]?.height);
  expect(fixedAfter[1]?.width).toBe(fixedBefore[1]?.width);
  expect(fixedAfter[2]).toEqual(fixedBefore[2]);

  const nodeBox = fixedAfter[3];
  expect(nodeBox.height).toBeLessThanOrEqual(
    testInfo.project.name === 'mobile' ? 60 : 68,
  );
  expect(nodeBox.width).toBeLessThanOrEqual(
    testInfo.project.name === 'mobile' ? 190 : 240,
  );
  const detailedNode = viewer.locator('[data-viewer-node]').first();
  const detailedDate = detailedNode.locator('.timeline-viewer-node__date');
  await expect(detailedDate).toHaveCount(1);
  await expect(detailedDate).not.toHaveText('');
  await expect(
    detailedNode.locator(
      '.timeline-viewer-node__surface .timeline-viewer-node__date',
    ),
  ).toHaveCount(0);
  const captionHierarchy = await detailedNode.evaluate((element) => {
    const surface = element.querySelector<HTMLElement>(
      '.timeline-viewer-node__surface',
    );
    const date = element.querySelector<HTMLElement>(
      '.timeline-viewer-node__date',
    );
    const name =
      element.querySelector<HTMLElement>('.timeline-viewer-node__formal') ??
      element.querySelector<HTMLElement>('.timeline-viewer-node__name');
    if (!surface || !date || !name) return null;
    const surfaceRect = surface.getBoundingClientRect();
    const dateRect = date.getBoundingClientRect();
    return {
      dateBelowSurface: dateRect.top >= surfaceRect.bottom,
      dateSmaller:
        parseFloat(getComputedStyle(date).fontSize) <
        parseFloat(getComputedStyle(name).fontSize),
    };
  });
  expect(captionHierarchy).toEqual({
    dateBelowSurface: true,
    dateSmaller: true,
  });
  await expect(detailedNode.locator('[lang="en"]')).toHaveCount(0);
  expect(
    await detailedNode
      .locator('.timeline-viewer-node__formal')
      .evaluate((element) => getComputedStyle(element).display),
  ).not.toBe('none');
  await expect(viewer.locator('[data-viewer-relation]')).toHaveCount(0);
  await expect(viewer.locator('.timeline-viewer-selection')).toHaveCount(0);
  const nodeFontSize = await detailedNode
    .locator('.timeline-viewer-node__formal')
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(nodeFontSize).toBeGreaterThanOrEqual(14);
  expect(nodeFontSize).toBeLessThanOrEqual(16);
});

test('閲覧モードは156%、195%、305%で同一地域のラベルを自動段組みする', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/timeline/');
  await modeButton(page, '近代').click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const zoomIn = viewer.getByRole('button', { name: '拡大' });
  let maximumFranceTrackCount = 0;
  for (const expectedScale of [1.25, 1.563, 1.953, 2.441, 3.052]) {
    await zoomIn.click();
    await expect
      .poll(async () => Number((await viewer.getAttribute('data-viewer-scale')) ?? 0))
      .toBeCloseTo(expectedScale, 2);
    await viewer.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
    if ([1.563, 1.953, 3.052].includes(expectedScale)) {
      await expectViewerLabelsNotToOverlap(page);
    }
    const franceTracks = await viewer
      .locator('[data-viewer-node][data-region-id="france"]:visible')
      .evaluateAll((nodes) =>
        [...new Set(nodes.map((node) => (node as HTMLElement).dataset.viewerTrack))],
      );
    maximumFranceTrackCount = Math.max(
      maximumFranceTrackCount,
      franceTracks.length,
    );
  }

  expect(maximumFranceTrackCount).toBeGreaterThan(1);
});

test('PC 400%・iPhone高倍率でも象徴主義とフォーヴィスムの年代が期間線と重ならない', async ({
  page,
}, testInfo) => {
  await page.goto('/timeline/');
  await page
    .getByRole('group', { name: '表示する範囲' })
    .getByRole('button', { name: /充実/ })
    .click();
  await modeButton(page, '近代').click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const zoomIn = viewer.getByRole('button', { name: '拡大' });
  const targetScale = testInfo.project.name === 'mobile' ? 3 : 4;
  while (
    Number((await viewer.getAttribute('data-viewer-scale')) ?? 0) < targetScale
  ) {
    await zoomIn.click();
    await expect
      .poll(async () =>
        Number((await viewer.getAttribute('data-viewer-scale')) ?? 0),
      )
      .toBeGreaterThan(1);
  }
  await expect(viewer).toHaveAttribute(
    'data-viewer-scale',
    String(targetScale),
  );

  const appliedOffsets: number[] = [];
  for (const movementId of ['symbolism', 'fauvism']) {
    const node = viewer
      .locator(
        `[data-viewer-node][data-movement-id="${movementId}"][data-region-id="france"]:visible`,
      )
      .first();
    await expect(node).toBeVisible();
    const result = await node.evaluate((element) => {
      const date = element.querySelector<HTMLElement>('[data-viewer-date]');
      if (!date) throw new Error('date caption missing');
      const dateRect = date.getBoundingClientRect();
      const track = Number((element as HTMLElement).dataset.viewerTrack);
      const rails = [...document.querySelectorAll<HTMLElement>(
        '[data-viewer-period][data-region-id="france"]',
      )]
        .filter(
          (rail) =>
            Math.abs(Number(rail.dataset.viewerTrack) - track) <= 1,
        )
        .map((rail) => rail.getBoundingClientRect())
        .filter(
          (railRect) =>
            railRect.right > dateRect.left - 2 &&
            railRect.left < dateRect.right + 2,
        );
      const minimumGap = rails.reduce((closest, railRect) => {
        const verticalGap =
          railRect.bottom <= dateRect.top
            ? dateRect.top - railRect.bottom
            : dateRect.bottom <= railRect.top
              ? railRect.top - dateRect.bottom
              : -1;
        return Math.min(closest, verticalGap);
      }, Number.POSITIVE_INFINITY);
      return {
        minimumGap,
        offset: Number((element as HTMLElement).dataset.dateOffsetY ?? 0),
      };
    });

    expect(result.minimumGap).toBeGreaterThanOrEqual(3);
    expect(result.offset).toBeGreaterThanOrEqual(0);
    expect(result.offset).toBeLessThanOrEqual(12);
    appliedOffsets.push(result.offset);
  }
  expect(
    appliedOffsets.some((offset) => offset > 0),
    '衝突する年代だけに局所オフセットが適用される',
  ).toBe(true);
});

test('閲覧モードは実年代の期間線と固定寸法の名称ラベルを分離する', async ({
  page,
}) => {
  await page.goto('/timeline/');
  await modeButton(page, '中世').click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const node = viewer
    .locator(
      '[data-viewer-node][data-movement-id="early-christian-byzantine"]:visible',
    )
    .first();
  await expect(node).toBeVisible();
  const viewerKey = await node.getAttribute('data-viewer-key');
  expect(viewerKey).toBeTruthy();
  const period = viewer.locator(`[data-viewer-period="${viewerKey}"]`);
  await expect(period).toBeVisible();
  await expect(node).toHaveAttribute(
    'href',
    '/movements/early-christian-byzantine/',
  );
  const dimensions = await Promise.all([
    node.evaluate((element) => {
      const nodeRect = element.getBoundingClientRect();
      const surfaceRect = element
        .querySelector('.timeline-viewer-node__surface')!
        .getBoundingClientRect();
      const dateRect = element
        .querySelector('.timeline-viewer-node__date')!
        .getBoundingClientRect();
      return {
        x: nodeRect.x,
        y: nodeRect.y,
        width: nodeRect.width,
        height: nodeRect.height,
        surfaceHeight: surfaceRect.height,
        dateBelowSurface: dateRect.top >= surfaceRect.bottom,
        dateTop: dateRect.top,
      };
    }),
    period.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }),
  ]);
  expect(dimensions[0].surfaceHeight).toBeGreaterThanOrEqual(28);
  expect(dimensions[0].surfaceHeight).toBeLessThanOrEqual(32);
  expect(dimensions[0].dateBelowSurface).toBe(true);
  expect(dimensions[1].height).toBeLessThanOrEqual(2);
  expect(dimensions[1].width).not.toBe(dimensions[0].width);
  expect(Math.abs(dimensions[1].x - dimensions[0].x)).toBeLessThanOrEqual(1);
  expect(dimensions[1].y).toBeGreaterThanOrEqual(
    dimensions[0].y + dimensions[0].surfaceHeight,
  );
  expect(dimensions[1].y + dimensions[1].height).toBeLessThanOrEqual(
    dimensions[0].dateTop,
  );
  const periodConnector = await period.evaluate((element) =>
    getComputedStyle(element, '::before').content,
  );
  expect(periodConnector).toBe('none');
  await expect(viewer.locator('[data-viewer-relation]')).toHaveCount(0);
  await expect(viewer.locator('[data-movement-inspector]')).toHaveCount(0);
});

test('同一地域の近接・重複期間線を独立して見せる', async ({ page }) => {
  await page.goto('/timeline/');
  await page
    .getByRole('group', { name: '表示する範囲' })
    .getByRole('button', { name: /充実/ })
    .click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const periodFor = (movementId: string, regionId: string) =>
    viewer
      .locator(
        `[data-viewer-period][data-movement-id="${movementId}"][data-region-id="${regionId}"]`,
      )
      .first();
  const yamato = periodFor('yamato-e', 'japan');
  const rinpa = periodFor('rinpa', 'japan');
  const islamic = periodFor('islamic-art', 'spain');
  const baroque = periodFor('baroque', 'spain');
  for (const period of [yamato, rinpa, islamic, baroque]) {
    await expect(period).toBeVisible();
  }

  const touching = await Promise.all(
    [yamato, rinpa].map((period) =>
      period.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top };
      }),
    ),
  );
  const horizontalGap = Math.max(
    touching[1].left - touching[0].right,
    touching[0].left - touching[1].right,
  );
  const verticalGap = Math.abs(touching[1].top - touching[0].top);
  expect(
    horizontalGap >= 8 || verticalGap >= 4,
    '大和絵と琳派の期間線に視覚的な切れ目が必要',
  ).toBe(true);

  const overlapping = await Promise.all(
    [islamic, baroque].map((period) =>
      period.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top };
      }),
    ),
  );
  expect(
    overlapping[0].left < overlapping[1].right &&
      overlapping[0].right > overlapping[1].left,
  ).toBe(true);
  expect(Math.abs(overlapping[0].top - overlapping[1].top)).toBeGreaterThanOrEqual(
    4,
  );
});

test('終端gutterとタイトル優先の年代captionを維持する', async ({
  page,
}, testInfo) => {
  await page.goto('/timeline/');
  await modeButton(page, '現代').click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const board = viewer.locator('[data-viewer-board]');
  const endTick = viewer.locator('[data-axis-edge="end"]');
  await expect(endTick).toBeVisible();
  const endSpacing = await Promise.all([
    board.evaluate((element) => element.getBoundingClientRect().right),
    endTick.evaluate((element) => element.getBoundingClientRect().right),
  ]);
  expect(endSpacing[0] - endSpacing[1]).toBeGreaterThanOrEqual(
    testInfo.project.name === 'mobile' ? 140 : 170,
  );

  const node = viewer.locator('[data-viewer-node]:visible').first();
  const hierarchy = await node.evaluate((element) => {
    const surface = element.querySelector<HTMLElement>(
      '.timeline-viewer-node__surface',
    )!;
    const title = element.querySelector<HTMLElement>(
      '.timeline-viewer-node__short:not([style*="display: none"]), .timeline-viewer-node__name, .timeline-viewer-node__formal',
    )!;
    const date = element.querySelector<HTMLElement>(
      '.timeline-viewer-node__date',
    )!;
    const surfaceRect = surface.getBoundingClientRect();
    const dateRect = date.getBoundingClientRect();
    return {
      titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
      dateSize: Number.parseFloat(getComputedStyle(date).fontSize),
      dateWeight: Number.parseInt(getComputedStyle(date).fontWeight, 10),
      verticalGap: dateRect.top - surfaceRect.bottom,
    };
  });
  expect(hierarchy.dateSize).toBeLessThan(hierarchy.titleSize);
  expect(hierarchy.dateSize).toBeLessThanOrEqual(10);
  expect(hierarchy.dateWeight).toBeLessThanOrEqual(400);
  expect(hierarchy.verticalGap).toBeGreaterThanOrEqual(10);
});

test('閲覧モードのラベルは内容幅で、地域レーンと操作帯を軽量に保つ', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/timeline/');
  await modeButton(page, '近世').click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  await viewer.getByRole('button', { name: '拡大' }).click();
  await expect(viewer).toHaveAttribute('data-semantic-level', 'standard');

  const labelWidths = await viewer.evaluate(() => {
    const widthFor = (id: string) =>
      document
        .querySelector<HTMLElement>(
          `[data-timeline-viewer="active"] [data-movement-id="${id}"] .timeline-viewer-node__surface`,
        )
        ?.getBoundingClientRect().width ?? 0;
    return {
      baroque: widthFor('baroque'),
      neoclassicism: widthFor('neoclassicism'),
      renaissance: widthFor('italian-renaissance'),
    };
  });
  expect(labelWidths.baroque).toBeGreaterThanOrEqual(72);
  expect(labelWidths.baroque).toBeLessThanOrEqual(120);
  expect(labelWidths.neoclassicism).toBeGreaterThan(labelWidths.baroque);
  expect(labelWidths.renaissance).toBeGreaterThan(labelWidths.neoclassicism);
  expect(labelWidths.renaissance).toBeLessThanOrEqual(240);

  const oneTrackHeights = await viewer
    .locator('[data-viewer-region-id][data-viewer-track-count="1"]')
    .evaluateAll((labels) =>
      labels.map((label) =>
        Number((label as HTMLElement).dataset.viewerRegionHeight),
      ),
    );
  expect(oneTrackHeights.length).toBeGreaterThan(0);
  expect(Math.max(...oneTrackHeights)).toBeLessThanOrEqual(88);

  const controls = viewer.locator('[data-viewer-controls]');
  const closeControl = viewer.getByRole('button', {
    name: '閲覧モードを閉じる',
  });
  const [controlsBox, viewport] = await Promise.all([
    controls.boundingBox(),
    page.evaluate(() => ({ width: innerWidth, height: innerHeight })),
  ]);
  expect(controlsBox?.width).toBeLessThanOrEqual(320);
  expect(controlsBox?.height).toBeLessThanOrEqual(52);
  expect(
    Math.abs((controlsBox?.x ?? 0) + (controlsBox?.width ?? 0) / 2 - viewport.width / 2),
  ).toBeLessThanOrEqual(2);
  await expect(closeControl).toBeVisible();
  expect(
    await controls.evaluate((element) => getComputedStyle(element).position),
  ).toBe('fixed');
  expect(
    await controls.evaluate((element) => getComputedStyle(element).overflow),
  ).toBe('visible');
  const closeHitTarget = await closeControl.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hitTarget = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    return (
      hitTarget === element ||
      (hitTarget instanceof Node && element.contains(hitTarget))
    );
  });
  expect(closeHitTarget).toBe(true);

  await expect(viewer).toHaveAttribute('data-controls-idle', 'true', {
    timeout: 3200,
  });
  const idleOpacity = await controls.evaluate((element) =>
    parseFloat(getComputedStyle(element).opacity),
  );
  expect(idleOpacity).toBeGreaterThanOrEqual(0.68);
  expect(idleOpacity).toBeLessThanOrEqual(0.75);
  await viewer.getByRole('button', { name: '拡大' }).click();
  await expect(viewer).not.toHaveAttribute('data-controls-idle', 'true');
});

test('閲覧モードは年代位置を保ち、地域反復を静かに示す', async ({
  page,
}) => {
  await page.goto('/timeline/');
  await modeButton(page, '近代').click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  await viewer.locator('[data-timeline-viewer-stage]').press('0');
  const nodeLayer = viewer.locator('[data-viewer-node-layer]');
  const maskImage = await nodeLayer.evaluate(
    (element) =>
      getComputedStyle(element).maskImage ||
      getComputedStyle(element).webkitMaskImage,
  );
  expect(maskImage).toBe('none');

  const romanticism = viewer.locator(
    '[data-viewer-node][data-movement-id="romanticism"]:visible',
  );
  await expect(romanticism.first()).toBeVisible();
  expect(await romanticism.count()).toBeGreaterThan(1);
  await expect(
    viewer
      .locator(
        '[data-viewer-node][data-movement-id="romanticism"][data-secondary-occurrence="true"]:visible',
      )
      .first(),
  ).toBeVisible();
  const occurrenceStyles = await romanticism
    .locator('.timeline-viewer-node__surface')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return {
          opacity: style.opacity,
          color: style.color,
          background: style.backgroundColor,
          borderWidth: style.borderTopWidth,
        };
      }),
    );
  expect(
    occurrenceStyles.every(
      ({ opacity, color, background, borderWidth }) =>
        opacity === '1' &&
        color === occurrenceStyles[0].color &&
        background === occurrenceStyles[0].background &&
        borderWidth === occurrenceStyles[0].borderWidth,
    ),
  ).toBe(true);

  await romanticism.first().hover();
  await expect
    .poll(() =>
      romanticism.evaluateAll((elements) =>
        elements.every(
          (element) =>
            (element as HTMLElement).dataset.peerHighlighted === 'true',
        ),
      ),
    )
    .toBe(true);
  const romanticismPeriods = viewer.locator(
    '[data-viewer-period][data-movement-id="romanticism"]:visible',
  );
  await expect
    .poll(() =>
      romanticismPeriods.evaluateAll((elements) =>
        elements.every(
          (element) =>
            (element as HTMLElement).dataset.peerHighlighted === 'true',
        ),
      ),
    )
    .toBe(true);

  const chronologicalOffsets = await viewer
    .locator('[data-viewer-node][data-viewer-visible="true"]:visible')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const node = element as HTMLElement;
        return Math.abs(
          node.offsetLeft - Number(node.dataset.viewerStartX),
        );
      }),
  );
  expect(Math.max(...chronologicalOffsets)).toBeLessThanOrEqual(1);
});

test('展示ボードの年代階層と上下終端を明示する', async ({
  page,
}) => {
  await page.goto('/timeline/');
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const board = viewer.locator('[data-viewer-board]');
  await expect(board).toBeVisible();
  const boardStyle = await board.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      borderTop: parseFloat(style.borderTopWidth),
      borderBottom: parseFloat(style.borderBottomWidth),
    };
  });
  expect(boardStyle.borderTop).toBeGreaterThanOrEqual(2);
  expect(boardStyle.borderBottom).toBeGreaterThanOrEqual(2);

  await expect(
    viewer
      .locator(
        '[data-viewer-gridline][data-tick-strength="century"]:visible',
      )
      .first(),
  ).toBeVisible();
  await expect(
    viewer.locator('[data-viewer-region-id="origin"][data-origin-band="true"]'),
  ).toBeVisible();

  const priorityLabel = viewer
    .locator('[data-viewer-node][data-priority="true"]:visible')
    .first();
  const labelStyle = await priorityLabel
    .locator('.timeline-viewer-node__surface')
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        radius: parseFloat(style.borderRadius),
        weight: Number(
          getComputedStyle(
            element.querySelector('.timeline-viewer-node__name') ??
              element.querySelector('.timeline-viewer-node__short')!,
          ).fontWeight,
        ),
        underline: getComputedStyle(element, '::after').content,
      };
    });
  expect(labelStyle.height).toBeLessThanOrEqual(44);
  expect(labelStyle.radius).toBeGreaterThanOrEqual(4);
  expect(labelStyle.weight).toBeGreaterThanOrEqual(600);
  expect(labelStyle.underline).toBe('none');

  const nativeViewport = viewer.locator('[data-native-scroll-viewport]');
  await expect(nativeViewport).toBeVisible();
  const scrollExtent = await nativeViewport.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(scrollExtent.scrollHeight).toBeGreaterThanOrEqual(
    scrollExtent.clientHeight,
  );
});

test('展示年表型タイムラインの比較スクリーンショットを保存する', async ({
  page,
}, testInfo) => {
  await page.goto('/timeline/');
  await modeButton(page, '近世').click();
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  await expect(
    viewer.locator('[data-axis-label-visible="true"]').first(),
  ).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({
      path: 'docs/screenshots/timeline-viewer-exhibition-board-iphone-100.png',
      fullPage: false,
    });
    return;
  }

  const zoomIn = viewer.getByRole('button', { name: '拡大' });
  await zoomIn.click();
  await zoomIn.click();
  await expect
    .poll(async () => Number(await viewer.getAttribute('data-viewer-scale')))
    .toBeCloseTo(1.56, 2);
  await page.screenshot({
    path: 'docs/screenshots/timeline-viewer-exhibition-board-desktop-156.png',
    fullPage: false,
  });

  await page.evaluate(() => {
    localStorage.setItem('aha-theme', 'dark');
    document.documentElement.dataset.theme = 'dark';
  });
  await zoomIn.click();
  await zoomIn.click();
  await expect
    .poll(async () => Number(await viewer.getAttribute('data-viewer-scale')))
    .toBeCloseTo(2.44, 2);
  await page.screenshot({
    path: 'docs/screenshots/timeline-viewer-exhibition-board-dark-desktop-244.png',
    fullPage: false,
  });
});

test('閲覧モードにaxeの重大なアクセシビリティ違反がない', async ({ page }) => {
  await page.goto('/timeline/');
  await page.getByRole('button', { name: 'タイムラインを全画面で表示' }).click();
  const results = await new AxeBuilder({ page })
    .include('[data-timeline-viewer="active"]')
    .analyze();
  expect(
    results.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact ?? ''),
    ),
  ).toEqual([]);
});
