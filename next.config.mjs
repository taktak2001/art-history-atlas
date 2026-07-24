/** @type {import('next').NextConfig} */

// GitHub Pages のプロジェクトサイトはサブパス配下（/art-history-atlas）で配信される。
// production ビルド時のみ basePath / assetPrefix を付与する（ローカル開発はルート配信）。
// ローカル E2E（out/ をルート配信して検証）では NEXT_PUBLIC_DISABLE_BASEPATH=1 で無効化できる。
// 本番デプロイでは常に付与される（この env は CI/デプロイでは設定しない）。
const isProd = process.env.NODE_ENV === 'production';
const disableBasePath = process.env.NEXT_PUBLIC_DISABLE_BASEPATH === '1';
const basePath = isProd && !disableBasePath ? '/art-history-atlas' : '';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  // クライアント/Service Worker から参照できるよう公開
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    // 静的エクスポート（GitHub Pages）のため最適化を無効化し、明示サイズ + lazy で対応する
    unoptimized: true,
  },
  // ディレクトリ配信を安定させる（/route/ → /route/index.html）
  trailingSlash: true,
};

export default nextConfig;
