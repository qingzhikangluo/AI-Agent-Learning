import { FailureCategory } from '@ai-agent-rpg/domain'
import {
  failureRecommendation,
  failureRecommendations
} from '@ai-agent-rpg/shared'
import { describe, expect, it } from 'vitest'

describe('failure diagnosis', () => {
  it('returns an actionable recommendation per category', () => {
    expect(failureRecommendation(FailureCategory.TOOL_SCHEMA)).toContain(
      'tool schema'
    )
    expect(failureRecommendation(FailureCategory.SYNTAX)).toContain('syntax')
  })

  it('deduplicates recommendations', () => {
    const recommendations = failureRecommendations([
      FailureCategory.SYNTAX,
      FailureCategory.SYNTAX,
      FailureCategory.JSON
    ])

    expect(recommendations).toHaveLength(2)
  })
})
