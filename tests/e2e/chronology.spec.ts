import { test, expect } from '@playwright/test';

test('初期表示は時代ヒーローだけを示し、選択した展示を展開する', async ({
  page,
}, testInfo) => {
  await page.goto('/chronology/');

  const renaissance = page.locator('#era-renaissance');
  const hero = renaissance.getByRole('button');
  const firstHero = page.locator('.chronology-era__hero').first();
  const lastEra = page.locator('.chronology-era').last();
  const viewport = page.viewportSize();

  await expect(page.locator('.chronology-era')).toHaveCount(8);
  await expect(hero).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-chronology-movement]')).toHaveCount(0);
  await expect(hero).not.toContainText('人間と世界を、観察と比例から捉え直した時代');
  await expect(hero).toContainText('1400〜1600年頃');
  await expect(hero).toContainText(/\d+件/);

  const closedHeight = (await firstHero.boundingBox())?.height ?? 0;
  if (testInfo.project.name === 'mobile') {
    expect(closedHeight).toBeGreaterThanOrEqual(60);
    expect(closedHeight).toBeLessThanOrEqual(76);
  } else {
    expect(closedHeight).toBeGreaterThanOrEqual(72);
    expect(closedHeight).toBeLessThanOrEqual(88);
  }

  const lastEraBox = await lastEra.boundingBox();
  expect(lastEraBox && viewport).toBeTruthy();
  expect((lastEraBox?.y ?? 0) + (lastEraBox?.height ?? 0)).toBeLessThanOrEqual(
    (viewport?.height ?? 0) * 1.5,
  );

  await page.screenshot({
    path:
      testInfo.project.name === 'mobile'
        ? 'docs/screenshots/chronology-compact-closed-iphone.png'
        : 'docs/screenshots/chronology-compact-closed-desktop.png',
    fullPage: false,
  });

  await hero.click();

  await expect(hero).toHaveAttribute('aria-expanded', 'true');
  await expect(hero).toContainText('人間と世界を、観察と比例から捉え直した時代');
  await expect(
    renaissance.locator('[data-chronology-movement="italian-renaissance"]'),
  ).toBeVisible();
  await expect(
    renaissance.locator('[data-chronology-event="printing-press"]'),
  ).toBeVisible();

  if (testInfo.project.name === 'desktop') {
    await expect
      .poll(async () => (await renaissance.boundingBox())?.y ?? 999)
      .toBeLessThan(170);
    await page.screenshot({
      path: 'docs/screenshots/chronology-compact-expanded-desktop.png',
      fullPage: false,
    });
  }
});

test('時代は一つだけ展開し、別の時代を開くと前の展示を閉じる', async ({
  page,
}) => {
  await page.goto('/chronology/');

  const renaissance = page.locator('#era-renaissance').getByRole('button');
  const modern = page.locator('#era-modern').getByRole('button');

  await renaissance.click();
  await expect(renaissance).toHaveAttribute('aria-expanded', 'true');

  await modern.click();
  await expect(modern).toHaveAttribute('aria-expanded', 'true');
  await expect(renaissance).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-era-panel]')).toHaveCount(1);
});

test('展開したムーブメントに作品、原因、タグ、関係、次読を表示する', async ({
  page,
}) => {
  await page.goto('/chronology/?lod=core');
  const renaissance = page.locator('#era-renaissance');
  await renaissance.getByRole('button').click();

  const italian = renaissance.locator(
    '[data-chronology-movement="italian-renaissance"]',
  );
  await expect(italian.getByRole('link', { name: /モナ・リザ/ })).toBeVisible();
  await expect(italian.getByText('なぜ生まれたか')).toBeVisible();
  await expect(italian.getByRole('list', { name: /要点/ })).toContainText('地域');
  await expect(italian.getByRole('list', { name: /要点/ })).toContainText('作品');
  await expect(italian.getByRole('link', { name: /次に読む/ })).toBeVisible();
  await expect(
    renaissance.locator('[data-chronology-relationship]').first(),
  ).toBeVisible();
});

test('歴史イベントから影響先へ移動できる', async ({ page }) => {
  await page.goto('/chronology/');
  const modern = page.locator('#era-modern');
  await modern.getByRole('button').click();

  const war = modern.locator('[data-chronology-event="world-war-one"]');
  await expect(war).toContainText('美術への作用');
  await expect(war.getByRole('link', { name: /ダダ/ })).toBeVisible();
  await expect(war.getByRole('link', { name: /シュルレアリスム/ })).toBeVisible();
});

test('時代ナビゲーションは展示を開き、キーボードでも閉じられる', async ({
  page,
}) => {
  await page.goto('/chronology/');
  await page.getByRole('navigation', { name: '時代ナビゲーション' }).getByRole(
    'link',
    { name: '19世紀', exact: true },
  ).click();

  const hero = page.locator('#era-nineteenth').getByRole('button');
  await expect(hero).toHaveAttribute('aria-expanded', 'true');
  await hero.focus();
  await page.keyboard.press('Enter');
  await expect(hero).toHaveAttribute('aria-expanded', 'false');
});

test('iPhone幅で横にはみ出さず、タップ領域を確保する', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/chronology/');
  const hero = page.locator('#era-nineteenth').getByRole('button');

  expect((await hero.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await hero.click();

  const hasPageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasPageOverflow).toBe(false);

  const nextLink = page
    .locator('#era-nineteenth [data-chronology-movement]')
    .first()
    .getByRole('link', { name: /次に読む/ });
  expect((await nextLink.boundingBox())?.height).toBeGreaterThanOrEqual(44);

  await page.screenshot({
    path: 'docs/screenshots/chronology-compact-expanded-iphone.png',
    fullPage: false,
  });
});

test('ダークモードでも時代と展示の階層を維持する', async ({
  page,
}, testInfo) => {
  await page.goto('/chronology/');
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
  });
  const medieval = page.locator('#era-medieval');
  await medieval.getByRole('button').click();

  await expect(medieval).toHaveAttribute('data-era-expanded', 'true');
  const pageColor = await page.locator('html').evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(pageColor).toBe('rgb(22, 22, 24)');

  if (testInfo.project.name === 'desktop') {
    await expect
      .poll(async () => (await medieval.boundingBox())?.y ?? 999)
      .toBeLessThan(170);
    await page.screenshot({
      path: 'docs/screenshots/chronology-compact-dark-desktop.png',
      fullPage: false,
    });
  }
});
