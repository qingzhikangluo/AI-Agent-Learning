import { type TestCase } from '@ai-agent-rpg/domain'
import {
  evaluateToolSequenceTestCase,
  evaluateToolSequences
} from '@ai-agent-rpg/evaluator'
import { describe, expect, it } from 'vitest'

const sequenceCase: TestCase = {
  id: 'sequence-001',
  name: 'tool sequence',
  visibility: 'public',
  input: { query: 'book and expense' },
  expectedBehavior: {
    type: 'tool_sequence',
    value: ['search_faq', 'calculate_expense']
  }
}

describe('tool sequence evaluator', () => {
  it('passes when tool calls match the expected sequence', () => {
    const result = evaluateToolSequenceTestCase(sequenceCase, {
      toolCalls: [{ name: 'search_faq' }, { name: 'calculate_expense' }]
    })

    expect(result.passed).toBe(true)
  })

  it('fails when the order is different', () => {
    const result = evaluateToolSequenceTestCase(sequenceCase, {
      toolCalls: [{ name: 'calculate_expense' }, { name: 'search_faq' }]
    })

    expect(result.passed).toBe(false)
  })

  it('fails when extra tool calls are included', () => {
    const result = evaluateToolSequenceTestCase(sequenceCase, {
      toolCalls: [
        { name: 'search_faq' },
        { name: 'calculate_expense' },
        { name: 'get_weather' }
      ]
    })

    expect(result.passed).toBe(false)
  })

  it('aggregates sequence tests', () => {
    const result = evaluateToolSequences([sequenceCase], {
      toolCalls: [{ name: 'search_faq' }, { name: 'calculate_expense' }]
    })

    expect(result.passed).toBe(true)
    expect(result.score).toBe(1)
  })
})
