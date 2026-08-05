import type { ImageReference, Work } from '@/lib/schema';

/**
 * 画像未収録（applyImageSupplements 適用後に image === null）作品の調査・審査用参照情報。
 *
 * 方針（docs/image-rights.md / docs/image-reference-audit.md と整合）:
 * - ここに URL があっても本番で画像は表示しない（image は null のまま）。
 * - sourcePageUrl は原則として所蔵館・財団・公的機関の作品ページを最優先。
 *   Wikipedia / Pinterest / SNS / 販売サイト / 個人ブログを第一出典にしない。
 * - candidateFileUrl は「直接の画像ファイルURLを特定できた」場合のみ。推測で作らない。
 * - 20世紀・現代美術は原則 permission-required / rights-unclear / quotation-candidate とし、
 *   verificationStatus は rights-review-required を維持する（写真・記録画像の権利も別途判定）。
 * - PR #61 の引用審査5点は quotation-candidate・rights-review-required を保持し、image は null のまま。
 *
 * accessed はいずれも 2026-08-06（本監査の参照日）。
 */

const ACCESSED = '2026-08-06';

const references: Record<string, ImageReference> = {
  /* ---------------------------------------------------------------- *
   * 古典・東アジア（PD / Open Access 候補）
   * ---------------------------------------------------------------- */
  'work-lan-ying-after-ni-zan': {
    sourcePageUrl:
      'https://www.artic.edu/artworks/204587/landscape-in-the-style-of-ancient-masters-after-ni-zan-1301-1374',
    provider: 'The Art Institute of Chicago',
    candidateFileUrl:
      'https://www.artic.edu/iiif/2/97ff9a90-1148-5ffa-ba6e-714db56bf4d6/full/843,/0/default.jpg',
    termsUrl: 'https://www.artic.edu/image-licensing',
    rightsStatus: 'public-domain-candidate',
    copyrightNotice: 'CC0 Public Domain (The Art Institute of Chicago)',
    creditLine: 'The Art Institute of Chicago, Samuel M. Nickerson Fund',
    accessed: ACCESSED,
    verificationStatus: 'url-verified',
    verificationNote:
      'AIC公開API(api.artic.edu artworks/204587)で is_public_domain=true・藍瑛(1585–c.1664)・17世紀前半・倪瓚に倣う山水を確認。二次元作品の忠実な複製で、提供元がPD/CC0を明示。IIIFは公式配信エンドポイント。',
  },
  'work-mucha-camelias': {
    sourcePageUrl: 'https://www.muchafoundation.org/en/gallery/browse-works/object/23',
    provider: 'Mucha Foundation (Mucha Trust Collection)',
    rightsStatus: 'public-domain-candidate',
    copyrightNotice: '© Mucha Trust（作品自体はミュシャ没後PD、掲載画像は財団が権利表示）',
    creditLine: 'Mucha Foundation',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'ミュシャ(d.1939)により作品自体はPD候補（1896年カラーリトグラフ・二次元）。ただし財団掲載画像は「© Mucha Trust」表示のため、本番使用には美術館/Wikimedia CommonsのPDスキャン等、別途クリーンなPD画像の調達が必要。',
  },

  /* ---------------------------------------------------------------- *
   * 20世紀・現代美術：所蔵館の作品ページ（permission-required / rights-review-required）
   * ---------------------------------------------------------------- */
  'work-demoiselles-avignon': {
    sourcePageUrl: 'https://www.moma.org/collection/works/79766',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'MoMA所蔵の作品単独ページ。ピカソ(d.1973)により著作権保護期間内。二次元だが権利者許諾が必要で本番表示はレビュー必須。',
  },
  'work-portrait-vollard': {
    sourcePageUrl: 'https://collection.pushkinmuseum.art/entity/OBJECT/77613',
    provider: 'The Pushkin State Museum of Fine Arts, Moscow',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'プーシキン美術館の公式オンライン目録の作品ページ（ピカソ《アンブロワーズ・ヴォラールの肖像》1910）。ピカソ(d.1973)により著作権保護期間内。',
  },
  'work-dynamism-dog': {
    sourcePageUrl:
      'https://buffaloakg.org/artworks/196416-dinamismo-di-un-cane-al-guinzaglio-dynamism-dog-leash',
    provider: 'Buffalo AKG Art Museum (Albright-Knox)',
    rightsStatus: 'permission-required',
    creditLine:
      'Buffalo AKG Art Museum; Bequest of A. Conger Goodyear and Gift of George F. Goodyear, 1964',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'Buffalo AKG所蔵の作品単独ページ。バッラ(d.1958)により保護期間内（伊: 没後70年）。本番表示は権利レビュー必須。',
  },
  'work-fountain': {
    sourcePageUrl: 'https://www.tate.org.uk/art/artworks/duchamp-fountain-t07573',
    provider: 'Tate',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'Tate所蔵の1964年レプリカの作品ページ（オリジナル1917は消失）。デュシャン作品の著作権に加え、レディメイド撮影写真の権利も別途判定が必要。',
  },
  'work-persistence-memory': {
    sourcePageUrl: 'https://www.moma.org/collection/works/79018',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'MoMA所蔵の作品単独ページ。ダリ(d.1989)により保護期間内。本番表示は権利者許諾のレビュー必須。',
  },
  'work-son-of-man': {
    sourcePageUrl: 'https://www.musee-magritte-museum.be/en',
    provider: 'Musée Magritte Museum, Brussels（作家の権威ある美術館。本作は個人蔵）',
    rightsStatus: 'rights-unclear',
    accessed: ACCESSED,
    verificationStatus: 'unresolved',
    verificationNote:
      '《人の子》(1964)は個人蔵で、所蔵先の作品単独ページが存在しない。マグリット作品の権威ある機関（ブリュッセルのマグリット美術館）を暫定の作家ページとして記載。作品単独の安定ページは未確認＝監査レポートの未解決事項に記載。マグリット(d.1967)により保護期間内。',
  },
  'work-autumn-rhythm': {
    sourcePageUrl: 'https://www.metmuseum.org/art/collection/search/488978',
    provider: 'The Metropolitan Museum of Art, New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'Met所蔵の作品単独ページ。ポロック(d.1956)により保護期間内で、MetのOpen Access対象外。本番表示は権利レビュー必須。',
  },
  'work-rothko-no61': {
    sourcePageUrl:
      'https://www.moca.org/collection/work/no-61-rust-and-blue-brown-blue-brown-on-blue',
    provider: 'The Museum of Contemporary Art (MOCA), Los Angeles',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'MOCA所蔵（Panza Collection）の作品単独ページ。ロスコ(d.1970)により保護期間内。本番表示は権利レビュー必須。',
  },
  'work-electric-dress': {
    sourcePageUrl: 'https://artplatform.go.jp/collections/W411501',
    provider: 'Art Platform Japan（所蔵：高松市美術館）',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'Art Platform Japanの作品ページ（所蔵：高松市美術館。現存品は1986年の再制作）。田中敦子(d.2005)により保護期間内。インスタレーション撮影写真の権利も別途判定が必要。',
  },
  'work-campbells-soup': {
    sourcePageUrl: 'https://www.moma.org/collection/works/79809',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'MoMA所蔵の作品単独ページ。ウォーホル(d.1987)により保護期間内。本番表示は権利レビュー必須。',
  },
  'work-marilyn-diptych': {
    sourcePageUrl: 'https://www.tate.org.uk/art/artworks/warhol-marilyn-diptych-t03093',
    provider: 'Tate',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'Tate所蔵の作品単独ページ。ウォーホル(d.1987)により保護期間内。本番表示は権利レビュー必須。',
  },
  'work-flavin-monument': {
    sourcePageUrl: 'https://www.moma.org/collection/works/81337',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'MoMA所蔵《"monument" 1 for V. Tatlin》(1964) の作品ページ。本データの作品(1966–69)は同シリーズ（全39点）の一部で、これを代表ページとして参照。フレイヴィン(d.1996)により保護期間内。蛍光灯インスタレーションの記録写真の権利も別途判定。',
  },
  'work-judd-untitled-stack': {
    sourcePageUrl: 'https://www.moma.org/collection/works/81324',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'quotation-candidate',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'PR #61 引用審査5点。引用目的=構図の分析。MoMA所蔵《Untitled》(1967, スタック)の作品ページ。ジャッド(d.1994)保護期間内。image は null のまま維持、legal-review-required 相当。',
  },
  'work-one-and-three-chairs': {
    sourcePageUrl: 'https://www.moma.org/collection/works/81435',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'quotation-candidate',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'PR #61 引用審査5点。引用目的=図像・主題の批評。MoMA所蔵の作品ページ。コスース(b.1945)により保護期間内。image は null のまま維持、legal-review-required 相当。',
  },
  'work-lewitt-wall-drawing': {
    sourcePageUrl: 'https://www.moma.org/collection/works/79898',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'MoMA所蔵《Wall Drawing #260》(1975) を代表ページとして参照（本データは1968年以降の概念作でシリーズ的性格）。ルウィット(d.2007)保護期間内。実施ごとの記録写真の権利も別途判定。',
  },
  'work-hesse-hang-up': {
    sourcePageUrl: 'https://www.artic.edu/artworks/71396/hang-up',
    provider: 'The Art Institute of Chicago',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'AIC所蔵の作品単独ページ。ヘス(d.1970)保護期間内で、立体作品の撮影写真の権利も別途判定が必要。',
  },
  'work-serra-splashing': {
    sourcePageUrl: 'https://www.sfmoma.org/artwork/91.30/',
    provider: 'San Francisco Museum of Modern Art (SFMOMA)',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      '本データ《飛散/キャスティング》(1968–69) のオリジナルは消失。SFMOMA所蔵の同系スプラッシュ/キャスト作《Gutter Corner Splash: Night Shift》(1969/1995) を、美術館所蔵の関連作として参照。セラ(d.2024)保護期間内。',
  },
  'work-turrell-ganzfeld': {
    sourcePageUrl: 'https://jamesturrell.com/',
    provider: 'James Turrell（公式サイト／アーカイブ）',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'ガンツフェルトは会場ごとに再制作されるサイト固有のシリーズで単独の恒久ページがない。作家公式サイトを暫定参照。タレル(b.1943)保護期間内。空間・光のインスタレーション写真の権利も別途判定。',
  },
  'work-irwin-scrim': {
    sourcePageUrl: 'https://whitney.org/exhibitions/robert-irwin',
    provider: 'Whitney Museum of American Art, New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'ホイットニー所蔵《Scrim veil—Black rectangle—Natural light》(1977) を代表参照（本データは1970年代以降のスクリム作）。アーウィン(d.2023)保護期間内。会場固有インスタレーション写真の権利も別途判定。',
  },
  'work-sekine-phase-earth': {
    sourcePageUrl:
      'https://artsandculture.google.com/asset/phase-mother-earth-1-sekine-nobuo/HgEveLTj-sy0Nw',
    provider: 'Google Arts & Culture（機関提携ページ）',
    rightsStatus: 'quotation-candidate',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'PR #61 引用審査5点。引用目的=ムーブメント間の視覚的差異の説明。1968年の神戸・須磨離宮公園での野外作（一時設置、後に再制作）。Google Arts & Cultureの機関提携ページを参照。関根(d.2019)保護期間内。image は null のまま維持。',
  },
  'work-lee-relatum': {
    sourcePageUrl: 'https://museumcollection.tokyo/en/works/6380950/',
    provider: 'Tokyo Museum Collection（東京都現代美術館 ほか）',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      '東京都のミュージアムコレクション（ToMuCo）所蔵の《Relatum》作品ページ。李禹煥(b.1936)保護期間内。石・鉄板の立体作品の撮影写真の権利も別途判定。',
  },
  'work-murakami-727': {
    sourcePageUrl: 'https://www.moma.org/collection/works/88960',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'MoMA所蔵の作品単独ページ。村上隆(b.1962)保護期間内。本番表示は権利レビュー必須。',
  },
  'work-murakami-flowers': {
    sourcePageUrl: 'https://www.kaikaikiki.com/en/projects/murakami-flowers/',
    provider: 'Kaikai Kiki Co., Ltd.（作家スタジオ公式）',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      '村上隆の制作会社カイカイキキ公式の「Murakami.Flowers」プロジェクトページ。村上隆(b.1962)保護期間内。本番表示は権利レビュー必須。',
  },
  'work-teamlab-borderless': {
    sourcePageUrl: 'https://www.teamlab.art/e/tokyo/',
    provider: 'teamLab（公式）',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'teamLab公式サイトのteamLab Borderless（麻布台ヒルズ）ページ。teamLabの現行著作物。没入型デジタルインスタレーションの画像は許諾が必要。',
  },
  'work-teamlab-crystal': {
    sourcePageUrl: 'https://www.teamlab.art/w/crystalworld/',
    provider: 'teamLab（公式）',
    imagePageUrl: 'https://www.teamlab.art/ew/flowerforest/',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'teamLab公式の《Crystal World》作品ページ（関連の《Forest of Flowers and People》を imagePageUrl に併記）。teamLabの現行著作物で許諾が必要。',
  },
  'work-brandt-tea-infuser': {
    sourcePageUrl: 'https://www.metmuseum.org/art/collection/search/491299',
    provider: 'The Metropolitan Museum of Art, New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'Met所蔵《Tea Infuser and Strainer》(1924) の作品単独ページ。ブラント(d.1983)によりデザイン著作権は保護期間内。本番表示は権利レビュー必須。',
  },
  'work-tapies-grey-green': {
    sourcePageUrl: 'https://www.tate.org.uk/art/artworks/tapies-grey-and-green-painting-t00471',
    provider: 'Tate',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'Tate所蔵の作品単独ページ。タピエス(d.2012)保護期間内。本番表示は権利レビュー必須。',
  },
  'work-fautrier-hostage': {
    sourcePageUrl: 'https://www.centrepompidou.fr/fr/ressources/oeuvre/c6b98Ez',
    provider: 'Centre Pompidou — Musée national d’art moderne, Paris',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'ポンピドゥー・センター所蔵《Tête d’otage》の作品ページ（Otagesシリーズ 1943–45）。フォートリエ(d.1964)保護期間内（仏: 没後70年で2035年まで）。',
  },
  'work-cut-with-kitchen-knife': {
    sourcePageUrl: 'https://search.smb.museum/object/obj-961048',
    provider: 'Nationalgalerie, Staatliche Museen zu Berlin',
    rightsStatus: 'quotation-candidate',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'PR #61 引用審査5点。引用目的=技法の比較。ベルリン国立美術館群(SMB)公式コレクションの作品ページ。ヘーヒ(d.1978)保護期間内。image は null のまま維持、legal-review-required 相当。',
  },
  'work-challenging-mud': {
    sourcePageUrl: 'https://smarthistory.org/shiraga-kazuo-challenging-mud/',
    provider: 'Smarthistory（美術史教育機関）',
    imagePageUrl: 'https://artplatform.go.jp/artists/A1478',
    rightsStatus: 'quotation-candidate',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'PR #61 引用審査5点。引用目的=技法の比較。《泥に挑む》(1955)は第1回具体展のパフォーマンスで原状は非現存。作品単独の美術館ページがないため、Smarthistoryの単独解説ページを参照（Art Platform Japanの作家ページを併記）。白髪(d.2008)およびパフォーマンス記録写真の権利を別途判定。image は null のまま維持。',
  },
  'work-ono-grapefruit': {
    sourcePageUrl: 'https://www.moma.org/collection/works/128103',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'MoMA所蔵《Grapefruit》(1964, アーティストブック) の作品ページ。オノ・ヨーコ(b.1933)保護期間内。本番表示は権利レビュー必須。',
  },
  'work-maciunas-fluxkit': {
    sourcePageUrl: 'https://www.moma.org/collection/works/126323',
    provider: 'The Museum of Modern Art (MoMA), New York',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'MoMA所蔵《Fluxkit》(1965–66) の作品ページ。マチューナスほか複数作家の共同作で保護期間内。本番表示は権利レビュー必須。',
  },
  'work-merz-igloo': {
    sourcePageUrl: 'https://www.fondazionemerz.org/en/mario-merz/',
    provider: 'Fondazione Merz, Turin（作家財団）',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'マリオ・メルツ財団（Fondazione Merz）の作家公式ページ。《イグルー》は1968年以降の連作で単独恒久ページがないため財団ページを参照。メルツ(d.2003)保護期間内。',
  },
  'work-kounellis-horses': {
    sourcePageUrl: 'https://www.tate.org.uk/art/artists/jannis-kounellis-1438',
    provider: 'Tate（作家ページ。本作は恒久所蔵先なし）',
    rightsStatus: 'rights-unclear',
    accessed: ACCESSED,
    verificationStatus: 'unresolved',
    verificationNote:
      '《無題（12頭の馬）》(1969) はローマのGalleria L’Atticoでの上演で、恒久所蔵の作品単独ページが存在しない（後年に各地で再演）。Tateの作家ページを暫定参照。作品単独の安定ページは未確認＝監査レポートの未解決事項に記載。クネリス(d.2017)保護期間内。',
  },
  'work-smithson-spiral-jetty': {
    sourcePageUrl:
      'https://diaart.org/collection/collection/smithson-robert-spiral-jetty-1970-1999-014/',
    provider: 'Dia Art Foundation',
    imagePageUrl: 'https://holtsmithsonfoundation.org/spiral-jetty',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'Dia Art Foundation所蔵の《Spiral Jetty》(1970) 作品ページ（Holt/Smithson財団ページを imagePageUrl に併記）。スミッソン(d.1973)保護期間内。アースワークの撮影写真の権利も別途判定。',
  },
  'work-long-line-walking': {
    sourcePageUrl: 'https://www.tate.org.uk/art/artworks/long-a-line-made-by-walking-p07149',
    provider: 'Tate',
    rightsStatus: 'permission-required',
    accessed: ACCESSED,
    verificationStatus: 'rights-review-required',
    verificationNote:
      'Tate所蔵《A Line Made by Walking》(1967) の作品ページ。作品自体が作家撮影の写真作品で、ロング(b.1945)保護期間内。本番表示は権利レビュー必須。',
  },
};

/**
 * image === null の作品に imageReference を付与する。
 * 既に image を持つ作品には付与しない（imageReference は未収録作品専用）。
 */
export const applyImageReferences = (records: Work[]): Work[] =>
  records.map((work) => {
    const reference = references[work.id];
    if (!reference) return work;
    if (work.image !== null) return work;
    return { ...work, imageReference: reference };
  });

/** 監査・テスト用に参照マップを公開する。 */
export const imageReferences = references;
