import { defineConfig, devices } from '@playwright/test'

// e2e runs against the dev server (which Playwright starts itself).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  use: {
    // A dedicated strict port so we never collide with another Vite app (e.g.
    // shed.) on the default 5173 and end up testing the wrong site.
    baseURL: 'http://localhost:5199/',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev -- --port 5199 --strictPort',
    url: 'http://localhost:5199/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
