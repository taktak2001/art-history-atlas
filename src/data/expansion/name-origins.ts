import type { Movement, MovementNameOrigin } from '@/lib/schema';

/**
 * 名称の由来は、様式そのものの説明とは分けて管理する。
 * 当事者の自己命名、批評語、後世の分類を区別し、確証のない命名者は記録しない。
 */
const NAME_ORIGINS: Record<string, MovementNameOrigin> = {
  'prehistoric-ritual': {
    summary:
      '「先史美術」は、文字史料が残る以前の造形をまとめる近代の研究上の呼称です。当時の制作者が自ら掲げた運動名ではありません。',
    originalTerm: 'Prehistoric Art',
    literalMeaning: '文字で記録された歴史以前の美術',
    context: '考古学・美術史による後世の時代分類',
    certainty: 'established',
    sourceIds: ['met-lascaux', 'smarthistory-venus-willendorf'],
  },
  'ancient-greek-classical': {
    summary:
      '「古典」は、後世に規範とみなされたギリシアの造形を示す時代区分です。古代の多様な制作を、近代美術史が一つの運動として整理した名称ではありません。',
    originalTerm: 'Classical Greek Art',
    literalMeaning: '規範とされる古代ギリシアの美術',
    context: '後世の美術史による時代・様式分類',
    certainty: 'established',
    sourceIds: ['met-classical-greece'],
  },
  'early-christian-byzantine': {
    summary:
      '「ビザンティン」は帝都コンスタンティノポリスの旧名ビュザンティオンに由来する後世の呼称です。同時代の人々は自らの国家をローマ帝国と認識していました。',
    originalTerm: 'Byzantine Art',
    literalMeaning: 'ビュザンティオンに由来する美術',
    context: '後世の歴史学・美術史による分類',
    certainty: 'established',
    sourceIds: ['met-byzantium'],
  },
  gothic: {
    summary:
      '「ゴシック」はゲルマン系のゴート人を指す語に由来し、古典古代の規範から外れた北方の様式を示す批評的な呼称として広まりました。実際の制作者による自己命名ではありません。',
    originalTerm: 'Gothic',
    literalMeaning: 'ゴート人の、ゴート風の',
    context: 'ルネサンス以後の批評と後世の様式分類',
    certainty: 'probable',
    sourceIds: ['smarthistory-gothic-architecture', 'smarthistory-late-gothic'],
  },
  'italian-renaissance': {
    summary:
      '「ルネサンス」はフランス語で「再生」を意味し、古典古代の学芸がよみがえるという歴史観を表します。16世紀の「再生」の語法を基礎に、19世紀の歴史記述で時代名として定着しました。',
    originalTerm: 'Renaissance / rinascita',
    literalMeaning: '再生、復興',
    context: '古典復興を説明する批評語から後世の時代区分へ発展',
    certainty: 'probable',
    sourceIds: ['tate-renaissance'],
  },
  'northern-renaissance': {
    summary:
      '「北方ルネサンス」は、イタリア以北で展開した古典受容と写実的表現を区別するための後世の地域分類です。当事者が一つの集団として掲げた名称ではありません。',
    originalTerm: 'Northern Renaissance',
    literalMeaning: '北方のルネサンス',
    context: '美術史による地域別の時代分類',
    certainty: 'established',
    sourceIds: ['smarthistory-northern-renaissance', 'smarthistory-van-eyck'],
  },
  mannerism: {
    summary:
      '「マニエリスム」はイタリア語の maniera、すなわち「様式」や「手法」に由来します。16世紀には洗練された作風を示しましたが、後世に盛期ルネサンス後の様式名として再編されました。',
    originalTerm: 'Maniera / Mannerism',
    literalMeaning: '様式、手法',
    context: '同時代の批評語を後世の美術史が様式名として再定義',
    certainty: 'established',
    sourceIds: ['tate-mannerist'],
  },
  baroque: {
    summary:
      '「バロック」の語源は、しばしばポルトガル語の「不整形な真珠」と結びつけられますが、語の伝播と美術様式への適用には複数の説明があります。名称は当初、規則から外れた表現を批判的に示しました。',
    originalTerm: 'Baroque / barocco / barroco',
    literalMeaning: '不整形な真珠、奇異なものとする説',
    context: '批評語から17世紀美術の様式分類へ変化',
    certainty: 'disputed',
    sourceIds: ['tate-baroque'],
  },
  'dutch-golden-age': {
    summary:
      '「オランダ黄金時代」は、17世紀の経済的繁栄と文化活動を「黄金」と評価する後世の歴史的呼称です。植民地支配や社会的不均衡を覆い隠す可能性も含め、現在は用語自体が再検討されています。',
    originalTerm: 'Dutch Golden Age',
    literalMeaning: 'オランダの黄金時代',
    context: '後世の歴史叙述と美術史による時代分類',
    certainty: 'established',
    sourceIds: ['met-dutch-golden-age'],
  },
  rococo: {
    summary:
      '「ロココ」は岩や貝殻を用いる装飾を指すフランス語 rocaille と結びつく名称です。18世紀の装飾趣味を示す語として、主に後世の批評と様式分類で定着しました。',
    originalTerm: 'Rococo / rocaille',
    literalMeaning: '岩や貝殻を用いた装飾',
    context: '装飾用語から18世紀美術の様式名へ発展',
    certainty: 'probable',
    sourceIds: ['tate-rococo'],
  },
  neoclassicism: {
    summary:
      '「新古典主義」は「新しい」を意味する neo と古典主義を組み合わせた後世の分類です。18世紀後半の古代ギリシア・ローマ再評価を、先行する古典主義と区別して示します。',
    originalTerm: 'Neoclassicism',
    literalMeaning: '新しい古典主義',
    context: '古典復興を整理する後世の様式分類',
    certainty: 'established',
    sourceIds: ['tate-neoclassicism'],
  },
  romanticism: {
    summary:
      '「ロマン主義」は、中世語で書かれた物語を指す romance や romantic に由来します。18世紀以降、理性だけでは捉えにくい感情、想像力、崇高を重視する文化傾向の名称へ広がりました。',
    originalTerm: 'Romanticism',
    literalMeaning: 'ロマンス的なもの、物語的・幻想的なもの',
    context: '文学・美学上の語が国際的な文化運動の名称へ発展',
    certainty: 'established',
    sourceIds: ['smarthistory-romanticism', 'tate-romanticism'],
  },
  realism: {
    summary:
      '「レアリスム」はフランス語で「現実」を意味する réalité に連なる語です。クールベは1855年の個展に「レアリスム」の名を掲げ、同時代の生活を描く立場を公に示しました。',
    originalTerm: 'Réalisme',
    literalMeaning: '現実に即する立場',
    coinedYear: 1855,
    context: '個展と宣言を通じた自己規定',
    certainty: 'established',
    sourceIds: ['smarthistory-realism', 'tate-realism'],
  },
  impressionism: {
    summary:
      'モネの《印象、日の出》をもとに、批評家ルイ・ルロワが1874年の展覧会評で出品者を「印象派」と揶揄したことに由来します。批判的な呼称は、やがて運動名として定着しました。',
    originalTerm: 'Impressionnistes',
    literalMeaning: '印象を描く人々',
    coinedBy: 'ルイ・ルロワ',
    coinedYear: 1874,
    context: '第1回印象派展への風刺的な批評',
    certainty: 'established',
    sourceIds: ['tate-impressionism'],
  },
  'post-impressionism': {
    summary:
      '「ポスト印象派」は「印象派の後」を意味する後世の分類です。批評家ロジャー・フライが1910年の展覧会名に用い、異なる作家たちを印象派以後の展開としてまとめました。',
    originalTerm: 'Post-Impressionists',
    literalMeaning: '印象派以後の人々',
    coinedBy: 'ロジャー・フライ',
    coinedYear: 1910,
    context: 'ロンドンの展覧会「マネとポスト印象派」',
    certainty: 'established',
    sourceIds: ['tate-post-impressionism', 'met-post-impressionism'],
  },
  symbolism: {
    summary:
      '「象徴主義」は、見える現実の背後にある観念を象徴で表す立場を示します。詩人ジャン・モレアスが1886年の「象徴主義宣言」で Symbolisme を掲げ、文学から視覚芸術へ広がりました。',
    originalTerm: 'Symbolisme',
    literalMeaning: '象徴による表現を重視する立場',
    coinedBy: 'ジャン・モレアス',
    coinedYear: 1886,
    context: '文学宣言から美術を含む国際的傾向へ展開',
    certainty: 'established',
    sourceIds: ['tate-symbolism', 'met-symbolism'],
  },
  cubism: {
    summary:
      '「キュビスム」は「立方体」を意味する cube に由来し、批評家ルイ・ヴォークセルが1908年にブラックの作品を幾何学的な形として評したことから広まったとされます。発言の伝わり方には幅があります。',
    originalTerm: 'Cubisme',
    literalMeaning: '立方体による表現',
    coinedBy: 'ルイ・ヴォークセル',
    coinedYear: 1908,
    context: 'ブラックの作品に対する批評語',
    certainty: 'probable',
    sourceIds: ['tate-cubism', 'moma-cubism'],
  },
  futurism: {
    summary:
      '「未来」を意味するイタリア語 futuro に由来します。詩人フィリッポ・トンマーゾ・マリネッティが1909年の「未来派宣言」で Futurismo を掲げ、速度と機械の時代を称揚しました。',
    originalTerm: 'Futurismo',
    literalMeaning: '未来主義',
    coinedBy: 'フィリッポ・トンマーゾ・マリネッティ',
    coinedYear: 1909,
    context: '新聞に発表された「未来派宣言」による自己命名',
    certainty: 'established',
    sourceIds: ['tate-futurism', 'moma-futurism'],
  },
  dada: {
    summary:
      '「ダダ」は1916年頃のチューリヒで用いられ始めました。辞書を偶然開いて選んだという話や、複数言語で異なる意味を持つ響きを選んだという説明があり、名称成立の経緯には諸説があります。',
    originalTerm: 'Dada',
    literalMeaning: 'フランス語の木馬など、言語により複数の連想を持つ語',
    coinedYear: 1916,
    context: 'キャバレー・ヴォルテール周辺での集団名の選定',
    certainty: 'disputed',
    sourceIds: ['smarthistory-dada', 'moma-dada'],
  },
  surrealism: {
    summary:
      '「シュルレアリスム」は「現実を超える」という語義を持ちます。ギヨーム・アポリネールが1917年に用いた語を、アンドレ・ブルトンが1924年の宣言で運動名として定義しました。',
    originalTerm: 'Surréalisme',
    literalMeaning: '現実を超えるもの、超現実',
    coinedBy: 'ギヨーム・アポリネール',
    coinedYear: 1917,
    context: '舞台作品をめぐる新語をブルトンが宣言で再定義',
    certainty: 'established',
    sourceIds: ['tate-surrealism', 'moma-surrealism'],
  },
  'abstract-expressionism': {
    summary:
      '「抽象表現主義」は抽象と表現主義を組み合わせた名称です。批評家ロバート・コーツが1946年にニューヨークの作家たちへ適用し、異なる作風をまとめる呼称として広まりました。',
    originalTerm: 'Abstract Expressionism',
    literalMeaning: '抽象的な表現主義',
    coinedBy: 'ロバート・コーツ',
    coinedYear: 1946,
    context: 'ニューヨーカー誌の展覧会評',
    certainty: 'established',
    sourceIds: ['tate-abstract-expressionism', 'moma-abstract-expressionism'],
  },
  gutai: {
    summary:
      '「具体」は「具体的であること」や物質そのものとの直接的な関係を示す名称です。吉原治良を中心に1954年に結成された具体美術協会が、自ら掲げた集団名に由来します。',
    originalTerm: '具体 / Gutai',
    literalMeaning: '具体性、物質として現れること',
    coinedYear: 1954,
    context: '具体美術協会の結成時の自己命名',
    certainty: 'established',
    sourceIds: ['gugg-gutai', 'tate-gutai'],
  },
  'pop-art': {
    summary:
      '「ポップ」は popular、すなわち大衆的な文化に由来します。1950年代のイギリスで批評家ローレンス・アロウェイらが用いた語が、広告や商品イメージを扱う国際的傾向の名称として広まりました。',
    originalTerm: 'Pop Art',
    literalMeaning: '大衆文化の美術',
    context: '1950年代のイギリスにおける大衆文化論と批評',
    certainty: 'probable',
    sourceIds: ['tate-pop-art', 'moma-pop-art'],
  },
  minimalism: {
    summary:
      '「ミニマリズム」は最小限への還元を示す後世の批評的呼称です。1960年代半ばに Minimal Art などの語が広まりましたが、多くの作家は単一の運動名で括られることを望みませんでした。',
    originalTerm: 'Minimalism / Minimal Art',
    literalMeaning: '最小限主義、最小限の美術',
    context: '1960年代の批評による分類',
    certainty: 'probable',
    sourceIds: ['tate-minimalism', 'moma-minimalism'],
  },
  'conceptual-art': {
    summary:
      '「コンセプチュアル・アート」は作品の物質的形態より concept、すなわち考えを重視する名称です。1960年代に「concept art」「conceptual art」の語が段階的に広まりました。',
    originalTerm: 'Concept Art / Conceptual Art',
    literalMeaning: '概念を主とする美術',
    context: '1960年代の作家による用語と批評上の分類',
    certainty: 'probable',
    sourceIds: ['tate-conceptual-art', 'moma-conceptual-art'],
  },
  postminimalism: {
    summary:
      '「ポストミニマリズム」は「ミニマリズムの後」を意味する批評上の呼称です。1970年代初頭、ミニマリズムの形式を受けつつ素材、身体、工程へ関心を広げた作家を説明するために用いられました。',
    originalTerm: 'Post-Minimalism',
    literalMeaning: 'ミニマリズム以後',
    coinedBy: 'ロバート・ピンカス＝ウィッテン',
    context: '1970年代初頭のアメリカ美術批評',
    certainty: 'probable',
    sourceIds: ['tate-process-art', 'moma-postminimalism'],
  },
  'light-and-space': {
    summary:
      '「ライト・アンド・スペース」は、光、知覚、建築空間を扱った南カリフォルニアの作家をまとめる記述的な名称です。単一の宣言や創設者による自己命名ではなく、後世の展覧会と批評で定着しました。',
    originalTerm: 'Light and Space',
    literalMeaning: '光と空間',
    context: '1960年代以降の南カリフォルニア美術を整理する批評・展覧会上の分類',
    certainty: 'probable',
    sourceIds: ['gugg-turrell', 'tate-turrell'],
  },
  'mono-ha': {
    summary:
      '「もの派」は「もの」と「派」を組み合わせた呼称です。1970年代初頭に批判的な立場の人々が名付けたとされ、作家たちが当初から一つの正式な運動名として掲げたものではありません。',
    originalTerm: 'もの派 / Mono-ha',
    literalMeaning: 'ものの派、School of Things',
    context: '1970年代初頭の批評的な他称',
    certainty: 'established',
    sourceIds: ['gugg-lee-ufan', 'gugg-lee-ufan-teaching'],
  },
  superflat: {
    summary:
      '「スーパーフラット」は、平面的な絵画空間と文化の階層差の平準化を重ねる造語です。村上隆が2000年の展覧会と宣言で掲げ、日本美術と消費文化を結ぶ概念として提示しました。',
    originalTerm: 'Superflat',
    literalMeaning: '超平面的、極度に平らな状態',
    coinedBy: '村上隆',
    coinedYear: 2000,
    context: '展覧会と同名の宣言による自己命名',
    certainty: 'established',
    sourceIds: ['gugg-murakami'],
  },
  'immersive-digital': {
    summary:
      '「没入型デジタル・インスタレーション」は、デジタル技術で鑑賞者を環境へ包み込む作品群を示す記述的な分類です。特定の作家が宣言した単一の運動名ではありません。',
    originalTerm: 'Immersive Digital Installation Art',
    literalMeaning: '没入体験をつくるデジタル設置作品',
    context: '技術と鑑賞形式を説明する現代の分類語',
    certainty: 'established',
    sourceIds: ['teamlab-tokyo', 'teamlab-body-immersive'],
  },
  'ancient-egyptian-art': {
    summary:
      '「古代エジプト美術」は、ナイル流域の長い王朝史に属する造形をまとめる近代の地理的・年代的呼称です。当時の多様な制作を一つの運動として自称した名称ではありません。',
    originalTerm: 'Ancient Egyptian Art',
    literalMeaning: '古代エジプトの美術',
    context: '考古学・美術史による地理的かつ年代的な分類',
    certainty: 'established',
    sourceIds: ['met-egypt-new-kingdom', 'smarthistory-ancient-egypt-intro'],
  },
  'ancient-roman-art': {
    summary:
      '「古代ローマ美術」は、ローマ共和国と帝国圏の造形をまとめる後世の分類です。広大な地域と長い年代の制作を、当時の人々が単一の運動名で呼んだわけではありません。',
    originalTerm: 'Ancient Roman Art',
    literalMeaning: '古代ローマ世界の美術',
    context: '考古学・美術史による地理的かつ年代的な分類',
    certainty: 'established',
    sourceIds: ['met-roman-provinces', 'smarthistory-roman-art-intro'],
  },
  'chinese-landscape-painting': {
    summary:
      '「山水画」は「山」と「水」によって自然景観を表す中国語の名称です。単なる地形描写ではなく、人と宇宙の秩序を考える絵画領域として長い時間をかけて成立しました。',
    originalTerm: '山水画 / shanshui hua',
    literalMeaning: '山と水の絵画',
    context: '中国絵画における主題・ジャンルの歴史的名称',
    certainty: 'established',
    sourceIds: ['met-chinese-landscape', 'smithsonian-guests-hills'],
  },
  'islamic-art': {
    summary:
      '「イスラーム美術」は、イスラーム圏で制作された多様な宗教・世俗の造形をまとめる近代の研究上の呼称です。一つの時代や民族が自称した統一運動名ではなく、収録範囲には議論があります。',
    originalTerm: 'Islamic Art',
    literalMeaning: 'イスラーム圏に関わる美術',
    context: '近代の美術史・博物館による広域的な分類',
    certainty: 'probable',
    sourceIds: ['met-nature-islamic-art', 'british-museum-islamic-gallery'],
  },
  'romanesque-art': {
    summary:
      '「ロマネスク」は「ローマ風」を意味し、中世建築の丸アーチなどを古代ローマとの類似から説明するために19世紀初頭に用いられました。制作当時の自己命名ではありません。',
    originalTerm: 'Romanesque',
    literalMeaning: 'ローマ風の',
    context: '19世紀初頭の建築史・考古学上の分類',
    certainty: 'probable',
    sourceIds: ['met-romanesque-art', 'smarthistory-romanesque-intro'],
  },
  'ukiyo-e': {
    summary:
      '「浮世絵」は「浮世の絵」を意味します。もとは仏教的な無常の世を示した「憂き世」の響きを引き継ぎつつ、江戸の流行、遊興、都市生活を描く語へ転じました。',
    originalTerm: '浮世絵 / ukiyo-e',
    literalMeaning: '浮世の絵',
    context: '江戸時代の都市文化と出版文化の中で成立したジャンル名',
    certainty: 'established',
    sourceIds: ['met-japonisme', 'british-museum-ukiyoe-technique'],
  },
  expressionism: {
    summary:
      '「表現主義」は、外界の再現より内面の表出を重視することを示す名称です。20世紀初頭のドイツ語圏を中心に批評語として定着しましたが、最初の使用者と適用範囲には複数の説明があります。',
    originalTerm: 'Expressionismus / Expressionism',
    literalMeaning: '内面を表出する立場',
    context: '20世紀初頭の批評と展覧会による分類',
    certainty: 'disputed',
    sourceIds: ['moma-expressionism', 'smarthistory-expressionism-intro'],
  },
  bauhaus: {
    summary:
      '「バウハウス」はドイツ語の Bau、建築と Haus、家を組み合わせた名称です。ヴァルター・グロピウスが1919年に学校名として掲げ、中世の建築工房 Bauhütte も想起させました。',
    originalTerm: 'Staatliches Bauhaus',
    literalMeaning: '建築の家',
    coinedBy: 'ヴァルター・グロピウス',
    coinedYear: 1919,
    context: '美術学校の創設時の自己命名',
    certainty: 'established',
    sourceIds: ['met-bauhaus', 'bauhaus-archiv-history'],
  },
  'mesopotamian-art': {
    summary:
      '「メソポタミア」はギリシア語で「川の間」を意味し、ティグリス川とユーフラテス川の間を指します。「メソポタミア美術」は複数の古代文化をまとめる後世の地理的分類です。',
    originalTerm: 'Mesopotamia',
    literalMeaning: '二つの川の間の土地',
    context: '古典古代の地理語を用いた近代考古学・美術史の分類',
    certainty: 'established',
    sourceIds: ['met-mesopotamia-overview', 'smarthistory-mesopotamia-intro'],
  },
  'hellenistic-art': {
    summary:
      '「ヘレニズム」はギリシア文化の広がりを示す語です。歴史家ヨハン・グスタフ・ドロイゼンが19世紀に歴史区分として体系化し、アレクサンドロス大王以後の美術にも適用されました。',
    originalTerm: 'Hellenismus / Hellenistic',
    literalMeaning: 'ギリシア化、ギリシア文化の広がり',
    coinedBy: 'ヨハン・グスタフ・ドロイゼン',
    coinedYear: 1836,
    context: '19世紀の歴史学による時代区分',
    certainty: 'probable',
    sourceIds: ['met-hellenistic-overview', 'smarthistory-hellenistic-intro'],
  },
  'literati-painting': {
    summary:
      '「文人画」は、学問と詩文を修めた文人による絵画を示す中国の分類です。単一の結成時点を持つ運動名ではなく、職業画家の制作と異なる価値観を説明する概念として形成されました。',
    originalTerm: '文人画 / wenrenhua',
    literalMeaning: '文人の絵画',
    context: '中国絵画論と収集史の中で形成された分類',
    certainty: 'established',
    sourceIds: ['met-literati-painting', 'smithsonian-yuan-painting'],
  },
  'yamato-e': {
    summary:
      '「やまと絵」は「日本の絵」を意味し、中国風の主題や様式を示す唐絵と区別する名称として用いられました。特定集団の運動名ではなく、宮廷文化に根ざした絵画領域の歴史的呼称です。',
    originalTerm: 'やまと絵 / 大和絵',
    literalMeaning: '日本の絵',
    context: '唐絵との対比から成立した日本絵画の分類',
    certainty: 'established',
    sourceIds: ['met-yamato-e', 'smarthistory-genji-scroll'],
  },
  'japanese-ink-painting': {
    summary:
      '「水墨画」は水と墨を主材とする絵画を示す名称です。日本では中国絵画の受容と禅宗文化の中で展開し、後世に多様な墨画表現をまとめるジャンル名となりました。',
    originalTerm: '水墨画 / suibokuga',
    literalMeaning: '水と墨による絵画',
    context: '媒体と技法に基づく歴史的なジャンル分類',
    certainty: 'established',
    sourceIds: ['met-japanese-ink', 'smarthistory-sesshu-haboku'],
  },
  rinpa: {
    summary:
      '「琳派」は尾形光琳の名から取った「琳」と「派」を組み合わせた後世の呼称です。師弟関係で連続する一門ではなく、作品と技法を介して時代を越えて継承された作家群をまとめています。',
    originalTerm: '琳派 / Rinpa',
    literalMeaning: '光琳の派',
    context: '近代美術史による回顧的な流派分類',
    certainty: 'probable',
    sourceIds: ['met-rinpa-overview', 'smarthistory-korin-plums'],
  },
  'arts-and-crafts': {
    summary:
      '「アーツ・アンド・クラフツ」は「美術と工芸」を意味します。1887年設立の Arts and Crafts Exhibition Society の名称が、手仕事と生活環境の改革を目指す広い運動名として定着しました。',
    originalTerm: 'Arts and Crafts',
    literalMeaning: '美術と工芸',
    coinedYear: 1887,
    context: '展覧会協会の名称から国際的な運動名へ発展',
    certainty: 'established',
    sourceIds: ['met-arts-crafts-overview', 'vam-arts-crafts-intro'],
  },
  'art-nouveau': {
    summary:
      '「アール・ヌーヴォー」はフランス語で「新しい芸術」を意味します。美術商サミュエル・ビングが1895年に開いた店 Maison de l’Art Nouveau が名称の普及に大きく寄与しました。',
    originalTerm: 'Art Nouveau',
    literalMeaning: '新しい芸術',
    coinedYear: 1895,
    context: 'パリの店舗名と国際的な装飾芸術の紹介',
    certainty: 'probable',
    sourceIds: ['met-art-nouveau-overview', 'vam-art-nouveau-intro'],
  },
  fauvism: {
    summary:
      '「フォーヴィスム」はフランス語の fauves、すなわち「野獣たち」に由来します。批評家ルイ・ヴォークセルが1905年のサロン・ドートンヌで、激しい色彩の作品群を評した言葉が運動名となりました。',
    originalTerm: 'Fauvisme / les fauves',
    literalMeaning: '野獣たち、野獣派',
    coinedBy: 'ルイ・ヴォークセル',
    coinedYear: 1905,
    context: 'サロン・ドートンヌの展示に対する批評',
    certainty: 'established',
    sourceIds: ['met-fauvism', 'smarthistory-fauvism'],
  },
  'russian-constructivism': {
    summary:
      '「構成主義」は、作品を描写するのでなく素材と構造から「構成する」立場を示します。革命後のロシアで作家たちが採用し、1920年代初頭の宣言と活動を通じて運動名として定着しました。',
    originalTerm: 'Конструктивизм / Constructivism',
    literalMeaning: '構成することを重視する立場',
    context: '革命後ロシアの作家集団と宣言による自己規定',
    certainty: 'probable',
    sourceIds: ['moma-constructivism', 'smarthistory-constructivism'],
  },
  suprematism: {
    summary:
      '「シュプレマティスム」は「至高」や「優越」を意味する語に由来します。カジミール・マレーヴィチが1915年、対象の再現を離れた「純粋感覚の至高」を示す名称として掲げました。',
    originalTerm: 'Супрематизм / Suprematism',
    literalMeaning: '純粋感覚の至高',
    coinedBy: 'カジミール・マレーヴィチ',
    coinedYear: 1915,
    context: '展覧会と理論文による自己命名',
    certainty: 'established',
    sourceIds: ['moma-suprematism', 'smarthistory-suprematism'],
  },
  'de-stijl': {
    summary:
      '「デ・ステイル」はオランダ語で「様式」を意味します。テオ・ファン・ドゥースブルフが1917年に創刊した同名誌を核に、作家と建築家の集団名として定着しました。',
    originalTerm: 'De Stijl',
    literalMeaning: '様式',
    coinedBy: 'テオ・ファン・ドゥースブルフ',
    coinedYear: 1917,
    context: '雑誌名を核とする集団の自己命名',
    certainty: 'established',
    sourceIds: ['moma-de-stijl-catalogue', 'smarthistory-de-stijl'],
  },
  'art-informel': {
    summary:
      '「アンフォルメル」はフランス語で「非定形」や「形を持たない」を意味します。批評家ミシェル・タピエが1950年代初頭に、既成の形式を離れた戦後欧州の抽象表現を示す語として広めました。',
    originalTerm: 'Art informel',
    literalMeaning: '非定形の美術',
    coinedBy: 'ミシェル・タピエ',
    context: '1950年代初頭の展覧会と批評による命名',
    certainty: 'established',
    sourceIds: ['guggenheim-art-informel', 'moma-tapies-informel'],
  },
  fluxus: {
    summary:
      '「フルクサス」はラテン語で「流れ」を意味します。ジョージ・マチューナスが1961年頃、雑誌と催事の名称として採用し、国境や分野を横断する活動の呼称へ発展しました。',
    originalTerm: 'Fluxus',
    literalMeaning: '流れ、流動',
    coinedBy: 'ジョージ・マチューナス',
    coinedYear: 1961,
    context: '出版物とイベント計画を通じた自己命名',
    certainty: 'established',
    sourceIds: ['moma-fluxus', 'getty-fluxus'],
  },
  'arte-povera': {
    summary:
      '「アルテ・ポーヴェラ」はイタリア語で「貧しい芸術」を意味します。批評家ジェルマーノ・チェラントが1967年、日常的で非高級な素材を用いる作家たちを示す名称として掲げました。',
    originalTerm: 'Arte Povera',
    literalMeaning: '貧しい芸術',
    coinedBy: 'ジェルマーノ・チェラント',
    coinedYear: 1967,
    context: '展覧会と批評文による命名',
    certainty: 'established',
    sourceIds: ['moma-arte-povera', 'guggenheim-arte-povera'],
  },
  'land-art': {
    summary:
      '「ランド・アート」は土地そのものを媒体や場所として扱う作品群を示す記述的な呼称です。1960年代末に Earth Art や Earthworks など複数の語と並行して広まり、単一の命名者には還元できません。',
    originalTerm: 'Land Art / Earth Art / Earthworks',
    literalMeaning: '土地の美術、大地を用いる作品',
    context: '1960年代末の展覧会と批評による複数の分類語',
    certainty: 'probable',
    sourceIds: ['moma-earthwork', 'tate-land-art-expansion'],
  },
};

export function applyNameOrigins(items: Movement[]): Movement[] {
  return items.map((movement) => {
    const nameOrigin = NAME_ORIGINS[movement.id];
    return nameOrigin ? { ...movement, nameOrigin } : movement;
  });
}

export const nameOriginMovementIds = Object.freeze(Object.keys(NAME_ORIGINS));
