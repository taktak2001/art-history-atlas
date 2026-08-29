import { expect, type Page } from '@playwright/test';

export const LOD_LABELS = {
  core: '基本',
  standard: '充実',
  detailed: 'すべて',
} as const;

export async function openLodFab(page: Page) {
  const trigger = page.getByRole('button', { name: '表示密度を変更' });
  await expect(trigger).toBeVisible();
  if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
    await trigger.click();
  }
  await expect(page.getByRole('menu', { name: '表示密度' })).toBeVisible();
  return trigger;
}

export async function selectLod(
  page: Page,
  level: keyof typeof LOD_LABELS,
) {
  await openLodFab(page);
  await page
    .getByRole('menuitemradio', {
      name: new RegExp(`${LOD_LABELS[level]}に切り替え`),
    })
    .click();
  await expect(page.getByRole('menu', { name: '表示密度' })).toBeHidden();
}

/**
 * 関係ネットワークは情報量ではなく閲覧目的で切り替える。
 * 収録範囲は OVERVIEW=基本 / STUDY=充実 / FOCUS=すべて に対応する。
 */
export async function selectNetworkMode(
  page: Page,
  mode: 'overview' | 'study' | 'focus',
) {
  await page
    .getByRole('button', { name: new RegExp(`^${mode.toUpperCase()}`) })
    .click();
}
