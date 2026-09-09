import type {
  EvaluationResult,
  FailureCategory,
  TestResult
} from '@ai-agent-rpg/domain'

export function aggregateTestResults(
  testResults: TestResult[]
): EvaluationResult {
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

export function aggregateEvaluations(
  evaluations: EvaluationResult[]
): EvaluationResult {
  return aggregateTestResults(
    evaluations.flatMap((evaluation) => evaluation.testResults)
  )
}
