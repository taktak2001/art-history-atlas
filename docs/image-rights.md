# 画像の権利処理

## 基本方針

作品画像は、**著作権・ライセンス上、安全に利用できるパブリックドメイン／オープンアクセス画像のみ**を掲載する。出所不明・権利未確認の画像は一切使用しない。画像が利用できない場合は、**架空画像を用いず**、作品情報を持つプレースホルダー（`WorkImage` コンポーネント）を表示する。

## 利用可能な候補（出所）

- Wikimedia Commons（パブリックドメイン／CC）
- The Met Open Access（CC0）
- Art Institute of Chicago Open Access（CC0）
- Rijksmuseum Open Data
- Europeana
- 各美術館の明示的な Open Access 画像

## 画像ごとに保存するメタデータ（`ImageMeta`）

| フィールド | 内容 |
| --- | --- |
| `title` | 作品名 |
| `creator` | 作者 |
| `date` | 制作年 |
| `provider` | 画像提供元 |
| `sourceUrl` | 原典 URL（画像の出所ページ） |
| `fileUrl?` | 直接の画像ファイル URL（任意） |
| `license` | `public-domain` / `cc0` / `cc-by` / `cc-by-sa` |
| `credit` | クレジット表記 |
| `isPublicDomain` | パブリックドメインか否か |
| `verifiedOn` | 最終確認日 |

`scripts/validate-data.ts` と単体テストで、画像がある作品はライセンス・クレジット・出典 URL を必須チェックする。

## 禁止事項

- Google 画像検索結果の無断利用
- 出典不明画像の利用
- ライセンスを確認しない外部画像の利用
- 商用利用不可素材を、条件確認なしに組み込むこと
- 不安定な外部 URL への無制御なホットリンク

## 現行 MVP の状態

現行版では、権利確認済み画像を同梱していない作品が多く、`image: null`（プレースホルダー）として表示している。これは「確認できない画像を絶対に使わない」方針を優先した結果であり、ライセンス管理の仕組み（スキーマ・検証・表示）は実装済みである。

## 画像を追加する手順

1. 上記候補から、対象作品の**パブリックドメイン**画像の出所ページ（例：Wikimedia Commons のファイルページ、Met の作品ページ）を特定する。
2. ライセンス・クレジット・PD 可否を確認する。
3. `src/data/works.ts` の該当作品の `image` に `ImageMeta` を全フィールド付与する（`verifiedOn` に確認日）。
4. `npm run validate:data` と `npm test` で検証する。
5. 実行時に外部 API へ常時依存しないよう、URL は検証済みの静的値として保存する（ビルド前検証方式を優先）。

## 将来の自動検証スクリプト

Wikimedia Commons / Met Open Access の API から画像メタデータ（ライセンス・PD 可否）を取得・検証し、`ImageMeta` を生成・更新するスクリプトの導入を想定している。実行時依存を避けるため、取得結果は静的データとして保存する設計とする。
