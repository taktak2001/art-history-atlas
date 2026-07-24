import { test, expect } from '@playwright/test';

test('iPhone幅では重要関係と制限したノードだけを初期表示する', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await expect(graph).toHaveAttribute('data-network-scope', 'important');
  await expect(page.getByRole('button', { name: '継承' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '反発' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '影響', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '同時代' })).toHaveAttribute('aria-pressed', 'false');
  await expect(graph.locator('[data-network-edge]')).toHaveCount(18);

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
  await expect(page.getByRole('button', { name: '理論的関連' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await graph.locator('[data-network-edge]').count()).toBeGreaterThan(18);
  await expect(page.getByRole('button', { name: '重要関係のみ' })).toBeVisible();
});

test('関係タイプごとに線種と通常線幅を使い分ける', async ({ page }) => {
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const succession = graph.locator('[data-relation-kind="succession"] [data-network-edge]').first();
  const reaction = graph.locator('[data-relation-kind="reaction"] [data-network-edge]').first();
  const influence = graph.locator('[data-relation-kind="influence"] [data-network-edge]').first();

  await expect(succession).toHaveAttribute('stroke-width', '2.8');
  await expect(reaction).toHaveAttribute('stroke-dasharray', '9 6');
  await expect(influence).toHaveAttribute('stroke-dasharray', '18 8');
});

test('ノード選択時に関連線と関連ノードを強調する', async ({ page }) => {
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();

  await expect(graph.locator('[data-edge-related="true"]').first()).toHaveAttribute(
    'stroke-width',
    '4.5',
  );
  await expect(graph.locator('[data-edge-related="false"]').first()).toHaveAttribute(
    'stroke-width',
    '1.25',
  );
  await expect(graph.locator('[data-edge-related="false"]').first()).toHaveAttribute(
    'opacity',
    '0.1',
  );
  expect(await graph.locator('[data-edge-label]').count()).toBeGreaterThan(0);
  expect(await graph.locator('[data-node-state="related"]').count()).toBeGreaterThan(0);
  expect(await graph.locator('[data-node-state="dimmed"]').count()).toBeGreaterThan(0);
});

test('関係タイプの絞り込みが図とテキスト一覧の両方へ反映される', async ({ page }) => {
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await page.getByRole('button', { name: '反発' }).click();

  await expect(page.getByRole('button', { name: '反発' })).toHaveAttribute('aria-pressed', 'false');
  await expect(graph.locator('[data-relation-kind="reaction"]')).toHaveCount(0);
  await expect(
    page.getByRole('listitem').filter({ hasText: /^反発/ }),
  ).toHaveCount(0);
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
