import type { Source } from '@/lib/schema';

const ACCESSED = '2026-08-30';

const museum = (
  id: string,
  title: string,
  publisher: string,
  url: string,
  supports: string,
): Source => ({
  id,
  title,
  publisher,
  url,
  accessed: ACCESSED,
  kind: 'museum',
  reliability: 'high',
  supports,
});

/**
 * Movement expansion phase 2 sources.
 * URLs point to museum, university, and research-institution pages. A single
 * source may support several closely related records; movement-level sourceIds
 * preserve the exact dependency rather than duplicating citations.
 */
export const phaseTwoExpansionSources: Source[] = [
  museum('smarthistory-modernisms-overview', 'Modernisms', 'Smarthistory', 'https://smarthistory.org/period-culture-style/modernisms/', '1900〜1980年の世界的なモダニズム、表現主義、オルフィスム、社会と前衛の概観'),
  museum('smarthistory-art-into-life', 'Art into life: anti-modernist gestures', 'Smarthistory', 'https://smarthistory.org/reframing-art-history/anti-modernist-gestures/', '1950〜60年代に作品と生活、行為、都市、共同性を再接続した国際的実践'),
  museum('smarthistory-reframing-art-history', 'Reframing Art History', 'Smarthistory', 'https://smarthistory.org/reframing-art-history/', 'ジェンダー、東アジア、近現代、制度を含む世界美術史の研究・教育概観'),
  museum('met-pre-raphaelite-legacy', 'The Pre-Raphaelite Legacy', 'The Metropolitan Museum of Art', 'https://www.metmuseum.org/exhibitions/listings/2014/preraphaelite-legacy', 'ラファエル前派兄弟団の結成、明るい色彩、精密描写、後世への展開'),
  museum('met-neo-impressionism', 'Georges Seurat (1859–1891) and Neo-Impressionism', 'The Metropolitan Museum of Art', 'https://www.metmuseum.org/essays/georges-seurat-1859-1891-and-neo-impressionism', '新印象派の成立、光学的色彩理論、フェリックス・フェネオンによる命名'),
  museum('moma-vienna-secession', 'Vienna Secession', 'The Museum of Modern Art', 'https://www.moma.org/calendar/galleries/5611', 'ウィーン分離派の成立、総合芸術、展覧会文化'),
  museum('moma-die-bruecke', 'Die Brücke (The Bridge)', 'The Museum of Modern Art', 'https://www.moma.org/collection/terms/die-brucke-the-bridge', 'ブリュッケの結成、作家、木版画と表現主義'),
  museum('smarthistory-blaue-reiter', 'Der Blaue Reiter', 'Smarthistory', 'https://smarthistory.org/der-blaue-reiter/', '青騎士の結成、名称、芸術観と主要作家'),
  museum('tate-orphism', 'Orphism', 'Tate', 'https://www.tate.org.uk/art/art-terms/o/orphism', 'オルフィスムの名称、色彩抽象、キュビスムとの関係'),
  museum('moma-socialist-realism', 'Aleksandr Rodchenko', 'The Museum of Modern Art', 'https://www.moma.org/collection/artists/4975', '1934年の社会主義リアリズム公式化とロシア前衛との対立'),
  museum('tate-cobra', 'CoBrA', 'Tate', 'https://www.tate.org.uk/art/art-terms/c/cobra', 'CoBrAの名称、活動時期、都市横断の作家集団'),
  museum('moma-nouveau-realisme', 'Division and Multiplication: Arman’s Multiples', 'The Museum of Modern Art', 'https://www.moma.org/explore/inside_out/2012/11/15/division-and-multiplication-armans-multiples/', '1960年のヌーヴォー・レアリスム宣言と日常物の使用'),
  museum('tate-performance-art', 'Performance Art', 'Tate', 'https://www.tate.org.uk/art/art-terms/p/performance-art', 'パフォーマンス・アートの定義、身体、時間、観客'),
  museum('tate-feminist-art', 'Feminist Art', 'Tate', 'https://www.tate.org.uk/art/art-terms/f/feminist-art', 'フェミニスト・アートの制度批判、身体、表象'),
  museum('moma-pictures-generation', 'Cindy Sherman', 'The Museum of Modern Art', 'https://www.moma.org/collection/artists/5392', 'ピクチャーズ・ジェネレーションの作家、マスメディア、アプロプリエーション'),
  museum('guggenheim-neo-expressionism', 'Art since 1945: Developments, Diversity, and Dialogue', 'Guggenheim Museum Bilbao', 'https://www.guggenheim.org/exhibition/art-since-1945-developments-diversity-and-dialogue', '1970年代末以降の新表現主義と戦後欧州美術'),
  museum('guggenheim-relational-aesthetics', 'Catalysts and Critics: The Art of the 1990s', 'Solomon R. Guggenheim Museum', 'https://web.guggenheim.org/exhibitions/education/tours_lectures.shtml', '1990年代美術と関係性の美学をめぐる批評的議論'),
  museum('met-nihonga-yoga', 'The Tale of Genji: A Japanese Classic Illuminated', 'The Metropolitan Museum of Art', 'https://resources.metmuseum.org/resources/metpublications/pdf/The_Tale_of_Genji_A_Japanese_Classic_Illuminated.pdf', '明治期に成立した日本画という近代的分類と洋画との制度的対置'),
  museum('moma-tokyo-avant-garde', 'Tokyo 1955–1970: A New Avant-Garde', 'The Museum of Modern Art', 'https://www.moma.org/calendar/exhibitions/1225', '実験工房、ネオ・ダダ、ハイレッド・センターを含む戦後東京前衛'),
  museum('moma-jikken-kobo', 'APN Portfolios and Jikken Kōbō', 'post at MoMA', 'https://post.moma.org/apn-portfolios-and-jikken-kobo/', '実験工房の複合芸術、技術、国際交流'),
  museum('moma-mavo', 'Tokyo 1955–1970 Catalogue Preview', 'The Museum of Modern Art', 'https://www.moma.org/docs/publication_pdf/3166/Tokyo_PREVIEW.pdf', 'MAVOから戦後東京前衛へ至る日本前衛史の文脈'),
  museum('guggenheim-korean-experimental', 'Only the Young: Experimental Art in Korea, 1960s–1970s', 'Solomon R. Guggenheim Museum', 'https://www.guggenheim.org/exhibition/only-the-young-experimental-art-in-korea-1960s-1970s', '韓国実験美術と単色画周辺の制度・世代的文脈'),
  museum('met-korean-lineages', 'Lineages: Korean Art at The Met', 'The Metropolitan Museum of Art', 'https://www.metmuseum.org/exhibitions/lineages-korean-art-at-the-met', '韓国近現代美術を歴史的連続と断絶から捉える文脈'),
  museum('guggenheim-china-1989', 'Art and China after 1989: Theater of the World', 'Solomon R. Guggenheim Museum', 'https://www.guggenheim.org/exhibition/art-and-china-after-1989-theater-of-the-world', '85新潮以後の中国現代美術、政治・社会・国際化'),
  museum('met-caravaggio-followers', 'Caravaggio and His Followers', 'The Metropolitan Museum of Art', 'https://www.metmuseum.org/essays/caravaggio-and-his-followers', 'カラヴァッジョと追随者、明暗法、国際的伝播'),
  museum('tate-pre-raphaelite', 'Pre-Raphaelite', 'Tate', 'https://www.tate.org.uk/art/art-terms/p/pre-raphaelite', 'ラファエル前派兄弟団の成立、名称、中世主義と自然観察'),
  museum('met-hudson-river-school', 'The Hudson River School', 'The Metropolitan Museum of Art', 'https://www.metmuseum.org/essays/the-hudson-river-school', 'ハドソン・リバー派の成立、風景画、国家・自然観'),
  museum('met-barbizon-school', 'The Barbizon School', 'The Metropolitan Museum of Art', 'https://www.metmuseum.org/art/collection/search/11253', 'バルビゾン派の風景観と米国風景画への影響'),
  museum('tate-appropriation', 'Appropriation', 'Tate', 'https://www.tate.org.uk/art/art-terms/a/appropriation', 'アプロプリエーションの方法、作者性、既存イメージの再文脈化'),
  museum('tate-institutional-critique', 'Institutional Critique', 'Tate', 'https://www.tate.org.uk/art/art-terms/i/institutional-critique', '美術館・市場・展示制度を対象化する実践'),
  museum('tate-yba', 'Young British Artists (YBAs)', 'Tate', 'https://www.tate.org.uk/art/art-terms/y/young-british-artists-ybas', 'YBAの名称、作家、展覧会と市場の文脈'),
  museum('tate-internet-art', 'Internet Art', 'Tate', 'https://www.tate.org.uk/art/art-terms/i/internet-art', 'ネット・アートの媒体、流通、参加性'),
  museum('moma-leeufan', 'Lee Ufan', 'The Museum of Modern Art', 'https://www.moma.org/artists/3455', '東アジアの戦後抽象と物質・行為をめぐる文脈'),
  museum('moma-yoko-ono-fluxus', 'Fluxus Nexus: Fluxus in New York and Japan', 'post at MoMA', 'https://post.moma.org/fluxus-nexus-fluxus-in-new-york-and-japan/', '日本前衛と国際的な行為・イベントのネットワーク'),
];
