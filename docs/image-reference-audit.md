# 画像参照（imageReference）全件監査

> 自動生成: `npx tsx scripts/gen-image-reference-audit.ts`
> 基準: `applyImageSupplements` → `applyImageReferences` 適用後の最終 `works`。

本監査は「URLを付けること」と「画像を本番表示可能にすること」を**分離**する。
ここに列挙した作品はすべて `image === null` のままであり、`imageReference` は
調査・審査用のメタデータである。URLが付いていることは本番表示の根拠にならない。

## 集計

| 指標 | 件数 |
| --- | ---: |
| 総作品数 | 139 |
| 最終的に画像あり | 101 |
| 最終的に画像なし（監査対象） | 38 |
| URL追加済み（imageReference あり） | 38 |
| 公式作品ページあり（unresolved 以外） | 36 |
| 直接画像URL候補あり（candidateFileUrl） | 1 |
| 利用条件URLあり（termsUrl） | 1 |
| PD/Open Access 候補 | 2 |
| 引用候補（quotation-candidate） | 5 |
| 許諾必要（permission-required） | 29 |
| 権利不明（rights-unclear） | 2 |
| URLを発見できなかった件数 | 0 |

### verificationStatus 内訳

| 状態 | 件数 |
| --- | ---: |
| url-verified | 1 |
| metadata-verified | 0 |
| rights-review-required | 35 |
| unresolved | 2 |

## 未解決事項

- **無題（12頭の馬）**（work-kounellis-horses）: 《無題（12頭の馬）》(1969) はローマのGalleria L’Atticoでの上演で、恒久所蔵の作品単独ページが存在しない（後年に各地で再演）。Tateの作家ページを暫定参照。作品単独の安定ページは未確認＝監査レポートの未解決事項に記載。クネリス(d.2017)保護期間内。
- **人の子**（work-son-of-man）: 《人の子》(1964)は個人蔵で、所蔵先の作品単独ページが存在しない。マグリット作品の権威ある機関（ブリュッセルのマグリット美術館）を暫定の作家ページとして記載。作品単独の安定ページは未確認＝監査レポートの未解決事項に記載。マグリット(d.1967)により保護期間内。

すべての画像未収録作品に imageReference を付与済み（URLを発見できなかった作品は 0 件）。

## 全件一覧

| workId | 作品名 | 作者 | 現在のimage | sourcePageUrl | imagePageUrl | fileUrl候補 | provider | rightsStatus | termsUrl | verificationStatus | 未解決事項/備考 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| work-autumn-rhythm | 秋のリズム（No.30） | ジャクソン・ポロック | null | [link](https://www.metmuseum.org/art/collection/search/488978) | — | — | The Metropolitan Museum of Art, New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-brandt-tea-infuser | ティー・インフューザーとストレーナー | マリアンネ・ブラント | null | [link](https://www.metmuseum.org/art/collection/search/491299) | — | — | The Metropolitan Museum of Art, New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-campbells-soup | キャンベルのスープ缶 | アンディ・ウォーホル | null | [link](https://www.moma.org/collection/works/79809) | — | — | The Museum of Modern Art (MoMA), New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-challenging-mud | 泥に挑む | 白髪一雄 | null | [link](https://smarthistory.org/shiraga-kazuo-challenging-mud/) | [link](https://artplatform.go.jp/artists/A1478) | — | Smarthistory（美術史教育機関） | quotation-candidate | — | rights-review-required | 引用審査中（PR #61）・本番未表示 |
| work-cut-with-kitchen-knife | 台所ナイフで切り裂く（ダダ・フォトモンタージュ） | ハンナ・ヘーヒ | null | [link](https://search.smb.museum/object/obj-961048) | — | — | Nationalgalerie, Staatliche Museen zu Berlin | quotation-candidate | — | rights-review-required | 引用審査中（PR #61）・本番未表示 |
| work-demoiselles-avignon | アヴィニョンの娘たち | パブロ・ピカソ | null | [link](https://www.moma.org/collection/works/79766) | — | — | The Museum of Modern Art (MoMA), New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-dynamism-dog | 鎖につながれた犬のダイナミズム | ジャコモ・バッラ | null | [link](https://buffaloakg.org/artworks/196416-dinamismo-di-un-cane-al-guinzaglio-dynamism-dog-leash) | — | — | Buffalo AKG Art Museum (Albright-Knox) | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-electric-dress | 電気服 | 田中敦子 | null | [link](https://artplatform.go.jp/collections/W411501) | — | — | Art Platform Japan（所蔵：高松市美術館） | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-fautrier-hostage | 人質（シリーズ） | ジャン・フォートリエ | null | [link](https://www.centrepompidou.fr/fr/ressources/oeuvre/c6b98Ez) | — | — | Centre Pompidou — Musée national d’art moderne, Paris | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-flavin-monument | V・タトリンのための「記念碑」 | ダン・フレイヴィン | null | [link](https://www.moma.org/collection/works/81337) | — | — | The Museum of Modern Art (MoMA), New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-fountain | 泉 | マルセル・デュシャン（R. Mutt名義） | null | [link](https://www.tate.org.uk/art/artworks/duchamp-fountain-t07573) | — | — | Tate | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-hesse-hang-up | ハング・アップ | エヴァ・ヘス | null | [link](https://www.artic.edu/artworks/71396/hang-up) | — | — | The Art Institute of Chicago | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-irwin-scrim | 無題（スクリム・インスタレーション） | ロバート・アーヴィン | null | [link](https://whitney.org/exhibitions/robert-irwin) | — | — | Whitney Museum of American Art, New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-judd-untitled-stack | 無題（スタック） | ドナルド・ジャッド | null | [link](https://www.moma.org/collection/works/81324) | — | — | The Museum of Modern Art (MoMA), New York | quotation-candidate | — | rights-review-required | 引用審査中（PR #61）・本番未表示 |
| work-kounellis-horses | 無題（12頭の馬） | ヤニス・クネリス | null | [link](https://www.tate.org.uk/art/artists/jannis-kounellis-1438) | — | — | Tate（作家ページ。本作は恒久所蔵先なし） | rights-unclear | — | unresolved | 作品単独/安定画像ページ未確認・要追加調査 |
| work-lan-ying-after-ni-zan | 古人に倣う山水・倪瓚風 | 藍瑛 | null | [link](https://www.artic.edu/artworks/204587/landscape-in-the-style-of-ancient-masters-after-ni-zan-1301-1374) | — | [link](https://www.artic.edu/iiif/2/97ff9a90-1148-5ffa-ba6e-714db56bf4d6/full/843,/0/default.jpg) | The Art Institute of Chicago | public-domain-candidate | [link](https://www.artic.edu/image-licensing) | url-verified | PD候補（本番表示は別途レビュー） |
| work-lee-relatum | 関係項 | 李禹煥 | null | [link](https://museumcollection.tokyo/en/works/6380950/) | — | — | Tokyo Museum Collection（東京都現代美術館 ほか） | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-lewitt-wall-drawing | ウォール・ドローイング | ソル・ルウィット | null | [link](https://www.moma.org/collection/works/79898) | — | — | The Museum of Modern Art (MoMA), New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-long-line-walking | 歩行によって作られた線 | リチャード・ロング | null | [link](https://www.tate.org.uk/art/artworks/long-a-line-made-by-walking-p07149) | — | — | Tate | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-maciunas-fluxkit | フラックスキット | ジョージ・マチューナスほか | null | [link](https://www.moma.org/collection/works/126323) | — | — | The Museum of Modern Art (MoMA), New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-marilyn-diptych | マリリン・ディプティック | アンディ・ウォーホル | null | [link](https://www.tate.org.uk/art/artworks/warhol-marilyn-diptych-t03093) | — | — | Tate | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-merz-igloo | イグルー（連作） | マリオ・メルツ | null | [link](https://www.fondazionemerz.org/en/mario-merz/) | — | — | Fondazione Merz, Turin（作家財団） | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-mucha-camelias | 椿姫 | アルフォンス・ミュシャ | null | [link](https://www.muchafoundation.org/en/gallery/browse-works/object/23) | — | — | Mucha Foundation (Mucha Trust Collection) | public-domain-candidate | — | rights-review-required | PD候補（本番表示は別途レビュー） |
| work-murakami-727 | 727 | 村上隆 | null | [link](https://www.moma.org/collection/works/88960) | — | — | The Museum of Modern Art (MoMA), New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-murakami-flowers | お花（スーパーフラットの花） | 村上隆 | null | [link](https://www.kaikaikiki.com/en/projects/murakami-flowers/) | — | — | Kaikai Kiki Co., Ltd.（作家スタジオ公式） | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-one-and-three-chairs | 一つと三つの椅子 | ジョセフ・コスース | null | [link](https://www.moma.org/collection/works/81435) | — | — | The Museum of Modern Art (MoMA), New York | quotation-candidate | — | rights-review-required | 引用審査中（PR #61）・本番未表示 |
| work-ono-grapefruit | グレープフルーツ | オノ・ヨーコ | null | [link](https://www.moma.org/collection/works/128103) | — | — | The Museum of Modern Art (MoMA), New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-persistence-memory | 記憶の固執 | サルバドール・ダリ | null | [link](https://www.moma.org/collection/works/79018) | — | — | The Museum of Modern Art (MoMA), New York | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-portrait-vollard | アンブロワーズ・ヴォラールの肖像 | パブロ・ピカソ | null | [link](https://collection.pushkinmuseum.art/entity/OBJECT/77613) | — | — | The Pushkin State Museum of Fine Arts, Moscow | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-rothko-no61 | No. 61（錆色と青） | マーク・ロスコ | null | [link](https://www.moca.org/collection/work/no-61-rust-and-blue-brown-blue-brown-on-blue) | — | — | The Museum of Contemporary Art (MOCA), Los Angeles | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-sekine-phase-earth | 位相―大地 | 関根伸夫 | null | [link](https://artsandculture.google.com/asset/phase-mother-earth-1-sekine-nobuo/HgEveLTj-sy0Nw) | — | — | Google Arts & Culture（機関提携ページ） | quotation-candidate | — | rights-review-required | 引用審査中（PR #61）・本番未表示 |
| work-serra-splashing | 飛散（キャスティング） | リチャード・セラ | null | [link](https://www.sfmoma.org/artwork/91.30/) | — | — | San Francisco Museum of Modern Art (SFMOMA) | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-smithson-spiral-jetty | スパイラル・ジェティ | ロバート・スミッソン | null | [link](https://diaart.org/collection/collection/smithson-robert-spiral-jetty-1970-1999-014/) | [link](https://holtsmithsonfoundation.org/spiral-jetty) | — | Dia Art Foundation | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-son-of-man | 人の子 | ルネ・マグリット | null | [link](https://www.musee-magritte-museum.be/en) | — | — | Musée Magritte Museum, Brussels（作家の権威ある美術館。本作は個人蔵） | rights-unclear | — | unresolved | 作品単独/安定画像ページ未確認・要追加調査 |
| work-tapies-grey-green | 灰色と緑の絵画 | アントニ・タピエス | null | [link](https://www.tate.org.uk/art/artworks/tapies-grey-and-green-painting-t00471) | — | — | Tate | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-teamlab-borderless | teamLab Borderless（境界のない世界） | teamLab | null | [link](https://www.teamlab.art/e/tokyo/) | — | — | teamLab（公式） | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-teamlab-crystal | クリスタル・ワールド／花と人の森 | teamLab | null | [link](https://www.teamlab.art/w/crystalworld/) | [link](https://www.teamlab.art/ew/flowerforest/) | — | teamLab（公式） | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |
| work-turrell-ganzfeld | ガンツフェルト（光の空間） | ジェームズ・タレル | null | [link](https://jamesturrell.com/) | — | — | James Turrell（公式サイト／アーカイブ） | permission-required | — | rights-review-required | 本番表示前に権利レビュー必須 |

## 方針メモ

- 20世紀・現代美術は原則 `permission-required` / `rights-unclear` / `quotation-candidate` とし、
  `verificationStatus` は `rights-review-required` を維持する。
- 彫刻・建築・インスタレーション・パフォーマンスは、作品著作権に加えて撮影者の権利を別途判定する
  （写真を自動的にPD扱いしない）。
- `public-domain-candidate` は忠実な二次元複製かつ提供元がPD/Open Accessを明示している場合に限る。
  現状の該当は AIC（藍瑛、CC0確認済み）と ミュシャ（作品自体はPD／掲載画像は © Mucha Trust のため要レビュー）。
- PR #61 の引用審査5点（コスース／ジャッド／ヘーヒ／白髪／関根）は `quotation-candidate` を保持し、
  `image` は `null` のまま。本番表示は編集・法務レビュー通過が前提。
