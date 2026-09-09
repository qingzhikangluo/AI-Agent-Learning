import type {
  EvaluationResult,
  FailureCategory,
  TestCase,
  TestResult
} from '@ai-agent-rpg/domain'

import type { ToolCallSubmission } from './tool-call'

export class UnsupportedBehaviorError extends Error {}

function expectedSequence(testCase: TestCase, value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== 'string')
  ) {
    throw new UnsupportedBehaviorError(
      `${testCase.id} requires a string[] tool sequence`
    )
  }
  return value as string[]
}

export function evaluateToolSequenceTestCase(
  testCase: TestCase,
  submission: ToolCallSubmission
): TestResult {
  if (testCase.expectedBehavior.type !== 'tool_sequence') {
    throw new UnsupportedBehaviorError(
      `Evaluator does not support behavior type: ${testCase.expectedBehavior.type}`
    )
  }

  const expected = expectedSequence(testCase, testCase.expectedBehavior.value)
  const actual = submission.toolCalls.map((call) => call.name)
  const passed =
    actual.length === expected.length &&
    actual.every((name, index) => name === expected[index])
  const message = passed
    ? 'Tool sequence matches.'
    : `Expected sequence [${expected.join(', ')}] but received [${actual.join(', ')}].`

  return {
    testId: testCase.id,
    passed,
    ...(passed ? {} : { failureCategory: testCase.failureCategory }),
    message: passed ? undefined : message
  }
}

export function evaluateToolSequences(
  testCases: TestCase[],
  submission: ToolCallSubmission
): EvaluationResult {
  const testResults = testCases.map((testCase) =>
    evaluateToolSequenceTestCase(testCase, submission)
  )
  const passedCount = testResults.filter((result) => result.passed).length
  const failedResults = testResults.filter((result) => !result.passed)
  const failureCategories: FailureCategory[] = [
    ...new Set(
      failedResults
        .map((result) => result.failureCategory)
        .filter((category): category is FailureCategory => Boolean(category))
    )
  ]

  return {
    passed: failedResults.length === 0,
    score: testResults.length === 0 ? 0 : passedCount / testResults.length,
    testResults,
    failureCategories,
    feedback: testResults.map(
      (result) => result.message ?? `Test ${result.testId} passed.`
    )
  }
}
