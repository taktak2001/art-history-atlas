/** @type {import('next').NextConfig} */

// GitHub Pages のプロジェクトサイトはサブパス配下（/art-history-atlas）で配信される。
// production ビルド時のみ basePath / assetPrefix を付与する（ローカル開発はルート配信）。
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/art-history-atlas' : '';

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
