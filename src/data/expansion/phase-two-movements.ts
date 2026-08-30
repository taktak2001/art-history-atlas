import type { Movement, MovementNameOrigin } from '@/lib/schema';

type Seed = Pick<
  Movement,
  | 'id' | 'nameJa' | 'nameEn' | 'aliases' | 'visibilityLevel' | 'classification'
  | 'era' | 'regionIds' | 'cities' | 'summary' | 'coreIdea'
  | 'socialContext' | 'reactionAgainst' | 'inheritedFrom' | 'visualTraits'
  | 'compositionSpace' | 'colorLight' | 'technique' | 'materials' | 'subjects'
  | 'legacy' | 'contemporaryConnection' | 'keywords' | 'sourceIds'
> & {
  dates: Omit<Movement['dates'], 'circa'> & { circa?: boolean };
  displayOrder: number;
  institutions: string;
  circulation: string;
  origin: MovementNameOrigin;
  representativeArtistId: string;
  representativeWorkId: string;
};

const displayOrderOverrides: Partial<Record<Seed['id'], number>> = {
  'neo-dada-organizers': 19601,
  caravaggisti: 15951,
  'appropriation-art': 19801,
};

const techniqueOverrides: Partial<Record<Seed['id'], string>> = {
  'vienna-secession': '壁面を帯状に構成し、平面装飾と空間展示を統合する。',
  'der-blaue-reiter': '色面を重ね、木版の切削と年刊誌の編集で異なる媒体を並置する。',
  'socialist-realism': '写実的な素描と下絵を基に、物語場面を明晰に構成する。',
  'feminist-art': '身体を用いた行為、刺繍、記録撮影、共同アーカイブを組み合わせる。',
  nihonga: '膠で顔料を定着し、にじみ・線描・箔の反射を画面に組み込む。',
  yoga: '素描と遠近法を基礎に、戸外観察から油絵具を重ねて量感を作る。',
  mavo: '印刷像を切断・接合し、物体の組立、身体行為、舞台演出を横断する。',
  'jikken-kobo': 'スライドを同期投影し、録音、舞台装置、共同上演を時間構成する。',
  'china-85-new-wave': '描画、木版の彫摺、身体行為、空間設置、宣言・討議を横断する。',
  'young-british-artists': '既製物を集積・保存し、空間設置、演出撮影、作家主導展示を組み合わせる。',
};

const visualTraitOverrides: Partial<Record<Seed['id'], string>> = {
  mavo: '切断・接合された印刷像、機械的形態、都市の速度、身体行為、挑発的な文字。',
  'china-85-new-wave': '抽象、行為、空間設置、記号、巨大な画面。',
  'young-british-artists': '動物、医療ケース、日用品、強いタイトル、演出された記録像、挑発的展示。',
};

const representativeOverrides: Partial<Record<Seed['id'], { artistId: string; workId: string }>> = {
  'neo-impressionism': { artistId: 'artist-seurat', workId: 'work-grande-jatte' },
  caravaggisti: { artistId: 'artist-gentileschi', workId: 'work-judith-holofernes' },
};

const secondaryWorkIds: Record<Seed['id'], string> = {
  'neo-impressionism': 'work-bathers-at-asnieres',
  'vienna-secession': 'work-klimt-the-kiss',
  'die-bruecke': 'work-kirchner-self-portrait-soldier',
  'der-blaue-reiter': 'work-kandinsky-improvisation-28',
  orphism: 'work-delaunay-circular-forms',
  'socialist-realism': 'work-lenin-on-tribune',
  cobra: 'work-jorn-stalingrad',
  'nouveau-realisme': 'work-arman-sliced-teapots',
  'performance-art': 'work-artist-is-present',
  'feminist-art': 'work-womanhouse',
  'pictures-generation': 'work-untitled-film-still-35',
  'neo-expressionism': 'work-kiefer-sulamith',
  'relational-aesthetics': 'work-tiravanija-tomorrow',
  nihonga: 'work-taikan-mount-fuji',
  yoga: 'work-kuroda-morning-toilette',
  mavo: 'work-mavo-magazine-three',
  'jikken-kobo': 'work-apn-portfolio-one',
  'neo-dada-organizers': 'work-coca-cola-plan',
  'hi-red-center': 'work-cleaning-event',
  dansaekhwa: 'work-park-ecriture-one-77',
  'minjung-art': 'work-oh-yoon-marketing-one-hell',
  'china-85-new-wave': 'work-gu-wenda-mythos-lost-dynasties',
  caravaggisti: 'work-gentileschi-self-portrait-allegory',
  'pre-raphaelite-brotherhood': 'work-beata-beatrix',
  'hudson-river-school': 'work-course-empire-desolation',
  'barbizon-school': 'work-rousseau-charcoal-burner-hut',
  'appropriation-art': 'work-levine-fountain',
  'institutional-critique': 'work-haacke-condensation-cube',
  'young-british-artists': 'work-mother-and-child-divided',
  'net-art': 'work-agatha-appears',
};

const supplementalSourceIds: Record<Seed['id'], string[]> = {
  'neo-impressionism': ['tate-post-impressionism'],
  'vienna-secession': ['smarthistory-modernisms-overview'],
  'die-bruecke': ['tate-expressionism'],
  'der-blaue-reiter': ['tate-expressionism'],
  orphism: ['smarthistory-modernisms-overview'],
  'socialist-realism': ['smarthistory-modernisms-overview'],
  cobra: ['smarthistory-art-into-life'],
  'nouveau-realisme': ['smarthistory-art-into-life'],
  'performance-art': ['smarthistory-art-into-life'],
  'feminist-art': ['smarthistory-reframing-art-history'],
  'pictures-generation': ['tate-appropriation'],
  'neo-expressionism': ['tate-expressionism'],
  'relational-aesthetics': ['tate-conceptual-art'],
  nihonga: ['smarthistory-modernisms-overview'],
  yoga: ['smarthistory-modernisms-overview'],
  mavo: ['smarthistory-modernisms-overview'],
  'jikken-kobo': ['smarthistory-art-into-life'],
  'neo-dada-organizers': ['smarthistory-art-into-life'],
  'hi-red-center': ['smarthistory-art-into-life'],
  dansaekhwa: ['guggenheim-korean-experimental'],
  'minjung-art': ['guggenheim-korean-experimental'],
  'china-85-new-wave': ['smarthistory-reframing-art-history'],
  caravaggisti: ['tate-baroque'],
  'pre-raphaelite-brotherhood': ['met-pre-raphaelite-legacy'],
  'hudson-river-school': ['smarthistory-reframing-art-history'],
  'barbizon-school': ['smarthistory-reframing-art-history'],
  'appropriation-art': ['smarthistory-reframing-art-history'],
  'institutional-critique': ['smarthistory-reframing-art-history'],
  'young-british-artists': ['smarthistory-reframing-art-history'],
  'net-art': ['smarthistory-reframing-art-history'],
};

const makeMovement = (seed: Seed): Movement => {
  const {
    institutions,
    circulation,
    origin,
    representativeArtistId,
    representativeWorkId,
    ...movement
  } = seed;
  const representative = representativeOverrides[seed.id];
  const sourceIds = [...new Set([...movement.sourceIds, ...supplementalSourceIds[seed.id]])];
  return {
    ...movement,
    dates: { ...movement.dates, circa: movement.dates.circa ?? false },
    shortLabel: movement.nameJa,
    displayOrder: displayOrderOverrides[seed.id] ?? seed.displayOrder,
    technique: techniqueOverrides[seed.id] ?? movement.technique,
    visualTraits: visualTraitOverrides[seed.id] ?? movement.visualTraits,
    nameOrigin: origin,
    isRepresentative: movement.visibilityLevel === 'core',
    artistStatus: movement.classification === 'collective'
      ? '共通の活動名・展覧会・出版を介して協働した作家集団。個々の実践差も大きい。'
      : '個人作家の実践を批評・展覧会・教育が結びつけたまとまりで、固定した会員組織とは限らない。',
    productionSystem: institutions,
    patronage: '同時代の美術館、画廊、批評家、収集家、出版・教育機関。地域と時期による差がある。',
    marketExhibition: circulation,
    audience: '展覧会の観衆、批評家、作家、学生、収集家、および各実践が関わった地域社会。',
    viewingPoints: [
      `${movement.nameJa}を単一の様式ではなく、成立した制度と時代背景から見る`,
      '名称が当事者の自己命名か、批評・後世の分類かを区別する',
      '近接する運動との共有点と差異を、技法・媒体・流通から比較する',
    ],
    artistIds: [representative?.artistId ?? representativeArtistId],
    workIds: [representative?.workId ?? representativeWorkId, secondaryWorkIds[seed.id]],
    sourceIds,
    verification: sourceIds.length > 1 ? 'verified' : 'single-source',
  };
};

const origin = (
  summary: string,
  originalTerm: string,
  literalMeaning: string,
  sourceIds: string[],
  certainty: MovementNameOrigin['certainty'] = 'established',
  context?: string,
  coinedBy?: string,
  coinedYear?: number,
): MovementNameOrigin => ({
  summary,
  originalTerm,
  literalMeaning,
  context,
  coinedBy,
  coinedYear,
  certainty,
  sourceIds,
});

export const phaseTwoExpansionMovements: Movement[] = [
  makeMovement({
    id: 'neo-impressionism', nameJa: '新印象派', nameEn: 'Neo-Impressionism', aliases: ['分割主義', '点描主義'], visibilityLevel: 'standard', classification: 'movement', era: 'nineteenth', displayOrder: 1886,
    dates: { start: 1886, end: 1906, peak: [1886, 1894], circa: true, note: '第8回印象派展からシニャックらの展開まで' }, regionIds: ['france', 'pan-european'], cities: ['パリ', 'ブリュッセル', 'サン＝トロペ'],
    summary: '印象派の光の観察を、補色対比と分割筆触による体系的な色彩構成へ転換した運動。', coreIdea: '混色をパレットではなく鑑賞者の視覚に委ね、色彩と社会理念を秩序ある画面へ結びつける。', socialContext: '第三共和政下の科学言説、アナーキズム、独立展、前衛批評が交差した。', reactionAgainst: '印象派の即興性と、アカデミーの褐色調の自然主義。', inheritedFrom: '印象派、ドラクロワの補色、シュヴルールらの色彩理論。', visualTraits: '小さく分割した純色、補色対比、明晰な輪郭、静止した人物と光。', compositionSpace: '古典的な安定構図を色点の網目で組み立てる。', colorLight: '未混色の純色を並置し、光を視覚混合として表す。', technique: '分割筆触、点描、色彩対比の計画的配置。', materials: '油彩、カンヴァス、紙、版画。', subjects: '都市の余暇、海岸、労働、肖像、港。', institutions: 'アンデパンダン展と自由な画家協会、批評誌を中心に制作・議論した。', circulation: '無審査展、画廊、批評、ベルギーの二十人会を通じて国際化した。', legacy: 'フォーヴィスム、未来派、オルフィスムなど20世紀の色彩抽象へ橋を架けた。', contemporaryConnection: '色を感覚と制度の双方から設計する発想は、印刷・映像・ディスプレイにもつながる。', keywords: ['分割主義', '点描', '補色', '視覚混合', 'アンデパンダン'], sourceIds: ['met-neo-impressionism'], representativeArtistId: 'artist-georges-seurat', representativeWorkId: 'work-sunday-grande-jatte', origin: origin('批評家フェリックス・フェネオンが1886年に、スーラらの新しい印象派以後の絵画を指して用いた名称。', 'Néo-Impressionnisme', '新しい印象派', ['met-neo-impressionism'], 'established', '第8回印象派展後の批評', 'フェリックス・フェネオン', 1886),
  }),
  makeMovement({
    id: 'vienna-secession', nameJa: 'ウィーン分離派', nameEn: 'Vienna Secession', aliases: ['ゼツェッション'], visibilityLevel: 'standard', classification: 'collective', era: 'modern', displayOrder: 1897,
    dates: { start: 1897, end: 1918, peak: [1897, 1905], circa: true }, regionIds: ['germany'], cities: ['ウィーン'], summary: '保守的な美術家団体から離脱し、絵画・建築・工芸・展示を総合したウィーンの作家集団。', coreIdea: '各時代にその芸術を、芸術にその自由を与え、生活空間全体を近代化する。', socialContext: '多民族帝国末期の都市改造、ブルジョワ文化、心理学、工芸改革が背景。', reactionAgainst: 'ウィーン芸術家協会の保守的な審査と歴史主義。', inheritedFrom: 'アーツ・アンド・クラフツ、象徴主義、アール・ヌーヴォー、日本美術。', visualTraits: '金地、幾何学装飾、平面化、象徴的人物、統一された展示設計。', compositionSpace: '正方形・帯・反復文様で平面と建築を連続させる。', colorLight: '金、白、黒、鮮色を素材の反射と装飾秩序として用いる。', technique: '絵画、壁画、版画、家具、建築、展示の総合。', materials: '油彩、金箔、モザイク、木、金属、紙。', subjects: '寓意、肖像、身体、音楽、都市生活、装飾。', institutions: '分離派会館、展覧会、雑誌『ヴェル・サクルム』を共同運営した。', circulation: '自主展、雑誌、建築、工芸品を通じて国際的な近代デザインへ広がった。', legacy: 'ウィーン工房、表現主義、モダンデザイン、建築展示へ影響した。', contemporaryConnection: 'グラフィック、建築、展示、ブランドを一つの視覚体系として設計する先例。', keywords: ['分離派', '総合芸術', 'クリムト', 'ウィーン', '装飾'], sourceIds: ['moma-vienna-secession'], representativeArtistId: 'artist-gustav-klimt', representativeWorkId: 'work-beethoven-frieze', origin: origin('既存団体からの「分離」を表すドイツ語 Secession が、1897年に結成された団体名となった。', 'Wiener Secession', 'ウィーンの分離', ['moma-vienna-secession']),
  }),
  makeMovement({
    id: 'die-bruecke', nameJa: 'ブリュッケ', nameEn: 'Die Brücke', aliases: ['橋派'], visibilityLevel: 'standard', classification: 'collective', era: 'modern', displayOrder: 1905,
    dates: { start: 1905, end: 1913, peak: [1905, 1911] }, regionIds: ['germany'], cities: ['ドレスデン', 'ベルリン'], summary: '過去と未来をつなぐ「橋」を掲げ、直接的な線と色で近代都市と身体を描いたドイツ表現主義集団。', coreIdea: '若い世代の生活と制作を共同化し、訓練された美から自由な表現へ移る。', socialContext: '急速な都市化、裸身文化、前衛展、民族誌資料の受容が背景。', reactionAgainst: 'アカデミーの完成度、ブルジョワ的規範、自然主義。', inheritedFrom: 'ゴッホ、ムンク、ゴーギャン、ドイツ木版画、非西洋彫刻。', visualTraits: '角張った輪郭、強い補色、粗い木版、伸長した身体。', compositionSpace: '急な遠近、切断、斜線で都市と人物の緊張を作る。', colorLight: '自然色を離れた高彩度色と黒い輪郭。', technique: '直接描法、木版画、速写、共同アトリエ。', materials: '油彩、木版、紙、木彫。', subjects: '都市の街路、裸身、踊り、肖像、風景。', institutions: '共同アトリエ、会員版画、巡回展を自ら組織した。', circulation: '展覧会、会員向け版画、ポスター、批評を通じて知られた。', legacy: 'ドイツ表現主義、新即物主義以後の人物表現、戦後絵画へ参照点を残した。', contemporaryConnection: '共同制作と自主管理、都市の身体をめぐる表現の先例。', keywords: ['表現主義', '木版画', 'ドレスデン', '共同体', '都市'], sourceIds: ['moma-die-bruecke'], representativeArtistId: 'artist-ernst-ludwig-kirchner', representativeWorkId: 'work-street-dresden', origin: origin('ニーチェの言葉を参照し、過去から未来へ渡る「橋」を担う若い世代という自己像から命名された。', 'Die Brücke', '橋', ['moma-die-bruecke'], 'established', '1905年の集団結成と綱領'),
  }),
  makeMovement({
    id: 'der-blaue-reiter', nameJa: '青騎士', nameEn: 'Der Blaue Reiter', aliases: ['青騎士派'], visibilityLevel: 'standard', classification: 'collective', era: 'modern', displayOrder: 1911,
    dates: { start: 1911, end: 1914, peak: [1911, 1912] }, regionIds: ['germany'], cities: ['ミュンヘン'], summary: '色・音楽・精神性を横断し、具象から抽象への多様な道を示したミュンヘンの緩やかな作家ネットワーク。', coreIdea: '時代や地域を越える造形の内的必然性を探り、色と形を精神的経験へ変える。', socialContext: '前衛展、神智学、音楽、民衆芸術、植民地収集が交差した。', reactionAgainst: '新芸術家協会の審査と、自然再現を中心とする絵画観。', inheritedFrom: '表現主義、フォーヴィスム、民衆版画、子どもの絵、音楽理論。', visualTraits: '青を含む鮮色、透明な色面、動物、騎手、抽象形。', compositionSpace: '形の重なりとリズムで物理空間を精神的場へ変える。', colorLight: '色に心理的・象徴的な響きを与える。', technique: '油彩、水彩、版画、理論書、年刊誌。', materials: '油彩、紙、水彩、木版、印刷物。', subjects: '騎手、馬、風景、音楽、黙示、抽象。', institutions: '自主展と年刊誌『青騎士』を軸に国際的作品を並置した。', circulation: '展覧会、年刊誌、講演を通じて欧州前衛を接続した。', legacy: '抽象絵画、バウハウス、色彩理論へ大きく作用した。', contemporaryConnection: '異文化資料を同列化する利点と植民地主義的収集の問題を同時に考えられる。', keywords: ['抽象', '精神性', '音楽', '色彩', 'ミュンヘン'], sourceIds: ['smarthistory-blaue-reiter'], representativeArtistId: 'artist-wassily-kandinsky', representativeWorkId: 'work-composition-seven', origin: origin('マルクの馬への関心、カンディンスキーの騎手、二人が好んだ青から年刊誌名が生まれたとされる。', 'Der Blaue Reiter', '青い騎手', ['smarthistory-blaue-reiter']),
  }),
  makeMovement({
    id: 'orphism', nameJa: 'オルフィスム', nameEn: 'Orphism', aliases: ['オルフィック・キュビスム'], visibilityLevel: 'detailed', classification: 'tendency', era: 'modern', displayOrder: 1912,
    dates: { start: 1912, end: 1914, peak: [1912, 1913], circa: true }, regionIds: ['france'], cities: ['パリ'], summary: 'キュビスムの構造に純色と光の同時的リズムを加え、非対象的な色彩抽象へ進んだ短期的傾向。', coreIdea: '色そのものの対比と反復によって、音楽のような時間感覚を作る。', socialContext: '電気照明、都市、航空、詩、サロン文化が新しい同時性を促した。', reactionAgainst: '分析的キュビスムの抑制された色調。', inheritedFrom: 'キュビスム、新印象派、象徴主義、色彩理論。', visualTraits: '円盤、弧、プリズム状の色面、反復、都市の光。', compositionSpace: '中心と周縁を回転する色面が多焦点の場を作る。', colorLight: '補色と透明な重なりで光を運動として表す。', technique: '色面の分割、同時対比、透明な重層。', materials: '油彩、カンヴァス、紙、印刷。', subjects: '都市、窓、エッフェル塔、円盤、リズム。', institutions: 'サロン、詩人・批評家との協働、国際前衛展で形成された。', circulation: 'サロン・デ・ザンデパンダン、批評、国際展を通じて知られた。', legacy: '純粋抽象、シンクロミズム、デザインと色彩理論へつながった。', contemporaryConnection: '色と時間を同期させる映像・情報表現の先例として読める。', keywords: ['色彩抽象', '同時性', '円盤', 'キュビスム', 'アポリネール'], sourceIds: ['tate-orphism'], representativeArtistId: 'artist-robert-delaunay', representativeWorkId: 'work-simultaneous-windows', origin: origin('詩人アポリネールが1912年、音楽的で純粋な色彩表現を古代詩人オルフェウスになぞらえて用いた批評語。', 'Orphisme', 'オルフェウスに由来する表現', ['tate-orphism'], 'established', '1912年の講演・批評', 'ギヨーム・アポリネール', 1912),
  }),
  makeMovement({
    id: 'socialist-realism', nameJa: '社会主義リアリズム', nameEn: 'Socialist Realism', aliases: ['社会主義的リアリズム'], visibilityLevel: 'standard', classification: 'method-theory', era: 'modern', displayOrder: 1934,
    dates: { start: 1932, end: null, peak: [1934, 1953], circa: true, note: 'ソ連での制度化以後、各社会主義圏で異なる展開' }, regionIds: ['other', 'east-asia'], cities: ['モスクワ', 'レニングラード'], summary: '社会主義建設を肯定的・理解可能な物語として示すことを国家制度が求めた公式の制作原則。', coreIdea: '現実を革命的発展の方向において描き、模範的主体と未来像を教育する。', socialContext: 'スターリン期の文化統制、作家同盟、公共委嘱、検閲が制度基盤。', reactionAgainst: '前衛の抽象、形式実験、複数の独立芸術団体。', inheritedFrom: '19世紀リアリズム、歴史画、革命宣伝、記念碑美術。', visualTraits: '明晰な人体、英雄的労働者、群像、建設現場、指導者像。', compositionSpace: '中心化された物語構図と見通しのよい公共空間。', colorLight: '明るく肯定的な光、象徴色、写実的な色調。', technique: '油彩、彫刻、壁画、ポスター、写真、映画。', materials: '油彩、ブロンズ、石、紙、印刷、フィルム。', subjects: '労働、農業、軍事、指導者、家族、産業化。', institutions: '作家同盟、国家委嘱、アカデミー、展覧会、出版制度。', circulation: '国家展、公共建築、教科書、ポスター、記念碑を通じて広範に流通した。', legacy: '各社会主義圏の公式美術と、それに対する非公式美術の対立軸を作った。', contemporaryConnection: '国家・組織が理想的な身体と未来像を可視化する仕組みを考える材料。', keywords: ['国家美術', '写実', '労働者', '作家同盟', 'プロパガンダ'], sourceIds: ['moma-socialist-realism'], representativeArtistId: 'artist-aleksandr-gerasimov', representativeWorkId: 'work-stalin-voroshilov-kremlin', origin: origin('ロシア語の「社会主義的リアリズム」が1930年代初頭に公的用語となり、1934年の作家大会で原則化された。', 'Социалистический реализм', '社会主義的リアリズム', ['moma-socialist-realism'], 'established', 'ソ連の文化政策と1934年作家大会', undefined, 1934),
  }),
  makeMovement({
    id: 'cobra', nameJa: 'CoBrA', nameEn: 'CoBrA', aliases: ['コブラ'], visibilityLevel: 'standard', classification: 'collective', era: 'postwar', displayOrder: 1948,
    dates: { start: 1948, end: 1951, peak: [1948, 1951] }, regionIds: ['pan-european'], cities: ['コペンハーゲン', 'ブリュッセル', 'アムステルダム', 'パリ'], summary: '北欧・ベネルクスの作家が、自由な色と線、共同制作、民衆的イメージを掲げた戦後国際集団。', coreIdea: '文化的権威より実験と共同性を優先し、子どもや民衆芸術の即興性を回復する。', socialContext: '戦後復興、占領の記憶、国境を越える雑誌・展覧会が背景。', reactionAgainst: '戦前の幾何学抽象、シュルレアリスムの教条、文化的エリート主義。', inheritedFrom: '表現主義、シュルレアリスム、民衆芸術、子どもの絵。', visualTraits: '強い原色、粗い線、鳥獣・仮面・人物、厚い絵肌。', compositionSpace: '形が増殖し、中心を持たない密な画面。', colorLight: '原色と黒い線の衝突。', technique: '即興描画、厚塗り、共同壁画、雑誌制作。', materials: '油彩、紙、陶、印刷、壁面。', subjects: '想像上の生物、人物、神話、遊び、共同体。', institutions: '都市名を越えた共同宣言、雑誌、展覧会、共同制作。', circulation: '雑誌『CoBrA』、アムステルダム市立美術館展などで可視化された。', legacy: '欧州の戦後表現主義、アンフォルメル、実験的共同制作へ影響した。', contemporaryConnection: '国籍よりネットワークと共同制作を基盤にする集団の先例。', keywords: ['戦後欧州', '共同制作', '民衆芸術', '即興', '原色'], sourceIds: ['tate-cobra'], representativeArtistId: 'artist-asger-jorn', representativeWorkId: 'work-jorn-letter-to-my-son', origin: origin('Copenhagen・Brussels・Amsterdamの頭文字を組み合わせ、参加都市の国際連帯を示した名称。', 'CoBrA', 'コペンハーゲン、ブリュッセル、アムステルダム', ['tate-cobra'], 'established', '1948年の集団結成'),
  }),
  makeMovement({
    id: 'nouveau-realisme', nameJa: 'ヌーヴォー・レアリスム', nameEn: 'Nouveau Réalisme', aliases: ['新しいレアリスム'], visibilityLevel: 'standard', classification: 'movement', era: 'postwar', displayOrder: 1960,
    dates: { start: 1960, end: 1970, peak: [1960, 1963], circa: true }, regionIds: ['france', 'pan-european'], cities: ['パリ', 'ニース', 'ミラノ'], summary: '都市の廃棄物、広告、既製品、行為を「現実の新しい知覚」として直接取り込んだ欧州の運動。', coreIdea: '現実を再現する代わりに、現実の断片と行為そのものを作品へ移す。', socialContext: '大量消費、広告、都市改造、テレビ、米国ポップとの同時代性が背景。', reactionAgainst: 'アンフォルメルの内面的身振りと伝統的な絵画支持体。', inheritedFrom: 'ダダ、レディメイド、コラージュ、都市民俗。', visualTraits: '圧縮物、集積、引き裂かれたポスター、単色、人体痕跡。', compositionSpace: '都市の物体や壁面を展示空間へ移植する。', colorLight: '既製物固有の色、工業色、単色の対比。', technique: 'アサンブラージュ、圧縮、集積、デコラージュ、行為。', materials: '廃品、広告、金属、樹脂、日用品、紙。', subjects: '消費、都市、身体、廃棄、商品、メディア。', institutions: '批評家ピエール・レスタニを介した宣言、展覧会、作家ネットワーク。', circulation: '画廊、宣言、都市での行為、複数制作を通じて広がった。', legacy: 'アルテ・ポーヴェラ、アプロプリエーション、消費社会批判へ接続した。', contemporaryConnection: '廃棄物・流通・所有を作品化する環境的・社会的実践の先例。', keywords: ['既製品', '消費社会', '集積', 'デコラージュ', 'レスタニ'], sourceIds: ['moma-nouveau-realisme'], representativeArtistId: 'artist-arman', representativeWorkId: 'work-arman-le-plein', origin: origin('批評家ピエール・レスタニが「現実への新しい知覚的接近」を示す名称として提唱した。', 'Nouveau Réalisme', '新しいリアリズム', ['moma-nouveau-realisme'], 'established', '1960年の共同宣言', 'ピエール・レスタニ', 1960),
  }),
  makeMovement({
    id: 'performance-art', nameJa: 'パフォーマンス・アート', nameEn: 'Performance Art', aliases: ['行為芸術'], visibilityLevel: 'core', classification: 'tendency', era: 'postwar', displayOrder: 1965,
    dates: { start: 1950, end: null, peak: [1960, 1980], circa: true }, regionIds: ['global'], cities: ['ニューヨーク', 'ウィーン', '東京', 'ベオグラード'], summary: '身体、時間、場所、観客との関係を作品の中心に置き、物体として残る作品の前提を揺さぶる実践。', coreIdea: '作品を完成品ではなく、現場で起こる行為と経験として成立させる。', socialContext: '戦後前衛、テレビ、政治運動、フェミニズム、制度批判が交差した。', reactionAgainst: '商品化可能な唯一作品、絵画・彫刻中心の制度。', inheritedFrom: '未来派、ダダ、ハプニング、フルクサス、舞踊、儀礼。', visualTraits: '身体、持続、反復、危険、指示、観客参加。', compositionSpace: '展示室、街路、自然、私的空間を出来事の場へ変える。', colorLight: '照明や衣服は行為の条件となり、色は必ずしも中心ではない。', technique: '身体行為、指示書、持続、記録、観客参加。', materials: '身体、時間、声、映像、写真、日用品。', subjects: '身体、権力、痛み、ジェンダー、共同性、記憶。', institutions: 'オルタナティブ・スペース、祭典、大学、街頭、のちに美術館が支えた。', circulation: '現場、写真・映像記録、再演、出版を通じて伝わる。', legacy: '社会実践、参加型美術、映像、身体政治の中核となった。', contemporaryConnection: 'ライブ配信やSNS時代に、現場性と記録の関係を問う基盤。', keywords: ['身体', '時間', '行為', '観客', '記録'], sourceIds: ['tate-performance-art'], representativeArtistId: 'artist-marina-abramovic', representativeWorkId: 'work-rhythm-zero', origin: origin('英語の performance を、美術の媒体としての行為に用いた包括的な後発分類。成立時期と範囲は一つに定まらない。', 'Performance Art', '上演・遂行の芸術', ['tate-performance-art'], 'probable', '1960年代以降の行為・ハプニングを整理する批評語'),
  }),
  makeMovement({
    id: 'feminist-art', nameJa: 'フェミニスト・アート', nameEn: 'Feminist Art', aliases: ['フェミニズム美術'], visibilityLevel: 'core', classification: 'movement', era: 'postwar', displayOrder: 1970,
    dates: { start: 1965, end: null, peak: [1970, 1985], circa: true }, regionIds: ['america', 'pan-european', 'global'], cities: ['ロサンゼルス', 'ニューヨーク', 'ロンドン'], summary: 'ジェンダー化された表象・労働・制度を批判し、身体、歴史、共同制作、教育を再編した多様な運動。', coreIdea: '誰が作家として認められ、誰の身体と経験が可視化されるかを作品と制度の双方から問い直す。', socialContext: '第二波フェミニズム、公民権運動、反戦運動、女性学、共同教育が背景。', reactionAgainst: '男性中心の美術史、形式主義、女性の身体を対象化する表象。', inheritedFrom: 'コンセプチュアル、パフォーマンス、工芸、アーカイブ、活動家文化。', visualTraits: '身体、テキスト、反復労働、家事素材、歴史的引用、共同制作。', compositionSpace: '家庭、美術館、街路、教育空間を政治的な場として組み替える。', colorLight: '装飾色や身体色を価値の低いものとする階層を反転する。', technique: 'パフォーマンス、インスタレーション、刺繍、写真、映像、アーカイブ。', materials: '布、陶、写真、映像、身体、文章、日用品。', subjects: 'ジェンダー、身体、労働、歴史、暴力、ケア、再生産。', institutions: '女性美術プログラム、共同ギャラリー、雑誌、活動家ネットワーク。', circulation: '展覧会、ワークショップ、出版、デモ、教育を通じて広がった。', legacy: 'クィア・アート、ポストコロニアル批評、制度批判、社会実践へ不可欠な基盤。', contemporaryConnection: '表象の公平性、ケア労働、交差性をめぐる現在の議論に直結する。', keywords: ['ジェンダー', '制度批判', '身体', '共同制作', 'ケア'], sourceIds: ['tate-feminist-art'], representativeArtistId: 'artist-judy-chicago', representativeWorkId: 'work-the-dinner-party', origin: origin('女性解放運動と結びつく芸術実践を示す包括的名称で、単一の命名者や様式に還元できない。', 'Feminist Art', 'フェミニズムに基づく芸術', ['tate-feminist-art'], 'probable', '1960年代末以降の運動・教育・批評'),
  }),
  makeMovement({
    id: 'pictures-generation', nameJa: 'ピクチャーズ・ジェネレーション', nameEn: 'Pictures Generation', aliases: ['Pictures'], visibilityLevel: 'standard', classification: 'tendency', era: 'postwar', displayOrder: 1977,
    dates: { start: 1974, end: 1984, peak: [1977, 1981], circa: true }, regionIds: ['america'], cities: ['ニューヨーク', 'ロサンゼルス'], summary: '広告・映画・テレビ・美術史の既存イメージを再演・複製し、表象と作者性を批判した世代的傾向。', coreIdea: 'イメージは中立な窓ではなく、欲望・権力・消費を組み立てる既成のコードである。', socialContext: 'テレビ、広告、ポストモダン批評、オルタナティブ・スペースが背景。', reactionAgainst: 'モダニズムの独創性、媒体純粋性、直接的な自己表現。', inheritedFrom: 'ポップ、コンセプチュアル、映画理論、フェミニズム、アプロプリエーション。', visualTraits: '映画的構図、再撮影、引用、類型的ポーズ、無題・連作。', compositionSpace: '既知の画面形式を再演し、見る者の記憶とメディア経験を利用する。', colorLight: '白黒写真、広告的色彩、人工照明。', technique: '演出写真、再撮影、複製、編集、テキスト。', materials: '写真、映像、印刷物、絵画、音響。', subjects: 'アイデンティティ、映画、商品、性、作者性、記憶。', institutions: 'Artists Spaceなどのオルタナティブ・スペース、批評誌、画廊。', circulation: '1977年「Pictures」展、写真、雑誌、画廊を通じて命名・定着した。', legacy: 'アプロプリエーション・アート、写真批評、ポストインターネットのイメージ循環へ影響した。', contemporaryConnection: 'ミーム、再投稿、生成画像における出典と作者性を考える基盤。', keywords: ['表象', 'メディア', 'アプロプリエーション', '写真', 'ポストモダン'], sourceIds: ['moma-pictures-generation'], representativeArtistId: 'artist-cindy-sherman', representativeWorkId: 'work-untitled-film-still-21', origin: origin('ダグラス・クリンプが企画した1977年の展覧会「Pictures」にちなみ、後に世代的呼称として定着した。', 'Pictures Generation', '「Pictures」展に由来する世代名', ['moma-pictures-generation'], 'established', 'Artists Spaceの1977年展と後続批評', 'ダグラス・クリンプ', 1977),
  }),
  makeMovement({
    id: 'neo-expressionism', nameJa: '新表現主義', nameEn: 'Neo-Expressionism', aliases: ['ネオ・エクスプレッショニズム'], visibilityLevel: 'standard', classification: 'tendency', era: 'contemporary', displayOrder: 1978,
    dates: { start: 1977, end: 1988, peak: [1980, 1985], circa: true }, regionIds: ['germany', 'america', 'italy'], cities: ['ケルン', 'ベルリン', 'ニューヨーク', 'ローマ'], summary: '大画面の身振り、人物、歴史、神話を復活させ、1970年代末から国際的に注目された絵画傾向。', coreIdea: '絵画の物質性と図像を再び前面化し、歴史・身体・記憶を主観的に扱う。', socialContext: '冷戦末期、国際市場、展覧会の大型化、戦争記憶の再検討が背景。', reactionAgainst: 'ミニマリズム、コンセプチュアルの非物質性と匿名性。', inheritedFrom: 'ドイツ表現主義、抽象表現主義、歴史画、アルテ・ポーヴェラ。', visualTraits: '荒い筆触、厚い絵肌、巨大な人物、象徴、文字。', compositionSpace: '大画面に断片的な図像を積層し、身体的なスケールを作る。', colorLight: '濁った土色、強い原色、焦げたような暗部。', technique: '厚塗り、描き直し、混合素材、引用。', materials: '油彩、藁、鉛、木、写真、カンヴァス。', subjects: '歴史、神話、国家、身体、都市、戦争記憶。', institutions: '国際展、ケルン・ニューヨークの画廊、市場、批評。', circulation: '美術館展、ドクメンタ、画廊市場を通じて国際的傾向として構成された。', legacy: '1990年代以後の具象絵画と歴史表象へ継続的な影響を持つ。', contemporaryConnection: '絵画復権という市場言説と、歴史を描く必要性を分けて考えられる。', keywords: ['絵画復権', '身振り', '歴史', '図像', '1980年代'], sourceIds: ['guggenheim-neo-expressionism'], representativeArtistId: 'artist-anselm-kiefer', representativeWorkId: 'work-kiefer-margarethe', origin: origin('先行する表現主義の身振りと主観性の「新たな」回帰を示す批評的な総称で、地域ごとの自己命名ではない。', 'Neo-Expressionism', '新しい表現主義', ['guggenheim-neo-expressionism'], 'probable', '1970年代末から1980年代の国際批評・市場'),
  }),
  makeMovement({
    id: 'relational-aesthetics', nameJa: '関係性の美学', nameEn: 'Relational Aesthetics', aliases: ['リレーショナル・アート'], visibilityLevel: 'detailed', classification: 'method-theory', era: 'contemporary', displayOrder: 1990,
    dates: { start: 1990, end: 2005, peak: [1992, 1998], circa: true }, regionIds: ['pan-european', 'global'], cities: ['パリ', 'ロンドン', 'ケルン'], summary: '作品を独立した物体ではなく、人々の出会い・交換・参加を生む社会的な場として読む1990年代の批評概念。', coreIdea: '小規模な共在や交流の形式を作品とし、鑑賞者を参加者へ変える。', socialContext: '冷戦後、グローバル化、ビエンナーレ、サービス経済、ネットワーク社会が背景。', reactionAgainst: '自律した美術作品と一方向的な鑑賞モデル。', inheritedFrom: 'フルクサス、ハプニング、コンセプチュアル、社会彫刻、参加型実践。', visualTraits: '食事、会話、仮設空間、共同作業、サービス。', compositionSpace: '展示室を交流・滞在・交渉の環境へ変える。', colorLight: '視覚形式より関係の設計を優先する。', technique: '招待、料理、会話、共同制作、状況設定。', materials: '家具、食物、印刷物、時間、人間関係。', subjects: '共同性、交換、ホスピタリティ、労働、公共性。', institutions: '美術館、ギャラリー、ビエンナーレ、キュレーション理論。', circulation: '展覧会とニコラ・ブリオーの批評書を通じて定着し、強い反論も生んだ。', legacy: '社会実践、参加型美術、キュレーション研究の主要な論争点。', contemporaryConnection: '参加の包摂性、無償労働、権力差を検証する批評枠組み。', keywords: ['参加', '交流', '1990年代', 'ブリオー', '社会性'], sourceIds: ['guggenheim-relational-aesthetics'], representativeArtistId: 'artist-rirkrit-tiravanija', representativeWorkId: 'work-tiravanija-free', origin: origin('批評家ニコラ・ブリオーが1990年代の参加型実践を論じるために体系化した理論語。適用範囲には批判がある。', 'Esthétique relationnelle', '関係的な美学', ['guggenheim-relational-aesthetics'], 'established', '1990年代の展覧会批評と1998年の著書', 'ニコラ・ブリオー', 1998),
  }),
  makeMovement({
    id: 'nihonga', nameJa: '日本画', nameEn: 'Nihonga', aliases: ['Japanese-style painting'], visibilityLevel: 'core', classification: 'method-theory', era: 'modern', displayOrder: 1880,
    dates: { start: 1880, end: null, peak: [1890, 1930], circa: true, note: '明治期に制度化され、現在まで変化しながら継続' }, regionIds: ['japan'], cities: ['東京', '京都'], summary: '近代日本で「洋画」と対置され、伝統技法を選択・再編しながら制度化された絵画カテゴリー。', coreIdea: '日本の絵画遺産を近代的な教育・展覧会制度の中で再構成する。', socialContext: '明治国家、美術学校、博覧会、文化財保護、近代化が背景。', reactionAgainst: '急速な西洋化への危機意識。ただし洋画との交流も継続した。', inheritedFrom: '狩野派、琳派、円山四条派、文人画、大和絵、古画研究。', visualTraits: '線、余白、岩絵具、金銀、平面性と近代的写実の併存。', compositionSpace: '掛軸・屏風の構成と額装・展覧会空間を横断する。', colorLight: '岩絵具の粒子、墨、胡粉、金銀の反射。', technique: '膠で溶いた岩絵具、墨、胡粉、箔、絹本・紙本。', materials: '絹、和紙、岩絵具、墨、膠、金銀箔。', subjects: '風景、歴史、花鳥、人物、近代都市。', institutions: '東京美術学校、京都市立絵画専門学校、日本美術院、官展。', circulation: '官展、美術院展、学校、百貨店、美術館を通じて制度化された。', legacy: '日本近代美術の中心的分類であり、伝統と現代の境界を問い続ける。', contemporaryConnection: '「伝統」が近代制度の中で作られる過程を理解する重要例。', keywords: ['日本近代', '岩絵具', '美術院', '官展', '伝統'], sourceIds: ['met-nihonga-yoga'], representativeArtistId: 'artist-yokoyama-taikan', representativeWorkId: 'work-metempsychosis', origin: origin('明治期、西洋式油彩を指す「洋画」と区別するために成立した近代的カテゴリーで、古来不変の名称ではない。', 'Nihonga', '日本の絵画', ['met-nihonga-yoga'], 'established', '明治期の美術教育・展覧会制度'),
  }),
  makeMovement({
    id: 'yoga', nameJa: '洋画', nameEn: 'Yōga', aliases: ['西洋画', 'Western-style painting in Japan'], visibilityLevel: 'core', classification: 'method-theory', era: 'modern', displayOrder: 1876,
    dates: { start: 1870, end: null, peak: [1890, 1930], circa: true }, regionIds: ['japan'], cities: ['東京', '京都', 'パリ'], summary: '油彩、遠近法、写実、裸体画など西洋由来の制度と技法を日本で学習・翻案した近代絵画カテゴリー。', coreIdea: '西洋式の媒体・観察・教育を日本の社会と風景に適用し、近代的な作家像を形成する。', socialContext: '留学、工部美術学校、東京美術学校、官展、国家的近代化が背景。', reactionAgainst: '既存の流派制度と絵画形式。ただし日本画との境界は固定的ではない。', inheritedFrom: '欧州アカデミー、外光派、写実主義、印象派。', visualTraits: '油彩の量感、線遠近法、裸体、外光、カンヴァスの額装。', compositionSpace: '西洋式遠近法と日本の風景・生活空間を折衷する。', colorLight: '油彩による陰影、外光、褐色調から明るい色彩への変化。', technique: '油彩、素描、遠近法、解剖、外光制作。', materials: '油絵具、カンヴァス、木炭、紙。', subjects: '裸体、肖像、風景、歴史、都市、生活。', institutions: '工部美術学校、白馬会、太平洋画会、官展、留学制度。', circulation: '学校、官展、画塾、雑誌、留学ネットワークで定着した。', legacy: '日本の近代絵画、前衛、戦後具象の制度基盤を形成した。', contemporaryConnection: '「外来」と「伝統」を二分する分類自体の歴史性を示す。', keywords: ['油彩', '日本近代', '官展', '留学', '外光'], sourceIds: ['met-nihonga-yoga'], representativeArtistId: 'artist-kuroda-seiki', representativeWorkId: 'work-kuroda-lakeside', origin: origin('「西洋式の絵画」を意味する日本語で、明治期に日本画との対概念として制度化された。', '洋画 / Yōga', '西洋式の絵画', ['met-nihonga-yoga'], 'established', '明治期の美術教育・展覧会制度'),
  }),
  makeMovement({
    id: 'mavo', nameJa: 'MAVO', nameEn: 'MAVO', aliases: ['マヴォ'], visibilityLevel: 'standard', classification: 'collective', era: 'modern', displayOrder: 1923,
    dates: { start: 1923, end: 1925, peak: [1923, 1924], circa: true }, regionIds: ['japan'], cities: ['東京'], summary: '関東大震災前後の東京で、建築・演劇・出版・街頭行動を横断した日本前衛集団。', coreIdea: '芸術を生活と都市へ開き、既成美術制度を攻撃的な行為と複合媒体で揺さぶる。', socialContext: '震災復興、大衆メディア、左翼文化、欧州前衛受容が背景。', reactionAgainst: '公募展、美術団体、純粋美術、保守的な趣味。', inheritedFrom: '未来派、ダダ、構成主義、表現主義、村山知義の欧州経験。', visualTraits: '幾何学、機械、文字、コラージュ、身体的行為。', compositionSpace: '街路、舞台、建築、雑誌を一つの活動空間にする。', colorLight: '赤黒白、印刷色、舞台照明。', technique: 'コラージュ、アサンブラージュ、パフォーマンス、出版、舞台。', materials: '紙、写真、木、金属、日用品、身体。', subjects: '都市、機械、震災、労働、反制度、速度。', institutions: '集団展、雑誌『MAVO』、街頭行動、劇場を自主管理した。', circulation: '出版、ポスター、パフォーマンス、建築装飾を通じて短期間に活動した。', legacy: '戦後日本前衛、反芸術、複合芸術の重要な先例。', contemporaryConnection: '災害後の都市と芸術、媒体横断型コレクティブを考える起点。', keywords: ['日本前衛', 'ダダ', '震災', '都市', '複合芸術'], sourceIds: ['moma-mavo'], representativeArtistId: 'artist-murayama-tomoyoshi', representativeWorkId: 'work-murayama-construction', origin: origin('集団自身が採用した名称だが、語源については複数の説明があり断定できない。', 'MAVO', '語義には諸説', ['moma-mavo'], 'disputed', '1923年の集団結成と出版活動'),
  }),
  makeMovement({
    id: 'jikken-kobo', nameJa: '実験工房', nameEn: 'Jikken Kōbō', aliases: ['Experimental Workshop'], visibilityLevel: 'standard', classification: 'collective', era: 'postwar', displayOrder: 1951,
    dates: { start: 1951, end: 1958, peak: [1951, 1957], circa: true }, regionIds: ['japan'], cities: ['東京'], summary: '美術、音楽、舞台、写真、映像、電子技術を共同制作で結んだ戦後東京の学際的集団。', coreIdea: '専門分野の境界を越え、技術と知覚を組み合わせた新しい総合芸術を作る。', socialContext: '占領後の文化再建、電子技術、国際文化交流、前衛音楽が背景。', reactionAgainst: '既成美術団体とジャンル別の制度。', inheritedFrom: 'バウハウス、構成主義、シュルレアリスム、実験音楽、写真。', visualTraits: '投影、抽象映像、幾何学、舞台照明、音響との同期。', compositionSpace: '舞台・スクリーン・展示を時間的な総合空間へ変える。', colorLight: '投影光、色面、電子的な明滅。', technique: 'スライド投影、録音、映像、舞台装置、共同上演。', materials: 'フィルム、磁気テープ、写真、光、紙、音。', subjects: '知覚、技術、宇宙、音楽、抽象、共同性。', institutions: '作曲家・造形作家・技術者が公演単位で協働した。', circulation: '公演、発表会、文化施設、印刷物、放送を通じて活動した。', legacy: '日本のメディア・アート、インターメディア、実験音楽の先駆。', contemporaryConnection: 'アートと技術の共同研究を歴史的に位置づける。', keywords: ['複合芸術', '実験音楽', '技術', '投影', '共同制作'], sourceIds: ['moma-jikken-kobo', 'moma-tokyo-avant-garde'], representativeArtistId: 'artist-yamaguchi-katsuhiro', representativeWorkId: 'work-yamaguchi-vitrine', origin: origin('瀧口修造が、既成ジャンルを越えて実験する若い作家たちの活動名として提案した。', '実験工房 / Jikken Kōbō', '実験のための工房', ['moma-jikken-kobo'], 'established', '1951年の結成', '瀧口修造', 1951),
  }),
  makeMovement({
    id: 'neo-dada-organizers', nameJa: 'ネオ・ダダイズム・オルガナイザーズ', nameEn: 'Neo-Dada Organizers', aliases: ['ネオ・ダダ'], visibilityLevel: 'standard', classification: 'collective', era: 'postwar', displayOrder: 1960,
    dates: { start: 1960, end: 1960, peak: [1960, 1960], circa: true }, regionIds: ['japan'], cities: ['東京'], summary: '廃材、身体、騒音、街頭的な展示で既成美術の秩序を撹乱した、1960年の短命な日本前衛集団。', coreIdea: '作品の完成度より、物と身体が起こす事件によって美術制度を不安定化する。', socialContext: '安保闘争、高度成長、都市の廃棄物、読売アンデパンダン展が背景。', reactionAgainst: '公募団体、整った前衛様式、美術館の秩序。', inheritedFrom: 'ダダ、ラウシェンバーグ、アクション・ペインティング、読売アンデパンダン。', visualTraits: '廃材、破壊、裸体、煙、粗い物質、即興。', compositionSpace: '展示室と街路を事件の場へ変える。', colorLight: '廃材固有の色、煤、塗料、閃光。', technique: 'アサンブラージュ、破壊、行為、騒音、即興展示。', materials: '廃材、タイヤ、鉄、木、塗料、身体。', subjects: '都市、廃棄、反芸術、身体、暴力、祭り。', institutions: '短期のグループ展と読売アンデパンダン周辺のネットワーク。', circulation: '写真・批評・回顧展によって短期間の活動が再構成された。', legacy: 'ハイレッド・センター、反芸術、もの派前史へ複数の経路を開いた。', contemporaryConnection: '都市廃棄物とイベント型実践の起点として読める。', keywords: ['反芸術', '廃材', '1960年', '読売アンデパンダン', '行為'], sourceIds: ['moma-tokyo-avant-garde'], representativeArtistId: 'artist-ushio-shinohara', representativeWorkId: 'work-shinohara-boxing-painting', origin: origin('欧米で再評価された「ネオ・ダダ」を自らの活動名へ取り込み、組織者を意味する語を加えた。', 'Neo-Dadaism Organizers', '新しいダダイズムの組織者たち', ['moma-tokyo-avant-garde'], 'established', '1960年の集団活動'),
  }),
  makeMovement({
    id: 'hi-red-center', nameJa: 'ハイレッド・センター', nameEn: 'Hi-Red Center', aliases: ['Hi Red Center'], visibilityLevel: 'standard', classification: 'collective', era: 'postwar', displayOrder: 1963,
    dates: { start: 1963, end: 1964, peak: [1963, 1964], circa: true }, regionIds: ['japan'], cities: ['東京'], summary: '日常生活、衛生、都市管理を模倣するイベントで制度と公共空間を批評した三人組。', coreIdea: '行政や商品サービスの形式を過剰に演じ、日常の秩序を異化する。', socialContext: '東京五輪前の都市整備、衛生化、監視、消費社会が背景。', reactionAgainst: '美術館内の物体制作と、英雄的な前衛作家像。', inheritedFrom: 'ダダ、フルクサス、ネオ・ダダ、ハプニング、赤瀬川の模型千円札。', visualTraits: '白衣、標識、清掃、招待状、地図、記録写真。', compositionSpace: '銀座の街路、ホテル、駅、私的空間を実施場所にする。', colorLight: '行政的な白、赤い印、都市の既存環境。', technique: 'イベント、擬似サービス、郵送、指示、記録。', materials: '身体、清掃用具、印刷物、容器、都市設備。', subjects: '衛生、管理、貨幣、所有、公共性、日常。', institutions: '三人の協働と批評家・写真家のネットワーク。', circulation: '招待状、写真、報道、回顧展を通じて伝わる。', legacy: '制度批判、都市介入、社会実践、日本のコンセプチュアルへ影響した。', contemporaryConnection: '管理社会のサービス言語を演じる批評として再読できる。', keywords: ['都市', 'イベント', '制度批判', '衛生', '反芸術'], sourceIds: ['moma-tokyo-avant-garde'], representativeArtistId: 'artist-akasegawa-genpei', representativeWorkId: 'work-model-thousand-yen-note', origin: origin('高松次郎・赤瀬川原平・中西夏之の姓の頭文字・漢字の英訳を組み合わせた集団名。', 'Hi-Red Center', '高＝High、赤＝Red、中＝Center', ['moma-tokyo-avant-garde'], 'established', '1963年の三人組結成'),
  }),
  makeMovement({
    id: 'dansaekhwa', nameJa: '単色画', nameEn: 'Dansaekhwa', aliases: ['韓国単色画', 'Tansaekhwa'], visibilityLevel: 'standard', classification: 'tendency', era: 'postwar', displayOrder: 1973,
    dates: { start: 1970, end: 1990, peak: [1973, 1980], circa: true }, regionIds: ['east-asia'], cities: ['ソウル', '東京', 'パリ'], summary: '反復的な塗り、押し、引っかき、染み込みによって、物質・身体・時間を表した韓国の単色絵画傾向。', coreIdea: '単色を均質な面ではなく、素材と身体の反復が蓄積する場として扱う。', socialContext: '戦後復興、権威主義体制、国際展、日本・欧州との交流が背景。', reactionAgainst: '物語的再現と、輸入された抽象様式の表面的模倣。', inheritedFrom: 'アンフォルメル、抽象表現、東アジアの紙・墨・反復的修練。', visualTraits: '白・生成り・土色、反復線、布目、裂け、浸透。', compositionSpace: '画面全体を均質な反復と微差の場にする。', colorLight: '単色の内部に素材の吸収・反射・陰影を生む。', technique: '押す、引く、削る、染み込ませる、反復する。', materials: '油彩、鉛筆、麻布、韓紙、顔料。', subjects: '物質、身体、時間、反復、空白。', institutions: '韓国の国展、民間画廊、東京・パリの国際展を介して形成された。', circulation: '1970年代の国内展と日本での紹介、後年の国際回顧展で名称が定着した。', legacy: '韓国現代美術の国際的理解を大きく変え、物質的抽象の再評価を促した。', contemporaryConnection: '「東洋性」という一括説明を避け、制度・素材・身体の具体から比較できる。', keywords: ['韓国', '単色', '反復', '物質', '身体'], sourceIds: ['guggenheim-korean-experimental', 'met-korean-lineages'], representativeArtistId: 'artist-park-seo-bo', representativeWorkId: 'work-park-ecriture-55-73', origin: origin('韓国語で「単色画」を意味する名称。1970年代の実践を後にまとめる批評・展覧会用語として定着した。', '단색화 / Dansaekhwa', '単色画', ['met-korean-lineages'], 'probable', '1970年代以後の韓国美術批評と国際展'),
  }),
  makeMovement({
    id: 'minjung-art', nameJa: '民衆美術', nameEn: 'Minjung Art', aliases: ['ミンジュン美術'], visibilityLevel: 'standard', classification: 'movement', era: 'contemporary', displayOrder: 1980,
    dates: { start: 1979, end: 1995, peak: [1980, 1988], circa: true }, regionIds: ['east-asia'], cities: ['ソウル', '光州'], summary: '民主化運動と結びつき、労働・農村・国家暴力・共同体を公共的な図像で表した韓国の社会美術運動。', coreIdea: '美術を民衆の歴史と現在の闘争へ接続し、展示制度の外にも公共圏を作る。', socialContext: '軍事政権、光州民主化運動、労働運動、学生運動が背景。', reactionAgainst: '国家主導の文化、形式主義的モダニズム、エリート美術制度。', inheritedFrom: '民画、版画、社会主義リアリズム、壁画運動、活動家印刷文化。', visualTraits: '強い輪郭、群像、版画的白黒、仮面、民俗図像。', compositionSpace: '物語的な群像と街頭・集会の公共空間。', colorLight: '黒白版画、土色、旗や炎の強い色。', technique: '木版、壁画、掛け絵、印刷、共同制作。', materials: '木版、紙、布、顔料、壁面、印刷物。', subjects: '労働、農民、民主化、国家暴力、分断、共同体。', institutions: '作家集団、大学、労働・農民運動、街頭展、文化運動。', circulation: '版画、ポスター、壁画、集会、オルタナティブ展で広がった。', legacy: '韓国の社会実践、記憶の美術、民主化運動の視覚文化へ継続する。', contemporaryConnection: '芸術と運動の関係を、宣伝か自律かの二分法を越えて考えられる。', keywords: ['韓国', '民主化', '民衆', '版画', '社会運動'], sourceIds: ['met-korean-lineages'], representativeArtistId: 'artist-oh-yoon', representativeWorkId: 'work-oh-yoon-song-of-land', origin: origin('韓国語 minjung（民衆）を掲げ、1980年代の民主化運動と結びついた文化実践を示す名称。', '민중미술 / Minjung Misul', '民衆の美術', ['met-korean-lineages'], 'established', '1980年代の韓国民主化・文化運動'),
  }),
  makeMovement({
    id: 'china-85-new-wave', nameJa: '中国85新潮', nameEn: "China's 85 New Wave", aliases: ['85美術新潮', '85 New Wave'], visibilityLevel: 'standard', classification: 'movement', era: 'contemporary', displayOrder: 1985,
    dates: { start: 1985, end: 1989, peak: [1985, 1988], circa: true }, regionIds: ['east-asia'], cities: ['北京', '杭州', '厦門', '武漢'], summary: '改革開放期の中国各地で、多数の若手集団が思想・媒体・展覧会を実験した分散型の前衛運動。', coreIdea: '単一の公式様式から離れ、哲学、現代西洋美術、地域文化を手掛かりに新しい主体を作る。', socialContext: '文化大革命後の思想解放、翻訳、大学教育、非公式展、改革開放が背景。', reactionAgainst: '社会主義リアリズムの公式性と文化大革命期の視覚統制。', inheritedFrom: '西洋モダニズム、ダダ、コンセプチュアル、中国の書・禅・民間文化。', visualTraits: '抽象、行為、インスタレーション、記号、巨大な絵画。', compositionSpace: '大学、街路、地方都市、非公式会場を実験場にした。', colorLight: '地域と集団により多様で、共通様式を持たない。', technique: '絵画、版画、行為、インスタレーション、出版、理論討議。', materials: '油彩、墨、紙、印刷物、日用品、身体。', subjects: '主体、文化、言語、国家、近代化、宇宙観。', institutions: '各地の若手美術集団、大学、雑誌、非公式展覧会。', circulation: '宣言、雑誌、スライド、巡回的交流、1989年「中国現代美術展」へ集約した。', legacy: '1990年代中国現代美術の国際化と多様な実践の基盤。', contemporaryConnection: '一中心の運動史ではなく、地域ネットワークとして前衛を捉えられる。', keywords: ['中国', '改革開放', '前衛', '地域集団', '1985'], sourceIds: ['guggenheim-china-1989'], representativeArtistId: 'artist-xu-bing', representativeWorkId: 'work-book-from-the-sky', origin: origin('1985年前後に中国各地で急増した美術集団・展覧会を「新潮」として総称した後発的な歴史用語。', '八五美术新潮 / 85 New Wave', '1985年の新しい美術潮流', ['guggenheim-china-1989'], 'probable', '1985〜89年の分散型前衛を整理する批評・美術史用語'),
  }),
  makeMovement({
    id: 'caravaggisti', nameJa: 'カラヴァッジェスキ', nameEn: 'Caravaggisti', aliases: ['カラヴァッジョ派'], visibilityLevel: 'detailed', classification: 'school', era: 'baroque-rococo', displayOrder: 1600,
    dates: { start: 1595, end: 1650, peak: [1600, 1630], circa: true }, regionIds: ['italy', 'netherlands', 'france', 'spain'], cities: ['ローマ', 'ナポリ', 'ユトレヒト'], summary: 'カラヴァッジョの劇的な明暗、近接した人物、現実的なモデルを各地で展開した国際的な追随者群。', coreIdea: '聖なる出来事を、観客の近くにある現実の身体と光として提示する。', socialContext: '対抗宗教改革、巡礼都市ローマ、国際的な画家移動が背景。', reactionAgainst: 'マニエリスムの人工的な優雅さと遠い理想像。', inheritedFrom: 'カラヴァッジョ、北イタリアの写実、ヴェネツィア派の色彩。', visualTraits: '暗い背景、鋭い斜光、半身像、汚れや皺のある身体。', compositionSpace: '浅い前景へ人物を押し出し、光で場面を切り取る。', colorLight: 'テネブリズムと局所的な強光。', technique: '暗い地塗り、直接描法、実物モデル、強い明暗対比。', materials: '油彩、カンヴァス。', subjects: '聖書、殉教、音楽家、酒場、日常人物。', institutions: 'ローマの工房、教会委嘱、外国人画家のネットワーク。', circulation: '祭壇画、個人収集、画家の移動を通じて欧州各地へ広がった。', legacy: 'バロックの光、写実、風俗画、スペイン・オランダ絵画へ作用した。', contemporaryConnection: '光の演出で現実感と劇性を同時に作る映像表現の先例。', keywords: ['カラヴァッジョ', '明暗法', 'テネブリズム', '写実', '国際様式'], sourceIds: ['met-caravaggio-followers'], representativeArtistId: 'artist-artemisia-gentileschi', representativeWorkId: 'work-judith-slaying-holofernes', origin: origin('イタリア語で「カラヴァッジョに従う者たち」を意味し、単一組織ではなく後世がまとめた作家群の名称。', 'Caravaggisti', 'カラヴァッジョの追随者たち', ['met-caravaggio-followers'], 'established', 'カラヴァッジョの国際的影響を整理する美術史用語'),
  }),
  makeMovement({
    id: 'pre-raphaelite-brotherhood', nameJa: 'ラファエル前派', nameEn: 'Pre-Raphaelite Brotherhood', aliases: ['PRB'], visibilityLevel: 'standard', classification: 'collective', era: 'nineteenth', displayOrder: 1848,
    dates: { start: 1848, end: 1860, peak: [1849, 1856], circa: true }, regionIds: ['britain'], cities: ['ロンドン'], summary: 'ラファエロ以前の誠実な細部と自然観察を掲げ、ヴィクトリア朝の美術・文学・工芸を刷新した兄弟団。', coreIdea: '慣習的な理想化を退け、自然と文学を細部まで誠実に観察する。', socialContext: '産業化、宗教論争、中世主義、美術教育改革、雑誌文化が背景。', reactionAgainst: 'ロイヤル・アカデミーのラファエロ以後の定型と茶褐色の歴史画。', inheritedFrom: '初期ルネサンス、中世美術、ロマン主義、ラスキンの自然観。', visualTraits: '鮮明な細部、明るい色、平坦な光、象徴的な植物。', compositionSpace: '前景から背景まで均質に焦点が合い、装飾的な密度を持つ。', colorLight: '白地の上の透明色で宝石のような明るさを出す。', technique: '細密描写、戸外研究、湿った白地への透明色。', materials: '油彩、カンヴァス、紙、水彩。', subjects: '聖書、文学、中世史、現代社会、女性像、自然。', institutions: '秘密結社的な兄弟団、雑誌、アカデミー展、批評家との連携。', circulation: '展覧会、雑誌『The Germ』、複製、文学活動を通じて知られた。', legacy: 'アーツ・アンド・クラフツ、象徴主義、挿絵、デザインへ影響した。', contemporaryConnection: '緻密な自然観察と歴史的引用が現代の視覚文化で再評価される。', keywords: ['PRB', '中世主義', '自然観察', 'ラスキン', '文学'], sourceIds: ['tate-pre-raphaelite'], representativeArtistId: 'artist-dante-gabriel-rossetti', representativeWorkId: 'work-ecce-ancilla-domini', origin: origin('ラファエロ以前の初期イタリア美術へ立ち返る意図から、1848年に結成者たちが自称した名称。', 'Pre-Raphaelite Brotherhood', 'ラファエロ以前の兄弟団', ['tate-pre-raphaelite'], 'established', '1848年の兄弟団結成', undefined, 1848),
  }),
  makeMovement({
    id: 'hudson-river-school', nameJa: 'ハドソン・リバー派', nameEn: 'Hudson River School', aliases: ['Hudson River School'], visibilityLevel: 'standard', classification: 'school', era: 'nineteenth', displayOrder: 1835,
    dates: { start: 1825, end: 1875, peak: [1840, 1865], circa: true }, regionIds: ['america'], cities: ['ニューヨーク', 'ハドソン川流域'], summary: '北米の自然を崇高・牧歌・国家像として描き、米国で風景画を主要ジャンルへ押し上げた画家群。', coreIdea: '自然景観を神意、歴史、国家の未来を映す場として読む。', socialContext: '領土拡大、観光、鉄道、自然科学、先住民排除が背景。', reactionAgainst: '欧州美術への従属と、風景画の低い序列。', inheritedFrom: '英国ロマン主義、クロード・ロラン、崇高論、トランセンデンタリズム。', visualTraits: '広大な眺望、精密な前景、光に満ちた遠景、微小な人物。', compositionSpace: '高い視点と前中後景で領土を見渡すパノラマを作る。', colorLight: '日の出・夕景・大気遠近で自然を霊的に演出する。', technique: '野外素描を基にアトリエで大型油彩を構成。', materials: '油彩、カンヴァス、紙、版画。', subjects: 'ハドソン川、キャッツキル、西部、南米、文明と荒野。', institutions: 'ナショナル・アカデミー、American Art-Union、画廊、旅行文化。', circulation: '展覧会、版画、巡回展示、観光と収集を通じて大衆化した。', legacy: '米国風景画、自然保護意識、ルミニズムへ影響した。', contemporaryConnection: '自然表象と植民地主義・領土観を同時に批判的に読める。', keywords: ['米国風景画', '崇高', 'ハドソン川', '国家', '自然'], sourceIds: ['met-hudson-river-school'], representativeArtistId: 'artist-thomas-cole', representativeWorkId: 'work-the-oxbow', origin: origin('活動の最盛期後にニューヨーク周辺の風景画家をまとめて呼んだ名称で、当初は揶揄的な含意もあった。', 'Hudson River School', 'ハドソン川の流派', ['met-hudson-river-school'], 'established', '19世紀後半の批評による後発的分類'),
  }),
  makeMovement({
    id: 'barbizon-school', nameJa: 'バルビゾン派', nameEn: 'Barbizon School', aliases: ['バルビゾン画派'], visibilityLevel: 'standard', classification: 'school', era: 'nineteenth', displayOrder: 1830,
    dates: { start: 1830, end: 1875, peak: [1840, 1865], circa: true }, regionIds: ['france'], cities: ['バルビゾン', 'フォンテーヌブロー'], summary: 'フォンテーヌブローの森と農村を直接観察し、理想風景から日常の自然へ重心を移した画家群。', coreIdea: '歴史的寓意ではなく、天候、土地、労働が作る身近な風景を絵画の主題とする。', socialContext: '都市化、鉄道、1830・48年革命、農村への関心、画材の携帯性が背景。', reactionAgainst: 'アカデミーの理想化された歴史風景。', inheritedFrom: 'オランダ風景画、コンスタブル、ロマン主義、写実主義。', visualTraits: '低い地平線、森、曇天、土色、農作業、湿った大気。', compositionSpace: '近景の樹木と開けた空で身体的な場所感を作る。', colorLight: '抑えた緑・褐色・灰色と変化する自然光。', technique: '野外素描、油彩習作、アトリエでの仕上げ。', materials: '油彩、板、カンヴァス、紙。', subjects: '森、湿地、家畜、農民、村、季節。', institutions: 'バルビゾン村の宿、サロン、画商、野外制作の作家ネットワーク。', circulation: 'サロン、画商、収集家、米国画家の渡仏を通じて広がった。', legacy: '写実主義、印象派、ハーグ派、米国風景画へ影響した。', contemporaryConnection: '近郊の自然を観光地・労働空間・生態系として複合的に見る先例。', keywords: ['風景画', '野外制作', 'フォンテーヌブロー', '農村', '写実'], sourceIds: ['met-barbizon-school'], representativeArtistId: 'artist-theodore-rousseau', representativeWorkId: 'work-forest-fontainebleau', origin: origin('パリ近郊バルビゾン村に集った風景画家を、地域名でまとめた後発的な流派名。固定組織ではない。', 'École de Barbizon', 'バルビゾンの流派', ['met-barbizon-school'], 'established', '19世紀の地域的作家群への美術史的分類'),
  }),
  makeMovement({
    id: 'appropriation-art', nameJa: 'アプロプリエーション・アート', nameEn: 'Appropriation Art', aliases: ['引用芸術', '流用芸術'], visibilityLevel: 'detailed', classification: 'tendency', era: 'contemporary', displayOrder: 1980,
    dates: { start: 1977, end: null, peak: [1980, 1990], circa: true }, regionIds: ['america', 'global'], cities: ['ニューヨーク'], summary: '既存の写真、広告、作品、商品を流用し、作者性・所有・文化的権力を問い直す実践。', coreIdea: 'イメージの意味は起源ではなく、再配置・署名・制度・流通によって変わる。', socialContext: '複製メディア、著作権、市場、ポストモダン理論が背景。', reactionAgainst: '独創的な作者と唯一作品を中心とするモダニズム。', inheritedFrom: 'デュシャン、ポップ、コンセプチュアル、ピクチャーズ・ジェネレーション。', visualTraits: '再撮影、複製、引用、ロゴ、既視感、わずかな変更。', compositionSpace: '既存画像の形式を保ちつつ、展示文脈を変える。', colorLight: '原資料の色や印刷品質を意図的に継承する。', technique: '再撮影、複写、再演、サンプリング、署名。', materials: '写真、印刷物、映像、商品、デジタル画像。', subjects: '作者性、著作権、ジェンダー、商品、記憶、権力。', institutions: '画廊、美術館、批評、著作権法、市場を制作条件として扱う。', circulation: '複製・出版・展示・訴訟・批評を通じて意味が形成される。', legacy: 'リミックス、ネット文化、ポストインターネット、生成AIの議論へ直結する。', contemporaryConnection: '学習データ、引用、クレジット、文化的盗用の境界を考える。', keywords: ['流用', '作者性', '複製', '著作権', '引用'], sourceIds: ['tate-appropriation', 'moma-pictures-generation'], representativeArtistId: 'artist-sherrie-levine', representativeWorkId: 'work-after-walker-evans', origin: origin('英語 appropriation（取り込む・流用する）を既存イメージの再使用へ適用した批評的な総称。', 'Appropriation Art', '流用の芸術', ['tate-appropriation'], 'established', '1970年代末以降の写真・ポストモダン批評'),
  }),
  makeMovement({
    id: 'institutional-critique', nameJa: '制度批判', nameEn: 'Institutional Critique', aliases: ['インスティテューショナル・クリティーク'], visibilityLevel: 'detailed', classification: 'method-theory', era: 'postwar', displayOrder: 1969,
    dates: { start: 1968, end: null, peak: [1970, 1995], circa: true }, regionIds: ['america', 'pan-european', 'global'], cities: ['ニューヨーク', 'ロサンゼルス', 'ケルン'], summary: '美術館、画廊、市場、収集、展示、資金の仕組み自体を作品の対象とする批評的実践。', coreIdea: '作品の意味と価値を作る制度は中立ではなく、経済・政治・排除の構造を持つ。', socialContext: '1968年以後の政治、コンセプチュアル、情報公開、企業・財団の拡大が背景。', reactionAgainst: '美術館を中立な容器、作品価値を自明とする考え。', inheritedFrom: 'コンセプチュアル、ミニマリズム、フェミニズム、政治美術。', visualTraits: '資料、図表、建築介入、ツアー、テキスト、空の展示。', compositionSpace: '展示室の壁、導線、倉庫、理事会、資金源までを作品空間とみなす。', colorLight: '視覚効果より情報と配置の関係を優先する。', technique: '調査、アーカイブ、サイトスペシフィック介入、パフォーマンス。', materials: '文書、写真、地図、音声、建築、契約、データ。', subjects: '美術館、所有、スポンサー、労働、排除、展示。', institutions: '批判対象である美術館・画廊と交渉しながら制作・展示する。', circulation: '展示、出版、講演、アーカイブ、論争を通じて更新される。', legacy: '社会実践、脱植民地化、ミュージアム研究、キュレーション批評へ継続する。', contemporaryConnection: '収蔵方針、スポンサー、データ基盤、文化労働を検証する方法。', keywords: ['美術館', '制度', '所有', 'スポンサー', '調査'], sourceIds: ['tate-institutional-critique'], representativeArtistId: 'artist-hans-haacke', representativeWorkId: 'work-shapolsky-et-al', origin: origin('美術制度そのものを批判対象にする実践をまとめる英語の批評語で、後に複数世代へ拡張された。', 'Institutional Critique', '制度への批判', ['tate-institutional-critique'], 'established', '1960年代末以降のコンセプチュアルと美術館批評'),
  }),
  makeMovement({
    id: 'young-british-artists', nameJa: 'ヤング・ブリティッシュ・アーティスト', nameEn: 'Young British Artists', aliases: ['YBA', 'Young British Artists'], visibilityLevel: 'standard', classification: 'tendency', era: 'contemporary', displayOrder: 1988,
    dates: { start: 1988, end: 2000, peak: [1992, 1997], circa: true }, regionIds: ['britain'], cities: ['ロンドン'], summary: '自主企画展、強い物質とイメージ、メディア、市場を通じて1990年代英国美術を可視化した世代的呼称。', coreIdea: '制作だけでなく展示・宣伝・市場との関係を自ら組み立て、公共的な話題を作る。', socialContext: 'サッチャー以後、倉庫街、Goldsmiths、広告・新聞、若手市場が背景。', reactionAgainst: '公的制度への受動的依存と、伝統的な英国美術の慎み。', inheritedFrom: 'コンセプチュアル、ポップ、パンク、アプロプリエーション、インスタレーション。', visualTraits: '動物、医療ケース、日用品、強いタイトル、写真、挑発的展示。', compositionSpace: '倉庫、商業空間、美術館を大規模なインスタレーションへ変える。', colorLight: '工業素材、白いケース、広告的な明快さ。', technique: 'アサンブラージュ、インスタレーション、写真、映像、セルフプロデュース。', materials: '動物標本、ガラス、薬品、日用品、写真、映像。', subjects: '死、消費、階級、身体、メディア、英国性。', institutions: 'Goldsmiths、作家主導展、Saatchi Collection、Tate、新聞。', circulation: '「Freeze」展、画廊、市場、メディア、Turner Prizeを通じて集団像が形成された。', legacy: '作家主導展と現代美術市場の関係、英国文化政策の象徴となった。', contemporaryConnection: '話題性、市場、制度が「運動」を作る仕組みを検証できる。', keywords: ['YBA', 'ロンドン', 'Freeze', '市場', 'メディア'], sourceIds: ['tate-yba'], representativeArtistId: 'artist-damien-hirst', representativeWorkId: 'work-physical-impossibility', origin: origin('「若い英国の作家たち」という報道・展覧会上の呼称がYBAsと略され、1990年代に世代名として定着した。', 'Young British Artists', '若い英国人美術家たち', ['tate-yba'], 'established', '1988年以後の作家主導展・市場・報道'),
  }),
  makeMovement({
    id: 'net-art', nameJa: 'ネット・アート', nameEn: 'Net Art', aliases: ['Internet Art', 'インターネット・アート'], visibilityLevel: 'detailed', classification: 'tendency', era: 'contemporary', displayOrder: 1994,
    dates: { start: 1993, end: null, peak: [1995, 2005], circa: true }, regionIds: ['global'], cities: ['リュブリャナ', 'ニューヨーク', 'ベルリン', 'モスクワ'], summary: 'インターネットを作品の配布先ではなく、リンク・通信・参加・プロトコルから成る媒体として扱う実践。', coreIdea: 'ネットワークの接続、複製、匿名性、共同性、障害そのものを作品化する。', socialContext: 'WWWの普及、個人サイト、メーリングリスト、オープンソース、通信文化が背景。', reactionAgainst: '物体中心の市場と、美術館を唯一の公開場所とする制度。', inheritedFrom: 'コンセプチュアル、メール・アート、映像、ハッカー文化、テレマティック・アート。', visualTraits: '低解像度画像、リンク、ブラウザ窓、点滅、エラー、テキスト。', compositionSpace: '画面とサーバ、複数利用者の接続を可変的な場にする。', colorLight: '初期ウェブの限定色、CRTの発光、システム既定表示。', technique: 'HTML、リンク、スクリプト、データベース、オンライン参加。', materials: 'コード、サーバ、ブラウザ、ネットワーク、画像、テキスト。', subjects: '通信、監視、アイデンティティ、所有、記憶、インターフェース。', institutions: '個人サイト、メーリングリスト、メディア・ラボ、フェスティバル、後に美術館。', circulation: 'URL、ミラー、メーリングリスト、アーカイブを通じて国境を越えた。', legacy: 'ソフトウェア・アート、ソーシャルメディア実践、ポストインターネットへ接続した。', contemporaryConnection: 'プラットフォーム依存、リンク切れ、保存、データ所有を直接考える。', keywords: ['インターネット', 'HTML', 'ネットワーク', '参加', '保存'], sourceIds: ['tate-internet-art'], representativeArtistId: 'artist-olia-lialina', representativeWorkId: 'work-my-boyfriend-came-back', origin: origin('net art / internet art は1990年代半ば、ネットワークを媒体とする実践を指して定着した包括的名称。', 'Net Art', 'ネットワークの芸術', ['tate-internet-art'], 'probable', '初期WWWの作家ネットワークと批評'),
  }),
];
