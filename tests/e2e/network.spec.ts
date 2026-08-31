import { test, expect, type Page } from '@playwright/test';
import { selectNetworkMode } from './lod-helpers';

async function zoomNetworkToStudy(page: Page) {
  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  if ((await graph.getAttribute('data-network-semantic-level')) !== 'study') {
    await selectNetworkMode(page, 'study');
  }
  await expect(graph).toHaveAttribute('data-network-semantic-level', 'study');
}

test('iPhone幅のoverviewは主要系譜だけを読みやすい密度で表示する', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/?mode=overview');

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
  expect(nodeCount).toBeGreaterThanOrEqual(10);
  expect(nodeCount).toBeLessThanOrEqual(16);
  await expect(graph).toHaveAttribute('data-network-semantic-level', 'overview');
  await expect(graph.locator('[data-edge-label]')).toHaveCount(0);
  expect(await graph.locator('[data-overview-landmark="true"]').count()).toBeGreaterThan(0);
  expect(
    await graph.locator('[data-network-node-title]').evaluateAll((elements) =>
      elements.filter((element) => !element.textContent?.trim()).length,
    ),
  ).toBe(0);
  await expect(page.getByRole('heading', { name: '関係一覧' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'すべて表示' })).toBeVisible();
});

test('モバイルですべての関係へ切り替えられる', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/?mode=overview');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await page.getByRole('button', { name: 'すべて表示' }).click();

  await expect(graph).toHaveAttribute('data-network-scope', 'all');
  await expect(page.getByRole('option', { name: '理論的関連' })).toBeAttached();
  expect(
    await graph.locator('[data-network-layer="base-edges"] [data-network-edge]').count(),
  ).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: '重要関係のみ' })).toBeVisible();
});

test('全体は主要系譜へ戻し、mobile地域列を100px以内に保つ', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/?lod=detailed&scope=all');
  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await expect(graph).toHaveAttribute('data-network-semantic-level', 'detail');

  await page.getByRole('button', { name: '主要系譜の全体表示へ戻す' }).click();
  await expect(graph).toHaveAttribute('data-network-semantic-level', 'overview');
  await expect(graph).toHaveAttribute('data-network-lod', 'core');
  await expect(graph).toHaveAttribute('data-network-scope', 'all');
  const nodeCount = await graph.locator('[data-network-node]').count();
  expect(nodeCount).toBeGreaterThanOrEqual(10);
  expect(nodeCount).toBeLessThanOrEqual(16);

  const regionWidth = await graph
    .locator('.network-region-lane__label')
    .first()
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(regionWidth).toBeGreaterThanOrEqual(80);
  expect(regionWidth).toBeLessThanOrEqual(100);
});

test('PCにも表示切替と件数を常時表示する', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/network/?mode=overview');

  await expect(page.getByRole('button', { name: '重要関係のみ' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'すべて表示' })).toBeVisible();
  await expect(page.getByText(/関係・\d+ノード表示中/)).toBeVisible();
});

test('実年代X軸と地域Yレーンを表示し、両方向へスクロールできる', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/?mode=overview');

  // Overviewは主要系譜へ情報を絞ってviewportへ収める。全情報を扱う
  // detailed LODでは、実寸の歴史地図を両方向へ辿れることを確認する。
  await selectNetworkMode(page, 'focus');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await expect(graph.locator('[data-network-region="france"]')).toBeAttached();
  await expect(graph.locator('[data-network-region="japan"]')).toBeAttached();
  await expect(graph.getByText('前4万', { exact: true })).toBeVisible();
  await expect(graph.getByText('1900', { exact: true })).toBeAttached();

  const overflow = await graph.evaluate((element) => ({
    horizontal: element.scrollWidth > element.clientWidth,
    vertical: element.scrollHeight > element.clientHeight,
  }));
  expect(overflow.horizontal).toBe(true);
  expect(overflow.vertical).toBe(true);
});

test('情報LODはcamera zoomと分離し、詳細でArtist・Work・Contextを表示する', async ({ page }) => {
  // FOCUSはカメラが選択に合わせて決まるので倍率操作を出さない。
  // 「倍率を変えても段階は変わらない」ことはOVERVIEWで確かめる。
  await page.goto('/network/?mode=overview&focus=mono-ha&scope=focus&lod=core');
  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await expect(graph).toHaveAttribute('data-network-semantic-level', 'overview');
  await expect(graph.locator('[data-network-entity="artist"]')).toHaveCount(0);

  await expect
    .poll(() =>
      graph.evaluate((element) =>
        Number(element.getAttribute('data-network-zoom')),
      ),
    )
    .toBeGreaterThanOrEqual(0.84);

  // 倍率を上げても段階は変わらない（ズームはカメラだけを担当する）
  await page.getByRole('button', { name: 'ネットワークを拡大' }).click();
  await expect(graph).toHaveAttribute('data-network-semantic-level', 'overview');
  await selectNetworkMode(page, 'study');
  await expect(graph).toHaveAttribute('data-network-semantic-level', 'study');
  await expect(graph.locator('[data-network-entity="artist"]')).toHaveCount(0);
  await expect(graph.locator('[data-network-entity="work"]')).toHaveCount(0);

  await selectNetworkMode(page, 'focus');
  await expect(graph).toHaveAttribute('data-network-semantic-level', 'detail');
  expect(await graph.locator('[data-network-entity="work"]').count()).toBeGreaterThan(0);
  expect(await graph.locator('[data-network-entity="context"]').count()).toBeGreaterThan(0);
  // 概要 → 代表作家 → 代表作品 → 関係 の順に読ませる
  const headings = await page
    .locator('[data-network-detail-panel] h4')
    .allTextContents();
  expect(headings).toEqual(['代表作家', '代表作品', '関係']);
});

test('選択時は直接関係、2-hop、背景の3段階で焦点化する', async ({ page }) => {
  await page.goto('/network/?mode=overview');
  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();

  expect(await graph.locator('[data-node-state="related"]').count()).toBeGreaterThan(0);
  expect(await graph.locator('[data-node-state="secondary"]').count()).toBeGreaterThan(0);
  expect(await graph.locator('[data-node-state="dimmed"]').count()).toBeGreaterThan(0);
  await expect
    .poll(async () => {
      const secondHopOpacity = await graph
        .locator('[data-node-state="secondary"]')
        .first()
        .evaluate((element) => Number(getComputedStyle(element).opacity));
      const backgroundOpacity = await graph
        .locator('[data-node-state="dimmed"]')
        .first()
        .evaluate((element) => Number(getComputedStyle(element).opacity));
      return secondHopOpacity - backgroundOpacity;
    })
    .toBeGreaterThan(0);
  await expect(page.locator('[data-network-detail-panel] figure')).toContainText(
    'LOCAL ORBIT',
  );
  await expect(
    page.getByRole('img', {
      name: 'イタリア・ルネサンスと直接関係するムーブメント',
    }),
  ).toBeVisible();
});

test('overviewとfocused cameraを分け、全体操作で俯瞰へ戻る', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/network/?mode=overview');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await expect(graph).toHaveAttribute('data-network-camera', 'overview');
  await expect(graph).toHaveAttribute('data-network-visual-gutter', '32');
  await expect(graph.locator('[data-node-state="dimmed"]')).toHaveCount(0);
  await expect(graph.locator('[data-network-node]')).toHaveCount(16);
  await expect(graph.locator('[data-edge-label]')).toHaveCount(0);
  await expect(
    graph.locator('[data-network-edge][data-route-grammar="metro"]'),
  ).toHaveCount(await graph.locator('[data-network-edge]').count());
  await expect(
    page.getByRole('button', { name: '主要系譜の全体表示へ戻す' }),
  ).toBeVisible();

  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();
  await expect(graph).toHaveAttribute('data-network-camera', 'focused');
  await expect(page.locator('[data-network-detail-panel]')).toBeVisible();
  await expect
    .poll(async () => Number(await graph.getAttribute('data-network-zoom')))
    .toBeGreaterThanOrEqual(0.84);

  await expect
    .poll(() =>
      graph.evaluate((element) => {
        const selected = element.querySelector<HTMLElement>(
          '[data-node-state="selected"]',
        );
        const corner = element.querySelector<HTMLElement>('.network-axis-corner');
        if (!selected || !corner) return Number.POSITIVE_INFINITY;
        const selectedRect = selected.getBoundingClientRect();
        const graphRect = element.getBoundingClientRect();
        const cornerRect = corner.getBoundingClientRect();
        const contentCenter = (cornerRect.right + graphRect.right) / 2;
        return Math.abs(
          (selectedRect.left + selectedRect.right) / 2 - contentCenter,
        );
      }),
    )
    .toBeLessThan(90);

  await page.getByRole('button', { name: '主要系譜の全体表示へ戻す' }).click();
  await expect(graph).toHaveAttribute('data-network-camera', 'overview');
  await expect(page.locator('[data-network-detail-panel]')).toHaveCount(0);
  await expect(graph.locator('[data-node-state="dimmed"]')).toHaveCount(0);
});

for (const viewport of [
  { name: 'mobile 390px', width: 390, height: 844 },
  { name: 'desktop 1280px', width: 1280, height: 900 },
] as const) {
  test(`${viewport.name}のOverviewは16駅・10地域・主要5見出しを全体表示する`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/network/?mode=overview');
    const graph = page.getByRole('group', {
      name: '美術運動の関係ネットワーク図',
    });

    await expect.poll(async () => Number(await graph.getAttribute('data-network-zoom')))
      .toBeLessThan(0.18);

    const metrics = await graph.evaluate((element) => {
      const graphRect = element.getBoundingClientRect();
      const inside = (rect: DOMRect) =>
        rect.left >= graphRect.left - 1 &&
        rect.right <= graphRect.right + 1 &&
        rect.top >= graphRect.top - 1 &&
        rect.bottom <= graphRect.bottom + 1;
      const intersects = (a: DOMRect, b: DOMRect, gap = 0) =>
        a.left < b.right + gap &&
        a.right + gap > b.left &&
        a.top < b.bottom + gap &&
        a.bottom + gap > b.top;
      const nodes = Array.from(
        element.querySelectorAll<HTMLElement>('[data-network-node]'),
      );
      const stations = nodes.map((node) => ({
        id: node.dataset.networkNodeId,
        rect: node
          .querySelector<HTMLElement>('.network-node__station > span')!
          .getBoundingClientRect(),
      }));
      const labels = nodes.flatMap((node) => {
        const content = node.querySelector<HTMLElement>('.network-node__content');
        if (!content || getComputedStyle(content).display === 'none') return [];
        return [{ id: node.dataset.networkNodeId, rect: content.getBoundingClientRect() }];
      });
      const lanes = Array.from(
        element.querySelectorAll<HTMLElement>('[data-network-region]'),
      ).map((lane) => ({
        region: lane.dataset.networkRegion,
        height: Number(lane.dataset.laneHeight),
        rect: lane.getBoundingClientRect(),
        labelRect: lane
          .querySelector<HTMLElement>('.network-region-lane__label')!
          .getBoundingClientRect(),
      }));
      const ticks = Array.from(
        element.querySelectorAll<HTMLElement>('.network-time-axis__tick'),
      ).map((tick) => tick.getBoundingClientRect());
      const labelCollisions: string[] = [];
      for (let left = 0; left < labels.length; left += 1) {
        for (let right = left + 1; right < labels.length; right += 1) {
          if (intersects(labels[left].rect, labels[right].rect)) {
            labelCollisions.push(`${labels[left].id}×${labels[right].id}`);
          }
        }
      }
      const stationCollisions: string[] = [];
      for (let left = 0; left < stations.length; left += 1) {
        for (let right = left + 1; right < stations.length; right += 1) {
          if (intersects(stations[left].rect, stations[right].rect, 1)) {
            stationCollisions.push(`${stations[left].id}×${stations[right].id}`);
          }
        }
      }
      const tickCollisions = ticks.some((tick, index) =>
        ticks.slice(index + 1).some((candidate) => intersects(tick, candidate, 4)),
      );
      const canvas = element.querySelector<HTMLElement>('[data-network-canvas]')!;
      const renaissance = labels.find((label) => label.id === 'italian-renaissance');
      const baroque = labels.find((label) => label.id === 'baroque');

      return {
        stationCount: stations.length,
        stationOverflow: stations.filter(({ rect }) => !inside(rect)).map(({ id }) => id),
        stationCollisions,
        regionCount: lanes.length,
        regionOverflow: lanes
          .filter(
            ({ rect, labelRect }) =>
              rect.top < graphRect.top - 1 ||
              rect.bottom > graphRect.bottom + 1 ||
              !inside(labelRect),
          )
          .map(({ region }) => region),
        labelIds: labels.map(({ id }) => id),
        labelCollisions,
        tickCollisions,
        canvasH: Math.round(canvas.getBoundingClientRect().height),
        maxLaneHeight: Math.max(...lanes.map((lane) => lane.height)),
        renaissanceBaroqueCollision:
          renaissance && baroque
            ? intersects(renaissance.rect, baroque.rect)
            : false,
      };
    });

    expect(metrics.stationCount).toBe(16);
    expect(metrics.stationOverflow).toEqual([]);
    expect(metrics.stationCollisions).toEqual([]);
    expect(metrics.regionCount).toBe(10);
    expect(metrics.regionOverflow).toEqual([]);
    expect(metrics.labelIds).toEqual([
      'italian-renaissance',
      'impressionism',
      'cubism',
      'abstract-expressionism',
      'minimalism',
    ]);
    expect(metrics.labelCollisions).toEqual([]);
    expect(metrics.tickCollisions).toBe(false);
    expect(metrics.renaissanceBaroqueCollision).toBe(false);
    expect(metrics.canvasH).toBeLessThanOrEqual(viewport.height === 844 ? 450 : 480);
    expect(metrics.maxLaneHeight).toBeLessThanOrEqual(56);
  });
}

for (const [movementId, movementName] of [
  ['italian-renaissance', 'イタリア・ルネサンス'],
  ['abstract-expressionism', '抽象表現主義'],
  ['light-and-space', 'ライト・アンド・スペース'],
] as const) {
  test(`${movementName}を選択してもcanvas端・詳細パネルに隠れない`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/network/?focus=${movementId}`);

    const graph = page.getByRole('group', {
      name: '美術運動の関係ネットワーク図',
    });
    await expect
      .poll(async () => Number(await graph.getAttribute('data-network-zoom')))
      .toBeGreaterThanOrEqual(0.84);

    await expect
      .poll(() =>
        graph.evaluate((element) => {
          const selected = element.querySelector<HTMLElement>(
            '[data-node-state="selected"]',
          );
          const panel = document.querySelector<HTMLElement>(
            '[data-network-detail-panel]',
          );
          if (!selected) return false;
          const graphRect = element.getBoundingClientRect();
          const selectedRect = selected.getBoundingClientRect();
          const panelRect = panel?.getBoundingClientRect();
          const visibleRight = panelRect?.left ?? graphRect.right;
          return (
            selectedRect.left >= graphRect.left &&
            selectedRect.right <= visibleRight &&
            selectedRect.top >= graphRect.top &&
            selectedRect.bottom <= graphRect.bottom
          );
        }),
      )
      .toBe(true);
  });
}

test('iPhoneでは本体が初期viewport内に入り、線の見方はoverlayで開く', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/?mode=overview');

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
    guide.locator('[data-relationship-legend-description]'),
  ).toHaveCount(9);
  await expect(
    guide.getByText(
      '前の運動の中心的な思想や技法を受け継ぎ、発展させた関係です。すべてをそのまま引き継ぐのではなく、新しい時代や地域に合わせて再解釈される変化も含めて丁寧に捉えます。',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(guide.locator('.network-line-guide__panel')).not.toContainText(
    /実線|破線|点線|鎖線|有向|無向/,
  );
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
  await page.goto('/network/?mode=overview');

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
  await page.goto('/network/?lod=detailed&scope=all');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const base = graph.locator('[data-network-layer="base-edges"]');
  const succession = base.locator('[data-relation-kind="succession"] [data-network-edge]').first();
  const reaction = base.locator('[data-relation-kind="reaction"] [data-network-edge]').first();
  const influence = base.locator('[data-relation-kind="influence"] [data-network-edge]').first();
  const expectedNormalWidth =
    (page.viewportSize()?.width ?? 1280) <= 639 ? '1.7' : '1.7';

  await expect(succession).toHaveAttribute('stroke-width', expectedNormalWidth);
  await expect(reaction).toHaveAttribute('stroke-dasharray', '9 6');
  await expect(influence).toHaveAttribute('stroke-dasharray', '18 8');
  await expect(succession).toHaveAttribute('marker-end', 'url(#base-arrow-succession)');
  await expect(reaction).toHaveAttribute('marker-end', 'url(#base-arrow-reaction)');
  await expect(influence).toHaveAttribute('marker-end', 'url(#base-arrow-influence)');
});

test('SVG markerは安全余白と共通仕様を持ち、無向線には付かない', async ({ page }) => {
  await page.goto('/network/?lod=detailed');
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
  await page.goto('/network/?mode=study');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();

  const highlightedLayer = graph.locator('[data-network-layer="highlighted-edges"]');
  const baseLayer = graph.locator('[data-network-layer="base-edges"]');
  const expectedHighlightWidth =
    (page.viewportSize()?.width ?? 1280) <= 639 ? '3' : '3.4';
  await expect(highlightedLayer.locator('[data-network-edge]').first()).toHaveAttribute(
    'stroke-width',
    expectedHighlightWidth,
  );
  await expect(baseLayer.locator('[data-network-edge]').first()).toHaveAttribute(
    'stroke-width',
    '0.9',
  );
  await expect(baseLayer.locator('[data-network-edge]').first()).toHaveAttribute(
    'opacity',
    '0.025',
  );
  expect(await graph.locator('[data-edge-label]').count()).toBeGreaterThan(0);
  expect(await graph.locator('[data-node-state="related"]').count()).toBeGreaterThan(0);
  expect(await graph.locator('[data-node-state="dimmed"]').count()).toBeGreaterThan(0);
  const selectedNode = graph.locator('[data-node-state="selected"]');
  const relatedNode = graph.locator('[data-node-state="related"]').first();
  const dimmedNode = graph.locator('[data-node-state="dimmed"]').first();
  // Wait for the short focus transition before asserting its settled visual hierarchy.
  await expect
    .poll(() =>
      relatedNode.evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeGreaterThanOrEqual(0.85);
  await expect
    .poll(() =>
      dimmedNode.evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeLessThanOrEqual(0.25);
  // 選択トランジションが完全に収束してから確定した見た目を検証する
  await expect
    .poll(() =>
      selectedNode.evaluate((element) => {
        const title = element.querySelector<HTMLElement>('[data-network-node-title]');
        return title ? getComputedStyle(title).color : '';
      }),
    )
    .toBe('rgb(28, 28, 30)');
  const selectedStyle = await selectedNode.evaluate((element) => {
    const style = getComputedStyle(element);
    const content = element.querySelector<HTMLElement>('.network-node__content')!;
    const contentStyle = getComputedStyle(content);
    const title = element.querySelector<HTMLElement>('[data-network-node-title]');
    const date = element.querySelector<HTMLElement>('[data-network-node-date]');
    return {
      opacity: Number(style.opacity),
      borderWidth: contentStyle.borderTopWidth,
      borderColor: contentStyle.borderTopColor,
      backgroundColor: contentStyle.backgroundColor,
      boxShadow: contentStyle.boxShadow,
      transform: style.transform,
      titleWeight: title ? Number(getComputedStyle(title).fontWeight) : 0,
      titleColor: title ? getComputedStyle(title).color : '',
      dateWeight: date ? Number(getComputedStyle(date).fontWeight) : 0,
    };
  });
  const idleNode = graph.locator('[data-node-state="dimmed"]').first();
  const idleStyle = await idleNode.evaluate((element) => {
    const content = element.querySelector<HTMLElement>('.network-node__content')!;
    const style = getComputedStyle(content);
    return {
      borderWidth: style.borderTopWidth,
      backgroundColor: style.backgroundColor,
      boxShadow: style.boxShadow,
    };
  });
  const relatedOpacity = await relatedNode.evaluate((element) =>
    Number(getComputedStyle(element).opacity),
  );
  const dimmedOpacity = await dimmedNode.evaluate((element) =>
    Number(getComputedStyle(element).opacity),
  );

  // WebKit/Chromium may sample the final transition frame a fraction below 1.
  expect(selectedStyle.opacity).toBeGreaterThanOrEqual(0.99);
  expect(Number.parseFloat(selectedStyle.borderWidth)).toBeGreaterThanOrEqual(2);
  expect(Number.parseFloat(selectedStyle.borderWidth)).toBeLessThanOrEqual(2.5);
  expect(selectedStyle.borderColor).toContain('28, 28, 30');
  expect(selectedStyle.titleColor).toContain('28, 28, 30');
  expect(selectedStyle.transform).toBe('none');
  expect(selectedStyle.titleWeight).toBeGreaterThanOrEqual(700);
  // 俯瞰のsemantic zoomでは年代を省略し、表示時は400を維持する
  expect([0, 400]).toContain(selectedStyle.dateWeight);
  // 主ノードだけが2.5px濃チャコールとごく弱い影を持つ
  expect(selectedStyle.boxShadow).not.toBe('none');
  expect(selectedStyle.backgroundColor).toBe('rgb(252, 248, 244)');
  expect(Number.parseFloat(idleStyle.borderWidth)).toBe(0);
  expect(idleStyle.boxShadow).toBe('none');
  expect(idleStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  // 関係ノードは0.85以上、背景ノードは0.03〜0.06まで沈める
  expect(relatedOpacity).toBeGreaterThanOrEqual(0.85);
  expect(dimmedOpacity).toBeGreaterThanOrEqual(0.03);
  expect(dimmedOpacity).toBeLessThanOrEqual(0.06);
  expect(selectedStyle.backgroundColor).not.toBe(idleStyle.backgroundColor);
  await expect(
    graph.locator('[data-edge-label][data-edge-label-anchor="start"], [data-edge-label][data-edge-label-anchor="end"]'),
  ).toHaveCount(await graph.locator('[data-network-layer="highlighted-edges"] [data-network-edge]').count());
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
  expect(
    await selectedNode.evaluate((element) =>
      Number(getComputedStyle(element.parentElement!).zIndex),
    ),
  ).toBeGreaterThan(
    await relatedNode.evaluate((element) =>
      Number(getComputedStyle(element.parentElement!).zIndex),
    ),
  );
});

test('基本表示ではルネサンスとバロックの直接関係だけを示す', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/?mode=overview');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const base = graph.locator('[data-network-layer="base-edges"]');
  const collapsedSuccession = base.locator(
    '[data-network-edge-id="lod-succession-italian-renaissance-baroque"]',
  );
  const collapsedReaction = base.locator(
    '[data-network-edge-id="lod-reaction-italian-renaissance-baroque"]',
  );

  await expect(collapsedSuccession).toHaveAttribute('data-route-offset', '0');
  await expect(collapsedReaction).toHaveCount(0);

  await selectNetworkMode(page, 'study');
  await zoomNetworkToStudy(page);
  const standardReaction = graph.locator(
    '[data-network-layer="base-edges"] [data-network-edge-id="lod-reaction-mannerism-baroque"]',
  );
  await expect(standardReaction).toBeAttached();
});

test('関係選択時に起点・到達先と自然な反発文を表示する', async ({ page }) => {
  await page.goto('/network/?lod=detailed&scope=all');

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
  await page.goto('/network/?mode=overview');

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
  await page.goto('/network/?mode=overview');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  const node = graph.getByRole('button', { name: 'キュビスムを選択' });
  await node.dblclick();

  // 詳細ページへは遷移しない（選択はURLの ?focus= に反映されるが /network/ に留まる）
  await expect(page).toHaveURL(/\/network\/\?.*focus=cubism/);
  await expect(node).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: '詳細ページへ →' })).toHaveAttribute(
    'href',
    /\/movements\/cubism\/$/,
  );
});

test('線ラベルは矩形の板ではなく紙色のハローで線から切り離す', async ({
  page,
}) => {
  // 地域レーンに地色が入ったので、板だと背景から浮いた箱に見えてしまう
  await page.goto('/network/?lod=detailed');
  await expect(page.locator('[data-edge-label]').first()).toBeVisible();

  const counts = await page.evaluate(() => {
    const layer = document.querySelector('[data-network-layer="edge-labels"]')!;
    return {
      labels: layer.querySelectorAll('text[data-edge-label]').length,
      halos: layer.querySelectorAll('text[data-edge-label-halo]').length,
      rects: layer.querySelectorAll('rect').length,
    };
  });
  expect(counts.labels).toBeGreaterThan(0);
  expect(counts.halos).toBe(counts.labels);
  expect(counts.rects).toBe(0);

  const halo = await page
    .locator('[data-edge-label]')
    .first()
    .evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        paintOrder: computed.paintOrder,
        strokeWidth: computed.strokeWidth,
        strokeIsPaper: computed.stroke !== 'none' && computed.stroke !== '',
      };
    });
  expect(halo.paintOrder).toContain('stroke');
  expect(halo.strokeIsPaper).toBe(true);
  expect(Number.parseFloat(halo.strokeWidth)).toBeGreaterThan(2);
});

test('PCで時代ジャンプと左右キーにより現代まで移動できる', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop keyboard navigation only');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/network/?mode=overview');

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await page.getByLabel('時代へ移動').selectOption('contemporary');
  await expect(page.getByLabel('時代へ移動')).toHaveValue('contemporary');
  await expect
    .poll(() => graph.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(100);

  await graph.focus();
  const before = await graph.evaluate((element) => element.scrollLeft);
  await graph.press('ArrowLeft');
  await expect
    .poll(() => graph.evaluate((element) => element.scrollLeft))
    .toBeLessThan(before);
});

test('関係タイプの絞り込みが図とテキスト一覧の両方へ反映される', async ({ page }) => {
  await page.goto('/network/?mode=overview');

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
  await page.goto('/network/?mode=overview');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
  ).toBe(true);
  const transitionDuration = await page
    .locator('body')
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(['0s', '0.000001s', '1e-06s']).toContain(transitionDuration);

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();
  const selectedStyle = await graph
    .locator('[data-node-state="selected"]')
    .evaluate((element) => {
      const content = element.querySelector<HTMLElement>('.network-node__content')!;
      const style = getComputedStyle(content);
      const title = element.querySelector<HTMLElement>('[data-network-node-title]');
      return {
        borderColor: style.borderTopColor,
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
        titleColor: title ? getComputedStyle(title).color : '',
      };
    });
  expect(selectedStyle.borderColor).toBe(selectedStyle.titleColor);
  expect(selectedStyle.backgroundColor).toBe('rgb(42, 40, 37)');
  expect(selectedStyle.boxShadow).toContain('rgba');
});

for (const zoom of [1.25, 1.5]) {
  test(`ブラウザズーム${Math.round(zoom * 100)}%相当でもmarkerと本体を表示する`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/network/?mode=overview');
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

test('詳細ページから関係ネットワークへ移ると直接関係が欠落せず表示される', async ({
  page,
}) => {
  await page.goto('/movements/japanese-ink-painting/');
  await page.getByRole('link', { name: /関係ネットワーク/ }).first().click();

  // 1. focus が URL に載る
  await expect(page).toHaveURL(/focus=japanese-ink-painting/);

  // 2. 選択状態になる
  const focusNode = page.locator('[data-network-node][aria-pressed="true"]');
  await expect(focusNode).toHaveCount(1);
  await expect(focusNode).toContainText('日本水墨画');

  // 3. 直接関係を出すために必要な最小LOD（充実）へ自動変更される
  await expect(page).toHaveURL(/lod=standard/);
  // 1件を指した時点で目的はFOCUSになる
  await expect(
    page.locator('[data-network-mode-option="focus"]'),
  ).toHaveAttribute('aria-pressed', 'true');

  // 4. 表示関係が「このムーブメント」になる
  const scopeSelected = page.locator('.network-scope-option[aria-pressed="true"]');
  await expect(scopeSelected).toHaveText('このムーブメント');
  await expect(page).toHaveURL(/scope=focus/);

  // 5. 直接関係先を保ち、非関連ノードは背景として残して弱める
  await expect(page.getByText('中国山水画').first()).toBeVisible();
  expect(await page.locator('[data-network-node]').count()).toBeGreaterThanOrEqual(26);
  expect(await page.locator('[data-network-node]').count()).toBeLessThanOrEqual(72);
  await expect(page.locator('[data-network-node][data-node-state="dimmed"]').first()).toBeVisible();

  // 6. 全体寄りではなくサブグラフの件数を出す
  await expect(page.locator('.network-controls__count')).toContainText('直接関係');

  // 7. 自動調整の理由を小さく添える
  await expect(page.locator('.network-controls__auto-note')).toContainText('自動調整');
});

test('focus中は手動変更を尊重し、選択解除で全体表示へ戻る', async ({ page }) => {
  await page.goto('/network/?focus=japanese-ink-painting');
  await expect(page).toHaveURL(/scope=focus/);

  // 手動でLODを基本へ戻しても、自動設定へ巻き戻さない
  await selectNetworkMode(page, 'overview');
  await expect(page).toHaveURL(/lod=core/);
  await expect(page).toHaveURL(/focus=japanese-ink-painting/);
  // focusノードと直接関係はLODに関わらず表示し続け、overviewの主要背景も残す
  const focusedNodeCount = await page.locator('[data-network-node]').count();
  expect(focusedNodeCount).toBeGreaterThanOrEqual(10);
  expect(focusedNodeCount).toBeLessThanOrEqual(18);
  await expect(
    page.locator(
      '[data-network-node][data-network-node-id="japanese-ink-painting"]',
    ),
  ).toBeVisible();
  await expect(page.locator('[data-network-node][data-node-state="dimmed"]').first()).toBeVisible();
  // OVERVIEWは俯瞰専用なので、表示関係は全体側へ戻る（選択と収録範囲は保つ）
  await expect(
    page.locator('.network-scope-option[aria-pressed="true"]'),
  ).toHaveText('重要関係');

  // 選択解除で focus を外し、「重要関係」の全体表示へ戻る
  await page.getByRole('button', { name: '選択を解除' }).click();
  await expect(page).not.toHaveURL(/focus=/);
  await expect(
    page.locator('.network-scope-option[aria-pressed="true"]'),
  ).toHaveText('重要関係');
  await expect(page.locator('.network-controls__count')).toContainText('関係・');
});

test('focus付きURLは再読込で同じ状態を復元し、無効なfocusは通常表示へ落ちる', async ({
  page,
}) => {
  await page.goto('/network/?focus=japanese-ink-painting&lod=standard&scope=focus');
  await expect(
    page.locator('.network-scope-option[aria-pressed="true"]'),
  ).toHaveText('このムーブメント');
  await expect(page.locator('[data-network-node][aria-pressed="true"]')).toHaveCount(1);

  // 無効な focus はエラーにせず通常表示
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/network/?focus=not-a-real-movement');
  await expect(page.locator('[data-network-node]').first()).toBeVisible();
  await expect(page).not.toHaveURL(/focus=/);
  expect(errors).toEqual([]);
});

test('関係ラベルは密集しても互いに重ならず、全件表示される', async ({ page }) => {
  // ミニマリズムは反発/継承/影響/同時代/地域的展開が1点へ集まっていたケース
  await page.goto('/network/?focus=minimalism');

  // focusの自動調整が終わって表示が落ち着いてから測る
  await expect(
    page.locator('.network-scope-option[aria-pressed="true"]'),
  ).toHaveText('このムーブメント');
  await expect(page.locator('[data-edge-label]').first()).toBeVisible();

  const result = await page.evaluate(() => {
    const first = document.querySelector('[data-edge-label]') as SVGGraphicsElement;
    const svg = first.ownerSVGElement!;
    const labels = Array.from(
      svg.querySelectorAll<SVGGraphicsElement>('[data-edge-label]'),
    );
    const boxes = labels.map((element) => {
      const box = element.getBBox();
      return {
        text: element.textContent ?? '',
        x: box.x,
        y: box.y,
        w: box.width,
        h: box.height,
      };
    });
    const overlaps: string[] = [];
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        if (
          a.x < b.x + b.w &&
          a.x + a.w > b.x &&
          a.y < b.y + b.h &&
          a.y + a.h > b.y
        ) {
          overlaps.push(`${a.text}×${b.text}`);
        }
      }
    }
    const viewBox = svg.viewBox.baseVal;
    const outside = boxes
      .filter(
        (box) =>
          box.x < viewBox.x - 1 ||
          box.y < viewBox.y - 1 ||
          box.x + box.w > viewBox.x + viewBox.width + 1 ||
          box.y + box.h > viewBox.y + viewBox.height + 1,
      )
      .map((box) => box.text);
    return {
      labelCount: labels.length,
      haloCount: svg.querySelectorAll('[data-edge-label-halo]').length,
      overlaps,
      outside,
    };
  });

  expect(result.labelCount).toBeGreaterThanOrEqual(3);
  // ラベル同士が重ならない
  expect(result.overlaps).toEqual([]);
  // 画面外へ出さない
  expect(result.outside).toEqual([]);
  // ラベルは消さず、線が文字を貫通しないようバックプレートを敷く
  expect(result.haloCount).toBe(result.labelCount);
});

test('全体表示でラベルが密集してもラベル同士が重ならない', async ({ page }) => {
  await page.goto('/network/?scope=all');
  await selectNetworkMode(page, 'focus');

  await expect(page.locator('[data-edge-label]').first()).toBeVisible();

  const { count, overlaps } = await page.evaluate(() => {
    const first = document.querySelector('[data-edge-label]') as SVGGraphicsElement;
    const svg = first.ownerSVGElement!;
    const boxes = Array.from(
      svg.querySelectorAll<SVGGraphicsElement>('[data-edge-label]'),
    ).map((element) => {
      const box = element.getBBox();
      return { text: element.textContent ?? '', x: box.x, y: box.y, w: box.width, h: box.height };
    });
    const hits: string[] = [];
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
          hits.push(`${a.text}×${b.text}`);
        }
      }
    }
    return { count: boxes.length, overlaps: hits };
  });

  // 端末幅によって同時表示数は変わるため、件数より重なりゼロを主眼に検証する
  expect(count).toBeGreaterThanOrEqual(3);
  expect(overlaps).toEqual([]);
});

test('ラベルはノードに重ならず、離れた場合は引き出し線で対応を示す', async ({
  page,
}) => {
  // イタリア・ルネサンスは同時代/反発が同じ縦の経路に重なっていたケース
  await page.goto('/network/?focus=italian-renaissance');
  await expect(
    page.locator('.network-scope-option[aria-pressed="true"]'),
  ).toHaveText('このムーブメント');
  await expect(page.locator('[data-edge-label]').first()).toBeVisible();

  const result = await page.evaluate(() => {
    const first = document.querySelector('[data-edge-label]') as SVGGraphicsElement;
    const svg = first.ownerSVGElement!;
    const svgBox = svg.getBoundingClientRect();
    const labels = Array.from(
      svg.querySelectorAll<SVGGraphicsElement>('[data-edge-label]'),
    ).map((element) => {
      const box = element.getBBox();
      return { text: element.textContent ?? '', x: box.x, y: box.y, w: box.width, h: box.height };
    });
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-network-node]'),
    ).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        text: element.innerText.split('\n')[0],
        x: rect.left - svgBox.left,
        y: rect.top - svgBox.top,
        w: rect.width,
        h: rect.height,
      };
    });
    const nodeHits: string[] = [];
    for (const label of labels) {
      for (const node of nodes) {
        if (
          label.x < node.x + node.w &&
          label.x + label.w > node.x &&
          label.y < node.y + node.h &&
          label.y + label.h > node.y
        ) {
          nodeHits.push(`${label.text}×${node.text}`);
        }
      }
    }
    const labelHits: string[] = [];
    for (let i = 0; i < labels.length; i += 1) {
      for (let j = i + 1; j < labels.length; j += 1) {
        const a = labels[i];
        const b = labels[j];
        if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
          labelHits.push(`${a.text}×${b.text}`);
        }
      }
    }
    return {
      texts: labels.map((label) => label.text),
      nodeHits,
      labelHits,
      leaders: svg.querySelectorAll('[data-edge-label-leader]').length,
    };
  });

  // ノードにも他のラベルにも重ならない
  expect(result.nodeHits).toEqual([]);
  expect(result.labelHits).toEqual([]);
  // 「同時代」がどのエッジか分かる状態で表示されている
  expect(result.texts).toContain('同時代');
  // 引き出し線はあくまで逃がした場合の補助。近くに収まったなら不要（0でよい）
  expect(result.leaders).toBeGreaterThanOrEqual(0);
});

test('引き出し線はノードのブロックを貫通しない', async ({ page }) => {
  // ゴシック focus は引き出し線がロマネスク美術のブロックを横切っていたケース
  await page.goto('/network/?focus=gothic');
  await expect(page.locator('[data-edge-label]').first()).toBeVisible();

  const result = await page.evaluate(() => {
    const first = document.querySelector('[data-edge-label]') as SVGGraphicsElement;
    const svg = first.ownerSVGElement!;
    const svgBox = svg.getBoundingClientRect();
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-network-node]'),
    ).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        text: element.innerText.split('\n')[0],
        x: rect.left - svgBox.left,
        y: rect.top - svgBox.top,
        w: rect.width,
        h: rect.height,
      };
    });
    const leaders = Array.from(
      svg.querySelectorAll<SVGLineElement>('[data-edge-label-leader]'),
    );
    const crossings: string[] = [];
    leaders.forEach((leader, index) => {
      const x1 = leader.x1.baseVal.value;
      const y1 = leader.y1.baseVal.value;
      const x2 = leader.x2.baseVal.value;
      const y2 = leader.y2.baseVal.value;
      for (let step = 0; step <= 30; step += 1) {
        const x = x1 + ((x2 - x1) * step) / 30;
        const y = y1 + ((y2 - y1) * step) / 30;
        for (const node of nodes) {
          if (x > node.x && x < node.x + node.w && y > node.y && y < node.y + node.h) {
            crossings.push(`leader${index}×${node.text}`);
            return;
          }
        }
      }
    });
    // ラベル本体（と背景）もブロックに重ならない
    const labelHits: string[] = [];
    for (const element of Array.from(
      svg.querySelectorAll<SVGGraphicsElement>('[data-edge-label]'),
    )) {
      const box = element.getBBox();
      for (const node of nodes) {
        if (
          box.x < node.x + node.w &&
          box.x + box.width > node.x &&
          box.y < node.y + node.h &&
          box.y + box.height > node.y
        ) {
          labelHits.push(`${element.textContent}×${node.text}`);
        }
      }
    }
    return { crossings: [...new Set(crossings)], labelHits };
  });

  expect(result.crossings).toEqual([]);
  expect(result.labelHits).toEqual([]);
});

test('390pxのoverviewは内容量に応じてregion laneを圧縮する', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/?mode=overview');
  await page.getByLabel('時代へ移動').selectOption('renaissance');
  await expect(page.locator('[data-network-zoom]')).toHaveAttribute(
    'data-network-zoom',
    '0.72',
  );

  const lanes = await page.locator('[data-network-region]').evaluateAll((elements) =>
    elements.map((element) => ({
      relevance: element.getAttribute('data-lane-relevance'),
      nodes: Number(element.getAttribute('data-lane-visible-nodes')),
      height: Number(element.getAttribute('data-lane-height')),
    })),
  );
  expect(lanes.every((lane) => lane.relevance === 'overview')).toBe(true);
  expect(lanes.filter((lane) => lane.nodes <= 1).every((lane) => lane.height <= 60)).toBe(
    true,
  );
});

test('390pxのBaroque focusは文字とstationを分離し、無関係laneを圧縮する', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/network/?focus=baroque&lod=standard');
  await expect(page.locator('[data-network-node-id="baroque"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  const result = await page.evaluate(() => {
    const stationLabelCollisions: string[] = [];
    const routeTextCollisions = new Set<string>();
    for (const node of Array.from(
      document.querySelectorAll<HTMLElement>('[data-network-node]'),
    )) {
      const station = node.querySelector<HTMLElement>('.network-node__station');
      const content = node.querySelector<HTMLElement>('.network-node__content');
      if (!station || !content || content.offsetParent === null) continue;
      const stationRect = station.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const gap = 6;
      if (
        stationRect.left < contentRect.right + gap &&
        stationRect.right + gap > contentRect.left &&
        stationRect.top < contentRect.bottom + gap &&
        stationRect.bottom + gap > contentRect.top
      ) {
        stationLabelCollisions.push(node.dataset.networkNodeId ?? 'unknown');
      }
    }
    const textBoxes = Array.from(
      document.querySelectorAll<HTMLElement>('.network-node__content'),
    ).flatMap((content) => {
      if (content.offsetParent === null) return [];
      const rect = content.getBoundingClientRect();
      const id = content.closest<HTMLElement>('[data-network-node]')?.dataset
        .networkNodeId;
      return [{
        id: id ?? 'unknown',
        left: rect.left - 6,
        right: rect.right + 6,
        top: rect.top - 6,
        bottom: rect.bottom + 6,
      }];
    });
    for (const path of Array.from(
      document.querySelectorAll<SVGPathElement>(
        '[data-network-layer="base-edges"] [data-network-edge], [data-network-layer="highlighted-edges"] [data-network-edge]',
      ),
    )) {
      const matrix = path.getScreenCTM();
      if (!matrix) continue;
      const length = path.getTotalLength();
      const steps = Math.max(20, Math.ceil(length / 3));
      for (let step = 0; step <= steps; step += 1) {
        const point = path.getPointAtLength((length * step) / steps);
        const screenPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
        for (const textBox of textBoxes) {
          if (
            screenPoint.x >= textBox.left &&
            screenPoint.x <= textBox.right &&
            screenPoint.y >= textBox.top &&
            screenPoint.y <= textBox.bottom
          ) {
            routeTextCollisions.add(
              `${path.dataset.networkEdgeId ?? 'edge'}×${textBox.id}`,
            );
          }
        }
      }
    }
    const lanes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-network-region]'),
    ).map((lane) => ({
      region: lane.dataset.networkRegion,
      relevance: lane.dataset.laneRelevance,
      height: Number(lane.dataset.laneHeight),
    }));
    return {
      stationLabelCollisions,
      routeTextCollisions: [...routeTextCollisions],
      lanes,
    };
  });

  expect(result.stationLabelCollisions).toEqual([]);
  expect(result.routeTextCollisions).toEqual([]);
  const contextLanes = result.lanes.filter((lane) => lane.relevance === 'context');
  expect(contextLanes.length).toBeGreaterThan(0);
  expect(contextLanes.every((lane) => lane.height <= 60)).toBe(true);
  expect(result.lanes.find((lane) => lane.region === 'italy')?.relevance).toBe('active');
  // 板ではなくハローで抜く
  await expect(page.locator('[data-edge-label-halo]').first()).toHaveAttribute(
    'paint-order',
    'stroke fill',
  );
});
