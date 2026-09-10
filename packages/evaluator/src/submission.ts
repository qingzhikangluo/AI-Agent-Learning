import type {
  AgentTrace,
  EvaluationResult,
  TestCase,
  TestResult
} from '@ai-agent-rpg/domain'

import { aggregateTestResults } from './aggregate'
import {
  evaluateErrorHandling,
  type ErrorHandlingSubmission
} from './error-handling'
import { evaluateOutput } from './output'
import { evaluateToolCalls, type ToolCall } from './tool-call'
import { evaluateToolSequences } from './tool-sequence'

export interface ChallengeSubmission {
  output?: string
  toolCalls?: ToolCall[]
  errorHandling?: ErrorHandlingSubmission
}

export function submissionFromTrace(
  trace: AgentTrace | undefined,
  fallback: ChallengeSubmission = {}
): ChallengeSubmission {
  return {
    output: fallback.output ?? trace?.output,
    toolCalls: fallback.toolCalls ?? trace?.toolCalls,
    errorHandling: fallback.errorHandling ?? trace?.errorHandling
  }
}

export function evaluateTestCase(
  test: TestCase,
  submission: ChallengeSubmission
): TestResult {
  const behavior = test.expectedBehavior.type

  if (behavior === 'exact' || behavior === 'contains') {
    return evaluateOutput([test], {
      output: submission.output ?? ''
    }).testResults[0]
  }

  if (behavior === 'tool_called' || behavior === 'tool_not_called') {
    return evaluateToolCalls([test], {
      toolCalls: submission.toolCalls ?? []
    }).testResults[0]
  }

  if (behavior === 'tool_sequence') {
    return evaluateToolSequences([test], {
      toolCalls: submission.toolCalls ?? []
    }).testResults[0]
  }

  return evaluateErrorHandling(
    [test],
    submission.errorHandling ?? {
      hadError: false,
      recovered: false
    }
  ).testResults[0]
}

export function evaluateTestCases(
  tests: TestCase[],
  submissionForTest: (
    test: TestCase,
    index: number
  ) => ChallengeSubmission
): EvaluationResult {
  return aggregateTestResults(
    tests.map((test, index) =>
      evaluateTestCase(test, submissionForTest(test, index))
    )
  )
}
