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
