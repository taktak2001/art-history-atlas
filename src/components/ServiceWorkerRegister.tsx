'use client';

import { useEffect } from 'react';

/**
 * Service Workerの登録。
 * 更新時に古いキャッシュが残り続けないよう、SW側で version 付きキャッシュを
 * activate時に掃除する（public/sw.js を参照）。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    // GitHub Pages のサブパス配下では basePath を付けて登録・スコープ設定する
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const onLoad = () => {
      navigator.serviceWorker
        .register(`${base}/sw.js`, { scope: `${base}/` })
        .catch(() => {
          /* 登録失敗は致命的ではない（オフライン機能が無効になるのみ） */
        });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
