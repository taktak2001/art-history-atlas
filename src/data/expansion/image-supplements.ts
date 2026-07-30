import type { ImageMeta, Source, Work } from '@/lib/schema';
import {
  commonsLicensedImage,
  commonsPublicDomainImage,
} from './image-meta';

type Supplement = {
  image: ImageMeta;
  sourceId: string;
};

const supplements: Record<string, Supplement> = {
  'work-lascaux-hall-of-bulls': {
    sourceId: 'commons-lascaux-painting',
    image: commonsLicensedImage(
      'Lascaux painting.jpg',
      {
        title: 'ラスコー洞窟の動物壁画',
        creator: '作者不詳／撮影 Prof saxx',
        date: '前17,000年頃／撮影2006年',
        alt: '洞窟壁面を横切る黒い牛、馬、鹿の輪郭が重なって描かれた先史時代の動物壁画',
      },
      {
        license: 'cc-by-sa',
        credit:
          'Lascaux painting, photograph by Prof saxx, CC BY-SA 3.0, via Wikimedia Commons',
        verificationNote:
          'Wikimedia Commonsのファイルページでラスコーの動物壁画、撮影者、720×472px、CC BY-SA 3.0を2026-07-30に確認。',
      },
    ),
  },
  'work-venus-of-willendorf': {
    sourceId: 'commons-venus-willendorf',
    image: {
      ...commonsLicensedImage(
        'Venus of Willendorf 2017.jpg',
        {
          title: 'ヴィレンドルフの女性像',
          creator: '作者不詳／撮影 Syd Storm',
          date: '前28,000〜25,000年頃／撮影2017年',
          alt: '石灰岩の小像に大きな腹部と胸、編み目状に覆われた頭部が丸く刻まれている',
        },
        {
          license: 'cc-by-sa',
          credit:
            'Venus of Willendorf, photograph by Syd Storm, CC0, via Wikimedia Commons',
          verificationNote:
            'Wikimedia Commonsのファイルページで作品、撮影者、2340×4160px、CC0を2026-07-30に確認。',
        },
      ),
      license: 'cc0',
      isPublicDomain: true,
    },
  },
  'work-doryphoros': {
    sourceId: 'commons-doryphoros',
    image: commonsPublicDomainImage('Doryphoros.jpg', {
      title: 'ドリュフォロス（槍を持つ人）',
      creator: 'ポリュクレイトス原作／ローマ時代の模刻',
      date: '原作 前440年頃',
      alt: '片脚へ重心を置き、肩と腰を反対方向へ傾けた裸体青年像が均衡して立っている',
    }),
  },
  'work-exekias-amphora': {
    sourceId: 'commons-exekias-amphora',
    image: commonsPublicDomainImage(
      'Oud-Grieks aardewerk. Exekias. Amfora Ajax en Achilles spelen bordspel, GD018145.jpg',
      {
        title: 'アキレウスとアイアスが盤上遊戯をするアンフォラ',
        creator: 'エクセキアス',
        date: '前540〜530年頃',
        alt: '黒像式の壺面で、槍を携えた二人の戦士が低い台を挟んで盤上遊戯へ身をかがめる',
      },
    ),
  },
  'work-justinian-mosaic': {
    sourceId: 'commons-justinian-mosaic',
    image: commonsLicensedImage(
      'Mosaic of Justinian I - San Vitale - Ravenna 2016.jpg',
      {
        title: '皇帝ユスティニアヌスと廷臣たち',
        creator: '作者不詳／撮影 Jbribeiro1',
        date: '547年頃／撮影2016年',
        alt: '金地のモザイクに紫衣の皇帝を中心として聖職者と兵士が正面向きに並ぶ',
      },
      {
        license: 'cc-by-sa',
        credit:
          'Mosaic of Justinian I, photograph by Jbribeiro1, CC BY-SA 4.0, via Wikimedia Commons',
        verificationNote:
          'Wikimedia Commonsのファイルページでサン・ヴィターレ聖堂のモザイク、撮影者、CC BY-SA 4.0を2026-07-30に確認。',
      },
    ),
  },
  'work-hagia-sophia': {
    sourceId: 'commons-hagia-sophia-interior',
    image: {
      ...commonsLicensedImage(
        'Interior of Haghia Sophia.jpg',
        {
          title: 'ハギア・ソフィア内部',
          creator: 'アンテミオス／イシドロス設計、撮影 RndmCrs',
          date: '537年完成／撮影2018年',
          alt: '巨大な中央ドームと半ドーム、列柱が重なり、窓からの光が広い内部空間へ降り注ぐ',
        },
        {
          license: 'cc-by-sa',
          credit:
            'Interior of Hagia Sophia, photograph by RndmCrs, CC0, via Wikimedia Commons',
          verificationNote:
            'Wikimedia Commonsのファイルページでハギア・ソフィア内部、撮影者、3024×4032px、CC0を2026-07-30に確認。',
        },
      ),
      license: 'cc0',
      isPublicDomain: true,
    },
  },
  'work-unique-forms': {
    sourceId: 'commons-boccioni-unique-forms',
    image: commonsPublicDomainImage(
      "'Unique Forms of Continuity in Space', 1913 bronze by Umberto Boccioni.jpg",
      {
        title: '空間における連続性の唯一の形態',
        creator: 'ウンベルト・ボッチョーニ',
        date: '1913年',
        alt: '歩く人体の輪郭が風をはらんだ翼状の面へ分解され、前後へ連続して伸びるブロンズ像',
      },
    ),
  },
  'work-bauhaus-dessau-building': {
    sourceId: 'commons-bauhaus-dessau',
    image: commonsPublicDomainImage('Dessau Bauhaus.JPEG', {
      title: 'バウハウス・デッサウ校舎',
      creator: 'ヴァルター・グロピウス設計／撮影 Zairon',
      date: '1925〜1926年／撮影年不詳',
      alt: '水平に伸びる白い建築と大きなガラスのカーテンウォールが直角に接続する校舎外観',
    }),
  },
  'work-breuer-wassily-chair': {
    sourceId: 'commons-breuer-wassily',
    image: commonsPublicDomainImage('Bauhaus Chair Breuer.png', {
      title: 'ワシリー・チェア（B3）',
      creator: 'マルセル・ブロイヤー／画像 Borowski',
      date: '1925年／画像2006年',
      alt: '曲げた鋼管の骨組みに黒い帯状の座面、背、肘掛けを張った軽量な椅子',
    }),
  },
  'work-mondrian-composition': {
    sourceId: 'commons-mondrian-composition',
    image: commonsPublicDomainImage(
      'Piet Mondriaan, 1930 - Mondrian Composition II in Red, Blue, and Yellow.jpg',
      {
        title: '赤・青・黄のコンポジション',
        creator: 'ピート・モンドリアン',
        date: '1930年',
        alt: '太い黒の水平垂直線で白い区画を分け、赤、青、黄の原色面を非対称に配置した抽象画',
      },
    ),
  },
};

export const supplementalImageSources: Source[] = Object.entries(supplements).map(
  ([workId, supplement]) => ({
    id: supplement.sourceId,
    title: supplement.image.title,
    publisher: 'Wikimedia Commons — verified file page',
    url: supplement.image.sourceUrl,
    accessed: '2026-07-30',
    kind: 'archive',
    reliability: 'high',
    supports: `${workId}の作品同定、作者、画像、ライセンス`,
  }),
);

export const applyImageSupplements = (records: Work[]): Work[] =>
  records.map((work) => {
    const supplement = supplements[work.id];
    if (!supplement) return work;

    return {
      ...work,
      image: supplement.image,
      sourceIds: [...new Set([...work.sourceIds, supplement.sourceId])],
    };
  });
