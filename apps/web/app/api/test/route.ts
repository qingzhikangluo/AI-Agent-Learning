import type { EvaluationResult, TestCase } from '@ai-agent-rpg/domain'
import {
  evaluateTestCases,
  submissionFromTrace
} from '@ai-agent-rpg/evaluator'
import { runAgentTracesFromSource } from '@ai-agent-rpg/runtime'
import { NextResponse } from 'next/server'

import { loadChallengeRuntime } from '@/lib/server-data'

export const dynamic = 'force-dynamic'

function buildResponse(
  tests: TestCase[],
  evaluation: EvaluationResult,
  execution: {
    exitCode: number
    stderr: string
    timedOut: boolean
    durationMs: number
  } | null
) {
  const publicTests = tests.filter((test) => test.visibility === 'public')
  const publicResults = publicTests.map((test) => {
    const result = evaluation.testResults.find(
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
  const hiddenResults = evaluation.testResults.filter(
    (result) =>
      !publicTests.some((test) => test.id === result.testId)
  )

  return NextResponse.json({
    passed: evaluation.passed,
    score: evaluation.score,
    publicResults,
    hiddenSummary: {
      total: hiddenResults.length,
      passed: hiddenResults.filter((result) => result.passed).length
    },
    failureCategories: [
      ...new Set(
        publicResults
          .map((result) => result.failureCategory)
          .filter((category) => Boolean(category))
      )
    ],
    execution
  })
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  const { challengeId, source, language } = (body ?? {}) as {
    challengeId?: unknown
    source?: unknown
    language?: unknown
  }

  if (typeof challengeId !== 'string' || typeof source !== 'string') {
    return NextResponse.json(
      { error: 'challengeId and source are required.' },
      { status: 400 }
    )
  }

  const challenge = await loadChallengeRuntime(challengeId)
  if (!challenge) {
    return NextResponse.json(
      { error: `Unknown challenge: ${challengeId}` },
      { status: 404 }
    )
  }
  if (challenge.locked) {
    return NextResponse.json(
      { error: 'Challenge is locked.' },
      { status: 403 }
    )
  }

  if (challenge.type === 'concept') {
    const evaluation = evaluateTestCases(
      challenge.tests,
      () => ({ output: source }),
      { language: language === 'en' ? 'en' : 'zh' }
    )

    return buildResponse(challenge.tests, evaluation, null)
  }

  const traceExecution = await runAgentTracesFromSource(
    source,
    challenge.tests.map((test) => test.input)
  )
  const evaluation = evaluateTestCases(
    challenge.tests,
    (_, index) => submissionFromTrace(traceExecution.traces[index]),
    { language: language === 'en' ? 'en' : 'zh' }
  )

  return buildResponse(challenge.tests, evaluation, {
    exitCode: traceExecution.execution.exitCode,
    stderr: traceExecution.execution.stderr,
    timedOut: traceExecution.execution.timedOut,
    durationMs: traceExecution.execution.durationMs
  })
}
