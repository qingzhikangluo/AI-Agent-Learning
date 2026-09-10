import type { FailureCategory } from '@ai-agent-rpg/domain'
import type { EvaluationLanguage } from '@ai-agent-rpg/evaluator'
import { FilePlayerStateStore } from '@ai-agent-rpg/progression'

import { runChallenge } from './challenge-runner'
import { createSeededPlayerState, loadGameContent } from './state'

export interface TestOptions {
  workspaceDir: string
  challengeId?: string
  output?: string
  language?: EvaluationLanguage
  timeoutMs?: number
}

export interface PublicTestResult {
  testId: string
  name: string
  passed: boolean
  failureCategory?: FailureCategory
  message?: string
}

export interface ChallengeTestResult {
  challengeId: string
  missionId: string
  passed: boolean
  score: number
  publicResults: PublicTestResult[]
  hiddenSummary: {
    total: number
    passed: number
  }
  failureCategories: FailureCategory[]
}

export async function testWorkspace(
  options: TestOptions
): Promise<ChallengeTestResult> {
  const store = new FilePlayerStateStore(options.workspaceDir)
  const state =
    (await store.read()) ?? (await createSeededPlayerState())
  const content = await loadGameContent()
  const run = await runChallenge({
    workspaceDir: options.workspaceDir,
    content,
    state,
    challengeId: options.challengeId,
    output: options.output,
    language: options.language,
    timeoutMs: options.timeoutMs
  })
  const publicTests = run.resolved.challenge.tests.filter(
    (test) => test.visibility === 'public'
  )
  const publicResults: PublicTestResult[] = publicTests.map((test) => {
    const result = run.evaluation.testResults.find(
      (item) => item.testId === test.id
    )

    return {
      testId: test.id,
      name: test.name,
      passed: result?.passed ?? false,
      failureCategory: result?.failureCategory,
      message: result?.message
    }
  })
  const hiddenResults = run.evaluation.testResults.filter(
    (result) =>
      !publicTests.some((test) => test.id === result.testId)
  )

  return {
    challengeId: run.resolved.challenge.id,
    missionId:
      run.resolved.mission?.id ?? run.resolved.challenge.missionId,
    passed: run.evaluation.passed,
    score: run.evaluation.score,
    publicResults,
    hiddenSummary: {
      total: hiddenResults.length,
      passed: hiddenResults.filter((result) => result.passed).length
    },
    failureCategories: [
      ...new Set(
        publicResults
          .map((result) => result.failureCategory)
          .filter(
            (category): category is FailureCategory =>
              Boolean(category)
          )
      )
    ]
  }
}
