import { FailureCategory, type TestResult } from '@ai-agent-rpg/domain'
import {
  aggregateEvaluations,
  aggregateTestResults
} from '@ai-agent-rpg/evaluator'
import { describe, expect, it } from 'vitest'

describe('evaluation aggregator', () => {
  it('passes only when all tests pass', () => {
    const result = aggregateTestResults([
      { testId: 'a', passed: true },
      { testId: 'b', passed: true }
    ])

    expect(result.passed).toBe(true)
    expect(result.score).toBe(1)
  })

  it('computes score as passed divided by total tests', () => {
    const result = aggregateTestResults([
      { testId: 'a', passed: true },
      { testId: 'b', passed: false },
      { testId: 'c', passed: true }
    ])

    expect(result.passed).toBe(false)
    expect(result.score).toBe(2 / 3)
  })

  it('collects unique failure categories from failed tests', () => {
    const results: TestResult[] = [
      {
        testId: 'a',
        passed: false,
        failureCategory: FailureCategory.TOOL_SCHEMA
      },
      {
        testId: 'b',
        passed: false,
        failureCategory: FailureCategory.TOOL_SCHEMA
      }
    ]

    const result = aggregateTestResults(results)
    expect(result.failureCategories).toEqual(['tool_schema'])
  })

  it('merges multiple evaluation results', () => {
    const first = aggregateTestResults([{ testId: 'a', passed: true }])
    const second = aggregateTestResults([
      { testId: 'b', passed: false, message: 'wrong tool' }
    ])

    const result = aggregateEvaluations([first, second])
    expect(result.score).toBe(0.5)
    expect(result.passed).toBe(false)
  })
})
