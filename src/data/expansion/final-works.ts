import type { Work } from '@/lib/schema';
import { commonsPublicDomainImage } from './image-meta';

const pd = (
  file: string,
  title: string,
  creator: string,
  date: string,
  alt: string,
) => commonsPublicDomainImage(file, { title, creator, date, alt });

export const finalExpansionWorks: Work[] = [
  {
    id: 'work-matisse-green-line', titleJa: '緑のすじのある肖像（マティス夫人）', titleOriginal: 'The Green Stripe', creatorId: 'artist-henri-matisse', creatorName: 'アンリ・マティス', year: '1905年', medium: '油彩・テンペラ、カンヴァス', collection: 'デンマーク国立美術館', movementIds: ['fauvism'], description: '顔の中央を緑で分け、肌と背景を補色の面として組み立て、色を局所色から解放した肖像。',
    image: pd('Matisse - Green Line.jpeg', 'The Green Stripe', 'Henri Matisse', '1905', '女性の顔の中央を緑の帯が縦に走り、左右を赤・黄・青緑の強い色面が分ける肖像。'), sourceIds: ['commons-matisse-green', 'smarthistory-fauvism'], verification: 'verified',
  },
  {
    id: 'work-derain-charing-cross', titleJa: 'チャリング・クロス橋', titleOriginal: 'Charing Cross Bridge', creatorId: 'artist-andre-derain', creatorName: 'アンドレ・ドラン', year: '1906年', medium: '油彩、カンヴァス', collection: 'ナショナル・ギャラリー・オブ・アート', movementIds: ['fauvism'], description: 'ロンドンの橋と河岸を橙・青・緑の高彩度な色面と分割筆触へ変換した都市風景。',
    image: pd('Derain CharingCrossBridge.png', 'Charing Cross Bridge', 'André Derain', '1906', '橙色の空、青い川、赤や緑の建物が短い筆触で組み立てられたロンドンの橋の風景。'), sourceIds: ['commons-derain-charing', 'met-fauvism'], verification: 'verified',
  },
  {
    id: 'work-lissitzky-red-wedge', titleJa: '赤い楔で白を撃て', titleOriginal: 'Beat the Whites with the Red Wedge', creatorId: 'artist-el-lissitzky', creatorName: 'エル・リシツキー', year: '1919〜1920年頃', medium: 'カラー・リトグラフ', collection: '各地所蔵', movementIds: ['russian-constructivism'], description: '赤い三角形が白い円へ食い込む単純な幾何学で、内戦の政治的対立を即時的なポスターへ翻訳した。',
    image: pd('Beat the Whites with the Red Wedge.jpg', 'Beat the Whites with the Red Wedge', 'El Lissitzky', '1919–20', '大きな白円へ赤い三角形が突き刺さり、黒と赤のロシア語文字が斜めに配置されたポスター。'), sourceIds: ['commons-lissitzky-red-wedge', 'moma-constructivism'], verification: 'verified',
  },
  {
    id: 'work-popova-architectonic', titleJa: '絵画的建築', titleOriginal: 'Painterly Architectonic', creatorId: 'artist-lyubov-popova', creatorName: 'リュボーフィ・ポポワ', year: '1916年', medium: '油彩、カンヴァス', collection: 'スコットランド国立美術館', movementIds: ['russian-constructivism'], description: '色の平面を圧縮・交差させ、絵画を対象の描写ではなく力と構造の組立として扱った。',
    image: pd('Painterly Architectonic - Lyubov Popova.jpg', 'Painterly Architectonic', 'Lyubov Popova', '1916', '赤、白、黒、黄土色の角張った平面が縦方向へ圧縮され、互いに交差する抽象画。'), sourceIds: ['commons-popova-architectonic', 'smarthistory-constructivism'], verification: 'verified',
  },
  {
    id: 'work-malevich-white', titleJa: '白の上の白', titleOriginal: 'Suprematist Composition: White on White', creatorId: 'artist-kazimir-malevich', creatorName: 'カジミール・マレーヴィチ', year: '1918年', medium: '油彩、カンヴァス', collection: 'ニューヨーク近代美術館', movementIds: ['suprematism'], description: 'わずかに傾く白い正方形と地の色差だけで、対象、重力、輪郭の最小限を問う。',
    image: pd('White on White (Malevich, 1918).png', 'White on White', 'Kazimir Malevich', '1918', '青みを帯びた白地の上に、少し暖かい白い正方形が傾いて浮かぶ抽象画。'), sourceIds: ['commons-malevich-white', 'moma-suprematism'], verification: 'verified',
  },
  {
    id: 'work-malevich-suprematism', titleJa: 'シュプレマティスム絵画', titleOriginal: 'Suprematist Painting', creatorId: 'artist-kazimir-malevich', creatorName: 'カジミール・マレーヴィチ', year: '1915年頃', medium: '油彩、カンヴァス', collection: '各地所蔵', movementIds: ['suprematism'], description: '白地に黒い台形と赤い正方形を置き、形・色・方向の関係だけで緊張と運動を作る。',
    image: pd('Malevich-Suprematism.jpg', 'Suprematist Painting', 'Kazimir Malevich', 'ca. 1915', '白地に黒い台形と赤い正方形、小さな幾何学形が斜めに配置された抽象画。'), sourceIds: ['commons-malevich-suprematism', 'smarthistory-suprematism'], verification: 'verified',
  },
  {
    id: 'work-mondrian-composition', titleJa: '赤・青・黄のコンポジション', titleOriginal: 'Composition with Red, Blue and Yellow', creatorId: 'artist-piet-mondrian', creatorName: 'ピート・モンドリアン', year: '1930年頃', medium: '油彩、カンヴァス', collection: '各地所蔵', movementIds: ['de-stijl'], description: '黒い水平垂直線、白い区画、原色を非対称に釣り合わせ、新造形主義の普遍的関係を示す。', image: null, sourceIds: ['moma-de-stijl-catalogue', 'smarthistory-de-stijl'], verification: 'verified',
  },
  {
    id: 'work-doesburg-counter', titleJa: '反コンポジション XIII', titleOriginal: 'Counter-Composition XIII', creatorId: 'artist-theo-van-doesburg', creatorName: 'テオ・ファン・ドゥースブルフ', year: '1925〜1926年', medium: '油彩、カンヴァス', collection: 'ペギー・グッゲンハイム・コレクション', movementIds: ['de-stijl'], description: '対角線を導入し、デ・ステイルの水平垂直の均衡へ回転と時間的な緊張を加えた。',
    image: pd('Counter-Composition XIII by Theo van Doesburg.jpg', 'Counter-Composition XIII', 'Theo van Doesburg', '1925–26', '白地に赤、青、黄、黒の長方形が対角方向へ回転しながら重なる抽象画。'), sourceIds: ['commons-doesburg-counter', 'moma-de-stijl-catalogue'], verification: 'verified',
  },
  { id: 'work-tapies-grey-green', titleJa: '灰色と緑の絵画', titleOriginal: 'Grey and Green Painting', creatorId: 'artist-antoni-tapies', creatorName: 'アントニ・タピエス', year: '1957年', medium: '混合技法、カンヴァス', collection: 'Tate', movementIds: ['art-informel'], description: '砂や粉を含む厚い表面に擦過と記号を刻み、画面を壁や物質の痕跡として扱う。', image: null, sourceIds: ['guggenheim-art-informel', 'moma-tapies-informel'], verification: 'verified' },
  { id: 'work-fautrier-hostage', titleJa: '人質（シリーズ）', titleOriginal: 'Otages', creatorId: 'artist-jean-fautrier', creatorName: 'ジャン・フォートリエ', year: '1943〜1945年', medium: '紙に厚塗り、カンヴァス貼り', collection: '各地所蔵', movementIds: ['art-informel'], description: '盛り上がった淡い物質に顔の断片を残し、占領と暴力の記憶を直接描写せず触覚化した。', image: null, sourceIds: ['guggenheim-art-informel'], verification: 'single-source' },
  { id: 'work-ono-grapefruit', titleJa: 'グレープフルーツ', titleOriginal: 'Grapefruit', creatorId: 'artist-yoko-ono', creatorName: 'オノ・ヨーコ', year: '1964年', medium: 'アーティストブック、指示作品', collection: '各地所蔵', movementIds: ['fluxus'], description: '実行可能・不可能な短い指示を集め、作品を物体から想像と行為のスコアへ移した。', image: null, sourceIds: ['moma-fluxus', 'getty-fluxus'], verification: 'verified' },
  { id: 'work-maciunas-fluxkit', titleJa: 'フラックスキット', titleOriginal: 'Fluxkit', creatorId: 'artist-george-maciunas', creatorName: 'ジョージ・マチューナスほか', year: '1964〜1965年頃', medium: '箱、印刷物、オブジェ、複数作家', collection: '各地所蔵', movementIds: ['fluxus'], description: '小箱にゲーム、指示、物体を収め、安価な複数物として国際的に流通させた。', image: null, sourceIds: ['moma-fluxus', 'getty-fluxus'], verification: 'verified' },
  { id: 'work-merz-igloo', titleJa: 'イグルー（連作）', titleOriginal: 'Igloo', creatorId: 'artist-mario-merz', creatorName: 'マリオ・メルツ', year: '1968年以降', medium: '枝、石、金属、ガラス、ネオンほか', collection: '各地所蔵', movementIds: ['arte-povera'], description: '仮設住居の半球へ自然物と工業材、文字や数列を重ね、制度と生存の境界を問う。', image: null, sourceIds: ['moma-arte-povera', 'guggenheim-arte-povera'], verification: 'verified' },
  { id: 'work-kounellis-horses', titleJa: '無題（12頭の馬）', titleOriginal: 'Untitled (12 Horses)', creatorId: 'artist-jannis-kounellis', creatorName: 'ヤニス・クネリス', year: '1969年', medium: '生きた馬、ギャラリー空間', collection: 'ローマで初演', movementIds: ['arte-povera'], description: '12頭の生きた馬を画廊につなぎ、展示制度、労働、歴史、物質の現実を衝突させた。', image: null, sourceIds: ['moma-arte-povera', 'guggenheim-arte-povera'], verification: 'verified' },
  { id: 'work-smithson-spiral-jetty', titleJa: 'スパイラル・ジェティ', titleOriginal: 'Spiral Jetty', creatorId: 'artist-robert-smithson', creatorName: 'ロバート・スミッソン', year: '1970年', medium: '玄武岩、塩晶、土、水', collection: 'グレートソルト湖、ユタ州', movementIds: ['land-art'], description: '湖岸から渦巻く石と土の突堤が、水位、塩、時間によって現れ方を変える。', image: null, sourceIds: ['moma-earthwork', 'tate-land-art-expansion'], verification: 'verified' },
  { id: 'work-long-line-walking', titleJa: '歩行によって作られた線', titleOriginal: 'A Line Made by Walking', creatorId: 'artist-richard-long', creatorName: 'リチャード・ロング', year: '1967年', medium: '草地への歩行、写真', collection: 'Tate', movementIds: ['land-art'], description: '草地を往復して残した一本の線を写真化し、歩行・場所・一時性を彫刻の条件にした。', image: null, sourceIds: ['moma-earthwork', 'tate-land-art-expansion'], verification: 'verified' },
];
