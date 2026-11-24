import { expect, test } from '@playwright/test'

test('keyboard-only flow selects an outcome and shows command', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Describe the edit. Get a command that runs.' }),
  ).toBeVisible()

  const outcome = page.getByRole('button', { name: /Trim/ })
  for (let i = 0; i < 50; i += 1) {
    await page.keyboard.press('Tab')
    if (await outcome.evaluate((el) => el === document.activeElement)) break
  }

  await expect(outcome).toBeFocused()
  await page.keyboard.press('Enter')

  const receipt = page.getByRole('region', { name: 'Command receipt' })
  await expect(receipt.locator('code')).toBeVisible()
  await expect(receipt.locator('code')).not.toBeEmpty()
})
