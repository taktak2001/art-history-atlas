import { test, expect } from '@playwright/test';

test('Aboutの凡例も基本・充実・すべてへ統一する', async ({ page }) => {
  await page.goto('/about/');

  const legend = page.getByRole('definition').filter({
    has: page.getByText('美術史の骨格となる主要項目を表示', { exact: true }),
  });
  await expect(page.getByRole('heading', { name: '表示する範囲' })).toBeVisible();
  await expect(page.getByText('基本', { exact: true })).toBeVisible();
  await expect(page.getByText('充実', { exact: true })).toBeVisible();
  await expect(page.getByText('すべて', { exact: true })).toBeVisible();
  await expect(legend).toBeVisible();
});

test('基本・充実・すべてをURLへ反映し、リロード後も維持する', async ({ page }) => {
  await page.goto('/matrix/');
  await expect(page.getByRole('button', { name: /基本\s*24/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('美術史の骨格となる主要項目を表示')).toBeVisible();

  await page.getByRole('button', { name: /すべて\s*30/ }).click();
  await expect(page).toHaveURL(/lod=detailed/);
  await page.reload();
  await expect(page.getByRole('button', { name: /すべて\s*30/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('収録済みの全項目を表示')).toBeVisible();
  await expect(page.locator('[data-matrix-lod]')).toHaveAttribute(
    'data-matrix-lod',
    'detailed',
  );
});

test('タイムラインは通史core、時代別standardを目的別初期値にする', async ({ page }) => {
  await page.goto('/timeline/');
  await expect(page.locator('[data-timeline-track]')).toHaveAttribute(
    'data-timeline-lod',
    'core',
  );

  await page.getByRole('group', { name: '表示モード' }).getByRole('button', {
    name: '近代',
    exact: true,
  }).click();
  await expect(page).toHaveURL(/lod=standard/);
  await expect(page.locator('[data-timeline-track]')).toHaveAttribute(
    'data-timeline-lod',
    'standard',
  );
  await expect(page.locator('[data-timeline-bar="symbolism"]').first()).toBeVisible();
});

test('検索はLOD外の項目を見つけ、充実表示へ切り替えられる', async ({ page }) => {
  await page.goto('/movements/?lod=core');
  await page.getByRole('searchbox').fill('未来派');

  await expect(page.getByText('現在の表示範囲では非表示')).toBeVisible();
  await page.getByRole('button', { name: '充実で表示' }).click();
  await expect(page).toHaveURL(/lod=standard/);
  await expect(page.getByText('現在の表示範囲では非表示')).toHaveCount(0);
});

test('マトリクスはセル内件数を制限し、+Nでそのセルだけ展開する', async ({ page }) => {
  await page.goto('/matrix/?lod=core');
  const cell = page.locator('[data-matrix-cell="france:nineteenth"]');
  const expandButton = cell.getByRole('button', { name: /\+2/ });
  await expect(expandButton).toBeVisible();
  await expandButton.evaluate((button) => button.click());
  await expect(cell.getByText('ポスト印象派')).toBeVisible();
  await expect(cell.getByRole('button', { name: /折りたたむ/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});

test('一覧は階層表示でグループ文脈を示す', async ({ page }) => {
  await page.goto('/movements/?lod=core');
  await page.getByRole('button', { name: '階層' }).click();
  await expect(page.locator('[data-movement-view="hierarchy"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: '印象派周辺' })).toBeVisible();
});

test('PCの通史coreは一時インスペクタを出さず代表項目から詳細へ移動する', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/timeline/?lod=core');

  const cubism = page.locator('[data-timeline-bar="cubism"]').first();
  await cubism.hover();
  await expect(cubism).toHaveAttribute('title', /キュビスム/);
  await expect(cubism).toHaveAttribute('href', '/movements/cubism/');
  await expect(page.locator('[data-movement-inspector]')).toHaveCount(0);
});

test('ネットワークはLOD外ノードをDOMへ描画しない', async ({ page }, testInfo) => {
  await page.goto('/network/?lod=core');
  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await expect(graph).toHaveAttribute('data-network-lod', 'core');
  await expect(graph.getByRole('button', { name: '未来派を選択' })).toHaveCount(0);

  await page.getByRole('button', { name: /充実\s*30/ }).click();
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'すべて表示' }).click();
  }
  await expect(graph.getByRole('button', { name: '未来派を選択' })).toBeVisible();
});
