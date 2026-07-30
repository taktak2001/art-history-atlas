import type { Source } from '@/lib/schema';

const accessed = '2026-07-30';
const source = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  supports: string,
  kind: Source['kind'] = 'museum',
): Source => ({ id, title, publisher, url, accessed, kind, reliability: 'high', supports });

export const finalExpansionSources: Source[] = [
  source('met-fauvism', 'Fauvism', 'The Metropolitan Museum of Art', 'https://www.metmuseum.org/essays/fauvism', 'フォーヴィスムの1905年サロン、色彩、筆触、主要作家'),
  source('smarthistory-fauvism', 'Fauvism, an introduction', 'Smarthistory', 'https://smarthistory.org/a-beginners-guide-to-fauvism/', 'フォーヴィスムの年代、表現、象徴主義との対比', 'university'),
  source('moma-constructivism', 'Constructivism', 'The Museum of Modern Art', 'https://www.moma.org/collection/terms/constructivism', 'ロシア構成主義の革命後の社会的役割、素材、制作'),
  source('smarthistory-constructivism', 'Constructivism, Part I', 'Smarthistory', 'https://smarthistory.org/constructivism-part-i/', '構成主義の制度、合理的構成、空間制作', 'university'),
  source('moma-suprematism', 'Suprematism', 'The Museum of Modern Art', 'https://www.moma.org/collection/terms/suprematism', 'シュプレマティスムの定義、マレーヴィチ、代表作品'),
  source('smarthistory-suprematism', 'Suprematism', 'Smarthistory', 'https://smarthistory.org/period-culture-style/modernisms/suprematism/', '純粋抽象、感覚、年代、ロシア前衛', 'university'),
  source('moma-de-stijl-catalogue', 'De Stijl, 1917–1928', 'The Museum of Modern Art', 'https://www.moma.org/documents/moma_catalogue_1798_300159061.pdf', 'デ・ステイルの雑誌、絵画、建築、デザイン'),
  source('smarthistory-de-stijl', 'De Stijl, Part I: Total Purity', 'Smarthistory', 'https://smarthistory.org/de-stijl-part-i-total-purity/', '水平垂直、原色、普遍性、神智学', 'university'),
  source('guggenheim-art-informel', 'Art of Another Kind: International Abstraction, 1949–1960', 'Solomon R. Guggenheim Museum', 'https://www.guggenheim.org/exhibition/art-of-another-kind-international-abstraction-and-the-guggenheim-1949-1960', 'アンフォルメルの反幾何学、物質、国際的広がり'),
  source('moma-tapies-informel', 'Antoni Tàpies, Anular', 'The Museum of Modern Art', 'https://www.moma.org/collection/works/12462', 'アンフォルメルと物質絵画、タピエスの素材'),
  source('moma-fluxus', 'Fluxus', 'The Museum of Modern Art', 'https://www.moma.org/collection/terms/fluxus', 'フルクサスの作家、イベント、複数媒体、代表作品'),
  source('getty-fluxus', 'What Is Fluxus?', 'Getty Research Institute', 'https://www.getty.edu/news/what-is-fluxus/', 'フルクサスの反芸術、日常、流動的ネットワーク', 'archive'),
  source('moma-arte-povera', 'Arte Povera', 'The Museum of Modern Art', 'https://www.moma.org/collection/terms/arte-povera', 'アルテ・ポーヴェラの命名、素材、制度批判'),
  source('guggenheim-arte-povera', 'Recent European Art', 'Solomon R. Guggenheim Museum', 'https://www.guggenheim.org/exhibition/recent-european-art', 'アルテ・ポーヴェラの自然物・工業材・日常素材'),
  source('moma-earthwork', 'Earthwork', 'The Museum of Modern Art', 'https://www.moma.org/collection/terms/earthwork', 'ランド・アート／アースワークの定義、場所、自然素材'),
  source('tate-land-art-expansion', 'Land Art', 'Tate', 'https://www.tate.org.uk/art/art-terms/l/land-art', '自然素材、場所、ギャラリー外の制作'),
  ...[
    ['commons-matisse-green', 'Matisse - Green Line.jpeg'],
    ['commons-derain-charing', 'Derain CharingCrossBridge.png'],
    ['commons-lissitzky-red-wedge', 'Beat the Whites with the Red Wedge.jpg'],
    ['commons-popova-architectonic', 'Painterly Architectonic - Lyubov Popova.jpg'],
    ['commons-malevich-white', 'White on White (Malevich, 1918).png'],
    ['commons-malevich-suprematism', 'Malevich-Suprematism.jpg'],
    ['commons-doesburg-counter', 'Counter-Composition XIII by Theo van Doesburg.jpg'],
  ].map(([id, file]) =>
    source(
      id,
      file,
      'Wikimedia Commons — verified file page',
      `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,
      '作品・作者・年代・原寸画像・パブリックドメイン表示',
      'archive',
    ),
  ),
];
