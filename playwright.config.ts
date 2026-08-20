import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3400',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3400',
    url: 'http://127.0.0.1:3400',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NUXT_SESSION_SECRET: 'playwright-session-secret-at-least-32-characters' },
  },
})
