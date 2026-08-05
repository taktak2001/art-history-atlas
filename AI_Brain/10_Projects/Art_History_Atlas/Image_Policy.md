# Image Policy

作品画像の権利・取得・検証方針。**推測 URL 禁止**。架空画像禁止。

## 使用可能ライセンス

- **Public Domain**（2次元作品の忠実な複製。例: 1900年以前の絵画・彩色写本）
- **CC0**
- **CC BY**（要・著作者表示。3次元/建築/現代作品の写真等）
- 利用条件で GitHub Pages 公開が明示的に許可された Open Access 画像

## 取得元（優先）

The Met Open Access / Art Institute of Chicago Open Access / Rijksmuseum Open Data / National Gallery の Public Domain / **Wikimedia Commons** / Europeana / 各国立美術館・作家財団の公式サイト。

## 禁止事項

- Google 画像検索結果の転載
- Pinterest / ブログ / SNS 画像
- 出典不明画像 / ライセンス表記が曖昧な画像
- 商用・改変・再配布条件を確認できない画像
- **架空の作品・架空のURL・推測した画像URL**

## 画像メタデータ（必須。`ImageMeta`）

作品ID・日本語タイトル・原題/英語・作者・制作年・素材技法・所蔵先・原典ページURL(`sourceUrl`)・画像URL(`fileUrl`)・画像提供元(`provider`)・ライセンス・Public Domain判定(`isPublicDomain`)・クレジット(`credit`)・確認日(`verifiedOn`)・関連ムーブメント(work.movementIds)・代替テキスト(`alt`)。

## 現行の実装方式（事実）

- **Wikimedia Commons の PD 2次元作品のみ**を収録（41点）。
- 参照は公式・安定エンドポイント: `https://commons.wikimedia.org/wiki/Special:FilePath/<ファイル名>`（表示時に `?width=` を付与、srcset で 400/640/900/1200）。原典ページは `.../wiki/File:<ファイル名>`。
- ファイル名は **WebSearch で Commons のファイルページURLを確認**（推測ではない）。
- ローカル保存は**していない**（下記制約）。`fileUrl` は Commons を hotlink。SW の `aha-images`（上限60）でキャッシュ。
- 画像読み込み失敗時は `WorkImage` の `onError` でプレースホルダーへ退避（本番で壊れ画像を出さない）。
- 20世紀の著作権保護作品・3次元/建築で帰属未確定のものは `image=null`（プレースホルダー）。

## 検証レベルの定義【重要・AIはこの語彙で状態を記述すること】

| レベル | 定義 | 現状 |
| --- | --- | --- |
| **filename-confirmed** | Commons のファイルページURL（正確なファイル名）を WebSearch で確認済み。`Special:FilePath` は公式endpointなので、ファイル名が正しければ有効なURLになる。 | 41点すべて達成 |
| **metadata-confirmed** | 作者・制作年・所蔵先・ライセンス（PD可否）を検索結果/一般知識で確認済み。 | 41点すべて達成（PDは2次元忠実複製という一般規則に基づく） |
| **license-confirmed** | Commons のファイルページでライセンステンプレート（PD-art / PD-old 等）を直接確認済み。 | **未達**（ファイルページHTMLを取得できないため。egress制約） |
| **byte-verified** | 実画像バイナリを取得し、正しい画像が返ることを確認済み。必要なら WebP/AVIF へ最適化。 | **未達**（画像ホストへ接続不可。egress制約） |

- したがって現行 41点は **filename-confirmed + metadata-confirmed** 相当。**license-confirmed / byte-verified は未達**（要確認事項）。
- 将来、egress が許可される環境では: ①各ファイルページで PD テンプレートを確認（license-confirmed）②画像を取得し WebP 化してローカル保存（byte-verified、`fileUrl` をローカルパス `/art-history-atlas/works/...` に変更、`provider`/`sourceUrl` は保持）。`validate-data.ts` はローカルパスの実在も検査する。

## 現在のサンドボックス制約（事実）

- 組織の egress ポリシーにより、`upload.wikimedia.org` / `commons.wikimedia.org` / `collectionapi.metmuseum.org` / `images.metmuseum.org` / `api.artic.edu` 等へ **CONNECT が 403 で拒否**される（`curl`・Playwright・WebFetch すべて不可）。
- インターネットに到達できるのは **WebSearch** のみ（検索バックエンド。画像バイナリは取得不可）。
- よって画像の**ダウンロード・WebP/AVIF最適化・バイト検証・ファイルページのライセンス直接確認**は本環境では実行できない。回避策は取らない（README指示）。
- 本番（GitHub Pages）では利用者のブラウザが Commons から直接画像を取得するため、hotlink 方式で表示自体は成立する見込み（実表示は実機/本番で最終確認するのが望ましい＝要確認）。

---

## 画像の利用根拠（usageBasis）と「引用」の扱い（2026-08 追加）

画像は次の4区分（`usageBasis`）で管理する。権利未確認画像を一律掲載せず、法的・編集上の根拠をデータとして区別する。

| 区分 | 用途 |
|---|---|
| `public-domain` | 保護期間満了 / CC0。全画面で使用可 |
| `licensed` | CC BY 等、許諾条件の範囲で使用可 |
| `quotation` | 著作権法上の「引用」。具体的な分析本文と一体の場合だけ、限定サーフェスで表示 |
| `unavailable` | 画像を表示せず作品情報のみ（= `image: null`） |

### 明確に否定する誤ったルール

次はいずれも**誤り**であり、これらを根拠に画像を掲載しない。

- 「教育目的・非営利だから利用可能」— ❌ 目的だけでは自由利用にならない。
- 「出典を書けば利用可能」— ❌ 出典明記は引用要件の一部にすぎない。
- 「低解像度なら利用可能」— ❌ サイズ縮小だけで引用要件は満たさない。
- 「外部埋め込み（ホットリンク）なら利用可能」— ❌ 配信方法は適法性を保証しない。

### 「引用」として成立させる条件

引用は、画像が本文の**従**、独自の批評・分析が**主**である関係が必要（公表済み著作物・公正な慣行・目的上正当な範囲・出典明記・本文との明確な区別）。したがって、以下は引用として扱わない：ホーム/Timeline/Network/Chronology のアイキャッチ、一覧カード、OGP、背景画像、Compare の単なる画像横並び、分析文を伴わない代表作品ギャラリー、出典だけ付けて具体的分析のない掲載。

### 表示してよい場所（quotation のみ）

`movement-analysis`（Movement 詳細の作品分析）/ `work-analysis`（Work 詳細の視覚分析）/ `compare-analysis`（画像を直接分析する比較）だけ。上記以外（home / timeline / chronology / network / movement-card / search / ogp / background / gallery）では表示しない。実装上は `canDisplayImageOnSurface(img, surface)`（`src/lib/image-usage.ts`）で強制し、`WorkImage` は許可サーフェスでのみ quotation を描画する。

### 引用画像の必須フィールド（`quotation`）

`sourcePageUrl / provider / creator / workTitle / workDate / accessed / quotationPurpose / quotationContext / quotationRationale / sourceCredit / isPublished / reviewStatus / reviewNote`。`quotationPurpose` は「構図の分析 / 色彩・光の分析 / 技法の比較 / ムーブメント間の視覚的差異 / 図像・主題の批評」の限定列挙のみ。「代表作品を見せるため」「分かりやすさ」「装飾」は目的として認めない。

### 審査状態と本番表示

`reviewStatus`: `pending / editorial-approved / legal-review-required / rejected`。**`editorial-approved` かつ `isPublished=true` のときだけ本番表示**（`isQuotationPublishable`）。現存作家・死後70年以内の可能性・権利者明示・提供元の再利用制限・作品全体の高視認性掲載・中心コンテンツ化・引用可否が分かれる場合は `legal-review-required` とする。

### サイズ・加工

一覧用の quotation サムネイルを作らない／ダウンロードボタンを付けない／原寸表示を標準にしない。分析に必要な視認性は確保するが、必要性・相当性を超えた高解像度配布はしない。トリミング・色調変更・文字入れ・合成は原則禁止（必要な場合も `reviewNote` に理由を記録）。

### 限界（重要）

この仕組みを入れても**適法性は自動的に保証されない**。重要作品の本番掲載前には、知的財産権に詳しい専門家によるレビューが最も確実。

---

## imageReference — 画像未収録作品の調査・審査用参照（2026-08-06 追加）

**「URLを付けること」と「画像を本番表示可能にすること」を分離**する仕組み。
`applyImageSupplements` 適用後に最終的に `image === null` となる全作品（**38点**）へ、
`Work.imageReference`（`src/lib/schema.ts` の `ImageReference`）を付与した。

- `image`（権利確認済み・本番表示可）と `imageReference`（調査・審査用URL）は**役割が別**。
  `imageReference` が存在しても本番では画像を表示しない（プレースホルダー + 外部リンク導線のみ）。
- データは `src/data/expansion/image-references.ts`。`works.ts` で
  `applyImageReferences(applyImageSupplements(workRecords))` として最後に適用。
- フィールド: `sourcePageUrl`（必須・https）/ `provider` / `imagePageUrl?` / `candidateFileUrl?`
  / `termsUrl?` / `rightsStatus` / `copyrightNotice?` / `creditLine?` / `accessed`
  / `verificationStatus` / `verificationNote`（必須）。
- `rightsStatus`: `public-domain-candidate | open-access-candidate | licensed-candidate
  | quotation-candidate | permission-required | rights-unclear`。
- `verificationStatus`: `url-verified | metadata-verified | rights-review-required | unresolved`。

### 本監査での判断

- **捏造URLなし。** 所蔵館・財団・公的機関の作品ページを最優先で WebSearch/WebFetch により調査。
  Wikipedia・SNS・販売サイト・WikiArt 等は第一 `sourcePageUrl` にしない（`validate-data.ts` で拒否）。
- `candidateFileUrl` は安定エンドポイントを特定できた **1点のみ**（藍瑛《倪瓚に倣う山水》= AIC の IIIF。
  AIC 公開 API で `is_public_domain=true`/CC0 を確認）。拡張子変更・CDN 推測・サムネ→原寸推測はしない。
- **PD候補は2点のみ**（二次元・提供元がPD/OA明示）: 藍瑛（AIC, CC0 確認済）と ミュシャ《椿姫》
  （作品自体はPDだが掲載画像は © Mucha Trust のため要レビュー）。
- 20世紀・現代美術は原則 `permission-required` / `rights-unclear` / `quotation-candidate`、
  `verificationStatus` は `rights-review-required` を維持。彫刻・建築・インスタレーション・
  パフォーマンスは撮影者の権利も別途判定（写真を自動的にPD扱いしない）。
- **PR #61 の引用審査5点**（コスース／ジャッド／ヘーヒ／白髪／関根）は `quotation-candidate`・
  `image:null` を保持し、legal-review-required 相当のまま。
- 《人の子》（個人蔵）と 《12頭の馬》（1969年の上演）は作品単独ページが存在せず `unresolved`。

### 監査レポートと再生成

- 全件表・集計: `docs/image-reference-audit.md`。
- 再生成: `npx tsx scripts/gen-image-reference-audit.ts`（実データから生成、手動更新不要）。

### 前提の更新（egress）

本環境では WebSearch に加え **WebFetch / 外部 API 取得が可能**で、museum サイトや AIC API に到達できた
（上の「サンドボックス制約」は当時の記録。画像バイナリのローカル最適化は本監査の対象外）。
