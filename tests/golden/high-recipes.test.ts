import { describe, expect, it } from 'vitest'
import { render } from '../../src/core/render/index.ts'
import { recipes, toPlan } from '../../src/recipes/index.ts'

const values: Record<string, string> = {
  input: 'input.mp4',
  output: 'output.mp4',
  left: 'left.mp4',
  right: 'right.mp4',
  script: 'script.txt',
  image: 'image.png',
  title: 'Title',
  language: 'eng',
}

describe('high-value recipe golden commands', () => {
  describe('faststart', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'faststart')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -movflags '+faststart' 'output.mp4.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'faststart')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -movflags '+faststart' 'output.mp4.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'faststart')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -movflags "+faststart" "output.mp4.mp4""`,
      )
    })
  })

  describe('strip-metadata', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'strip-metadata')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -map_metadata '-1' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'strip-metadata')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -map_metadata '-1' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'strip-metadata')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -map_metadata "-1" "output.mp4""`,
      )
    })
  })

  describe('set-metadata', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'set-metadata')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -metadata 'title=Title' -metadata:s:a:0 'language=eng' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'set-metadata')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -metadata 'title=Title' -metadata:s:a:0 'language=eng' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'set-metadata')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -metadata "title=Title" -metadata:s:a:0 "language=eng" "output.mp4""`,
      )
    })
  })

  describe('disposition', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'disposition')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -disposition 'default' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'disposition')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -disposition 'default' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'disposition')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -disposition "default" "output.mp4""`,
      )
    })
  })

  describe('force-keyframes', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'force-keyframes')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -force_key_frames 'expr:gte(t,n_forced*5)' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'force-keyframes')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -force_key_frames 'expr:gte(t,n_forced*5)' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'force-keyframes')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -force_key_frames "expr:gte(t,n_forced*5)" "output.mp4""`,
      )
    })
  })

  describe('copyts', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'copyts')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -copyts 'output.mp4'"`)
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'copyts')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i 'input.mp4' -copyts 'output.mp4'"`)
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'copyts')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -i "input.mp4" -copyts "output.mp4""`)
    })
  })

  describe('avoid-negative-ts', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'avoid-negative-ts')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -avoid_negative_ts 'make_zero' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'avoid-negative-ts')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -avoid_negative_ts 'make_zero' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'avoid-negative-ts')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -avoid_negative_ts "make_zero" "output.mp4""`,
      )
    })
  })

  describe('explicit-map', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'explicit-map')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -map '0:v' -map '0:a' -c 'copy' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'explicit-map')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -map '0:v' -map '0:a' -c 'copy' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'explicit-map')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -map "0:v" -map "0:a" -c "copy" "output.mp4""`,
      )
    })
  })

  describe('side-by-side', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'side-by-side')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'left.mp4' -i 'right.mp4' -filter_complex 'hstack' -map '0:a?' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'side-by-side')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'left.mp4' -i 'right.mp4' -filter_complex 'hstack' -map '0:a?' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'side-by-side')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "left.mp4" -i "right.mp4" -filter_complex "hstack" -map "0:a?" "output.mp4""`,
      )
    })
  })

  describe('filter-script', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'filter-script')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -filter_complex_script 'script.txt' 'output.mp4'"`,
      )
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'filter-script')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i 'input.mp4' -filter_complex_script 'script.txt' 'output.mp4'"`,
      )
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'filter-script')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(
        `"ffmpeg -i "input.mp4" -filter_complex_script "script.txt" "output.mp4""`,
      )
    })
  })

  describe('loop-image', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'loop-image')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -loop '1' -i 'image.png' 'output.mp4'"`)
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'loop-image')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -loop '1' -i 'image.png' 'output.mp4'"`)
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'loop-image')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -loop "1" -i "image.png" "output.mp4""`)
    })
  })

  describe('lavfi-null-test', () => {
    it('posix', () => {
      const recipe = recipes.find((r) => r.id === 'lavfi-null-test')!
      const plan = toPlan(recipe, values, 'posix')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -f 'lavfi' -i 'testsrc' -f 'null' '-'"`)
    })

    it('powershell', () => {
      const recipe = recipes.find((r) => r.id === 'lavfi-null-test')!
      const plan = toPlan(recipe, values, 'powershell')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'powershell')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -f 'lavfi' -i 'testsrc' -f 'null' '-'"`)
    })

    it('cmd', () => {
      const recipe = recipes.find((r) => r.id === 'lavfi-null-test')!
      const plan = toPlan(recipe, values, 'cmd')
      const command = render({ tool: plan.recipe.tool, args: plan.args }, 'cmd')

      expect(command.length).toBeGreaterThan(0)
      expect(command.startsWith('ffmpeg')).toBe(true)
      expect(command).not.toContain('undefined')
      expect(command).toMatchInlineSnapshot(`"ffmpeg -f "lavfi" -i "testsrc" -f "null" "-""`)
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
})
