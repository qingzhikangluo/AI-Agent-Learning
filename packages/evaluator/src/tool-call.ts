import type {
  EvaluationResult,
  FailureCategory,
  TestCase,
  TestResult
} from '@ai-agent-rpg/domain'

export interface ToolCall {
  name: string
  arguments?: Record<string, unknown>
}

export interface ToolCallSubmission {
  toolCalls: ToolCall[]
}

export class UnsupportedBehaviorError extends Error {}

function expectedToolName(testCase: TestCase, value: unknown): string | null {
  if (value === undefined || value === '') {
    return null
  }
  if (typeof value !== 'string') {
    throw new UnsupportedBehaviorError(
      `${testCase.id} requires a string tool name`
    )
  }
  return value
}

export function evaluateToolCallTestCase(
  testCase: TestCase,
  submission: ToolCallSubmission
): TestResult {
  const { type, value } = testCase.expectedBehavior
  const expected = expectedToolName(testCase, value)
  const names = submission.toolCalls.map((call) => call.name)

  if (type === 'tool_called') {
    if (expected === null) {
      throw new UnsupportedBehaviorError(
        `${testCase.id} requires a tool name for tool_called`
      )
    }
    const passed = names.includes(expected)
    const message = passed
      ? `Tool ${expected} was called.`
      : `Expected tool ${expected} to be called.`
    return {
      testId: testCase.id,
      passed,
      ...(passed ? {} : { failureCategory: testCase.failureCategory }),
      message: passed ? undefined : message
    }
  }

  if (type === 'tool_not_called') {
    const passed =
      expected === null ? names.length === 0 : !names.includes(expected)
    const message = passed
      ? 'No forbidden tool call was made.'
      : expected === null
        ? 'Expected no tool call.'
        : `Tool ${expected} should not have been called.`
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

export function evaluateToolCalls(
  testCases: TestCase[],
  submission: ToolCallSubmission
): EvaluationResult {
  const testResults = testCases.map((testCase) =>
    evaluateToolCallTestCase(testCase, submission)
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
