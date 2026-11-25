import { describe, expect, test, beforeEach, afterEach } from 'vitest'
import { runProcess, type ProgressSink } from './index'
import * as fs from 'node:fs/promises'

async function createTempBinary(content: string): Promise<string> {
  const tempPath = `/tmp/fake-binary-${Date.now()}-${Math.random().toString(36).slice(2)}`
  await fs.writeFile(tempPath, `#!/usr/bin/env node\n${content}`)
  await fs.chmod(tempPath, 0o755)
  return tempPath
}

async function cleanupTempFiles(paths: string[]) {
  await Promise.all(paths.map((p) => fs.unlink(p).catch(() => {})))
}

describe('runProcess', () => {
  const tempFiles: string[] = []

  beforeEach(() => {
    tempFiles.length = 0
  })

  afterEach(async () => {
    await cleanupTempFiles(tempFiles)
  })

  async function registerTemp(file: string) {
    tempFiles.push(file)
    return file
  }

  test('successful execution returns exitCode 0 with stdout', async () => {
    const bin = await registerTemp(await createTempBinary('console.log("hello world");'))
    const result = await runProcess([bin])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('hello world')
    expect(result.stderr).toBe('')
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })

  test('non-zero exit code is returned', async () => {
    const bin = await registerTemp(await createTempBinary('process.exit(42);'))
    const result = await runProcess([bin])

    expect(result.exitCode).toBe(42)
  })

  test('ENOENT returns error code 127 with clear message', async () => {
    const result = await runProcess(['/non-existent-binary-xyz'])

    expect(result.exitCode).toBe(127)
    expect(result.error).toContain('ENOENT')
  })

  test('stdout and stderr streaming via callbacks', async () => {
    const bin = await registerTemp(
      await createTempBinary(`
for (let i = 0; i < 5; i++) {
  console.log('out ' + i);
  console.error('err ' + i);
}
`),
    )

    const stdoutChunks: string[] = []
    const stderrChunks: string[] = []

    const result = await runProcess([bin], {
      onStdout: (chunk) => stdoutChunks.push(chunk),
      onStderr: (chunk) => stderrChunks.push(chunk),
    })

    expect(result.exitCode).toBe(0)
    expect(stdoutChunks.join('')).toContain('out 0')
    expect(stdoutChunks.join('')).toContain('out 4')
    expect(stderrChunks.join('')).toContain('err 0')
    expect(stderrChunks.join('')).toContain('err 4')
  })

  test('cancellation via AbortSignal kills with SIGTERM then SIGKILL', async () => {
    const bin = await registerTemp(
      await createTempBinary(`
setInterval(() => { console.log('running'); }, 50);
`),
    )

    const controller = new AbortController()
    let sawRunning = false
    const onStdout = (chunk: string) => {
      if (chunk.includes('running')) sawRunning = true
    }
    const promise = runProcess([bin], { signal: controller.signal, onStdout })

    const deadline = Date.now() + 2000
    while (!sawRunning && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5))
    }
    controller.abort()

    const result = await promise

    expect(result.exitCode).toBe(130)
    expect(result.error).toContain('cancelled')
    expect(result.stdout).toContain('running')
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })

  test('ProgressSink type is exported and usable', () => {
    const sink: ProgressSink = { progress: 0.5, durationMs: 1000, remainingMs: 1000 }
    expect(sink.progress).toBe(0.5)
    expect(sink.durationMs).toBe(1000)
    expect(sink.remainingMs).toBe(1000)
  })
})
