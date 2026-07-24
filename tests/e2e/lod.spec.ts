import { test, expect } from '@playwright/test';

test('主要・標準・詳細をURLへ反映し、リロード後も維持する', async ({ page }) => {
  await page.goto('/matrix/');
  await expect(page.getByRole('button', { name: /主要\s*24/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.getByRole('button', { name: /詳細\s*30/ }).click();
  await expect(page).toHaveURL(/lod=detailed/);
  await page.reload();
  await expect(page.getByRole('button', { name: /詳細\s*30/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
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

test('検索はLOD外の項目を見つけ、標準表示へ切り替えられる', async ({ page }) => {
  await page.goto('/movements/?lod=core');
  await page.getByRole('searchbox').fill('未来派');

  await expect(page.getByText('現在の表示密度では非表示')).toBeVisible();
  await page.getByRole('button', { name: '標準で表示' }).click();
  await expect(page).toHaveURL(/lod=standard/);
  await expect(page.getByText('現在の表示密度では非表示')).toHaveCount(0);
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

test('スマホの通史coreで代表項目からグループ内訳を展開する', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/timeline/?lod=core');

  const cubism = page.locator('[data-timeline-bar="cubism"]').first();
  await cubism.tap();
  await expect(page.locator('[data-movement-inspector]')).toContainText('キュビスム');
  await page.locator('[data-timeline-expand="cubism"]').click();
  await expect(page.locator('[data-timeline-bar="futurism"]').first()).toBeVisible();
  await expect(page.locator('[data-timeline-bar="futurism"]').first()).toHaveAttribute(
    'data-hierarchy-level',
    'child',
  );
});

test('ネットワークはLOD外ノードをDOMへ描画しない', async ({ page }, testInfo) => {
  await page.goto('/network/?lod=core');
  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await expect(graph).toHaveAttribute('data-network-lod', 'core');
  await expect(graph.getByRole('button', { name: '未来派を選択' })).toHaveCount(0);

  await page.getByRole('button', { name: /標準\s*30/ }).click();
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'すべて表示' }).click();
  }
  await expect(graph.getByRole('button', { name: '未来派を選択' })).toBeVisible();
});
