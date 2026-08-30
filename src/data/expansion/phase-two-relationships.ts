import type { Relationship } from '@/lib/schema';

const rel = (
  id: string,
  from: string,
  to: string,
  kind: Relationship['kind'],
  note: string,
  sourceIds: string[],
): Relationship => ({ id, from, to, kind, note, sourceIds });

/**
 * Phase 2 adds only relations needed to reconnect newly filled gaps. Parallel
 * or shared-idea edges are preferred where a direct line of influence is not
 * established by the cited institutional source.
 */
export const phaseTwoExpansionRelationships: Relationship[] = [
  rel('rel-impressionism-to-neo-impressionism', 'impressionism', 'neo-impressionism', 'succession', '印象派の光と現代生活への関心を継ぎつつ、筆触と色彩を理論的な分割へ組み替えた。', ['met-neo-impressionism']),
  rel('rel-neo-impressionism-to-fauvism', 'neo-impressionism', 'fauvism', 'influence', '新印象派の補色と未混色の筆触は、フォーヴィスムが色を自律化する重要な参照となった。', ['met-neo-impressionism']),
  rel('rel-neo-impressionism-to-orphism', 'neo-impressionism', 'orphism', 'influence', '色彩対比の理論は、オルフィスムが光と色を非対象的なリズムへ変える基盤の一つとなった。', ['met-neo-impressionism', 'tate-orphism']),
  rel('rel-cubism-to-orphism', 'cubism', 'orphism', 'succession', 'オルフィスムはキュビスムの分割構造を継承し、抑えた色調を純色と同時対比へ転換した。', ['tate-orphism']),
  rel('rel-arts-crafts-to-vienna-secession', 'arts-and-crafts', 'vienna-secession', 'influence', '工芸と生活空間を統合する理念は、分離派の総合芸術と展示設計へ受容された。', ['moma-vienna-secession']),
  rel('rel-art-nouveau-vienna-contemporary', 'art-nouveau', 'vienna-secession', 'contemporary', '両者は装飾・建築・工芸を横断したが、分離派はウィーン固有の制度と幾何学化を展開した。', ['moma-vienna-secession']),
  rel('rel-symbolism-to-vienna-secession', 'symbolism', 'vienna-secession', 'influence', '象徴主義の寓意と心理的主題は、クリムトらの人物像と総合芸術へ作用した。', ['moma-vienna-secession']),
  rel('rel-expressionism-to-die-bruecke', 'expressionism', 'die-bruecke', 'regional-variant', 'ブリュッケはドイツ表現主義の集団的な核の一つで、木版と都市の身体を独自に強めた。', ['moma-die-bruecke']),
  rel('rel-expressionism-to-blaue-reiter', 'expressionism', 'der-blaue-reiter', 'regional-variant', '青騎士は表現主義の色と主観を、精神性・音楽・抽象へ展開したミュンヘンの経路である。', ['smarthistory-blaue-reiter']),
  rel('rel-die-bruecke-blaue-reiter-contemporary', 'die-bruecke', 'der-blaue-reiter', 'contemporary', '二集団は同時代のドイツ語圏で活動したが、共同組織ではなく、都市・身体と精神・抽象に異なる重心を持つ。', ['moma-die-bruecke', 'smarthistory-blaue-reiter']),
  rel('rel-russian-constructivism-to-socialist-realism', 'russian-constructivism', 'socialist-realism', 'reaction', '社会主義リアリズムの公式化は、構成主義を含む前衛の抽象・生産芸術を制度的に退ける転換となった。', ['moma-socialist-realism']),
  rel('rel-expressionism-to-cobra', 'expressionism', 'cobra', 'revival', 'CoBrAは表現主義的な線と色を、戦後の共同制作・民衆芸術・即興へ再展開した。', ['tate-cobra']),
  rel('rel-art-informel-cobra-contemporary', 'art-informel', 'cobra', 'contemporary', '戦後欧州で物質と身振りを重視した並行的な展開だが、CoBrAは共同体と具象的生物像をより強く保った。', ['tate-cobra', 'guggenheim-neo-expressionism']),
  rel('rel-dada-to-nouveau-realisme', 'dada', 'nouveau-realisme', 'influence', 'レディメイドと日常物の転用は、都市の廃棄物・広告・商品を直接取り込む方法へ継承された。', ['moma-nouveau-realisme']),
  rel('rel-nouveau-realisme-pop-contemporary', 'nouveau-realisme', 'pop-art', 'contemporary', '欧州と米英で消費社会を扱った同時代の動向だが、物体の直接使用とイメージの反復に異なる重心がある。', ['moma-nouveau-realisme']),
  rel('rel-fluxus-to-performance-art', 'fluxus', 'performance-art', 'influence', 'フルクサスのイベント、指示書、日常行為は、パフォーマンスを物体に依存しない媒体として広げた。', ['tate-performance-art', 'moma-yoko-ono-fluxus']),
  rel('rel-performance-feminist-contemporary', 'performance-art', 'feminist-art', 'contemporary', 'フェミニスト作家は同時代のパフォーマンスを用い、身体の表象と制度的権力を具体的に批判した。', ['tate-performance-art', 'tate-feminist-art']),
  rel('rel-pop-to-pictures-generation', 'pop-art', 'pictures-generation', 'succession', '大衆メディアを題材にするポップの方法を継ぎつつ、ピクチャーズ世代は表象と作者性の批判へ重心を移した。', ['moma-pictures-generation']),
  rel('rel-feminist-to-pictures-generation', 'feminist-art', 'pictures-generation', 'influence', 'ジェンダー化された視線への批判は、演出写真とアプロプリエーションの分析を支えた。', ['moma-pictures-generation', 'tate-feminist-art']),
  rel('rel-pictures-to-appropriation', 'pictures-generation', 'appropriation-art', 'succession', 'ピクチャーズ世代の再撮影・引用は、アプロプリエーションを作者性と所有の広い方法論へ定着させた。', ['moma-pictures-generation', 'tate-appropriation']),
  rel('rel-minimalism-to-neo-expressionism', 'minimalism', 'neo-expressionism', 'reaction', '新表現主義はミニマリズムの匿名的な幾何学と抑制に対し、人物・歴史・身振りを大画面へ戻した。', ['guggenheim-neo-expressionism']),
  rel('rel-conceptual-to-neo-expressionism', 'conceptual-art', 'neo-expressionism', 'reaction', '新表現主義はコンセプチュアルの非物質性に対する絵画回帰として語られたが、単純な終焉ではなく並存した。', ['guggenheim-neo-expressionism']),
  rel('rel-fluxus-to-relational-aesthetics', 'fluxus', 'relational-aesthetics', 'influence', 'イベントと参加の日常化は、交流の状況を作品とみなす1990年代の実践へ重要な先例を与えた。', ['guggenheim-relational-aesthetics', 'moma-yoko-ono-fluxus']),
  rel('rel-performance-to-relational-aesthetics', 'performance-art', 'relational-aesthetics', 'influence', '作品を時間的な出来事として成立させる考えが、参加者同士の関係を設計する実践へ接続した。', ['guggenheim-relational-aesthetics', 'tate-performance-art']),
  rel('rel-nihonga-yoga-contemporary', 'nihonga', 'yoga', 'contemporary', '日本画と洋画は明治期の制度が作った対概念であり、競合しながら技法・教育・展覧会を相互に参照した。', ['met-nihonga-yoga']),
  rel('rel-impressionism-to-yoga', 'impressionism', 'yoga', 'influence', 'フランスで学んだ外光表現は日本の洋画教育へ受容されたが、日本の風景・制度の中で翻案された。', ['met-nihonga-yoga']),
  rel('rel-dada-to-mavo', 'dada', 'mavo', 'influence', 'MAVOはダダを含む欧州前衛を受容したが、震災後東京の街路・演劇・出版へ独自に組み替えた。', ['moma-mavo']),
  rel('rel-russian-constructivism-to-mavo', 'russian-constructivism', 'mavo', 'influence', '構成主義の幾何学と媒体横断はMAVOの参照点となったが、直接の組織的継承ではない。', ['moma-mavo']),
  rel('rel-bauhaus-to-jikken-kobo', 'bauhaus', 'jikken-kobo', 'theoretical', 'ジャンル横断の工房、技術、総合芸術という理念を共有するが、実験工房は戦後東京の音楽・電子技術へ独自に展開した。', ['moma-jikken-kobo']),
  rel('rel-jikken-to-neo-dada-contemporary', 'jikken-kobo', 'neo-dada-organizers', 'contemporary', '戦後東京の前衛として時期は接するが、技術的総合と反芸術的事件という異なる方向を持つ。', ['moma-tokyo-avant-garde']),
  rel('rel-neo-dada-to-hi-red-center', 'neo-dada-organizers', 'hi-red-center', 'succession', 'ネオ・ダダ周辺の作家・反芸術的行為は、ハイレッド・センターの都市イベントへ人的・方法的に接続した。', ['moma-tokyo-avant-garde']),
  rel('rel-fluxus-hi-red-contemporary', 'fluxus', 'hi-red-center', 'contemporary', '同時代に日常行為とイベントを用いたが、直接の従属関係ではなく、東京と国際ネットワークの並行比較として扱う。', ['moma-yoko-ono-fluxus', 'moma-tokyo-avant-garde']),
  rel('rel-art-informel-dansaekhwa-parallel', 'art-informel', 'dansaekhwa', 'contemporary', '物質と身振りへの関心を共有するが、単色画を欧州アンフォルメルの派生と断定せず、韓国の制度と身体性を含む並行比較とする。', ['guggenheim-korean-experimental', 'guggenheim-neo-expressionism']),
  rel('rel-dansaekhwa-minjung-reaction', 'dansaekhwa', 'minjung-art', 'reaction', '民衆美術は形式主義的モダニズムへの批判を強めたが、単色画全体を単純な対立項へ還元しない。', ['met-korean-lineages']),
  rel('rel-socialist-realism-to-china-85-reaction', 'socialist-realism', 'china-85-new-wave', 'reaction', '85新潮は公式美術の単一性から離れ、多様な思想・媒体・地域集団を実験した。', ['guggenheim-china-1989']),
  rel('rel-baroque-to-caravaggisti', 'baroque', 'caravaggisti', 'regional-variant', 'カラヴァッジェスキはバロックの国際的展開の一つとして、明暗と写実をローマから各地域へ翻案した。', ['met-caravaggio-followers']),
  rel('rel-pre-raphaelite-to-arts-crafts', 'pre-raphaelite-brotherhood', 'arts-and-crafts', 'influence', '中世主義、自然観察、芸術と生活の統合は、モリスらのアーツ・アンド・クラフツへ受け継がれた。', ['tate-pre-raphaelite']),
  rel('rel-barbizon-to-realism', 'barbizon-school', 'realism', 'contemporary', '農村と身近な自然を理想化せず描く姿勢は、同時代の写実主義と交差した。', ['met-barbizon-school']),
  rel('rel-barbizon-to-impressionism', 'barbizon-school', 'impressionism', 'influence', '野外での観察と近郊の風景は印象派の制作条件を準備したが、完成方法と光の分析は異なる。', ['met-barbizon-school']),
  rel('rel-hudson-barbizon-contemporary', 'hudson-river-school', 'barbizon-school', 'contemporary', '大西洋両岸の風景画は同時代に展開し、後期の米国画家はバルビゾン派の親密な自然観も受容した。', ['met-hudson-river-school', 'met-barbizon-school']),
  rel('rel-conceptual-to-institutional-critique', 'conceptual-art', 'institutional-critique', 'succession', '言語・資料・制度を作品化するコンセプチュアルの方法が、美術館と市場の具体的調査へ展開した。', ['tate-institutional-critique']),
  rel('rel-institutional-to-yba-reaction', 'institutional-critique', 'young-british-artists', 'contemporary', '制度と市場を扱う点は共有するが、YBAは制度外批判だけでなく市場・メディアを積極的に利用した。', ['tate-institutional-critique', 'tate-yba']),
  rel('rel-appropriation-to-net-art', 'appropriation-art', 'net-art', 'influence', '複製・引用・作者性の問題は、ネット上のリンク、コピー、再配布へ新しい条件で引き継がれた。', ['tate-appropriation', 'tate-internet-art']),
];
