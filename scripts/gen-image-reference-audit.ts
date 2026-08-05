/**
 * docs/image-reference-audit.md を実データから生成する。
 *
 * 使用: npx tsx scripts/gen-image-reference-audit.ts
 * （applyImageSupplements + applyImageReferences 適用後の works を基準に集計する）
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { works } from '../src/data/works';
import type { ImageReference } from '../src/lib/schema';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'docs', 'image-reference-audit.md');

const nulls = works.filter((w) => w.image === null);
const imaged = works.filter((w) => w.image !== null);
const withRef = nulls.filter((w) => w.imageReference);
const refs = withRef
  .map((w) => ({ id: w.id, w, ref: w.imageReference as ImageReference }))
  .sort((a, b) => a.id.localeCompare(b.id));

const countRights = (r: string) =>
  refs.filter((x) => x.ref.rightsStatus === r).length;
const countVerify = (v: string) =>
  refs.filter((x) => x.ref.verificationStatus === v).length;

const withOfficialWorkPage = refs.filter(
  (x) => x.ref.verificationStatus !== 'unresolved',
).length;
const withFileUrl = refs.filter((x) => x.ref.candidateFileUrl).length;
const withTerms = refs.filter((x) => x.ref.termsUrl).length;
const unresolvedList = refs.filter(
  (x) => x.ref.verificationStatus === 'unresolved',
);
const noUrl = nulls.filter((w) => !w.imageReference);

const md = (s: string | undefined) =>
  (s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const link = (u: string | undefined) => (u ? `[link](${u})` : '—');

const rows = refs
  .map(({ id, w, ref }) =>
    [
      id,
      md(w.titleJa),
      md(w.creatorName),
      'null',
      link(ref.sourcePageUrl),
      link(ref.imagePageUrl),
      link(ref.candidateFileUrl),
      md(ref.provider),
      ref.rightsStatus,
      link(ref.termsUrl),
      ref.verificationStatus,
      md(
        ref.verificationStatus === 'unresolved'
          ? '作品単独/安定画像ページ未確認・要追加調査'
          : ref.rightsStatus === 'public-domain-candidate'
            ? 'PD候補（本番表示は別途レビュー）'
            : ref.rightsStatus === 'quotation-candidate'
              ? '引用審査中（PR #61）・本番未表示'
              : '本番表示前に権利レビュー必須',
      ),
    ].join(' | '),
  )
  .map((r) => `| ${r} |`)
  .join('\n');

const out = `# 画像参照（imageReference）全件監査

> 自動生成: \`npx tsx scripts/gen-image-reference-audit.ts\`
> 基準: \`applyImageSupplements\` → \`applyImageReferences\` 適用後の最終 \`works\`。

本監査は「URLを付けること」と「画像を本番表示可能にすること」を**分離**する。
ここに列挙した作品はすべて \`image === null\` のままであり、\`imageReference\` は
調査・審査用のメタデータである。URLが付いていることは本番表示の根拠にならない。

## 集計

| 指標 | 件数 |
| --- | ---: |
| 総作品数 | ${works.length} |
| 最終的に画像あり | ${imaged.length} |
| 最終的に画像なし（監査対象） | ${nulls.length} |
| URL追加済み（imageReference あり） | ${withRef.length} |
| 公式作品ページあり（unresolved 以外） | ${withOfficialWorkPage} |
| 直接画像URL候補あり（candidateFileUrl） | ${withFileUrl} |
| 利用条件URLあり（termsUrl） | ${withTerms} |
| PD/Open Access 候補 | ${countRights('public-domain-candidate') + countRights('open-access-candidate')} |
| 引用候補（quotation-candidate） | ${countRights('quotation-candidate')} |
| 許諾必要（permission-required） | ${countRights('permission-required')} |
| 権利不明（rights-unclear） | ${countRights('rights-unclear')} |
| URLを発見できなかった件数 | ${noUrl.length} |

### verificationStatus 内訳

| 状態 | 件数 |
| --- | ---: |
| url-verified | ${countVerify('url-verified')} |
| metadata-verified | ${countVerify('metadata-verified')} |
| rights-review-required | ${countVerify('rights-review-required')} |
| unresolved | ${countVerify('unresolved')} |

## 未解決事項

${
  unresolvedList.length === 0
    ? '- なし'
    : unresolvedList
        .map(
          ({ id, w, ref }) =>
            `- **${w.titleJa}**（${id}）: ${md(ref.verificationNote)}`,
        )
        .join('\n')
}

${
  noUrl.length === 0
    ? 'すべての画像未収録作品に imageReference を付与済み（URLを発見できなかった作品は 0 件）。'
    : `URL未発見: ${noUrl.map((w) => w.id).join(', ')}`
}

## 全件一覧

| workId | 作品名 | 作者 | 現在のimage | sourcePageUrl | imagePageUrl | fileUrl候補 | provider | rightsStatus | termsUrl | verificationStatus | 未解決事項/備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## 方針メモ

- 20世紀・現代美術は原則 \`permission-required\` / \`rights-unclear\` / \`quotation-candidate\` とし、
  \`verificationStatus\` は \`rights-review-required\` を維持する。
- 彫刻・建築・インスタレーション・パフォーマンスは、作品著作権に加えて撮影者の権利を別途判定する
  （写真を自動的にPD扱いしない）。
- \`public-domain-candidate\` は忠実な二次元複製かつ提供元がPD/Open Accessを明示している場合に限る。
  現状の該当は AIC（藍瑛、CC0確認済み）と ミュシャ（作品自体はPD／掲載画像は © Mucha Trust のため要レビュー）。
- PR #61 の引用審査5点（コスース／ジャッド／ヘーヒ／白髪／関根）は \`quotation-candidate\` を保持し、
  \`image\` は \`null\` のまま。本番表示は編集・法務レビュー通過が前提。
`;

writeFileSync(OUT, out);
console.log(`wrote ${OUT} (${refs.length} rows)`);
