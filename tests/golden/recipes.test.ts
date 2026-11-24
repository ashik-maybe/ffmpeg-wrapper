import { describe, expect, it } from 'vitest'
import { render } from '../../src/core/render/index.ts'
import { recipes, toPlan } from '../../src/recipes/index.ts'

const values: Record<string, string> = {
  input: 'input.mp4',
  output: 'output.mp4',
  start: '00:00:10',
  duration: '5',
  list: 'list.txt',
  subs: 'subs.srt',
  logo: 'logo.png',
  text: 'Hello',
  fps: '10',
  audio: 'audio.m4a',
  segment_time: '6',
}

describe('recipe golden commands', () => {
  describe('web-h264', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'web-h264')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'libx264' -preset 'medium' -crf '23' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'web-h264')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'libx264' -preset 'medium' -crf '23' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'web-h264')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -c:v "libx264" -preset "medium" -crf "23" "output.mp4""`,
      )
    })
  })

  describe('web-av1', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'web-av1')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'libaom-av1' -crf '30' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'web-av1')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'libaom-av1' -crf '30' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'web-av1')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -c:v "libaom-av1" -crf "30" "output.mp4""`,
      )
    })
  })

  describe('web-vp9', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'web-vp9')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'libvpx-vp9' -speed '4' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'web-vp9')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'libvpx-vp9' -speed '4' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'web-vp9')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -c:v "libvpx-vp9" -speed "4" "output.mp4""`,
      )
    })
  })

  describe('web-hevc', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'web-hevc')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'libx265' -preset 'medium' -crf '28' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'web-hevc')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'libx265' -preset 'medium' -crf '28' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'web-hevc')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -c:v "libx265" -preset "medium" -crf "28" "output.mp4""`,
      )
    })
  })

  describe('nvenc', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'nvenc')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'h264_nvenc' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'nvenc')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -c:v 'h264_nvenc' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'nvenc')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -c:v "h264_nvenc" "output.mp4""`,
      )
    })
  })

  describe('trim-copy', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'trim-copy')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -ss '00:00:10' -t '5' -i 'input.mp4' -c 'copy' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'trim-copy')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -ss '00:00:10' -t '5' -i 'input.mp4' -c 'copy' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'trim-copy')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -ss "00:00:10" -t "5" -i "input.mp4" -c "copy" "output.mp4""`,
      )
    })
  })

  describe('trim-re-encode', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'trim-re-encode')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -ss '00:00:10' -t '5' -i 'input.mp4' -c:v 'libx264' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'trim-re-encode')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -ss '00:00:10' -t '5' -i 'input.mp4' -c:v 'libx264' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'trim-re-encode')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -ss "00:00:10" -t "5" -i "input.mp4" -c:v "libx264" "output.mp4""`,
      )
    })
  })

  describe('concat-same-codec', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'concat-same-codec')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -f 'concat' -i 'list.txt' -c 'copy' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'concat-same-codec')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -f 'concat' -i 'list.txt' -c 'copy' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'concat-same-codec')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -f "concat" -i "list.txt" -c "copy" "output.mp4""`,
      )
    })
  })

  describe('concat-re-encode', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'concat-re-encode')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -f 'concat' -i 'list.txt' -c:v 'libx264' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'concat-re-encode')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -f 'concat' -i 'list.txt' -c:v 'libx264' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'concat-re-encode')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -f "concat" -i "list.txt" -c:v "libx264" "output.mp4""`,
      )
    })
  })

  describe('extract-audio', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'extract-audio')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -vn -c:a 'aac' 'output.mp4'"`)
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'extract-audio')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -vn -c:a 'aac' 'output.mp4'"`)
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'extract-audio')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i "input.mp4" -vn -c:a "aac" "output.mp4""`)
    })
  })

  describe('loudnorm', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'loudnorm')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -af 'loudnorm' 'output.mp4'"`)
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'loudnorm')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -af 'loudnorm' 'output.mp4'"`)
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'loudnorm')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i "input.mp4" -af "loudnorm" "output.mp4""`)
    })
  })

  describe('burn-subtitles', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'burn-subtitles')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -vf 'subtitles' 'output.mp4'"`)
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'burn-subtitles')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -vf 'subtitles' 'output.mp4'"`)
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'burn-subtitles')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i "input.mp4" -vf "subtitles" "output.mp4""`)
    })
  })

  describe('embed-subtitles', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'embed-subtitles')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -i 'subs.srt' -c 'copy' -c:s 'mov_text' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'embed-subtitles')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -i 'subs.srt' -c 'copy' -c:s 'mov_text' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'embed-subtitles')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -i "subs.srt" -c "copy" -c:s "mov_text" "output.mp4""`,
      )
    })
  })

  describe('watermark', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'watermark')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -i 'logo.png' -vf 'overlay=0:0' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'watermark')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -i 'logo.png' -vf 'overlay=0:0' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'watermark')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -i "logo.png" -vf "overlay=0:0" "output.mp4""`,
      )
    })
  })

  describe('drawtext', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'drawtext')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'drawtext=text='\\''Hello'\\'':x=100:y=50' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'drawtext')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'drawtext=text=''Hello'':x=100:y=50' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'drawtext')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -vf "drawtext=text='Hello':x=100:y=50" "output.mp4""`,
      )
    })
  })

  describe('chromakey', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'chromakey')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'chromakey=color=0x00ff00:similarity=0.3' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'chromakey')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'chromakey=color=0x00ff00:similarity=0.3' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'chromakey')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -vf "chromakey=color=0x00ff00:similarity=0.3" "output.mp4""`,
      )
    })
  })

  describe('gif', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'gif')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -vf 'fps=10' 'output.mp4'"`)
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'gif')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -vf 'fps=10' 'output.mp4'"`)
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'gif')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i "input.mp4" -vf "fps=10" "output.mp4""`)
    })
  })

  describe('thumbnails', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'thumbnails')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -vf 'fps=1/60' 'output.mp4'"`)
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'thumbnails')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -vf 'fps=1/60' 'output.mp4'"`)
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'thumbnails')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i "input.mp4" -vf "fps=1/60" "output.mp4""`)
    })
  })

  describe('scale', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'scale')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'scale=iw/2:ih/2' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'scale')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'scale=iw/2:ih/2' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'scale')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -vf "scale=iw/2:ih/2" "output.mp4""`,
      )
    })
  })

  describe('crop', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'crop')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'crop=iw:ih/2:0:0' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'crop')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'crop=iw:ih/2:0:0' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'crop')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -vf "crop=iw:ih/2:0:0" "output.mp4""`,
      )
    })
  })

  describe('rotate', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'rotate')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'rotate=PI/2' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'rotate')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'rotate=PI/2' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'rotate')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -vf "rotate=PI/2" "output.mp4""`,
      )
    })
  })

  describe('replace-audio', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'replace-audio')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -i 'audio.m4a' 'output.mp4' -map '0:v' -map '1:a' -c 'copy'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'replace-audio')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -i 'audio.m4a' 'output.mp4' -map '0:v' -map '1:a' -c 'copy'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'replace-audio')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -i "audio.m4a" "output.mp4" -map "0:v" -map "1:a" -c "copy""`,
      )
    })
  })

  describe('hdr-to-sdr', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'hdr-to-sdr')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'zscale=range=limited' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'hdr-to-sdr')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -vf 'zscale=range=limited' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'hdr-to-sdr')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -vf "zscale=range=limited" "output.mp4""`,
      )
    })
  })

  describe('hls', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'hls')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' 'output.mp4' -f 'hls' -hls_time '6' -hls_list_size '0'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'hls')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' 'output.mp4' -f 'hls' -hls_time '6' -hls_list_size '0'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'hls')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" "output.mp4" -f "hls" -hls_time "6" -hls_list_size "0""`,
      )
    })
  })
})
