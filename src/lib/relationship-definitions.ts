import {
  RELATION_LABELS,
  type RelationKind,
} from '@/lib/schema';

export type RelationshipDefinition = {
  label: string;
  shortDefinition: string;
  legendDescription: string;
  fullDefinition: string;
  criteria: string[];
  exclusions: string[];
  examples: string[];
  cautions: string[];
  visualEncoding: {
    color: string;
    darkColor: string;
    colorLabel: string;
    lineLabel: string;
    arrow: boolean;
  };
  sourceTarget: {
    source: string;
    target: string;
  };
};

export const RELATION_KINDS = Object.keys(
  RELATION_LABELS,
) as RelationKind[];

export const RELATIONSHIP_DEFINITIONS: Record<
  RelationKind,
  RelationshipDefinition
> = {
  succession: {
    label: RELATION_LABELS.succession,
    shortDefinition:
      '中心的な方法や問題意識を、後続運動が直接引き継ぐ関係',
    legendDescription:
      '前の運動の中心的な思想や技法を受け継ぎ、発展させた関係です。すべてをそのまま引き継ぐのではなく、新しい時代や地域に合わせて再解釈される変化も含めて丁寧に捉えます。',
    fullDefinition:
      '前の運動の中心的な方法・問題意識・形式を、次の運動が引き継ぎ、別の条件のもとで発展させた関係です。',
    criteria: [
      '比較的近い時代の系譜である',
      '運動の中心的要素を引き継いでいる',
      '後続運動の成立説明に不可欠である',
      '一部の技法だけでなく、運動の構造に関わる',
    ],
    exclusions: [
      '一部の技法や作品だけが参照された場合',
      '年代が後というだけで、成立上の連続性を確認できない場合',
      '共通点はあるが、直接の系譜を確認できない場合',
    ],
    examples: ['印象派 → ポスト印象派'],
    cautions: [
      'この関係を除くと後続運動の成立説明が大きく崩れるかを確認する',
      '単純な進歩史観にならないよう、継承と転換の両方をnoteへ記録する',
    ],
    visualEncoding: {
      color: '#3f6349',
      darkColor: '#6ee7b7',
      colorLabel: '深緑',
      lineLabel: '実線',
      arrow: true,
    },
    sourceTarget: {
      source: '中心的要素を渡した先行運動',
      target: 'その要素を引き継ぎ発展させた後続運動',
    },
  },
  reaction: {
    label: RELATION_LABELS.reaction,
    shortDefinition:
      '後続運動が、先行する価値や表現へ意識的に対抗した関係',
    legendDescription:
      '先行する運動への批判や否定から生まれた関係です。表現方法や価値観を意識的に変えることで新しい美術運動が成立し、批判の対象を具体的に資料で確認できる場合に用います。',
    fullDefinition:
      'ある運動が、先行する運動の価値観・制度・形式を問題として捉え、否定、反転、批判を通じて別の表現を提示した関係です。',
    criteria: [
      '後続側の言説、作品、活動に対抗意識を確認できる',
      '何に反発したかを具体的に説明できる',
      '反発が後続運動の成立や自己定義に関わる',
      '単なる差異ではなく、歴史的な応答として記録できる',
    ],
    exclusions: [
      '表現が異なるだけで、対抗意識を確認できない場合',
      '個人間の対立だけで運動全体へ一般化できない場合',
      '後世の分類だけが対立構図を作っている場合',
    ],
    examples: ['ロココ → 新古典主義'],
    cautions: [
      '反発していても、先行運動の制度や技法を部分的に継承する場合がある',
      '日本語では、反発した側であるtargetを主語にして読む',
    ],
    visualEncoding: {
      color: '#8f3a27',
      darkColor: '#fdba74',
      colorLabel: '赤褐色',
      lineLabel: '破線',
      arrow: true,
    },
    sourceTarget: {
      source: '反発の対象となった先行運動',
      target: 'sourceへ反発した後続運動',
    },
  },
  influence: {
    label: RELATION_LABELS.influence,
    shortDefinition:
      '技法・思想・作品の一部が、別の運動へ作用する関係',
    legendDescription:
      '思想・技法・作品などの一部が、別の運動へ作用した関係です。直接の後継ではなくても、特定の表現や考え方が受容側で形を変えながら、後世の制作に取り入れられた場合に用います。',
    fullDefinition:
      '特定の技法・思想・作品・作家が、別の運動の一部に作用した関係です。直接的な後継関係である必要はありません。',
    criteria: [
      '時代や地域が離れていても成立する',
      '一部の要素だけでも作用を確認できる',
      '直接の後継関係ではない',
      '複数の起点から同時に成立しうる',
    ],
    exclusions: [
      '中心的要素を直接引き継ぎ、後続運動の成立説明に不可欠な場合',
      '年代が重なるだけで、具体的な作用を確認できない場合',
      '類似しているだけで、接触や参照の根拠がない場合',
    ],
    examples: ['浮世絵 → 印象派'],
    cautions: [
      '成立の一因か、直接の後継関係かを区別する',
      '一方向の文化伝播へ単純化せず、受容側の選択と変形もnoteへ記録する',
    ],
    visualEncoding: {
      color: '#345d84',
      darkColor: '#93c5fd',
      colorLabel: '青',
      lineLabel: '長い破線',
      arrow: true,
    },
    sourceTarget: {
      source: '技法、思想、作品などの作用を与えた側',
      target: 'その作用を受け、選択的に取り入れた側',
    },
  },
  contemporary: {
    label: RELATION_LABELS.contemporary,
    shortDefinition:
      '同じ時期に並行し、直接の因果を断定しない関係',
    legendDescription:
      '同じ時代に並行して存在し、共通する課題や社会状況を別々に扱った関係です。交流の可能性はあっても直接の影響が確認されず、それぞれの違いを比較できる場合に用います。',
    fullDefinition:
      '同じ時期に異なる地域や制度で展開し、共通する歴史条件や問題を別々の方法で扱った関係です。直接の影響や系譜は断定しません。',
    criteria: [
      '活動期間が実質的に重なっている',
      '比較する意義のある共通課題や歴史条件がある',
      '直接の影響関係を示す十分な根拠がない',
      '相違点も含めて並行関係を説明できる',
    ],
    exclusions: [
      '年代が重なるだけで、比較上の接点がない場合',
      '直接の影響、継承、地域展開を確認できる場合',
      '活動時期の重なりがごく短く、同時代性が説明を支えない場合',
    ],
    examples: ['イタリア・ルネサンス ↔ 北方ルネサンス'],
    cautions: [
      '同時代であることを、相互影響の証拠として扱わない',
      'sourceとtargetは表示上の便宜であり、因果方向を示さない',
    ],
    visualEncoding: {
      color: '#6a5f2e',
      darkColor: '#fcd34d',
      colorLabel: 'オリーブ',
      lineLabel: '点線',
      arrow: false,
    },
    sourceTarget: {
      source: '並行比較する一方の運動',
      target: '並行比較するもう一方の運動',
    },
  },
  'regional-variant': {
    label: RELATION_LABELS['regional-variant'],
    shortDefinition:
      'ある表現や問題が、別の地域条件のもとで展開した関係',
    legendDescription:
      'ある地域で生まれた運動が、別の地域の文化や制度に合わせて独自に発展した関係です。同じ名称でも、土地の宗教・市場・素材などに応じて、思想や表現が変化した場合に用います。',
    fullDefinition:
      'ある運動の形式・問題意識・制度が別の地域へ移り、その土地の宗教、政治、市場、素材、伝統に応じて変形した関係です。',
    criteria: [
      '地域をまたぐ連続性を確認できる',
      '受容地域固有の条件による変形がある',
      '起点と展開先の差異を具体的に説明できる',
      '単なる同時代比較ではなく、展開の経路を確認できる',
    ],
    exclusions: [
      '地域が異なるだけで接続を確認できない場合',
      '変形を伴わない単純な複製や個別作品の移動',
      '地域差より直接の継承や影響として説明する方が適切な場合',
    ],
    examples: ['バロック → オランダ黄金時代'],
    cautions: [
      '中心から周縁への一方向モデルへ固定しない',
      '展開先を派生物として低く評価せず、独自条件をnoteへ記録する',
    ],
    visualEncoding: {
      color: '#5b4a86',
      darkColor: '#c4b5fd',
      colorLabel: '紫',
      lineLabel: '短い破線',
      arrow: true,
    },
    sourceTarget: {
      source: '地域を越えて参照された起点側',
      target: '地域固有の条件のもとで展開した側',
    },
  },
  theoretical: {
    label: RELATION_LABELS.theoretical,
    shortDefinition:
      '理念や美術観の枠組みが、別の運動へ接続した関係',
    legendDescription:
      '共通する哲学・宗教・美術観などを背景にもつ関係です。直接の継承でなくても、同じ理論的な問いから、似た制作や制度への考え方が異なる時代や運動に生まれた場合に用います。',
    fullDefinition:
      '作品の見た目だけでなく、美術とは何か、制作や鑑賞をどう捉えるかという理論的枠組みが別の運動へ接続した関係です。',
    criteria: [
      '共有または展開された理論的命題を特定できる',
      '作家、批評家、声明、活動記録などで接続を確認できる',
      '作品の外見だけでは説明できない関係である',
      '理論が後続側の制作や制度理解に作用している',
    ],
    exclusions: [
      '視覚的な類似だけで理論的接続を確認できない場合',
      '特定技法の受容だけで説明できる場合',
      '抽象的な共通語だけで具体的な枠組みを示せない場合',
    ],
    examples: ['ダダ → コンセプチュアル・アート'],
    cautions: [
      '後世の理論を過去の運動へそのまま投影しない',
      '理論の一致と、同じ結論へ至ったことを区別する',
    ],
    visualEncoding: {
      color: '#42646a',
      darkColor: '#67e8f9',
      colorLabel: '青緑',
      lineLabel: '鎖線',
      arrow: true,
    },
    sourceTarget: {
      source: '理論的命題や美術観を提示した側',
      target: 'その枠組みを展開、再定義した側',
    },
  },
  technical: {
    label: RELATION_LABELS.technical,
    shortDefinition:
      '素材・技法・制作工程が、別の運動へ受け渡された関係',
    legendDescription:
      '技法・素材・制作方法の受け渡しによって結ばれる関係です。思想や目的は異なっていても、同じ技術や制作工程が受け継がれ、新しい目的や別の文脈で活用された場合に用います。',
    fullDefinition:
      '素材、道具、制作工程、複製や表示の技術が別の運動へ受け渡され、異なる目的や文脈で利用された関係です。',
    criteria: [
      '具体的な素材、技法、工程を特定できる',
      '技術が起点側から到達先へ受け渡された根拠がある',
      '到達先での転用や目的の変化を説明できる',
      '運動全体の継承ではなく技術的要素に焦点がある',
    ],
    exclusions: [
      '同じ材料を偶然使っているだけの場合',
      '中心的な方法と問題意識まで直接引き継ぐ場合',
      '理念だけが接続し、技術の受け渡しを確認できない場合',
    ],
    examples: ['キュビスム → ダダ'],
    cautions: [
      '技術が同じでも、用途と政治的意味が異なる場合を明記する',
      '発明者と、技法を運動として展開した側を混同しない',
    ],
    visualEncoding: {
      color: '#665742',
      darkColor: '#d6d3d1',
      colorLabel: '褐灰色',
      lineLabel: '細かな点線',
      arrow: true,
    },
    sourceTarget: {
      source: '素材、技法、工程の参照元',
      target: 'その技術を別の目的で用いた側',
    },
  },
  revival: {
    label: RELATION_LABELS.revival,
    shortDefinition:
      '過去の運動が、後世の条件から再発見・再解釈された関係',
    legendDescription:
      '過去の運動や様式が、時代を隔てて再発見され、新しい意味を与えられた関係です。単なる保存ではなく、後世の価値観から選び直され、制作や評価に用いられた場合に示します。',
    fullDefinition:
      '活動時期が離れた過去の運動、様式、作品群が、後世の価値観や制度のもとで再発見され、新たな規範や資源として読み替えられた関係です。',
    criteria: [
      '起点と到達先の時代に明確な隔たりがある',
      '後世側の再発見、復興、再解釈を確認できる',
      '過去の要素が新しい歴史条件のもとで選択されている',
      '単なる保存ではなく、制作や評価へ作用している',
    ],
    exclusions: [
      '近接する時代の直接的な継承',
      '継続的に知られており、再評価の契機を特定できない場合',
      '一作品の引用だけで運動や様式の再解釈に至らない場合',
    ],
    examples: ['古代ギリシャ美術 → イタリア・ルネサンス'],
    cautions: [
      '過去がそのまま復元されたのではなく、後世側が選択的に構成した像として扱う',
      '現在の評価を過去の自己理解と混同しない',
    ],
    visualEncoding: {
      color: '#83582d',
      darkColor: '#fde047',
      colorLabel: '黄褐色',
      lineLabel: '矢印付き破線',
      arrow: true,
    },
    sourceTarget: {
      source: '後世に参照された過去の運動や様式',
      target: 'それを再発見し、再解釈した後世の運動',
    },
  },
  'shared-idea': {
    label: RELATION_LABELS['shared-idea'],
    shortDefinition:
      '直接の系譜を断定せず、重要な問題意識を共有する関係',
    legendDescription:
      '直接の影響や継承は確認できなくても、重要な問題意識を共有する関係です。時代や地域が異なる運動を、空間・身体・物質などの共通する問いから比較し、理解を深める場合に用います。',
    fullDefinition:
      '時代や地域、制作方法が異なっていても、空間、身体、物質、崇高などの重要な問題意識を共有し、比較によって理解が深まる関係です。',
    criteria: [
      '共有する中心的な問いを具体的に示せる',
      '直接の影響や継承を断定する根拠はない',
      '類似点だけでなく差異も説明できる',
      '比較が各運動の理解を深める',
    ],
    exclusions: [
      '一般的すぎる主題だけを共有する場合',
      '直接の影響、継承、理論的接続を確認できる場合',
      '見た目の類似だけで問題意識を確認できない場合',
    ],
    examples: ['ポストミニマリズム ↔ もの派'],
    cautions: [
      '共通点を一本の発展史へ変換しない',
      'sourceとtargetは表示上の便宜であり、優劣や因果方向を示さない',
    ],
    visualEncoding: {
      color: '#6a4b5a',
      darkColor: '#fda4af',
      colorLabel: '葡萄色',
      lineLabel: '太めの点線',
      arrow: false,
    },
    sourceTarget: {
      source: '比較する一方の運動',
      target: '共通する問いを持つもう一方の運動',
    },
  },
};

export const RELATION_COLOR: Record<RelationKind, string> =
  Object.fromEntries(
    RELATION_KINDS.map((kind) => [
      kind,
      RELATIONSHIP_DEFINITIONS[kind].visualEncoding.color,
    ]),
  ) as Record<RelationKind, string>;

export const RELATION_DARK_COLOR: Record<RelationKind, string> =
  Object.fromEntries(
    RELATION_KINDS.map((kind) => [
      kind,
      RELATIONSHIP_DEFINITIONS[kind].visualEncoding.darkColor,
    ]),
  ) as Record<RelationKind, string>;
