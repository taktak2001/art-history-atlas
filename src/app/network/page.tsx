import type { Metadata } from 'next';
import { movements, relationships, ERA_ORDER } from '@/lib/dataset';
import { NetworkGraph } from '@/components/NetworkGraph';
import { EditorialPageHeader } from '@/components/EditorialPageHeader';

export const metadata: Metadata = {
  title: '関係ネットワーク',
  description: 'ムーブメント間の影響・反発・継承・同時代などの関係を、何が何への反応として成立したかが分かる図で示す。',
};

export default function NetworkPage() {
  return (
    <div className="network-page mx-auto max-w-layout px-4">
      <EditorialPageHeader
        className="network-page__header"
        englishTitle="RELATIONSHIP NETWORK"
        japaneseTitle="関係ネットワーク"
        description={
          <p>継承・反発・影響から、美術運動がどのように生まれ変化したかを辿ります。</p>
        }
      />
      <div className="network-page__body">
        <NetworkGraph movements={movements} relationships={relationships} eraOrder={ERA_ORDER} />
      </div>
    </div>
  );
}
