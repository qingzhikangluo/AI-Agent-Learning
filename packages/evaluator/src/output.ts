import type {
  EvaluationResult,
  FailureCategory,
  TestCase,
  TestResult
} from '@ai-agent-rpg/domain'

export interface TextSubmission {
  output: string
}

export type EvaluationLanguage = 'zh' | 'en'

export interface EvaluationOptions {
  language?: EvaluationLanguage
}

export class UnsupportedBehaviorError extends Error {}

function isLocalizedValue(
  value: unknown
): value is { zh: string; en: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { zh?: unknown }).zh === 'string' &&
    typeof (value as { en?: unknown }).en === 'string'
  )
}

function expectedString(
  testCase: TestCase,
  value: unknown,
  language: EvaluationLanguage
): string {
  if (isLocalizedValue(value)) {
    return value[language]
  }
  if (typeof value !== 'string') {
    throw new UnsupportedBehaviorError(
      `${testCase.id} requires a string value for ${testCase.expectedBehavior.type}`
    )
  }
  return value
}

export function evaluateOutputTestCase(
  testCase: TestCase,
  submission: TextSubmission,
  options: EvaluationOptions = {}
): TestResult {
  const { type, value } = testCase.expectedBehavior
  const output = submission.output.trim()
  const language = options.language ?? 'zh'

  if (type === 'exact') {
    const expected = expectedString(testCase, value, language)
    const passed =
      language === 'en'
        ? output.toLowerCase() === expected.toLowerCase()
        : output === expected
    return {
      testId: testCase.id,
      passed,
      ...(passed ? {} : { failureCategory: testCase.failureCategory }),
      message: passed ? undefined : 'Output does not match.'
    }
  }

  if (type === 'contains') {
    const expected = expectedString(testCase, value, language)
    const passed =
      language === 'en'
        ? output.toLowerCase().includes(expected.toLowerCase())
        : output.includes(expected)
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
  submission: TextSubmission,
  options: EvaluationOptions = {}
): EvaluationResult {
  const testResults = testCases.map((testCase) =>
    evaluateOutputTestCase(testCase, submission, options)
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
