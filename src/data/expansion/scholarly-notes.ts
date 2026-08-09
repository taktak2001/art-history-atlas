import type { Movement, ScholarlyNote } from '@/lib/schema';

/**
 * 研究上の留保（注意書き）。
 *
 * 方針:
 * - 見出しは内容を示す具体的なものにする（一律の「学説上の注意」にしない）。
 * - 本文は「よくある理解 → どこが正確でないか → どう捉えるのが適切か」が読み取れる形にする。
 * - 専門語（私淑・遡及的・事後的な括り等）は、同じ文か直後で言い換える。
 * - 既存の `dates.note` と各項目の分類（classification）が示す範囲を超える主張は足さない。
 *   年代の範囲説明にとどまるものは `dates.note` のまま「年代の扱い」として表示する。
 * - `sourceIds` は当該ムーブメントに既に紐づく出典のみを参照する。
 */
const notes: Record<string, ScholarlyNote> = {
  /* --- A. 名称・後世の分類 ------------------------------------------ */
  'post-impressionism': {
    heading: '名称について',
    body: 'ポスト印象派は、作家たちが共通の綱領を掲げて結成した運動と理解されることがあるが、そうした組織や宣言はない。印象派の後に現れた個別の探究を、後世の批評がまとめた呼び名として捉える方が適切である。',
    sourceIds: ['tate-post-impressionism', 'met-post-impressionism'],
  },
  postminimalism: {
    heading: '名称について',
    body: 'ポストミニマリズムは、当時の作家が自称した運動名ではない。ミニマリズム以後の多様な制作を、批評家が後からまとめた呼び名である。統一した綱領を持つ集団としては捉えない。',
    sourceIds: ['tate-process-art', 'moma-postminimalism'],
  },
  'art-informel': {
    heading: '名称について',
    body: 'アンフォルメルは、参加者が共有した正式な運動名ではない。戦後ヨーロッパに現れた幾何学的でない抽象を、批評の側からまとめた用語である。作風は作家ごとに大きく異なる。',
    sourceIds: ['guggenheim-art-informel', 'moma-tapies-informel'],
  },
  superflat: {
    heading: '名称について',
    body: 'スーパーフラットは、時代様式の名称ではなく、村上隆が2000年に提唱した理論・枠組みである。同時期の日本美術全体を指す区分としては用いない。',
    sourceIds: ['gugg-murakami'],
  },

  /* --- B. 系譜・継承 -------------------------------------------------- */
  rinpa: {
    heading: '系譜について',
    body: '琳派は、師弟関係や工房組織が続いた流派と理解されることがあるが、そうした連続はない。時代を隔てた作家が過去の作品を手本として学び（私淑）、模倣と再解釈を重ねたことで結ばれた系譜である。',
    sourceIds: ['met-rinpa-overview', 'smarthistory-korin-plums'],
  },
  'yamato-e': {
    heading: '作者の帰属について',
    body: 'やまと絵の代表作には、特定の絵師の作と断定できるものが少ない。作者名が伝わる場合も後世の伝承によることがあり、帰属には諸説がある。作品は個人の様式より、制作の場と主題の系譜として捉える方が適切である。',
    sourceIds: ['met-yamato-e', 'smarthistory-genji-scroll'],
  },

  /* --- F. 運動としてのまとまり --------------------------------------- */
  'mono-ha': {
    heading: '運動としてのまとまり',
    body: 'もの派は、宣言や正式な組織を持つ集団ではない。近い時期に素材・場所・知覚をめぐる問題を共有した作家たちを、後世からまとめて呼んだ名称である。全員が同じ理念を掲げていたわけではない。',
    sourceIds: ['gugg-lee-ufan', 'smarthistory-showa'],
  },
  fluxus: {
    heading: '参加の範囲について',
    body: 'フルクサスは、固定した会員名簿を持つ団体ではない。関わり方も時期も作家ごとに異なり、誰を含めるかは資料によって幅がある。境界の定まった集団としては捉えない。',
    sourceIds: ['moma-fluxus', 'getty-fluxus'],
  },
  fauvism: {
    heading: '運動としてのまとまり',
    body: 'フォーヴィスムは、綱領や組織を持つ運動ではなく、1905年前後の短期間に緩やかに集まった作家たちの呼称である。参加者はその後それぞれ別の方向へ進んだ。',
    sourceIds: [],
  },

  /* --- C. 影響関係 ---------------------------------------------------- */
  'arte-povera': {
    heading: '影響関係について',
    body: 'アルテ・ポーヴェラともの派は、素材や場所を重視する点で似ているが、一方が他方へ直接影響したことを示す資料は限られる。異なる地域で並行して生じた展開として比較する方が適切である。',
    sourceIds: ['moma-arte-povera', 'guggenheim-arte-povera'],
  },
  'immersive-digital': {
    heading: '系譜の広がりについて',
    body: '没入型のデジタル作品は2000年代に始まったものと理解されることがあるが、観客を包む環境を作る試みは20世紀の環境芸術まで遡る。本項目はteamLab結成以降を中心に扱い、それ以前の系譜と切り離さない。',
    sourceIds: ['teamlab-tokyo', 'teamlab-body-immersive'],
  },

  /* --- E. 地域・文化圏 ------------------------------------------------ */
  'islamic-art': {
    heading: '地域区分について',
    body: 'イスラーム美術は、単一の様式や一つの地域を指す言葉ではない。7世紀以降の広い地域と複数の王朝・言語圏にまたがる建築・工芸・書物芸術を比較するための整理であり、宗教だけで説明できるものでもない。',
    sourceIds: ['met-nature-islamic-art', 'british-museum-islamic-gallery'],
  },
  'mesopotamian-art': {
    heading: '地域区分について',
    body: 'メソポタミア美術は一つの均質な様式ではない。シュメール・アッカド・アッシリアなど、時代も担い手も異なる文化を含む総称であり、それぞれの差異をならして理解しない。',
    sourceIds: ['met-mesopotamia-overview', 'smarthistory-mesopotamia-intro'],
  },
  'ancient-roman-art': {
    heading: '地域区分について',
    body: '古代ローマ美術は、首都の作例だけで代表されるものではない。共和政後期から帝政後期までの長い期間と、東西の属州を含む地域差の大きい総称として捉える。',
    sourceIds: [],
  },
  'chinese-landscape-painting': {
    heading: '内部の差異について',
    body: '中国山水画は一つの連続した流派ではない。宮廷の絵師、職業画家、文人が、それぞれ異なる目的と評価基準のもとで制作しており、これらを同一視しない。',
    sourceIds: ['met-chinese-landscape', 'smithsonian-guests-hills'],
  },
  'literati-painting': {
    heading: '担い手について',
    body: '文人画は、様式の名称であると同時に、制作者の立場と価値観に関わる区分である。時代・地域・身分によって実態は異なり、単一の画風としては捉えない。',
    sourceIds: ['met-literati-painting', 'smithsonian-yuan-painting'],
  },
  'ukiyo-e': {
    heading: '制作の担い手について',
    body: '浮世絵は絵師ひとりの作品と理解されることがあるが、版元・絵師・彫師・摺師の分業で成り立つ。上方と江戸でも展開が異なり、一様の様式としては捉えない。',
    sourceIds: ['met-japonisme', 'british-museum-ukiyoe-technique'],
  },
  expressionism: {
    heading: '収録範囲について',
    body: '本項目は主にドイツ語圏のブリュッケと青騎士を扱う。より広い意味の表現主義は、これより長い時期と広い地域を含むため、ここでの範囲がその全体を代表するわけではない。',
    sourceIds: ['moma-expressionism', 'smarthistory-expressionism-intro'],
  },
  'japanese-ink-painting': {
    heading: '収録範囲について',
    body: '本項目は禅寺を中心とした室町期の水墨画を主に扱う。日本の水墨表現はこの時期に限られないため、ここでの範囲を日本の水墨画全体と同一視しない。',
    sourceIds: [],
  },
  'land-art': {
    heading: '収録範囲について',
    body: '本項目は1960〜70年代の欧米における主要なアースワークを中心に扱う。現在も続く環境をめぐる実践とは背景も条件も異なるため、同じ枠組みでまとめない。',
    sourceIds: ['moma-earthwork', 'tate-land-art-expansion'],
  },
  'light-and-space': {
    heading: '運動としてのまとまり',
    body: 'ライト・アンド・スペースは、宣言や組織を持つ運動ではない。1960年代半ばの南カリフォルニアで、光と知覚を扱う関心を共有した作家たちを指す緩やかな呼称である。',
    sourceIds: ['gugg-turrell', 'tate-turrell'],
  },

  /* --- D. 成立年代・起点 ---------------------------------------------- */
  gothic: {
    heading: '起点について',
    body: 'ゴシックの始まりは、サン・ドニ修道院聖堂の改築（1140年頃）を起点とするのが通説である。ただしこれは建築を基準にした区切りであり、地域や分野によって実際の展開時期は異なる。',
    sourceIds: ['smarthistory-gothic-architecture', 'smarthistory-late-gothic'],
  },
  'romanesque-art': {
    heading: '年代の幅について',
    body: 'ロマネスクの開始と終わりは地域によって異なり、12世紀後半まで続く地域もある。ここで示す年代は、地域差をならした概算として読む必要がある。',
    sourceIds: [],
  },
  mannerism: {
    heading: '位置づけについて',
    body: 'マニエリスムは、盛期ルネサンスの衰退や様式の乱れとして説明されることがあるが、そうした優劣の評価は現在では取らない。盛期ルネサンスの後、バロックに先立つ時期の意識的な選択として捉える。',
    sourceIds: ['tate-mannerist'],
  },
  romanticism: {
    heading: '年代の幅について',
    body: 'ロマン主義は、国や分野によって盛期の時期が大きく異なる。ここで示す年代は幅を持たせた概算であり、すべての地域に同じ区切りが当てはまるわけではない。',
    sourceIds: [],
  },
  'prehistoric-ritual': {
    heading: '年代の精度について',
    body: '先史の年代は放射性炭素年代測定などに基づく概算で、地域差も大きい。示している年代は幅のある推定値であり、確定した年号としては読まない。',
    sourceIds: [],
  },
};

/** ムーブメントへ研究上の留保を付与する（既存データは変更しない）。 */
export const applyScholarlyNotes = (records: Movement[]): Movement[] =>
  records.map((movement) => {
    const note = notes[movement.id];
    return note ? { ...movement, scholarlyNote: note } : movement;
  });

/** 監査・テスト用に公開する。 */
export const scholarlyNotes = notes;
