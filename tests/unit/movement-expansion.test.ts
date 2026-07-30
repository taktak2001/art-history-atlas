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

  it('権利確認済み画像を20点追加し、未確認画像はnullにする', () => {
    const expansionWorks = works.filter((work) =>
      work.movementIds.some((id) =>
        CORE_EXPANSION_IDS.includes(id as (typeof CORE_EXPANSION_IDS)[number]),
      ),
    );
    expect(expansionWorks.filter((work) => work.image)).toHaveLength(20);
    expect(
      expansionWorks
        .filter((work) => work.movementIds.includes('bauhaus'))
        .every((work) => work.image === null),
    ).toBe(true);
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
