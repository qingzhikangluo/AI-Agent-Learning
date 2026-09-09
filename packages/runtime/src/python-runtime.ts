import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type {
  ExecutionRequest,
  ExecutionResult,
  Runtime
} from './runtime'

export class PythonRuntime implements Runtime {
  async execute(input: ExecutionRequest): Promise<ExecutionResult> {
    if (input.language !== 'python') {
      throw new Error(`Unsupported runtime language: ${input.language}`)
    }

    const startedAt = Date.now()
    const timeoutMs = input.timeoutMs ?? 10_000
    const tempDir = await mkdtemp(join(tmpdir(), 'agent-rpg-'))
    const entrypoint = join(tempDir, 'main.py')

    try {
      await writeFile(entrypoint, input.source, 'utf8')
      return await this.runPython(tempDir, entrypoint, startedAt, timeoutMs)
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  }

  private runPython(
    cwd: string,
    entrypoint: string,
    startedAt: number,
    timeoutMs: number
  ): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const child = spawn('python', [entrypoint], {
        cwd,
        windowsHide: true
      })
      const stdout: Buffer[] = []
      const stderr: Buffer[] = []
      let timedOut = false
      let settled = false

      child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk))
      child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk))

      const timer = setTimeout(() => {
        timedOut = true
        child.kill()
      }, timeoutMs)

      child.on('error', (error) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        reject(error)
      })

      child.on('close', (exitCode) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve({
          exitCode: timedOut ? 1 : (exitCode ?? 1),
          stdout: Buffer.concat(stdout).toString('utf8'),
          stderr: Buffer.concat(stderr).toString('utf8'),
          timedOut,
          durationMs: Date.now() - startedAt
        })
      })
    })
  }
}
