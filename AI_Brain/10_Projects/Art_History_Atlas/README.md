# Art History Atlas — AI_Brain README

> このディレクトリ（`AI_Brain/10_Projects/Art_History_Atlas/`）は、Claude Code / Codex / ChatGPT が**共通認識**として参照するための知識ベースです。人間にも読めますが、第一の読者は将来のAIセッションです。曖昧表現を避け、**事実・推論・未確認**を区別して記述します。
>
> 正規の配置: ユーザーの Obsidian Vault（iCloud Drive → Obsidian → `AI_Brain/`）内の **`10_Projects/Art_History_Atlas/`**（`ArtWatcher` / `PlaceOrganizer` と同じ階層）。
> 補足: これらのファイルは art-history-atlas GitHub リポジトリ内にもミラーされている（`AI_Brain/10_Projects/Art_History_Atlas/`）。AIサンドボックスからユーザーのローカル iCloud/Obsidian へ直接書き込めないため、更新時はリポジトリ側を編集し、ユーザーが Vault へ反映する運用とする。

## プロジェクト概要

先史から現代までの「美術史上の思想・様式・運動・流派」を、**時系列・地域・相互影響**の観点から体系的に学ぶ PWA 対応 Web アプリ。単なる作品図鑑ではなく、各ムーブメントを「何を問題として生まれ、前時代の何を継承・否定し、どの思想・社会・制度と結びつき、同時代の他地域で何が起きていて、後世へ何を引き継いだか」という関係の網として提示する。

## 目的

- 様式名の暗記ではなく、**社会・思想・技術・制度と視覚表現の相互作用**を理解させる学習ツールにする。
- 西洋美術を唯一の発展経路として描かず、日本・東アジア等を並行して扱う。

## コンセプト（編集の芯）

- 発展史観（未熟→進歩）を採らない。各時代に固有の目的・価値・鑑賞環境がある。
- 「A への反発として B」の単純化を避け、継承と断絶の両面を書く。
- 事実と解釈を区別し、出典を紐づける。詳細は `Editorial_Policy.md`。

## 公開URL / GitHub

- 公開URL（GitHub Pages）: https://taktak2001.github.io/art-history-atlas/
- リポジトリ: https://github.com/taktak2001/art-history-atlas （Public, デフォルトブランチ `main`）
- **重要**: 元リポジトリ `taktak2001/taktak` は一切変更しない（別プロジェクトが同居）。本アプリは `git subtree split` で切り出した独立リポジトリ。

## 技術構成（事実）

| 領域 | 採用 |
| --- | --- |
| フレームワーク | Next.js 15（App Router, `output: 'export'` 静的エクスポート） |
| 言語 | TypeScript（strict） |
| スタイル | Tailwind CSS v3 + CSS変数（ライト/ダーク） |
| データ検証 | Zod（`src/lib/schema.ts` が単一ソース） |
| データ保存 | 静的 TypeScript モジュール（`src/data/*`）。実行時に外部API依存なし |
| 図の描画 | 自作 SVG / DOM（タイムライン・ネットワーク）。重いライブラリ不使用 |
| 検索 | クライアント側の軽量インデックス（`src/lib/dataset.ts`） |
| テスト | Vitest + Testing Library（unit/UI）、Playwright（E2E）、axe-core（a11y） |
| 画像 | Wikimedia Commons の PD 画像を `Special:FilePath` で参照（詳細 `Image_Policy.md`） |

## PWA構成（事実）

- `public/manifest.webmanifest`（サブパス対応: start_url/scope/icons を `/art-history-atlas/` に）
- `public/sw.js`（手書き。バージョン付きキャッシュ、activate で旧キャッシュ削除）
- キャッシュ: `aha-shell / aha-pages(上限40) / aha-assets / aha-images(上限60)`。**画像は無制限キャッシュしない**。
- オフライン: `public/offline.html`。ナビゲーションは network-first → cache → offline.html。
- SW は自身の登録スコープから `BASE` を導出（サブパス配信でも動く）。

## GitHub Pages構成（事実）

- `next.config.mjs`: production 時のみ `basePath`/`assetPrefix` = `/art-history-atlas`。`output:'export'`、`images.unoptimized:true` 維持。`env.NEXT_PUBLIC_BASE_PATH` を公開。
- Next は metadata の `manifest`/`icons` に basePath を自動付与しないため、`src/app/layout.tsx` で手動前置。
- `public/.nojekyll` で `_next/` が Jekyll に無視されないようにする。
- デプロイ: `.github/workflows/deploy-pages.yml`（`main` push で `npm ci→validate:data→typecheck→lint→test→build→configure-pages→upload-pages-artifact→deploy-pages`）。公式 Actions のみ。
- **初回のみ手動設定が必要**: リポジトリ Settings → Pages → Source =「GitHub Actions」（GITHUB_TOKEN では Pages サイト新規作成不可）。

## ディレクトリ構造（要点）

```
art-history-atlas/
  next.config.mjs        # 静的エクスポート + basePath(prod)
  src/
    app/                 # App Router 各ルート（/, /timeline, /chronology, /matrix,
                         #  /network, /movements, /movements/[slug], /compare,
                         #  /artists/[slug], /works/[slug], /sources, /about）
    components/          # SiteHeader, WorkImage(client), WorkGrid, CompareBoard(client),
                         #  NetworkGraph(client), HorizontalTimeline(client), Badges, ...
    data/                # movements.ts / artists.ts / works.ts / relationships.ts / sources.ts / index.ts
    lib/                 # schema.ts(Zod) / dataset.ts(クエリ) / compare.ts / ...
  public/                # manifest / sw.js / offline.html / .nojekyll / icons/
  scripts/               # validate-data.ts / generate-icons.mjs / icon-master.svg
  tests/                 # unit/ , e2e/
  docs/                  # architecture, data-model, editorial-policy, image-rights, sources,
                         #  editorial-audit-phase2
  AI_Brain/_Modules/Projects/Art_History_Atlas/   # ← 本知識ベース
```

## 開発ルール（事実）

- 作業は指定ブランチで（Phase 2 は `claude/phase2-content-images`）。`main` へ force push しない。
- 機能に変更があった場合は、コミット後その都度、作業ブランチを `origin` へ push する（ユーザー常設指示、2026-07-24）。
- 機能単位でコミット。認証情報・APIキー・`node_modules`・`out/`・テスト生成物をコミットしない。
- 完了時に PR を作成（自動マージしない）。PR 本文に変更点・データ件数・画像権利方針・テスト結果。
- データ追加後は必ず `npm run validate:data`。品質ゲート: `npm run check`（typecheck+lint+validate+test）と `npm run build`。
- 画像・出典は「推測 URL 禁止」。詳細 `Image_Policy.md` / `Editorial_Policy.md`。

## AI が最初に読むべき順番

1. `Project_Status.md`（今どこまで進んでいるか。最重要）
2. この `README.md`
3. `Decisions.md`（なぜこの構成か）
4. `Architecture.md` → `Data_Model.md`
5. `Image_Policy.md` → `Editorial_Policy.md`
6. `Development_Log.md`（履歴・切断前の作業）
7. `TODO.md`（次に何をするか）
