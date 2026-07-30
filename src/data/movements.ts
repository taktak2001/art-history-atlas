import type { Movement } from '@/lib/schema';
import { coreExpansionMovements } from './expansion/core-movements';

/**
 * 初期収録ムーブメント（30件）。
 *
 * 各記述は出典（sourceIds）に基づく。事実と解釈を区別し、断定を避けるべき箇所は
 * 「〜とされる」「見解の一つ」等で示す。年代は諸説ある場合 dates.circa=true と note で明示。
 * 発展史観（未熟→進歩）を採らず、各時代の異なる目的・価値・鑑賞環境を記述する方針。
 */
export const movements: Movement[] = [
  /* 1 ─────────────────────────────────────────────── */
  {
    id: 'prehistoric-ritual',
    nameJa: '先史美術（旧石器〜新石器の造形）',
    nameEn: 'Prehistoric Art',
    aliases: ['洞窟壁画', '旧石器美術', 'Paleolithic art'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 100,
    shortLabel: '先史美術',
    classification: 'period',
    era: 'prehistoric-ancient',
    dates: { start: -40000, end: -3000, circa: true, note: '年代は放射性炭素年代測定に基づく概算で、地域差が大きい' },
    regionIds: ['pan-european', 'other'],
    cities: ['ラスコー', 'ショーヴェ', 'アルタミラ', 'ヴィレンドルフ'],
    summary:
      '文字以前の社会が残した洞窟壁画・小像・刻線。宗教・儀礼・生存と結びついた造形で、「鑑賞のための美術」という近代的枠組みの外側にある。',
    coreIdea:
      '動物や女性像の表現は、狩猟・多産・共同体の記憶や信仰と結びついていたと考えられる。制作行為そのものに意味があった可能性が指摘される。',
    socialContext:
      '狩猟採集から定住・農耕へ移行する長い期間に、少人数の共同体が儀礼の場として洞窟や小像を用いた。',
    religiousContext:
      'アニミズム的・呪術的な世界観と結びついていたと推定されるが、具体的信仰は文献がなく確定できない（見解は複数ある）。',
    reactionAgainst:
      '先行する明確な「様式」への反発という枠組みは当てはまらない。むしろ美術以前の造形衝動の起点として位置づけられる。',
    inheritedFrom:
      '道具製作の技術と、身体・自然の観察の蓄積を造形へ転用した。',
    visualTraits:
      '動物の側面観を的確に捉える輪郭線、重なり合う描写、女性像における身体の誇張（乳房・腰）。',
    compositionSpace:
      '地と図の関係は近代的な画面構成とは異なり、岩面の凹凸を利用して立体感を生む。空間の統一的枠はない。',
    colorLight:
      '木炭・黄土・酸化鉄などの土性顔料による黒・赤・黄。松明の揺れる光の下で見られたと考えられる。',
    technique:
      '指・毛皮・植物繊維での塗布、吹き付け（ステンシル）、岩面への刻線・浮彫。',
    materials: '土性顔料、木炭、獣脂、骨・石・象牙。',
    subjects: '馬・バイソン・マンモス等の大型動物、手形、女性像（いわゆるヴィーナス小像）。',
    artistStatus:
      '「芸術家」という職業概念は存在せず、儀礼の担い手や共同体の成員が制作したと考えられる。',
    productionSystem: '共同体の儀礼・生活の一部として制作された。',
    patronage: '個人的注文主は存在しない。共同体的な必要が動機とされる。',
    marketExhibition: '市場や展示の制度はない。洞窟は限られた者だけが立ち入る場だった可能性がある。',
    audience: '共同体の限られた成員。可視性が低い奥部に描かれた例も多い。',
    legacy:
      '20世紀の芸術家（例：抽象・原始美術への関心）に「起源としての造形」という発想を与えた。人類の表象能力の始点として美術史の出発点に置かれる。',
    contemporaryConnection:
      '身体・儀礼・場と結びついた美術という主題は、後のインスタレーションや没入型作品の問題意識と共鳴する。',
    viewingPoints: [
      '「上手い/下手」ではなく、何のために描かれたかを問う',
      '岩面の凹凸と光の効果を想像する',
      '近代美術館的な鑑賞とは異なる受容環境を意識する',
    ],
    keywords: ['先史', '洞窟壁画', '儀礼', 'ヴィーナス小像', '旧石器', '顔料', '狩猟'],
    artistIds: [],
    workIds: ['work-lascaux-hall-of-bulls', 'work-venus-of-willendorf'],
    sourceIds: ['met-lascaux', 'smarthistory-venus-willendorf'],
    verification: 'verified',
  },

  /* 2 ─────────────────────────────────────────────── */
  {
    id: 'ancient-greek-classical',
    nameJa: '古代ギリシア古典美術',
    nameEn: 'Classical Greek Art',
    aliases: ['クラシック期', 'ハイクラシック', 'Classical antiquity'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 200,
    shortLabel: '古代ギリシア',
    classification: 'period',
    era: 'prehistoric-ancient',
    dates: { start: -480, end: -323, peak: [-450, -400], circa: false, note: 'ペルシア戦争終結からアレクサンドロス大王の死まで' },
    regionIds: ['mediterranean'],
    cities: ['アテネ', 'オリンピア', 'アルゴス'],
    summary:
      'ポリス（都市国家）の市民社会を背景に、理想化された人体と均衡を追求した美術。生命感と永続性・明晰・調和を両立させた表現が目指された。',
    coreIdea:
      '数的比例（カノン）と観察に基づき、個別を超えた「理想的人体」を造形する。人間を尺度とする価値観が根底にある。',
    socialContext:
      'ペルシア戦争勝利後のアテネがデロス同盟を主導し、政治・経済・文化の中心となった。公共建築・彫刻に富が投じられた。',
    politicalContext:
      '民主政と市民の公共性が美術に反映し、神殿・記念碑は都市の誇りとして機能した。',
    religiousContext: '神々の像・神殿装飾を通じて宗教儀礼と結びついた。',
    philosophy:
      'プロタゴラスの「人間は万物の尺度」に象徴される人間中心的思考と、比例・調和の理念が共鳴する。',
    reactionAgainst:
      '幾何学様式やアルカイック期の正面性・定型的な微笑（アルカイック・スマイル）を脱し、自然な動勢と重心移動（コントラポスト）を導入した。',
    inheritedFrom:
      'アルカイック期のクーロス像に蓄積された人体観察と、神殿建築の秩序を継承した。',
    visualTraits:
      'コントラポストによる自然な立ち姿、理想化された筋肉と均整、静と動の均衡。',
    compositionSpace:
      '彫刻は三次元の実在感を重視し、建築彫刻は破風・フリーズの枠内で叙事的場面を構成する。',
    colorLight:
      '大理石やブロンズ。彫刻は当時彩色されていたことが分かっており、白い古代というイメージは後世の理解による。',
    technique: 'ブロンズの中空鋳造（ロストワックス）、大理石彫刻、レリーフ。',
    materials: '大理石、ブロンズ、（神殿では）石灰岩・彩色。',
    subjects: '神々、英雄、運動選手、市民、神話的場面。',
    artistStatus:
      '一部の彫刻家（フェイディアス等）は名を残したが、多くは職人的地位にあった。',
    productionSystem: '都市・神殿・富裕市民の公共的注文により工房で制作された。',
    patronage: '都市国家、神殿、富裕な市民・後援者。',
    marketExhibition: '神殿・アゴラ・公共空間に設置され、市民が日常的に接した。',
    audience: '都市の市民全体。宗教・政治の場で共有された。',
    legacy:
      'ローマ美術に模刻を通じて継承され、ルネサンス・新古典主義における「古典＝規範」の源泉となった。',
    contemporaryConnection:
      '「理想的身体」「規範」という観念は、現代における身体表象や規範批判の議論の参照点であり続ける。',
    viewingPoints: [
      'コントラポストによる重心の移動を見る',
      '当初は彩色されていた可能性を念頭に置く',
      'ローマ期の大理石模刻を通じて伝わった作品が多い点に注意',
    ],
    keywords: ['ギリシア', '古典', '理想的人体', 'コントラポスト', 'ポリス', '大理石', 'ブロンズ'],
    artistIds: ['artist-polykleitos', 'artist-phidias'],
    workIds: ['work-doryphoros'],
    sourceIds: ['met-classical-greece'],
    verification: 'verified',
  },

  /* 3 ─────────────────────────────────────────────── */
  {
    id: 'early-christian-byzantine',
    nameJa: '初期キリスト教・ビザンティン美術',
    nameEn: 'Early Christian and Byzantine Art',
    aliases: ['ビザンチン美術', 'イコン', 'Byzantine art'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 300,
    shortLabel: '初期キリスト教・ビザンティン',
    classification: 'period',
    era: 'medieval',
    dates: { start: 330, end: 1453, peak: [843, 1204], circa: false, note: 'コンスタンティノープル遷都からその陥落まで' },
    regionIds: ['mediterranean', 'other'],
    cities: ['コンスタンティノープル', 'ラヴェンナ', 'テッサロニキ'],
    summary:
      'キリスト教を国教とした東ローマ帝国の美術。地上の写実ではなく、神的秩序を象徴する超越的空間を金地とイコンで示す。',
    coreIdea:
      '像は神聖なものへ通じる「窓」であり、物理的正確さより神学的意味・象徴性が優先される。',
    socialContext:
      'ローマ帝国の東方でキリスト教が公認・国教化し、教会と皇帝が美術の主要な担い手となった。',
    politicalContext:
      '皇帝は神の代理人として表象され、宗教美術と帝権の正当化が結びついた。',
    religiousContext:
      'イコン（聖像）の役割をめぐる聖像破壊論争（イコノクラスム）が起き、843年の終結後に像の神学的位置づけが確立した。',
    reactionAgainst:
      '古典古代の自然主義的な三次元表現を意図的に退け、平面性・正面性・非自然的空間を選んだ。これは技術的後退ではなく、目的の転換である。',
    inheritedFrom:
      'ローマの記念碑的建築とモザイク技法、皇帝表象の図像を受け継いだ。',
    visualTraits:
      '正面性、金地、細長い人物、大きな眼、遠近を排した象徴的空間。',
    compositionSpace:
      '合理的遠近法ではなく、重要度に応じた階層的配置（重要人物ほど大きく中央に）を用いる。',
    colorLight:
      '金地のモザイクが物理的な光を反射し、堂内で超越的な輝きを生む。色は象徴的意味を担う。',
    technique: 'ガラス・金のテッセラによるモザイク、テンペラの板絵（イコン）、フレスコ。',
    materials: '金箔ガラス、大理石、板・テンペラ、フレスコ。',
    subjects: 'キリスト、聖母、聖人、皇帝、聖書の場面。',
    artistStatus: '制作者は匿名の職人が多く、個人の創意より伝統的規範の継承が重んじられた。',
    productionSystem: '教会・修道院・宮廷の注文により工房で制作された。',
    patronage: '皇帝、教会、修道院。',
    marketExhibition: '聖堂・礼拝空間が「展示」の場であり、典礼の中で機能した。',
    audience: '信徒。像は礼拝と教化の対象だった。',
    legacy:
      '正教圏のイコン伝統として現在まで継続し、中世西欧美術やロシア美術にも波及した。平面性・象徴空間の理念は近代の反遠近法的表現とも響き合う。',
    contemporaryConnection:
      '「像とは何か」「見ることと信じること」という問いは、現代の映像・イメージ論にも接続する。',
    viewingPoints: [
      '写実の巧拙ではなく象徴の体系として読む',
      '金地が実際の光を反射する効果を想像する',
      '人物の大きさが重要度を示す階層構造に注目',
    ],
    keywords: ['ビザンティン', 'イコン', 'モザイク', '金地', '象徴的空間', 'イコノクラスム'],
    artistIds: [],
    workIds: [],
    sourceIds: ['met-byzantium'],
    verification: 'verified',
  },

  /* 4 ─────────────────────────────────────────────── */
  {
    id: 'gothic',
    nameJa: 'ゴシック美術',
    nameEn: 'Gothic Art',
    aliases: ['ゴシック様式', 'Gothic'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 400,
    shortLabel: 'ゴシック',
    classification: 'style',
    era: 'medieval',
    dates: { start: 1140, end: 1400, peak: [1200, 1300], circa: true, note: 'サン・ドニ修道院聖堂の改築（1140年頃）を起点とするのが通説' },
    regionIds: ['france', 'pan-european'],
    cities: ['パリ', 'シャルトル', 'ランス', 'アミアン'],
    summary:
      '大聖堂建築を中心に展開した中世盛期の様式。尖頭アーチ・リブ・飛梁の構造革新が高く明るい内部空間を可能にし、ステンドグラスの光が神学的意味を担った。',
    coreIdea:
      '光を神の顕現とみなす神学（新プラトン主義的な光の形而上学）を、建築構造と色ガラスによって可視化する。',
    socialContext:
      '都市の成長と大聖堂建設が地域の威信と結びつき、職人組合（ギルド）が高度な技術を担った。',
    religiousContext:
      'サン・ドニ修道院長シュジェールらが、光と美を通じて神へ至るという思想を建築に結実させたとされる。',
    technologyContext:
      '尖頭アーチ・リブ・ヴォールト・フライングバットレスにより荷重を分散し、壁を薄く高くして大きな窓を開けた。',
    reactionAgainst:
      '厚い壁と半円アーチで重厚・薄暗いロマネスクに対し、構造の合理化で軽やかさと採光を実現した。',
    inheritedFrom:
      'ロマネスクの石造建築技術とキリスト教図像を継承しつつ、構造を刷新した。',
    visualTraits:
      '垂直性の強調、尖頭アーチ、バラ窓、細部の自然観察が進んだ彫刻。',
    compositionSpace:
      '建築は上昇する垂直方向を強調し、内部は光に満たされた非物質的空間として設計される。',
    colorLight:
      'ステンドグラスを透過した色光が堂内を満たし、光そのものが装飾かつ神学的メッセージとなる。',
    technique: '石造建築、ステンドグラス、写本装飾、木彫・石彫。',
    materials: '石、色ガラスと鉛、羊皮紙・金・顔料（写本）。',
    subjects: '聖書物語、最後の審判、聖母、聖人、labors of the months（月々の労働）。',
    artistStatus:
      '建築家（棟梁）や一部の彫刻家は名を残し始めるが、多くは組合の職人だった。',
    productionSystem: '大聖堂造営組織とギルドによる分業。',
    patronage: '司教座聖堂、修道院、王権、都市。',
    marketExhibition: '大聖堂そのものが公共の宗教的・社会的空間として機能した。',
    audience: '都市住民と巡礼者。識字によらず図像で教義を伝えた。',
    legacy:
      '19世紀のゴシック・リバイバルで再評価され、中世＝暗黒という見方を覆した。光と空間の統合という発想は近代建築にも影響した。',
    contemporaryConnection:
      '光を素材として空間を構成する発想は、ライト・アンド・スペースや没入型インスタレーションの遠い先駆と見ることもできる。',
    viewingPoints: [
      '構造（尖頭アーチ・飛梁）が空間と採光をどう可能にしたかを見る',
      'ステンドグラスの色光が意味を担う点に注目',
      '「中世＝技術的未熟」という単純化を避ける',
    ],
    keywords: ['ゴシック', '大聖堂', 'ステンドグラス', '尖頭アーチ', '光', 'シュジェール'],
    artistIds: [],
    workIds: [],
    sourceIds: ['smarthistory-gothic-architecture', 'smarthistory-late-gothic'],
    verification: 'verified',
  },

  /* 5 ─────────────────────────────────────────────── */
  {
    id: 'italian-renaissance',
    nameJa: 'イタリア・ルネサンス',
    nameEn: 'Italian Renaissance',
    aliases: ['盛期ルネサンス', 'ルネサンス', 'Renaissance'],
    visibilityLevel: 'core',
    groupId: 'renaissance-europe',
    isRepresentative: true,
    displayOrder: 500,
    shortLabel: '伊ルネサンス',
    classification: 'period',
    era: 'renaissance',
    dates: { start: 1400, end: 1520, peak: [1490, 1520], circa: true, note: '盛期ルネサンスは1490年代〜1520年頃' },
    regionIds: ['italy'],
    cities: ['フィレンツェ', 'ローマ', 'ヴェネツィア'],
    summary:
      '古典古代の復興と人文主義を背景に、線遠近法・解剖学・古典的比例を統合した様式。人間と現世を積極的に肯定する視覚言語が確立した。',
    coreIdea:
      '数学的な線遠近法により、単一の視点から見た合理的な三次元空間を画面に構築する。人間を世界理解の中心に置く。',
    socialContext:
      'フィレンツェの銀行・商業資本（メディチ家等）と都市の競争が、芸術への投資を促した。',
    politicalContext: '都市国家・教皇庁・宮廷が威信をかけて芸術を保護した。',
    religiousContext:
      '宗教主題は継続するが、人間的・現世的な表現と結びつき、教会改革前夜の宗教文化を反映する。',
    philosophy:
      '古典文献の再発見と人文主義（フマニタス）が、人間の尊厳と可能性を強調した。',
    technologyContext:
      'ブルネレスキが定式化したとされる線遠近法と、解剖学的知識が写実を支えた。',
    reactionAgainst:
      'ゴシックの平面的・象徴的空間に対し、合理的で統一された遠近法的空間を対置した。ただし目的の違いであり優劣ではない。',
    inheritedFrom:
      '古代ローマの建築・彫刻の比例と、トレチェント（ジョット等）の空間表現を継承した。',
    visualTraits:
      '線遠近法による奥行き、均整のとれた人体、ピラミッド型の安定した構図、明暗による立体感。',
    compositionSpace:
      '消失点を持つ幾何学的空間に人物を配し、安定した幾何学的構図（三角形構図など）を用いる。',
    colorLight:
      'キアロスクーロ（明暗法）で立体を表し、フィレンツェは線描を、ヴェネツィアは色彩を重視した。',
    technique: 'フレスコ、テンペラから油彩への移行、スフマート（レオナルド）。',
    materials: '板・カンヴァス、油彩・テンペラ、壁面フレスコ、大理石・ブロンズ。',
    subjects: '宗教画、神話、肖像、古代主題。',
    artistStatus:
      '職人から知的créateurへと地位が上昇し始め、レオナルドやミケランジェロは「天才」として遇された。',
    productionSystem: '工房（ボッテガ）での徒弟制と分業。',
    patronage: 'メディチ家等の富裕市民、教皇、君主、修道会。',
    marketExhibition: '教会・宮殿・公共空間への設置注文が中心。',
    audience: '注文主とその共同体、教会に集う人々。',
    legacy:
      '西洋美術の「規範」として長く参照され、遠近法的空間はその後数世紀の標準となった。近代のモダニズムはこの遠近法的伝統への批判として展開する。',
    contemporaryConnection:
      '単一視点遠近法の確立は、後のキュビスムやデジタル空間による「視点の複数化・再構成」を考える出発点になる。',
    viewingPoints: [
      '消失点を探し、空間がどう構築されているか見る',
      'フィレンツェの線描とヴェネツィアの色彩の違いに注目',
      '宗教主題でも人間的表現が前景化している点を読む',
    ],
    keywords: ['ルネサンス', '線遠近法', '人文主義', 'キアロスクーロ', 'フィレンツェ', 'メディチ'],
    artistIds: ['artist-leonardo', 'artist-michelangelo', 'artist-raphael'],
    workIds: ['work-mona-lisa', 'work-school-of-athens'],
    sourceIds: ['tate-renaissance'],
    verification: 'verified',
  },

  /* 6 ─────────────────────────────────────────────── */
  {
    id: 'northern-renaissance',
    nameJa: '北方ルネサンス',
    nameEn: 'Northern Renaissance',
    aliases: ['初期ネーデルラント絵画', 'フランドル絵画', 'Early Netherlandish painting'],
    visibilityLevel: 'core',
    groupId: 'renaissance-europe',
    displayOrder: 600,
    shortLabel: '北方ルネサンス',
    classification: 'period',
    era: 'renaissance',
    dates: { start: 1420, end: 1580, peak: [1430, 1520], circa: true, note: '15世紀初頭のネーデルラントを起点とする' },
    regionIds: ['netherlands', 'germany'],
    cities: ['ブルッヘ', 'ヘント', 'ニュルンベルク'],
    summary:
      '油彩技法の精緻な発達を背景に、光・質感・細部の観察を極限まで高めたアルプス以北の美術。印刷術の登場が図像の流通を変えた。',
    coreIdea:
      '目に見える世界の細部（織物・金属・光の反射）を油彩で緻密に再現し、日常の事物に象徴的意味を込める（隠された象徴）。',
    socialContext:
      'ブルッヘ等の商業都市の繁栄と富裕市民層の台頭が、肖像・宗教画の需要を生んだ。',
    religiousContext: '個人的な信仰（デヴォティオ・モデルナ）が小型の礼拝画を求めた。',
    technologyContext:
      'ファン・エイクらによる油彩技法の洗練と、グーテンベルクの活版印刷・木版/銅版画による図像の複製・流通。',
    reactionAgainst:
      '国際ゴシックの装飾性に対し、経験的観察に基づく緻密な写実を推し進めた。イタリアの数学的遠近法とは異なる経路をとった。',
    inheritedFrom:
      'ゴシック写本装飾の精緻さと、国際ゴシックの色彩感覚を継承した。',
    visualTraits:
      '微細な描写、光沢・透明感の再現、経験的に積み上げられた奥行き、鋭い個人性の肖像。',
    compositionSpace:
      '数学的な単一消失点より、経験的観察に基づく空間構成。室内の細部が象徴を担う。',
    colorLight:
      '油彩の透明な層（グレーズ）を重ね、深い色と微妙な光の反射を表現する。',
    technique: '油彩（多層グレーズ）、木版・銅版画。',
    materials: '板・油彩、版木・銅板。',
    subjects: '宗教画、肖像、市民生活、寓意。',
    artistStatus:
      '都市のギルドに属する職人だが、ファン・エイクやデューラーは国際的名声を得た。デューラーは自意識的な自画像を残した。',
    productionSystem: 'ギルド工房と、版画による広域な流通。',
    patronage: '宮廷（ブルゴーニュ公）、富裕市民、教会、後に版画市場。',
    marketExhibition: '注文制作に加え、版画は市場向けに複数流通した点が新しい。',
    audience: '宮廷・市民・信徒、版画を通じた広い受容者。',
    legacy:
      '油彩技法はイタリアを含む全ヨーロッパに広まり、写実・肖像・版画の伝統を形成した。',
    contemporaryConnection:
      '複製技術（版画）による図像の流通は、後の複製芸術・大衆イメージ論の先駆として読める。',
    viewingPoints: [
      '事物に込められた象徴（隠された象徴）を探す',
      '油彩による光沢・質感の再現に注目',
      'イタリアと異なる「もう一つのルネサンス」として見る',
    ],
    keywords: ['北方ルネサンス', 'ファン・エイク', '油彩', '版画', 'フランドル', '細部'],
    artistIds: ['artist-van-eyck', 'artist-durer'],
    workIds: ['work-arnolfini-portrait'],
    sourceIds: ['smarthistory-northern-renaissance', 'smarthistory-van-eyck'],
    verification: 'verified',
  },

  /* 7 ─────────────────────────────────────────────── */
  {
    id: 'mannerism',
    nameJa: 'マニエリスム',
    nameEn: 'Mannerism',
    aliases: ['後期ルネサンス', 'Maniera', 'Late Renaissance'],
    visibilityLevel: 'standard',
    groupId: 'renaissance-europe',
    displayOrder: 700,
    classification: 'style',
    era: 'renaissance',
    dates: { start: 1520, end: 1600, peak: [1520, 1580], circa: true, note: '盛期ルネサンスの後、バロックに先立つ時期' },
    regionIds: ['italy'],
    cities: ['フィレンツェ', 'ローマ', 'マントヴァ'],
    summary:
      '盛期ルネサンスの完成された調和を意図的に逸脱し、人工性・優美・複雑さを追求した様式。「解決済み」の後にあえて緊張と技巧を選んだ。',
    coreIdea:
      '自然の忠実な模倣より、洗練された様式（maniera）そのものを見せる。均衡を崩すことで知的・感覚的な洗練を示す。',
    socialContext:
      'ローマ劫掠（1527）や宗教改革による動揺、宮廷文化の洗練が背景にある。',
    religiousContext: '宗教改革と反宗教改革の緊張が、不安定で内省的な表現に影を落とす。',
    reactionAgainst:
      'レオナルド・ラファエロらが到達した安定した調和と自然な比例に対し、意図的な歪曲・逸脱で応じた。',
    inheritedFrom:
      'ミケランジェロ後期の緊張や、盛期ルネサンスの高度な技法を極端に推し進めた。',
    visualTraits:
      '引き伸ばされた人体（フィグーラ・セルペンティナータ）、不安定な構図、非現実的な色彩、密集した画面。',
    compositionSpace:
      '合理的な空間より、圧縮・歪曲された空間。前景に人物を密集させ、遠近を宙吊りにする。',
    colorLight:
      '酸のような鮮烈で人工的な色彩（アシッド・カラー）、非自然的な光。',
    technique: '油彩、フレスコ、装飾芸術。',
    materials: '板・カンヴァス・油彩、フレスコ。',
    subjects: '宗教・神話主題を複雑・寓意的に扱う。',
    artistStatus: '宮廷芸術家として洗練された地位を得た者が多い。',
    productionSystem: '宮廷・教会の注文、工房制作。',
    patronage: 'メディチ宮廷、教皇庁、諸侯。',
    marketExhibition: '宮廷・教会・邸宅への注文。',
    audience: '洗練された宮廷人・知識人。',
    legacy:
      '20世紀に再評価され、「危機の様式」として近代の不安の表現と重ねられた。バロックの劇性へも橋渡しした。',
    contemporaryConnection:
      '規範をあえて崩し、様式の自己言及性を見せる態度は、後のモダニズム/ポストモダンの自己言及的操作と響き合う。',
    viewingPoints: [
      '「なぜあえて不自然にしたのか」を問う',
      '引き伸ばされた身体と圧縮された空間に注目',
      '技巧の誇示という価値観を読む',
    ],
    keywords: ['マニエリスム', '人工性', 'フィグーラ・セルペンティナータ', '宮廷', '歪曲'],
    artistIds: ['artist-pontormo'],
    workIds: [],
    sourceIds: ['tate-mannerist'],
    verification: 'verified',
  },

  /* 8 ─────────────────────────────────────────────── */
  {
    id: 'baroque',
    nameJa: 'バロック',
    nameEn: 'Baroque',
    aliases: ['バロック様式', 'Baroque'],
    visibilityLevel: 'core',
    groupId: 'baroque-and-rococo',
    isRepresentative: true,
    displayOrder: 800,
    classification: 'style',
    era: 'baroque-rococo',
    dates: { start: 1600, end: 1750, peak: [1620, 1680], circa: true },
    regionIds: ['italy', 'spain', 'pan-european'],
    cities: ['ローマ', 'マドリード', 'アントウェルペン'],
    summary:
      '劇的な明暗・運動・感情の喚起によって鑑賞者を巻き込む17世紀の様式。反宗教改革のカトリック教会と絶対王政が、感覚に訴える表現を求めた。',
    coreIdea:
      '静的な理想ではなく、動き・光・感情の頂点の瞬間を捉え、見る者の身体と情動を作品へ引き込む。',
    socialContext:
      '反宗教改革のカトリック教会が、プロテスタントに対抗して感覚的で分かりやすい宗教美術を推進した。絶対王政も威信の演出に用いた。',
    politicalContext: '絶対王政（ルイ14世等）が壮麗な様式を権力の表象に用いた。',
    religiousContext:
      'トリエント公会議後のカトリックが、信仰を鼓舞する劇的なイメージを積極的に活用した。',
    reactionAgainst:
      'マニエリスムの人工的な難解さに対し、直接的な感情喚起と力強い写実で応じた。',
    inheritedFrom:
      'ルネサンスの写実と構図法を継承しつつ、光と運動を強化した。',
    visualTraits:
      '劇的なキアロスクーロ（テネブリズム）、対角線の動勢、感情の高まり、豊かな量感。',
    compositionSpace:
      '対角線・渦巻状の動きで空間に力を与え、画面を超えて鑑賞者の空間へ連続させる（イリュージョニズム）。',
    colorLight:
      '強い明暗対比（スポットライト的な光）、豊かで温かい色彩。',
    technique: '油彩、天井画（クアドラトゥーラ）、彫刻と建築の統合。',
    materials: 'カンヴァス・油彩、フレスコ、大理石・ブロンズ。',
    subjects: '宗教画（殉教・法悦）、神話、肖像、静物。',
    artistStatus: '宮廷画家・教会の主要画家として高い地位を得た者が多い（ルーベンス等）。',
    productionSystem: '大工房（ルーベンス工房）や宮廷付き制作。',
    patronage: 'カトリック教会、王侯、貴族。',
    marketExhibition: '教会・宮殿への設置が中心だが、市場向け制作も拡大した。',
    audience: '信徒、宮廷、貴族、そして広い民衆。',
    legacy:
      '感覚に訴え鑑賞者を巻き込む手法は、後の没入的な空間表現やスペクタクルの系譜につながる。',
    contemporaryConnection:
      '鑑賞者を空間へ引き込むイリュージョニズムは、現代の没入型インスタレーションの問題意識と通じる。',
    viewingPoints: [
      '光がどこから当たり、感情の頂点をどう演出するか見る',
      '対角線の動勢と画面外への連続に注目',
      '宗教改革・王権という「使う側」の意図を読む',
    ],
    keywords: ['バロック', 'テネブリズム', '演劇性', '反宗教改革', 'ルーベンス', 'カラヴァッジョ'],
    artistIds: ['artist-caravaggio', 'artist-rubens', 'artist-velazquez'],
    workIds: ['work-las-meninas'],
    sourceIds: ['tate-baroque'],
    verification: 'verified',
  },

  /* 9 ─────────────────────────────────────────────── */
  {
    id: 'dutch-golden-age',
    nameJa: 'オランダ黄金時代',
    nameEn: 'Dutch Golden Age',
    aliases: ['オランダ絵画', '17世紀オランダ', 'Dutch Golden Age painting'],
    visibilityLevel: 'standard',
    groupId: 'baroque-and-rococo',
    displayOrder: 900,
    shortLabel: 'オランダ黄金時代',
    classification: 'period',
    era: 'baroque-rococo',
    dates: { start: 1600, end: 1700, peak: [1630, 1670], circa: true },
    regionIds: ['netherlands'],
    cities: ['アムステルダム', 'デルフト', 'ハールレム', 'レイデン'],
    summary:
      'プロテスタントの独立共和国オランダで、教会や宮廷ではなく市民と自由市場を担い手として花開いた絵画。風景・静物・風俗・肖像といった世俗のジャンルが自立した。',
    coreIdea:
      '身近な現世の事物・生活・光を精緻に観察し、市民社会の価値観（勤勉・繁栄・節度）を映す。',
    socialContext:
      'スペインから独立した都市共和国で、商業で富を得た市民層が絵画の主要な購買者となった。',
    politicalContext: 'カルヴァン派の共和国として、王権や大教会の注文に依存しない美術市場が形成された。',
    religiousContext:
      'プロテスタントは聖堂の宗教画を抑制したため、宗教主題より世俗的ジャンルが発達した。',
    reactionAgainst:
      'カトリック圏のバロックの壮麗な宗教画・宮廷画とは異なり、市民の生活と現世を主題にした。',
    inheritedFrom:
      '北方の緻密な写実と油彩技法を継承し、風景・静物などのジャンルを専門化した。',
    visualTraits:
      '緻密な質感描写、柔らかな室内光、日常の細部、抑制された色調。',
    compositionSpace:
      '静かな室内空間や広大な低地の風景。光の入り方が空間の主役になる（フェルメール）。',
    colorLight:
      '窓から差す自然光の繊細な再現、レンブラントの劇的な明暗。',
    technique: '油彩、精緻な質感表現、カメラ・オブスクラの利用も指摘される（諸説あり）。',
    materials: 'カンヴァス・板・油彩。',
    subjects: '風景、静物、風俗画、肖像、集団肖像。',
    artistStatus:
      '画家はギルドに属する自営の職人・企業家であり、市場向けに投機的に制作する者もいた。',
    productionSystem: '自由市場向けの制作と、注文（集団肖像等）の併存。',
    patronage: '市民、市の民兵組合、商人、公開市場の購買者。',
    marketExhibition:
      '画商・市・工房を通じた自由な美術市場が発達し、絵画が商品として流通した点が画期的である。',
    audience: '幅広い市民層。家庭に絵画を飾る習慣が広がった。',
    legacy:
      '市場を基盤とする美術の在り方は、後の近代美術市場（画商・展覧会・収集）の先駆となった。ジャンル絵画の自立も後世に影響した。',
    contemporaryConnection:
      'アートが市場で流通する「商品」となる構造は、印象派やポップアートの市場論、現代のアートマーケット論へ連続する。',
    viewingPoints: [
      '教会・宮廷ではなく「市場」が担い手である点を意識する',
      '光と質感の観察の精度を見る',
      'ジャンル（風景・静物・風俗）の自立に注目',
    ],
    keywords: ['オランダ黄金時代', '市民社会', '美術市場', 'フェルメール', 'レンブラント', '静物', '風俗画'],
    artistIds: ['artist-rembrandt', 'artist-vermeer'],
    workIds: ['work-milkmaid'],
    sourceIds: ['met-dutch-golden-age'],
    verification: 'verified',
  },

  /* 10 ─────────────────────────────────────────────── */
  {
    id: 'rococo',
    nameJa: 'ロココ',
    nameEn: 'Rococo',
    aliases: ['ロココ様式', 'Rococo'],
    visibilityLevel: 'standard',
    groupId: 'baroque-and-rococo',
    displayOrder: 1000,
    classification: 'style',
    era: 'baroque-rococo',
    dates: { start: 1700, end: 1780, peak: [1720, 1760], circa: true, note: 'ルイ14世の死（1715）後に本格化' },
    regionIds: ['france', 'germany'],
    cities: ['パリ', 'ヴェネツィア', 'ミュンヘン'],
    summary:
      'ルイ14世の死後、宮廷から都市の貴族サロンへ舞台を移し、軽やか・官能的・装飾的な美を追求した様式。私的享楽と洗練された社交を映す。',
    coreIdea:
      '荘重さより、優美・機知・官能・親密さ。愛や遊戯といった私的な主題を軽やかに描く。',
    socialContext:
      'ヴェルサイユの重厚な儀礼から、パリの貴族の邸館（オテル）とサロン文化へ社交の中心が移った。',
    politicalContext: 'ルイ15世期の宮廷・貴族の私的享楽文化を背景とする。',
    reactionAgainst:
      'ルイ14世期のバロックの荘厳・威圧に対し、軽快で私的な装飾性で応じた。',
    inheritedFrom:
      'バロックの動勢と色彩を受け継ぎつつ、軽量化・私的化した。',
    visualTraits:
      '曲線的・非対称の装飾、淡いパステル、優美な人物、軽やかな筆致。',
    compositionSpace:
      '室内装飾と一体化した親密な空間、庭園や田園の遊戯的情景。',
    colorLight: '淡いピンク・水色・金の柔らかな色調、拡散した明るい光。',
    technique: '油彩、装飾芸術（家具・磁器・室内装飾）、フレスコ。',
    materials: 'カンヴァス・油彩、漆喰・金・磁器。',
    subjects: '雅宴（フェット・ギャラント）、愛、神話の官能的場面、肖像。',
    artistStatus: 'アカデミー会員・宮廷画家として活動する一方、女性のパトロン（ポンパドゥール夫人）も重要だった。',
    productionSystem: 'アカデミー、宮廷・貴族の注文、装飾工房。',
    patronage: '貴族、宮廷、富裕な収集家、女性のパトロン。',
    marketExhibition: '邸館の室内装飾やサロンでの展示、アカデミーのサロン展。',
    audience: '貴族・上流市民の私的な社交空間。',
    legacy:
      '新古典主義から「軽薄」と批判されたが、後に色彩と親密さの価値が再評価された。装飾と美術の境界を問う視点を残した。',
    contemporaryConnection:
      '装飾性・官能性・私的享楽をめぐる価値づけの問題は、後の「高尚/通俗」の境界をめぐる議論（ポップ以降）に接続する。',
    viewingPoints: [
      'バロックの荘重さとの差（軽さ・私性）を対比する',
      '装飾と絵画が一体化した空間を意識する',
      '次の新古典主義がこれを何として否定したかを考える',
    ],
    keywords: ['ロココ', '雅宴', 'サロン', '装飾', 'パステル', 'ポンパドゥール'],
    artistIds: ['artist-watteau', 'artist-fragonard'],
    workIds: [],
    sourceIds: ['tate-rococo'],
    verification: 'verified',
  },

  /* 11 ─────────────────────────────────────────────── */
  {
    id: 'neoclassicism',
    nameJa: '新古典主義',
    nameEn: 'Neoclassicism',
    aliases: ['ネオクラシシズム', 'Neoclassicism'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 1100,
    classification: 'movement',
    era: 'baroque-rococo',
    dates: { start: 1750, end: 1830, peak: [1780, 1810], circa: true },
    regionIds: ['france', 'britain', 'italy'],
    cities: ['ローマ', 'パリ', 'ロンドン'],
    summary:
      '古代（特に発掘が進んだポンペイ・ヘルクラネウム）への回帰と啓蒙思想を背景に、明晰・厳格・道徳的な古典美を掲げた運動。革命期の市民的徳と結びついた。',
    coreIdea:
      '理性・秩序・市民的徳を、古代の主題と明晰な形式によって表現する。感覚的享楽より道徳的模範を重んじる。',
    socialContext:
      '啓蒙思想の広がり、古代遺跡の発掘、フランス革命という政治的激動が背景にある。',
    politicalContext:
      'フランス革命・ナポレオン期に、共和国的・帝政的理想の視覚言語として動員された。',
    philosophy:
      '啓蒙の理性主義と、ヴィンケルマンの古代美術論（「高貴なる単純と静かなる偉大」）が理論的支柱となった。',
    reactionAgainst:
      'ロココの装飾性・官能性・私性を「退廃」として退け、公共性と道徳性を対置した。',
    inheritedFrom:
      'ルネサンス以来の古典古代への参照を、より考古学的な厳密さで刷新した。',
    visualTraits:
      '明確な輪郭線、彫刻的な人体、抑制された色、水平・垂直の安定した構図。',
    compositionSpace:
      '舞台のように明快な浅い空間、レリーフ的な人物配置。',
    colorLight: '線描優位で色彩は従属的、均質で明晰な光。',
    technique: '油彩、素描の重視、彫刻。',
    materials: 'カンヴァス・油彩、大理石。',
    subjects: '古代史・神話の道徳的主題、英雄的行為、肖像。',
    artistStatus: 'アカデミーの権威と結びつき、ダヴィッドは革命・帝政の主導的画家となった。',
    productionSystem: 'アカデミー、国家・宮廷の注文、サロン。',
    patronage: '国家（革命政府・ナポレオン）、貴族、市民。',
    marketExhibition: '官展（サロン）が公的な評価と発表の場となった。',
    audience: '市民公衆。サロンは公開され、批評文化が育った。',
    legacy:
      'アカデミズムの規範として19世紀に持続し、ロマン主義・写実主義はこれへの反発として展開した。',
    contemporaryConnection:
      '美術を公共的・政治的言語として用いる姿勢は、後のプロパガンダ論・公共芸術論の参照点になる。',
    viewingPoints: [
      'ロココの否定として何を掲げたかを読む',
      '線描と道徳的主題の結びつきを見る',
      '革命・国家がこの様式をどう利用したかを意識する',
    ],
    keywords: ['新古典主義', '啓蒙', '古代回帰', 'ダヴィッド', 'ヴィンケルマン', 'アカデミー', 'サロン'],
    artistIds: ['artist-david', 'artist-ingres'],
    workIds: ['work-oath-of-horatii'],
    sourceIds: ['tate-neoclassicism'],
    verification: 'verified',
  },

  /* 12 ─────────────────────────────────────────────── */
  {
    id: 'romanticism',
    nameJa: 'ロマン主義',
    nameEn: 'Romanticism',
    aliases: ['ロマンティシズム', 'Romanticism'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 1200,
    classification: 'movement',
    era: 'nineteenth',
    dates: { start: 1800, end: 1850, peak: [1810, 1840], circa: true, note: '国・分野で時期に幅がある' },
    regionIds: ['germany', 'france', 'britain', 'spain'],
    cities: ['パリ', 'ドレスデン', 'ロンドン'],
    summary:
      '理性・規範に対し、主観・感情・想像力・崇高を重んじた運動。自然の脅威や個人の内面、歴史・異国への憧憬を表現した。',
    coreIdea:
      '普遍的理性ではなく、個の感情と想像力を真実の源泉とする。崇高（sublime）＝畏怖を伴う圧倒的経験を重視する。',
    socialContext:
      'フランス革命後の幻滅、産業化、ナショナリズムの高まりが、個人と自然・歴史への感情的関心を促した。',
    politicalContext: '自由・民族といった理念と結びつき、政治的主題（民衆の蜂起等）も扱った。',
    philosophy:
      'カント以後の崇高論やドイツ観念論・自然哲学が、自然と主観の関係の思索を後押しした。',
    reactionAgainst:
      '新古典主義の理性・規範・明晰な線描に対し、感情・色彩・動勢・不定形を対置した。',
    inheritedFrom:
      'バロックの劇性・色彩を再評価し、崇高の風景観を発展させた。',
    visualTraits:
      '劇的な光と色、動的な筆致、圧倒的な自然、孤独な人物。',
    compositionSpace:
      '広大で不定形な空間、人物を小さく配して自然の巨大さを示す（フリードリヒ）。',
    colorLight: '強い明暗と鮮烈な色彩、嵐や霧など不安定な光。',
    technique: '油彩、水彩、版画。',
    materials: 'カンヴァス・油彩、紙・水彩。',
    subjects: '自然（崇高な風景）、歴史・時事、異国、夢・幻想、個人の情念。',
    artistStatus:
      '「天才」「孤独な創造者」という近代的芸術家像が強まった。',
    productionSystem: 'アカデミー・サロンと、独立した個人的制作の併存。',
    patronage: '市民、国家、収集家、画商。',
    marketExhibition: 'サロン展と批評、画商の役割が増した。',
    audience: '市民公衆と批評家。',
    legacy:
      '「孤独な天才」「内面の表現」という芸術家像は近代芸術観の基盤となり、象徴主義・表現主義・抽象表現主義へ流れ込む。',
    contemporaryConnection:
      '崇高＝畏怖を誘う圧倒的経験の追求は、抽象表現主義やライト・アンド・スペース、没入型作品の体験設計に通じる。',
    viewingPoints: [
      '崇高（畏怖を伴う経験）がどう演出されるか見る',
      '新古典主義の理性への反発として読む',
      '人物と自然の大きさの対比に注目',
    ],
    keywords: ['ロマン主義', '崇高', '主観', '自然', 'フリードリヒ', 'ドラクロワ', 'ターナー'],
    artistIds: ['artist-friedrich', 'artist-delacroix', 'artist-turner'],
    workIds: ['work-wanderer-sea-of-fog'],
    sourceIds: ['smarthistory-romanticism', 'tate-romanticism'],
    verification: 'verified',
  },

  /* 13 ─────────────────────────────────────────────── */
  {
    id: 'realism',
    nameJa: '写実主義（レアリスム）',
    nameEn: 'Realism',
    aliases: ['レアリスム', 'Realism'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 1300,
    shortLabel: '写実主義',
    classification: 'movement',
    era: 'nineteenth',
    dates: { start: 1840, end: 1880, peak: [1848, 1870], circa: true },
    regionIds: ['france'],
    cities: ['パリ', 'オルナン'],
    summary:
      '理想化された歴史・神話ではなく、同時代の現実（農民・労働者・都市生活）を大画面で真剣に描いた運動。1848年革命後の社会意識と結びつく。',
    coreIdea:
      '目に見える同時代の生活と労働を、装飾も理想化もせずに、歴史画に匹敵する重みで描く。',
    socialContext:
      '1848年の革命、産業化、都市労働者・農民の存在が社会的関心を高めた。',
    politicalContext: '社会主義・共和主義の思想と共鳴し、下層の人々の可視化を政治的行為とした。',
    reactionAgainst:
      'アカデミーが重んじた歴史・神話の理想化と、ロマン主義の異国・幻想への逃避の双方に対し、平凡な現実の直視を対置した。',
    inheritedFrom:
      'オランダ黄金時代の風俗画・日常描写の伝統を、大画面・社会主題へ拡張した。',
    visualTraits:
      '飾らない人物、土性の色調、大画面での日常主題、labor（労働）の直視。',
    compositionSpace: '演劇的演出を避けた即物的な空間、大画面に等身大の庶民を配する。',
    colorLight: '抑えた土色、自然な戸外光の観察。',
    technique: '油彩、厚塗り（クールベのパレットナイフ）。',
    materials: 'カンヴァス・油彩。',
    subjects: '農民、労働者、葬列、日常、身近な風景。',
    artistStatus:
      'クールベはアカデミーやサロンの権威に挑戦し、1855年に個展「レアリスム館」を開いた。',
    productionSystem: 'サロンへの挑戦と、独立した発表の試み。',
    patronage: '市民、収集家、画商。',
    marketExhibition:
      'サロンでの物議と、独立展という新しい発表形式が現れた。',
    audience: '市民公衆・批評家。主題の「卑俗さ」が論争を呼んだ。',
    legacy:
      '同時代を主題とする姿勢と独立展の発想は、印象派を直接準備した。以後の近代美術の自律の起点の一つとなる。',
    contemporaryConnection:
      '「何を美術の主題とみなすか」を問い直す態度は、日常や大衆文化を扱う後の運動（ポップ以降）に連続する。',
    viewingPoints: [
      '同時代の現実を歴史画の重みで扱う点に注目',
      'アカデミーとロマン主義の両方への反発として読む',
      '独立展という発表形式の新しさを意識する',
    ],
    keywords: ['写実主義', 'クールベ', '労働', '同時代性', '独立展', 'ミレー'],
    artistIds: ['artist-courbet', 'artist-millet'],
    workIds: [],
    sourceIds: ['smarthistory-realism', 'tate-realism'],
    verification: 'verified',
  },

  /* 14 ─────────────────────────────────────────────── */
  {
    id: 'impressionism',
    nameJa: '印象派',
    nameEn: 'Impressionism',
    aliases: ['印象主義', 'Impressionism'],
    visibilityLevel: 'core',
    groupId: 'impressionism-circle',
    isRepresentative: true,
    displayOrder: 1400,
    classification: 'movement',
    era: 'nineteenth',
    dates: { start: 1860, end: 1890, peak: [1874, 1886], circa: true, note: '第1回展1874年〜第8回展1886年' },
    regionIds: ['france'],
    cities: ['パリ', 'アルジャントゥイユ'],
    summary:
      '戸外で素早く描き、移ろう光と大気・都市の余暇生活を捉えた運動。独立した展覧会と画商による市場を通じ、アカデミー体制の外で自立した。',
    coreIdea:
      '対象そのものより、対象に当たる光と色の瞬間的な「印象」を捉える。完成した仕上げより知覚の記録を重んじる。',
    socialContext:
      'オスマンによるパリ改造、鉄道による郊外行楽、近代的余暇（カフェ・劇場・ボート遊び）が主題を提供した。',
    technologyContext:
      'チューブ入り絵具の普及が戸外制作を容易にし、光学・色彩理論への関心も背景にあった。写真の普及も知覚と再現への意識を刺激した。',
    reactionAgainst:
      'アカデミーの磨き上げた仕上げと歴史主題に対し、素早い筆致と同時代の日常・光を対置した。',
    inheritedFrom:
      '写実主義の同時代性と戸外制作（バルビゾン派）、ターナーらの光の探究を継承した。',
    visualTraits:
      '分割された短い筆触、明るい色、輪郭の溶解、光と大気の効果。',
    compositionSpace:
      '写真や日本の浮世絵に触発された大胆な切り取り・俯瞰・非中心的構図。',
    colorLight:
      '影にも色を見出し、白を避けて明るい補色を並置する。時刻・季節による光の変化を主題化（連作）。',
    technique: '戸外制作（アン・プレネール）、素早い分割筆触。',
    materials: 'カンヴァス・油彩、チューブ絵具。',
    subjects: '風景、都市生活、余暇、肖像、水面と光。',
    artistStatus:
      'アカデミーの外で、独立した芸術家グループとして自ら展覧会を組織した。',
    productionSystem: '独立展の自主開催と、画商（デュラン＝リュエル）による市場開拓。',
    patronage: '新興市民・収集家、画商を介した購買者（後に米国市場も）。',
    marketExhibition:
      'アカデミーのサロンではなく、自主開催の「印象派展」（1874–1886）と画商のネットワークが基盤。市場と美術の近代的関係を確立した。',
    audience: '都市の市民・収集家・批評家。当初は嘲笑も受けた。',
    legacy:
      '光と知覚への関心はポスト印象派・点描へ展開し、独立展・画商モデルは近代美術市場の標準となった。',
    contemporaryConnection:
      '知覚の主観性と光の効果への注目は、後の光の芸術（ライト・アンド・スペース）や、市場と美術の関係をめぐる現代の議論に連続する。',
    viewingPoints: [
      '分割筆触と補色の並置による光の表現を見る',
      '浮世絵・写真に由来する大胆な構図に注目',
      'アカデミーの外で市場を築いた点を意識する',
    ],
    keywords: ['印象派', '光', '戸外制作', '独立展', 'モネ', 'ドガ', '画商', '浮世絵'],
    artistIds: ['artist-monet', 'artist-degas'],
    workIds: ['work-impression-sunrise'],
    sourceIds: ['tate-impressionism', 'smarthistory-japonisme'],
    verification: 'verified',
  },

  /* 15 ─────────────────────────────────────────────── */
  {
    id: 'post-impressionism',
    nameJa: 'ポスト印象派',
    nameEn: 'Post-Impressionism',
    aliases: ['後期印象派', 'Post-Impressionism'],
    visibilityLevel: 'core',
    groupId: 'impressionism-circle',
    displayOrder: 1500,
    classification: 'tendency',
    era: 'nineteenth',
    dates: { start: 1885, end: 1905, peak: [1888, 1905], circa: true, note: '共通綱領を持つ運動ではなく、事後的なくくり' },
    regionIds: ['france'],
    cities: ['パリ', 'アルル', 'プロヴァンス'],
    summary:
      '印象派の光の探究を受けつつ、それを超えて構造・象徴・主観的表現へ向かった諸傾向の総称。形式の自律という近代絵画の核心を準備した。',
    coreIdea:
      '瞬間的な印象の記録に留まらず、堅固な構造（セザンヌ）、色と線の象徴的力（ゴッホ・ゴーギャン）を追求する。',
    socialContext:
      '近代都市文明への違和や、非西洋・原始への憧れ（ゴーギャンのタヒチ）も背景にある。',
    reactionAgainst:
      '印象派の「移ろい」と没構造性に対し、永続的な形や内的表現を求めた。',
    inheritedFrom:
      '印象派の明るい色彩と独立した発表形式を継承しつつ、目的を転換した。',
    visualTraits:
      'セザンヌの幾何学的把握、ゴッホの渦巻く筆致、ゴーギャンの平面的な色面と輪郭。',
    compositionSpace:
      '遠近法的空間の解体が進み、画面の平面性と構造が前景化する。',
    colorLight:
      '色を対象の再現から解放し、構造や感情・象徴の担い手として用いる。',
    technique: '油彩、点描（スーラ）、太い輪郭と平塗り（クロワゾニスム）。',
    materials: 'カンヴァス・油彩。',
    subjects: '風景、静物、肖像、象徴的・原始的主題。',
    artistStatus: '多くは生前不遇で、死後に大きな影響力を持った（ゴッホ・セザンヌ）。',
    productionSystem: '画商・独立展・個人的制作。',
    patronage: '少数の収集家・画商・支援者。',
    marketExhibition: 'アンデパンダン展など無審査の発表形式が広がった。',
    audience: '前衛的な批評家・芸術家・少数の収集家。',
    legacy:
      'セザンヌはキュビスムへ、ゴッホ・ゴーギャンは表現主義・野獣派へ直結した。「形式の自律」という20世紀美術の前提を築いた。',
    contemporaryConnection:
      '再現から自律した色・形という発想は、抽象へ向かうモダニズム全体の出発点として現代美術に連続する。',
    viewingPoints: [
      '印象派を「何が不満で」超えようとしたかを読む',
      'セザンヌの構造とゴッホ/ゴーギャンの表現の違いを対比',
      '平面性・構造という次の世代への布石を見る',
    ],
    keywords: ['ポスト印象派', 'セザンヌ', 'ゴッホ', 'ゴーギャン', '構造', '形式の自律', '点描'],
    artistIds: ['artist-cezanne', 'artist-van-gogh', 'artist-gauguin'],
    workIds: ['work-starry-night'],
    sourceIds: ['tate-post-impressionism', 'met-post-impressionism'],
    verification: 'verified',
  },

  /* 16 ─────────────────────────────────────────────── */
  {
    id: 'symbolism',
    nameJa: '象徴主義',
    nameEn: 'Symbolism',
    aliases: ['サンボリスム', 'Symbolism'],
    visibilityLevel: 'standard',
    displayOrder: 1600,
    classification: 'movement',
    era: 'nineteenth',
    dates: { start: 1880, end: 1910, peak: [1886, 1900], circa: true },
    regionIds: ['france', 'pan-european'],
    cities: ['パリ', 'ブリュッセル'],
    summary:
      '外界の写実的記述を退け、観念・夢・内面・神秘を暗示によって表現した運動。文学（マラルメら）と密接に結びつく。',
    coreIdea:
      '自然の忠実な描写ではなく、目に見えない観念や感情を、暗示的なイメージ・象徴によって喚起する。',
    socialContext:
      '実証主義・産業社会への反動として、精神性・内面・神秘への関心が高まった（世紀末＝fin de siècle）。',
    philosophy:
      '観念論的・神秘主義的思潮や象徴主義文学の詩学が理論的背景となった。',
    reactionAgainst:
      '写実主義・自然主義の外面的記述と、印象派の視覚的即物性に対し、内面と観念を対置した。',
    inheritedFrom:
      'ロマン主義の主観・幻想を継承し、より観念的・暗示的に深化させた。',
    visualTraits:
      '夢幻的・神話的な図像、装飾的で平面的な画面、曖昧で暗示的な雰囲気。',
    compositionSpace: '現実の空間から遊離した、心的・象徴的空間。',
    colorLight: '非自然的で象徴的な色、朦朧とした光。',
    technique: '油彩、パステル、版画、装飾。',
    materials: 'カンヴァス・油彩、紙・パステル。',
    subjects: '神話、夢、死、エロスと神秘、内面の心象。',
    artistStatus: '文学者・批評家と交流する知的な前衛としての地位。',
    productionSystem: '画商・独立展・文学サークルとの連携。',
    patronage: '前衛的な収集家・愛好家。',
    marketExhibition: 'サロン・ド・ラ・ローズ＋クロワなど象徴主義的な展覧会も生まれた。',
    audience: '文学・芸術に通じた知識人層。',
    legacy:
      '内面・無意識への関心はシュルレアリスムへ、装飾的平面性はアール・ヌーヴォーや抽象へ流れ込んだ。',
    contemporaryConnection:
      '不可視の観念や心的世界を可視化する試みは、後の無意識の芸術（シュルレアリスム）や観念中心の制作へ連続する。',
    viewingPoints: [
      '「描かれたもの」より「暗示されるもの」を読む',
      '印象派の視覚性への反発として見る',
      '文学との結びつきを意識する',
    ],
    keywords: ['象徴主義', '内面', '夢', '世紀末', 'モロー', 'ルドン', '暗示'],
    artistIds: ['artist-moreau', 'artist-redon'],
    workIds: [],
    sourceIds: ['tate-symbolism', 'met-symbolism'],
    verification: 'verified',
  },

  /* 17 ─────────────────────────────────────────────── */
  {
    id: 'cubism',
    nameJa: 'キュビスム',
    nameEn: 'Cubism',
    aliases: ['立体派', 'Cubism'],
    visibilityLevel: 'core',
    groupId: 'early-avant-garde',
    isRepresentative: true,
    displayOrder: 1700,
    classification: 'movement',
    era: 'modern',
    dates: { start: 1907, end: 1922, peak: [1909, 1914], circa: true, note: '分析的キュビスム(1909–12)と総合的キュビスム(1912–)' },
    regionIds: ['france'],
    cities: ['パリ'],
    summary:
      'ピカソとブラックが創始した、対象を複数の視点から同時に捉えて平面上に再構成する革命的手法。単一視点遠近法という500年の前提を解体した。',
    coreIdea:
      '固定した一視点からの再現を捨て、複数の視点・時間を一つの画面に統合する。絵画を「見えたまま」から「知っている構造」の再構成へ転換する。',
    socialContext:
      '相対性・同時性への関心、非西洋（アフリカ）美術との出会い、近代都市の複数的経験が背景にある。',
    philosophy:
      '同時性・相対性への時代的関心（ベルクソンの持続論なども文脈として言及される）と共鳴する。',
    reactionAgainst:
      'ルネサンス以来の単一視点遠近法と、対象の一貫した外観の再現に対する根本的な反発。',
    inheritedFrom:
      'セザンヌの幾何学的な対象把握と、アフリカ彫刻・イベリア彫刻の造形を継承・転用した。',
    visualTraits:
      '対象を面（プレーン）に分解し多視点を統合、抑えた色（分析期）、コラージュの導入（総合期）。',
    compositionSpace:
      '奥行きのある遠近法的空間を否定し、浅く連続する平面的空間を構築する。',
    colorLight:
      '分析的キュビスムでは色を抑え、形の分析を優先。総合的キュビスムで色と現実の断片（新聞・木目紙）が復活する。',
    technique: '油彩、パピエ・コレ／コラージュ（現実の素材の貼付）。',
    materials: 'カンヴァス・油彩、新聞・壁紙・楽譜などの貼付素材。',
    subjects: '静物、肖像、楽器、カフェ。日常的で中立的な主題を選んだ。',
    artistStatus: '前衛の中心的存在。画商（カーンワイラー）が理論と市場を支えた。',
    productionSystem: '画商・前衛サークルによる支持。',
    patronage: '前衛的画商・収集家。',
    marketExhibition: 'アンデパンダン展、画廊、前衛の批評ネットワーク。',
    audience: '前衛芸術家・批評家・収集家。',
    legacy:
      '未来派・構成主義・抽象など20世紀前衛のほぼ全てに波及した。コラージュは現代美術の基本的手法となった。',
    contemporaryConnection:
      '視点の複数化・画面の平面化・現実素材の導入は、後の平面性の探究（スーパーフラット等）やミクストメディアに連続する。',
    viewingPoints: [
      '複数の視点が一画面にどう統合されているか探す',
      '単一視点遠近法の解体という意義を意識する',
      'コラージュによる「現実の断片」の導入に注目',
    ],
    keywords: ['キュビスム', 'ピカソ', 'ブラック', '複数視点', '平面性', 'コラージュ', 'セザンヌ'],
    artistIds: ['artist-picasso', 'artist-braque'],
    workIds: ['work-demoiselles-avignon'],
    sourceIds: ['tate-cubism', 'moma-cubism'],
    verification: 'verified',
  },

  /* 18 ─────────────────────────────────────────────── */
  {
    id: 'futurism',
    nameJa: '未来派',
    nameEn: 'Futurism',
    aliases: ['フトゥリズモ', 'Futurism'],
    visibilityLevel: 'standard',
    groupId: 'early-avant-garde',
    displayOrder: 1800,
    classification: 'movement',
    era: 'modern',
    dates: { start: 1909, end: 1918, peak: [1910, 1915], circa: true, note: 'マリネッティの未来派宣言(1909)を起点' },
    regionIds: ['italy'],
    cities: ['ミラノ', 'ローマ'],
    summary:
      '詩人マリネッティの宣言(1909)から始まったイタリアの運動。速度・機械・都市・戦争を賛美し、過去の文化遺産の破壊を唱えた。',
    coreIdea:
      '静止した過去の美を否定し、近代の運動・速度・力（自動車・機械・群衆）のダイナミズムを表現する。',
    socialContext:
      '後発の工業国イタリアで、遅れた文化遺産主義への苛立ちと近代化への熱狂が交錯した。',
    politicalContext:
      '好戦的・国家主義的な言説を含み、一部はのちのファシズムと接近した（批判的に扱うべき点）。',
    technologyContext: '自動車・電気・機械・都市という新しい技術環境を主題の核にした。',
    reactionAgainst:
      'イタリアの重い古典的遺産と、静的な美の理想に対する攻撃的な反発。',
    inheritedFrom:
      '分割主義（ディヴィジオニズム）の色彩と、キュビスムの形態分解を運動表現へ転用した。',
    visualTraits:
      '運動の連続的な軌跡（力線）、反復するフォルム、機械的・力動的な構図。',
    compositionSpace: '運動と速度を示す放射・反復の線、空間を貫く動勢。',
    colorLight: '分割された鮮烈な色、光と運動の交錯。',
    technique: '油彩、彫刻、写真（フォトダイナミズモ）。',
    materials: 'カンヴァス・油彩、ブロンズ・混合素材。',
    subjects: '都市、機械、自動車、群衆、戦争、運動そのもの。',
    artistStatus: '宣言と挑発（セラータ＝夜会）を通じて自己を前衛として演出した。',
    productionSystem: '宣言・パフォーマンス・展覧会を組み合わせた運動的展開。',
    patronage: '前衛的支持者、国際的な巡回展。',
    marketExhibition: '宣言文の配布と国際巡回展という新しい前衛の戦略。',
    audience: '都市の前衛的公衆、国際的な芸術界。',
    legacy:
      '宣言とパフォーマンスによる運動の展開は、ダダや後の前衛の方法論となった。運動表現は動的抽象・キネティックアートへ流れた。',
    contemporaryConnection:
      '技術と速度への態度、宣言・パフォーマンスによる自己組織化は、後のメディアアートや集団的実践の参照点になる。',
    viewingPoints: [
      '運動・速度をどう視覚化しているか見る',
      '過去の否定という綱領を読む',
      'ファシズムとの近さという批判的論点を意識する',
    ],
    keywords: ['未来派', 'マリネッティ', '速度', '機械', '力線', 'ボッチョーニ', '宣言'],
    artistIds: ['artist-boccioni', 'artist-balla'],
    workIds: ['work-unique-forms'],
    sourceIds: ['tate-futurism', 'moma-futurism'],
    verification: 'verified',
  },

  /* 19 ─────────────────────────────────────────────── */
  {
    id: 'dada',
    nameJa: 'ダダ',
    nameEn: 'Dada',
    aliases: ['ダダイスム', 'Dada'],
    visibilityLevel: 'core',
    groupId: 'early-avant-garde',
    displayOrder: 1900,
    classification: 'movement',
    era: 'modern',
    dates: { start: 1916, end: 1924, peak: [1916, 1922], circa: true, note: 'チューリヒのキャバレー・ヴォルテール(1916)から' },
    regionIds: ['germany', 'france', 'america', 'pan-european'],
    cities: ['チューリヒ', 'ベルリン', 'パリ', 'ニューヨーク'],
    summary:
      '第一次世界大戦の惨禍への怒りから生まれた反芸術運動。理性・伝統・美術制度そのものを嘲笑・攻撃し、偶然・ナンセンス・レディメイドを用いた。',
    coreIdea:
      '戦争を生んだ理性・秩序・ブルジョワ文化を否定し、「芸術とは何か」「誰が芸術を決めるのか」を根底から問い直す。',
    socialContext:
      '第一次世界大戦の大量死と、それを許した近代文明への深い幻滅が動機となった。',
    politicalContext:
      'ベルリン・ダダは反戦・反体制の政治性を強く帯びた。',
    reactionAgainst:
      '近代の理性・進歩の信仰、美術の自律的価値、そして美術制度（美術館・展覧会・作者性）への全面的な反発。',
    inheritedFrom:
      '未来派の宣言・パフォーマンス戦略と、キュビスムのコラージュを批評的に転用した。',
    visualTraits:
      'フォトモンタージュ、レディメイド、偶然によるコラージュ、挑発的なタイポグラフィ。',
    compositionSpace: '意図的な無秩序・偶然性・断片の衝突。',
    colorLight: '既製イメージの流用が中心で、独自の色彩体系を持たない。',
    technique: 'レディメイド（既製品の提示）、フォトモンタージュ、偶然の操作。',
    materials: '既製品、印刷物、写真、廃品。',
    subjects: '反芸術そのもの、戦争・制度への批判、ナンセンス。',
    artistStatus:
      'デュシャンは「作者が選ぶ」という行為に芸術を還元し、作者性・独創性の概念を揺さぶった。',
    productionSystem: 'パフォーマンス、雑誌、挑発的イベント。',
    patronage: '前衛サークル、少数の支持者。',
    marketExhibition:
      '既存の展覧会制度を挑発・攪乱する形式（アンデパンダン展への便器の出品など）をとった。',
    audience: '前衛的公衆と、挑発の対象たる市民社会。',
    legacy:
      'レディメイドと制度批判はコンセプチュアル・アートやポップ、あらゆる制度批判的実践の源流となった。20世紀後半美術の基盤概念を用意した。',
    contemporaryConnection:
      '「観念が作品を成立させる」「作者とは選ぶ者である」という発想は、コンセプチュアル・アート以降の現代美術の前提そのものである。',
    viewingPoints: [
      '「反芸術」が何を否定しようとしたかを読む',
      'レディメイドが問う作者性・独創性を考える',
      '戦争という文脈を忘れない',
    ],
    keywords: ['ダダ', 'デュシャン', 'レディメイド', '反芸術', '制度批判', 'フォトモンタージュ', '第一次世界大戦'],
    artistIds: ['artist-duchamp'],
    workIds: ['work-fountain'],
    sourceIds: ['smarthistory-dada', 'moma-dada'],
    verification: 'verified',
  },

  /* 20 ─────────────────────────────────────────────── */
  {
    id: 'surrealism',
    nameJa: 'シュルレアリスム',
    nameEn: 'Surrealism',
    aliases: ['超現実主義', 'Surrealism'],
    visibilityLevel: 'core',
    groupId: 'early-avant-garde',
    displayOrder: 2000,
    classification: 'movement',
    era: 'modern',
    dates: { start: 1924, end: 1950, peak: [1924, 1940], circa: true, note: 'ブルトンの第一宣言(1924)から' },
    regionIds: ['france', 'pan-european'],
    cities: ['パリ'],
    summary:
      '詩人ブルトンが主導した、無意識・夢・偶然を解き放って現実を超えた真実に迫る運動。フロイトの精神分析を理論的支柱とした。',
    coreIdea:
      '理性の統制を外し、無意識・夢・欲望を解放することで、日常を超えた「超現実（シュルレアリテ）」に到達する。',
    socialContext:
      '第一次大戦後の理性への不信を継ぎ、ダダの破壊から創造的な方法論の構築へ向かった。',
    philosophy:
      'フロイトの無意識・夢分析、そしてブルトンのマルクス主義的関心が理論的枠組みを与えた。',
    reactionAgainst:
      'ダダの純粋な否定に対し、無意識の探究という積極的方法を対置した。また合理主義的現実観を否定した。',
    inheritedFrom:
      'ダダの偶然・自動性・コラージュを継承し、象徴主義の内面・夢の主題を再導入した。',
    visualTraits:
      '二系統：緻密な写実で不合理な情景を描く（ダリ）系と、自動記述的な抽象（ミロ）系。',
    compositionSpace:
      '夢の論理に従う非合理な空間、異質な事物の予期せぬ出会い（デペイズマン）。',
    colorLight: '系統により多様。ダリらは古典的な明暗、ミロらは自由な色面。',
    technique: '自動記述（オートマティスム）、フロッタージュ、デカルコマニー、コラージュ。',
    materials: 'カンヴァス・油彩、紙、オブジェ、写真。',
    subjects: '夢、欲望、無意識、変身、偶然の出会い。',
    artistStatus: '文学運動と一体で、ブルトンが理論的指導者として集団を統率した。',
    productionSystem: '宣言・機関誌・国際展を軸とする集団運動。',
    patronage: '前衛的収集家・画商、国際展。',
    marketExhibition: '国際シュルレアリスム展など、演出的な展示形式を発展させた。',
    audience: '前衛的公衆・知識人、後に国際的に拡大。',
    legacy:
      '無意識・自動性の探究は抽象表現主義（特にオートマティスム）へ直接流れ込んだ。広告・映画・大衆文化にも浸透した。',
    contemporaryConnection:
      '無意識・偶然・身体を制作原理とする発想は、戦後の行為・物質の芸術（具体・抽象表現主義）に連続する。',
    viewingPoints: [
      '夢の論理（非合理な組み合わせ）を読む',
      'ダリ系とミロ系の二つの方向を区別する',
      'フロイト＝無意識という理論的背景を意識する',
    ],
    keywords: ['シュルレアリスム', 'ブルトン', '無意識', '夢', 'オートマティスム', 'ダリ', 'ミロ', 'フロイト'],
    artistIds: ['artist-dali', 'artist-miro'],
    workIds: ['work-persistence-memory'],
    sourceIds: ['tate-surrealism', 'moma-surrealism'],
    verification: 'verified',
  },

  /* 21 ─────────────────────────────────────────────── */
  {
    id: 'abstract-expressionism',
    nameJa: '抽象表現主義',
    nameEn: 'Abstract Expressionism',
    aliases: ['ニューヨーク・スクール', 'Abstract Expressionism'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 2100,
    shortLabel: '抽象表現主義',
    classification: 'movement',
    era: 'postwar',
    dates: { start: 1943, end: 1965, peak: [1947, 1960], circa: true },
    regionIds: ['america'],
    cities: ['ニューヨーク'],
    summary:
      '第二次大戦後のニューヨークで展開した大規模な抽象絵画。身体的な行為（アクション）や広大な色面によって、崇高・実存・普遍を追求した。',
    coreIdea:
      '再現的主題を排し、制作の行為そのもの（ジェスチャー）や色の広がりによって、内面・実存・崇高を直接的に表す。',
    socialContext:
      '戦争と亡命知識人の流入によりニューヨークが芸術の中心へ移動し、実存主義的な精神状況が共有された。',
    politicalContext:
      '冷戦期に「自由なアメリカ」の象徴として国家的に喧伝された側面もある（後年に指摘された論点）。',
    philosophy: '実存主義や、ユング的な普遍的神話・無意識への関心が背景にある。',
    reactionAgainst:
      'ヨーロッパの幾何学的抽象や社会主義リアリズム、そして再現の伝統に対する反発。',
    inheritedFrom:
      'シュルレアリスムのオートマティスム（自動性）と、キュビスム以後の平面性を継承・拡張した。',
    visualTraits:
      '巨大な画面、全面的構成（オールオーバー）、ジェスチャーの筆致（アクション・ペインティング）または広大な色面（カラーフィールド）。',
    compositionSpace:
      '中心や枠組みを持たないオールオーバーな場、鑑賞者を包み込む大きさ。',
    colorLight: 'ポロックの錯綜する線、ロスコの発光するような色面。',
    technique: '床置きのドリッピング（ポロック）、薄い色層の重ね（ロスコ）。',
    materials: '大型カンヴァス、エナメル塗料・油彩・アクリル。',
    subjects: '主題は非再現的で、行為・色・スケールそのものが内容となる。',
    artistStatus:
      '「孤独な創造者」像を体現し、批評家（グリーンバーグ）が理論的権威を与えた。',
    productionSystem: '画廊・美術館・批評のニューヨーク的ネットワーク。',
    patronage: '近代美術館（MoMA）、画廊、収集家。',
    marketExhibition: '画廊個展と美術館、批評誌が評価を形成した。',
    audience: '国際的な美術界、冷戦下の広い公衆。',
    legacy:
      '巨大な画面と鑑賞者の身体的経験はミニマリズム・カラーフィールド・環境的作品へ展開した。一方でその主観性・英雄性への反発がミニマル/コンセプチュアルを生んだ。',
    contemporaryConnection:
      '大きさ・崇高・身体的経験の追求は、ライト・アンド・スペースや没入型作品の体験設計に、行為と物質の重視は具体・もの派に接続する。',
    viewingPoints: [
      'アクション系（ポロック）とカラーフィールド系（ロスコ）を区別する',
      '巨大さが鑑賞者の身体をどう包むか意識する',
      '冷戦下の政治的利用という論点も知る',
    ],
    keywords: ['抽象表現主義', 'ポロック', 'ロスコ', 'アクション・ペインティング', 'カラーフィールド', '崇高', 'ニューヨーク'],
    artistIds: ['artist-pollock', 'artist-rothko'],
    workIds: ['work-autumn-rhythm'],
    sourceIds: ['tate-abstract-expressionism', 'moma-abstract-expressionism'],
    verification: 'verified',
  },

  /* 22 ─────────────────────────────────────────────── */
  {
    id: 'gutai',
    nameJa: '具体美術協会',
    nameEn: 'Gutai Art Association',
    aliases: ['具体', 'グタイ', 'Gutai'],
    visibilityLevel: 'core',
    groupId: 'postwar-japan',
    isRepresentative: true,
    displayOrder: 2200,
    shortLabel: '具体',
    classification: 'collective',
    era: 'postwar',
    dates: { start: 1954, end: 1972, peak: [1955, 1965], circa: false, note: '兵庫県芦屋で結成、1972年の吉原治良の死により解散' },
    regionIds: ['japan'],
    cities: ['芦屋', '大阪'],
    summary:
      '吉原治良を中心に1954年に関西で結成された戦後日本の前衛集団。「具体美術宣言」を掲げ、身体と物質の直接的な出会いから、絵画・行為・環境を横断する実験を行った。',
    coreIdea:
      '「精神が物質を生かし、物質が精神を生かす」——既存の様式や自己表現の枠を破り、素材そのものと身体の直接的な行為から独創を生む。',
    socialContext:
      '敗戦後の解放感と再建の中で、戦前的な権威や様式を否定し、新しさ・自由を求める空気があった。',
    politicalContext: '軍国主義的過去への反省と、戦後の民主化・自由の気運が背景にある。',
    reactionAgainst:
      '既成の様式・アカデミズム・「絵画とはこう描くもの」という約束事、そして単なる自己表現への反発。',
    inheritedFrom:
      '戦前日本の前衛や、抽象表現主義・アンフォルメルの物質・行為への関心と国際的に共鳴した。',
    visualTraits:
      '身体で描く・破る・投げる行為の痕跡、泥・水・光・電球など多様な素材、屋外・舞台での展開。',
    compositionSpace:
      '額縁や壁を超え、屋外・舞台・空間全体を作品化する（環境的・パフォーマンス的展開）。',
    colorLight: '素材そのものの色と物性、電球や水など非絵画的媒体も用いる。',
    technique: '身体行為（紙を破って走り抜ける、足で描く）、屋外展、機関誌『具体』の国際発信。',
    materials: '絵具、泥、水、紙、電球、ビニールなど多様。',
    subjects: '素材と行為・身体・時間そのもの。',
    artistStatus:
      '在野の前衛集団として、機関誌と国際的なネットワーク（アンフォルメルのタピエ）を通じ世界と接続した。',
    productionSystem: '協会・機関誌・屋外展・舞台という自主的な発表形式。',
    patronage: '自主運営が基本。国際的な画商・批評家との接触もあった。',
    marketExhibition:
      '屋外展（真夏の太陽にいどむ野外モダンアート展）や舞台上の美術など、既存の展示制度を拡張した。',
    audience: '国内外の前衛美術界。近年に国際的再評価が進んだ。',
    legacy:
      'パフォーマンス・環境芸術の先駆として国際的に再評価され、もの派やその後の日本現代美術の重要な参照点となった。',
    contemporaryConnection:
      '身体と物質の出会い・行為・環境化という主題は、もの派、そして没入型・体験型の現代作品に連続する。',
    viewingPoints: [
      '「行為の痕跡」として作品を見る',
      '額縁・壁を超える環境的展開に注目',
      '抽象表現主義／アンフォルメルとの同時代的共鳴を意識する',
    ],
    keywords: ['具体', '吉原治良', '白髪一雄', '田中敦子', '物質', '行為', '戦後日本前衛', '宣言'],
    artistIds: ['artist-yoshihara', 'artist-shiraga', 'artist-tanaka-atsuko'],
    workIds: ['work-electric-dress'],
    sourceIds: ['gugg-gutai', 'gugg-gutai-concept', 'tate-gutai'],
    verification: 'verified',
  },

  /* 23 ─────────────────────────────────────────────── */
  {
    id: 'pop-art',
    nameJa: 'ポップアート',
    nameEn: 'Pop Art',
    aliases: ['ポップ・アート', 'Pop Art'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 2300,
    classification: 'movement',
    era: 'postwar',
    dates: { start: 1955, end: 1970, peak: [1960, 1968], circa: true },
    regionIds: ['america', 'britain'],
    cities: ['ニューヨーク', 'ロンドン'],
    summary:
      '大衆文化・広告・商品・マスメディアのイメージを美術に取り込んだ運動。「高尚な芸術」と大衆文化の境界を問い、消費社会を主題化した。',
    coreIdea:
      '広告・漫画・商品・スターといった大衆的イメージを堂々と美術の主題とし、複製・消費社会そのものを映す。',
    socialContext:
      '戦後の大量消費社会・テレビ・広告の飽和という新しい視覚環境が主題を提供した。',
    reactionAgainst:
      '抽象表現主義の英雄的・主観的・崇高な身振りに対し、匿名的・機械的・大衆的なイメージを対置した。',
    inheritedFrom:
      'ダダのレディメイド・既製イメージの流用を継承し、消費社会向けに展開した。',
    visualTraits:
      '既製イメージの引用、平坦な色面、シルクスクリーンによる反復、ベンデイ・ドット（リキテンスタイン）。',
    compositionSpace: '広告的な平面性、反復とグリッド。',
    colorLight: '鮮やかで人工的な色、印刷的な均質さ。',
    technique: 'シルクスクリーン、機械的複製、商業技法の流用。',
    materials: 'カンヴァス、シルクスクリーン、印刷。',
    subjects: '商品（キャンベル缶）、スター、漫画、広告、ドル記号。',
    artistStatus:
      'ウォーホルは「工場（ファクトリー）」で制作し、作者＝天才という近代的観念を挑発した。',
    productionSystem: '画廊・メディア・スタジオ的量産。',
    patronage: '画廊、収集家、メディア。',
    marketExhibition: '画廊と大衆メディアが一体となって評価と話題を形成した。',
    audience: '広い公衆とメディア。美術と大衆文化の境界が曖昧になった。',
    legacy:
      '「高尚/通俗」の境界の問い直しはポストモダンの中心的論点となり、スーパーフラット等の後続に直接影響した。',
    contemporaryConnection:
      '大衆文化・複製・平面性を肯定的に扱う態度は、村上隆のスーパーフラットに直接受け継がれている。',
    viewingPoints: [
      '抽象表現主義への反発（匿名性 vs 英雄性）として読む',
      '複製・反復が問う作者性を考える',
      '高尚/通俗の境界の攪乱に注目',
    ],
    keywords: ['ポップアート', 'ウォーホル', 'リキテンスタイン', '大衆文化', '消費社会', 'シルクスクリーン', '複製'],
    artistIds: ['artist-warhol', 'artist-lichtenstein'],
    workIds: ['work-campbells-soup'],
    sourceIds: ['tate-pop-art', 'moma-pop-art'],
    verification: 'verified',
  },

  /* 24 ─────────────────────────────────────────────── */
  {
    id: 'minimalism',
    nameJa: 'ミニマリズム',
    nameEn: 'Minimalism',
    aliases: ['ミニマル・アート', 'Minimalism'],
    visibilityLevel: 'core',
    groupId: 'postwar-reduction',
    isRepresentative: true,
    displayOrder: 2400,
    classification: 'movement',
    era: 'postwar',
    dates: { start: 1960, end: 1975, peak: [1963, 1970], circa: true },
    regionIds: ['america'],
    cities: ['ニューヨーク'],
    summary:
      '幻想・表現・作者の痕跡を排し、単純な幾何学的形態と工業素材による「もの」そのものを提示した運動。作品と鑑賞者の身体・空間の関係を前景化した。',
    coreIdea:
      '作品は何かを表す（re-present）のではなく、それ自体が具体的な「もの（object）」として空間に存在する。意味は作品・空間・鑑賞者の関係から立ち上がる。',
    socialContext:
      '大量生産・工業社会の中で、手仕事的独創性より産業的な即物性が選ばれた。',
    philosophy:
      '現象学的な知覚論（作品を身体で経験する）が理論的背景として参照される。',
    reactionAgainst:
      '抽象表現主義の内面・ジェスチャー・作者の英雄性、そして絵画的な幻影空間への反発。',
    inheritedFrom:
      'マレーヴィチ以来の幾何学的抽象や、デュシャンの既製性を即物的方向へ発展させた。',
    visualTraits:
      '立方体・格子などの単純形態の反復、工業素材、作者の手を消した均質な仕上げ。',
    compositionSpace:
      '作品が置かれた実空間・鑑賞者の移動・視点を作品経験の一部とする（リテラルな空間）。',
    colorLight: '素材本来の色・質感、蛍光灯そのものを用いる例（フレイヴィン）。',
    technique: '工業的製作（作者が指示し工場が製作）、モジュールの反復。',
    materials: '鉄・アルミ・合板・蛍光灯・煉瓦など工業素材。',
    subjects: '主題を持たない。もの・空間・知覚そのものが内容。',
    artistStatus:
      '作者は「製作者」ではなく「構想する者」となり、制作を外注する例が一般化した。',
    productionSystem: '工業的製作・画廊・美術館。',
    patronage: '画廊、美術館、収集家。',
    marketExhibition: 'ホワイトキューブの画廊空間が作品経験に不可欠となった。',
    audience: '美術館・画廊の来場者。作品の周囲を歩く経験が重視された。',
    legacy:
      'ポストミニマリズム・ランドアート・インスタレーション・ライト&スペースへ直接展開し、「もの」と「場」への注目はもの派とも共鳴した。',
    contemporaryConnection:
      '「もの」「場」「鑑賞者の身体」への注目は、もの派、ライト・アンド・スペース、没入型インスタレーションの共通の起点である。',
    viewingPoints: [
      '「表現」ではなく「もの」として見る',
      '作品の周囲を歩く身体的経験を意識する',
      '作者の手を消す＝反表現という態度を読む',
    ],
    keywords: ['ミニマリズム', 'ジャッド', 'フレイヴィン', '物体性', '工業素材', '展示空間', '反復'],
    artistIds: ['artist-judd', 'artist-flavin'],
    workIds: [],
    sourceIds: ['tate-minimalism', 'moma-minimalism'],
    verification: 'verified',
  },

  /* 25 ─────────────────────────────────────────────── */
  {
    id: 'conceptual-art',
    nameJa: 'コンセプチュアル・アート',
    nameEn: 'Conceptual Art',
    aliases: ['概念芸術', 'コンセプチュアリズム', 'Conceptual Art'],
    visibilityLevel: 'core',
    groupId: 'postwar-reduction',
    displayOrder: 2500,
    shortLabel: 'コンセプチュアル',
    classification: 'method-theory',
    era: 'postwar',
    dates: { start: 1965, end: 1975, peak: [1966, 1972], circa: true },
    regionIds: ['america', 'britain', 'global'],
    cities: ['ニューヨーク', 'ロンドン'],
    summary:
      '完成した物体より、その背後にある「観念（コンセプト）」を作品の本体とする運動。美術の脱物質化を進め、言語・指示・記録が作品となった。',
    coreIdea:
      '「アイデアこそが作品である」。物質的な仕上がりは観念を伝える手段にすぎず、言語・システム・行為自体が作品となりうる。',
    socialContext:
      '1968年前後の社会運動・制度批判の空気の中で、商品化される美術オブジェへの懐疑が高まった。',
    politicalContext:
      '美術館・画廊・市場という制度への批判と結びついた（制度批判＝institutional critique）。',
    philosophy:
      '言語哲学（ウィトゲンシュタイン等）や分析的思考への関心が、言語作品の背景にある。',
    reactionAgainst:
      'ミニマリズムでもなお残った「もの」としての美術対象と、その商品化・審美化への反発。',
    inheritedFrom:
      'デュシャンのレディメイド＝「観念が芸術を成立させる」を理論的に徹底した。',
    visualTraits:
      '視覚的形式は多様で一定しない。テキスト、写真、地図、指示書、ドキュメント。',
    compositionSpace: '物理的空間より、言語・情報・システムの中に成立する。',
    colorLight: '審美的な色彩は主題化されない。',
    technique: '言語の提示、写真記録、指示（インストラクション）、統計・地図。',
    materials: 'テキスト、写真、印刷物、日常物、行為。',
    subjects: '美術の定義、言語、システム、制度そのもの。',
    artistStatus:
      '芸術家は物を作る者から、観念を提示・分析する者へと再定義された。',
    productionSystem: '出版物・展覧会・記録という非物質的流通。',
    patronage: '前衛的画廊・美術館・少数の収集家。',
    marketExhibition:
      '「脱物質化」した作品は、カタログ・雑誌・掲示という形で流通し、市場と制度の前提を揺さぶった。',
    audience: '前衛的な美術界・批評界。',
    legacy:
      '観念中心の制作は以後の現代美術の基盤となり、あらゆるメディアを横断する現代的実践を可能にした。',
    contemporaryConnection:
      '「観念が作品を成立させる」という前提は、もの派・スーパーフラット・デジタル/没入作品を含む現代美術全体の共通言語である。',
    viewingPoints: [
      '「もの」ではなく「観念」を作品として読む',
      '脱物質化＝商品化への抵抗という文脈を意識する',
      'デュシャン以来の系譜に位置づける',
    ],
    keywords: ['コンセプチュアル・アート', '観念', '脱物質化', '制度批判', '言語', 'コスース', 'ルウィット'],
    artistIds: ['artist-kosuth', 'artist-lewitt'],
    workIds: [],
    sourceIds: ['tate-conceptual-art', 'moma-conceptual-art'],
    verification: 'verified',
  },

  /* 26 ─────────────────────────────────────────────── */
  {
    id: 'postminimalism',
    nameJa: 'ポストミニマリズム',
    nameEn: 'Post-Minimalism',
    aliases: ['プロセス・アート', 'Post-Minimalism'],
    visibilityLevel: 'standard',
    groupId: 'postwar-reduction',
    displayOrder: 2600,
    classification: 'tendency',
    era: 'postwar',
    dates: { start: 1966, end: 1978, peak: [1968, 1975], circa: true, note: '批評家R.クラウスらが用いた事後的な括り' },
    regionIds: ['america'],
    cities: ['ニューヨーク'],
    summary:
      'ミニマリズムの即物性を受け継ぎつつ、その厳格な幾何学・工業性を、柔らかい素材・過程・重力・身体・時間へと開いた諸傾向。',
    coreIdea:
      '固い完成形ではなく、素材の性質・重力・過程（プロセス）・偶然・身体の痕跡を作品の内容とする。',
    socialContext:
      '硬直したミニマルの規範への内部からの反動として、より有機的・過程的な表現が求められた。',
    reactionAgainst:
      'ミニマリズムの硬質な幾何学・非人称性・完結性に対し、柔らかさ・不定形・過程を対置した。',
    inheritedFrom:
      'ミニマリズムの即物性・反表現・場への注目を継承し、素材と過程へ拡張した。',
    visualTraits:
      '垂れる・積む・散らすといった重力に従う形、フェルト・ゴム・ラテックスなど柔らかい素材、不定形。',
    compositionSpace: '床・壁・空間との関係の中で、そのつど変化しうる配置。',
    colorLight: '素材本来の色・質感、暫定的な状態。',
    technique: '素材を垂らす・積む・切る等の過程重視、反復的行為。',
    materials: 'フェルト、ゴム、ラテックス、繊維、土など。',
    subjects: '素材・過程・重力・時間・身体そのもの。',
    artistStatus: '過程や行為を重視する制作者としての姿勢。',
    productionSystem: '画廊・美術館・オルタナティブスペース。',
    patronage: '前衛的画廊・美術館。',
    marketExhibition: '仮設的・過程的な作品が展示の在り方を問い直した。',
    audience: '現代美術の観客。',
    legacy:
      '過程・素材・身体への注目は、インスタレーション・ランドアート・ライト&スペースへ広がり、もの派とも同時代的に共鳴した。',
    contemporaryConnection:
      '素材の物性と場・過程を重視する態度は、日本の同時代のもの派と国際的に響き合い、現代の素材・場の芸術に連続する。',
    viewingPoints: [
      'ミニマルの「硬さ」に対する「柔らかさ」を見る',
      '重力・過程・時間が形を決める点に注目',
      'もの派との同時代的共鳴を意識する',
    ],
    keywords: ['ポストミニマリズム', 'プロセス・アート', 'エヴァ・ヘス', 'セラ', '重力', '素材', '過程'],
    artistIds: ['artist-hesse', 'artist-serra'],
    workIds: [],
    sourceIds: ['tate-process-art', 'moma-postminimalism'],
    verification: 'verified',
  },

  /* 27 ─────────────────────────────────────────────── */
  {
    id: 'light-and-space',
    nameJa: 'ライト・アンド・スペース',
    nameEn: 'Light and Space',
    aliases: ['光と空間', 'West Coast Minimalism', 'Light and Space'],
    visibilityLevel: 'core',
    groupId: 'postwar-reduction',
    displayOrder: 2700,
    shortLabel: 'Light and Space',
    classification: 'tendency',
    era: 'postwar',
    dates: { start: 1960, end: 1980, peak: [1965, 1975], circa: true, note: '南カリフォルニアで1960年代半ばに展開' },
    regionIds: ['america'],
    cities: ['ロサンゼルス'],
    summary:
      '南カリフォルニアで展開した、光・空間・知覚そのものを素材とする傾向。物体ではなく、見ること・感じることの経験を作品化した。',
    coreIdea:
      '作品は「見る対象」ではなく、光と空間の中で生じる知覚の経験そのもの。鑑賞者の知覚が作品を完成させる。',
    socialContext:
      'ロサンゼルスの産業技術（航空・自動車・樹脂）と、明るい光の風土が制作条件となった。LACMAの「アートとテクノロジー計画」も文脈にある。',
    philosophy:
      '知覚心理学・現象学への関心（見ることそのものへの注目）が核にある。',
    reactionAgainst:
      'ニューヨークのミニマリズムの硬質な「もの」中心性に対し、非物質的な光・知覚を対置した。',
    inheritedFrom:
      'ミニマリズムの還元と場への注目を継承しつつ、対象を光・空間へと脱物質化した。',
    visualTraits:
      '発光する空間、境界の消失、半透明の樹脂、知覚の不確かさ。',
    compositionSpace:
      '部屋全体を知覚の場とし、鑑賞者を光と空間の内部に置く。',
    colorLight:
      '光そのものが主素材。人工光・自然光を制御し、空間を発光体にする（タレルのガンツフェルト）。',
    technique: '光の投射・制御、樹脂・ガラス・半透明素材、建築的介入。',
    materials: '光、樹脂、ガラス、アクリル、空間そのもの。',
    subjects: '知覚・光・空間そのもの。',
    artistStatus: '知覚を設計する制作者としての姿勢。',
    productionSystem: '美術館・特設空間・恒久設置。',
    patronage: '美術館、財団、収集家。',
    marketExhibition: '恒久的な光の空間・特設インスタレーションが主要な形式。',
    audience: '美術館来場者。時間をかけた知覚経験が求められる。',
    legacy:
      '光と知覚を素材とする方法は、後の没入型・体験型のインスタレーションと関心を共有する。ただし直接の系譜としてteamLab等へ「発展」したと単純化はできず、共通点（光・知覚・環境）と相違点（技術・制作体制・目的）を分けて捉える必要がある。',
    contemporaryConnection:
      '光・空間・鑑賞者の知覚を扱う点で、後の没入型デジタル作品と関心を共有する。ただし両者は直接の師弟・系譜関係ではなく、技術（アナログな光の制御 対 リアルタイム演算）・制作体制（個人 対 学際的集団）・目的（知覚の還元的探究 対 多感覚的な環境体験）が大きく異なり、半世紀の歴史的隔たりがある点に注意したい。',
    viewingPoints: [
      '「もの」ではなく「知覚の経験」を作品とする点を意識する',
      '時間をかけて目が慣れる過程を体験する',
      'ニューヨークのミニマルとの西海岸的差異を読む',
    ],
    keywords: ['ライト・アンド・スペース', 'タレル', 'アーヴィン', '光', '知覚', '空間', '没入', '南カリフォルニア'],
    artistIds: ['artist-turrell', 'artist-irwin'],
    workIds: [],
    sourceIds: ['gugg-turrell', 'tate-turrell'],
    verification: 'verified',
  },

  /* 28 ─────────────────────────────────────────────── */
  {
    id: 'mono-ha',
    nameJa: 'もの派',
    nameEn: 'Mono-ha',
    aliases: ['モノ派', 'School of Things', 'Mono-ha'],
    visibilityLevel: 'core',
    groupId: 'postwar-japan',
    displayOrder: 2800,
    classification: 'tendency',
    era: 'postwar',
    dates: { start: 1968, end: 1975, peak: [1968, 1972], circa: true, note: '関根伸夫《位相―大地》(1968)を画期とする見方が一般的' },
    regionIds: ['japan'],
    cities: ['東京'],
    summary:
      '1960年代末の日本で、石・鉄・木・土・紙などの「もの」を最小限の手を加えて提示し、もの同士・ものと場・ものと鑑賞者の「関係」を主題化した傾向。',
    coreIdea:
      '作る（作為）よりも、ものをあるがままに置き、もの・場・身体の間に生じる関係と現前（そこに在ること）を経験させる。',
    socialContext:
      '高度経済成長・大学闘争・近代批判という時代状況の中で、「作ること」や近代的主体への懐疑が広がった。',
    politicalContext:
      '1968年前後の反権威・反近代の空気が、既成の美術観への批判と結びついた。',
    philosophy:
      '李禹煥は西田幾多郎らの東洋思想や現象学を参照し、「作らない」ことの理論を展開した。',
    reactionAgainst:
      '西洋近代の「作る」美術・表象中心主義、そして高度産業社会の人工性に対する反発。',
    inheritedFrom:
      'ミニマリズム・ポストミニマリズムの「もの」「場」への注目と、日本の物質観を独自に結合した。',
    visualTraits:
      '未加工に近い自然素材と工業素材の対置、最小限の介入、配置と余白。',
    compositionSpace:
      'ものが置かれた場・空間・鑑賞者の位置との関係そのものが作品となる。',
    colorLight: '素材本来の色・質感、時間による変化。',
    technique: '素材を置く・立てかける・支え合わせる等の最小限の操作。',
    materials: '石、鉄板、木、土、ガラス、綿、紙など。',
    subjects: 'もの・場・関係・現前そのもの。',
    artistStatus:
      '李禹煥が理論的中心となり、関根伸夫らと国際的にも再評価された。',
    productionSystem: '画廊・美術館・野外での提示。',
    patronage: '画廊・美術館・収集家（近年に国際市場でも再評価）。',
    marketExhibition:
      '仮設的・現場的な提示が多く、記録・再制作を通じて後年に国際的評価が確立した。',
    audience: '日本および国際の現代美術界。',
    legacy:
      '「作らない」「関係を見せる」という態度は、素材・場・関係を扱う現代美術に大きな影響を与え、日本発の重要な現代美術として国際的に位置づけられる。',
    contemporaryConnection:
      'ミニマリズム／ポストミニマリズム／ライト・アンド・スペースと同時代的に共鳴し、素材・場・身体を扱う現代の作品に連続する。同じ1960年代末にイタリアで興ったアルテ・ポーヴェラとは、日常的・自然的な素材を用い近代産業社会や作品の商品化を問い直す点で並行するが、両者は直接の影響関係にあったわけではない。アルテ・ポーヴェラが政治性・演劇性・変容を強調したのに対し、もの派は「作らない」こと・現前・関係の静けさを重んじる違いがあり、別個の文脈で並行して生じた現象として比較すべきである。',
    viewingPoints: [
      '「何を作ったか」より「どう置いたか・どんな関係が生じるか」を見る',
      'ミニマル/ポストミニマルとの同時代的関係を意識する',
      '同時代のアルテ・ポーヴェラとの共通点・相違点（直接の影響ではない）を比較する',
      '「作らない」ことの思想的背景を読む',
    ],
    keywords: ['もの派', '李禹煥', '関根伸夫', 'もの', '関係', '場', '現前', '戦後日本前衛'],
    artistIds: ['artist-lee-ufan', 'artist-sekine'],
    workIds: [],
    sourceIds: ['gugg-lee-ufan', 'gugg-lee-ufan-teaching', 'smarthistory-showa', 'tate-arte-povera'],
    verification: 'verified',
  },

  /* 29 ─────────────────────────────────────────────── */
  {
    id: 'superflat',
    nameJa: 'スーパーフラット',
    nameEn: 'Superflat',
    aliases: ['スーパーフラット', 'Superflat'],
    visibilityLevel: 'core',
    groupId: 'postwar-japan',
    displayOrder: 2900,
    classification: 'method-theory',
    era: 'contemporary',
    dates: { start: 2000, end: null, peak: [2000, 2010], circa: true, note: '村上隆が2000年に提唱' },
    regionIds: ['japan'],
    cities: ['東京'],
    summary:
      '村上隆が2000年に提唱した理論／傾向。浮世絵やアニメ・漫画に通じる「平面性」を軸に、日本の美術史と大衆文化、高級/低級の区別の平坦化を論じた。',
    coreIdea:
      '西洋的な奥行き・階層に対し、日本の視覚文化に一貫する「超・平面」を提示する。純粋芸術とサブカルチャー、過去と現在の階層をも平坦に接続する。',
    socialContext:
      'バブル崩壊後の日本のオタク文化・キャラクター経済のグローバル化と、それを美術として理論化する動きが背景にある。',
    reactionAgainst:
      '西洋近代美術の遠近法的空間・高級/低級の階層区分、そして戦後日本美術の西洋追随に対する批判的な問い直し。',
    inheritedFrom:
      '浮世絵・琳派・日本画の平面性と装飾性を継承し、ポップアートの大衆文化肯定と結合した。',
    visualTraits:
      '強い平面性、鮮やかな色、キャラクター、装飾的パターン、輪郭線。',
    compositionSpace: '奥行きを排した平面的画面、全面的な装飾。',
    colorLight: '鮮烈で均質な色面、印刷/デジタル的な明快さ。',
    technique: '絵画、フィギュア、アニメーション、工房（カイカイキキ）による分業。',
    materials: 'アクリル・カンヴァス、フィギュア（樹脂）、デジタル。',
    subjects: 'キャラクター、花、きのこ雲、消費文化、日本のイメージ。',
    artistStatus:
      '村上はキュレーター・理論家・企業家を兼ね、工房カイカイキキで多数の作家・製品を統括した。',
    productionSystem: '工房（カイカイキキ）による分業と、アート/商品の横断的展開。',
    patronage: '国際的な画廊・美術館・ファッションブランド・収集家。',
    marketExhibition:
      '国際的な画廊・美術館とブランドコラボを横断し、アートと商品の境界を戦略的に往還した。',
    audience: '国際的な美術市場と大衆的ファン層の双方。',
    legacy:
      '日本の視覚文化を美術史的に理論化して国際的な言説を作り、以後の日本現代美術の国際的受容に大きく作用した。',
    contemporaryConnection:
      'ポップアートの大衆文化肯定を継ぎ、平面性・キャラクター経済・複製をめぐる現代の視覚文化論に直結する。',
    viewingPoints: [
      '「平面性」という日本美術史の読み直しに注目',
      'ポップアートとの系譜（大衆文化の肯定）を読む',
      'アートと商品の戦略的往還を意識する',
    ],
    keywords: ['スーパーフラット', '村上隆', '平面性', 'オタク文化', '浮世絵', 'カイカイキキ', '現代美術'],
    artistIds: ['artist-murakami'],
    workIds: [],
    sourceIds: ['gugg-murakami'],
    verification: 'verified',
  },

  /* 30 ─────────────────────────────────────────────── */
  {
    id: 'immersive-digital',
    nameJa: 'デジタルアート／没入型インスタレーション',
    nameEn: 'Digital and Immersive Installation Art',
    aliases: ['没入型アート', 'デジタルアート', 'Immersive art'],
    visibilityLevel: 'core',
    isRepresentative: true,
    displayOrder: 3000,
    shortLabel: 'デジタル／没入型',
    classification: 'tendency',
    era: 'contemporary',
    dates: { start: 2001, end: null, peak: null, circa: true, note: 'teamLab結成(2001)以降に顕著化。より広い系譜は20世紀の環境芸術に遡る' },
    regionIds: ['japan', 'global'],
    cities: ['東京', '（国際）'],
    summary:
      'デジタル技術（リアルタイム演算・投影・センサー）を用い、鑑賞者の身体を包み込む没入的な環境を作る現代の傾向。teamLabはその代表例で、境界のない空間と身体的没入を掲げる。',
    coreIdea:
      '作品を「見る対象」ではなく、鑑賞者が身体ごと入り込み、その動きに反応して変化する「環境」として構成する。自己と世界の境界を問い直す。',
    socialContext:
      '計算機・センサー・プロジェクションの高性能化と、体験型・共有型の文化（SNS時代の体験消費）が背景にある。',
    technologyContext:
      'リアルタイムCG・物理シミュレーション・センサー・多面投影が、鑑賞者と連動する動的環境を可能にした。',
    reactionAgainst:
      '静的で自律した「もの」としての美術作品と、作品と鑑賞者を分ける枠（額縁・台座・展示室の壁）への挑戦。',
    inheritedFrom:
      'バロックのイリュージョニズム、ライト・アンド・スペースの知覚環境、インスタレーションの場の統合を、デジタル技術で更新した。',
    visualTraits:
      '境界のない連続空間、鑑賞者の動きに応答する映像、光と音の全方位的環境。',
    compositionSpace:
      '部屋・建物全体を作品化し、鑑賞者の移動と相互作用が空間を変える。',
    colorLight: '投影光そのものが主素材で、動的に変化する。',
    technique: 'リアルタイム演算、プロジェクションマッピング、センサーによる相互作用、集団制作。',
    materials: '光（投影）、コンピュータ、センサー、音響、空間。',
    subjects: '自然（花・水）、光、身体、自己と世界の関係。',
    artistStatus:
      'teamLabのように、アーティスト・プログラマー・エンジニア・数学者らが協働する学際的集団という新しい制作主体が現れた。',
    productionSystem: '学際的な集団制作（アート・技術・工学の統合）。',
    patronage: '常設デジタルアート施設、企業、都市開発、美術館。',
    marketExhibition:
      '常設の体験型施設（teamLab Borderless等）や大規模巡回展という、従来の美術館とは異なる興行的形式が広がった。',
    audience: '一般の広い来場者。体験そのものが目的となる。',
    legacy:
      '（現在進行中）美術と技術・興行・都市の関係を再編しつつある。評価の定着は今後の課題で、批評的議論も続いている。',
    contemporaryConnection:
      'バロックの鑑賞者の巻き込み（イリュージョニズム）、ライト・アンド・スペースの知覚環境、インスタレーションの場の統合と、関心の面で共鳴する。ただしこれらは「バロック→ライト&スペース→teamLab」といった一本の発展史ではない。共通するのは「見る対象から入り込む環境へ」という志向であり、相違するのは技術（リアルタイム演算・センサー）・制作主体（学際的集団）・興行や都市開発との結びつきである。歴史的にも数十年〜数世紀の隔たりがあり、直線的な因果ではなく問題意識の反復・再構成として理解するのが妥当である。',
    viewingPoints: [
      '「見る」から「入り込む・関わる」への転換を意識する',
      'バロックやライト&スペースとの共通点・相違点・歴史的距離を分けて考える',
      '技術・興行・美術の新しい関係を批判的に考える（評価はなお定まっていない）',
    ],
    keywords: ['デジタルアート', '没入型', 'teamLab', 'インスタレーション', '身体', '相互作用', '境界のない', '現代美術'],
    artistIds: ['artist-teamlab'],
    workIds: [],
    sourceIds: ['teamlab-tokyo', 'teamlab-body-immersive'],
    verification: 'single-source',
  },
  ...coreExpansionMovements,
];
