import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface BinaryDetection {
  readonly name: 'ffmpeg' | 'ffprobe'
  readonly path: string
  readonly version: string
}

export type DetectErrorCode = 'NOT_FOUND'

export interface DetectError {
  readonly name: 'ffmpeg' | 'ffprobe'
  readonly code: DetectErrorCode
  readonly message: string
}

export interface DetectBinariesResult {
  readonly ffmpeg?: BinaryDetection
  readonly ffprobe?: BinaryDetection
  readonly errors: readonly DetectError[]
}

export interface DetectBinariesOptions {
  readonly ffmpegPath?: string
  readonly ffprobePath?: string
}

export function parseVersion(output: string): string | undefined {
  const match = output.match(/\b(?:ffmpeg|ffprobe)\s+version\s+(\S+)/i)
  if (match?.[1]) return match[1].trim()
  const fallback = output.match(/\bversion\s+(\S+)/i)
  return fallback?.[1]?.trim()
}

async function detectOne(
  name: 'ffmpeg' | 'ffprobe',
  path: string,
): Promise<BinaryDetection | DetectError> {
  try {
    const { stdout, stderr } = await execFileAsync(path, ['-version'], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    })
    const version = parseVersion(`${stdout}\n${stderr}`)
    if (!version) {
      return { name, code: 'NOT_FOUND', message: `${name} version not found in output` }
    }
    return { name, path, version }
  } catch {
    return { name, code: 'NOT_FOUND', message: `${name} not found` }
  }
}

export async function detectBinaries(
  options: DetectBinariesOptions = {},
): Promise<DetectBinariesResult> {
  const [ffmpeg, ffprobe] = await Promise.all([
    detectOne('ffmpeg', options.ffmpegPath ?? 'ffmpeg'),
    detectOne('ffprobe', options.ffprobePath ?? 'ffprobe'),
  ])

  const errors: DetectError[] = []
  const result: { ffmpeg?: BinaryDetection; ffprobe?: BinaryDetection; errors: DetectError[] } = {
    errors,
  }

  if ('code' in ffmpeg) errors.push(ffmpeg)
  else result.ffmpeg = ffmpeg

  if ('code' in ffprobe) errors.push(ffprobe)
  else result.ffprobe = ffprobe

  return result
}
