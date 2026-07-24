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

## Phase 2（進行中・作業ブランチ `claude/phase2-content-images`、未マージ・未PR）

目的: 新機能より「①作品画像の充実 ②記述の正確性 ③関係の精緻化 ④モバイル/PWA体験」。既存30件の完成度向上。

コミット履歴（古い順）:

1. `eaa06c8` スキーマ拡張（ImageMeta.alt必須 + PD/ライセンス整合の refine）、`worksOf/artistsOf` を movementId 導出化、作家 +8（Botticelli/Bosch/Parmigianino/El Greco/Gentileschi/Goya/Manet/Seurat）。
2. `8b222ca` 作品を 19→75 に拡張。実画像 **41点**（すべて Wikimedia Commons の PD、`Special:FilePath` 参照）。Géricault を作家に追加（計 +9 でこのコミット時点。合計 64）。全ムーブメント≥2作品、主要3〜5。
3. `72b131a` `WorkImage`（client, srcset/アスペクト枠/lazy/onErrorフォールバック/出典キャプション）、`WorkGrid`（詳細ページ代表作グリッド）、`CompareBoard` に代表作画像、SW に `aha-images`（上限60, cache-first）、`validate-data.ts` 拡張。
4. `0779ef5` 編集監査: Light&Space↔teamLab / もの派↔アルテ・ポーヴェラを非直線的に修正、関係エッジ修正。第2機関出典 **17件**追加（MoMA×9/Tate×6/Met×2）。単一機関 27→12、single-source movements 2→1、出典 41→58。
5. `b27c211` `docs/editorial-audit-phase2.md`（監査記録）。

Phase 2 現在の件数: movements 30 / artists **64** / works **75**（画像41/プレースホルダー34） / relationships 46 / sources **58**。

### まだ終わっていない Phase 2 作業（次にやること）

- テストの追加・実行（unit: 画像ライセンス/PD整合/alt、UI: WorkGrid/作品詳細/比較画像、E2E: モバイル幅/画像404/サブパス直接アクセス/オフライン、a11y、Lighthouse）。
- `npm run check` + `npm run build` の最終グリーン確認（Phase 2 変更後）。
- モバイル/PWA の実機同等確認。
- **PR 作成**（`claude/phase2-content-images` → `main`、自動マージしない）。**未作成**。
- （見送り→TODO）実画像 60点到達、単一機関12件の第2出典化。

## セッション切断イベントの記録（重要）

- **1回目の切断**: Phase 2 の `works.ts` 全面書き換えの Write 実行直前でワーカー再起動。再開時、`eaa06c8`（schema/dataset/artists）は**コミット済みで保全**、`works.ts` の書き換えは**未適用**だった。→ 再開して `works.ts` を書き換え、`8b222ca` としてコミット。**作業の喪失なし**（コミット境界で保護されていた）。
- **2回目の割り込み**: AI_Brain 作成の新規依頼が Phase 2 の編集監査（第2出典 wiring）中に到着。第2出典を全て wiring・検証・コミット（`0779ef5`）し、監査ドキュメントをコミット（`b27c211`）してから AI_Brain 作成に着手。→ この時点で Phase 2 のデータ/UI/SW/検証/監査は**コミット済みで保全**。未コミットの作業ツリー変更は無い想定（AI_Brain 追加分を除く）。

## 現在の進捗率（推定・推論）

- Phase 2 全体: **約75%**。
  - データ（作品/画像/出典/記述）: ~90%（画像は41/60目標で未達、単一機関12件が残るが主要部は完了）。
  - UI（グリッド/比較画像/モバイル配慮）: ~90%（実機確認が残る）。
  - PWA/性能（画像キャッシュ上限/lazy/CLS）: ~95%。
  - テスト/品質ゲート再実行: ~30%（未着手に近い。Phase 1 のテストは存在するが Phase 2 追加分と再実行が未）。
  - PR/デプロイ: 0%（未作成。デプロイは main マージ後）。
- 数値は目安。正確な現況は `Project_Status.md` と `git log main..claude/phase2-content-images` を参照。
