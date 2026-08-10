import { defineConfig, devices } from '@playwright/test';

// この環境ではプリインストール済みChromiumを使う（PW_EXECUTABLE_PATHで指定）。
// CI等ではPlaywrightが自前でインストールしたブラウザを使う（未設定なら既定）。
const executablePath = process.env.PW_EXECUTABLE_PATH || undefined;
const launchOptions = executablePath ? { executablePath } : {};

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
    launchOptions,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], launchOptions },
    },
    {
      // iPhoneのwebkitではなくChromiumでモバイルビューポートを再現（webkit未導入のため）
      name: 'mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        launchOptions,
      },
    },
  ],
  // out/ をルート配信して検証する（NEXT_PUBLIC_DISABLE_BASEPATH=1 でビルドすること）。
  // Python の http.server を用いる（環境非依存で安定）。
  webServer: {
    command: 'python3 -m http.server 3100 --bind 127.0.0.1 --directory out',
    url: 'http://127.0.0.1:3100/',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'ignore',
    timeout: 120000,
  },
});
