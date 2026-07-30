import { movements } from '../src/data/movements';
import { works } from '../src/data/works';

const imageWorks = works.filter((work) => work.image);
const nullImageWorks = works.filter((work) => !work.image);
const fileUrlCounts = new Map<string, string[]>();

for (const work of imageWorks) {
  const fileUrl = work.image?.fileUrl;
  if (!fileUrl) continue;
  fileUrlCounts.set(fileUrl, [...(fileUrlCounts.get(fileUrl) ?? []), work.id]);
}

const movementCoverage = movements.map((movement) => {
  const movementWorks = works.filter((work) =>
    work.movementIds.includes(movement.id),
  );
  const imageCount = movementWorks.filter((work) => work.image).length;

  return {
    id: movement.id,
    name: movement.nameJa,
    lod: movement.visibilityLevel,
    works: movementWorks.length,
    images: imageCount,
    missing: movementWorks.length - imageCount,
  };
});

const providerCounts = new Map<string, number>();
const licenseCounts = new Map<string, number>();

for (const work of imageWorks) {
  const image = work.image!;
  providerCounts.set(image.provider, (providerCounts.get(image.provider) ?? 0) + 1);
  licenseCounts.set(image.license, (licenseCounts.get(image.license) ?? 0) + 1);
}

const sortCounts = (counts: Map<string, number>) =>
  [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));

type HttpCheck = {
  workId: string;
  url: string;
  status: number | null;
  contentType: string | null;
  ok: boolean;
  error?: string;
};

const checkImageUrl = async (workId: string, url: string): Promise<HttpCheck> => {
  try {
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });
    const contentType = response.headers.get('content-type');
    await response.body?.cancel();
    return {
      workId,
      url,
      status: response.status,
      contentType,
      ok: response.ok && Boolean(contentType?.startsWith('image/')),
    };
  } catch (error) {
    return {
      workId,
      url,
      status: null,
      contentType: null,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const runHttpChecks = async (): Promise<HttpCheck[]> => {
  const queue = imageWorks
    .map((work) => ({
      workId: work.id,
      url: work.image?.fileUrl,
    }))
    .filter((item): item is { workId: string; url: string } =>
      Boolean(item.url),
    );
  const results: HttpCheck[] = [];
  const worker = async () => {
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) return;
      results.push(await checkImageUrl(next.workId, next.url));
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  return results.sort((left, right) => left.workId.localeCompare(right.workId));
};

const main = async () => {
  const httpChecks = process.argv.includes('--http') ? await runHttpChecks() : [];

  const report = {
  totals: {
    movements: movements.length,
    works: works.length,
    images: imageWorks.length,
    nullImages: nullImageWorks.length,
    imageCoveragePercent: Number(
      ((imageWorks.length / works.length) * 100).toFixed(1),
    ),
  },
  priorityGaps: {
    coreWithoutImages: movementCoverage.filter(
      (item) => item.lod === 'core' && item.images === 0,
    ),
    movementsWithoutImages: movementCoverage.filter((item) => item.images === 0),
    movementsWithOneImage: movementCoverage.filter((item) => item.images === 1),
  },
  duplicates: {
    fileUrls: [...fileUrlCounts.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([fileUrl, workIds]) => ({ fileUrl, workIds })),
    workTitles:
      works
        .map((work) => work.titleJa)
        .filter((title, index, titles) => titles.indexOf(title) !== index),
  },
  providers: sortCounts(providerCounts),
  licenses: sortCounts(licenseCounts),
  httpChecks: process.argv.includes('--http')
    ? {
        checked: httpChecks.length,
        passed: httpChecks.filter((item) => item.ok).length,
        failed: httpChecks.filter((item) => !item.ok),
      }
    : {
        checked: 0,
        note: 'Run `npm run audit:images -- --http` when network access is available.',
      },
  nullImageWorkIds: nullImageWorks.map((work) => work.id),
  };

  console.log(JSON.stringify(report, null, 2));

  if (
    report.duplicates.fileUrls.length > 0 ||
    report.duplicates.workTitles.length > 0 ||
    httpChecks.some((item) => !item.ok)
  ) {
    process.exitCode = 1;
  }
};

void main();
