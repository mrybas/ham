import { test, expect } from '@playwright/test'

// Single spec covering the core user story: pick a warm-up → start → reverse.
// Audio won't actually sound in headless Chromium, but the scheduler, state,
// and UI all run, which is what we assert on.

test('setup → start → running screen shows a note and direction', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.su-logo')).toContainText('ham')

  await page.selectOption('.su-select', 'five-tone-major')
  await page.click('.su-start')

  // Running screen renders with a current note (e.g. "D4") and an up arrow.
  await expect(page.locator('.rs-notename')).toBeVisible()
  await expect(page.locator('.rs-notename')).toHaveText(/^[A-G]#?\d$/)
  await expect(page.locator('.rs-dir')).toHaveText('↑')
})

test('Reverse flips the direction arrow immediately', async ({ page }) => {
  await page.goto('./')
  await page.click('.su-start')
  await expect(page.locator('.rs-dir')).toHaveText('↑')
  await page.click('.rs-reverse')
  await expect(page.locator('.rs-dir')).toHaveText('↓')
})

test('tempo can be changed on the running screen', async ({ page }) => {
  await page.goto('./')
  await page.click('.su-start')
  const before = await page.locator('.rs-tempo-val').innerText()
  await page.click('.rs-tempo-btn >> nth=1') // the "+" button
  await expect(page.locator('.rs-tempo-val')).not.toHaveText(before)
})
