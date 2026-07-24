import { test, expect } from '@playwright/test';

test('iPhone幅では重要関係と制限したノードだけを初期表示する', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await expect(graph).toHaveAttribute('data-network-scope', 'important');
  await expect(page.getByRole('button', { name: '継承', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '反発', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '影響', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '同時代', exact: true })).toHaveAttribute('aria-pressed', 'false');
  const edgeCount = await graph
    .locator('[data-network-layer="base-edges"] [data-network-edge]')
    .count();
  expect(edgeCount).toBeGreaterThan(0);
  expect(edgeCount).toBeLessThanOrEqual(18);

  const nodeCount = await graph.locator('[data-network-node]').count();
  expect(nodeCount).toBeLessThanOrEqual(24);
  await expect(page.getByRole('heading', { name: '関係一覧' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'すべて表示' })).toBeVisible();
});

test('モバイルですべての関係へ切り替えられる', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await page.getByRole('button', { name: 'すべて表示' }).click();

  await expect(graph).toHaveAttribute('data-network-scope', 'all');
  await expect(page.getByRole('button', { name: '理論的関連', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(
    await graph.locator('[data-network-layer="base-edges"] [data-network-edge]').count(),
  ).toBeGreaterThan(18);
  await expect(page.getByRole('button', { name: '重要関係のみ' })).toBeVisible();
});

test('PCにも表示切替と件数を常時表示する', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/network/');

  await expect(page.getByRole('button', { name: '重要関係のみ' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'すべて表示' })).toBeVisible();
  await expect(page.getByText(/関係・\d+ノード表示中/)).toBeVisible();
});

test('関係タイプごとに線種・通常線幅・方向を使い分ける', async ({ page }) => {
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const base = graph.locator('[data-network-layer="base-edges"]');
  const succession = base.locator('[data-relation-kind="succession"] [data-network-edge]').first();
  const reaction = base.locator('[data-relation-kind="reaction"] [data-network-edge]').first();
  const influence = base.locator('[data-relation-kind="influence"] [data-network-edge]').first();

  await expect(succession).toHaveAttribute('stroke-width', '2.8');
  await expect(reaction).toHaveAttribute('stroke-dasharray', '9 6');
  await expect(influence).toHaveAttribute('stroke-dasharray', '18 8');
  await expect(succession).toHaveAttribute('marker-end', 'url(#network-arrow-succession)');
  await expect(reaction).toHaveAttribute('marker-end', 'url(#network-arrow-reaction)');
  await expect(influence).toHaveAttribute('marker-end', 'url(#network-arrow-influence)');
});

test('ノード選択時は強調線を無関係ノードより前、関連ノードより後ろに描く', async ({ page }) => {
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();

  const highlightedLayer = graph.locator('[data-network-layer="highlighted-edges"]');
  const baseLayer = graph.locator('[data-network-layer="base-edges"]');
  await expect(highlightedLayer.locator('[data-network-edge]').first()).toHaveAttribute(
    'stroke-width',
    '4.6',
  );
  await expect(baseLayer.locator('[data-network-edge]').first()).toHaveAttribute(
    'stroke-width',
    '1.2',
  );
  await expect(baseLayer.locator('[data-network-edge]').first()).toHaveAttribute(
    'opacity',
    '0.075',
  );
  expect(await graph.locator('[data-edge-label]').count()).toBeGreaterThan(0);
  expect(await graph.locator('[data-node-state="related"]').count()).toBeGreaterThan(0);
  expect(await graph.locator('[data-node-state="dimmed"]').count()).toBeGreaterThan(0);
  expect(
    await graph.locator('[data-node-state="dimmed"]').first().evaluate(
      (element) => Number(getComputedStyle(element.parentElement!).zIndex),
    ),
  ).toBeLessThan(
    await highlightedLayer.evaluate((element) => Number(getComputedStyle(element).zIndex)),
  );
  expect(
    await graph.locator('[data-node-state="related"]').first().evaluate(
      (element) => Number(getComputedStyle(element.parentElement!).zIndex),
    ),
  ).toBeGreaterThan(
    await highlightedLayer.evaluate((element) => Number(getComputedStyle(element).zIndex)),
  );
});

test('関係選択時に起点・到達先と自然な反発文を表示する', async ({ page }) => {
  await page.goto('/network/');

  const reactionItem = page
    .locator('[data-relation-list-item][data-relation-kind="reaction"] button')
    .first();
  await reactionItem.click();

  const panel = page.locator('[data-selected-relationship]');
  await expect(panel).toBeVisible();
  await expect(panel.getByText('起点', { exact: true })).toBeVisible();
  await expect(panel.getByText('終点', { exact: true })).toBeVisible();
  await expect(panel.getByText(/は.+に反発した/)).toBeVisible();
  await expect(
    page.getByRole('group', { name: '美術運動の関係ネットワーク図' })
      .locator('[data-node-role="source"]'),
  ).toHaveCount(1);
  await expect(
    page.getByRole('group', { name: '美術運動の関係ネットワーク図' })
      .locator('[data-node-role="target"]'),
  ).toHaveCount(1);
});

test('線ラベルは背景矩形を使わない', async ({ page }) => {
  await page.goto('/network/');
  const labels = page.locator('[data-network-layer="edge-labels"]');

  await expect(labels.locator('rect')).toHaveCount(0);
  expect(await labels.locator('text[data-edge-label]').count()).toBeGreaterThan(0);
});

test('PCで時代ジャンプと左右キーにより現代まで移動できる', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const dimensions = await graph.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);

  await page.getByRole('button', { name: '現代', exact: true }).click();
  await expect(page.getByRole('button', { name: '現代', exact: true })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect
    .poll(() => graph.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(500);

  await graph.focus();
  const before = await graph.evaluate((element) => element.scrollLeft);
  await graph.press('ArrowLeft');
  await expect
    .poll(() => graph.evaluate((element) => element.scrollLeft))
    .toBeLessThan(before);
});

test('関係タイプの絞り込みが図とテキスト一覧の両方へ反映される', async ({ page }) => {
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await page.getByRole('button', { name: '反発', exact: true }).click();

  await expect(page.getByRole('button', { name: '反発', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(graph.locator('[data-relation-kind="reaction"]')).toHaveCount(0);
  await expect(page.locator('[data-relation-list-item][data-relation-kind="reaction"]')).toHaveCount(0);
});

test('ダークモードと動きを減らす設定を尊重する', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('aha-theme', 'dark'));
  await page.goto('/network/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
  ).toBe(true);
  const transitionDuration = await page
    .locator('body')
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(['0s', '0.000001s', '1e-06s']).toContain(transitionDuration);
});
