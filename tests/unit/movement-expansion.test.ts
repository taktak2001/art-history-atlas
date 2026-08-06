import { describe, expect, it } from 'vitest';
import { artists } from '@/data/artists';
import { movements } from '@/data/movements';
import { relationships } from '@/data/relationships';
import { sources } from '@/data/sources';
import { works } from '@/data/works';

const CORE_EXPANSION_IDS = [
  'ancient-egyptian-art',
  'ancient-roman-art',
  'romanesque-art',
  'islamic-art',
  'chinese-landscape-painting',
  'ukiyo-e',
  'expressionism',
  'bauhaus',
] as const;

const STANDARD_ONE_IDS = [
  'mesopotamian-art',
  'hellenistic-art',
  'literati-painting',
  'yamato-e',
  'japanese-ink-painting',
  'rinpa',
  'arts-and-crafts',
  'art-nouveau',
] as const;

const FINAL_STANDARD_IDS = ['fauvism', 'russian-constructivism'] as const;
const FINAL_DETAILED_IDS = [
  'suprematism',
  'de-stijl',
  'art-informel',
  'fluxus',
  'arte-povera',
  'land-art',
] as const;
const FINAL_IDS = [...FINAL_STANDARD_IDS, ...FINAL_DETAILED_IDS] as const;

describe('第1弾ムーブメント拡張: core 8件', () => {
  it('指定した8件をcoreとして収録する', () => {
    for (const id of CORE_EXPANSION_IDS) {
      const movement = movements.find((candidate) => candidate.id === id);
      expect(movement, id).toBeDefined();
      expect(movement?.visibilityLevel, id).toBe('core');
      expect(movement?.isRepresentative, id).toBe(true);
    }
  });

  it('各項目が複数機関の概説出典と3作品を持つ', () => {
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    for (const id of CORE_EXPANSION_IDS) {
      const movement = movements.find((candidate) => candidate.id === id)!;
      const publishers = new Set(
        movement.sourceIds.map((sourceId) => sourceById.get(sourceId)?.publisher),
      );
      expect(publishers.size, `${id}: publishers`).toBeGreaterThanOrEqual(2);
      expect(movement.workIds, `${id}: workIds`).toHaveLength(3);
      expect(
        works.filter((work) => work.movementIds.includes(id)),
        `${id}: works`,
      ).toHaveLength(3);
    }
  });

  it('権利確認済み画像を22点掲載し、未確認画像はnullにする', () => {
    const expansionWorks = works.filter((work) =>
      work.movementIds.some((id) =>
        CORE_EXPANSION_IDS.includes(id as (typeof CORE_EXPANSION_IDS)[number]),
      ),
    );
    expect(expansionWorks.filter((work) => work.image)).toHaveLength(22);
    expect(works.find((work) => work.id === 'work-brandt-tea-infuser')?.image).toBeNull();
    // 藍瑛《倪瓚風山水》はPD(AIC CC0)だが、AIC IIIFがホットリンクを拒否するため image は null。
    expect(works.find((work) => work.id === 'work-lan-ying-after-ni-zan')?.image).toBeNull();
  });

  it('作家と作品の相互参照が一致する', () => {
    const artistById = new Map(artists.map((artist) => [artist.id, artist]));
    for (const id of CORE_EXPANSION_IDS) {
      const movement = movements.find((candidate) => candidate.id === id)!;
      for (const artistId of movement.artistIds) {
        expect(artistById.get(artistId)?.movementIds, `${id}:${artistId}`).toContain(id);
      }
      for (const workId of movement.workIds) {
        expect(works.find((work) => work.id === workId)?.movementIds, `${id}:${workId}`).toContain(id);
      }
    }
  });

  it('浮世絵の影響は外部ノードから印象派・ポスト印象派へ向く', () => {
    const edges = relationships.filter((relationship) => relationship.from === 'ukiyo-e');
    expect(edges.map((edge) => [edge.to, edge.kind])).toEqual(
      expect.arrayContaining([
        ['impressionism', 'influence'],
        ['post-impressionism', 'influence'],
      ]),
    );
  });
});

describe('第1弾ムーブメント拡張: standard前半8件', () => {
  it('指定した8件をstandardとして収録する', () => {
    for (const id of STANDARD_ONE_IDS) {
      const movement = movements.find((candidate) => candidate.id === id);
      expect(movement, id).toBeDefined();
      expect(movement?.visibilityLevel, id).toBe('standard');
    }
  });

  it('各項目が複数機関の概説出典と3作品を持つ', () => {
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    for (const id of STANDARD_ONE_IDS) {
      const movement = movements.find((candidate) => candidate.id === id)!;
      const publishers = new Set(
        movement.sourceIds.map((sourceId) => sourceById.get(sourceId)?.publisher),
      );
      expect(publishers.size, `${id}: publishers`).toBeGreaterThanOrEqual(2);
      expect(movement.workIds, `${id}: workIds`).toHaveLength(3);
      expect(
        works.filter((work) => work.movementIds.includes(id)),
        `${id}: works`,
      ).toHaveLength(3);
    }
  });

  it('権利確認済み画像を24点追加し、不明な画像はnullにする', () => {
    const expansionWorks = works.filter((work) =>
      work.movementIds.some((id) =>
        STANDARD_ONE_IDS.includes(id as (typeof STANDARD_ONE_IDS)[number]),
      ),
    );
    expect(expansionWorks).toHaveLength(24);
    // ミュシャ《椿姫》を Wikimedia Commons のPDスキャンとして追加（23 → 24）。
    expect(expansionWorks.filter((work) => work.image)).toHaveLength(24);
    const mucha = works.find((work) => work.id === 'work-mucha-camelias');
    expect(mucha?.image).not.toBeNull();
    expect(mucha?.image?.isPublicDomain).toBe(true);
  });

  it('作家・作品・関係の参照方向が一致する', () => {
    const artistById = new Map(artists.map((artist) => [artist.id, artist]));
    for (const id of STANDARD_ONE_IDS) {
      const movement = movements.find((candidate) => candidate.id === id)!;
      for (const artistId of movement.artistIds) {
        expect(artistById.get(artistId)?.movementIds, `${id}:${artistId}`).toContain(id);
      }
      for (const workId of movement.workIds) {
        expect(works.find((work) => work.id === workId)?.movementIds, `${id}:${workId}`).toContain(id);
      }
    }
    expect(
      relationships.find((edge) => edge.id === 'rel-yamato-to-rinpa'),
    ).toMatchObject({ from: 'yamato-e', to: 'rinpa', kind: 'revival' });
  });
});

describe('第1弾ムーブメント拡張: standard後半2件＋detailed 6件', () => {
  it('指定したLODで8件を収録する', () => {
    for (const id of FINAL_STANDARD_IDS) {
      expect(movements.find((movement) => movement.id === id)?.visibilityLevel).toBe(
        'standard',
      );
    }
    for (const id of FINAL_DETAILED_IDS) {
      expect(movements.find((movement) => movement.id === id)?.visibilityLevel).toBe(
        'detailed',
      );
    }
  });

  it('各項目が複数機関の概説出典と2作品を持つ', () => {
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    for (const id of FINAL_IDS) {
      const movement = movements.find((candidate) => candidate.id === id)!;
      const publishers = new Set(
        movement.sourceIds.map((sourceId) => sourceById.get(sourceId)?.publisher),
      );
      expect(publishers.size, `${id}: publishers`).toBeGreaterThanOrEqual(2);
      expect(movement.workIds, `${id}: workIds`).toHaveLength(2);
      expect(
        works.filter((work) => work.movementIds.includes(id)),
        `${id}: works`,
      ).toHaveLength(2);
    }
  });

  it('確認できた画像8点だけを掲載し、戦後作品は権利未確認のままnullにする', () => {
    const expansionWorks = works.filter((work) =>
      work.movementIds.some((id) =>
        FINAL_IDS.includes(id as (typeof FINAL_IDS)[number]),
      ),
    );
    expect(expansionWorks).toHaveLength(16);
    expect(expansionWorks.filter((work) => work.image)).toHaveLength(8);
    expect(
      expansionWorks
        .filter((work) =>
          ['art-informel', 'fluxus', 'arte-povera', 'land-art'].some((id) =>
            work.movementIds.includes(id),
          ),
        )
        .every((work) => work.image === null),
    ).toBe(true);
  });

  it('慎重な関係種別と方向を維持する', () => {
    expect(
      relationships.find((edge) => edge.id === 'rel-informel-gutai-contemporary'),
    ).toMatchObject({ from: 'art-informel', to: 'gutai', kind: 'contemporary' });
    expect(
      relationships.find((edge) => edge.id === 'rel-arte-povera-monoha-contemporary'),
    ).toMatchObject({ from: 'arte-povera', to: 'mono-ha', kind: 'contemporary' });
    expect(
      relationships.find((edge) => edge.id === 'rel-postminimalism-to-land-art'),
    ).toMatchObject({
      from: 'postminimalism',
      to: 'land-art',
      kind: 'succession',
    });
  });
});
