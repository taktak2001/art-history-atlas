# Development Log

時系列の開発履歴。将来のAIが「どこまで進んだか・何が失われうるか」を把握するための記録。

## Phase 1（完了・本番公開済み）

`main` ブランチ（tip: `de2a443`）。

実装したもの:

- Next.js 15（App Router, `output:'export'`）+ TypeScript strict + Tailwind v3 + Zod のスキャフォールド。
- データモデル（Zod schema）とシード:（Phase 1 時点）ムーブメント **30** / 作家 **55** / 作品 **19**（実画像 **0**、全プレースホルダー）/ 関係 **46** / 出典 **41**。
- 全ルート実装: `/ /timeline /chronology /matrix /network /movements /movements/[slug] /compare /artists/[slug] /works/[slug] /sources /about`。
- 自作の横型タイムライン・関係ネットワーク（テキスト代替付き）、時代×地域マトリクス、URL共有可能な比較。
- PWA: manifest / 手書き SW（バージョン付き, オフライン）/ アイコン。ダークモード。アクセシビリティ（axe: 重大違反0）。
- テスト: Vitest 43件、Playwright E2E + a11y 26件（desktop/mobile）緑。Lighthouse（ホーム）Perf81/A11y100/BP100/SEO100。
- GitHub Pages 移行: `git subtree split` で `taktak2001/art-history-atlas` を作成、`main` へ push、`basePath`/`assetPrefix`(prod)、`.nojekyll`、metadata の manifest/icons 手動前置、SW 自己配置、`deploy-pages.yml`。
- 本番デプロイ成功（Actions run、deploy-pages が live 確認後に成功）。公開: https://taktak2001.github.io/art-history-atlas/
- **Phase 1 の既知の制約**: 実画像 0（全プレースホルダー）、一部データ `single-source`、egress 制約でライブ画面の自動確認不可。

## Phase 2（実装・検証完了・統合PR [#1](https://github.com/taktak2001/art-history-atlas/pull/1)）

目的: 新機能より「①作品画像の充実 ②記述の正確性 ③関係の精緻化 ④モバイル/PWA体験」。既存30件の完成度向上。

コミット履歴（古い順）:

1. `eaa06c8` スキーマ拡張（ImageMeta.alt必須 + PD/ライセンス整合の refine）、`worksOf/artistsOf` を movementId 導出化、作家 +8（Botticelli/Bosch/Parmigianino/El Greco/Gentileschi/Goya/Manet/Seurat）。
2. `8b222ca` 作品を 19→75 に拡張。実画像 **41点**（すべて Wikimedia Commons の PD、`Special:FilePath` 参照）。Géricault を作家に追加（計 +9 でこのコミット時点。合計 64）。全ムーブメント≥2作品、主要3〜5。
3. `72b131a` `WorkImage`（client, srcset/アスペクト枠/lazy/onErrorフォールバック/出典キャプション）、`WorkGrid`（詳細ページ代表作グリッド）、`CompareBoard` に代表作画像、SW に `aha-images`（上限60, cache-first）、`validate-data.ts` 拡張。
4. `0779ef5` 編集監査: Light&Space↔teamLab / もの派↔アルテ・ポーヴェラを非直線的に修正、関係エッジ修正。第2機関出典 **17件**追加（MoMA×9/Tate×6/Met×2）。単一機関 27→12、single-source movements 2→1、出典 41→58。
5. `b27c211` `docs/editorial-audit-phase2.md`（監査記録）。

Phase 2 現在の件数: movements 30 / artists **64** / works **75**（画像41/プレースホルダー34） / relationships 46 / sources **58**。

### 横型タイムライン再設計（2026-07-24）

- 1年あたりのピクセル数を切り替える旧UI（全体/広い/標準/詳細）を廃止し、通史/古代/中世/近世/近代/現代の6モードへ変更。
- 上部に先史/古代/中世/ルネサンス/近世/19世紀/20世紀/現代の時代ナビを追加。選択した年代に対応するモードと位置へ移動する。
- 通史は年代の比例ではなく、美術史上の情報量に応じて幅を配分する1180pxの非線形軸とした。先史と古代は「先史の造形」「古代の規範」の要約帯で表示。
- 時代別モードは対象年代だけを描画し、横幅を720〜940pxに制限。空の地域レーンを非表示にし、同じ地域のバーは自動段組みで重なりを回避。
- モバイルは地域列を88pxに縮小し、時代ナビを4列、表示モードを3列で折り返す。横方向の移動量を旧比例軸から大幅に削減。
- 検証: `npm run check` 成功（unit 53件）、静的ビルド成功、timelineを含む `tests/e2e/app.spec.ts` はdesktop/mobile計14件成功。通史幅1200px以下、近代幅960px以下をE2Eで固定。

### 最終検証・統合（2026-07-24）

- `npm run check` 成功（typecheck、lint 0件、データ検証、unit 53件）。
- `npm run build` 成功（本番 `basePath` 付き静的ビルド、181ページ）。
- Playwright E2E + a11y は desktop/mobile 合計36件成功。
- 統合PR [#1](https://github.com/taktak2001/art-history-atlas/pull/1) を作成。ユーザー常設指示により、必要な検証成功後は `main` へ自動マージする。
- （Phase 3候補）実画像60点到達、単一機関12件の第2出典化。

## セッション切断イベントの記録（重要）

- **1回目の切断**: Phase 2 の `works.ts` 全面書き換えの Write 実行直前でワーカー再起動。再開時、`eaa06c8`（schema/dataset/artists）は**コミット済みで保全**、`works.ts` の書き換えは**未適用**だった。→ 再開して `works.ts` を書き換え、`8b222ca` としてコミット。**作業の喪失なし**（コミット境界で保護されていた）。
- **2回目の割り込み**: AI_Brain 作成の新規依頼が Phase 2 の編集監査（第2出典 wiring）中に到着。第2出典を全て wiring・検証・コミット（`0779ef5`）し、監査ドキュメントをコミット（`b27c211`）してから AI_Brain 作成に着手。→ この時点で Phase 2 のデータ/UI/SW/検証/監査は**コミット済みで保全**。未コミットの作業ツリー変更は無い想定（AI_Brain 追加分を除く）。

## 現在の進捗率（推定・推論）

- Phase 2 全体: **約95%**（実装・自動検証・PR作成まで完了。残りはマージ後デプロイ確認）。
  - データ（作品/画像/出典/記述）: ~90%（画像は41/60目標で未達、単一機関12件が残るが主要部は完了）。
  - UI（グリッド/比較画像/モバイル配慮）: ~90%（実機確認が残る）。
  - PWA/性能（画像キャッシュ上限/lazy/CLS）: ~95%。
  - テスト/品質ゲート再実行: 100%（unit 53件、E2E+a11y 36件、本番ビルド成功）。
  - PR/デプロイ: PR作成済み。`main` マージ後に自動デプロイ。
- 数値は目安。正確な現況は `Project_Status.md` と `git log main..claude/phase2-content-images` を参照。

## セッション: 2026-07-26 — 関係ネットワークのフォーカス deep-link

### 背景・マルチエージェント衝突の事実

- 前回セッションで `claude/phase2-content-images` 上に focus 機能を統合していたが、その後 Codex が `main` を **93コミット**進行させた（PR #37/#38 ほか多数マージ、NetworkGraph をドラッグパン/集約/`selectedNodeId`/`focusedEdgeId` を持つ大幅再設計へ更新）。旧統合は陳腐化。
- 対応: rebase による大量衝突を避け、**現行 `main`（a914298）を基点に focus 機能を作り直した**。作業ブランチは指定の `claude/art-history-atlas-o632td`。

### 実装（現行 main のアーキテクチャに適合）

- URLは Next Router ではなく `window.history` + `window.location` で操作（`useLodState` と同方針）。静的export/GitHub Pages basePath を保ち、Suspense 境界を不要にする。
- `src/lib/network.ts`: `parseFocus`（id検証、typo/空はnull）/ `buildFocusQuery`（`lod` など他クエリを保持して focus のみ set/delete）。純粋関数・単体テスト対象。
- `NetworkGraph.tsx`: URL `?focus=` を選択状態の単一の真実に。初回マウント・`popstate`（戻る/進む）で復元、選択変更をURLへ反映（reload/共有可）、選択解除は focus のみ除去。deep-link先が現在のLODで隠れていても必ず表示・中央寄せし、到達時に一度だけキーボードフォーカスを移す。無効な focus は静かにURLから除去（エラーなし・全体表示）。sr-only の aria-live で選択を通知。
- 詳細ページの「関係ネットワーク」ボタン2箇所を `/network/?focus=${movement.id}` へ。
- 既存の double-tap テストのURLアサーションのみ緩和（選択が `?focus=` に反映されるが `/network/` に留まり詳細ページへは遷移しない、という意図は保持）。

### 検証（すべて成功）

- `npx tsc --noEmit` / `npm run lint`（0件）/ `npm test`（**unit 146件**、うち network-focus 8件）。
- `npm run build:e2e` + Playwright: 全 **226件成功 / 12 skipped**（network-focus は desktop/mobile 12件）。
- `npm run build`（本番 basePath 付き静的ビルド）成功、`validate:data` 成功（ムーブメント30/作家64/作品75/関係46/出典58）。

### 注意（ユーザーへ要共有）

- **Codex と Claude Code が同一リポジトリで並行作業**しており `main` の進行が速い。ブランチ/PRの取り違え・上書きリスクがあるため、担当範囲かブランチの分離を推奨。

## imageReference 全件監査（2026-08-06）

ブランチ `claude/image-reference-audit`、PR [#62](https://github.com/taktak2001/art-history-atlas/pull/62)。

- `applyImageSupplements` 適用後の最終 `works`（139点）を基準に、`image === null` の **38点**を抽出。
- 各作品を WebSearch / WebFetch / 公開API で調査し、所蔵館・財団・公的機関の作品ページを最優先で
  `imageReference` に記録（`src/data/expansion/image-references.ts`）。捏造URLなし。
- スキーマに `ImageReference`（`RightsStatus` / `ReferenceVerificationStatus`）を追加し、`Work` に
  optional で付与。`image` があるときは付与不可（superRefine）。`works.ts` で
  `applyImageReferences(applyImageSupplements(...))` として最後に適用。
- `validate-data.ts` に検証を追加（image:null は参照必須 / https・空白なし / Wikipedia・SNS・販売サイト
  を第一出典に不可 / quotation・rights-review は本番画像へ昇格不可 / 同一URLの過剰流用検出）。
- UI: `WorkImage` に `showReferenceLink`（詳細ページのみ）を追加。静的エクスポートで **38件の
  詳細ページのみ**に「提供元で作品を見る ↗」が出力され、一覧/Timeline/Network/Chronology には
  出ないことを確認。
- 監査レポート `docs/image-reference-audit.md` を `scripts/gen-image-reference-audit.ts` で自動生成。
- 検証: typecheck / lint / validate:data / unit **204**（image-reference 10件含む）/ E2E+axe **250** /
  静的ビルド すべて成功。
- 未解決2点（work-son-of-man 個人蔵 / work-kounellis-horses 1969上演）は作品単独ページ未確認として
  監査に記録。PD候補は藍瑛（AIC CC0 確認済）とミュシャ（作品PD・画像は © Mucha Trust）の2点のみ。

### 追記（2026-08-06）: PD確定作品の本番表示

ユーザー要望「画像をそのまま表示」に対し、**著作権保護期間内の36点は本番転載しない**（侵害リスク・
サイト方針・元タスクに反するため）方針を維持しつつ、**パブリックドメイン確定分のみ**を表示に昇格。

- **ミュシャ《椿姫》(1896)** → 表示。Wikimedia Commons のPDスキャン（Library of Congress 由来、
  `Special:FilePath` が width=800 で image/jpeg 200 を返すことを確認）を `image-supplements.ts` で収録。
- **藍瑛《倪瓚風山水》** → PD(AIC CC0)だが、AIC IIIF が **クロスオリジンのホットリンクを403で拒否**
  （github.io の Referer で 403 を確認）。本番表示できないため `imageReference` のまま（自ホスティングが必要）。
- 結果: 表示画像 101 → **102**、`imageReference` 38 → **37**。詳細ページの「提供元で作品を見る」導線は 37 件。
- 検証: check（typecheck/lint/validate:data/unit 204）+ 静的ビルド + 実HTMLでミュシャ画像描画/リンク非表示を確認。

### 追記（2026-08-06）: プレースホルダーUIを全面リンク化

小さなテキストリンクをやめ、**プレースホルダー全面を1つの外部リンク**にした（未承認サムネイルは一切出さない方針は維持）。

- 対象: `image===null` かつ `imageReference?.sourcePageUrl` あり、かつ導線を出す面。
  - 表示面: **作品詳細 / ムーブメント代表作品（CatalogueWorkList）/ 比較（CompareBoard）**。
  - 非表示面: Timeline / Network / Chronology / ムーブメント一覧 / 検索 / OGP（従来どおり非リンクのプレースホルダー）。
- 文言: 主「画像は提供元で確認」＋補「{短縮provider}で作品を見る ↗」。provider短縮は `src/lib/provider-display.ts`
  （データの provider は不変、UI表示のみ短縮: MoMA / The Met / AIC / Tate / …）。
- 実装上の要点: `WorkImage` が `<a target=_blank rel=noopener>` を持つため、代表作品カード/比較では
  **内部 `<Link>` で包まない**（`<a>` のネスト回避）。作品名は別の内部リンクとして残す。
- a11y: `aria-label={「{作品名}を{provider}の提供元ページで見る（外部サイト）」}`、`↗` は aria-hidden、
  focus-visible アウトライン、色のみに依存しない。
- 非リンクのプレースホルダー文言は「画像は権利確認後に収録予定」に統一。
- 検証: check（unit 210）+ 静的ビルドで面ごとの出力（詳細/ムーブメント=外部リンク、Timeline/Network/Chronology=0）
  と `<a>` 非ネストを確認 + Playwright/axe **250 passed**。

### 追記（2026-08-07）: 縦型年表にも導線追加＋年代と点の重なり修正

ユーザー要望により、当初「一覧性重視のため非表示」としていた **Chronology（縦型年表）にも
全面リンク型プレースホルダーを追加**（1ムーブメント1作品で密度が低いため方針を変更）。

- `ChronologyView`: `image===null` かつ `imageReference` ありのとき、代表作品を内部 `<Link>` で
  包まず `WorkImage showReferenceLink` を使う（`<a>` ネスト回避）。キャプションを内部リンクにする。
- `globals.css`: `.chronology-work__image > a` を背景・モバイル aspect-ratio の対象へ追加。
- **年代テキストと軸上の点の重なりを修正**（実測値ベース）:
  - 原因: 年代フォントが `clamp(1.75rem, 3vw, 2.55rem)` で viewport に応じて伸びるのに、
    点(`left:5rem`)とレール(`5.35rem`)が固定だったため。1280pxで4桁年が88.2px、点が80px開始＝**8.2px重なり**。
    最長表記「前40000」は最大約117px（デスクトップ）、モバイルでも9.5px重なりを確認。
  - 対応（≥768px）: 年代カラム `6.75rem→7.75rem` / 点 `left:5rem→8.15rem` / レール `5.35rem→8.525rem`
    / `.chronology-relationship` の左カラムも `7.75rem` へ整合。
  - 対応（≤767px）: 年代カラム `4.8rem→5.75rem` / 点 `4.15rem→5.4rem` / レール `4.5rem→5.775rem`
    / relationship 左カラム `5.75rem`。
  - 結果: 重なり **-8.2px → 余白 +42.2px**（1280px時）。
- E2E追加: Chronologyの外部リンク属性・サムネイル非表示・`<a>`非ネスト、および
  **年代グリフ右端と点の左端の幾何チェック**（回帰防止、desktop/mobile両方）。
- 検証: check（unit 210）+ 静的ビルド + Playwright/axe **254 passed**。
