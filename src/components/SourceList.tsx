import type { Source } from '@/lib/schema';
import { toDisplayText } from '@/lib/movement-detail';

const KIND_LABELS: Record<Source['kind'], string> = {
  museum: '美術館',
  university: '大学・研究機関',
  encyclopedia: '事典',
  book: '専門書',
  foundation: '財団',
  archive: 'アーカイブ',
};

const RELIABILITY_LABELS: Record<Source['reliability'], string> = {
  high: '信頼性：高',
  medium: '信頼性：中',
};

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) {
    return <p className="text-sm text-faint">出典データがありません。</p>;
  }
  return (
    <ol className="space-y-3">
      {sources.map((s) => (
        <li key={s.id} className="border-l-2 hairline pl-3 text-sm">
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="prose-link font-medium"
          >
            {toDisplayText(s.title)}
          </a>
          <span className="ml-1 text-xs text-faint">↗</span>
          <p className="mt-0.5 text-muted">{toDisplayText(s.publisher)}</p>
          <p className="mt-0.5 text-xs text-faint">
            {KIND_LABELS[s.kind]}・{RELIABILITY_LABELS[s.reliability]}・参照日 {s.accessed}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            対応する記述：{toDisplayText(s.supports)}
          </p>
        </li>
      ))}
    </ol>
  );
}
