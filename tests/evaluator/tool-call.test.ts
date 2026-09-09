import { type TestCase } from '@ai-agent-rpg/domain'
import {
  evaluateToolCallTestCase,
  evaluateToolCalls
} from '@ai-agent-rpg/evaluator'
import { describe, expect, it } from 'vitest'

const weatherCalled: TestCase = {
  id: 'tool-called-001',
  name: 'weather tool was called',
  visibility: 'public',
  input: { query: 'weather in Shanghai' },
  expectedBehavior: { type: 'tool_called', value: 'get_weather' }
}

const noTool: TestCase = {
  id: 'no-tool-001',
  name: 'no tool call needed',
  visibility: 'public',
  input: { query: 'What is 2 + 2?' },
  expectedBehavior: { type: 'tool_not_called', value: '' }
}

describe('tool call evaluator', () => {
  it('passes when the expected tool was called', () => {
    const result = evaluateToolCallTestCase(weatherCalled, {
      toolCalls: [{ name: 'get_weather' }]
    })

    expect(result.passed).toBe(true)
  })

  it('fails when the expected tool was not called', () => {
    const result = evaluateToolCallTestCase(weatherCalled, {
      toolCalls: [{ name: 'search_faq' }]
    })

    expect(result.passed).toBe(false)
  })

  it('passes when no tool was called and none was required', () => {
    const result = evaluateToolCallTestCase(noTool, { toolCalls: [] })

    expect(result.passed).toBe(true)
  })

  it('fails when a tool was called but none was required', () => {
    const result = evaluateToolCallTestCase(noTool, {
      toolCalls: [{ name: 'search_faq' }]
    })

    expect(result.passed).toBe(false)
  })

  it('aggregates tool call tests', () => {
    const result = evaluateToolCalls([weatherCalled, noTool], {
      toolCalls: [{ name: 'get_weather' }]
    })

    expect(result.passed).toBe(false)
    expect(result.score).toBe(0.5)
  })
})
