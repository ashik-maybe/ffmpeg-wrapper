import { expect, test } from '@playwright/test'

const PASTED_OUTPUT = [
  'ffmpeg version 9.1 Copyright (c) 2000-2025 the FFmpeg Developers',
  '',
  'Encoders:',
  ' V....D libx264               H.264/AVC/MPEG-4 AVC codec (codec h264)',
  ' A....D pcm_s16le             PCM signed 16-bit little-endian (codec pcm_s16le)',
  '',
  'Filters:',
  '  scale                       Scale video frames',
  '  crop                        Crop the video frames',
].join('\n')

test('build check shows the summary for pasted ffmpeg output', async ({ page }) => {
  await page.goto('/')
  const buildCheck = page.getByRole('region', { name: 'Build check' })
  await page.getByRole('textbox', { name: 'Pasted ffmpeg output' }).fill(PASTED_OUTPUT)
  await expect(buildCheck.locator('output.ui-callout')).toBeVisible()
  await expect(buildCheck.locator('output.ui-callout')).toContainText('Version: 9.1 matches')
})
