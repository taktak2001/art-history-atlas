import type { Relationship } from '@/lib/schema';

export const finalExpansionRelationships: Relationship[] = [
  { id: 'rel-fauvism-to-expressionism', from: 'fauvism', to: 'expressionism', kind: 'influence', note: 'フォーヴィスムの非再現的な純色と大胆な筆触は表現主義の一部へ作用したが、後者は都市・心理・集団理念という別の条件を持つ。', sourceIds: ['met-fauvism', 'smarthistory-expressionism-intro'] },
  { id: 'rel-suprematism-to-constructivism', from: 'suprematism', to: 'russian-constructivism', kind: 'influence', note: 'シュプレマティスムの幾何学的抽象は構成主義の複数の作家へ作用したが、純粋感覚と社会的生産をめぐる理念は異なる。', sourceIds: ['moma-suprematism', 'moma-constructivism'] },
  { id: 'rel-constructivism-to-bauhaus', from: 'russian-constructivism', to: 'bauhaus', kind: 'influence', note: '構成主義の素材・構造・生産・タイポグラフィは1920年代のバウハウスへ作用し、教育・展示・印刷の国際前衛を結んだ。', sourceIds: ['moma-constructivism', 'met-bauhaus'] },
  { id: 'rel-de-stijl-to-bauhaus', from: 'de-stijl', to: 'bauhaus', kind: 'influence', note: 'デ・ステイルの水平垂直、原色、建築と絵画の統合はバウハウスの一部の造形教育とデザインへ作用した。', sourceIds: ['moma-de-stijl-catalogue', 'met-bauhaus'] },
  { id: 'rel-informel-gutai-contemporary', from: 'art-informel', to: 'gutai', kind: 'contemporary', note: 'アンフォルメルと具体は戦後に身振り・物質・破壊を同時代的に探究し、批評交流もあったが、一方を他方の派生として扱わない。', sourceIds: ['guggenheim-art-informel', 'tate-gutai'] },
  { id: 'rel-arte-povera-monoha-contemporary', from: 'arte-povera', to: 'mono-ha', kind: 'contemporary', note: 'アルテ・ポーヴェラともの派は1960年代末に自然物・工業材・場所を再考した並行的実践であり、直接影響とは断定しない。', sourceIds: ['moma-arte-povera', 'gugg-lee-ufan'] },
  { id: 'rel-minimalism-to-land-art', from: 'minimalism', to: 'land-art', kind: 'influence', note: 'ミニマリズムの単純形態、反復、場所と身体への関心はランド・アートの一部へ作用したが、土地・地質・環境という条件が加わった。', sourceIds: ['tate-minimalism', 'moma-earthwork'] },
  { id: 'rel-postminimalism-to-land-art', from: 'postminimalism', to: 'land-art', kind: 'succession', note: 'ランド・アートはポストミニマリズムの過程、重力、素材変化、反形式を引き継ぎ、制作場所を地形と広い時間へ展開した。', sourceIds: ['tate-process-art', 'tate-land-art-expansion'] },
];
