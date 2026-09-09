import { spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'

import type { ExecutionResult } from './runtime'

const SKIP_DIRECTORIES = new Set([
  '__pycache__',
  '.git',
  '.venv',
  'node_modules'
])

export async function discoverPythonFiles(
  rootDir: string
): Promise<string[]> {
  const files: string[] = []

  async function walk(dirPath: string): Promise<void> {
    const entries = await readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const entryPath = join(dirPath, entry.name)
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name) && !entry.name.startsWith('.')) {
          await walk(entryPath)
        }
      } else if (extname(entry.name) === '.py') {
        files.push(relative(rootDir, entryPath))
      }
    }
  }

  await walk(rootDir)
  return files.sort()
}

export async function runWorkspaceEntry(
  workspaceDir: string,
  entrypoint = 'main.py',
  timeoutMs = 10_000
): Promise<ExecutionResult> {
  const resolvedWorkspace = resolve(workspaceDir)
  const startedAt = Date.now()

  return new Promise((resolveExecution, reject) => {
    const child = spawn('python', [entrypoint], {
      cwd: resolvedWorkspace,
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
      resolveExecution({
        exitCode: timedOut ? 1 : (exitCode ?? 1),
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
        timedOut,
        durationMs: Date.now() - startedAt
      })
    })
  })
}
