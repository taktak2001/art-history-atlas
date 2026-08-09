import { describe, it, expect } from 'vitest';
import { movements } from '@/data/movements';
import { sources } from '@/data/sources';
import { scholarlyNotes } from '@/data/expansion/scholarly-notes';
import { ScholarlyNote } from '@/lib/schema';

const withNote = movements.filter((m) => m.scholarlyNote);

describe('研究上の留保（scholarlyNote）', () => {
  it('スキーマに適合する', () => {
    for (const movement of withNote) {
      const parsed = ScholarlyNote.safeParse(movement.scholarlyNote);
      expect(parsed.success, movement.id).toBe(true);
    }
  });

  it('見出しと本文が空でない', () => {
    for (const movement of withNote) {
      const note = movement.scholarlyNote!;
      expect(note.heading.trim().length, movement.id).toBeGreaterThan(0);
      expect(note.body.trim().length, movement.id).toBeGreaterThan(0);
    }
  });

  it('一律の「学説上の注意」を見出しに使わない', () => {
    for (const movement of withNote) {
      expect(movement.scholarlyNote!.heading, movement.id).not.toBe('学説上の注意');
    }
  });

  it('見出しは何についての留保か分かる長さに収める', () => {
    for (const movement of withNote) {
      const heading = movement.scholarlyNote!.heading;
      expect(heading.length, `${movement.id}: ${heading}`).toBeGreaterThanOrEqual(2);
      expect(heading.length, `${movement.id}: ${heading}`).toBeLessThanOrEqual(24);
    }
  });

  it('本文はスマホで読める長さに収める', () => {
    for (const movement of withNote) {
      const body = movement.scholarlyNote!.body;
      expect(body.length, `${movement.id}: ${body.length}字`).toBeLessThanOrEqual(220);
      expect(body.length, movement.id).toBeGreaterThanOrEqual(20);
    }
  });

  it('「〜を扱う」だけの編集方針を注意書きにしない', () => {
    for (const movement of withNote) {
      expect(
        /を(扱う|概観する)。?$/.test(movement.scholarlyNote!.body.trim()),
        movement.id,
      ).toBe(false);
    }
  });

  it('sourceIds は実在し、そのムーブメントに紐づく出典だけを使う', () => {
    const sourceIds = new Set(sources.map((source) => source.id));
    for (const movement of withNote) {
      for (const id of movement.scholarlyNote!.sourceIds) {
        expect(sourceIds.has(id), `${movement.id}: ${id}`).toBe(true);
        expect(movement.sourceIds.includes(id), `${movement.id}: ${id}`).toBe(true);
      }
    }
  });

  it('誤解と適切な理解の型を代表例で満たす', () => {
    // 琳派: 系譜の誤解を明示する
    const rinpa = movements.find((m) => m.id === 'rinpa')!;
    expect(rinpa.scholarlyNote?.heading).toBe('系譜について');
    // 「よくある理解」を提示してから否定する形になっている
    expect(rinpa.scholarlyNote?.body).toContain('理解されることがあるが');
    expect(rinpa.scholarlyNote?.body).toContain('連続はない');
    // 専門語は同じ文で言い換える
    expect(rinpa.scholarlyNote?.body).toContain('手本として学び');

    // もの派: 運動としてのまとまりを限定する
    const monoHa = movements.find((m) => m.id === 'mono-ha')!;
    expect(monoHa.scholarlyNote?.heading).toBe('運動としてのまとまり');
    expect(monoHa.scholarlyNote?.body).toContain('後世');
  });

  it('参照マップに存在しない movementId が混入していない', () => {
    const ids = new Set(movements.map((m) => m.id));
    const stray = Object.keys(scholarlyNotes).filter((id) => !ids.has(id));
    expect(stray).toEqual([]);
  });

  it('旧データ（dates.note のみ）でも表示できる状態を保つ', () => {
    const dateOnly = movements.filter((m) => !m.scholarlyNote && m.dates.note);
    expect(dateOnly.length).toBeGreaterThan(0);
    for (const movement of dateOnly) {
      expect(typeof movement.dates.note).toBe('string');
    }
  });
});
