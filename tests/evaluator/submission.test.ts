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

  it('evaluates localized expectations for the selected language', () => {
    const tests: TestCase[] = [
      {
        id: 'agent-when-to-use-001',
        name: '固定任务选 Workflow',
        visibility: 'public',
        input: {},
        expectedBehavior: {
          type: 'contains',
          value: { zh: '固定流程', en: 'workflow' }
        }
      }
    ]

    const english = evaluateTestCases(
      tests,
      () => ({ output: 'Use Workflow for fixed paths.' }),
      { language: 'en' }
    )
    const chinese = evaluateTestCases(
      tests,
      () => ({ output: '固定流程用 Workflow' }),
      { language: 'zh' }
    )
    const wrongLanguage = evaluateTestCases(
      tests,
      () => ({ output: 'Workflow' }),
      { language: 'zh' }
    )

    expect(english.passed).toBe(true)
    expect(chinese.passed).toBe(true)
    expect(wrongLanguage.passed).toBe(false)
  })
})
