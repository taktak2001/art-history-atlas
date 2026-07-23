import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

// Next.js は metadata の manifest / icons に basePath を自動付与しないため、
// GitHub Pages のサブパスに合わせて明示的に前置する。
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: {
    default: '美術史アトラス｜Art History Atlas',
    template: '%s｜美術史アトラス',
  },
  description:
    '先史から現代までの美術の思想・様式・運動・流派を、時系列・地域・相互影響の観点から体系的に学ぶPWA。様式名の暗記ではなく、社会・思想・技術・制度と視覚表現の相互作用を理解するための学習ツール。',
  applicationName: '美術史アトラス',
  manifest: `${base}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '美術史アトラス',
  },
  icons: {
    icon: [{ url: `${base}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' }],
    apple: [{ url: `${base}/icons/apple-touch-icon.png`, sizes: '180x180' }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#161618' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// FOUC回避：レンダリング前に保存済みテーマを適用する
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('aha-theme');
    if (t === 'dark' || t === 'light') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
