import { describe, it, expect } from 'vitest';
import {
  Movement,
  Artist,
  Work,
  Relationship,
  Source,
} from '@/lib/schema';
import { movements } from '@/data/movements';
import { artists } from '@/data/artists';
import { works } from '@/data/works';
import { relationships } from '@/data/relationships';
import { sources } from '@/data/sources';
import { auditMovementContentTaxonomy } from '@/lib/movement-content-taxonomy';

describe('データスキーマ検証', () => {
  it('全ムーブメントがスキーマに適合する', () => {
    for (const m of movements) {
      expect(() => Movement.parse(m), m.id).not.toThrow();
    }
  });
  it('全作家がスキーマに適合する', () => {
    for (const a of artists) expect(() => Artist.parse(a), a.id).not.toThrow();
  });
  it('全作品がスキーマに適合する', () => {
    for (const w of works) expect(() => Work.parse(w), w.id).not.toThrow();
  });
  it('全関係がスキーマに適合する', () => {
    for (const r of relationships) expect(() => Relationship.parse(r), r.id).not.toThrow();
  });
  it('全出典がスキーマに適合する', () => {
    for (const s of sources) expect(() => Source.parse(s), s.id).not.toThrow();
  });
});

describe('IDの一意性', () => {
  const dup = (ids: string[]) => ids.filter((v, i) => ids.indexOf(v) !== i);
  it('ムーブメントIDは一意', () => expect(dup(movements.map((m) => m.id))).toEqual([]));
  it('作家IDは一意', () => expect(dup(artists.map((a) => a.id))).toEqual([]));
  it('作品IDは一意', () => expect(dup(works.map((w) => w.id))).toEqual([]));
  it('関係IDは一意', () => expect(dup(relationships.map((r) => r.id))).toEqual([]));
  it('出典IDは一意', () => expect(dup(sources.map((s) => s.id))).toEqual([]));
});

describe('年代範囲の妥当性', () => {
  it('終了年は開始年以上（またはnull）', () => {
    for (const m of movements) {
      if (m.dates.end !== null) expect(m.dates.end, m.id).toBeGreaterThanOrEqual(m.dates.start);
    }
  });
  it('最盛期の範囲が正しい', () => {
    for (const m of movements) {
      if (m.dates.peak) {
        expect(m.dates.peak[0], m.id).toBeLessThanOrEqual(m.dates.peak[1]);
      }
    }
  });
  it('作家の没年は生年以上（両方存在する場合）', () => {
    for (const a of artists) {
      if (a.born !== null && a.died !== null) expect(a.died, a.id).toBeGreaterThanOrEqual(a.born);
    }
  });
});

describe('出典URLの形式', () => {
  it('全出典URLが http(s) で始まる有効なURL', () => {
    for (const s of sources) {
      expect(/^https?:\/\//.test(s.url), `${s.id}: ${s.url}`).toBe(true);
      expect(() => new URL(s.url), s.id).not.toThrow();
    }
  });
});

describe('画像ライセンス情報の必須チェック', () => {
  it('画像がある作品はライセンス・クレジット・出典URLを持つ', () => {
    for (const w of works) {
      if (w.image) {
        expect(w.image.license, w.id).toBeTruthy();
        expect(w.image.credit, w.id).toBeTruthy();
        expect(() => new URL(w.image!.sourceUrl), w.id).not.toThrow();
      }
    }
  });
});

describe('関係エッジの参照整合性', () => {
  const movementIds = new Set(movements.map((m) => m.id));
  const sourceIds = new Set(sources.map((s) => s.id));

  it('全エッジのfrom/toが実在するムーブメントを参照', () => {
    for (const r of relationships) {
      expect(movementIds.has(r.from), `${r.id}.from`).toBe(true);
      expect(movementIds.has(r.to), `${r.id}.to`).toBe(true);
    }
  });
  it('自己参照エッジは存在しない', () => {
    for (const r of relationships) expect(r.from, r.id).not.toBe(r.to);
  });
  it('エッジの出典は実在する', () => {
    for (const r of relationships) {
      for (const sid of r.sourceIds) expect(sourceIds.has(sid), `${r.id}:${sid}`).toBe(true);
    }
  });
});

describe('相互参照の整合性', () => {
  const movementIds = new Set(movements.map((m) => m.id));
  const artistIds = new Set(artists.map((a) => a.id));
  const workIds = new Set(works.map((w) => w.id));
  const sourceIds = new Set(sources.map((s) => s.id));

  it('ムーブメントが参照する作家・作品・出典が実在', () => {
    for (const m of movements) {
      m.artistIds.forEach((id) => expect(artistIds.has(id), `${m.id}->${id}`).toBe(true));
      m.workIds.forEach((id) => expect(workIds.has(id), `${m.id}->${id}`).toBe(true));
      m.sourceIds.forEach((id) => expect(sourceIds.has(id), `${m.id}->${id}`).toBe(true));
      expect(m.sourceIds.length, `${m.id} 出典必須`).toBeGreaterThan(0);
    }
  });
  it('作品が参照するムーブメント・出典が実在', () => {
    for (const w of works) {
      w.movementIds.forEach((id) => expect(movementIds.has(id), `${w.id}->${id}`).toBe(true));
      w.sourceIds.forEach((id) => expect(sourceIds.has(id), `${w.id}->${id}`).toBe(true));
    }
  });
});

describe('収録規模（MVP要件）', () => {
  it('約30件のムーブメントを収録', () => {
    expect(movements.length).toBeGreaterThanOrEqual(30);
  });
  it('各ムーブメントに最低1件の出典がある', () => {
    for (const m of movements) expect(m.sourceIds.length, m.id).toBeGreaterThan(0);
  });
  it('各ムーブメントに鑑賞ポイントがある', () => {
    for (const m of movements) expect(m.viewingPoints.length, m.id).toBeGreaterThan(0);
  });
});

describe('Movement詳細の情報分類', () => {
  it('全54件で技法と媒体・素材が見た目の特徴へ混入していない', () => {
    expect(movements).toHaveLength(54);
    expect(auditMovementContentTaxonomy(movements)).toEqual([]);
  });

  it('琳派は見た目・構図・色彩・技法・媒体を重複なく説明する', () => {
    const rinpa = movements.find((movement) => movement.id === 'rinpa');
    expect(rinpa).toMatchObject({
      visualTraits: '金銀地、平面的な色面、大胆な余白、図様の反復・切断、波や植物のリズム。',
      compositionSpace:
        '屏風や器面の連続を生かし、対象を拡大・反復・切断して、装飾と空間を一体化する。',
      colorLight:
        '金銀の反射と、群青・緑青・胡粉・墨の対比が、見る位置や自然光によって表情を変える。',
      technique: 'たらし込み、箔押し、型紙、蒔絵など。',
      materials:
        '紙、絹、金銀箔、墨、岩絵具、漆、陶土、染料。屏風、扇面、陶器、染織にも展開した。',
    });
  });
});
