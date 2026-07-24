import { test, expect } from '@playwright/test';

test('ホームからムーブメント詳細へ移動できる', async ({ page }) => {
  await page.goto('/');
  const title = page.getByRole('heading', {
    level: 1,
    name: 'Art History Atlas',
  });
  await expect(title).toHaveText('ART HISTORY ATLAS');
  // 主要な転換点のカードから印象派へ
  await page.getByRole('link', { name: /印象派/ }).first().click();
  await expect(page).toHaveURL(/\/movements\/impressionism\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('印象派');
  // 詳細ページに指定項目（出典）が表示される
  await expect(page.getByRole('heading', { name: '出典', exact: true })).toBeVisible();
});

test('検索から作品を表示できる', async ({ page }) => {
  await page.goto('/movements/');
  await page.getByLabel(/検索/).fill('ウォーホル');
  // ウォーホルの関連ムーブメント（ポップアート）が残る
  const popCard = page.getByRole('link', { name: /ポップアート/ }).first();
  await expect(popCard).toBeVisible();
  await popCard.click();
  await expect(page).toHaveURL(/\/movements\/pop-art\/?$/);
  // 代表作品からキャンベルのスープ缶へ
  await page.getByRole('link', { name: /キャンベルのスープ缶/ }).first().click();
  await expect(page).toHaveURL(/\/works\/work-campbells-soup\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('キャンベルのスープ缶');
});

test('2件のムーブメントを比較できる', async ({ page }) => {
  await page.goto('/compare/?ids=gothic,italian-renaissance');
  await expect(page.getByRole('columnheader', { name: /ゴシック美術/ })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: /イタリア・ルネサンス/ })).toBeVisible();
  // 比較項目の行が存在する
  await expect(page.getByRole('rowheader', { name: '思想' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: '後世への影響' })).toBeVisible();
});

test('地域フィルタ（日本）を適用できる', async ({ page }) => {
  await page.goto('/movements/');
  await page.getByLabel('地域', { exact: true }).selectOption('japan');
  await expect(page.getByRole('link', { name: /もの派/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /具体美術協会/ })).toBeVisible();
  // 日本以外（バロック）は表示されない
  await expect(page.getByRole('link', { name: /^バロック/ })).toHaveCount(0);
});

test('横型タイムラインのテキスト代替が利用できる', async ({ page }) => {
  await page.goto('/timeline/');
  await page.getByText(/通史をテキスト形式で表示/).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('cell', { name: /印象派/ }).first()).toBeVisible();
});

test('横型タイムラインを時代別に切り替え、対象年代だけを表示できる', async ({ page }, testInfo) => {
  await page.goto('/timeline/');

  await expect(page.getByRole('button', { name: '通史', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(page.getByRole('region', { name: '現在の表示範囲' })).toContainText('通史');
  await expect(page.getByText('先史の造形')).toBeVisible();
  await expect(page.getByText('古代の規範')).toBeVisible();
  const surveyWidth = await page
    .getByRole('group', { name: /通史の横型タイムライン/ })
    .locator('[data-timeline-track]')
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(surveyWidth).toBeLessThanOrEqual(1200);

  await page.getByRole('button', { name: '近代', exact: true }).click();
  await expect(page.getByRole('button', { name: '近代', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(page.getByRole('region', { name: '現在の表示範囲' })).toContainText(
    '1700〜2000',
  );
  await expect(page.locator('[data-timeline-bar="impressionism"]').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /スーパーフラット/ })).toHaveCount(0);
  const modernWidth = await page
    .getByRole('group', { name: /近代の横型タイムライン/ })
    .locator('[data-timeline-track]')
    .evaluate((element) => element.getBoundingClientRect().width);
  if (testInfo.project.name === 'mobile') {
    expect(modernWidth).toBeGreaterThanOrEqual(1000);
    expect(modernWidth).toBeLessThanOrEqual(1100);
  } else {
    expect(modernWidth).toBeGreaterThanOrEqual(1800);
    expect(modernWidth).toBeGreaterThan(surveyWidth + 500);
    expect(modernWidth).toBeLessThanOrEqual(2400);
  }

  await page.getByRole('group', { name: '表示モード' }).getByRole('button', { name: '現代' }).click();
  await expect(page.getByRole('group', { name: '表示モード' }).getByRole('button', { name: '現代' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(page.getByRole('link', { name: /スーパーフラット/ }).first()).toBeVisible();
});

test('PWA: manifestとService Workerが提供される', async ({ page, request }) => {
  await page.goto('/');
  // manifestがリンクされている
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toContain('manifest.webmanifest');
  // manifestとsw.jsが取得できる
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  const manifestJson = await manifest.json();
  expect(manifestJson.name).toBe('Art History Atlas');
  expect(manifestJson.short_name).toBe('Art History Atlas');
  expect(manifestJson.display).toBe('standalone');
  expect(manifestJson.icons.length).toBeGreaterThanOrEqual(2);
  const sw = await request.get('/sw.js');
  expect(sw.ok()).toBeTruthy();
  expect(await sw.text()).toContain("const VERSION = 'v3'");

  const offline = await request.get('/offline.html');
  expect(offline.ok()).toBeTruthy();
  expect(await offline.text()).toContain('<title>オフライン | Art History Atlas</title>');
});

test('404ページも正式名称のtitle templateと読み上げ名を使う', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('404 | Art History Atlas');
    await expect(page.locator('#main').getByLabel('Art History Atlas')).toBeVisible();
  const retiredJapaneseName = ['美術史', 'アトラス'].join('');
  await expect(page.locator('body')).not.toContainText(retiredJapaneseName);
});
