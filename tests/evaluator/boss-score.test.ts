import {
  scoreBoss,
  scoreStructuredAnswers
} from '@ai-agent-rpg/evaluator'
import { describe, expect, it } from 'vitest'

describe('boss score', () => {
  it('weights deterministic tests at 70 percent and explanation at 30 percent', () => {
    const result = scoreBoss({
      deterministicScore: 1,
      explanationAnswerScores: [1, 1]
    })

    expect(result.total).toBe(1)
  })

  it('mixes partial test and explanation scores', () => {
    const result = scoreBoss({
      deterministicScore: 0.5,
      explanationAnswerScores: [1, 0]
    })

    expect(result.explanationScore).toBe(0.5)
    expect(result.total).toBeCloseTo(0.5)
  })

  it('scores structured answers deterministically', () => {
    const score = scoreStructuredAnswers(
      ['get_weather', 'error_handling'],
      ['get_weather']
    )

    expect(score).toBe(0.5)
  })
})
