import { expect, test } from '@playwright/test'

test('selects a grouped high-value outcome and shows the expected flag', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Prepare for web playback/ }).click()

  const receipt = page.getByRole('region', { name: 'Command receipt' })
  await expect(receipt.locator('code')).toContainText(/-movflags\s+['"]?\+faststart/)
})

test('inserts a raw snippet from the advanced drawer into the command', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Advanced' }).click()

  const dialog = page.getByRole('dialog', { name: 'Advanced command' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: /Strip metadata/ }).click()
  await dialog.getByRole('button', { name: 'Add to command' }).click()

  const receipt = page.getByRole('region', { name: 'Command receipt' })
  await expect(receipt.locator('code')).toContainText('-map_metadata -1')
})
