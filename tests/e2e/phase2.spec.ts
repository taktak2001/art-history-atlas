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

test('iPhone幅でもゴシック美術の概要が文の途中で切れない', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/movements/gothic/');

  const summary = page.locator('[data-hero-summary]');
  await expect(summary).toHaveText(
    '大聖堂建築を中心に展開した中世盛期の様式。尖頭アーチ・リブ・飛梁の構造革新が高く明るい内部空間を可能にし、ステンドグラスの光が神学的意味を担った。',
  );
  await expect(summary).not.toContainText('…');
});

test('詳細ページは概要と思想の間に出典付きの名称由来を表示する', async ({ page }) => {
  await page.goto('/movements/futurism/');

  const origin = page.locator('[data-name-origin]');
  await expect(origin.getByRole('heading', { name: '名称の由来' })).toBeVisible();
  await expect(origin).toContainText('Futurismo');
  await expect(origin).toContainText('フィリッポ・トンマーゾ・マリネッティ');
  await expect(origin).toContainText('1909年');
  await expect(origin.getByText('根拠資料')).toBeVisible();
  await expect(origin.getByRole('link').first()).toHaveAttribute('target', '_blank');

  const originTop = await origin.evaluate((element) => element.getBoundingClientRect().top);
  const contextTop = await page
    .getByRole('heading', { name: '思想と歴史的背景' })
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(originTop).toBeLessThan(contextTop);
});

test('名称の成立に諸説がある場合は断定しない', async ({ page }) => {
  await page.goto('/movements/dada/');

  const origin = page.locator('[data-name-origin]');
  await expect(origin).toContainText('諸説');
  await expect(origin).toContainText('単一の説明として断定していません');
  await expect(origin.getByText('命名', { exact: true })).toHaveCount(0);
});

for (const movement of [
  // 注意書きの見出しは内容ごとに具体化している（一律の「学説上の注意」にしない）
  { slug: 'prehistoric-ritual', title: '先史美術', note: '年代の精度について' },
  { slug: 'italian-renaissance', title: 'イタリア・ルネサンス', note: '年代の扱い' },
  { slug: 'mono-ha', title: 'もの派', note: '運動としてのまとまり' },
]) {
  test(`${movement.title}の詳細が8章の図録構成で表示される`, async ({ page }) => {
    await page.goto(`/movements/${movement.slug}/`);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(movement.title);
    await expect(page.getByRole('navigation', { name: '詳細ページ目次' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '思想と歴史的背景' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '代表作品', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: '出典', exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: movement.note }),
    ).toBeVisible();
    // 汎用の見出しは使わない
    await expect(page.getByText('学説上の注意')).toHaveCount(0);
  });
}

test('もの派の画像未登録作品も図録レイアウトと権利案内を維持する', async ({ page }) => {
  await page.goto('/movements/mono-ha/');

  await expect(page.getByText('作品 01')).toBeVisible();
  // もの派の代表作（関根/李）は image:null かつ imageReference あり → 全面が外部リンクのプレースホルダー。
  await expect(page.getByText('画像は引用元で確認').first()).toBeVisible();
  const sourceLink = page
    .getByRole('link', { name: /引用元で確認する（外部サイト）/ })
    .first();
  await expect(sourceLink).toBeVisible();
  await expect(sourceLink).toHaveAttribute('target', '_blank');
  await expect(sourceLink).toHaveAttribute('rel', /noopener/);
  // 作品詳細への内部導線（権利案内）も引き続き存在する。
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

test('02章の転換と継承は同じ階層・同じ強度で並列表示する', async ({ page }) => {
  await page.goto('/movements/italian-renaissance/');

  const chapter = page.locator('#relation');
  const paired = chapter.locator('[data-parallel-subsections]');
  const changed = chapter.getByRole('heading', { level: 3, name: '転換したこと' });
  const inherited = chapter.getByRole('heading', { level: 3, name: '継承したこと' });

  await expect(paired).toBeVisible();
  await expect(changed).toHaveClass(await inherited.getAttribute('class') ?? '');
  await expect(inherited.locator('..')).not.toHaveClass(/border-l|pl-6|pl-8/);
  await expect(chapter.locator('aside, blockquote')).toHaveCount(0);
});

test('詳細本文の小見出しは全章でセリフ体に統一し、UIメタ情報はサンセリフを維持する', async ({
  page,
}) => {
  await page.goto('/movements/italian-renaissance/');

  for (const title of [
    '中心となる考え',
    '社会的背景',
    '技術革新との関連',
    '主な主題',
    '転換したこと',
    '継承したこと',
    '見た目の特徴',
    '色彩・光',
    '制作制度',
    '年代の扱い',
  ]) {
    await expect(
      page.getByRole('heading', { level: 3, name: title }),
    ).toHaveAttribute('data-movement-subheading');
  }

  const typography = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('#context h2');
    const subheadings = Array.from(
      document.querySelectorAll<HTMLElement>('[data-movement-subheading]'),
    );
    const body = document.querySelector<HTMLElement>('#context .detail-body');
    const metadata = Array.from(document.querySelectorAll<HTMLElement>('dt')).find(
      (element) => element.textContent === '年代',
    );

    return {
      sectionFamily: section ? getComputedStyle(section).fontFamily : '',
      subsectionFamilies: subheadings.map(
        (heading) => getComputedStyle(heading).fontFamily,
      ),
      subsectionWeights: subheadings.map(
        (heading) => getComputedStyle(heading).fontWeight,
      ),
      bodyFamily: body ? getComputedStyle(body).fontFamily : '',
      metadataFamily: metadata ? getComputedStyle(metadata).fontFamily : '',
    };
  });

  expect(typography.subsectionFamilies.length).toBeGreaterThan(10);
  expect(
    typography.subsectionFamilies.every(
      (family) => family === typography.sectionFamily,
    ),
  ).toBe(true);
  expect(
    typography.subsectionWeights.every((weight) => Number(weight) >= 500),
  ).toBe(true);
  expect(typography.bodyFamily).not.toBe(typography.sectionFamily);
  expect(typography.metadataFamily).toBe(typography.bodyFamily);
});

test('03章は5つの具体的区分だけを表示し、事実ラベルを置かない', async ({ page }) => {
  await page.goto('/movements/rinpa/');

  const chapter = page.locator('#visual');
  for (const title of [
    '見た目の特徴',
    '構図・空間',
    '色彩・光',
    '技法',
    '媒体・素材',
  ]) {
    await expect(chapter.getByRole('heading', { level: 3, name: title })).toBeVisible();
  }
  await expect(chapter.getByRole('heading', { level: 3 })).toHaveCount(5);
  await expect(chapter.getByText('事実', { exact: true })).toHaveCount(0);
  await expect(chapter.getByText(/たらし込み/)).toHaveCount(1);
});

test('04章は導入文を直接表示し、汎用メタ見出しと重複本文を置かない', async ({ page }) => {
  await page.goto('/movements/rinpa/');

  const chapter = page.locator('#system');
  const introduction = chapter.locator('[data-chapter-introduction]');
  await expect(introduction).toHaveText(
    '邸宅・寺院・茶の湯・衣食住の工芸の中で鑑賞され、近代以降は美術館で再編された。',
  );
  await expect(chapter.getByText('事実', { exact: true })).toHaveCount(0);
  await expect(chapter.getByText('解釈', { exact: true })).toHaveCount(0);
  await expect(chapter.getByText('補足', { exact: true })).toHaveCount(0);
  await expect(chapter.getByText('詳細', { exact: true })).toHaveCount(0);
  await expect(chapter.getByText('情報', { exact: true })).toHaveCount(0);
  await expect(
    chapter.getByText(
      '邸宅・寺院・茶の湯・衣食住の工芸の中で鑑賞され、近代以降は美術館で再編された。',
      { exact: true },
    ),
  ).toHaveCount(1);
  await expect(
    chapter.getByRole('heading', { level: 3, name: '芸術家の社会的地位' }),
  ).toBeVisible();
});
