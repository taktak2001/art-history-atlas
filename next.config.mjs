/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    // 静的エクスポートのため最適化は無効化し、明示的なwidth/height + loading=lazy で対応する
    unoptimized: true,
  },
  // 静的ホスティング（Vercel/任意のCDN）で末尾スラッシュのディレクトリ配信を安定させる
  trailingSlash: true,
};

export default nextConfig;
