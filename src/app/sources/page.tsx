import type { Metadata } from 'next';
import Link from 'next/link';
import { sources, movements } from '@/lib/dataset';
import { SourceList } from '@/components/SourceList';

export const metadata: Metadata = {
  title: '出典一覧',
  description: '本サイトの記述が依拠する、美術館・大学・研究機関等の公開資料の一覧。',
};

export default function SourcesPage() {
  // 各出典を参照しているムーブメント
  const referencedBy = (sourceId: string) =>
    movements.filter((m) => m.sourceIds.includes(sourceId));

  const highCount = sources.filter((s) => s.reliability === 'high').length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-faint">Sources</p>
      <h1 className="mt-3 font-serif text-3xl">出典一覧</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        本サイトの記述は、以下の美術館・大学・研究機関等の公開資料に基づきます（全{sources.length}件、うち信頼性「高」{highCount}件）。
        一般ブログ・まとめサイトのみを根拠にはしていません。各URLは参照日時点で到達可能性を確認しています。
        リンク先の内容は各機関に帰属します。
      </p>

      <div className="mt-8 space-y-6">
        {sources.map((s) => {
          const refs = referencedBy(s.id);
          return (
            <div key={s.id} className="border hairline bg-raised p-4">
              <SourceList sources={[s]} />
              {refs.length > 0 && (
                <div className="mt-3 border-t hairline pt-3">
                  <p className="text-xs text-faint">この出典を参照しているムーブメント：</p>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {refs.map((m) => (
                      <li key={m.id}>
                        <Link href={`/movements/${m.id}/`} className="rounded-sm bg-surface px-2 py-0.5 text-xs text-muted hover:text-ink">
                          {m.nameJa}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
