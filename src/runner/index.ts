/// <reference types="node" />

export interface ProgressSink {
  progress: number
  durationMs: number
  remainingMs: number
}

export interface RunResult {
  exitCode: number
  stdout: string
  stderr: string
  durationMs: number
  error?: string
}

type StreamCallbacks = {
  onStdout?: (chunk: string) => void
  onStderr?: (chunk: string) => void
}

type RunOptions = {
  signal?: AbortSignal
} & StreamCallbacks

export async function runProcess(argv: string[], options: RunOptions = {}): Promise<RunResult> {
  const { spawn } = await import('node:child_process')
  const { signal, onStdout, onStderr } = options

  const startTime = Date.now()
  let stdout = ''
  let stderr = ''

  const child = spawn(argv[0], argv.slice(1), {
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (data: Uint8Array) => {
    const chunk = String(data)
    stdout += chunk
    onStdout?.(chunk)
  })

  child.stderr.on('data', (data: Uint8Array) => {
    const chunk = String(data)
    stderr += chunk
    onStderr?.(chunk)
  })

  return new Promise<RunResult>((resolve) => {
    let settled = false
    let killTimer: ReturnType<typeof setTimeout> | undefined

    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort)
      if (killTimer) {
        clearTimeout(killTimer)
        killTimer = undefined
      }
    }

    const settle = (result: RunResult) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(result)
    }

    const onAbort = () => {
      child.kill('SIGTERM')
      killTimer = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill('SIGKILL')
        }
      }, 2000)
    }

    if (signal) {
      if (signal.aborted) {
        onAbort()
      } else {
        signal.addEventListener('abort', onAbort, { once: true })
      }
    }

    child.on('error', (err: Error & { code?: string }) => {
      const durationMs = Date.now() - startTime
      if (err.code === 'ENOENT') {
        settle({ exitCode: 127, stdout, stderr, durationMs, error: 'ENOENT: binary not found' })
        return
      }
      settle({ exitCode: 1, stdout, stderr, durationMs, error: err.message })
    })

    child.on('close', (code: number | null, sig: NodeJS.Signals | null) => {
      const durationMs = Date.now() - startTime
      if (sig === 'SIGTERM' || sig === 'SIGKILL') {
        settle({ exitCode: 130, stdout, stderr, durationMs, error: 'process cancelled' })
        return
      }
      settle({ exitCode: code ?? -1, stdout, stderr, durationMs })
    })
  })
}
