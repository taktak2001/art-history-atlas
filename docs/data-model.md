# データモデル

定義の単一ソースは `src/lib/schema.ts`（Zod）。型は `z.infer` で生成し、`scripts/validate-data.ts` と単体テストで検証する。

## エンティティ

### Movement（ムーブメント）

基本情報：`id`（slug）, `nameJa`, `nameEn`, `aliases[]`, `classification`, `era`, `dates`, `regionIds[]`, `cities[]`。

解説項目：`summary`, `coreIdea`, `socialContext`, `politicalContext?`, `religiousContext?`, `philosophy?`, `technologyContext?`, `reactionAgainst`, `inheritedFrom`, `visualTraits`, `compositionSpace`, `colorLight`, `technique`, `materials`, `subjects`, `artistStatus`, `productionSystem`, `patronage`, `marketExhibition`, `audience`, `legacy`, `contemporaryConnection`, `viewingPoints[]`。

関連：`keywords[]`, `artistIds[]`, `workIds[]`, `sourceIds[]`（最低 1）, `verification`。

### Artist（作家）

`id`, `nameJa`, `nameOriginal?`, `born|null`, `died|null`, `lifeNote?`, `regionIds[]`, `country`, `movementIds[]`, `bio`, `keyWorkIds[]`, `sourceIds[]`, `verification`。

### Work（作品）

`id`, `titleJa`, `titleOriginal?`, `creatorId?`, `creatorName`, `year`, `medium`, `collection`, `movementIds[]`, `description`, `image: ImageMeta|null`, `sourceIds[]`, `verification`。

### Relationship（関係エッジ）

`id`, `from`, `to`（ともに既存 Movement ID）, `kind`, `note`, `sourceIds[]`。ムーブメント間の関係を**独立したエッジデータ**として保持する。

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

**情報確認状態（verification）** — 確認済み / 単一資料 / 諸説あり / 要確認。

## 年代（DateRange）の表現

`{ start, end|null, peak?|null, circa, note? }`。西暦の整数、紀元前は負値（前440年＝ `-440`）。継続中は `end: null`。概算・諸説ありは `circa: true` と `note` で明示し、断定を避ける。

## 検証（validate-data.ts）

1. Zod スキーマ適合（型・必須・年代範囲・URL 形式・画像ライセンス必須）
2. 参照整合性（エッジの from/to、artist/work/source の ID 実在）
3. ID 重複
4. 出典 URL の http(s) 形式
5. 画像メタデータのライセンス・クレジット・出典 URL 必須

`npm run validate:data` で実行。単体テスト（`tests/unit/data.test.ts`）でも同等の検証を行う。
