import type { Metadata } from 'next';
import { movements, relationships, ERA_ORDER } from '@/lib/dataset';
import { NetworkGraph } from '@/components/NetworkGraph';

export const metadata: Metadata = {
  title: '関係ネットワーク',
  description: 'ムーブメント間の影響・反発・継承・同時代などの関係を、何が何への反応として成立したかが分かる図で示す。',
};

export default function NetworkPage() {
  return (
    <div className="mx-auto max-w-layout px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">Network</p>
      <h1 className="mt-3 font-serif text-3xl">関係ネットワーク</h1>
      <p className="mt-3 max-w-prose text-sm text-muted">
        ムーブメントを時代順の列に配置し、影響・反発・継承・同時代などの関係を線で結びます。
        装飾ではなく「何が何への反応として成立したか」を読み解くための図です。関係タイプで絞り込み、
        ノードを選ぶと前後関係だけを強調します。スマートフォンでは重要関係から表示し、
        必要に応じてすべての関係へ切り替えられます。
      </p>
      <div className="mt-8">
        <NetworkGraph movements={movements} relationships={relationships} eraOrder={ERA_ORDER} />
      </div>
    </div>
  );
}
