import type { AgentTrace, TestCase } from '@ai-agent-rpg/domain'
import {
  evaluateTestCases,
  submissionFromTrace
} from '@ai-agent-rpg/evaluator'
import { describe, expect, it } from 'vitest'

function trace(
  toolCalls: AgentTrace['toolCalls'],
  output = ''
): AgentTrace {
  return {
    output,
    steps: [],
    toolCalls,
    errorHandling: { hadError: false, recovered: false }
  }
}

describe('evaluateTestCases', () => {
  it('evaluates each test with its own trace submission', () => {
    const tests: TestCase[] = [
      {
        id: 'choose-tool-001',
        name: '天气问题选天气工具',
        visibility: 'public',
        input: {},
        expectedBehavior: { type: 'tool_called', value: 'get_weather' }
      },
      {
        id: 'choose-tool-002',
        name: '未知问题不硬调用',
        visibility: 'hidden',
        input: {},
        expectedBehavior: { type: 'tool_not_called', value: '' }
      }
    ]
    const traces = [
      trace([{ name: 'get_weather' }]),
      trace([])
    ]

    const evaluation = evaluateTestCases(tests, (_, index) =>
      submissionFromTrace(traces[index])
    )

    expect(evaluation.passed).toBe(true)
    expect(evaluation.score).toBe(1)
  })

  it('prefers an explicit fallback submission over the trace', () => {
    const submission = submissionFromTrace(
      trace([], 'from trace'),
      { output: 'from answer' }
    )

    expect(submission.output).toBe('from answer')
  })
})
