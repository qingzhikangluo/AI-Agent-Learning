import { evaluateRetryPolicy } from '@ai-agent-rpg/progression'
import { describe, expect, it } from 'vitest'

describe('retry policy', () => {
  it('allows a retry on first failure', () => {
    const result = evaluateRetryPolicy({
      consecutiveFailures: 1,
      remediationCompleted: false
    })

    expect(result).toEqual({
      allowed: true,
      decision: 'retry_allowed'
    })
  })

  it('requires remediation after repeated failure', () => {
    const result = evaluateRetryPolicy({
      consecutiveFailures: 2,
      remediationCompleted: false
    })

    expect(result).toEqual({
      allowed: false,
      decision: 'remediation_required'
    })
  })

  it('allows retry after remediation is completed', () => {
    const result = evaluateRetryPolicy({
      consecutiveFailures: 2,
      remediationCompleted: true
    })

    expect(result).toEqual({
      allowed: true,
      decision: 'retry_after_remediation'
    })
  })
})
