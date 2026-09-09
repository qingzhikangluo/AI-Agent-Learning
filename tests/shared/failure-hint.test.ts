import { FailureCategory } from '@ai-agent-rpg/domain'
import { failureHintTopic } from '@ai-agent-rpg/shared'
import { describe, expect, it } from 'vitest'

describe('failure to hint mapping', () => {
  it('maps tool schema failures to a tool schema hint', () => {
    expect(failureHintTopic(FailureCategory.TOOL_SCHEMA)).toBe(
      'Tool Schema Hint'
    )
  })

  it('maps every failure category to a hint topic', () => {
    const categories = Object.values(FailureCategory) as FailureCategory[]
    for (const category of categories) {
      expect(failureHintTopic(category).endsWith('Hint')).toBe(true)
    }
  })
})
