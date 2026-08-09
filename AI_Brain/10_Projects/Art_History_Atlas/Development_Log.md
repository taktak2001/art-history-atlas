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

## UI整理（2026-08-07）

### 提供元リンクの品質修正（PR #66）
「画像は提供元で確認」と案内する以上、遷移先に作品写真が必要。実ブラウザ確認で2件を差し替え。
- 電気服: Art Platform Japan（メタデータのみ・写真なし）→ **Centre Pompidou**《Denkifuku》解説記事。APJ/高松市美術館の所蔵記録は `imagePageUrl` へ。
- ガンツフェルト: jamesturrell.com（**under construction**）→ **ユダヤ博物館ベルリン**《Aural》展示ページ。
- 2件とも `url-verified`。残り35件はMoMA/Met/Dia等がスクリプト取得に403/429を返すため機械判定不可だが、ブラウザでは画像配信を確認（ToMuCo等を個別確認）。

### ホーム画面（PR #67）
- キャッチコピー「発生・継承・転換から読む美術史。」を**DOMごと削除**。大見出し〜区切り線をモバイル32px / デスクトップ `clamp(2rem,2.75vw,2.5rem)` に再調整。
- **Movements** 導線を最上位に追加（`/movements/`・「名前・時代・地域から探す」）。既存 `home-hero__cta` と同一構造。グリッド3→4列、640px未満は1列。
- Explore by Era に**章番号01〜08**を時代名の左上へ小さく追加（セル高さ・padding・件数は不変、`aria-hidden`、リンク名は「先史・古代、6件を見る」）。DOM順＝`ERA_ORDER`＝時系列。

### ムーブメント一覧の検索UI（PR #68）
- 検索欄を**常時表示・独立**（ラベル「ムーブメントを検索」、placeholder「ムーブメント名・作家・作品など」、詳細は `aria-describedby` の補足文へ）。
- 時代区分/地域/分類/情報確認状態/階層を「**詳細条件**」アコーディオンへ集約（初期は閉、`aria-expanded`/`aria-controls`、＋/−）。
- 閉じても分かるよう、見出しに要約（最大3件＋「ほかN件」）と**削除可能なチップ**（`aria-label`「絞り込み条件「◯◯」を解除」）。
- 結果件数を「**N件のムーブメント**」で独立表示。「条件をクリア」は条件がある時だけ小型テキストボタンで表示。
- **「表示形式（フラット/階層）」を削除**し一覧を1種類に統一。親子関係はカード内の「上位分類：」で控えめに表現。旧クエリ（例 `?view=hierarchy`）は無視して通常表示にフォールバック（元々URL管理していないため互換性影響なし）。
- 大きな囲み枠をやめ、細い罫線と余白でブロック分割。
- **iOSのフォーカス時オートズーム対策**: 検索input・全selectを16px（`text-base` / `font-size:1rem`）に。`maximum-scale`/`user-scalable=no` は使わず、ピンチ拡大は維持。
- 検証: unit **214** / Playwright+axe **256 passed**。

### 追補（2026-08-07・PR #69）
- **詳細条件が閉じていなかった不具合を修正**: `hidden` 属性は付けていたが、後から追加した
  `.movements-advanced__panel { display: grid }` が Tailwind preflight の `[hidden]{display:none}`
  を打ち消しており、実際には開いたままだった。`.movements-advanced__panel[hidden] { display: none }`
  を追加して解決。**検証時に属性の有無だけを見て実表示（computed style / 矩形）を確認しなかった**のが
  見落としの原因。以後、開閉UIは `display` と高さで確認する。
- **ムーブメント一覧からLODを削除**: `LodControl` / `useLodState` / `filterMovementsByLod` を外し、
  一覧は常に全54件を対象に。`ResultCard` の「現在の表示範囲では非表示」「◯◯で表示」も不要となり削除。
  旧 `?lod=` が付いていても無視して全件表示にフォールバック。
- **Explore by Era の件数表示を削除**（章番号01〜08と時代名のみ）。`aria-label` も「先史・古代を見る」に。
- 影響したテストを更新: LOD共通表示は主要3画面（timeline/chronology/network）に変更、
  地域フィルタE2Eは詳細条件を開いてから操作するよう修正。
- 検証: unit **214** / Playwright+axe **256 passed**。

## 詳細→ネットワーク遷移の文脈反映（2026-08-09・PR #70）

詳細ページから `?focus=` で来ても LOD=基本 / 表示関係=重要関係 のままで、直接関係の
standard/detailed ノードや「重要関係」外のエッジが欠落していた問題を解消。

- 新ライブラリ `src/lib/network-focus-context.ts`（純粋関数）:
  `getDirectEdges` / `getDirectNodeIds` / `getHighestVisibilityLevel` /
  `resolveFocusContext` / `parseRelationScope`。**1ホップに限定**し2ホップへ広げない。
- **必要な最小LODを自動判定**（core<standard<detailed）。常に「すべて」へ上げない。
  例: 日本水墨画は直接関係1件・相手がstandard → **基本→充実**へ自動調整。
- 表示関係に **`focus`（このムーブメント）** を追加し、focus付き遷移時の初期値に。
  focus直結エッジは importance / LOD を理由に落とさない（関係タイプの手動選択のみ適用）。
  Relationshipデータ自体は不変。
- 「このムーブメント」表示では直接関係ノードのみ描画（非関連ノードは非表示）。
  focusノードはLODに関わらず常に表示。
- 件数表示はサブグラフ基準（「直接関係N件・Mノード表示中」）に切替。
  自動調整時のみ小さな補助テキスト「表示に合わせて『充実』へ自動調整」。
- URL: `focus` / `lod` / `scope` を同期し、再読込・戻る・共有で復元。basePath維持。
  無効focusは通常表示へフォールバック（コンソールエラーなし）。
- **手動変更の尊重**: 自動調整は「URL由来のfocusの初回」だけ。`useLodState` に `clearLod()`
  を追加し、選択解除時は focus/scope/lod をURLから外して全体表示（重要関係）へ戻す。
  グラフ内のノードクリックでは自動調整しない（当初これが既存テスト2件を壊して発覚）。
  LOD手動変更時も focus は保持する（従来は選択が解除されていた）。
- 検証: unit **226**（focus-context 12件を含む） / Playwright+axe **262 passed**。

## 関係ラベルの衝突回避（2026-08-09・PR #71）

ミニマリズム周辺で「反発・地域的展開・影響・同時代」が同一点付近へ集まって読めない問題。
ラベルを非表示にせず、配置で解決した。

- 新ライブラリ `src/lib/network-label-layout.ts`（純粋関数）:
  `cubicPointAt` / `cubicNormalAt`（法線）/ `rectsOverlap` / `viewportOverflowRatio` /
  `scoreLabelPlacement` / `layoutEdgeLabels` / `estimateLabelWidth`。
- **中点固定を廃止**。progress 0.15〜0.85（15段階）× 法線オフセット 0/±8/±14/±20、
  フォールバックで ±26/±32/±40 を候補にし、最小ペナルティの位置を選ぶ。
- ペナルティ: label 1000 / node 1000 / arrow 500 / viewport 1000 / 線からの距離 ×2。
  すき間はラベル間4px・ノード5px。
- **配置順**: 選択ノード直結 → 1ホップ内 → その他。確定済みラベルは以後の障害物になる。
- **バックプレート**: 紙色の小さな矩形（枠線・影・角丸なし）を敷き、線が文字を貫通しないようにする。
  既存E2E「線ラベルは背景矩形を使わない」は今回の方針と矛盾するため、
  「線を隠すためだけの最小限（pill状にしない）」を検証する内容へ更新。
- 再計算は `useMemo`（選択・LOD・scope・レイアウト依存）なので、スクロール中に毎フレーム走らない。
- エッジ自体の扇形分離は既存の `getParallelEdgeRouteOffset`（同一ノード間を24px間隔）が担当済みのため据え置き。
- 検証: unit **240**（label-layout 14件を含む）/ Playwright+axe **266 passed**。
  ミニマリズムfocusで実測 **ラベル同士の重なり0件・画面外0件・全7ラベル表示**。
- **（PR #72で解消）** ラベルとノード矩形の数px重なりが密な列で残っていた（例: 「地域的展開」×ミニマリズムで約5px）。
  ラベル同士の密集は解消済み。列内はノード148〜166px幅・行間84〜88pxで空きが乏しく、
  法線方向へ逃がすとノード幅を越えるまで離れて線との対応が崩れるため、現状は最小ペナルティ配置を採用。
  改善するならノード列のレイアウト側（行間・列幅）の調整が必要。

### 追記（2026-08-09・PR #72）: 引き出し線フォールバックでノード重なりを解消

イタリア・ルネサンスfocusで「反発」が北方ルネサンスのノード上に載り、
「同時代」がどのエッジのものか分からない状態だった。

- 原因: イタリア・ルネサンスから下へ伸びる2本（→北方ルネサンス=同時代、→マニエリスム=反発）が
  ほぼ同一の縦経路を通り、先にノード間のすき間を取った方以外がノード上へ追いやられていた。
  従来の拡張オフセットは最大±40pxで、ノード幅148〜166pxを越えられなかった。
- 対応: **第3フォールバック `LABEL_LEADER_OFFSETS`（±56〜±140px）** を追加。
  ノード幅を確実に越える距離まで逃がし、`LABEL_LEADER_THRESHOLD`(44px)以上離れた場合は
  `needsLeader` を立てて **引き出し線**（1px・関係色・opacity 0.5）を描き、
  `anchor`（エッジ上の点）と結んで「どのエッジのラベルか」を示す。
- 結果（イタリア・ルネサンスfocus 実測）: **ラベル×ノード 0件 / ラベル×ラベル 0件 / 画面外 0件**、
  離れた2件に引き出し線。「同時代」も対応エッジが明確になった。
- 検証: unit **241** / Playwright+axe **268 passed**。

### 追記（2026-08-09・PR #73）: 縦に重なるエッジの分離（「線が見えない」の解消）

「同時代の線がない」「反発のラベル位置がおかしい」への対応。**PR #71 で『扇形分離は
getParallelEdgeRouteOffset で対応済み』と書いたのは誤り**だった。同関数は**同一ノード間**の
平行エッジしか扱わず、**別ペアが同じ縦経路を共有する場合**は軌道が完全一致して線が消える。

- 実例: イタリア・ルネサンス→北方ルネサンス(同時代) と マニエリスム→イタリア・ルネサンス(反発) が
  同じ列の同じ区間を通り、両方 midX=536 で重なっていた（同時代の線は長さ22pxの短い区間で、
  反発の線に完全に隠れていた）。
- **根本原因（重要）**: `getNetworkEdgeGeometry` の `curveOffset` は **y にしか加算しない**設計
  （横向きの線を上下レーンへ送るためのもの）。縦向きの線には効かないため、
  レーンオフセットを渡しても分離できなかった。
- 対応:
  1. `getNetworkEdgeGeometry` に **`lateralOffset`**（進行方向に**垂直**なずらし量）を追加。
     縦線は x 方向、横線は y 方向へ正しくずれる。
  2. `getSharedCorridorOffset`（新規）: 同じ列を縦走し **y範囲が重なる**エッジを集め、
     1本目は中央のまま2本目以降を左右交互（`NETWORK_CORRIDOR_SPACING = 22`）へ振り分ける。
- 結果: 同時代 midX=536 / 反発 midX≈547 と分離し、**両方の線が見える**状態に。
- テスト: `getSharedCorridorOffset`（同列重なり／横向き／単独／端点共有のみ）と
  `lateralOffset` が縦線を横へ動かすことを unit で固定。
- **自分のE2Eのバグも修正**: バックプレート数の検証がラベル数を先に取得してから数える実装で、
  描画確定前後で数が変わりレースしていた（1回の evaluate で同時に読むよう修正）。
- 検証: unit **245** / Playwright+axe **268 passed**。
- **既知のフレーク（本変更とは無関係）**: `network.spec.ts` の
  「ノード選択時は強調線を…」等が並列実行時のみ稀に落ちる。単独・`--repeat-each` では安定。
  変更を stash した状態でも再現するため既存の問題。別途調査の価値あり。

### 追記（2026-08-09・PR #74）: 引き出し線のノード貫通を解消／優先順位の明示

ユーザー報告「これは何？（ロマネスク美術から伸びる謎の線）」「継承などのラベルとブロックを重ねるな」。

- **正体**: PR #72 で入れた**引き出し線**が、ロマネスク美術のブロックを**貫通**していた。
  ラベル本体はノードと重なっていなかった（実測0件）が、引き出し線の経路を採点していなかった。
- 対応:
  1. `segmentIntersectsRect`（スラブ法）を追加し、**引き出し線がノードを横切る候補にペナルティ**
     （`leaderCrossesNode = 900`）。
  2. **距離ペナルティに上限**（`LABEL_MAX_DISTANCE_PENALTY_AT = 40`）。
     上限が無いと「遠いが衝突しない位置」が「近いがノードに重なる位置」に負けていた。
  3. **ノード重なりのペナルティを 1000 → 5000** に引き上げ、
     「ブロックに載らない」を他のどの衝突より優先（ユーザー指示の明文化）。
  4. ラベル高さを `fontSize + 4` に。モバイルのノード間は **84 - 58 = 26px** しかなく、
     余白を増やしすぎると隙間に入れず逆にブロック上へ載る（`LABEL_GAP.node` は 5 のまま）。
- 結果（ゴシックfocus 実測）: **引き出し線のノード貫通 0 / ラベル×ノード 0 / ラベル×ラベル 0**。
- 反省: 定数の微調整で desktop↔mobile を往復して振動させた。
  **優先順位をペナルティの大小で明示**した時点で安定した。
- 自分のE2Eの過剰要求も修正（「引き出し線が必ず1本以上」→ 近くに収まれば0本でよい）。
- 検証: unit **249** / Playwright+axe **270 passed**。
