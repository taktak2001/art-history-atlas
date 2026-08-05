# Project Status

**最終更新: 2026-07-24**（Phase 2 統合準備完了）

## サマリ（事実）

| 項目 | 値 |
| --- | --- |
| バージョン | 0.1.0（package.json）。Phase 1 = 初回公開、Phase 2 = コンテンツ/画像充実＋横型タイムライン再設計（実装・検証完了） |
| 公開状況 | Phase 1 の内容が本番公開済み: https://taktak2001.github.io/art-history-atlas/ |
| リポジトリ | github.com/taktak2001/art-history-atlas（Public） |
| デフォルトブランチ | `main`（Phase 1 の成果。最新デプロイ済みtip 付近: commit `de2a443`） |
| 作業ブランチ | `claude/phase2-content-images`。統合PR: [#1](https://github.com/taktak2001/art-history-atlas/pull/1)（検証成功後の自動マージ対象。現在状態はGitHubを正本とする） |
| デプロイ | `main` へのマージ後、GitHub Actions が自動デプロイ |

## データ件数（現時点、作業ブランチ）

- ムーブメント: **30**
- 作家: **64**（Phase 1: 55 → +9）
- 作品: **75**（Phase 1: 19 → +56）
- 実画像（PD）: **41**（Phase 1: 0 → +41）／プレースホルダー: 34
- 関係エッジ: **46**
- 出典: **58**（Phase 1: 41 → +17）
- single-source フラグのムーブメント: **1**（immersive-digital のみ。Phase 1: 2）
- 単一機関のみのムーブメント: **12**（Phase 1: 27）

## 完了済み（Phase 2、作業ブランチにコミット済み）

1. スキーマ拡張: `ImageMeta.alt` 必須、PD判定とライセンスの整合を Zod refine で強制。
2. `worksOf`/`artistsOf` を作品・作家側の `movementIds` から導出（手動ID登録に非依存、画像付き先頭化）。
3. 作品を 19→75 に拡張。全ムーブメント≥2作品、主要は3〜5。カメラ以前の絵画を重点。
4. 実画像 41 点（すべてPD）を Wikimedia Commons `Special:FilePath` で参照。作家 +9（+Géricault で計 +10）。
5. `WorkImage`（client）: responsive srcset、固定アスペクト枠（CLS抑制）、lazy、`onError` でプレースホルダー退避、詳細でライセンス/出典キャプション。
6. `WorkGrid`: 詳細ページの代表作品グリッド。`CompareBoard`: 比較表に代表作画像を並置。
7. Service Worker: 外部画像専用キャッシュ `aha-images`（上限60、cache-first）。VERSION `v2`。
8. `validate-data.ts` 拡張: ≥2作品/PD整合/alt/タイトル重複/画像URL重複/ローカルパス実在。
9. 編集監査: Light&Space↔teamLab、もの派↔アルテ・ポーヴェラを非直線的に修正。第2機関出典17件追加。`docs/editorial-audit-phase2.md` に記録。
10. 横型タイムライン再設計: 時代ナビ、通史/古代/中世/近世/近代/現代モード、非線形の通史軸、先史・古代の要約帯、地域レーンの重なり回避、モバイル横幅制限を実装。

### Phase 2 のコミット（`claude/phase2-content-images`）
- foundation（schema/dataset/artists）
- works 75件（41画像）
- WorkImage grid / compare画像 / SW画像キャッシュ / validate拡張
- 編集監査 + 第2出典
- editorial-audit-phase2.md

## 最終検証（Phase 2）

- `npm run check`: 成功（typecheck、lint 0件、データ検証、unit 53件）。
- `npm run build`: 成功（本番 `basePath` 付き静的ビルド、181ページ）。
- Playwright E2E + a11y: desktop/mobile 合計36件成功。
- 統合PR [#1](https://github.com/taktak2001/art-history-atlas/pull/1) を作成。必要な検証成功後は自動マージしてよい。

## 未着手（Phase 2 の範囲だが今回見送り、TODO化）

- 実画像 60 点への到達（現在41。残りは主に古典系のPD絵画・CC-BYの3D/建築で拡張可能）。
- 単一機関ムーブメント 12件の第2機関出典化（古典系＋superflat＋immersive-digital）。

## 既知の問題 / 制約（事実）

- **サンドボックス egress 制約**: 画像・美術館ホスト（upload.wikimedia.org / metmuseum.org 等）への接続が組織ポリシーで 403 拒否。→ 画像のダウンロード・WebP変換・**バイト単位検証は不可**。画像は Commons のファイル名を WebSearch で確認し、`Special:FilePath` を hotlink する方式（`Image_Policy.md` の検証レベル参照）。
- 実画像 41/60（目標未達、要フォロー）。
- `immersive-digital` は teamLab 公式のみ＝単一機関・`single-source`（要確認フラグ維持）。
- 12ムーブメントが単一機関出典（信頼できるが1機関）。
- 画像 `onError` フォールバックにより、万一 URL が不正でも本番で壊れ画像は出ない（プレースホルダー表示）。ただし各URLの実表示は実機/本番で最終確認するのが望ましい。

## 次 Phase（Phase 3 想定）

- 画像 60点到達 + CC-BY（3D/建築/日本現代）の帰属付き収録。
- 全ムーブメント2機関出典化。
- 学習コース / 年代横断比較（中期）。詳細 `TODO.md`。

## 追加機能: 関係ネットワークの deep-link フォーカス（2026-07-26）

- 詳細ページ → `/network/?focus=<id>` で対象ノードを選択・中央寄せ・1ホップ強調して到達。URLが選択状態の単一の真実（reload/共有/戻るに対応、無効idは静かに除去）。
- 実装は `window.history` ベース（`useLodState` と同方針）で静的export/basePathを保つ。`src/lib/network.ts` に純粋関数を分離し単体テスト化。
- 検証: unit 146件 / E2E 226件成功・12 skipped / 本番ビルド成功。作業ブランチ `claude/art-history-atlas-o632td`（現行 `main` a914298 基点）。
- 既知の運用リスク: Codex と並行作業で `main` の進行が速い。ブランチ/PR取り違えに注意。

## 追加機能: 画像「引用(quotation)」利用根拠の仕組み（2026-08-05）

- `ImageMeta` に `usageBasis`（public-domain / licensed / quotation / unavailable）と `QuotationMeta`（必須13フィールド）・`ReviewStatus`・`QuotationPurpose` を追加。整合性は superRefine で強制。
- 表示ポリシー `src/lib/image-usage.ts`（`canDisplayImageOnSurface` / `isQuotationPublishable`）。`WorkImage` は許可サーフェスでのみ quotation を「画像引用」クレジット付きで描画。詳細ページ＝分析、Movement カタログ＝gallery（quotation非表示）。
- `scripts/validate-data.ts` に引用要件チェックを追加。unit テスト `tests/unit/image-usage.test.ts`（12件）。
- **仕組みのみ実装**。image:null 作品は自動 quotation 化していない。引用候補（5点以内）は別途一覧提示 → ユーザー承認後に本番反映。
- 検証: typecheck / lint 0件 / unit（image-usage 12件含む）/ validate:data 成功。

## imageReference 全件監査（2026-08-06・PR [#62](https://github.com/taktak2001/art-history-atlas/pull/62)）

- 最終 `image === null` の**38作品すべて**に調査・審査用の `Work.imageReference` を付与（URL未発見 0）。
  本番表示とは分離（画像は null のまま、詳細ページに「提供元で作品を見る ↗」外部リンクのみ）。
- 内訳: 公式作品ページあり 36 / PD候補 2（藍瑛=AIC CC0 確認済・ミュシャ=要レビュー）/ 引用候補 5（PR #61）
  / 許諾必要 29 / 権利不明 2 / 未解決 2。捏造URLなし・`candidateFileUrl` は AIC IIIF の1点のみ。
- 追加物: `src/data/expansion/image-references.ts` / `docs/image-reference-audit.md`（自動生成）
  / `scripts/gen-image-reference-audit.ts` / `tests/unit/image-reference.test.ts`（10件）。スキーマ・
  `validate-data.ts` に検証を追加。
- 検証: typecheck / lint / validate:data / unit **204** / E2E+axe **250** / 静的ビルド すべて成功。
