# Project Status

**最終更新: 2026-07-24**（Phase 2 作業中）

## サマリ（事実）

| 項目 | 値 |
| --- | --- |
| バージョン | 0.1.0（package.json）。Phase 1 = 初回公開、Phase 2 = コンテンツ/画像充実（進行中） |
| 公開状況 | Phase 1 の内容が本番公開済み: https://taktak2001.github.io/art-history-atlas/ |
| リポジトリ | github.com/taktak2001/art-history-atlas（Public） |
| デフォルトブランチ | `main`（Phase 1 の成果。最新デプロイ済みtip 付近: commit `de2a443`） |
| 作業ブランチ | `claude/phase2-content-images`（Phase 2、未マージ・未PR） |
| デプロイ | main への push で GitHub Actions が自動デプロイ。Phase 2 は main 未マージのため未反映 |

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

## 実装中 / 未完了（Phase 2、これから）

- **テストの追加と実行**: 新規 unit（画像ライセンス/PD整合/alt）、UI（WorkGrid/作品詳細/比較画像）、E2E（モバイル幅、画像404フォールバック、サブパス直接アクセス、オフライン）、a11y、Lighthouse。既存 43 unit + 26 E2E は Phase 1 で緑。**Phase 2 変更後の再実行が未実施**。
- **本番相当ビルドの再確認**: `npm run build`（Phase 2 変更後に一度成功を確認済みだが、最終ゲートとして再実行推奨）。
- **モバイル/PWA の実機同等確認**: iPhone幅の作品グリッド/タイムライン/ネットワーク図/比較表/ダークモード/長い日本語タイトル/画像クレジット/セーフエリア/PWA単独起動。
- **PR 作成**: `claude/phase2-content-images` → `main` の PR（自動マージしない）。**未作成**。

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
