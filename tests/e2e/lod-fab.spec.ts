import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openLodFab } from './lod-helpers';

test('mobileのLOD FABは閉じた親1個から銀杏形3分割へ開き、bottom sheetを避ける', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/network/');

  const fab = page.locator('[data-semantic-lod-fab]');
  const trigger = page.getByRole('button', { name: '表示密度を変更' });
  const menu = page.getByRole('menu', { name: '表示密度' });
  await expect(fab).toHaveCount(1);
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();

  const closedBox = await trigger.boundingBox();
  expect(closedBox).not.toBeNull();
  if (closedBox) {
    expect(closedBox.width).toBeGreaterThanOrEqual(44);
    expect(closedBox.height).toBeGreaterThanOrEqual(44);
    expect(closedBox.x + closedBox.width).toBeLessThanOrEqual(390);
    expect(closedBox.y + closedBox.height).toBeLessThanOrEqual(844);
  }
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-network-mobile-closed.png',
  });

  await openLodFab(page);
  await expect(menu.getByRole('menuitemradio')).toHaveCount(3);
  const leafShape = await menu.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      clipPath: style.clipPath,
      display: style.display,
      transformOrigin: style.transformOrigin,
    };
  });
  expect(leafShape.clipPath).toContain('polygon');
  expect(leafShape.display).toBe('grid');
  expect(leafShape.transformOrigin).not.toBe('50% 50%');
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-network-mobile-expanded.png',
  });

  await page.locator('body').click({ position: { x: 12, y: 320 } });
  await expect(menu).toBeHidden();
  await openLodFab(page);
  await page.keyboard.press('ArrowRight');
  const standard = menu.getByRole('menuitemradio', { name: /充実に切り替え/ });
  await expect(standard).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/lod=standard/);
  await expect(trigger).toHaveAttribute('title', '表示密度: 充実');
  await expect(trigger).toBeFocused();
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-network-mobile-middle-selected.png',
  });

  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();
  const detail = page.locator('[data-network-detail-panel]');
  await expect(detail).toBeVisible();
  const positions = await Promise.all([trigger.boundingBox(), detail.boundingBox()]);
  expect(positions[0]).not.toBeNull();
  expect(positions[1]).not.toBeNull();
  if (positions[0] && positions[1]) {
    expect(positions[0].y + positions[0].height).toBeLessThanOrEqual(
      positions[1].y,
    );
  }
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-network-mobile-selected-sheet.png',
  });

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(
      (violation) =>
        violation.impact === 'critical' || violation.impact === 'serious',
    ),
  ).toEqual([]);
});

test('mobile Chronologyも旧上部UIなしで共通FABだけを表示する', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/chronology/');

  await expect(page.locator('[data-semantic-lod-fab]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: '表示密度を変更' })).toBeVisible();
  await expect(page.locator('[data-lod-option]')).toHaveCount(3);
  await expect(page.locator('[data-semantic-lod-menu]')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-chronology-mobile-closed.png',
  });
});

test('desktopの共通FABはhover不要で開き、Escapeで親へフォーカスを戻す', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/network/');

  const trigger = await openLodFab(page);
  const menu = page.getByRole('menu', { name: '表示密度' });
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-network-desktop-expanded.png',
  });
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-network-desktop-closed.png',
  });
});
