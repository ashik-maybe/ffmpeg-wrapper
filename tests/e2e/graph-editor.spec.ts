import { expect, test } from '@playwright/test'

test('typing a filter chain shows the rendered command', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('textbox', { name: 'Filter graph' }).fill('null,scale=w=1280')
  await expect(page.locator('code.ui-graph__command')).toBeVisible()
  await expect(page.locator('code.ui-graph__command')).toContainText('null,scale=w=1280')
})
