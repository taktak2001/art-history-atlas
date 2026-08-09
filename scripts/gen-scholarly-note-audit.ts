/**
 * docs/scholarly-note-audit.md を実データから生成する。
 * 使用: npx tsx scripts/gen-scholarly-note-audit.ts
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { movements } from '../src/data/movements';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'docs', 'scholarly-note-audit.md');

const md = (s: string | undefined) => (s ?? '—').replace(/\|/g, '\\|');

/** 「よくある理解 → 適切な理解」が読み取れるか（機械的な目安） */
const showsMisconception = (body: string) =>
  /理解されることがある|とは限らない|ではない|断定できない|ものではない|わけではない/.test(body);
const showsClarification = (body: string) =>
  /方が適切|として捉える|である。|呼称である|整理である|概算/.test(body);

const withNote = movements.filter((m) => m.scholarlyNote);
const dateOnly = movements.filter((m) => !m.scholarlyNote && m.dates.note);
const none = movements.filter((m) => !m.scholarlyNote && !m.dates.note);

const rows = withNote
  .map((m) => {
    const note = m.scholarlyNote!;
    return `| ${m.id} | ${md(m.nameJa)} | ${md(note.heading)} | ${md(note.body)} | ${
      note.sourceIds.join(', ') || '—'
    } | ${m.verification} | ${note.body.length} | ${
      showsMisconception(note.body) ? '✓' : '—'
    } | ${showsClarification(note.body) ? '✓' : '—'} |`;
  })
  .join('\n');

const dateRows = dateOnly
  .map((m) => `| ${m.id} | ${md(m.nameJa)} | 年代の扱い | ${md(m.dates.note)} |`)
  .join('\n');

const out = `# 研究上の留保（注意書き）の監査

> 自動生成: \`npx tsx scripts/gen-scholarly-note-audit.ts\`

「学説上の注意」という一律の見出しをやめ、内容ごとの具体的な見出しへ変更した。
本文は「よくある理解 → どこが正確でないか → どう捉えるのが適切か」が読み取れる形を目安にする。

## 集計

| 指標 | 件数 |
| --- | ---: |
| ムーブメント総数 | ${movements.length} |
| 研究上の留保（scholarlyNote）を付与 | ${withNote.length} |
| 年代の範囲説明のみ（「年代の扱い」として表示） | ${dateOnly.length} |
| 注意書きなし | ${none.length} |
| 誤解の明示あり | ${withNote.filter((m) => showsMisconception(m.scholarlyNote!.body)).length} |
| 適切な理解の明示あり | ${withNote.filter((m) => showsClarification(m.scholarlyNote!.body)).length} |
| 本文の平均文字数 | ${Math.round(
  withNote.reduce((sum, m) => sum + m.scholarlyNote!.body.length, 0) /
    Math.max(withNote.length, 1),
)} |

## 研究上の留保（見出しを具体化したもの）

| movementId | ムーブメント | 見出し | 本文 | sourceIds | verification | 字数 | 誤解 | 適切な理解 |
| --- | --- | --- | --- | --- | --- | ---: | :-: | :-: |
${rows}

## 年代の範囲説明のみ（研究上の留保ではない）

これらは「何を誤解してはいけないか」ではなく、収録年代の範囲を示す記述である。
そのため「学説上の注意」ではなく「年代の扱い」として表示する。

| movementId | ムーブメント | 見出し | 本文 |
| --- | --- | --- | --- |
${dateRows}

## 未確認事項・今後の課題

- 名称の由来（例: 印象派が当初は揶揄的な呼称だったか）は、既存の出典が明示していない項目がある。
  出典で確認できない主張は追加していない。追加出典が得られた時点で「名称について」を追記する。
- 影響関係の否定・限定（例: アルテ・ポーヴェラともの派）は、既存出典が両者を扱う範囲でのみ記述した。
- 上表で「誤解」「適切な理解」が「—」の項目は、収録範囲や年代精度の説明であり、
  誤解の明示が構造上不要なもの。誤りではないが、より良い書き方が見つかれば更新する。
`;

writeFileSync(OUT, out);
console.log(`wrote ${OUT} (${withNote.length} notes, ${dateOnly.length} date-only)`);
