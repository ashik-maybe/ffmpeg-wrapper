import type { Arg, Finding, Recipe } from '../../core/types'
import type { RuntimeSpec } from './types'

const HARDWARE_ENCODER = /(nvenc|qsv|vaapi|amf|videotoolbox|v4l2m2m|mf)/i
const ENCODER_FLAGS = new Set(['c', 'c:v', 'c:a', 'codec', 'vcodec', 'acodec'])

const RECIPE_REQUIRED_OPTIONS: Readonly<Record<string, readonly string[]>> = {
  faststart: ['movflags'],
  'force-keyframes': ['force_key_frames'],
  disposition: ['disposition'],
}

const RECIPE_REQUIRED_ENCODERS: Readonly<Record<string, readonly string[]>> = {
  'web-h264': ['libx264'],
}

function isEncoderArg(arg: Arg): boolean {
  if (arg.kind !== 'option') return false
  const names = [arg.name, arg.alias].filter((v): v is string => Boolean(v))
  return names.some((n) => ENCODER_FLAGS.has(n.replace(/^-+/, '')))
}

function flagNames(arg: Arg): string[] {
  if (arg.kind === 'value') return []
  return [arg.name, arg.alias]
    .filter((v): v is string => Boolean(v))
    .map((n) => n.replace(/^-+/, ''))
}

function isKnownOption(name: string, spec: RuntimeSpec): boolean {
  const normalized = name.replace(/^-+/, '')
  if (spec.options.includes(normalized)) return true
  // accept common stream-spec variants like c:v, b:v if base known
  const base = normalized.split(':')[0]
  return spec.options.includes(base)
}

export function validateAgainstRuntime(spec: RuntimeSpec, recipe: Recipe): Finding[] {
  const findings: Finding[] = []
  const file = `recipe:${recipe.id}`

  for (const arg of recipe.args) {
    const names = flagNames(arg)
    if (names.length === 0) continue
    if (names.some((name) => isKnownOption(name, spec))) continue
    findings.push({
      severity: 'error',
      code: 'E_UNKNOWN_OPTION',
      message: `Unknown option: -${names[0]}`,
      file,
    })
  }

  const encoderArgs = recipe.args.filter(isEncoderArg)
  for (const arg of encoderArgs) {
    const value = arg.value
    if (!value) continue
    const missing = !spec.encoders.includes(value)
    const hardware = HARDWARE_ENCODER.test(value)
    if (missing) {
      findings.push({
        severity: hardware ? 'warning' : 'error',
        code: 'E_UNVERIFIED',
        message: hardware
          ? `Hardware encoder unavailable, recipe unverified: ${value}`
          : `Missing encoder: ${value}`,
        file,
      })
    } else if (hardware) {
      // Hardware encoder present - no unverified finding needed from absence.
    }
  }

  const requiredOptions = RECIPE_REQUIRED_OPTIONS[recipe.id] ?? []
  for (const option of requiredOptions) {
    if (isKnownOption(option, spec)) continue
    if (findings.some((f) => f.code === 'E_UNKNOWN_OPTION' && f.message.includes(option))) continue
    findings.push({
      severity: 'error',
      code: 'E_UNKNOWN_OPTION',
      message: `Unknown option: -${option}`,
      file,
    })
  }

  const requiredEncoders = RECIPE_REQUIRED_ENCODERS[recipe.id] ?? []
  for (const encoder of requiredEncoders) {
    if (spec.encoders.includes(encoder)) continue
    if (findings.some((f) => f.code === 'E_UNVERIFIED' && f.message.includes(encoder))) continue
    const hardware = HARDWARE_ENCODER.test(encoder)
    findings.push({
      severity: hardware ? 'warning' : 'error',
      code: 'E_UNVERIFIED',
      message: hardware
        ? `Hardware encoder unavailable, recipe unverified: ${encoder}`
        : `Missing encoder: ${encoder}`,
      file,
    })
  }

  return findings
}
