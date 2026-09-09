import { FailureCategory, type TestCase } from '@ai-agent-rpg/domain'
import {
  evaluateOutput,
  evaluateOutputTestCase,
  UnsupportedBehaviorError
} from '@ai-agent-rpg/evaluator'
import { describe, expect, it } from 'vitest'

const exactCase: TestCase = {
  id: 'exact-001',
  name: 'exact match',
  visibility: 'public',
  input: {},
  expectedBehavior: { type: 'exact', value: 'Hello, world!' }
}

const containsCase: TestCase = {
  id: 'contains-001',
  name: 'contains match',
  visibility: 'public',
  input: {},
  expectedBehavior: { type: 'contains', value: 'tool_called' }
}

describe('output evaluator', () => {
  it('supports exact output matching', () => {
    const result = evaluateOutputTestCase(exactCase, {
      output: 'Hello, world!'
    })

    expect(result.passed).toBe(true)
  })

  it('supports contains matching', () => {
    const result = evaluateOutputTestCase(containsCase, {
      output: '{"action":"tool_called","name":"get_weather"}'
    })

    expect(result.passed).toBe(true)
  })

  it('reports failures with failure category', () => {
    const failingCase = {
      ...exactCase,
      failureCategory: FailureCategory.PROMPT
    }
    const result = evaluateOutputTestCase(failingCase, {
      output: 'Goodbye'
    })

    expect(result.passed).toBe(false)
    expect(result.failureCategory).toBe('prompt')
  })

  it('aggregates tests into an evaluation result', () => {
    const exactMatch = {
      ...exactCase,
      expectedBehavior: { type: 'exact' as const, value: 'Hello, world! tool_called' }
    }
    const result = evaluateOutput([exactMatch, containsCase], {
      output: 'Hello, world! tool_called'
    })

    expect(result.passed).toBe(true)
    expect(result.score).toBe(1)
    expect(result.failureCategories).toEqual([])
  })

  it('rejects unsupported behavior types', () => {
    const unsupported: TestCase = {
      ...exactCase,
      expectedBehavior: { type: 'tool_called' }
    }

    expect(() =>
      evaluateOutputTestCase(unsupported, { output: 'anything' })
    ).toThrow(UnsupportedBehaviorError)
  })
})
