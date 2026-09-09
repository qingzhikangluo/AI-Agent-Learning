import { FailureCategory } from '@ai-agent-rpg/domain'
import { remediationQuestForFailure } from '@ai-agent-rpg/shared'
import { describe, expect, it } from 'vitest'

describe('remediation quest mapping', () => {
  it('maps tool schema failures to the repair quest', () => {
    expect(remediationQuestForFailure(FailureCategory.TOOL_SCHEMA)).toBe(
      'tool-schema-repair'
    )
  })

  it('returns null when no remediation quest exists', () => {
    expect(remediationQuestForFailure(FailureCategory.API)).toBeNull()
  })
})
