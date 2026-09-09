import {
  FailureCategory,
  type EvaluationResult,
  type TestCase,
  type TestResult
} from '@ai-agent-rpg/domain'
import { describe, expect, it } from 'vitest'

describe('FailureCategory', () => {
  it('uses stable identifiers for failure diagnosis', () => {
    expect(FailureCategory.SYNTAX).toBe('syntax')
    expect(FailureCategory.API).toBe('api')
    expect(FailureCategory.JSON).toBe('json')
    expect(FailureCategory.TOOL_SCHEMA).toBe('tool_schema')
    expect(FailureCategory.PROMPT).toBe('prompt')
    expect(FailureCategory.LOGIC).toBe('logic')
    expect(FailureCategory.AGENT_LOOP).toBe('agent_loop')
    expect(FailureCategory.ERROR_HANDLING).toBe('error_handling')
    expect(FailureCategory.ARCHITECTURE).toBe('architecture')
  })
})

describe('TestCase', () => {
  it('carries visibility, input, expected behavior, and failure category', () => {
    const testCase = {
      id: 'test-001',
      name: 'normal weather query',
      visibility: 'public',
      input: { query: 'What is the weather in Shanghai?' },
      expectedBehavior: { type: 'tool_called', value: 'get_weather' },
      failureCategory: FailureCategory.TOOL_SCHEMA
    } satisfies TestCase

    expect(testCase.visibility).toBe('public')
    expect(testCase.expectedBehavior.type).toBe('tool_called')
    expect(testCase.failureCategory).toBe('tool_schema')
  })
})

describe('TestResult', () => {
  it('carries test id, pass state, and optional failure category', () => {
    const result = {
      testId: 'test-001',
      passed: false,
      failureCategory: FailureCategory.TOOL_SCHEMA,
      message: 'Expected get_weather to be called.'
    } satisfies TestResult

    expect(result.passed).toBe(false)
    expect(result.failureCategory).toBe('tool_schema')
  })
})

describe('EvaluationResult', () => {
  it('carries pass state, score, test results, categories, and feedback', () => {
    const evaluation = {
      passed: true,
      score: 1,
      testResults: [{ testId: 'test-001', passed: true }],
      failureCategories: [],
      feedback: ['All tests passed.']
    } satisfies EvaluationResult

    expect(evaluation.passed).toBe(true)
    expect(evaluation.score).toBe(1)
    expect(evaluation.feedback).toEqual(['All tests passed.'])
  })
})
