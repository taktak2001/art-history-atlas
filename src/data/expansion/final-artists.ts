import type { Artist } from '@/lib/schema';

type ArtistSeed = Omit<Artist, 'keyWorkIds' | 'verification'> & {
  keyWorkIds?: string[];
  verification?: Artist['verification'];
};
const artist = (seed: ArtistSeed): Artist => ({
  keyWorkIds: [],
  verification: 'verified',
  ...seed,
});

export const finalExpansionArtists: Artist[] = [
  artist({ id: 'artist-henri-matisse', nameJa: 'アンリ・マティス', nameOriginal: 'Henri Matisse', born: 1869, died: 1954, regionIds: ['france'], country: 'フランス', movementIds: ['fauvism'], bio: '再現色から色彩を解放し、平面・輪郭・装飾を長い制作活動で探究した。', keyWorkIds: ['work-matisse-green-line'], sourceIds: ['met-fauvism', 'smarthistory-fauvism'] }),
  artist({ id: 'artist-andre-derain', nameJa: 'アンドレ・ドラン', nameOriginal: 'André Derain', born: 1880, died: 1954, regionIds: ['france', 'britain'], country: 'フランス', movementIds: ['fauvism'], bio: 'コリウールとロンドンで高彩度の色面と分割された筆触による風景を展開した。', keyWorkIds: ['work-derain-charing-cross'], sourceIds: ['met-fauvism', 'smarthistory-fauvism'] }),
  artist({ id: 'artist-el-lissitzky', nameJa: 'エル・リシツキー', nameOriginal: 'El Lissitzky', born: 1890, died: 1941, regionIds: ['other', 'germany'], country: 'ロシア／ソビエト連邦', movementIds: ['russian-constructivism', 'suprematism'], bio: '幾何学的抽象を建築、展示、印刷、プロパガンダへ展開した。', keyWorkIds: ['work-lissitzky-red-wedge'], sourceIds: ['moma-constructivism', 'smarthistory-constructivism'] }),
  artist({ id: 'artist-lyubov-popova', nameJa: 'リュボーフィ・ポポワ', nameOriginal: 'Lyubov Popova', born: 1889, died: 1924, regionIds: ['other'], country: 'ロシア／ソビエト連邦', movementIds: ['russian-constructivism'], bio: '絵画的構成から舞台、織物、生産芸術へ活動を移し、抽象を社会的制作へ接続した。', keyWorkIds: ['work-popova-architectonic'], sourceIds: ['moma-constructivism', 'smarthistory-constructivism'] }),
  artist({ id: 'artist-kazimir-malevich', nameJa: 'カジミール・マレーヴィチ', nameOriginal: 'Kazimir Malevich', born: 1879, died: 1935, regionIds: ['other'], country: 'ロシア／ソビエト連邦', movementIds: ['suprematism'], bio: '対象描写を離れた幾何学形態と白い場によって「純粋感覚」の抽象を理論化した。', keyWorkIds: ['work-malevich-white', 'work-malevich-suprematism'], sourceIds: ['moma-suprematism', 'smarthistory-suprematism'] }),
  artist({ id: 'artist-piet-mondrian', nameJa: 'ピート・モンドリアン', nameOriginal: 'Piet Mondrian', born: 1872, died: 1944, regionIds: ['netherlands', 'france', 'america'], country: 'オランダ', movementIds: ['de-stijl'], bio: '水平垂直、原色、白黒へ絵画を還元し、新造形主義を形成した。', keyWorkIds: ['work-mondrian-composition'], sourceIds: ['moma-de-stijl-catalogue', 'smarthistory-de-stijl'] }),
  artist({ id: 'artist-theo-van-doesburg', nameJa: 'テオ・ファン・ドゥースブルフ', nameOriginal: 'Theo van Doesburg', born: 1883, died: 1931, regionIds: ['netherlands', 'pan-european'], country: 'オランダ', movementIds: ['de-stijl'], bio: '雑誌『デ・ステイル』を創刊し、絵画・建築・タイポグラフィの国際的ネットワークを作った。', keyWorkIds: ['work-doesburg-counter'], sourceIds: ['moma-de-stijl-catalogue', 'smarthistory-de-stijl'] }),
  artist({ id: 'artist-antoni-tapies', nameJa: 'アントニ・タピエス', nameOriginal: 'Antoni Tàpies', born: 1923, died: 2012, regionIds: ['spain'], country: 'スペイン', movementIds: ['art-informel'], bio: '砂、粉、傷、記号を厚い画面へ組み込み、戦後の物質絵画を展開した。', sourceIds: ['guggenheim-art-informel', 'moma-tapies-informel'] }),
  artist({ id: 'artist-jean-fautrier', nameJa: 'ジャン・フォートリエ', nameOriginal: 'Jean Fautrier', born: 1898, died: 1964, regionIds: ['france'], country: 'フランス', movementIds: ['art-informel'], bio: '厚い絵肌と断片的な像で戦争期の身体と記憶を表した。', sourceIds: ['guggenheim-art-informel', 'moma-tapies-informel'] }),
  artist({ id: 'artist-george-maciunas', nameJa: 'ジョージ・マチューナス', nameOriginal: 'George Maciunas', born: 1931, died: 1978, regionIds: ['america', 'global'], country: 'リトアニア／アメリカ', movementIds: ['fluxus'], bio: '名称、出版、フェスティバル、Fluxkitを通じ流動的な国際ネットワークを組織した。', sourceIds: ['moma-fluxus', 'getty-fluxus'] }),
  artist({ id: 'artist-yoko-ono', nameJa: 'オノ・ヨーコ', nameOriginal: 'Yoko Ono', born: 1933, died: null, regionIds: ['japan', 'america', 'global'], country: '日本／アメリカ', movementIds: ['fluxus'], bio: '言語による指示、観客参加、音、行為によって作品を物体から出来事へ開いた。', sourceIds: ['moma-fluxus', 'getty-fluxus'] }),
  artist({ id: 'artist-mario-merz', nameJa: 'マリオ・メルツ', nameOriginal: 'Mario Merz', born: 1925, died: 2003, regionIds: ['italy'], country: 'イタリア', movementIds: ['arte-povera'], bio: '枝、石、ガラス、ネオン、イグルーを通じ自然と工業、仮設性を接続した。', sourceIds: ['moma-arte-povera', 'guggenheim-arte-povera'] }),
  artist({ id: 'artist-jannis-kounellis', nameJa: 'ヤニス・クネリス', nameOriginal: 'Jannis Kounellis', born: 1936, died: 2017, regionIds: ['italy'], country: 'ギリシア／イタリア', movementIds: ['arte-povera'], bio: '石炭、鉄、袋、火、生きた動物を展示空間へ導入し、物質と歴史を対峙させた。', sourceIds: ['moma-arte-povera', 'guggenheim-arte-povera'] }),
  artist({ id: 'artist-robert-smithson', nameJa: 'ロバート・スミッソン', nameOriginal: 'Robert Smithson', born: 1938, died: 1973, regionIds: ['america'], country: 'アメリカ', movementIds: ['land-art'], bio: '場所と非場所、地質学的時間、エントロピーを彫刻・写真・文章で探究した。', sourceIds: ['moma-earthwork', 'tate-land-art-expansion'] }),
  artist({ id: 'artist-richard-long', nameJa: 'リチャード・ロング', nameOriginal: 'Richard Long', born: 1945, died: null, regionIds: ['britain', 'global'], country: 'イギリス', movementIds: ['land-art'], bio: '歩行、線、石の配置、写真とテキストで風景への一時的介入を作品化した。', sourceIds: ['moma-earthwork', 'tate-land-art-expansion'] }),
];
