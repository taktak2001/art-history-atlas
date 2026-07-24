# Phase 2 編集監査記録

対象: 既存30ムーブメントの本文・作品・作家・関係エッジ・出典。
実施日: 2026-07-24 / ブランチ: `claude/phase2-content-images`

このドキュメントは、Phase 2 で行った美術史記述の監査と修正、出典管理の改善を記録する。事実・解釈・未確認を区別して記す。

## 1. 監査の観点（適用したチェック）

- 事実と解釈の混同がないか（解釈は「〜とされる」「見解の一つ」で明示）。
- 年代・発祥地に諸説がある場合に断定していないか（`dates.circa` と注記で対応）。
- 「Aへの反発としてBが誕生した」の単純化を避け、継承と断絶の両面を書いているか。
- 形式的特徴と思想・制度・技術・鑑賞者の身体との接続を書いているか。
- 西洋美術を唯一の発展経路として描いていないか（地域を独立軸に）。
- 日本美術を西洋の派生として説明していないか。
- 写真の発明を単純な「絵画の写実からの解放」として扱っていないか。

Phase 1 時点で上記方針は概ね反映済みだったため、Phase 2 では特に**重点監査項目**（戦後〜現代）に絞って精緻化した。

## 2. 修正したムーブメント

### light-and-space（ライト・アンド・スペース）

- **修正前の問題**: `contemporaryConnection` が「現代の没入型デジタルインスタレーションの直接の先駆の一つ」と述べ、teamLab 等への直線的発展史と読める余地があった。
- **修正内容**: 「関心を共有するが直接の師弟・系譜関係ではない」と明示し、**共通点**（光・知覚・環境）／**相違点**（アナログな光の制御 対 リアルタイム演算、個人 対 学際的集団、知覚の還元的探究 対 多感覚的環境体験）／**歴史的距離**（半世紀）を分けて記述。`legacy` も同様に修正。
- **出典**: `gugg-turrell`（Guggenheim）に加え `tate-turrell`（Tate, James Turrell）を追加し複数機関化。

### immersive-digital（デジタル／没入型インスタレーション）

- **修正前の問題**: `contemporaryConnection` が「バロックの巻き込み→ライト&スペース→没入型の系譜の現代的到達点」と、一本の発展史に見えた。
- **修正内容**: 「『バロック→ライト&スペース→teamLab』といった一本の発展史ではない」と明記。共通する志向（見る対象から入り込む環境へ）と、相違（技術・制作主体・興行/都市開発との結びつき）、数十年〜数世紀の歴史的隔たりを分けて記述。評価が定まっていない点も明示。
- **状態**: 出典が teamLab 公式（作家財団）2件のみ＝単一機関。`verification: 'single-source'` を維持（**要確認**として明示）。美術館による第2出典は今後の課題。

### mono-ha（もの派）

- **修正前の問題**: アルテ・ポーヴェラとの比較が欠けていた（重点監査項目）。ミニマリズムとの関係は Phase 1 で `contemporary`（同時代・相互共鳴、西洋の一方的影響ではない）と正しく設定済み。
- **修正内容**: 同時代のアルテ・ポーヴェラとの比較を追加。「日常的・自然的素材で近代産業社会・商品化を問う点で並行するが、直接の影響関係ではない。アルテ・ポーヴェラの政治性・演劇性・変容に対し、もの派は『作らない』こと・現前・関係の静けさを重んじる」と相違を明示。鑑賞ポイントにも追加。
- **出典**: `tate-arte-povera`（Tate）を追加（比較の裏づけ）。既に Guggenheim + Smarthistory の複数機関。

### postminimalism（ポストミニマリズム）

- **修正前の問題**: 出典が Tate 2件（同一機関）で `single-source`。
- **修正内容**: `tate-process-art`（プロセス・アート、より的確）＋ `moma-postminimalism`（MoMA, 第2機関）に差し替え、`verification` を `verified` へ。ミニマルへの反発と素材・過程・重力・身体という継承の両面は Phase 1 で記述済み。

### 関係エッジ

- `rel-light-space-to-immersive`: `kind` を `influence` → `shared-idea` に変更。note を「光・知覚・環境という関心を共有する。ただし直接の系譜ではなく…一本の発展史として結ばない」に修正。出典に `gugg-turrell` を追加。

### 重点監査項目の確認（修正不要と判断したもの）

- **具体 × 抽象表現主義**: `rel-abex-gutai-contemporary`（kind: contemporary, note: 「西洋の一方的影響ではない」）が適切。維持。
- **ミニマリズム × もの派**: `rel-minimalism-to-monoha`（kind: contemporary）が適切。維持。
- **コンセプチュアル・アート / スーパーフラット / デジタルアート**: Phase 1 記述が方針に適合。スーパーフラットの「ポップの大衆文化肯定を継ぐ／平面性の日本美術史的読み直し」は妥当。

## 3. 出典管理の改善

- **異なる機関による第2出典を17件追加**（MoMA×9、Tate×6、Met×2）。
  - MoMA `collection/terms/*`: cubism, futurism, dada, surrealism, abstract-expressionism, pop-art, minimalism, conceptual-art（＋post-minimalism タグ）。
  - Tate `art-terms/*`: gutai, process-art, arte-povera, romanticism, realism（＋artists/james-turrell）。
  - Met `essays/*`: post-impressionism, symbolism。
- **単一機関のみのムーブメント: 27 → 12 に減少**。
- **`single-source` のムーブメント: 2 → 1 に減少**（残: immersive-digital）。
- 出典総数: 41 → 58。
- 各出典には `supports`（どの記述を支えるか）を明記。同一出典の形式的な貼り回しを避けた。

### 到達不能URLの扱い

- 本作業環境は egress ポリシーにより外部ホストへ接続できないため、URL の到達性は自動検査していない。**ネットワーク不通と URL 不存在は区別**し、一時的な到達不能を理由に出典を自動削除していない。
- 追加した URL は WebSearch により各機関のページの実在（正確なパス）を確認した。バイト単位の取得検証は未実施。

## 4. 未確認・残課題（要確認）

- **第2機関出典が未整備（12ムーブメント）**: 先史・古代〜新古典主義の西洋古典系（ancient-greek-classical, early-christian-byzantine, gothic, italian-renaissance, northern-renaissance, mannerism, baroque, dutch-golden-age, rococo, neoclassicism）＋ superflat＋ immersive-digital。いずれも既存出典（Met/Tate/Smarthistory/Guggenheim/teamLab）は信頼できるが、単一機関。第2機関（例: 古典系は Met Heilbrunn/Smarthistory、日本現代は美術館の展覧会解説）の追加は今後の課題。
- **immersive-digital の単一機関依存**: teamLab 公式2件のみ。美術批評・美術館による二次資料の追加が望ましい（`single-source` フラグを維持）。
- 記述は入門的整理であり、逐語引用ではない。年代・解釈に学術的議論が残る項目は本文で「諸説あり」「見解の一つ」等により明示している。
