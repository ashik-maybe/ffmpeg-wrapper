import { render as inkRender } from 'ink'
import React from 'react'
import type { TuiArgs } from './types.ts'
import { App } from './app.tsx'
import type { AppProps } from './app.tsx'
import { detectBinaries, compileRuntimeSpec } from '../tools/index.ts'
import type { DetectBinariesResult, CompiledRuntimeSpec } from '../tools/index.ts'

export interface RunDeps {
  readonly detectBinaries?: () => Promise<DetectBinariesResult>
  readonly compileRuntimeSpec?: (ffmpegPath?: string) => Promise<CompiledRuntimeSpec>
  readonly renderApp?: (props: AppProps) => {
    unmount: () => void
    waitUntilExit: () => Promise<void>
  }
  readonly log?: (message: string) => void
  readonly error?: (message: string) => void
}

export function parseArgs(argv: readonly string[]): TuiArgs {
  const args: TuiArgs = {}
  for (const arg of argv) {
    if (arg === '--version') args.version = true
    if (arg === '--help') args.help = true
    if (arg === '--run') args.run = true
    if (arg === '--yes') args.yes = true
  }
  return args
}

export async function run(argv: string[], deps: RunDeps = {}): Promise<void> {
  const args = parseArgs(argv)
  const log = deps.log ?? ((msg: string) => console.log(msg))
  const err = deps.error ?? ((msg: string) => console.error(msg))

  if (args.version) {
    log('ffmpeg-tui 0.0.0')
    return
  }

  if (args.help) {
    log('Usage: ffmpeg-tui [--version] [--help] [--run] [--yes]')
    return
  }

  const detect = deps.detectBinaries ?? (() => detectBinaries())
  const compile =
    deps.compileRuntimeSpec ?? ((ffmpegPath?: string) => compileRuntimeSpec(ffmpegPath))
  const detection = await detect()
  if (!detection.ffmpeg) {
    err('No ffmpeg binary found.')
    return
  }

  const compiled = await compile(detection.ffmpeg.path)
  const props: AppProps = {
    runEnabled: args.run === true,
    yes: args.yes === true,
    version: detection.ffmpeg.version,
    spec: compiled.spec,
  }

  if (deps.renderApp) {
    const instance = deps.renderApp(props)
    await instance.waitUntilExit()
    return
  }

  const instance = inkRender(React.createElement(App, props), { exitOnCtrlC: false })
  await instance.waitUntilExit()
}
