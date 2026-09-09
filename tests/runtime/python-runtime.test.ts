import { PythonRuntime } from '@ai-agent-rpg/runtime'
import { describe, expect, it } from 'vitest'

describe('PythonRuntime', () => {
  const runtime = new PythonRuntime()

  it('executes python source and captures stdout', async () => {
    const result = await runtime.execute({
      language: 'python',
      source: 'print("hello from python")'
    })

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('hello from python')
    expect(result.stderr).toBe('')
    expect(result.timedOut).toBe(false)
  })

  it('captures stderr and non-zero exit codes', async () => {
    const result = await runtime.execute({
      language: 'python',
      source: 'import sys\nprint("boom", file=sys.stderr)\nraise SystemExit(3)'
    })

    expect(result.exitCode).toBe(3)
    expect(result.stderr).toContain('boom')
  })

  it('terminates execution after the timeout', async () => {
    const result = await runtime.execute({
      language: 'python',
      source: 'import time\ntime.sleep(10)',
      timeoutMs: 200
    })

    expect(result.timedOut).toBe(true)
  })
})
