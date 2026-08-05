/**
 * データ検証スクリプト（ビルド前に実行）。
 *
 * 検証内容:
 *  1. Zodスキーマ（型・必須フィールド・年代範囲・URL形式・画像ライセンス必須）
 *  2. 参照整合性（関係エッジ・作家・作品・出典のIDが実在するか）
 *  3. ID重複
 *  4. 出典URLの形式
 *
 * 使用: npm run validate:data
 */
import { z } from 'zod';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Movement,
  Artist,
  Work,
  Relationship,
  Source,
  resolveUsageBasis,
} from '../src/lib/schema';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { movements } from '../src/data/movements';
import { artists } from '../src/data/artists';
import { works } from '../src/data/works';
import { relationships } from '../src/data/relationships';
import { sources } from '../src/data/sources';
import {
  LOD_ORDER,
  MOVEMENT_GROUPS,
  filterMovementsByLod,
  hasMovementHierarchyCycle,
} from '../src/lib/movement-hierarchy';
import { auditMovementContentTaxonomy } from '../src/lib/movement-content-taxonomy';

let errors = 0;
const fail = (msg: string) => {
  errors += 1;
  console.error(`  ✗ ${msg}`);
};

const validateArray = <T>(name: string, schema: z.ZodType<T>, items: unknown[]) => {
  const arrSchema = z.array(schema);
  const result = arrSchema.safeParse(items);
  if (!result.success) {
    for (const issue of result.error.issues) {
      fail(`${name}[${issue.path.join('.')}]: ${issue.message}`);
    }
  } else {
    console.log(`  ✓ ${name}: ${items.length}件がスキーマに適合`);
  }
};

const checkDuplicateIds = (name: string, ids: string[]) => {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(`${name}: ID重複 "${id}"`);
    seen.add(id);
  }
};

console.log('▶ スキーマ検証');
validateArray('sources', Source, sources);
validateArray('movements', Movement, movements);
validateArray('artists', Artist, artists);
validateArray('works', Work, works);
validateArray('relationships', Relationship, relationships);

console.log('▶ ID重複');
checkDuplicateIds('movements', movements.map((m) => m.id));
checkDuplicateIds('artists', artists.map((a) => a.id));
checkDuplicateIds('works', works.map((w) => w.id));
checkDuplicateIds('relationships', relationships.map((r) => r.id));
checkDuplicateIds('sources', sources.map((s) => s.id));

const movementIds = new Set(movements.map((m) => m.id));
const artistIds = new Set(artists.map((a) => a.id));
const workIds = new Set(works.map((w) => w.id));
const sourceIds = new Set(sources.map((s) => s.id));

console.log('▶ 参照整合性');
// 関係エッジは実在するノードを参照するか
for (const r of relationships) {
  if (!movementIds.has(r.from)) fail(`relationship ${r.id}: from "${r.from}" は存在しないムーブメント`);
  if (!movementIds.has(r.to)) fail(`relationship ${r.id}: to "${r.to}" は存在しないムーブメント`);
  if (r.from === r.to) fail(`relationship ${r.id}: 自己参照は不可`);
  for (const s of r.sourceIds) if (!sourceIds.has(s)) fail(`relationship ${r.id}: 出典 "${s}" が存在しない`);
}
// ムーブメントの参照
for (const m of movements) {
  for (const a of m.artistIds) if (!artistIds.has(a)) fail(`movement ${m.id}: 作家 "${a}" が存在しない`);
  for (const w of m.workIds) if (!workIds.has(w)) fail(`movement ${m.id}: 作品 "${w}" が存在しない`);
  for (const s of m.sourceIds) if (!sourceIds.has(s)) fail(`movement ${m.id}: 出典 "${s}" が存在しない`);
}

console.log('▶ Movement LOD・階層');
const groupIds = new Set(MOVEMENT_GROUPS.map((group) => group.id));
const displayOrderScopes = new Map<string, Set<number>>();
for (const m of movements) {
  if (m.parentMovementId) {
    const parent = movements.find((candidate) => candidate.id === m.parentMovementId);
    if (!parent) {
      fail(`movement ${m.id}: parentMovementId "${m.parentMovementId}" が存在しない`);
    } else {
      if (m.parentMovementId === m.id) {
        fail(`movement ${m.id}: parentMovementId の自己参照は不可`);
      }
      if (LOD_ORDER[m.visibilityLevel] < LOD_ORDER[parent.visibilityLevel]) {
        fail(
          `movement ${m.id}: 子のLOD ${m.visibilityLevel} が親 ${parent.id} (${parent.visibilityLevel}) より低密度`,
        );
      }
    }
  }
  if (m.groupId) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.groupId)) {
      fail(`movement ${m.id}: groupId "${m.groupId}" の形式が不正`);
    }
    if (!groupIds.has(m.groupId)) {
      fail(`movement ${m.id}: groupId "${m.groupId}" が未定義`);
    }
  }
  if (m.shortLabel && m.shortLabel.length > 24) {
    fail(`movement ${m.id}: shortLabel が24文字を超える`);
  }
  if (m.displayOrder !== undefined) {
    const scope = m.parentMovementId ?? m.groupId ?? '__root__';
    const used = displayOrderScopes.get(scope) ?? new Set<number>();
    if (used.has(m.displayOrder)) {
      fail(`movement ${m.id}: 表示スコープ "${scope}" で displayOrder ${m.displayOrder} が重複`);
    }
    used.add(m.displayOrder);
    displayOrderScopes.set(scope, used);
  }
}
if (hasMovementHierarchyCycle(movements)) {
  fail('movements: parentMovementId に循環参照がある');
}
for (const group of MOVEMENT_GROUPS) {
  const representative = movements.find(
    (movement) => movement.id === group.representativeMovementId,
  );
  if (!representative) {
    fail(`group ${group.id}: 代表ムーブメント "${group.representativeMovementId}" が存在しない`);
  } else if (representative.groupId !== group.id) {
    fail(`group ${group.id}: 代表ムーブメントが同じgroupIdを持たない`);
  } else if (!representative.isRepresentative) {
    fail(`group ${group.id}: 代表ムーブメントに isRepresentative=true がない`);
  }
}
const coreCount = filterMovementsByLod(movements, 'core').length;
const standardCount = filterMovementsByLod(movements, 'standard').length;
const detailedCount = filterMovementsByLod(movements, 'detailed').length;
if (coreCount < 20) fail(`movements: coreが${coreCount}件（20件未満）`);
if (standardCount < coreCount) fail('movements: standard件数がcore件数を下回る');
if (detailedCount !== movements.length) {
  fail(`movements: detailed ${detailedCount}件が全件 ${movements.length}件と一致しない`);
}
console.log(`  ✓ LOD件数: core ${coreCount} / standard ${standardCount} / detailed ${detailedCount}`);
const contentTaxonomyIssues = auditMovementContentTaxonomy(movements);
for (const issue of contentTaxonomyIssues) {
  fail(
    `movement ${issue.movementId}: ${issue.field} に分類外の語「${issue.term}」がある`,
  );
}
console.log(`  ✓ 詳細ページ情報分類: ${movements.length}件`);
// 作家の参照
for (const a of artists) {
  for (const m of a.movementIds) if (!movementIds.has(m)) fail(`artist ${a.id}: ムーブメント "${m}" が存在しない`);
  for (const w of a.keyWorkIds) if (!workIds.has(w)) fail(`artist ${a.id}: 作品 "${w}" が存在しない`);
  for (const s of a.sourceIds) if (!sourceIds.has(s)) fail(`artist ${a.id}: 出典 "${s}" が存在しない`);
}
// 作品の参照
for (const w of works) {
  if (w.creatorId && !artistIds.has(w.creatorId)) fail(`work ${w.id}: 制作者 "${w.creatorId}" が存在しない`);
  for (const m of w.movementIds) if (!movementIds.has(m)) fail(`work ${w.id}: ムーブメント "${m}" が存在しない`);
  for (const s of w.sourceIds) if (!sourceIds.has(s)) fail(`work ${w.id}: 出典 "${s}" が存在しない`);
}

console.log('▶ 出典URLの形式');
const urlSchema = z.string().url();
for (const s of sources) {
  if (!urlSchema.safeParse(s.url).success) fail(`source ${s.id}: URL不正 "${s.url}"`);
  if (!/^https?:\/\//.test(s.url)) fail(`source ${s.id}: httpスキームでない`);
}

console.log('▶ 画像メタデータ（利用根拠・引用要件）チェック');
const PD_LICENSES = ['public-domain', 'cc0'];
const fileUrlSchema = z.string().url();
for (const w of works) {
  if (!w.image) continue;
  const img = w.image;
  const basis = resolveUsageBasis(img);

  // 共通（識別情報・URL形式。到達性は検査しない）
  if (!img.credit) fail(`work ${w.id}: 画像クレジット未指定`);
  if (!img.sourceUrl) fail(`work ${w.id}: 画像原典URL未指定`);
  if (!img.alt || img.alt.trim().length === 0) fail(`work ${w.id}: 画像altが空`);
  if (img.sourceUrl && !fileUrlSchema.safeParse(img.sourceUrl).success)
    fail(`work ${w.id}: 画像sourceUrlの形式不正`);
  if (img.fileUrl) {
    if (img.fileUrl.startsWith('/')) {
      const p = join(__dirname, '..', 'public', img.fileUrl.replace(/^\//, ''));
      if (!existsSync(p)) fail(`work ${w.id}: ローカル画像が存在しない ${img.fileUrl}`);
    } else if (!fileUrlSchema.safeParse(img.fileUrl).success) {
      fail(`work ${w.id}: 画像fileUrlの形式不正`);
    }
  }

  if (basis === 'public-domain' || basis === 'licensed') {
    if (!img.license) fail(`work ${w.id}: ${basis}画像に license 未指定`);
    if (img.quotation) fail(`work ${w.id}: 非quotation画像に quotation メタデータ`);
    if (img.isPublicDomain && img.license && !PD_LICENSES.includes(img.license)) {
      fail(`work ${w.id}: isPublicDomain=true だがライセンスが ${img.license}`);
    }
    if ((img.license === 'cc-by' || img.license === 'cc-by-sa') && img.isPublicDomain) {
      fail(`work ${w.id}: ${img.license} なのに isPublicDomain=true（未確認画像を public-domain 登録不可）`);
    }
  } else if (basis === 'quotation') {
    const q = img.quotation;
    if (!q) {
      fail(`work ${w.id}: quotation画像に quotation メタデータが無い`);
      continue;
    }
    if (img.license !== undefined) fail(`work ${w.id}: quotation と license を同時指定できない`);
    if (img.isPublicDomain === true) fail(`work ${w.id}: public-domain と quotation を同時指定できない`);
    if (!q.quotationPurpose) fail(`work ${w.id}: quotationに引用目的が無い`);
    if (!q.quotationContext) fail(`work ${w.id}: quotationに分析セクションの紐付けが無い`);
    if (!q.quotationRationale) fail(`work ${w.id}: quotationに必要性の根拠が無い`);
    if (!q.sourcePageUrl || !fileUrlSchema.safeParse(q.sourcePageUrl).success) {
      fail(`work ${w.id}: quotationの原典URLが無い/不正`);
    }
    if (!q.reviewNote) fail(`work ${w.id}: quotationに審査メモが無い`);
    // 本番表示（isPublished=true）は editorial-approved のときだけ許す
    if (q.isPublished && q.reviewStatus !== 'editorial-approved') {
      fail(`work ${w.id}: quotationが reviewStatus=${q.reviewStatus} のまま本番表示（isPublished=true）`);
    }
  } else {
    // unavailable: 画像オブジェクトを持つべきでない（image:null を使う）
    fail(`work ${w.id}: usageBasis=unavailable の画像は image:null で表現する`);
  }
}

console.log('▶ 各ムーブメントに2作品以上あるか');
for (const m of movements) {
  const count = works.filter((w) => w.movementIds.includes(m.id)).length;
  if (count < 2) fail(`movement ${m.id}: 作品が${count}件（2件未満）`);
}

console.log('▶ 作品タイトルの重複');
{
  const titles = works.map((w) => w.titleJa);
  const seen = new Set<string>();
  for (const t of titles) {
    if (seen.has(t)) fail(`作品タイトル重複: "${t}"`);
    seen.add(t);
  }
}

console.log('▶ 同一画像URLの重複');
{
  const urls = works.filter((w) => w.image?.fileUrl).map((w) => w.image!.fileUrl!);
  const seen = new Set<string>();
  for (const u of urls) {
    if (seen.has(u)) fail(`画像fileUrl重複: ${u}`);
    seen.add(u);
  }
}

console.log('▶ imageReference（画像未収録作品の調査・審査用参照）チェック');
{
  // 第一出典に用いてはならないホスト（Wikipedia/SNS/販売/画像収集）。
  const disallowedSourceHosts = [
    'wikipedia.org',
    'pinterest.',
    'instagram.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'tumblr.com',
    'flickr.com',
    'etsy.com',
    'amazon.',
    'ebay.',
    '1stdibs.com',
    'artsy.net',
    'wikiart.org',
  ];
  const hostOf = (u: string) => {
    try {
      return new URL(u).host.toLowerCase();
    } catch {
      return '';
    }
  };

  const refSourceUrls: string[] = [];

  for (const w of works) {
    const ref = w.imageReference;

    // image が null の作品は imageReference（または明示的な未解決記録）を持つべき。
    if (w.image === null && !ref) {
      fail(`work ${w.id}: image が null だが imageReference が無い`);
      continue;
    }
    if (!ref) continue;

    // imageReference は未収録作品専用（image があってはならない）。
    if (w.image !== null) {
      fail(`work ${w.id}: image があるのに imageReference を持っている`);
    }

    // URL は https かつ空白なし（スキーマでも担保するが二重に確認）。
    const urls: Array<[string, string | undefined]> = [
      ['sourcePageUrl', ref.sourcePageUrl],
      ['imagePageUrl', ref.imagePageUrl],
      ['candidateFileUrl', ref.candidateFileUrl],
      ['termsUrl', ref.termsUrl],
    ];
    for (const [field, url] of urls) {
      if (!url) continue;
      if (!url.startsWith('https://')) fail(`work ${w.id}: ${field} が https でない`);
      if (/\s/.test(url)) fail(`work ${w.id}: ${field} に空白が含まれる`);
    }

    // sourcePageUrl は必須（candidateFileUrl だけで sourcePageUrl 無しは禁止）。
    if (!ref.sourcePageUrl) {
      fail(`work ${w.id}: imageReference に sourcePageUrl が無い`);
    } else {
      const host = hostOf(ref.sourcePageUrl);
      if (disallowedSourceHosts.some((bad) => host.includes(bad))) {
        fail(`work ${w.id}: sourcePageUrl に第一出典として不適切なホスト(${host})を使用`);
      }
      refSourceUrls.push(ref.sourcePageUrl);
    }

    // PD/Open Access 候補は判定根拠（note）が必須。
    if (
      (ref.rightsStatus === 'public-domain-candidate' ||
        ref.rightsStatus === 'open-access-candidate') &&
      ref.verificationNote.trim().length === 0
    ) {
      fail(`work ${w.id}: ${ref.rightsStatus} には判定根拠(verificationNote)が必須`);
    }

    // quotation-candidate / rights-review-required は本番画像へ昇格させない
    //（＝ image は null のまま）。上の image!==null チェックで担保済みだが明示。
    if (
      (ref.rightsStatus === 'quotation-candidate' ||
        ref.verificationStatus === 'rights-review-required') &&
      w.image !== null
    ) {
      fail(`work ${w.id}: 権利レビュー中/引用候補の参照が本番画像に昇格している`);
    }
  }

  // 同一 sourcePageUrl の誤った大量流用を検出（3件以上の重複は要確認）。
  const counts = new Map<string, number>();
  for (const u of refSourceUrls) counts.set(u, (counts.get(u) ?? 0) + 1);
  for (const [u, c] of counts) {
    if (c >= 3) fail(`sourcePageUrl の過剰な使い回し(${c}件): ${u}`);
  }
  console.log(`  ✓ imageReference: ${refSourceUrls.length}件を検証`);
}

console.log('');
if (errors > 0) {
  console.error(`✗ 検証失敗: ${errors}件のエラー`);
  process.exit(1);
} else {
  console.log(
    `✓ 全データ検証成功 — ムーブメント${movements.length} / 作家${artists.length} / 作品${works.length} / 関係${relationships.length} / 出典${sources.length}`,
  );
}
