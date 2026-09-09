import type { Runtime } from '@ai-agent-rpg/runtime'
import { describe, expect, it } from 'vitest'

describe('Runtime interface', () => {
  it('can be implemented with execute returning an execution result', async () => {
    const fakeRuntime: Runtime = {
      async execute(input) {
        expect(input.language).toBe('python')
        expect(input.source).toBe('print("ok")')

        return {
          exitCode: 0,
          stdout: 'ok\n',
          stderr: '',
          timedOut: false,
          durationMs: 10
        }
      }
    }

    const result = await fakeRuntime.execute({
      language: 'python',
      source: 'print("ok")'
    })

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('ok\n')
  })
})
