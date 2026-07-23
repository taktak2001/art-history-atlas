/*
 * 美術史アトラス Service Worker
 *
 * 方針:
 *  - バージョン付きキャッシュ名。activate時に古いキャッシュを削除し、更新時に残らないようにする。
 *  - アプリシェル（オフラインページ）をプリキャッシュ。
 *  - ナビゲーション: network-first → キャッシュ → offline.html。
 *  - 静的アセット(_next/static, icons, fonts): stale-while-revalidate。
 *  - 閲覧したページはランタイムキャッシュに保存するが、上限件数で古いものを削除し端末容量を圧迫しない。
 */
const VERSION = 'v1';
const SHELL_CACHE = `aha-shell-${VERSION}`;
const PAGES_CACHE = `aha-pages-${VERSION}`;
const ASSETS_CACHE = `aha-assets-${VERSION}`;
const PAGES_LIMIT = 40; // 閲覧ページのキャッシュ上限

const SHELL_ASSETS = ['/offline.html', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![SHELL_CACHE, PAGES_CACHE, ASSETS_CACHE].includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // 外部（画像CDN等）は制御しない

  // ナビゲーション: network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGES_CACHE).then((cache) => {
            cache.put(request, copy);
            trimCache(PAGES_CACHE, PAGES_LIMIT);
          });
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/offline.html');
        }),
    );
    return;
  }

  // 静的アセット: stale-while-revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:css|js|woff2?|png|svg|webmanifest)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
