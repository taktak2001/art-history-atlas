import { test, expect } from '@playwright/test';

test('ホームのファーストビューに4つの探索導線を表示する', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-home-hero]');
  await expect(page).toHaveTitle('Art History Atlas');
  const title = page.getByRole('heading', {
    level: 1,
    name: 'Art History Atlas',
  });
  await expect(title).toHaveText('ART HISTORY ATLAS');
  // キャッチコピーはDOMごと削除している
  await expect(page.getByText('発生・継承・転換から読む美術史。')).toHaveCount(0);
  await expect(page.locator('.home-hero__tagline')).toHaveCount(0);

  const navigation = page.getByRole('navigation', { name: '主要な探索方法' });
  // Movements を先頭に置く
  await expect(navigation.getByRole('link').first()).toHaveAttribute(
    'href',
    '/movements/',
  );
  await expect(navigation.getByRole('link', { name: /Movements.*名前・時代・地域から探す/ })).toHaveAttribute(
    'href',
    '/movements/',
  );
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
    const actions = element.querySelector<HTMLElement>('.home-hero__actions');
    const firstAction = element.querySelector<HTMLElement>('.home-hero__cta');
    const firstActionTitle = firstAction?.querySelector<HTMLElement>(
      '.home-hero__cta-title',
    );
    const firstActionDescription = firstAction?.querySelector<HTMLElement>(
      '.home-hero__cta-description',
    );
    return {
      bottom: rect.bottom,
      height: rect.height,
      width: rect.width,
      viewportHeight: window.innerHeight,
      // 大見出し直下から区切り線（actionsの上辺）までの余白
      titleToActions:
        (actions?.getBoundingClientRect().top ?? 0) -
        (title?.getBoundingClientRect().bottom ?? 0),
      actionTitleToDescription:
        (firstActionDescription?.getBoundingClientRect().top ?? 0) -
        (firstActionTitle?.getBoundingClientRect().bottom ?? 0),
    };
  });
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);
  expect(geometry.height).toBeGreaterThanOrEqual(230);
  expect(geometry.height).toBeLessThanOrEqual(geometry.width < 640 ? 430 : 360);
  // キャッチコピー削除後も、詰まりすぎず空きすぎない余白を保つ
  expect(geometry.titleToActions).toBeGreaterThanOrEqual(28);
  expect(geometry.titleToActions).toBeLessThanOrEqual(44);
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

test('Explore by Era は2列を保ったまま01〜08の章番号で読む順番を示す', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 390, height: 844 });

  const grid = page.locator('.home-era-index');
  await expect(grid).toHaveCount(8);

  // DOM順＝時系列順（01→02→03…）で、番号は視覚のみ（aria-hidden）
  const indices = await grid.allTextContents();
  expect(indices).toEqual(['01', '02', '03', '04', '05', '06', '07', '08']);
  await expect(grid.first()).toHaveAttribute('aria-hidden', 'true');

  // 2列グリッドを維持し、01→02 / 03→04 の順に読める配置になっている
  const layout = await page.evaluate(() => {
    const cells = Array.from(
      document.querySelectorAll<HTMLElement>('.home-era-index'),
    ).map((el) => {
      const card = el.closest('a') as HTMLElement;
      const r = card.getBoundingClientRect();
      return { text: el.textContent?.trim() ?? '', top: Math.round(r.top), left: Math.round(r.left), height: Math.round(r.height) };
    });
    return {
      cells,
      columns: new Set(cells.map((c) => c.left)).size,
    };
  });
  expect(layout.columns).toBe(2);
  // 01と02は同じ行、03は次の行
  expect(layout.cells[0].top).toBe(layout.cells[1].top);
  expect(layout.cells[2].top).toBeGreaterThan(layout.cells[0].top);
  expect(layout.cells[0].left).toBeLessThan(layout.cells[1].left);

  // リンク名だけで遷移先が分かる
  await expect(
    page.getByRole('link', { name: /先史・古代、\d+件を見る/ }),
  ).toBeVisible();
});
