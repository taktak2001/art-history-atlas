import { describe, expect, it } from 'vitest';
import { movements } from '@/data/movements';
import { works } from '@/data/works';
import { sources } from '@/data/sources';
import { relationships } from '@/data/relationships';

const ADDED_IDS = [
  'neo-impressionism',
  'vienna-secession',
  'die-bruecke',
  'der-blaue-reiter',
  'orphism',
  'socialist-realism',
  'cobra',
  'nouveau-realisme',
  'performance-art',
  'feminist-art',
  'pictures-generation',
  'neo-expressionism',
  'relational-aesthetics',
  'nihonga',
  'yoga',
  'mavo',
  'jikken-kobo',
  'neo-dada-organizers',
  'hi-red-center',
  'dansaekhwa',
  'minjung-art',
  'china-85-new-wave',
  'caravaggisti',
  'pre-raphaelite-brotherhood',
  'hudson-river-school',
  'barbizon-school',
  'appropriation-art',
  'institutional-critique',
  'young-british-artists',
  'net-art',
] as const;

describe('第2弾ムーブメント拡張', () => {
  it('重複を除いた30件を追加し、総数84件にする', () => {
    expect(movements).toHaveLength(84);
    for (const id of ADDED_IDS) {
      expect(movements.find((movement) => movement.id === id), id).toBeDefined();
    }
  });

  it('各追加項目に分類、名称由来、複数機関の出典を持つ', () => {
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    for (const id of ADDED_IDS) {
      const movement = movements.find((candidate) => candidate.id === id)!;
      const publishers = new Set(
        movement.sourceIds.map((sourceId) => sourceById.get(sourceId)?.publisher),
      );
      expect(movement.classification, `${id}: classification`).toBeTruthy();
      expect(movement.nameOrigin?.summary, `${id}: nameOrigin`).toBeTruthy();
      expect(publishers.size, `${id}: publishers`).toBeGreaterThanOrEqual(2);
    }
  });

  it('各追加項目に2作品以上を持ち、未確認画像を表示しない', () => {
    for (const id of ADDED_IDS) {
      const movementWorks = works.filter((work) => work.movementIds.includes(id));
      expect(movementWorks.length, `${id}: works`).toBeGreaterThanOrEqual(2);
      for (const work of movementWorks.filter((candidate) => candidate.image === null)) {
        expect(work.imageReference, `${work.id}: imageReference`).toBeDefined();
      }
    }
  });

  it('関係データは根拠付きで、追加項目への接続を持つ', () => {
    const added = new Set<string>(ADDED_IDS);
    const addedEdges = relationships.filter(
      (relationship) => added.has(relationship.from) || added.has(relationship.to),
    );
    expect(addedEdges.length).toBeGreaterThanOrEqual(20);
    for (const relationship of addedEdges) {
      expect(relationship.note.length, relationship.id).toBeGreaterThan(20);
      expect(relationship.sourceIds.length, relationship.id).toBeGreaterThan(0);
    }
  });
});
