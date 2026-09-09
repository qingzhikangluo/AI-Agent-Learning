import type {
  EvaluationResult,
  FailureCategory,
  TestCase,
  TestResult
} from '@ai-agent-rpg/domain'

export interface TextSubmission {
  output: string
}

export class UnsupportedBehaviorError extends Error {}

function expectedString(testCase: TestCase, value: unknown): string {
  if (typeof value !== 'string') {
    throw new UnsupportedBehaviorError(
      `${testCase.id} requires a string value for ${testCase.expectedBehavior.type}`
    )
  }
  return value
}

export function evaluateOutputTestCase(
  testCase: TestCase,
  submission: TextSubmission
): TestResult {
  const { type, value } = testCase.expectedBehavior
  const output = submission.output.trim()

  if (type === 'exact') {
    const passed = output === expectedString(testCase, value)
    return {
      testId: testCase.id,
      passed,
      ...(passed ? {} : { failureCategory: testCase.failureCategory }),
      message: passed ? undefined : 'Output does not match.'
    }
  }

  if (type === 'contains') {
    const passed = output.includes(expectedString(testCase, value))
    const message = passed
      ? 'Output contains expected text.'
      : 'Expected text was not found in output.'
    return {
      testId: testCase.id,
      passed,
      ...(passed ? {} : { failureCategory: testCase.failureCategory }),
      message: passed ? undefined : message
    }
  }

  throw new UnsupportedBehaviorError(
    `Evaluator does not support behavior type: ${type}`
  )
}

export function evaluateOutput(
  testCases: TestCase[],
  submission: TextSubmission
): EvaluationResult {
  const testResults = testCases.map((testCase) =>
    evaluateOutputTestCase(testCase, submission)
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
