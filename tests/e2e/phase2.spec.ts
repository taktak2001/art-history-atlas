import { test, expect } from '@playwright/test';

// 注意: ローカル配信では外部(Wikimedia)画像は読み込めないため onError でプレースホルダーへ退避する。
// 本E2Eは画像そのものの表示ではなく、グリッド/導線/レイアウトの健全性を検証する。

test('ムーブメント詳細に代表作品グリッドが表示され、作品詳細へ遷移できる', async ({ page }) => {
  await page.goto('/movements/impressionism/');
  await expect(page.getByRole('heading', { name: '代表作品', exact: true })).toBeVisible();
  // 代表作品グリッドの作品リンク（href指定で確実に）から作品詳細へ
  const workLink = page.locator('a[href="/works/work-impression-sunrise/"]').first();
  await expect(workLink).toBeVisible();
  await workLink.click();
  await expect(page).toHaveURL(/\/works\/work-impression-sunrise\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('印象・日の出');
});

test('作品詳細に情報と出典が表示される', async ({ page }) => {
  await page.goto('/works/work-mona-lisa/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('モナ・リザ');
  await expect(page.getByRole('heading', { name: '作品情報' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '出典' })).toBeVisible();
  // figure（画像）またはプレースホルダーのいずれかが存在する
  const hasFigureOrPlaceholder =
    (await page.locator('figure').count()) > 0 ||
    (await page.getByRole('img', { name: /プレースホルダー/ }).count()) > 0;
  expect(hasFigureOrPlaceholder).toBeTruthy();
});

test('比較ページに各ムーブメントの代表作品が並ぶ', async ({ page }) => {
  await page.goto('/compare/?ids=gothic,italian-renaissance');
  await expect(page.getByRole('rowheader', { name: '代表作品' })).toBeVisible();
  // 代表作品行に作品リンクが存在する
  await expect(page.getByRole('link', { name: /モナ・リザ|アテナイの学堂|マエスタ/ }).first()).toBeVisible();
});

test('iPhone幅で作品グリッドが横あふれしない', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/movements/baroque/');
  await expect(page.getByRole('heading', { name: '代表作品', exact: true })).toBeVisible();
  // 本文が横スクロールしない（document幅がビューポート幅を超えない）
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientW = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollW).toBeLessThanOrEqual(clientW + 1);
});

for (const movement of [
  { slug: 'prehistoric-ritual', title: '先史美術' },
  { slug: 'italian-renaissance', title: 'イタリア・ルネサンス' },
  { slug: 'mono-ha', title: 'もの派' },
]) {
  test(`${movement.title}の詳細が8章の図録構成で表示される`, async ({ page }) => {
    await page.goto(`/movements/${movement.slug}/`);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(movement.title);
    await expect(page.getByRole('navigation', { name: '詳細ページ目次' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '思想と歴史的背景' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '代表作品', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: '出典', exact: true })).toBeVisible();
    await expect(page.getByText('学説上の注意')).toBeVisible();
  });
}

test('もの派の画像未登録作品も図録レイアウトと権利案内を維持する', async ({ page }) => {
  await page.goto('/movements/mono-ha/');

  await expect(page.getByText('作品 01')).toBeVisible();
  await expect(page.getByText('画像は権利確認後に順次収録').first()).toBeVisible();
  await expect(page.getByText(/画像は権利確認後に収録予定/).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /作品詳細で確認/ }).first()).toBeVisible();
});

test('ミニ目次から代表作品の章へ移動できる', async ({ page }) => {
  await page.goto('/movements/italian-renaissance/');

  await page.getByRole('navigation', { name: '詳細ページ目次' })
    .getByRole('link', { name: '作品' })
    .click();
  await expect(page).toHaveURL(/#works$/);
  await expect(page.getByRole('heading', { name: '代表作品', exact: true })).toBeVisible();
});

test('02章は解釈ラベルを置かず、章・サブ見出し・本文の3階層で表示する', async ({
  page,
}) => {
  await page.goto('/movements/italian-renaissance/');

  const chapter = page.locator('#relation');
  const sectionTitle = chapter.getByRole('heading', {
    level: 2,
    name: '何が新しかったか',
  });
  const changedTitle = chapter.getByRole('heading', {
    level: 3,
    name: '転換したこと',
  });
  const inheritedTitle = chapter.getByRole('heading', {
    level: 3,
    name: '継承したこと',
  });

  await expect(sectionTitle).toBeVisible();
  await expect(changedTitle).toBeVisible();
  await expect(inheritedTitle).toBeVisible();
  await expect(chapter.getByText('解釈', { exact: true })).toHaveCount(0);

  const typography = await chapter.evaluate((element) => {
    const section = element.querySelector('h2');
    const subsection = element.querySelector('h3');
    const body = element.querySelector<HTMLElement>('.detail-body');
    return {
      sectionFamily: section ? getComputedStyle(section).fontFamily : '',
      subsectionFamily: subsection ? getComputedStyle(subsection).fontFamily : '',
      bodyFamily: body ? getComputedStyle(body).fontFamily : '',
      sectionSize: section ? Number.parseFloat(getComputedStyle(section).fontSize) : 0,
      subsectionSize: subsection
        ? Number.parseFloat(getComputedStyle(subsection).fontSize)
        : 0,
      bodySize: body ? Number.parseFloat(getComputedStyle(body).fontSize) : 0,
    };
  });

  expect(typography.sectionFamily).toBe(typography.subsectionFamily);
  expect(typography.subsectionFamily).not.toBe(typography.bodyFamily);
  expect(typography.sectionSize).toBeGreaterThan(typography.subsectionSize);
  expect(typography.subsectionSize).toBeGreaterThan(typography.bodySize);
});
