import { expect, test } from '@playwright/test'

test('back after changing the file path returns to the earlier hash', async ({ page }) => {
  await page.goto('/')
  const hashBefore = await page.evaluate(() => location.hash)
  await page.getByLabel('File path').fill('input.mp4')
  await page.goBack()
  expect(await page.evaluate(() => location.hash)).toBe(hashBefore)
})
