import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('accessibility', () => {
  test('axe on empty state', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { name: 'FFmpeg command generator for video edits' }),
    ).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('axe on filled state', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('File path').fill('input.mp4')
    await page.getByRole('button', { name: /Trim/ }).click()
    await expect(
      page.getByRole('region', { name: 'Command receipt' }).locator('code'),
    ).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
