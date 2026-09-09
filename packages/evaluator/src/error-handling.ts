import type {
  EvaluationResult,
  FailureCategory,
  TestCase,
  TestResult
} from '@ai-agent-rpg/domain'

export interface ErrorHandlingSubmission {
  hadError: boolean
  recovered: boolean
  message?: string
}

export class UnsupportedBehaviorError extends Error {}

function expectedRecoveryMessage(
  testCase: TestCase,
  value: unknown
): string | null {
  if (value === undefined || value === '') {
    return null
  }
  if (typeof value !== 'string') {
    throw new UnsupportedBehaviorError(
      `${testCase.id} requires a string recovery message`
    )
  }
  return value
}

export function evaluateErrorHandledTestCase(
  testCase: TestCase,
  submission: ErrorHandlingSubmission
): TestResult {
  if (testCase.expectedBehavior.type !== 'error_handled') {
    throw new UnsupportedBehaviorError(
      `Evaluator does not support behavior type: ${testCase.expectedBehavior.type}`
    )
  }

  const expectedMessage = expectedRecoveryMessage(
    testCase,
    testCase.expectedBehavior.value
  )
  const passed =
    submission.hadError &&
    submission.recovered &&
    (expectedMessage === null ||
      Boolean(submission.message?.includes(expectedMessage)))
  const message = passed
    ? 'Error was handled and recovery succeeded.'
    : 'Expected the agent to recover from the tool error.'

  return {
    testId: testCase.id,
    passed,
    ...(passed ? {} : { failureCategory: testCase.failureCategory }),
    message: passed ? undefined : message
  }
}

export function evaluateErrorHandling(
  testCases: TestCase[],
  submission: ErrorHandlingSubmission
): EvaluationResult {
  const testResults = testCases.map((testCase) =>
    evaluateErrorHandledTestCase(testCase, submission)
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
