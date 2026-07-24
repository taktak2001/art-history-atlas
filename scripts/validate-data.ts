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
} from '../src/lib/schema';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { movements } from '../src/data/movements';
import { artists } from '../src/data/artists';
import { works } from '../src/data/works';
import { relationships } from '../src/data/relationships';
import { sources } from '../src/data/sources';

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

console.log('▶ 画像メタデータのライセンス必須チェック');
const PD_LICENSES = ['public-domain', 'cc0'];
const fileUrlSchema = z.string().url();
for (const w of works) {
  if (w.image) {
    const img = w.image;
    if (!img.license) fail(`work ${w.id}: 画像ライセンス未指定`);
    if (!img.credit) fail(`work ${w.id}: 画像クレジット未指定`);
    if (!img.sourceUrl) fail(`work ${w.id}: 画像原典URL未指定`);
    if (!img.alt || img.alt.trim().length === 0) fail(`work ${w.id}: 画像altが空`);
    // Public Domain 判定とライセンスの整合
    if (img.isPublicDomain && !PD_LICENSES.includes(img.license)) {
      fail(`work ${w.id}: isPublicDomain=true だがライセンスが ${img.license}`);
    }
    if ((img.license === 'cc-by' || img.license === 'cc-by-sa') && img.isPublicDomain) {
      fail(`work ${w.id}: ${img.license} なのに isPublicDomain=true`);
    }
    // 原典URL・画像URLの形式（到達性は検査しない。ネットワーク不通と URL 不存在は区別する）
    if (img.sourceUrl && !fileUrlSchema.safeParse(img.sourceUrl).success)
      fail(`work ${w.id}: 画像sourceUrlの形式不正`);
    if (img.fileUrl) {
      if (img.fileUrl.startsWith('/')) {
        // ローカル画像パスの場合は public/ 配下の実在を確認
        const p = join(__dirname, '..', 'public', img.fileUrl.replace(/^\//, ''));
        if (!existsSync(p)) fail(`work ${w.id}: ローカル画像が存在しない ${img.fileUrl}`);
      } else if (!fileUrlSchema.safeParse(img.fileUrl).success) {
        fail(`work ${w.id}: 画像fileUrlの形式不正`);
      }
    }
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

console.log('');
if (errors > 0) {
  console.error(`✗ 検証失敗: ${errors}件のエラー`);
  process.exit(1);
} else {
  console.log(
    `✓ 全データ検証成功 — ムーブメント${movements.length} / 作家${artists.length} / 作品${works.length} / 関係${relationships.length} / 出典${sources.length}`,
  );
}
