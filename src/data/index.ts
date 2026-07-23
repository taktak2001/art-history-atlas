import type { Dataset } from '@/lib/schema';
import { movements } from './movements';
import { artists } from './artists';
import { works } from './works';
import { relationships } from './relationships';
import { sources } from './sources';

/** アプリ全体で参照する単一のデータセット。 */
export const dataset: Dataset = {
  movements,
  artists,
  works,
  relationships,
  sources,
};

export { movements, artists, works, relationships, sources };
