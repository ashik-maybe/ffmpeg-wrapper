import { expect, test } from '@playwright/test'

test('deep link selects the recipe from the hash', async ({ page }) => {
  await page.goto('/#page=home&recipeId=web-vp9&file=clip.mp4')
  await expect(page.getByLabel('File path')).toHaveValue('clip.mp4')
  await expect(page.getByRole('region', { name: 'Command receipt' }).locator('code')).toContainText(
    'libvpx-vp9',
  )
})
