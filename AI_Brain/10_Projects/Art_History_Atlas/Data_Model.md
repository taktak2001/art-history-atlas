# Data Model

単一ソース: `src/lib/schema.ts`（Zod）。型は `z.infer` で生成。データは `src/data/*.ts`。検証は `scripts/validate-data.ts`（`npm run validate:data`）。

## 列挙型

- **ClassificationKind**（分類、階層を混在させない）: `period`(時代区分) / `style`(様式) / `movement`(芸術運動) / `school`(流派) / `collective`(芸術家集団) / `tendency`(制作傾向) / `method-theory`(方法論・理論)。
- **RegionId**（地域, 独立軸）: mediterranean / italy / netherlands / france / germany / britain / spain / america / japan / east-asia / pan-european / global / other。
- **EraId**（時代, マトリクス横軸）: prehistoric-ancient / medieval / renaissance / baroque-rococo / nineteenth / modern / postwar / contemporary。
- **VerificationStatus**: `verified`(複数資料で確認) / `single-source`(単一資料) / `contested`(諸説あり=見解の一つ) / `needs-review`(要確認)。UIは色+記号+テキストで表示（色のみに依存しない）。
- **SourceKind**: museum / university / encyclopedia / book / foundation / archive。**SourceReliability**: high / medium。
- **ImageLicense**: `public-domain` / `cc0` / `cc-by` / `cc-by-sa`。
- **RelationKind**: succession(継承) / reaction(反発) / influence(影響) / contemporary(同時代) / regional-variant(地域的展開) / theoretical(理論的関連) / technical(技術的関連) / revival(後世に再評価) / shared-idea(共通する思想)。

## Movement（ムーブメント）

- 識別: `id`(slug) / `nameJa` / `nameEn` / `aliases[]` / `classification` / `era` / `dates` / `regionIds[]` / `cities[]`
- `dates`(DateRange): `{ start:number(西暦, 紀元前は負), end:number|null(継続中はnull), peak?:[number,number]|null, circa:boolean(概算/諸説), note?:string }`
- 解説: `summary`, `coreIdea`(中心思想), `socialContext`, `politicalContext?`, `religiousContext?`, `philosophy?`, `technologyContext?`, `reactionAgainst`(前時代への反発), `inheritedFrom`(継承), `visualTraits`, `compositionSpace`, `colorLight`, `technique`, `materials`, `subjects`, `artistStatus`, `productionSystem`, `patronage`, `marketExhibition`, `audience`, `legacy`(後世への影響), `contemporaryConnection`(現代美術との接続), `viewingPoints[]`(鑑賞ポイント)
- 関連: `keywords[]`, `artistIds[]`, `workIds[]`(表示は使わず movementIds から導出), `sourceIds[]`(最低1), `verification`
- 注意: `artistsOf/worksOf` は作品・作家側の `movementIds` から導出する（movement 側の配列は参照整合性のためだけに残置）。

## Artist（作家）

`id / nameJa / nameOriginal? / born:number|null / died:number|null / lifeNote? / regionIds[] / country / movementIds[] / bio / keyWorkIds[] / sourceIds[] / verification`

## Work（作品）

`id / titleJa / titleOriginal? / creatorId?(slug, 実在作家) / creatorName(必須) / year(表記のまま) / medium / collection / movementIds[](最低1) / description / image: ImageMeta|null / sourceIds[](最低1) / verification`

- `creatorId` は任意。設定する場合は実在作家IDでなければならない（未登録の作家は creatorName のみ）。
- `image=null` はプレースホルダー表示（架空画像は使わない）。

## ImageMeta（画像メタデータ）

`title / creator / date / provider / sourceUrl(原典ページURL) / fileUrl?(直接画像URL=Special:FilePath) / license(ImageLicense) / credit / isPublicDomain:boolean / alt(必須, 代替テキスト) / verifiedOn(YYYY-MM-DD) / verificationNote?`

- **Zod refine で整合を強制**: `isPublicDomain=true` → license ∈ {public-domain, cc0}。license ∈ {cc-by, cc-by-sa} → isPublicDomain=false。
- 現行の全画像は `provider='Wikimedia Commons'`, `license='public-domain'`, `sourceUrl=.../wiki/File:<name>`, `fileUrl=.../Special:FilePath/<name>`（表示時に `?width=` を付与）。
- 詳細な権利/検証レベルは `Image_Policy.md`。

## Relationship（関係エッジ）

`id / from(既存movement) / to(既存movement) / kind(RelationKind) / note(短い説明) / sourceIds[]`

- 有向エッジとして独立管理。自己参照不可。`from/to` は実在ムーブメント必須。

## Source（出典）

`id / title / publisher(発行主体) / url / accessed(YYYY-MM-DD, 参照日) / kind(SourceKind) / reliability(high|medium) / supports(どの記述を支えるか)`

- 一般ブログ・まとめサイト単独を根拠にしない。優先: 美術館 > 大学/研究機関 > 財団/アーカイブ > 専門出版/事典 > Smarthistory等教育。

## validate-data.ts が検査する項目

1. Zod スキーマ（型・必須・年代範囲・URL形式・ImageMeta refine）
2. ID重複（全エンティティ）
3. 参照整合性（関係の from/to、work.creatorId/movementIds/sourceIds、artist.movementIds/keyWorkIds/sourceIds、movement.*）
4. 出典URLが http(s) 形式
5. 画像: license/credit/sourceUrl/alt 必須、PD判定とライセンスの整合、fileUrl形式（ローカルパス `/...` の場合は public/ 実在確認）
6. **各ムーブメントに2作品以上**（works の movementIds から集計）
7. 作品タイトルの重複、同一画像fileUrlの重複
- **注意**: URL の到達性は検査しない（egress 制約）。ネットワーク不通と URL 不存在を区別し、到達不能を理由に情報を自動削除しない。

## 現在の件数（2026-07-24, 作業ブランチ）

movements 30 / artists 64 / works 75（画像41, プレースホルダー34） / relationships 46 / sources 58。

---

## ImageMeta の利用根拠拡張（2026-08）

`ImageMeta` に `usageBasis`（`public-domain | licensed | quotation | unavailable`）を追加。省略時は `resolveUsageBasis()` が `isPublicDomain`/`license` から `public-domain`/`licensed` を導出する（既存の権利確認済み画像は無移行で安全側に解決）。`license` と `isPublicDomain` は任意化し、`quotation` の場合は付与しない。`quotation` 用に `QuotationMeta`（必須13フィールド）、`QuotationPurpose`（限定列挙）、`ReviewStatus` を追加。整合性は `ImageMeta.superRefine` で強制（quotation は license/isPublicDomain と排他、PD は license 必須かつ PD/cc0、licensed を PD 登録不可 等）。表示可否は `src/lib/image-usage.ts` の `canDisplayImageOnSurface` / `isQuotationPublishable`。データ検証（`scripts/validate-data.ts`）に引用要件チェックを追加。
