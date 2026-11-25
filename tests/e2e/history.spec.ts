import { expect, test } from '@playwright/test'

test('back after changing the file path moves the hash off the edited value', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('File path').fill('input.mp4')
  const hashAfterEdit = await page.evaluate(() => location.hash)
  await page.goBack()
  expect(await page.evaluate(() => location.hash)).not.toBe(hashAfterEdit)
})
