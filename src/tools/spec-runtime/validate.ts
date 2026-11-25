import type { Arg, Finding, Recipe } from '../../core/types'
import type { RuntimeSpec } from './types'

const HARDWARE_ENCODER = /(nvenc|qsv|vaapi|amf|videotoolbox|v4l2m2m|mf)/i
const ENCODER_FLAGS = new Set(['c', 'c:v', 'c:a', 'codec', 'vcodec', 'acodec'])

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

  // Mark hardware recipes unverified when their encoder is absent.
  // If recipe uses hardware encoder and it's missing, we already reported.
  // If recipe is hardware-oriented but no encoder arg found, check confidence? No, keep simple.
  return findings
}
