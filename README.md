# 美術史アトラス｜Art History Atlas

先史から現代までの「美術史上の思想・様式・運動・流派」を、**時系列・地域・相互影響**の観点から体系的に学ぶための PWA 対応 Web アプリです。

単なる作品図鑑ではなく、各ムーブメントについて「何を問題として生まれ、前時代の何を継承・否定し、どの思想・社会・制度と結びつき、同時代の他地域で何が起きていて、後世へ何を引き継いだか」を、視覚的かつ体系的に理解することを目指します。

> 美術史とは様式名を暗記するものではなく、社会・思想・技術・制度と視覚表現の相互作用を理解するもの。

**公開URL（GitHub Pages）**： https://taktak2001.github.io/art-history-atlas/

GitHub Actions（`.github/workflows/deploy-pages.yml`）が `main` への push で検証・ビルドし、`out/` を GitHub Pages へデプロイします。プロジェクトサイトのサブパス配信（`/art-history-atlas/`）に合わせ、production ビルドで `basePath` / `assetPrefix` を付与しています。

---

## 主要機能

- **横型タイムライン** (`/timeline`) — 年代を横軸に、地域別レーンで期間の重なりを表示。ドラッグで移動、Ctrl+ホイールで拡大縮小、粒度切替。テキスト代替表あり。
- **縦型年表** (`/chronology`) — 年代順の閲覧。時代ナビゲーションと同期。モバイル最適化。
- **時代×地域マトリクス** (`/matrix`) — 同時代に異なる地域で起きた運動を比較。西洋中心の一本道にしない。
- **関係ネットワーク** (`/network`) — 影響・反発・継承・同時代などの関係を図示。関係タイプでフィルタ、ノード選択で前後関係を強調（段階的展開）。テキスト代替あり。
- **ムーブメント詳細** (`/movements/[slug]`) — 思想・背景・前時代との関係・視覚特徴・技法・制作流通制度・作家・作品・後世への影響・鑑賞ポイント・出典を情報設計。
- **検索・絞り込み** (`/movements`) — 名称・作家・作品・地域・思想・技法・素材・キーワードで検索。時代・地域・分類・情報確認状態で絞り込み。
- **比較** (`/compare`) — 2〜4件を横並び比較。URL 共有可能（`?ids=a,b`）。
- **作家/作品詳細** (`/artists/[slug]`, `/works/[slug]`)、**出典一覧** (`/sources`)、**編集方針** (`/about`)。
- **PWA** — manifest / Service Worker / アイコン、基本ページのオフライン閲覧、閲覧ページのキャッシュ（上限付き）、ダークモード、安全領域対応。

## 技術構成

| 領域 | 採用 | 理由（詳細は `docs/architecture.md`） |
| --- | --- | --- |
| フレームワーク | **Next.js 15（App Router / 静的エクスポート）** | Vercel 最適・静的生成で高速初期表示・バックエンド不要 |
| 言語 | **TypeScript（strict）** | 型安全・データスキーマの担保 |
| スタイル | **Tailwind CSS v3** | 一貫したデザインシステム・小さな CSS |
| データ検証 | **Zod** | スキーマ検証・型生成の単一ソース |
| データ保存 | **静的 TypeScript モジュール** | 実行時に外部 API 依存なし・型付き・拡張容易 |
| 図の描画 | **自作 SVG / DOM** | 追加の重いライブラリを避けバンドル削減、遅延なし |
| PWA | **手書き Service Worker** | バージョン付きキャッシュを完全制御 |
| テスト | **Vitest + Testing Library / Playwright / axe-core** | 単体・UI・E2E・アクセシビリティ |

収録データ：ムーブメント **30**／作家 **55**／作品 **19**／関係エッジ **46**／出典 **41**（すべて Zod 検証・参照整合性チェック済み）。

## ローカル起動

```bash
git clone https://github.com/taktak2001/art-history-atlas.git
cd art-history-atlas
npm install
npm run dev            # http://localhost:3000
```

## データの追加方法

データは `src/data/` の TypeScript モジュールで管理し、`src/lib/schema.ts` の Zod スキーマで検証されます。

1. **ムーブメント** — `src/data/movements.ts` に `Movement` 型のオブジェクトを追加。`id` は英小文字ハイフンの slug。`sourceIds` に最低 1 件の出典 ID を紐づける。年代が概算なら `dates.circa = true` と `note` を付す。
2. **作家 / 作品** — `src/data/artists.ts` / `src/data/works.ts` に追加。ムーブメントの `artistIds` / `workIds` から参照。
3. **関係** — `src/data/relationships.ts` に有向エッジを追加（`from` / `to` は既存ムーブメント ID）。
4. 追加後に検証：`npm run validate:data`

100 件以上への拡張を想定した構造です（分類・地域・時代は列挙型で管理）。

## 出典の追加方法

`src/data/sources.ts` に `Source` 型で追加します（`title` / `publisher` / `url` / `accessed` / `kind` / `reliability` / `supports`）。**実在する美術館・大学・研究機関等の公開ページの URL のみ**を用い、一般ブログ・まとめサイトのみを根拠にしないでください。各エンティティの `sourceIds` から参照します。編集方針は `docs/editorial-policy.md` を参照。

## 画像の追加方法

作品画像は **ライセンス・出典を確認済みのパブリックドメイン画像のみ**を掲載します。`src/data/works.ts` の各作品の `image` に `ImageMeta`（作品名・作者・制作年・提供元・原典 URL・ライセンス・クレジット・PD 可否・最終確認日）を付与します。確認できない場合は `image: null` とし、架空画像を用いずプレースホルダーを表示します。詳細は `docs/image-rights.md`。

アイコンの再生成：`npm run gen:icons`（`scripts/icon-master.svg` から PNG を生成）。

## テスト方法

```bash
npm run validate:data   # データのスキーマ・参照整合性検証
npm run typecheck        # tsc --noEmit
npm run lint             # next lint
npm test                 # Vitest（単体・UI）
npm run test:e2e         # Playwright（E2E + アクセシビリティ）
npm run check            # typecheck + lint + validate + unit をまとめて実行
```

E2E をこの環境のプリインストール Chromium で実行する場合：

```bash
PW_EXECUTABLE_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm run test:e2e
```

CI（GitHub Actions）では Playwright が自前でブラウザを取得します。

## ビルド

```bash
npm run build     # 静的サイトを out/ に出力（output: 'export'）
npx serve out     # ビルド結果をローカル配信
```

## デプロイ（GitHub Pages）

本リポジトリ（`taktak2001/art-history-atlas`、デフォルトブランチ `main`）は GitHub Actions で GitHub Pages へ自動デプロイされます。

1. リポジトリの **Settings → Pages → Build and deployment → Source を「GitHub Actions」** に設定する（初回のみ）。
2. `main` に push すると `.github/workflows/deploy-pages.yml` が実行され、`npm ci → validate:data → typecheck → lint → test → build` の順に検証してから、`out/` を `actions/upload-pages-artifact` → `actions/deploy-pages` で公開する。
3. 公開URL： https://taktak2001.github.io/art-history-atlas/

**サブパス対応**：GitHub Pages のプロジェクトサイトは `/art-history-atlas/` 配下で配信されるため、production ビルドで `basePath` / `assetPrefix` を `/art-history-atlas` に設定している（`next.config.mjs`）。内部リンク・静的アセット・manifest・アイコン・Service Worker はいずれもこのサブパス配下で動作する。`public/.nojekyll` により `_next/` ディレクトリが Jekyll に無視されないようにしている。ローカル開発（`npm run dev`）ではルート配信のため basePath は付かない。

> Vercel など他のホスティングを使う場合は、`basePath` を外して（`next.config.mjs` の `isProd` 分岐を無効化して）ルート配信すればよい。

## 既知の制約

- **画像**：権利確認済み PD 画像のみを掲載する方針のため、現行版では多くの作品がプレースホルダー表示です（`image: null`）。ライセンス管理の仕組みとスキーマは実装済みで、確認でき次第追加します。
- **出典の粒度**：各記述は関連する出典に紐づけていますが、文単位の脚注ではなくムーブメント／作家／作品単位です。
- **一部データの確認状態**：ポストミニマリズム等の一部は単一資料に基づくため `single-source` フラグを付けています（`/about` 参照）。
- **年代**：諸説あるものは幅と注記で示していますが、入門的な整理にとどまります。正確な研究は各出典・専門文献を直接参照してください。
- **Lighthouse**：Performance 81 / Accessibility 100 / Best Practices 100 / SEO 100（ホーム、ヘッドレス計測）。Lighthouse 12 では PWA カテゴリが廃止されたため、PWA 要件（manifest・SW・アイコン・オフライン）は構成として満たしています。

## 今後の拡張案

- 収録ムーブメントを 100 件以上へ拡張（東アジア・イスラーム・アフリカ・ラテンアメリカ等の拡充）。
- 権利確認済み画像の段階的追加（Wikimedia Commons / Met Open Access 等のメタデータ検証スクリプト連携）。
- 全文検索の高速化（インデックスの事前生成）。
- タイムラインの非線形スケール（先史の長大な範囲の可読性向上）。
- 文単位の出典アンカー。

## ドキュメント

- `docs/architecture.md` — 技術選定の判断と代替案
- `docs/data-model.md` — データモデル定義
- `docs/editorial-policy.md` — 編集方針・情報品質・出典方針
- `docs/image-rights.md` — 画像権利処理
- `docs/sources.md` — 出典方針と一覧

## ライセンス

コードは MIT ライセンス（`LICENSE`）。本文テキストは教育目的の要約であり、各記述の根拠は `/sources` の出典に帰属します。リンク先の画像・テキストの権利は各機関に帰属します。
