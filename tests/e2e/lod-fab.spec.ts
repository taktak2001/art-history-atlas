import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openLodFab } from './lod-helpers';

// 関係ネットワークは情報量ではなく閲覧目的（OVERVIEW/STUDY/FOCUS）で切り替えるため
// 共通FABを置かない。FABの検証はLODを情報量として使い続ける画面で行う。
test('mobileのLOD FABは90度の3sectorへ開き、tapとdragでLODを選べる', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/matrix/');

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
    path: 'docs/screenshots/lod-fab-matrix-mobile-closed.png',
  });

  await openLodFab(page);
  await expect(menu.getByRole('menuitemradio')).toHaveCount(3);
  const leafShape = await menu.evaluate((element) => {
    const style = getComputedStyle(element);
    const outline = element.querySelector(
      '.semantic-lod-fab__fan-outline',
    );
    return {
      display: style.display,
      transformOrigin: style.transformOrigin,
      angle: element.getAttribute('data-fan-angle'),
      radius: element.getAttribute('data-fan-radius'),
      width: element.clientWidth,
      height: element.clientHeight,
      outline: outline?.getAttribute('d'),
    };
  });
  expect(leafShape.display).toBe('block');
  expect(leafShape.transformOrigin).toBe('172px 172px');
  expect(leafShape.angle).toBe('90');
  expect(leafShape.radius).toBe('168');
  expect(leafShape.width).toBeCloseTo(172, 0);
  expect(leafShape.height).toBeCloseTo(172, 0);
  expect(leafShape.outline).toContain('A 168 168');
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-matrix-mobile-expanded.png',
  });

  await page.locator('body').click({ position: { x: 12, y: 320 } });
  await expect(menu).toBeHidden();

  const triggerBox = await trigger.boundingBox();
  expect(triggerBox).not.toBeNull();
  if (!triggerBox) return;
  const hingeX = triggerBox.x + triggerBox.width / 2;
  const hingeY = triggerBox.y + triggerBox.height / 2;
  await page.mouse.move(hingeX, hingeY);
  await page.mouse.down();
  await expect(menu).toBeVisible();
  await page.mouse.move(hingeX - 78, hingeY - 78, { steps: 5 });
  const standard = menu.getByRole('menuitemradio', { name: /充実に切り替え/ });
  await expect(standard).toHaveAttribute('data-drag-highlight', 'true');
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-matrix-mobile-drag-middle.png',
  });
  await page.mouse.up();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/lod=standard/);
  await expect(trigger).toHaveAttribute('title', '表示密度: 充実');
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-matrix-mobile-middle-selected.png',
  });

  await openLodFab(page);
  await menu.getByRole('menuitemradio', { name: /すべてに切り替え/ }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/lod=detailed/);

  await page.mouse.move(hingeX, hingeY);
  await page.mouse.down();
  await page.mouse.move(hingeX + 24, hingeY + 8, { steps: 3 });
  await page.mouse.up();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/lod=detailed/);

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

test('mobile全画面TimelineのLOD FABはzoom操作帯と下端を揃える', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/timeline/');
  await page
    .getByRole('button', { name: 'タイムラインを全画面で表示' })
    .click();

  const viewer = page.locator('[data-timeline-viewer="active"]');
  const controls = viewer.locator('[data-viewer-controls]');
  const trigger = viewer.getByRole('button', { name: '表示密度を変更' });
  await expect(controls).toBeVisible();
  await expect(trigger).toBeVisible();

  const [controlsBox, triggerBox] = await Promise.all([
    controls.boundingBox(),
    trigger.boundingBox(),
  ]);
  expect(controlsBox).not.toBeNull();
  expect(triggerBox).not.toBeNull();
  if (!controlsBox || !triggerBox) return;
  expect(
    Math.abs(
      controlsBox.y + controlsBox.height - (triggerBox.y + triggerBox.height),
    ),
  ).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: 'docs/screenshots/timeline-viewer-lod-toolbar-aligned-iphone.png',
  });
});

test('desktopの共通FABはhover不要で開き、Escapeで親へフォーカスを戻す', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop project only');
  await page.goto('/matrix/');

  const trigger = await openLodFab(page);
  const menu = page.getByRole('menu', { name: '表示密度' });
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-matrix-desktop-expanded.png',
  });
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.screenshot({
    path: 'docs/screenshots/lod-fab-matrix-desktop-closed.png',
  });
});
