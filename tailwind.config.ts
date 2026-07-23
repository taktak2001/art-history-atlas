import type { Config } from 'tailwindcss';

/**
 * 美術史アトラスのデザインシステム。
 * オフホワイト／チャコール／グレーを基調とし、時代・関係性の識別に限って彩色を用いる。
 * セリフ体（見出し・欧文タイトル）とサンセリフ体（本文・UI）を併用する。
 */
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 紙・石・墨・金属を想起させる無彩色ベース（CSS変数経由でダークモードに追従）
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Hiragino Mincho ProN', 'YuMincho', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
        layout: '1200px',
      },
      transitionTimingFunction: {
        exhibit: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
      },
    },
  },
  plugins: [],
};

export default config;
