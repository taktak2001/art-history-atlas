# Architecture

設計思想と構成の詳細。実装の単一ソースはコード（`src/`）だが、本書は意図と全体像を伝える。

## 1. Next.js 構成 / App Router

- Next.js 15、App Router。`output: 'export'`（完全な静的サイト。サーバー無し）。
- ルート（`src/app/`）:
  - `/` ホーム（目的・時代入口・転換点・反発関係・地域導線・注目比較・最近追加・出典方針）
  - `/timeline` 横型タイムライン（client）
  - `/chronology` 縦型年表（server、時代アンカー）
  - `/matrix` 時代×地域マトリクス（server、表）
  - `/network` 関係ネットワーク（client）
  - `/movements` 一覧・検索（client explorer）
  - `/movements/[slug]` 詳細（server, `generateStaticParams`）
  - `/compare` 比較（client, `?ids=` 共有可能、Suspense）
  - `/artists/[slug]` `/works/[slug]`（server, `generateStaticParams`）
  - `/sources` 出典一覧、`/about` 編集方針
- **Next 15 では `params`/`searchParams` が Promise**。動的ページは `async` + `await params`。
- 静的エクスポートのため動的 `[slug]` は `generateStaticParams` で全事前生成。

## 2. データ構造 / データフロー

- データは静的 TypeScript モジュール（`src/data/`）。Zod 型（`src/lib/schema.ts`）から `z.infer` で型生成。
- `src/data/index.ts` が全データを集約し `dataset` を公開。
- `src/lib/dataset.ts` がクエリ層:
  - `getMovement/getArtist/getWork/getSource`、`getSources`
  - `worksOf(m)` / `artistsOf(m)` は**作品・作家側の `movementIds` から導出**（movement.artistIds/workIds への手動登録に依存しない。画像付き作品を先頭化）
  - `relationshipsOf/outgoing/incoming`、`matrixCell`、`buildSearchIndex/searchDocs`、`formatYear/formatDateRange`
- 検索: 全エンティティから `haystack` 文字列を生成し AND 部分一致（30〜100件規模で十分。将来は事前生成インデックスへ）。
- ビルド前検証: `scripts/validate-data.ts`（Zod + 参照整合性 + Phase 2 追加チェック）。`npm run validate:data`。

## 3. UI 設計思想

- 展覧会図録・建築書を参照した静謐なデザイン。オフホワイト/チャコール/グレー基調、彩色は時代・関係の識別に限定。
- セリフ体（見出し・欧文タイトル）＋サンセリフ体（本文/UI）。システムフォントスタックで軽量・ビルド時ネットワーク非依存。
- CSS 変数でライト/ダークを定義（`src/app/globals.css`）。`data-theme` と `prefers-color-scheme` の双方に対応。
- アクセシビリティ: skip-link、フォーカス可視化、`prefers-reduced-motion`、色に依存しない情報（記号+テキスト）、図にテキスト代替。
- 図（タイムライン/ネットワーク）は各ルートに閉じた client コンポーネントとして分離し、初期バンドルを小さく保つ。

## 4. モジュール構成（コンポーネント）

- `SiteHeader`（client, ハンバーガー/テーマトグル）, `SiteFooter`, `ServiceWorkerRegister`(client)
- `WorkImage`(client): 画像表示。srcset + アスペクト枠 + lazy + `onError` フォールバック。`showCredit` で出典キャプション。
- `WorkGrid`: 代表作品グリッド（→ 作品詳細）。
- `CompareBoard`(client): URL共有可能な比較。代表作画像を並置。
- `NetworkGraph`(client): 時代カラム配置 + SVGベジェのエッジ + 関係タイプフィルタ + ノード選択で前後強調。テキスト代替リスト内蔵。
- `HorizontalTimeline`(client): 地域レーン、ドラッグ/ズーム、粒度切替。テキスト代替表内蔵。
- `Badges`（分類/地域/確認状態/関係タイプ）, `MovementCard`, `SourceList`, `MovementsExplorer`(client 検索)

## 5. PWA / Service Worker

- `public/sw.js`（手書き）。`VERSION`（現 `v2`）でキャッシュ名を管理し、activate 時に旧キャッシュを削除（更新時に古いキャッシュが残らない）。
- `BASE = new URL(self.registration.scope).pathname`（サブパス自動追従）。
- キャッシュ戦略:
  - ナビゲーション: network-first → cache → `${BASE}/offline.html`（上限 `PAGES_LIMIT=40`）
  - 静的アセット（`_next/static`, icons 等）: stale-while-revalidate
  - **外部画像（`commons.wikimedia.org`/`upload.wikimedia.org`）: 専用 `aha-images` に cache-first、上限 `IMAGE_LIMIT=60`**（無制限キャッシュ防止）
- 登録は `ServiceWorkerRegister`（production のみ、`${base}/sw.js`、scope `${base}/`）。

## 6. GitHub Pages 対応（basePath / assetPrefix）

- `next.config.mjs`: `const isProd = NODE_ENV==='production'; basePath = isProd ? '/art-history-atlas' : ''`。`assetPrefix` 同値。`env.NEXT_PUBLIC_BASE_PATH` を公開（client/SW 登録で使用）。
- 内部 `<Link>`・`_next` アセットは Next が basePath を自動付与。
- **metadata の `manifest`/`icons` は自動付与されない** → `layout.tsx` で `${base}/...` を手動前置。
- 静的ファイル（`manifest.webmanifest`/`sw.js`/`offline.html`）内の絶対パスは `/art-history-atlas/` を明示（本番のみ有効なパス。dev では SW 非登録なので実害なし）。
- `public/.nojekyll` 必須（`_next/` を Jekyll が無視しないように）。
- ローカル開発（`npm run dev`）は basePath 無し（ルート配信）。

## 7. パフォーマンス方針

- 静的生成 + コード分割で初期 JS を小さく（共有 First Load JS ≈105kB）。
- 画像: `Special:FilePath?width=` によるサイズ制御、`srcset`/`sizes`、`loading="lazy"`、`decoding="async"`、固定アスペクト枠で CLS 抑制、プリロードしない。
- Lighthouse（Phase 1 ホーム）: Performance 81 / A11y 100 / Best Practices 100 / SEO 100。
