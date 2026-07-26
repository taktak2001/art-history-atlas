import { test, expect } from '@playwright/test';

test('ホームのファーストビューに3つの探索導線を表示する', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-home-hero]');
  await expect(page).toHaveTitle('Art History Atlas');
  const title = page.getByRole('heading', {
    level: 1,
    name: 'Art History Atlas',
  });
  await expect(title).toHaveText('ART HISTORY ATLAS');
  await expect(page.getByText('発生・継承・転換から読む美術史。')).toBeVisible();

  const navigation = page.getByRole('navigation', { name: '主要な探索方法' });
  await expect(navigation.getByRole('link', { name: /Timeline.*年代と地域の重なりを見る/ })).toHaveAttribute(
    'href',
    '/timeline/',
  );
  await expect(navigation.getByRole('link', { name: /Chronology.*時代の流れを展示形式で読む/ })).toHaveAttribute(
    'href',
    '/chronology/',
  );
  await expect(navigation.getByRole('link', { name: /Relationship Network.*継承・反発・影響を辿る/ })).toHaveAttribute(
    'href',
    '/network/',
  );
  await expect(page.getByText('美術史とは、様式名を暗記するものではない。')).toHaveCount(0);

  const geometry = await hero.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const title = element.querySelector<HTMLElement>('.home-hero__title');
    const tagline = element.querySelector<HTMLElement>('.home-hero__tagline');
    const actions = element.querySelector<HTMLElement>('.home-hero__actions');
    const firstAction = element.querySelector<HTMLElement>('.home-hero__cta');
    const firstActionTitle = firstAction?.querySelector<HTMLElement>(
      '.home-hero__cta-title',
    );
    const firstActionDescription = firstAction?.querySelector<HTMLElement>(
      '.home-hero__cta-description',
    );
    const taglineStyles = tagline ? getComputedStyle(tagline) : null;
    return {
      bottom: rect.bottom,
      height: rect.height,
      width: rect.width,
      viewportHeight: window.innerHeight,
      taglineHeight: tagline?.getBoundingClientRect().height ?? 0,
      taglineLineHeight: taglineStyles ? Number.parseFloat(taglineStyles.lineHeight) : 0,
      titleToTagline:
        (tagline?.getBoundingClientRect().top ?? 0) -
        (title?.getBoundingClientRect().bottom ?? 0),
      taglineToActions:
        (actions?.getBoundingClientRect().top ?? 0) -
        (tagline?.getBoundingClientRect().bottom ?? 0),
      actionTitleToDescription:
        (firstActionDescription?.getBoundingClientRect().top ?? 0) -
        (firstActionTitle?.getBoundingClientRect().bottom ?? 0),
    };
  });
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);
  expect(geometry.height).toBeGreaterThanOrEqual(280);
  expect(geometry.height).toBeLessThanOrEqual(geometry.width < 640 ? 390 : 360);
  expect(geometry.taglineHeight).toBeLessThanOrEqual(geometry.taglineLineHeight * 2 + 1);
  expect(geometry.titleToTagline).toBeGreaterThanOrEqual(11);
  expect(geometry.taglineToActions).toBeGreaterThanOrEqual(23);
  expect(geometry.actionTitleToDescription).toBeGreaterThanOrEqual(5);

  const titleTypography = await title.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(styles.fontSize),
      letterSpacing: Number.parseFloat(styles.letterSpacing),
      hasHorizontalOverflow: element.scrollWidth > element.clientWidth + 1,
    };
  });
  if ((page.viewportSize()?.width ?? 1280) < 640) {
    expect(titleTypography.fontSize).toBeGreaterThanOrEqual(30);
    expect(titleTypography.fontSize).toBeLessThanOrEqual(32);
  } else {
    expect(titleTypography.fontSize).toBeGreaterThanOrEqual(40);
    expect(titleTypography.fontSize).toBeLessThanOrEqual(56);
  }
  expect(titleTypography.letterSpacing).toBeGreaterThan(0);
  expect(titleTypography.hasHorizontalOverflow).toBe(false);

  const nextSectionTop = await page.getByRole('heading', { level: 2, name: 'Explore by Era' }).evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  expect(nextSectionTop).toBeLessThan(geometry.viewportHeight);

  for (const link of await navigation.getByRole('link').all()) {
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('iPad幅でもHeroの次にコンテンツが見え、横にはみ出さない', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '固定iPadビューポートはdesktop projectで検証する');
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto('/');

  const layout = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>('[data-home-hero]');
    const nextHeading = Array.from(document.querySelectorAll('h2')).find(
      (heading) => heading.textContent === 'Explore by Era',
    );
    return {
      heroBottom: hero?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY,
      nextHeadingTop: nextHeading?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
      viewportHeight: window.innerHeight,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(layout.heroBottom).toBeLessThan(layout.viewportHeight * 0.45);
  expect(layout.nextHeadingTop).toBeLessThan(layout.viewportHeight);
  expect(layout.hasHorizontalOverflow).toBe(false);
});

test('ホームのセクション見出しは英語と短い日本語説明で対になる', async ({ page }) => {
  await page.goto('/');

  const sections = [
    ['Explore by Era', '時代ごとの価値基準から読む'],
    ['Turning Points', '視点・空間・制度の前提が変わった局面'],
    ['Reactions & Breaks', '前時代への応答と反発を辿る'],
    ['Across Regions', '同時代の地域差を比較する'],
    ['Comparisons', '2つのムーブメントを並べて読む'],
    ['Latest Additions', '最近追加したムーブメント'],
    ['Sources & Methodology', '出典・編集方針・分類基準'],
  ];

  for (const [heading, description] of sections) {
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
    expect(description.length).toBeLessThanOrEqual(40);
  }
});

test('ヘッダーは英字3行ロゴと均衡した操作領域を持つ', async ({ page }) => {
  await page.goto('/');

  const wordmark = page
    .getByRole('banner')
    .getByRole('link', { name: 'Art History Atlas', exact: true });
  await expect(wordmark).toBeVisible();
  await expect(wordmark.locator('.site-wordmark__line')).toHaveCount(3);
  await expect(wordmark.locator('.site-wordmark__line').nth(0)).toHaveText('ART');
  await expect(wordmark.locator('.site-wordmark__line').nth(1)).toHaveText('HISTORY');
  await expect(wordmark.locator('.site-wordmark__line').nth(2)).toHaveText('ATLAS');

  const controls = [
    page.getByRole('button', { name: /テーマ|モード/ }),
    page.getByRole('button', { name: /メニュー/ }),
  ];
  for (const control of controls) {
    if (await control.isVisible()) {
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('正式名称をmetadata・読み上げ・構造化データで統一する', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('meta[name="application-name"]')).toHaveAttribute(
    'content',
    'Art History Atlas',
  );
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
    'content',
    'Art History Atlas',
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Art History Atlas',
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    'content',
    'Art History Atlas',
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    'content',
    'Art History Atlas',
  );

  const structuredData = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
  );
  expect(structuredData.name).toBe('Art History Atlas');
  expect(structuredData.alternateName).toBe('ART HISTORY ATLAS');

  await expect(
    page.locator('footer').getByRole('link', { name: 'Art History Atlas', exact: true }),
  ).toContainText('ART HISTORY ATLAS');
  const retiredJapaneseName = ['美術史', 'アトラス'].join('');
  await expect(page.locator('body')).not.toContainText(retiredJapaneseName);

  await page.goto('/network/');
  await expect(page).toHaveTitle('関係ネットワーク | Art History Atlas');
});
