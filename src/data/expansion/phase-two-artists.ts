import type { Artist, RegionId } from '@/lib/schema';

type ArtistSeed = {
  movementId: string;
  id: string;
  nameJa: string;
  nameOriginal: string;
  born: number | null;
  died: number | null;
  regionIds: RegionId[];
  country: string;
  bio: string;
  workId: string;
  sourceIds: string[];
};

const makeArtist = (seed: ArtistSeed): Artist => ({
  id: seed.id,
  nameJa: seed.nameJa,
  nameOriginal: seed.nameOriginal,
  born: seed.born,
  died: seed.died,
  lifeNote: seed.born === null || seed.died === null ? '生没年の片方または両方は存命・未確定のためnull' : undefined,
  regionIds: seed.regionIds,
  country: seed.country,
  movementIds: [seed.movementId],
  bio: seed.bio,
  keyWorkIds: [seed.workId],
  sourceIds: seed.sourceIds,
  verification: seed.sourceIds.length > 1 ? 'verified' : 'single-source',
});

export const phaseTwoExpansionArtists: Artist[] = [
  makeArtist({ movementId: 'neo-impressionism', id: 'artist-georges-seurat', nameJa: 'ジョルジュ・スーラ', nameOriginal: 'Georges Seurat', born: 1859, died: 1891, regionIds: ['france'], country: 'フランス', bio: '補色理論と分割筆触を体系化し、新印象派の基準となる大画面を制作した画家。', workId: 'work-sunday-grande-jatte', sourceIds: ['met-neo-impressionism'] }),
  makeArtist({ movementId: 'vienna-secession', id: 'artist-gustav-klimt', nameJa: 'グスタフ・クリムト', nameOriginal: 'Gustav Klimt', born: 1862, died: 1918, regionIds: ['germany'], country: 'オーストリア', bio: 'ウィーン分離派初代会長。絵画、壁画、展示空間を装飾と象徴の総合へ導いた。', workId: 'work-beethoven-frieze', sourceIds: ['moma-vienna-secession'] }),
  makeArtist({ movementId: 'die-bruecke', id: 'artist-ernst-ludwig-kirchner', nameJa: 'エルンスト・ルートヴィヒ・キルヒナー', nameOriginal: 'Ernst Ludwig Kirchner', born: 1880, died: 1938, regionIds: ['germany'], country: 'ドイツ', bio: 'ブリュッケの創設者。都市の身体と不安を角張った線・色・木版で表した。', workId: 'work-street-dresden', sourceIds: ['moma-die-bruecke'] }),
  makeArtist({ movementId: 'der-blaue-reiter', id: 'artist-wassily-kandinsky', nameJa: 'ワシリー・カンディンスキー', nameOriginal: 'Wassily Kandinsky', born: 1866, died: 1944, regionIds: ['germany', 'other'], country: 'ロシア／ドイツ／フランス', bio: '青騎士の中心人物として色と形の精神的・音楽的作用を理論化し、抽象絵画を展開した。', workId: 'work-composition-seven', sourceIds: ['smarthistory-blaue-reiter'] }),
  makeArtist({ movementId: 'orphism', id: 'artist-robert-delaunay', nameJa: 'ロベール・ドローネー', nameOriginal: 'Robert Delaunay', born: 1885, died: 1941, regionIds: ['france'], country: 'フランス', bio: '同時対比と都市の光を円環・窓・色面へ変換し、オルフィスムの色彩抽象を主導した。', workId: 'work-simultaneous-windows', sourceIds: ['tate-orphism'] }),
  makeArtist({ movementId: 'socialist-realism', id: 'artist-aleksandr-gerasimov', nameJa: 'アレクサンドル・ゲラシモフ', nameOriginal: 'Aleksandr Gerasimov', born: 1881, died: 1963, regionIds: ['other'], country: 'ソ連', bio: '指導者像や国家的主題で社会主義リアリズムの公式的な造形を代表した画家。', workId: 'work-stalin-voroshilov-kremlin', sourceIds: ['moma-socialist-realism'] }),
  makeArtist({ movementId: 'cobra', id: 'artist-asger-jorn', nameJa: 'アスガー・ヨルン', nameOriginal: 'Asger Jorn', born: 1914, died: 1973, regionIds: ['pan-european'], country: 'デンマーク', bio: 'CoBrAの中心人物として即興的な絵画、共同制作、雑誌、理論活動を横断した。', workId: 'work-jorn-letter-to-my-son', sourceIds: ['tate-cobra'] }),
  makeArtist({ movementId: 'nouveau-realisme', id: 'artist-arman', nameJa: 'アルマン', nameOriginal: 'Arman', born: 1928, died: 2005, regionIds: ['france', 'america'], country: 'フランス／アメリカ', bio: '日用品や廃品の集積・圧縮によって消費社会の物量を可視化したヌーヴォー・レアリスムの作家。', workId: 'work-arman-le-plein', sourceIds: ['moma-nouveau-realisme'] }),
  makeArtist({ movementId: 'performance-art', id: 'artist-marina-abramovic', nameJa: 'マリーナ・アブラモヴィッチ', nameOriginal: 'Marina Abramović', born: 1946, died: null, regionIds: ['global'], country: 'セルビア／アメリカ', bio: '身体の限界、持続、観客の倫理を問うパフォーマンスを1970年代から展開した。', workId: 'work-rhythm-zero', sourceIds: ['tate-performance-art'] }),
  makeArtist({ movementId: 'feminist-art', id: 'artist-judy-chicago', nameJa: 'ジュディ・シカゴ', nameOriginal: 'Judy Chicago', born: 1939, died: null, regionIds: ['america'], country: 'アメリカ', bio: '女性美術教育と共同制作を組織し、歴史から排除された女性たちを大規模インスタレーションで可視化した。', workId: 'work-the-dinner-party', sourceIds: ['tate-feminist-art'] }),
  makeArtist({ movementId: 'pictures-generation', id: 'artist-cindy-sherman', nameJa: 'シンディ・シャーマン', nameOriginal: 'Cindy Sherman', born: 1954, died: null, regionIds: ['america'], country: 'アメリカ', bio: '映画・広告に見られる女性像を自ら演じ、アイデンティティがメディアの型で作られることを示した。', workId: 'work-untitled-film-still-21', sourceIds: ['moma-pictures-generation'] }),
  makeArtist({ movementId: 'neo-expressionism', id: 'artist-anselm-kiefer', nameJa: 'アンゼルム・キーファー', nameOriginal: 'Anselm Kiefer', born: 1945, died: null, regionIds: ['germany'], country: 'ドイツ', bio: 'ドイツ史、神話、戦争記憶を藁・鉛・厚い絵肌の大画面に重ねた新表現主義の代表作家。', workId: 'work-kiefer-margarethe', sourceIds: ['guggenheim-neo-expressionism'] }),
  makeArtist({ movementId: 'relational-aesthetics', id: 'artist-rirkrit-tiravanija', nameJa: 'リクリット・ティラヴァーニャ', nameOriginal: 'Rirkrit Tiravanija', born: 1961, died: null, regionIds: ['global'], country: 'タイ／アルゼンチン／アメリカ', bio: '料理や滞在の場を展示室に作り、作品を人々の関係と時間として成立させた。', workId: 'work-tiravanija-free', sourceIds: ['guggenheim-relational-aesthetics'] }),
  makeArtist({ movementId: 'nihonga', id: 'artist-yokoyama-taikan', nameJa: '横山大観', nameOriginal: 'Yokoyama Taikan', born: 1868, died: 1958, regionIds: ['japan'], country: '日本', bio: '日本美術院を拠点に、線を抑えた朦朧体や長大な絵巻で近代日本画を展開した。', workId: 'work-metempsychosis', sourceIds: ['met-nihonga-yoga'] }),
  makeArtist({ movementId: 'yoga', id: 'artist-kuroda-seiki', nameJa: '黒田清輝', nameOriginal: 'Kuroda Seiki', born: 1866, died: 1924, regionIds: ['japan'], country: '日本', bio: 'フランスで学んだ外光表現と裸体画を日本の教育・官展制度へ導入した洋画家。', workId: 'work-kuroda-lakeside', sourceIds: ['met-nihonga-yoga'] }),
  makeArtist({ movementId: 'mavo', id: 'artist-murayama-tomoyoshi', nameJa: '村山知義', nameOriginal: 'Murayama Tomoyoshi', born: 1901, died: 1977, regionIds: ['japan'], country: '日本', bio: '構成、舞台、演劇、批評を横断し、MAVOの中心で「意識的構成主義」を唱えた。', workId: 'work-murayama-construction', sourceIds: ['moma-mavo'] }),
  makeArtist({ movementId: 'jikken-kobo', id: 'artist-yamaguchi-katsuhiro', nameJa: '山口勝弘', nameOriginal: 'Yamaguchi Katsuhiro', born: 1928, died: 2018, regionIds: ['japan'], country: '日本', bio: '光学的な「ヴィトリーヌ」や映像・環境作品を通じて、実験工房の技術横断性を体現した。', workId: 'work-yamaguchi-vitrine', sourceIds: ['moma-jikken-kobo', 'moma-tokyo-avant-garde'] }),
  makeArtist({ movementId: 'neo-dada-organizers', id: 'artist-ushio-shinohara', nameJa: '篠原有司男', nameOriginal: 'Ushio Shinohara', born: 1932, died: null, regionIds: ['japan', 'america'], country: '日本／アメリカ', bio: '廃材の彫刻やボクシング・ペインティングで、反芸術の身体性と速度を示した。', workId: 'work-shinohara-boxing-painting', sourceIds: ['moma-tokyo-avant-garde'] }),
  makeArtist({ movementId: 'hi-red-center', id: 'artist-akasegawa-genpei', nameJa: '赤瀬川原平', nameOriginal: 'Akasegawa Genpei', born: 1937, died: 2014, regionIds: ['japan'], country: '日本', bio: '模型千円札、ハイレッド・センター、超芸術トマソンを通じて制度と日常の境界を批評した。', workId: 'work-model-thousand-yen-note', sourceIds: ['moma-tokyo-avant-garde'] }),
  makeArtist({ movementId: 'dansaekhwa', id: 'artist-park-seo-bo', nameJa: '朴栖甫', nameOriginal: 'Park Seo-Bo', born: 1931, died: 2023, regionIds: ['east-asia'], country: '韓国', bio: '鉛筆と絵具の反復行為による《描法》シリーズで単色画の中心となった。', workId: 'work-park-ecriture-55-73', sourceIds: ['guggenheim-korean-experimental', 'met-korean-lineages'] }),
  makeArtist({ movementId: 'minjung-art', id: 'artist-oh-yoon', nameJa: '呉潤', nameOriginal: 'Oh Yoon', born: 1946, died: 1986, regionIds: ['east-asia'], country: '韓国', bio: '木版画と民俗図像を用い、労働・共同体・民主化を力強い群像で表した民衆美術の作家。', workId: 'work-oh-yoon-song-of-land', sourceIds: ['met-korean-lineages'] }),
  makeArtist({ movementId: 'china-85-new-wave', id: 'artist-xu-bing', nameJa: '徐冰', nameOriginal: 'Xu Bing', born: 1955, died: null, regionIds: ['east-asia', 'america'], country: '中国／アメリカ', bio: '読めない擬似漢字を用いる《天書》で、言語・知識・権威を問い直した85新潮世代の作家。', workId: 'work-book-from-the-sky', sourceIds: ['guggenheim-china-1989'] }),
  makeArtist({ movementId: 'caravaggisti', id: 'artist-artemisia-gentileschi', nameJa: 'アルテミジア・ジェンティレスキ', nameOriginal: 'Artemisia Gentileschi', born: 1593, died: 1656, regionIds: ['italy'], country: 'イタリア', bio: 'カラヴァッジョの明暗と近接構図を受け継ぎ、強い女性像と劇的な物語画を制作した。', workId: 'work-judith-slaying-holofernes', sourceIds: ['met-caravaggio-followers'] }),
  makeArtist({ movementId: 'pre-raphaelite-brotherhood', id: 'artist-dante-gabriel-rossetti', nameJa: 'ダンテ・ゲイブリエル・ロセッティ', nameOriginal: 'Dante Gabriel Rossetti', born: 1828, died: 1882, regionIds: ['britain'], country: 'イギリス', bio: 'ラファエル前派の創設者として絵画と詩を結び、中世主義と象徴的女性像を展開した。', workId: 'work-ecce-ancilla-domini', sourceIds: ['tate-pre-raphaelite'] }),
  makeArtist({ movementId: 'hudson-river-school', id: 'artist-thomas-cole', nameJa: 'トマス・コール', nameOriginal: 'Thomas Cole', born: 1801, died: 1848, regionIds: ['america'], country: 'アメリカ', bio: 'ハドソン・リバー派の創始者とされ、自然景観へ歴史・宗教・国家の寓意を重ねた。', workId: 'work-the-oxbow', sourceIds: ['met-hudson-river-school'] }),
  makeArtist({ movementId: 'barbizon-school', id: 'artist-theodore-rousseau', nameJa: 'テオドール・ルソー', nameOriginal: 'Théodore Rousseau', born: 1812, died: 1867, regionIds: ['france'], country: 'フランス', bio: 'フォンテーヌブローの森を長期に観察し、樹木と大気の変化を重厚な風景画にした。', workId: 'work-forest-fontainebleau', sourceIds: ['met-barbizon-school'] }),
  makeArtist({ movementId: 'appropriation-art', id: 'artist-sherrie-levine', nameJa: 'シェリー・レヴィーン', nameOriginal: 'Sherrie Levine', born: 1947, died: null, regionIds: ['america'], country: 'アメリカ', bio: '既存写真を再撮影し、独創性、所有、ジェンダー化された作者像を批判した。', workId: 'work-after-walker-evans', sourceIds: ['tate-appropriation', 'moma-pictures-generation'] }),
  makeArtist({ movementId: 'institutional-critique', id: 'artist-hans-haacke', nameJa: 'ハンス・ハーケ', nameOriginal: 'Hans Haacke', born: 1936, died: null, regionIds: ['germany', 'america'], country: 'ドイツ／アメリカ', bio: '不動産、企業、スポンサー、収蔵の調査を作品化し、美術制度の政治経済を可視化した。', workId: 'work-shapolsky-et-al', sourceIds: ['tate-institutional-critique'] }),
  makeArtist({ movementId: 'young-british-artists', id: 'artist-damien-hirst', nameJa: 'ダミアン・ハースト', nameOriginal: 'Damien Hirst', born: 1965, died: null, regionIds: ['britain'], country: 'イギリス', bio: '作家主導展「Freeze」から登場し、標本・医療ケース・反復商品で死と市場を扱ったYBAの中心人物。', workId: 'work-physical-impossibility', sourceIds: ['tate-yba'] }),
  makeArtist({ movementId: 'net-art', id: 'artist-olia-lialina', nameJa: 'オリア・リアリナ', nameOriginal: 'Olia Lialina', born: 1971, died: null, regionIds: ['global'], country: 'ロシア／ドイツ', bio: '複数フレームとリンクを物語構造に用い、初期ウェブ固有の閲覧体験を作品化した。', workId: 'work-my-boyfriend-came-back', sourceIds: ['tate-internet-art'] }),
].filter((artist) => !['artist-georges-seurat', 'artist-artemisia-gentileschi'].includes(artist.id));
