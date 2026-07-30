import type { Movement } from '@/lib/schema';

/**
 * 第1弾拡張（core 8件）。
 *
 * 広域・長期の項目は、単一の均質な様式と見なさず、収録範囲と地域差を本文で明示する。
 * displayOrder は既存30件を100刻みに再配置した間へ挿入する。
 */
export const coreExpansionMovements: Movement[] = [
  {
    id: 'ancient-egyptian-art',
    nameJa: '古代エジプト美術',
    nameEn: 'Ancient Egyptian Art',
    aliases: ['エジプト美術', 'Ancient Egypt'],
    shortLabel: '古代エジプト',
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 150,
    classification: 'period',
    era: 'prehistoric-ancient',
    dates: {
      start: -3100,
      end: -30,
      peak: [-1550, -1070],
      circa: true,
      note: '初期王朝時代の統一からプトレマイオス朝終焉までを概観し、地域・王朝ごとの差異を均質化しない',
    },
    regionIds: ['mediterranean', 'other'],
    cities: ['メンフィス', 'テーベ', 'アマルナ', 'ギザ'],
    summary:
      '王権・死後世界・神々への信仰を、建築・彫刻・壁画・工芸に結びつけた長期の造形文化。正面性や複合視点は、見た目の瞬間より対象の本質と社会的秩序を明確に伝えるための規範だった。',
    coreIdea:
      '像や墓室装飾は、王や死者の存在を永続させ、マアト（秩序・均衡）を維持する働きを担った。自然主義より、識別可能性と永続性が優先された。',
    socialContext:
      'ナイルの周期的氾濫、中央集権的王権、神殿と墓の建設を支える専門職集団が、長期にわたる制作基盤を形成した。',
    politicalContext:
      'ファラオは政治的支配者であると同時に神々と人間を媒介する存在として表され、記念造形は王権の連続性を可視化した。',
    religiousContext:
      '死後の再生、神々への奉仕、供物と儀礼が墓・神殿・像の機能を決めた。図像は装飾ではなく儀礼上の効力を持つと考えられた。',
    reactionAgainst:
      '単一の先行様式への反発ではなく、先王朝期の地域的造形を統合し、王朝ごとに規範を更新した。アマルナ期などには一時的な表現転換も起きた。',
    inheritedFrom:
      '先王朝期の墓制、象徴動物、土器・石器加工、共同体儀礼の蓄積を国家的な記念造形へ組み込んだ。',
    visualTraits:
      '頭部と脚を側面、眼と上半身を正面から示す複合視点、階層に応じた人物の大きさ、正面性、輪郭の明晰さ、反復する図像。',
    compositionSpace:
      '場面は帯状のレジスターへ整理され、統一遠近法ではなく、重要度・役割・行為の順序によって配置される。',
    colorLight:
      '鉱物顔料による赤・黄・青・緑・黒・白を明確に使い分け、材質と象徴を結びつけた。像や浮彫の多くは本来彩色されていた。',
    technique:
      '石材の切り出しと研磨、沈み彫り・浮彫、壁面への彩色、木棺・パピルス制作、金属・ファイアンス加工。',
    materials: '石灰岩、花崗岩、木、パピルス、金、ファイアンス、鉱物顔料。',
    subjects: '神々、ファラオ、死者、供物、葬送儀礼、日常労働、動植物、来世の旅。',
    artistStatus:
      '多くは匿名の専門職人として工房や造営組織に属した。個人名が判明する例もあるが、作品は共同制作と規範の産物だった。',
    productionSystem:
      '王宮・神殿・墓地の造営組織と工房が、石工・彩色者・書記などの分業で制作した。',
    patronage: 'ファラオ、王族、神殿、官僚・富裕層。',
    marketExhibition:
      '近代的市場や展示ではなく、神殿・墓・宮殿という機能的な場所に設置され、儀礼と記憶の中で受容された。',
    audience:
      '神々、死者、祭礼参加者、神官、王権に接する共同体。墓室奥部の像や文書は生者の一般鑑賞を前提としない。',
    legacy:
      '地中海世界の視覚文化に長期的な参照点を与え、19世紀以降のエジプト学とエジプト・リバイバルを通じて建築・工芸・大衆文化にも再解釈された。',
    contemporaryConnection:
      '誰のために像を作るのか、記憶をどの媒体へ固定するのかという問いは、記念碑・アーカイブ・死者表象を考える基準になる。',
    viewingPoints: [
      '複合視点を「未熟な遠近法」ではなく情報を明晰に伝える規範として読む',
      '墓や神殿という本来の場所と儀礼機能を想像する',
      '三千年を一様式とせず、王朝・地域・用途による差を見る',
    ],
    keywords: ['エジプト', 'ファラオ', 'マアト', '死後世界', '正面性', 'レジスター', 'パピルス'],
    artistIds: [],
    workIds: [
      'work-hatshepsut-seated',
      'work-hatshepsut-sphinx',
      'work-nauny-book-of-dead',
    ],
    sourceIds: ['met-egypt-new-kingdom', 'smarthistory-ancient-egypt-intro'],
    verification: 'verified',
  },
  {
    id: 'ancient-roman-art',
    nameJa: '古代ローマ美術',
    nameEn: 'Ancient Roman Art',
    aliases: ['ローマ美術', 'Roman art'],
    shortLabel: '古代ローマ',
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 250,
    classification: 'period',
    era: 'prehistoric-ancient',
    dates: {
      start: -200,
      end: 330,
      peak: [-27, 200],
      circa: true,
      note: '共和政後期から帝政後期を中心に扱う。東西帝国・属州の地域差を含む概算',
    },
    regionIds: ['mediterranean', 'pan-european'],
    cities: ['ローマ', 'ポンペイ', 'オスティア', 'アテネ', 'アレクサンドリア'],
    summary:
      'ギリシア美術を選択的に受容しつつ、帝国の都市・住宅・記念碑・肖像へ展開した美術。コンクリート建築、写実的肖像、壁画空間、歴史叙述を通じて、権力と日常を可視化した。',
    coreIdea:
      '像・建築・都市空間を、祖先の記憶、皇帝の権威、公共生活、私的な教養の表明へ結びつける。模倣は単なる複製でなく、新しい文脈への翻案だった。',
    socialContext:
      '地中海を横断する帝国、道路・交易・奴隷制、都市生活、富裕層の邸宅文化が、多様な地域様式と大規模な制作需要を生んだ。',
    politicalContext:
      '皇帝肖像、凱旋門、記念柱、公共建築は、軍事的勝利と統治の正当性を広範な住民へ伝える媒体となった。',
    religiousContext:
      '多神教、皇帝崇拝、家庭祭祀が併存し、後期にはキリスト教の公認が図像と建築用途を変えた。',
    technologyContext:
      'ローマン・コンクリート、アーチ、ヴォールト、ドーム、水道・道路技術が、巨大で複合的な公共空間を可能にした。',
    reactionAgainst:
      'ギリシア古典を全面的に否定せず、理想美を公共的権威に用いる一方、祖先肖像や歴史浮彫では個別性・年齢・出来事の記録を強めた。',
    inheritedFrom:
      'ギリシア・エトルリア・ヘレニズムの彫刻、神殿、都市計画、絵画語彙を帝国の用途へ翻案した。',
    visualTraits:
      '皇帝の理想化と市民肖像の個別性、連続する歴史浮彫、建築と彫刻の統合、室内壁画の錯視的な奥行き。',
    compositionSpace:
      '建築では軸線と連続する内部空間、壁画では建築枠や風景による仮想空間、浮彫では時間を連続的に配列する。',
    colorLight:
      '大理石・ブロンズ・壁画・モザイクは本来豊かに彩色され、室内の採光や水面、磨かれた石材が空間効果を高めた。',
    technique:
      '大理石彫刻、ブロンズ鋳造、フレスコ、モザイク、コンクリートと煉瓦によるアーチ・ヴォールト・ドーム建築。',
    materials: '大理石、ブロンズ、コンクリート、煉瓦、漆喰、顔料、ガラス・石のモザイク。',
    subjects: '皇帝、祖先、市民、神話、戦勝、都市生活、庭園・風景、静物。',
    artistStatus:
      'ギリシア系を含む彫刻家・画工・建築技術者が工房で働いた。個人名より注文者と公共機能が前面に出る例が多い。',
    productionSystem:
      '帝国・都市・軍・富裕層の注文を、専門工房と建設組織が分業で担い、型や図像が属州へ流通した。',
    patronage: '皇帝・皇族、元老院、都市共同体、軍、富裕市民、家族。',
    marketExhibition:
      'フォルム、浴場、神殿、邸宅、墓、庭園などに組み込まれ、公共生活と私生活の場で機能した。',
    audience: '帝国の市民・住民、祭礼参加者、邸宅訪問者、家族、軍隊。',
    legacy:
      '初期キリスト教とビザンティンの建築・皇帝図像へ接続し、ルネサンス、新古典主義、近代の公共建築が繰り返し参照した。',
    contemporaryConnection:
      '公共空間が権力をどう演出するか、複製や引用が文化をどう移し替えるかという問題を、都市・メディア・記念碑の現在へつなげる。',
    viewingPoints: [
      'ギリシア作品の模刻を「コピー」だけでなくローマの用途への翻案として見る',
      '肖像の理想化と個別性が対象の地位によって使い分けられる点を見る',
      '作品単体ではなく都市・住宅・浴場など元の空間との関係を考える',
    ],
    keywords: ['ローマ', '帝国', '肖像', 'コンクリート', 'フレスコ', 'モザイク', '公共空間'],
    artistIds: [],
    workIds: [
      'work-augustus-portrait-met',
      'work-boscoreale-room-h',
      'work-boscotrecase-polyphemus',
    ],
    sourceIds: ['met-roman-provinces', 'smarthistory-roman-art-intro'],
    verification: 'verified',
  },
  {
    id: 'chinese-landscape-painting',
    nameJa: '中国山水画',
    nameEn: 'Chinese Landscape Painting',
    aliases: ['山水画', 'shan shui', 'Chinese landscape'],
    shortLabel: '中国山水画',
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 430,
    classification: 'style',
    era: 'medieval',
    dates: {
      start: 600,
      end: 1900,
      peak: [960, 1368],
      circa: true,
      note: '独立した山水画の成立から清代までの主要な系譜を概観する。宮廷画・文人画・地域流派を同一視しない',
    },
    regionIds: ['east-asia'],
    cities: ['長安', '開封', '杭州', '蘇州', '北京'],
    summary:
      '山と水を自然の写生に限定せず、宇宙秩序、政治的世界観、隠逸、筆墨の人格表現へ結びつけた中国絵画の中心的伝統。時代ごとに宮廷・職業画家・文人が異なる目的で更新した。',
    coreIdea:
      '自然を所有する眺望ではなく、見る者が移動し精神的に遊ぶ場として構成する。山水は世界の秩序と制作主体の心を媒介する。',
    socialContext:
      '唐末から宋にかけて独立ジャンルとして成熟し、宮廷・官僚制度・都市文化・文人交流の変化に応じて制作と評価の基準が分化した。',
    politicalContext:
      '北宋の統一的な大山水、南宋の偏角的構図、元代遺民の古法参照など、王朝交替と知識人の立場が表現の意味を変えた。',
    philosophy:
      '儒教的秩序、道教的自然観、禅を含む仏教思想が重なり、自然の気と筆の運動を通じて自己を整える実践と理解された。',
    reactionAgainst:
      '単一の先行様式への反発ではない。写真のような再現より、古法の学習、記憶、旅、筆墨、精神的な真実を優先する方向が繰り返し選ばれた。',
    inheritedFrom:
      '人物画の背景、地図的表現、書の筆法、詩文、庭園文化を統合し、唐から五代・宋にかけて独立した画題と理論を形成した。',
    visualTraits:
      '高遠・深遠・平遠など複数の視点、余白、皴法、墨の濃淡、樹木と岩の筆触、山水の中に小さく置かれる人物や建築。',
    compositionSpace:
      '固定された一点視点ではなく、巻物を開く時間や視線の移動に沿って、複数の場所・距離・季節を連続させる。',
    colorLight:
      '墨の濃淡を中心に、淡彩・青緑など多様な系統がある。光源を一つに定めず、霧・余白・筆墨で気象と距離を示す。',
    technique:
      '絹・紙への墨と彩色、掛幅・手巻・冊頁。皴・点・擦・渲染を組み合わせ、書と共通する筆法を重視する。',
    materials: '墨、顔料、紙、絹、筆、膠、掛幅・手巻の装潢。',
    subjects: '山、水、樹木、霧、旅人、隠者、漁夫、書斎、寺院、歴史的・詩的な場所。',
    artistStatus:
      '宮廷画院の職業画家と、官僚・知識人である文人画家が併存し、制作目的と評価基準をめぐって緊張関係を持った。',
    productionSystem:
      '宮廷画院、地方工房、師弟伝承、文人の贈答・集会・収蔵と臨模を通じて制作・継承された。',
    patronage: '皇帝・宮廷、官僚・文人、寺院、都市の収蔵家。',
    marketExhibition:
      '宮廷・邸宅・書斎で掛幅や手巻として見られ、手巻は少人数が時間をかけて開く親密な鑑賞形式だった。後世には市場と収蔵印も価値形成に関わった。',
    audience: '皇帝、宮廷、文人仲間、収蔵家、寺院共同体。',
    legacy:
      '文人画を含む東アジア絵画の基準となり、朝鮮・日本の山水・水墨表現へ地域ごとに翻案された。近代以降も伝統の再解釈が続く。',
    contemporaryConnection:
      '移動する視点、余白、時間を含む画面は、単一視点に依存しない空間表現や環境との関係を考える手がかりになる。',
    viewingPoints: [
      '一つの地点から見た景色ではなく、視線が画面を旅する構成として読む',
      '墨の濃淡と筆触を物の再現だけでなく作者の判断として見る',
      '宮廷画・職業画・文人画を同じ価値基準で一括しない',
    ],
    keywords: ['山水画', '筆墨', '手巻', '高遠', '深遠', '平遠', '余白', '文人'],
    artistIds: ['artist-guo-xi', 'artist-lan-ying'],
    workIds: [
      'work-guo-xi-old-trees',
      'work-yang-pu-moving-family',
      'work-lan-ying-after-ni-zan',
    ],
    sourceIds: ['met-chinese-landscape', 'smithsonian-guests-hills'],
    verification: 'verified',
  },
  {
    id: 'islamic-art',
    nameJa: 'イスラーム美術',
    nameEn: 'Islamic Art',
    aliases: ['イスラム美術', 'Arts of the Islamic World'],
    shortLabel: 'イスラーム美術',
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 440,
    classification: 'period',
    era: 'medieval',
    dates: {
      start: 622,
      end: 1900,
      peak: [750, 1600],
      circa: true,
      note: '7世紀以降のイスラーム圏における建築・工芸・書物芸術を中心に概観する。宗教・地域・王朝の多様性を単一様式としない',
    },
    regionIds: ['mediterranean', 'spain', 'other'],
    cities: ['ダマスクス', 'バグダード', 'カイロ', 'コルドバ', 'イスファハーン', 'イスタンブール'],
    summary:
      '7世紀以降、西アフリカから東南アジアまで広がるイスラーム圏で生まれた多様な建築・書物・工芸・宮廷美術。本項目は宗教美術だけでなく、交易と宮廷文化を含む選択的な概観である。',
    coreIdea:
      'クルアーンの言葉、幾何学、植物文、素材と反復を通じ、秩序・無限性・権威・日常の美を可視化する。宗教空間と世俗空間では図像の扱いが異なる。',
    socialContext:
      '複数の王朝、都市、言語、宗派、交易網が広域を結び、陶磁・金工・織物・写本・建築技術が地域間で交換された。',
    politicalContext:
      'カリフ・スルタン・地方王朝・宮廷がモスク、宮殿、墓廟、工房を支援し、碑文と装飾が統治者の信仰と権威を伝えた。',
    religiousContext:
      '礼拝、クルアーン朗誦、メッカの方向、共同体の集会がモスク空間と書の役割を形づくった。人物像を避ける傾向は宗教的文脈で強いが、宮廷写本などには人物表現も豊富にある。',
    technologyContext:
      '紙の普及、ラスター彩、石胎陶器、釉下彩、象嵌金工、ムカルナス、タイル・モザイクなどが地域間交流の中で発達した。',
    reactionAgainst:
      '単一の「反発」から成立したのではなく、古代末期のビザンティン・ササン朝・中央アジアなどの技法を選択し、宗教・言語・交易の新しい条件へ翻案した。',
    inheritedFrom:
      'ビザンティンのモザイクと建築、ササン朝の宮廷工芸、古代地中海・イラン・中央アジアの装飾語彙を地域ごとに再構成した。',
    visualTraits:
      'アラビア文字、幾何学文、アラベスク、反復、タイル面、光と水、精緻な写本。宗教・世俗、地域、時代によって人物表現の有無は異なる。',
    compositionSpace:
      '中庭・ドーム・イーワーン・ミフラーブなどが方向と共同体の動線を組み、装飾面は反復によって境界を越える広がりを示す。',
    colorLight:
      '青・白・金・多彩釉、磨かれた金属、穿孔スクリーン、水面が光を変化させる。地域ごとに素材と色の体系は異なる。',
    technique:
      '書、写本彩飾、モザイク、タイル、ラスター彩、金工象嵌、木彫・石彫、織物、庭園・建築設計。',
    materials: '紙、羊皮紙、墨・金、石、煉瓦、釉薬、陶器、金属、木、ガラス、織物。',
    subjects: 'クルアーンの言葉、幾何学、植物文、宮廷生活、詩・物語、狩猟、科学・天文学、日用品。',
    artistStatus:
      '書家・画家・陶工・金工・建築職人が宮廷・都市工房・家族工房で働き、署名が残る例と匿名制作が併存する。',
    productionSystem:
      '宮廷工房、都市の職人組織、移動する技術者、交易ネットワークが素材・意匠・作品を広域に循環させた。',
    patronage: 'カリフ、スルタン、王侯、宗教財団、商人、都市住民。',
    marketExhibition:
      'モスク・宮殿・墓廟・邸宅・書斎で機能し、織物・陶器・金工・写本は交易と贈答を通じて広域に移動した。',
    audience: '礼拝共同体、宮廷、学者、商人、都市住民、写本の読者。',
    legacy:
      '地中海・アフリカ・アジアの建築と工芸へ相互作用をもたらし、欧州でも織物・陶器・装飾が長く収集・翻案された。近代の「装飾」概念からだけ評価しない必要がある。',
    contemporaryConnection:
      '広域文化を単一の名称でまとめる危うさ、信仰・言語・交易・素材が交差するデザインをどう記述するかという現在的課題を示す。',
    viewingPoints: [
      '宗教美術と世俗・宮廷美術を分け、人物表現の有無を一律化しない',
      '文字を意味と造形の両方として見る',
      '王朝・地域・用途による素材と装飾の差を比べる',
    ],
    keywords: ['イスラーム', '書', '幾何学', 'アラベスク', 'ミフラーブ', 'タイル', '写本', '交易'],
    artistIds: [],
    workIds: ['work-islamic-mihrab-met', 'work-islamic-tile-1421', 'work-islamic-mihrab-tile'],
    sourceIds: ['met-nature-islamic-art', 'british-museum-islamic-gallery'],
    verification: 'verified',
  },
  {
    id: 'romanesque-art',
    nameJa: 'ロマネスク美術',
    nameEn: 'Romanesque Art',
    aliases: ['ロマネスク様式', 'Romanesque'],
    shortLabel: 'ロマネスク',
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 450,
    classification: 'style',
    era: 'medieval',
    dates: {
      start: 1000,
      end: 1150,
      peak: [1050, 1150],
      circa: true,
      note: '地域により開始・終期が異なり、12世紀後半まで継続する地域もある',
    },
    regionIds: ['pan-european', 'france', 'spain', 'italy'],
    cities: ['クリュニー', 'コンク', 'トゥールーズ', 'サンティアゴ・デ・コンポステーラ'],
    summary:
      '11〜12世紀の西欧で、修道院・巡礼・聖遺物崇敬を背景に展開した建築・彫刻・壁画。厚い石壁と半円アーチの教会を、入口彫刻や聖堂内部の像が教化と儀礼の場へ変えた。',
    coreIdea:
      '建築・彫刻・絵画を聖堂の機能へ統合し、聖書物語、終末、聖人の力を巡礼者へ身体的に経験させる。',
    socialContext:
      '修道院改革、巡礼路の発達、人口と建設活動の増加が、石造教会と地域工房のネットワークを広げた。',
    politicalContext:
      '領主・司教・修道院が建築を地域の権威と信仰の中心に据え、巡礼路が複数地域を結んだ。',
    religiousContext:
      '聖遺物崇敬、巡礼、典礼、最後の審判への関心が、内陣・周歩廊・入口彫刻・聖遺物容器の形を決めた。',
    technologyContext:
      '石造ヴォールト、半円アーチ、厚い支持壁、塔の建設が防火性と記念性を高めた一方、開口部を制約した。',
    reactionAgainst:
      '単一の先行様式への反発ではなく、古代ローマ建築を想起させる半円アーチと、カロリング・オットー朝、地域的な修道院建築を統合した。',
    inheritedFrom:
      '古代ローマの建築要素、初期中世の写本と金工、ビザンティン的な聖像と正面性、地域の木彫伝統を継承した。',
    visualTraits:
      '半円アーチ、厚い壁、量塊的な建築、入口上部のタンパン彫刻、引き伸ばされた身体、明確な身振り、彩色木彫。',
    compositionSpace:
      '彫刻は柱頭・扉口・後陣など建築の枠へ従い、人物の比率を変形して物語と警告を読ませる。',
    colorLight:
      '現在の石肌より本来は壁画・彫刻の彩色が豊かで、限られた窓からの光が祭壇と聖像を強調した。',
    technique:
      '石造ヴォールト、石彫、木彫と彩色、フレスコ、金工、写本彩飾、象牙彫。',
    materials: '石、木、顔料、漆喰、金・銀・宝石、羊皮紙。',
    subjects: 'キリスト、聖母、最後の審判、聖人、怪物、聖書物語、巡礼と聖遺物。',
    artistStatus:
      '多くは匿名の修道院・地域工房の職人で、作風から便宜的に「〜の師」と呼ばれる例がある。',
    productionSystem:
      '修道院・司教座・巡礼教会の造営現場で、石工・彫刻家・画家・金工が分業し、職人が地域間を移動した。',
    patronage: '修道院、司教、領主、王侯、巡礼者の寄進。',
    marketExhibition:
      '教会建築と典礼に組み込まれ、扉口・祭壇・聖遺物容器は巡礼者の動線の中で見られた。',
    audience: '修道士、聖職者、地域共同体、巡礼者。',
    legacy:
      '石造建築と建築彫刻の統合をゴシックへ渡し、19世紀には中世建築の保存と復興を通じて再評価された。',
    contemporaryConnection:
      '像を独立した展示物でなく建築・移動・共同体の実践へ結びつける考えは、サイトスペシフィックな鑑賞を考える基準になる。',
    viewingPoints: [
      '建築彫刻を単体でなく扉口や柱頭の位置と巡礼者の動線から見る',
      '現在失われた彩色を想像し、暗い石造空間という固定観念を疑う',
      '身体の変形を不自然さではなく建築枠と意味への適応として読む',
    ],
    keywords: ['ロマネスク', '巡礼', '修道院', '半円アーチ', 'タンパン', '聖遺物', '彩色木彫'],
    artistIds: ['artist-master-of-pedret'],
    workIds: [
      'work-romanesque-virgin-majesty',
      'work-master-pedret-adoration',
      'work-romanesque-enthroned-virgin',
    ],
    sourceIds: ['met-romanesque-art', 'smarthistory-romanesque-intro'],
    verification: 'verified',
  },
  {
    id: 'ukiyo-e',
    nameJa: '浮世絵',
    nameEn: 'Ukiyo-e',
    aliases: ['錦絵', 'ukiyo-e woodblock prints'],
    shortLabel: '浮世絵',
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 950,
    classification: 'school',
    era: 'baroque-rococo',
    dates: {
      start: 1670,
      end: 1868,
      peak: [1765, 1858],
      circa: true,
      note: '菱川師宣期から幕末までを概観。版元・絵師・彫師・摺師の展開と上方・江戸の差を含む',
    },
    regionIds: ['japan'],
    cities: ['江戸', '京都', '大坂'],
    summary:
      '都市の遊興・役者・美人・名所・風景を、出版と多色木版の分業で広く流通させた江戸時代の絵画・版画文化。肉筆画から錦絵までを含み、近代西洋美術にも部分的な刺激を与えた。',
    coreIdea:
      '移ろう都市生活と流行を、反復可能な版画として迅速に共有する。大胆な切り取り、平面、線、色面が情報と感覚を結ぶ。',
    socialContext:
      '江戸の人口増加、識字、出版市場、歌舞伎・遊里・名所旅行の拡大が、安価な一枚摺とシリーズ出版を支えた。',
    politicalContext:
      '幕府の出版統制や贅沢禁止令のもとで、版元と絵師は判じ物・戯画・意匠の工夫を用いながら市場に応答した。',
    technologyContext:
      '見当を用いる多色摺、精密な彫り、ぼかしや空摺など、絵師・彫師・摺師・版元の分業が錦絵の高度な再現性を可能にした。',
    reactionAgainst:
      '宮廷・寺社・武家のための一点物だけに依存せず、都市の町人文化と出版市場に応じる複製メディアを発達させた。',
    inheritedFrom:
      '大和絵・風俗画・版本挿絵・琳派的な平面と装飾、狩野派などの筆法を、出版と都市主題へ選択的に翻案した。',
    visualTraits:
      '明快な輪郭、大きな色面、非対称構図、俯瞰、画面端で切れる対象、雨・波・雪などのパターン、文字と像の共存。',
    compositionSpace:
      '一点透視に限定せず、俯瞰・斜線・切り取り・前景の拡大で視線を操作し、連作によって場所と時間を横断する。',
    colorLight:
      '植物・鉱物・輸入顔料を用いた多色摺。限られた色版の重なりとぼかしによって、天候・時間・流行色を表す。',
    technique:
      '版下、木版彫刻、多色摺、ぼかし、空摺、雲母摺。肉筆浮世絵では紙・絹への墨と彩色。',
    materials: '和紙、版木、墨、顔料、膠、雲母。',
    subjects: '役者、美人、遊里、相撲、名所、風景、花鳥、武者、物語、戯画。',
    artistStatus:
      '絵師は版元・彫師・摺師と協働し、流派名を継承する者も多かった。個人の名声と出版ブランドが結びついた。',
    productionSystem:
      '版元が企画・資金・販売を担い、絵師、彫師、摺師が分業する出版産業として制作された。',
    patronage: '版元と都市の購買者。特定の大口後援者より市場需要の比重が大きい。',
    marketExhibition:
      '絵草紙屋や行商を通じて販売され、アルバムや貼り込み、室内装飾として個人が所有した。後世は収集・輸出市場で再評価された。',
    audience: '江戸・上方の町人、旅行者、歌舞伎や遊里の愛好者、のちに海外の収集家・芸術家。',
    legacy:
      '日本の出版・グラフィック文化へつながり、19世紀後半の欧州でジャポニスムを通じて構図・平面・色彩の一部が印象派やポスト印象派に作用した。',
    contemporaryConnection:
      '複製メディア、シリーズ、流行、ファンダム、都市イメージの循環は、現代の印刷・マンガ・広告・SNS画像文化を考える参照点になる。',
    viewingPoints: [
      '絵師だけでなく版元・彫師・摺師の分業を見る',
      '大胆な切り取りと余白が視線をどう導くか確かめる',
      '西洋への「影響」だけでなく江戸の市場と利用者の文脈で読む',
    ],
    keywords: ['浮世絵', '錦絵', '木版', '出版', '江戸', '役者絵', '美人画', '名所絵'],
    artistIds: ['artist-hokusai', 'artist-hiroshige', 'artist-utamaro'],
    workIds: ['work-hokusai-great-wave', 'work-hiroshige-sudden-shower', 'work-utamaro-takashima-ohisa'],
    sourceIds: ['met-japonisme', 'british-museum-ukiyoe-technique'],
    verification: 'verified',
  },
  {
    id: 'expressionism',
    nameJa: '表現主義',
    nameEn: 'Expressionism',
    aliases: ['ドイツ表現主義', 'German Expressionism'],
    shortLabel: '表現主義',
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 1650,
    classification: 'movement',
    era: 'modern',
    dates: {
      start: 1905,
      end: 1920,
      peak: [1905, 1914],
      circa: true,
      note: '本項目は主にドイツ語圏のブリュッケと青騎士を中心に扱う。広義の表現主義はより広い時期・地域を含む',
    },
    regionIds: ['germany', 'pan-european'],
    cities: ['ドレスデン', 'ベルリン', 'ミュンヘン', 'ウィーン'],
    summary:
      '外界の正確な再現より感情・精神・不安を優先し、強い色、歪んだ形、粗い筆触や木版で近代生活を表した動向。ブリュッケと青騎士を中心に、単一組織ではない複数の活動を含む。',
    coreIdea:
      '見たままを写すのではなく、色・線・形を変形して内的経験を外へ出す。表現の強度が記述の正確さより優先される。',
    socialContext:
      '急速な都市化、産業化、大衆社会、世紀転換期の心理学、第一次世界大戦前後の不安が、既成文化への違和感と新しい共同体志向を強めた。',
    politicalContext:
      '帝政ドイツの保守的な美術制度や社会規範への批判、戦争体験と革命期の政治化が、作家ごとに異なる方向を生んだ。',
    philosophy:
      'ニーチェ、精神性、原初性への関心が、合理主義やアカデミーの規範に対する別の価値基準を与えた。ただし非西洋文化を「原始」とみなした歴史的問題も検討が必要である。',
    reactionAgainst:
      'アカデミーの滑らかな仕上げ、印象派的な外光の観察、ブルジョワ社会の安定した外観に対し、歪み・粗さ・不協和な色を選んだ。',
    inheritedFrom:
      'ゴッホ、ゴーギャン、ムンク、象徴主義、フォーヴィスム、ドイツ木版、民衆芸術から色・線・主観の可能性を受け取った。',
    visualTraits:
      '非自然的な高彩度色、鋭い輪郭、歪んだ身体と都市、粗い木版・筆触、平面化、緊張したリズム。',
    compositionSpace:
      '奥行きは圧縮され、斜線や切り取りが都市の速度と不安を強める。青騎士では色面と線が対象から自律する。',
    colorLight:
      '補色や不協和な色を感情の符号として用い、自然光の再現より心理的強度を優先する。',
    technique:
      '油彩、木版、リトグラフ、エッチング、素描。直接的な刻線や筆触を残し、複製印刷も声明と交流に活用した。',
    materials: '油彩、キャンバス、紙、木版、印刷インク。',
    subjects: '都市、街路、裸婦、肖像、動物、風景、宗教・黙示録的主題、戦争と不安。',
    artistStatus:
      '若い芸術家が展覧会・宣言・出版・共同生活を通じて集団を形成し、独立した作家と緩やかに交差した。',
    productionSystem:
      'ブリュッケや青騎士の共同展、版画ポートフォリオ、年鑑、画廊を通じて制作と理念を共有した。',
    patronage: '画商、収集家、独立展の観客、版画購読者。',
    marketExhibition:
      '既成サロン外の共同展と画廊、版画出版によって流通した。ナチ期には「退廃芸術」として弾圧された。',
    audience: '都市の新しい観客、収集家、芸術家仲間、版画購読者。',
    legacy:
      '新即物主義の反応を招く一方、抽象、戦後表現主義、ネオ・エクスプレッショニズムへ、感情と素材の直接性という問題を残した。',
    contemporaryConnection:
      '社会的不安や身体感覚を、情報の正確さではなく歪みと色で伝える方法は、危機の表象と主観性を考える基準になる。',
    viewingPoints: [
      '色を対象の固有色でなく感情と構造の働きとして見る',
      'ブリュッケと青騎士、ウィーンの作家を一つの様式に均質化しない',
      '非西洋・民衆芸術の受容に含まれた植民地主義的視線も確認する',
    ],
    keywords: ['表現主義', 'ブリュッケ', '青騎士', '都市不安', '木版', '歪み', '精神性'],
    artistIds: ['artist-kirchner', 'artist-kandinsky', 'artist-franz-marc'],
    workIds: ['work-kirchner-brucke-poster', 'work-kandinsky-improvisation-30', 'work-franz-marc-bewitched-mill'],
    sourceIds: ['moma-expressionism', 'smarthistory-expressionism-intro'],
    verification: 'verified',
  },
  {
    id: 'bauhaus',
    nameJa: 'バウハウス',
    nameEn: 'Bauhaus',
    aliases: ['Staatliches Bauhaus', 'バウハウス学校'],
    shortLabel: 'バウハウス',
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 1950,
    classification: 'movement',
    era: 'modern',
    dates: {
      start: 1919,
      end: 1933,
      peak: [1923, 1928],
      circa: false,
      note: 'ワイマール創設からベルリンでの閉鎖まで。1919–25ワイマール、1925–32デッサウ、1932–33ベルリン',
    },
    regionIds: ['germany'],
    cities: ['ワイマール', 'デッサウ', 'ベルリン'],
    summary:
      '美術・工芸・建築・デザイン・舞台・写真を教育と工房で横断し、技術時代の生活環境を再設計した学校・運動。単一の「機能主義様式」ではなく、校長・時期・工房による変化を含む。',
    coreIdea:
      '芸術と工芸の分断を問い、基礎教育と素材実験、工房、産業との協働を通じて、建物から日用品まで総合的に設計する。',
    socialContext:
      '第一次世界大戦後のドイツ、ワイマール共和国、住宅不足、工業生産、教育改革の要請が、生活と生産を結ぶ新しい学校像を促した。',
    politicalContext:
      '地方政府の政治変化と右翼からの圧力でワイマールからデッサウ、ベルリンへ移転し、1933年に閉鎖された。教育とデザインは政治から独立していなかった。',
    philosophy:
      'ヨハネス・イッテン、モホリ＝ナジ、アルバースらの基礎課程は知覚・素材・色彩を再学習させ、芸術家の個性と標準化の緊張を教育の中に置いた。',
    technologyContext:
      '工房を実験室と位置づけ、鋼管、ガラス、コンクリート、写真、タイポグラフィ、機械生産に適した試作を進めた。',
    reactionAgainst:
      '歴史様式の模倣と美術・工芸・産業の分断に対し、素材・機能・生産方法から形を組み立てる教育と実践を提示した。',
    inheritedFrom:
      'アーツ・アンド・クラフツの生活と工芸の統合、ドイツ工作連盟、表現主義、デ・ステイル、ロシア構成主義の理念を、学校制度と工房へ再編した。',
    visualTraits:
      '幾何学、非対称、明快なタイポグラフィ、素材の露出、標準化可能な形、白い面と原色。ただし初期の表現主義的作品や工芸も含む。',
    compositionSpace:
      '建築では機能の異なる棟を連結し、ガラス面と動線で内部を可視化する。グラフィックではグリッド、斜線、写真と文字を統合する。',
    colorLight:
      '色彩理論と工房実験を通じ、原色・中性色・素材色を機能と空間の識別に用いる。ガラスは採光と反射を構造化する。',
    technique:
      '予備課程、素材研究、工房制作、プロトタイプ、写真・フォトグラム、タイポグラフィ、鋼管家具、織物、建築設計。',
    materials: '鋼管、ガラス、コンクリート、木、金属、織物、紙、写真感光材。',
    subjects: '住宅、家具、器物、タイポグラフィ、写真、舞台、色彩、教育、総合建築。',
    artistStatus:
      'マイスターと学生が工房で協働し、芸術家・職人・デザイナー・建築家の境界を組み替えた。女性が織物工房へ偏って配置された制度上の問題もある。',
    productionSystem:
      '基礎課程から工房へ進み、試作品を産業界と協働して量産へ接続する学校・研究所・制作工房の複合体だった。',
    patronage: '州・市政府、学校、産業企業、住宅・公共建築の注文者。',
    marketExhibition:
      '学校展、出版、製品カタログ、企業とのライセンス、建築・家具・印刷物を通じて理念と試作品を国際的に流通させた。',
    audience: '学生、産業界、住宅利用者、近代デザインの専門家、展覧会・出版の読者。',
    legacy:
      '閉鎖後に教員・学生が各地へ移住し、建築・デザイン教育・タイポグラフィ・企業デザインへ大きな影響を残した。一方、「バウハウス様式」への単純化は教育の多様性を隠す。',
    contemporaryConnection:
      'デザイン教育、学際協働、試作、標準化、テクノロジーと生活の関係をめぐる議論の基準であり続ける。',
    viewingPoints: [
      '白い建築だけでなく、教育・織物・舞台・写真・印刷を横断して見る',
      '1919〜33年を一つの様式にせず、校長・都市・工房の変化を追う',
      '機能と量産の理想だけでなく、ジェンダーや政治的圧力も確認する',
    ],
    keywords: ['バウハウス', '工房', '基礎課程', 'デザイン教育', '機能', '量産', 'タイポグラフィ', '建築'],
    artistIds: ['artist-walter-gropius', 'artist-marcel-breuer', 'artist-marianne-brandt'],
    workIds: ['work-bauhaus-dessau-building', 'work-brandt-tea-infuser', 'work-breuer-wassily-chair'],
    sourceIds: ['met-bauhaus', 'bauhaus-archiv-history'],
    verification: 'verified',
  },
];
