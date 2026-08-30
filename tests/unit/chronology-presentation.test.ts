import { describe, expect, it } from 'vitest';
import { movements, relationships, works } from '@/lib/dataset';
import {
  CHRONOLOGY_ERAS,
  HISTORIC_EVENTS,
  chronologyEntries,
  incomingMovementConnection,
  movementCause,
  movementTags,
  nextMovement,
  representativeWork,
} from '@/lib/chronology-presentation';

const movement = (id: string) => movements.find((item) => item.id === id)!;

describe('縦型年表の展示情報', () => {
  it('8時代に固有の年代・キャッチコピー・色調がある', () => {
    expect(CHRONOLOGY_ERAS).toHaveLength(8);
    expect(new Set(CHRONOLOGY_ERAS.map((era) => era.id)).size).toBe(8);
    expect(new Set(CHRONOLOGY_ERAS.map((era) => era.tone)).size).toBe(8);
    expect(
      CHRONOLOGY_ERAS.every(
        (era) =>
          era.labelEn.length > 0 &&
          era.range.length > 0 &&
          era.catchphrase.length > 0,
      ),
    ).toBe(true);
    expect(CHRONOLOGY_ERAS.find((era) => era.id === 'modern')?.labelEn).toBe(
      'Modernism',
    );
  });

  it('主要な歴史イベントが影響先を持つ', () => {
    const requiredTitles = [
      'キリスト教公認',
      '活版印刷術の普及',
      '宗教改革',
      '産業革命',
      '写真の発明公表',
      '第一次世界大戦',
      '第二次世界大戦',
      '電子計算機の登場',
      'インターネット時代の始動',
    ];

    expect(HISTORIC_EVENTS.map((event) => event.title)).toEqual(
      expect.arrayContaining(requiredTitles),
    );
    expect(
      HISTORIC_EVENTS.every(
        (event) =>
          event.affectedMovementIds.length > 0 &&
          event.affectedMovementIds.every((id) =>
            movements.some((item) => item.id === id),
          ),
      ),
    ).toBe(true);
  });

  it('イベントとムーブメントを年代順に混在させる', () => {
    const entries = chronologyEntries('nineteenth', movements);
    const years = entries.map((entry) => entry.year);

    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(
      entries.some(
        (entry) =>
          entry.kind === 'event' && entry.event.id === 'photography',
      ),
    ).toBe(true);
    expect(
      entries.some(
        (entry) =>
          entry.kind === 'movement' && entry.movement.id === 'impressionism',
      ),
    ).toBe(true);
  });

  it('画像付き作品を代表作品として優先する', () => {
    expect(representativeWork(movement('gothic'), works)?.image).not.toBeNull();
    expect(representativeWork(movement('cubism'), works)?.titleJa).toBe(
      'アヴィニョンの娘たち',
    );
  });

  it('指定した歴史背景を原因として優先する', () => {
    expect(movementCause(movement('realism'), movements, relationships).label).toBe(
      '産業革命',
    );
    expect(
      movementCause(movement('impressionism'), movements, relationships).label,
    ).toBe('写真の発明公表');
    expect(movementCause(movement('baroque'), movements, relationships).label).toBe(
      '宗教改革',
    );
  });

  it('タグだけで地域・主題・作品・背景を確認できる', () => {
    const renaissance = movement('italian-renaissance');
    const cause = movementCause(renaissance, movements, relationships);
    const tags = movementTags(
      renaissance,
      representativeWork(renaissance, works),
      cause,
    );

    expect(tags.map((tag) => tag.kind)).toEqual(
      expect.arrayContaining(['地域', '主題', '作品', '背景']),
    );
    expect(tags.length).toBeLessThanOrEqual(5);
  });

  it('既存関係から継承表示と次に読む項目を導出する', () => {
    const post = movement('post-impressionism');
    const connection = incomingMovementConnection(
      post,
      movements,
      relationships,
    );

    expect(connection?.relationship.from).toBe('impressionism');
    expect(connection?.label).toContain('印象派');
    expect(nextMovement(movement('impressionism'), movements, relationships)?.id).toBe(
      'neo-impressionism',
    );
    expect(
      nextMovement(
        movement('italian-renaissance'),
        movements,
        relationships,
      )?.id,
    ).toBe('mannerism');
  });
});
