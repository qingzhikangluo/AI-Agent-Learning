import { FailureCategory } from '@ai-agent-rpg/domain'
import { mapExecutionFailure } from '@ai-agent-rpg/runtime'
import { describe, expect, it } from 'vitest'

describe('runtime error mapping', () => {
  it('maps SyntaxError to SYNTAX', () => {
    expect(
      mapExecutionFailure({ stderr: 'SyntaxError: invalid syntax', timedOut: false })
    ).toBe(FailureCategory.SYNTAX)
  })

  it('maps RuntimeError to LOGIC', () => {
    expect(
      mapExecutionFailure({ stderr: 'RuntimeError: boom', timedOut: false })
    ).toBe(FailureCategory.LOGIC)
  })

  it('maps ImportError to ARCHITECTURE', () => {
    expect(
      mapExecutionFailure({
        stderr: 'ModuleNotFoundError: No module named requests',
        timedOut: false
      })
    ).toBe(FailureCategory.ARCHITECTURE)
  })

  it('maps timeout to AGENT_LOOP', () => {
    expect(mapExecutionFailure({ stderr: '', timedOut: true })).toBe(
      FailureCategory.AGENT_LOOP
    )
  })

  it('returns null when execution succeeded', () => {
    expect(mapExecutionFailure({ stderr: '', timedOut: false })).toBeNull()
  })
})
