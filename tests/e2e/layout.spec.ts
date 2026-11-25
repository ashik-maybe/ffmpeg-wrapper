import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const widths = [1440, 1024, 820, 768, 390, 320]
const screenshotsDir = join(process.cwd(), 'tests/e2e/screenshots')

test.describe('layout', () => {
  test.beforeAll(() => {
    mkdirSync(screenshotsDir, { recursive: true })
  })

  for (const width of widths) {
    test(`no horizontal page scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await expect(
        page.getByRole('heading', { name: 'Describe the edit. Get a command that runs.' }),
      ).toBeVisible()

      await page.screenshot({ path: join(screenshotsDir, `width-${width}.png`), fullPage: true })

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalScroll).toBe(false)
    })
  }
})
