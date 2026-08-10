import { test, expect } from '@playwright/test';

test('主要4画面で図録型LODと基本・充実・すべてを共通表示する', async ({
  page,
}) => {
  // ムーブメント一覧はLODを持たない（常に全件が対象）
  for (const route of ['/timeline/', '/chronology/', '/network/', '/matrix/']) {
    await page.goto(route);
    const control = page.locator('[data-lod-control]');
    await expect(control).toHaveClass(/lod-control--catalogue/);
    await expect(
      control.getByText('LEVEL OF DETAIL', { exact: true }),
    ).toBeVisible();
    await expect(control.getByRole('button', { name: /基本\s*32/ })).toBeVisible();
    await expect(control.getByRole('button', { name: /充実\s*48/ })).toBeVisible();
    await expect(
      control.getByRole('button', { name: /すべて\s*54/ }),
    ).toBeVisible();
  }
});

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
  await expect(page.getByRole('button', { name: /基本\s*32/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('美術史の骨格となる主要項目を表示')).toHaveClass(
    /sr-only/,
  );

  await page.getByRole('button', { name: /すべて\s*54/ }).click();
  await expect(page).toHaveURL(/lod=detailed/);
  await page.reload();
  await expect(page.getByRole('button', { name: /すべて\s*54/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('収録済みの全項目を表示')).toHaveClass(/sr-only/);
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

test('ムーブメント一覧はLODを持たず、常に全件から検索する', async ({ page }) => {
  // 旧 ?lod= が残っていても無視して全件表示にフォールバックする
  await page.goto('/movements/?lod=core');

  await expect(page.getByText('LEVEL OF DETAIL')).toHaveCount(0);
  await expect(page.getByText('54件のムーブメント')).toBeVisible();

  await page.getByRole('searchbox').fill('未来派');
  await expect(page.getByText('現在の表示範囲では非表示')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /未来派/ }).first()).toBeVisible();
});

test('マトリクスはセル内件数を制限し、+Nでそのセルだけ展開する', async ({ page }) => {
  await page.goto('/matrix/?lod=core');
  const cell = page.locator('[data-matrix-cell="france:nineteenth"]');
  const expandButton = cell.getByRole('button', { name: /ほか2件/ });
  await expect(expandButton).toBeVisible();
  await expandButton.evaluate((button) => button.click());
  await expect(cell.getByText('ポスト印象派')).toBeVisible();
  await expect(cell.getByRole('button', { name: /折りたたむ/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});

test('一覧は表示形式を持たず、親子関係はカード内の上位分類で示す', async ({ page }) => {
  // 旧「表示形式」クエリが残っていてもエラーにならず通常表示へフォールバックする
  await page.goto('/movements/?lod=detailed&view=hierarchy');

  await expect(page.getByRole('group', { name: '表示形式' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '階層', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'フラット', exact: true })).toHaveCount(0);
  await expect(page.locator('[data-movement-view="hierarchy"]')).toHaveCount(0);
  await expect(page.locator('[data-movement-view="flat"]')).toBeVisible();
  await expect(page.getByText('上位分類：').first()).toBeVisible();
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

  await page.getByRole('button', { name: /充実\s*48/ }).click();
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'すべて表示' }).click();
  }
  // Overview is an editorial map capped at the principal movements. Zoom into
  // Study before asserting that the selected LOD's complete DOM set is present.
  const zoomIn = page.getByRole('button', { name: 'ネットワークを拡大' });
  for (let step = 0; step < 8; step += 1) {
    if ((await graph.getAttribute('data-network-semantic-level')) !== 'overview') break;
    await zoomIn.click();
  }
  await expect(graph).toHaveAttribute('data-network-semantic-level', 'study');
  await expect(graph.getByRole('button', { name: '未来派を選択' })).toBeVisible();
});
