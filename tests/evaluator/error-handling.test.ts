import { type TestCase } from '@ai-agent-rpg/domain'
import {
  evaluateErrorHandledTestCase,
  evaluateErrorHandling
} from '@ai-agent-rpg/evaluator'
import { describe, expect, it } from 'vitest'

const errorCase: TestCase = {
  id: 'error-001',
  name: 'handles tool error',
  visibility: 'public',
  input: { tool_error: 'city not found' },
  expectedBehavior: { type: 'error_handled', value: 'city not found' }
}

describe('error handling evaluator', () => {
  it('passes when the error was recovered from', () => {
    const result = evaluateErrorHandledTestCase(errorCase, {
      hadError: true,
      recovered: true,
      message: 'Retried with a valid city after city not found.'
    })

    expect(result.passed).toBe(true)
  })

  it('fails when the error was ignored', () => {
    const result = evaluateErrorHandledTestCase(errorCase, {
      hadError: true,
      recovered: false
    })

    expect(result.passed).toBe(false)
  })

  it('fails when no error occurred', () => {
    const result = evaluateErrorHandledTestCase(errorCase, {
      hadError: false,
      recovered: true
    })

    expect(result.passed).toBe(false)
  })

  it('aggregates error handling tests', () => {
    const result = evaluateErrorHandling([errorCase], {
      hadError: true,
      recovered: true,
      message: 'city not found, retried with Shanghai.'
    })

    expect(result.passed).toBe(true)
    expect(result.score).toBe(1)
  })
})
