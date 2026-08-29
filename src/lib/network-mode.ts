import { IMPORTANT_RELATION_KINDS } from '@/lib/network-presentation';
import type { RelationKind, VisibilityLevel } from '@/lib/schema';

/**
 * 関係ネットワークの表示モード。
 *
 * 情報量（Low / Medium / High）ではなく、閲覧目的で分ける。
 * 同じ図を薄くしたり濃くしたりするのではなく、ユーザーの行為そのものが変わるようにする。
 */
export type NetworkMode = 'overview' | 'study' | 'focus';

export const NETWORK_MODES: NetworkMode[] = ['overview', 'study', 'focus'];

/** 機能名として短く、横幅も安定するので英語のまま用いる */
export const NETWORK_MODE_LABELS: Record<NetworkMode, string> = {
  overview: 'OVERVIEW',
  study: 'STUDY',
  focus: 'FOCUS',
};

/** 読み上げと補助テキスト。ユーザーが「何を知りたいか」で書く */
export const NETWORK_MODE_PURPOSES: Record<NetworkMode, string> = {
  overview: '美術史全体はどう流れたかを眺める',
  study: 'この時代の関係を読む',
  focus: '選んだムーブメントを理解する',
};

export type NetworkModePreset = {
  /** そのモードで扱う収録範囲 */
  lod: VisibilityLevel;
  /**
   * カメラ。
   * - 'fit-all': 収録全体が画面に収まる倍率へ合わせる
   * - 'fit-selection': 選択とその直接関係が収まる範囲へ寄せる
   * - 数値: その倍率。いずれの場合も値をユーザーへ見せることはしない
   */
  camera: 'fit-all' | 'fit-selection' | number;
  /** 関係ラベル（継承・反発など）を線の途中に出すか */
  relationLabels: boolean;
};

/**
 * モードは情報密度、ズームはカメラ倍率。
 * モードを選ぶと倍率も決まるが、その数値はユーザーに意識させない。
 */
export const NETWORK_MODE_PRESET: Record<NetworkMode, NetworkModePreset> = {
  overview: { lod: 'core', camera: 'fit-all', relationLabels: false },
  study: { lod: 'standard', camera: 1, relationLabels: true },
  focus: { lod: 'detailed', camera: 'fit-selection', relationLabels: true },
};

/*
 * 図に出す情報の段階（overview / study / detail）は
 * networkSemanticLevelForLod() が収録範囲から決める。
 * モードが収録範囲を決めるので、段階はモードに従って動く。
 */

/** 日常利用の標準はSTUDY。全体は俯瞰専用、FOCUSは選択後の深掘り専用に割り切る */
export const DEFAULT_NETWORK_MODE: NetworkMode = 'study';

export function parseNetworkMode(raw: string | null | undefined): NetworkMode | null {
  return NETWORK_MODES.includes(raw as NetworkMode) ? (raw as NetworkMode) : null;
}

/**
 * OVERVIEWの主幹線。
 *
 * 編集上の重要関係（継承・反発・影響）に復興を加える。復興は古代→ルネサンスという
 * 全体表示の主題そのもので、他の線と同じ強さまで落とすと通史が読めなくなるため。
 */
export const OVERVIEW_BACKBONE_KINDS: RelationKind[] = [
  ...IMPORTANT_RELATION_KINDS,
  'revival',
];

export function isOverviewBackbone(kind: RelationKind): boolean {
  return OVERVIEW_BACKBONE_KINDS.includes(kind);
}

/** ノードの強さ。実際の不透明度はCSS側で持つ */
export type NodeEmphasis =
  | 'selected'
  | 'direct'
  | 'second'
  | 'background'
  | 'normal';

export function nodeEmphasis({
  mode,
  nodeId,
  selectedId,
  directNodeIds,
  secondHopNodeIds,
}: {
  mode: NetworkMode;
  nodeId: string;
  selectedId: string | null;
  directNodeIds: ReadonlySet<string>;
  secondHopNodeIds: ReadonlySet<string>;
}): NodeEmphasis {
  if (!selectedId) return 'normal';
  if (nodeId === selectedId) return 'selected';
  if (directNodeIds.has(nodeId)) return 'direct';
  if (secondHopNodeIds.has(nodeId)) return 'second';
  // FOCUSでは選択と無関係なものを大胆に落とす。他モードでは背景として残す
  return mode === 'focus' ? 'background' : 'second';
}

/** 関係線の強さ。実際の不透明度はCSS側で持つ */
export type EdgeEmphasis =
  | 'primary'
  | 'second'
  | 'background'
  | 'backbone'
  | 'minor'
  | 'normal';

export function edgeEmphasis({
  mode,
  kind,
  from,
  to,
  selectedId,
  directNodeIds,
}: {
  mode: NetworkMode;
  kind: RelationKind;
  from: string;
  to: string;
  selectedId: string | null;
  directNodeIds: ReadonlySet<string>;
}): EdgeEmphasis {
  if (selectedId) {
    if (from === selectedId || to === selectedId) return 'primary';
    if (directNodeIds.has(from) && directNodeIds.has(to)) return 'second';
    return mode === 'focus' ? 'background' : 'second';
  }
  // 選択が無いOVERVIEWでは、線より配置を読む
  if (mode === 'overview') return isOverviewBackbone(kind) ? 'backbone' : 'minor';
  return 'normal';
}
