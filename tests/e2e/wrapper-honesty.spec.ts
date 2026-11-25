import { expect, test } from '@playwright/test'

test('states the web app builds commands only', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/builds commands only/i)).toBeVisible()
})

test('makes no execution claim and states browser does not run FFmpeg', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/does not run ffmpeg/i)).toBeVisible()
  await expect(page.getByText(/runs ffmpeg commands/i)).toHaveCount(0)
})

test('coverage panel mentions TUI execution and limits', async ({ page }) => {
  await page.goto('/')
  const coverage = page.getByRole('region', { name: 'Coverage' })
  await coverage.scrollIntoViewIfNeeded()
  await expect(coverage.getByText(/TUI does the execution/i)).toBeVisible()
  await expect(coverage.getByText(/Linux only/i)).toBeVisible()
  await expect(coverage.getByText(/--run/)).toBeVisible()
  await expect(coverage.getByText(/--yes/)).toBeVisible()
  await expect(coverage.getByText(/--force/)).toBeVisible()
  await expect(coverage.getByText(/--unsafe/)).toBeVisible()
  await expect(coverage.getByText(/Ctrl\+C/)).toBeVisible()
})
