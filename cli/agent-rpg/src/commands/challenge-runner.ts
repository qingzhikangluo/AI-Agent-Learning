import type {
  AgentTrace,
  Challenge,
  EvaluationResult,
  Mission
} from '@ai-agent-rpg/domain'
import {
  evaluateTestCases,
  submissionFromTrace,
  type ErrorHandlingSubmission,
  type ToolCall
} from '@ai-agent-rpg/evaluator'
import type { PlayerState } from '@ai-agent-rpg/progression'
import {
  runAgentTracesInWorkspace,
  type AgentTraceExecution
} from '@ai-agent-rpg/runtime'

import type { GameContent } from './state'

export interface ResolvedChallenge {
  challenge: Challenge
  mission: Mission
}

export function resolveChallenge(
  content: GameContent,
  state: PlayerState,
  challengeId?: string
): ResolvedChallenge {
  if (challengeId) {
    const challenge = content.challenges.find(
      (item) => item.id === challengeId
    )
    const mission = content.missions.find(
      (item) => item.id === challenge?.missionId
    )
    const challengeState = state.challenges.find(
      (item) => item.id === challengeId
    )

    if (!challenge || !mission) {
      throw new Error(`Unknown challenge: ${challengeId}`)
    }
    if (!challengeState) {
      throw new Error(
        `Challenge ${challengeId} is not part of the current player state.`
      )
    }
    if (challengeState.status === 'locked') {
      throw new Error(`Challenge ${challengeId} is locked.`)
    }

    return { challenge, mission }
  }

  const mission =
    content.missions.find((item) => item.id === state.currentMissionId) ??
    content.missions[0]

  if (!mission) {
    throw new Error('No missions are available to submit.')
  }

  const ordered = content.challengesByMission[mission.id] ?? []
  const active = ordered
    .map((challenge) => ({
      challenge,
      state: state.challenges.find((item) => item.id === challenge.id)
    }))
    .find(
      (item) =>
        item.state?.status === 'active' || item.state?.status === 'failed'
    )

  if (!active) {
    throw new Error(`No unlocked challenge in ${mission.id}.`)
  }

  return { challenge: active.challenge, mission }
}

export interface ChallengeRunOptions {
  workspaceDir: string
  content: GameContent
  state: PlayerState
  challengeId?: string
  output?: string
  toolCalls?: ToolCall[]
  errorHandling?: ErrorHandlingSubmission
  traces?: AgentTrace[]
  timeoutMs?: number
}

export function evaluateChallenge(
  challenge: Challenge,
  options: Omit<ChallengeRunOptions, 'content' | 'state' | 'workspaceDir'>,
  traces?: AgentTrace[]
): EvaluationResult {
  return evaluateTestCases(challenge.tests, (_, index) =>
    submissionFromTrace(traces?.[index], {
      output: options.output,
      toolCalls: options.toolCalls,
      errorHandling: options.errorHandling
    })
  )
}

export interface ChallengeRunResult {
  resolved: ResolvedChallenge
  evaluation: EvaluationResult
  traces?: AgentTrace[]
  traceExecution?: AgentTraceExecution
}

export async function runChallenge(
  options: ChallengeRunOptions
): Promise<ChallengeRunResult> {
  const resolved = resolveChallenge(
    options.content,
    options.state,
    options.challengeId
  )
  const needsRuntimeTrace = resolved.challenge.tests.some(
    (test) =>
      test.expectedBehavior.type === 'tool_called' ||
      test.expectedBehavior.type === 'tool_not_called' ||
      test.expectedBehavior.type === 'tool_sequence' ||
      test.expectedBehavior.type === 'error_handled'
  )
  const shouldRunRuntime =
    !options.traces && (!options.output || needsRuntimeTrace)
  const traceExecution = shouldRunRuntime
    ? await runAgentTracesInWorkspace(
        options.workspaceDir,
        resolved.challenge.tests.map((test) => test.input),
        options.timeoutMs ?? 15_000
      )
    : undefined
  const traces = options.traces ?? traceExecution?.traces

  return {
    resolved,
    traces,
    traceExecution,
    evaluation: evaluateChallenge(resolved.challenge, options, traces)
  }
}
