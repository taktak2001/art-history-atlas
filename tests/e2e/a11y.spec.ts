import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// 主要画面のアクセシビリティ自動スキャン（WCAG 2.1 A/AA 相当のルール）。
const pages = [
  { path: '/', name: 'ホーム' },
  { path: '/movements/', name: 'ムーブメント一覧' },
  { path: '/movements/prehistoric-ritual/', name: '先史美術詳細' },
  { path: '/movements/italian-renaissance/', name: 'ルネサンス詳細' },
  { path: '/movements/mono-ha/', name: 'もの派詳細' },
  { path: '/chronology/', name: '縦型年表' },
  { path: '/timeline/', name: '横型タイムライン' },
  { path: '/matrix/', name: 'マトリクス' },
  { path: '/network/', name: '関係ネットワーク' },
  { path: '/compare/?ids=gothic,baroque', name: '比較' },
  { path: '/about/', name: '編集方針' },
];

for (const p of pages) {
  test(`アクセシビリティ: ${p.name}`, async ({ page }) => {
    await page.goto(p.path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    // 重大な違反（serious / critical）が無いこと
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    if (serious.length > 0) {
      console.log(
        `${p.name} の重大な違反:`,
        serious.map((v) => `${v.id} (${v.nodes.length})`).join(', '),
      );
    }
    expect(serious, `${p.name}に重大なアクセシビリティ違反`).toEqual([]);
  });
}

test('アクセシビリティ: 分類詳細を展開した編集方針', async ({ page }) => {
  await page.goto('/about/');
  await page.locator('#classification-movement-button').click();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );

  expect(serious, '分類詳細の展開時に重大なアクセシビリティ違反').toEqual([]);
});

test('アクセシビリティ: 関係基準を展開した編集方針', async ({ page }) => {
  await page.goto('/about/');
  await page.locator('#relationship-reaction-button').click();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(serious, '関係基準の展開時に重大なアクセシビリティ違反').toEqual([]);
});

test('アクセシビリティ: 展示を展開した縦型年表', async ({ page }) => {
  await page.goto('/chronology/');
  await page.locator('#era-renaissance').getByRole('button').click();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(serious, '展示展開時に重大なアクセシビリティ違反').toEqual([]);
});

test('アクセシビリティ: ノードを選択した関係ネットワーク', async ({ page }) => {
  await page.goto('/network/');
  const graph = page.getByRole('group', { name: '美術運動の関係ネットワーク図' });
  await graph.getByRole('button', { name: 'イタリア・ルネサンスを選択' }).click();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(serious, 'ノード選択時に重大なアクセシビリティ違反').toEqual([]);
});
