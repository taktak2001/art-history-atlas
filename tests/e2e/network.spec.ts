import { test, expect } from '@playwright/test';

test('iPhone幅では重要関係と制限したノードだけを初期表示する', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await expect(graph).toHaveAttribute('data-network-scope', 'important');
  await expect(graph).toHaveAttribute('data-network-mobile', 'true');
  await expect(page.getByRole('combobox', { name: '表示する関係タイプ' })).toHaveValue(
    'all',
  );
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
  await expect(page.getByRole('option', { name: '理論的関連' })).toBeAttached();
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

test('iPhoneでは本体が初期viewport内に入り、線の見方はoverlayで開く', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const guide = page.locator('details.network-line-guide');
  const before = await graph.boundingBox();
  expect(before).not.toBeNull();
  expect(before!.y).toBeLessThan(844);
  await expect(guide).not.toHaveAttribute('open', '');

  await guide.locator('summary').click();
  await expect(guide).toHaveAttribute('open', '');
  await expect(guide.locator('summary')).toHaveAttribute('aria-expanded', 'true');
  await expect(guide.locator('.network-line-guide__panel')).toBeVisible();
  await expect(guide.locator('.network-line-guide__legend li')).toHaveCount(9);
  await expect(
    guide.getByText(
      '中心的な方法や問題意識を、後続運動が直接引き継ぐ関係',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(guide.locator('.network-line-guide__definitions')).toHaveCount(0);
  await expect(page.locator('.network-core-definitions')).toHaveCount(0);
  const after = await graph.boundingBox();
  expect(after!.y).toBeCloseTo(before!.y, 0);

  await page.getByRole('heading', { name: '関係ネットワーク' }).click();
  await expect(guide).not.toHaveAttribute('open', '');
  await expect(guide.locator('summary')).toHaveAttribute('aria-expanded', 'false');
});

test('線の見方はEscapeで閉じ、操作説明だけを上部に残す', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/');

  const guide = page.locator('details.network-line-guide');
  const summary = guide.locator('summary');
  await expect(
    page.getByText('横にスワイプして移動。ノードをタップして関係を表示', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('.network-core-definitions')).toHaveCount(0);

  await summary.click();
  await expect(guide).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(guide).not.toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
});

test('関係タイプごとに線種・通常線幅・方向を使い分ける', async ({ page }) => {
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const base = graph.locator('[data-network-layer="base-edges"]');
  const succession = base.locator('[data-relation-kind="succession"] [data-network-edge]').first();
  const reaction = base.locator('[data-relation-kind="reaction"] [data-network-edge]').first();
  const influence = base.locator('[data-relation-kind="influence"] [data-network-edge]').first();
  const expectedNormalWidth =
    (page.viewportSize()?.width ?? 1280) <= 639 ? '2' : '2.8';

  await expect(succession).toHaveAttribute('stroke-width', expectedNormalWidth);
  await expect(reaction).toHaveAttribute('stroke-dasharray', '9 6');
  await expect(influence).toHaveAttribute('stroke-dasharray', '18 8');
  await expect(succession).toHaveAttribute('marker-end', 'url(#base-arrow-succession)');
  await expect(reaction).toHaveAttribute('marker-end', 'url(#base-arrow-reaction)');
  await expect(influence).toHaveAttribute('marker-end', 'url(#base-arrow-influence)');
});

test('SVG markerは安全余白と共通仕様を持ち、無向線には付かない', async ({ page }) => {
  await page.goto('/network/');
  await page.getByRole('button', { name: 'すべて表示' }).click();

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const base = graph.locator('[data-network-layer="base-edges"]');
  await expect(base).toHaveAttribute('data-safe-padding', '16');
  await expect(base).toHaveAttribute('overflow', 'visible');

  const markers = base.locator('marker[data-arrow-marker]');
  expect(await markers.count()).toBeGreaterThan(0);
  for (const marker of await markers.all()) {
    await expect(marker).toHaveAttribute('markerUnits', 'userSpaceOnUse');
    await expect(marker).toHaveAttribute('markerWidth', '10');
    await expect(marker).toHaveAttribute('markerHeight', '10');
    await expect(marker).toHaveAttribute('overflow', 'visible');
  }

  const directed = base.locator(
    '[data-network-edge][data-relation-kind="succession"]',
  ).first();
  const undirected = base.locator(
    '[data-network-edge][data-relation-kind="contemporary"]',
  ).first();
  await expect(directed).toHaveAttribute('marker-end', /base-arrow-succession/);
  await expect(undirected).not.toHaveAttribute('marker-end');
});

test('ノード選択時は強調線を無関係ノードより前、関連ノードより後ろに描く', async ({ page }) => {
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();

  const highlightedLayer = graph.locator('[data-network-layer="highlighted-edges"]');
  const baseLayer = graph.locator('[data-network-layer="base-edges"]');
  const expectedHighlightWidth =
    (page.viewportSize()?.width ?? 1280) <= 639 ? '3.6' : '4.6';
  await expect(highlightedLayer.locator('[data-network-edge]').first()).toHaveAttribute(
    'stroke-width',
    expectedHighlightWidth,
  );
  await expect(baseLayer.locator('[data-network-edge]').first()).toHaveAttribute(
    'stroke-width',
    '1.1',
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

test('ルネサンスから伸びる反発線をバロックへの継承線と分離する', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const base = graph.locator('[data-network-layer="base-edges"]');
  const collapsedSuccession = base.locator(
    '[data-network-edge-id="lod-succession-italian-renaissance-baroque"]',
  );
  const collapsedReaction = base.locator(
    '[data-network-edge-id="lod-reaction-italian-renaissance-baroque"]',
  );

  await expect(collapsedSuccession).toHaveAttribute('data-route-offset', '0');
  await expect(collapsedReaction).toHaveAttribute('data-route-offset', '-24');

  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();

  const highlighted = graph.locator('[data-network-layer="highlighted-edges"]');
  const succession = highlighted.locator(
    '[data-network-edge-id="lod-succession-italian-renaissance-baroque"]',
  );
  const longReaction = highlighted.locator(
    '[data-network-edge-id="lod-reaction-italian-renaissance-cubism"]',
  );

  await expect(succession).toHaveAttribute('data-route-offset', '0');
  await expect(longReaction).toHaveAttribute('data-route-offset', /^-\d+$/);
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

test('選択ノードの詳細リンクからムーブメント詳細へ遷移する', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await graph.getByRole('button', { name: 'キュビスムを選択' }).click();

  const detailLink = page.getByRole('link', { name: '詳細ページへ →' });
  await expect(detailLink).toHaveAttribute('href', /\/movements\/cubism\/$/);
  await detailLink.click();

  await expect(page).toHaveURL(/\/movements\/cubism\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'キュビスム' })).toBeVisible();
});

test('ノードのダブルタップでは遷移せず、下部の詳細リンクだけを導線にする', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const node = graph.getByRole('button', { name: 'キュビスムを選択' });
  await node.dblclick();

  await expect(page).toHaveURL(/\/network\/$/);
  await expect(node).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: '詳細ページへ →' })).toHaveAttribute(
    'href',
    /\/movements\/cubism\/$/,
  );
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
  await page
    .getByRole('combobox', { name: '表示する関係タイプ' })
    .selectOption('reaction');

  expect(await graph.locator('[data-network-edge]').count()).toBeGreaterThan(0);
  await expect(
    graph.locator('[data-network-edge]:not([data-relation-kind="reaction"])'),
  ).toHaveCount(0);
  expect(
    await page.locator('[data-relation-list-item][data-relation-kind="reaction"]').count(),
  ).toBeGreaterThan(0);
  await expect(
    page.locator('[data-relation-list-item]:not([data-relation-kind="reaction"])'),
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

for (const zoom of [1.25, 1.5]) {
  test(`ブラウザズーム${Math.round(zoom * 100)}%相当でもmarkerと本体を表示する`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/network/');
    await page.evaluate((value) => {
      document.documentElement.style.zoom = String(value);
    }, zoom);

    const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
    await expect(graph).toBeVisible();
    expect(await graph.locator('marker[data-arrow-marker]').count()).toBeGreaterThan(0);
    const box = await graph.boundingBox();
    expect(box!.width).toBeGreaterThan(300);
    expect(box!.height).toBeGreaterThan(200);
  });
}
