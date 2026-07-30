import type { Relationship } from '@/lib/schema';

export const standardOneExpansionRelationships: Relationship[] = [
  {
    id: 'rel-greek-to-hellenistic',
    from: 'ancient-greek-classical',
    to: 'hellenistic-art',
    kind: 'succession',
    note: 'ヘレニズム美術は古典期の人体比例・コントラポスト・彫刻技術を中心的基盤として継承し、感情、年齢、運動、広域王国の主題へ展開した。',
    sourceIds: ['met-classical-greece', 'met-hellenistic-overview'],
  },
  {
    id: 'rel-hellenistic-to-roman',
    from: 'hellenistic-art',
    to: 'ancient-roman-art',
    kind: 'influence',
    note: 'ローマはヘレニズム期の作品・工房・劇的な身体表現を収集・複製・翻案した。ローマ美術全体をその直接後継とみなさない。',
    sourceIds: ['met-hellenistic-overview', 'smarthistory-roman-art-intro'],
  },
  {
    id: 'rel-chinese-landscape-to-literati',
    from: 'chinese-landscape-painting',
    to: 'literati-painting',
    kind: 'succession',
    note: '文人画は中国山水画の筆墨・巻物・自然観を継承し、詩書画と知識人の自己表現を中心的な評価軸へ発展させた。',
    sourceIds: ['met-chinese-landscape', 'met-literati-painting'],
  },
  {
    id: 'rel-chinese-landscape-to-japanese-ink',
    from: 'chinese-landscape-painting',
    to: 'japanese-ink-painting',
    kind: 'influence',
    note: '宋元の山水画、画論、筆墨は禅僧・交易・収集を通じ日本水墨画へ作用した。一本に直結する系譜ではなく、複数時代の選択的受容として扱う。',
    sourceIds: ['met-chinese-landscape', 'met-japanese-ink'],
  },
  {
    id: 'rel-yamato-to-rinpa',
    from: 'yamato-e',
    to: 'rinpa',
    kind: 'revival',
    note: '琳派は大和絵の古典文学、季節、色面、料紙装飾を後世に選択的に再評価し、金銀地と工芸横断の様式へ組み替えた。単純な直線的継承ではない。',
    sourceIds: ['met-yamato-e', 'met-rinpa-overview'],
  },
  {
    id: 'rel-arts-crafts-to-art-nouveau',
    from: 'arts-and-crafts',
    to: 'art-nouveau',
    kind: 'influence',
    note: 'アーツ・アンド・クラフツの生活芸術、工芸の再評価、統合的な室内という理念はアール・ヌーヴォーの一部へ作用したが、後者は都市広告と工業素材も積極的に用いた。',
    sourceIds: ['vam-arts-crafts-intro', 'vam-art-nouveau-intro'],
  },
];
