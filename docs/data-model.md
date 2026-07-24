# データモデル

定義の単一ソースは `src/lib/schema.ts`（Zod）。型は `z.infer` で生成し、`scripts/validate-data.ts` と単体テストで検証する。

## エンティティ

### Movement（ムーブメント）

基本情報：`id`（slug）, `nameJa`, `nameEn`, `aliases[]`, `classification`, `era`, `dates`, `regionIds[]`, `cities[]`。

表示・階層：`visibilityLevel`, `parentMovementId?`, `groupId?`, `isRepresentative?`, `displayOrder?`, `shortLabel?`。

- `visibilityLevel`: `core | standard | detailed`。選択レベルまでを累積表示する。
- `parentMovementId`: 分類上の直接の親。影響・継承・反発を意味しない。
- `groupId`: 検索・縮約用の非因果グループ。定義と代表IDは `MOVEMENT_GROUPS` に置く。
- `isRepresentative`: 親子内で代表表示に使う項目を明示する補助フラグ。
- `displayOrder`: 同一スコープ内の表示順。未指定時は年代と名称で安定ソートする。
- `shortLabel`: 通史など高密度表示用の短縮名（24文字以内）。正式名は常に `nameJa`。

解説項目：`summary`, `coreIdea`, `socialContext`, `politicalContext?`, `religiousContext?`, `philosophy?`, `technologyContext?`, `reactionAgainst`, `inheritedFrom`, `visualTraits`, `compositionSpace`, `colorLight`, `technique`, `materials`, `subjects`, `artistStatus`, `productionSystem`, `patronage`, `marketExhibition`, `audience`, `legacy`, `contemporaryConnection`, `viewingPoints[]`。

関連：`keywords[]`, `artistIds[]`, `workIds[]`, `sourceIds[]`（最低 1）, `verification`。

### Artist（作家）

`id`, `nameJa`, `nameOriginal?`, `born|null`, `died|null`, `lifeNote?`, `regionIds[]`, `country`, `movementIds[]`, `bio`, `keyWorkIds[]`, `sourceIds[]`, `verification`。

### Work（作品）

`id`, `titleJa`, `titleOriginal?`, `creatorId?`, `creatorName`, `year`, `medium`, `collection`, `movementIds[]`, `description`, `image: ImageMeta|null`, `sourceIds[]`, `verification`。

### Relationship（関係エッジ）

`id`, `from`, `to`（ともに既存 Movement ID）, `kind`, `note`, `sourceIds[]`。ムーブメント間の関係を**独立したエッジデータ**として保持する。

- `from`（UI上の「起点」）: 影響・継承・展開が始まる側。
- `to`（UI上の「終点」「到達先」）: 影響・継承・展開を受けた側。
- 有向関係は `from → to` として描画する。同時代・共通する思想は方向を断定しないため矢印を付けない。
- 反発もデータ方向は「反発された側 → 反発した側」。日本語表示では主語を入れ替え、「`to` は `from` に反発した」とする。
- `parentMovementId` と `groupId` は表示階層であり、Relationship の因果を推測・生成する根拠にしない。

### Source（出典）

`id`, `title`, `publisher`, `url`, `accessed`(YYYY-MM-DD), `kind`, `reliability`, `supports`。

### ImageMeta（画像メタデータ）

`title`, `creator`, `date`, `provider`, `sourceUrl`, `fileUrl?`, `license`, `credit`, `isPublicDomain`, `verifiedOn`。画像を付与する場合は全フィールド必須。

## 列挙型と分類基準

**分類（classification）** — 異なる概念を同じ階層に混在させない：
`period`（時代区分）/ `style`（様式）/ `movement`（芸術運動）/ `school`（流派）/ `collective`（芸術家集団）/ `tendency`（制作傾向）/ `method-theory`（方法論・理論）。

- 例：バロック＝`style`、印象派＝`movement`、具体美術協会＝`collective`、コンセプチュアル・アート＝`method-theory`、ポスト印象派／もの派／ライト&スペース＝`tendency`。

**時代（era）** — マトリクスの横軸：先史・古代 / 中世 / ルネサンス / 17〜18世紀 / 19世紀 / モダニズム / 戦後美術 / 現代美術。

**地域（regionIds）** — 地中海・古代 / イタリア / フランドル・オランダ / フランス / ドイツ・中央ヨーロッパ / イギリス / スペイン / アメリカ / 日本 / 東アジア / 汎ヨーロッパ / 国際的 / その他。西洋を唯一の発展経路として扱わないための独立軸。

**関係タイプ（kind）** — 継承 / 反発 / 影響 / 同時代 / 地域的展開 / 理論的関連 / 技術的関連 / 後世に再評価 / 共通する思想。

- **継承**: 前の運動の中心的な方法・問題意識・形式を、次の運動が引き継ぎ発展させた関係。比較的近い時代の系譜で、中心的要素に関わり、その関係を除くと後続運動の成立説明が大きく崩れるもの。
- **影響**: 特定の技法・思想・作品・作家が別の運動の一部に作用した関係。時代・地域が離れても成立し、直接の後継関係を必要としない。
- 判定補助: 「成立説明に不可欠な構造」なら継承、「成立の一因だが直接の後継ではない」なら影響を第一候補とする。

**情報確認状態（verification）** — 確認済み / 単一資料 / 諸説あり / 要確認。

**表示する範囲（visibilityLevel）** — 基本 `core` / 充実 `standard` / すべて `detailed`。現在の30件は `24 / 30 / 30`。`detailed` は「専用項目が必ず存在する」という意味ではなく、収録済み全件を表示する上限レベル。

## 年代（DateRange）の表現

`{ start, end|null, peak?|null, circa, note? }`。西暦の整数、紀元前は負値（前440年＝ `-440`）。継続中は `end: null`。概算・諸説ありは `circa: true` と `note` で明示し、断定を避ける。

## 検証（validate-data.ts）

1. Zod スキーマ適合（型・必須・年代範囲・URL 形式・画像ライセンス必須）
2. 参照整合性（エッジの from/to、artist/work/source の ID 実在）
3. ID 重複
4. 出典 URL の http(s) 形式
5. 画像メタデータのライセンス・クレジット・出典 URL 必須
6. `parentMovementId` の実在・自己参照・循環参照・LOD順序
7. `groupId` の定義、代表項目の実在と所属、`displayOrder` の同一スコープ重複
8. `shortLabel` の長さと、LODの累積件数（core 20件以上、standard ≥ core、detailed = 全件）

`npm run validate:data` で実行。単体テスト（`tests/unit/data.test.ts`）でも同等の検証を行う。
