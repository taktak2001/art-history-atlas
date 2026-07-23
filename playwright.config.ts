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
  webServer: {
    command: 'npx --yes serve out -l 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
