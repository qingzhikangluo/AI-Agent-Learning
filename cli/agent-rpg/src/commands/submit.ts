import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type {
  AgentTrace,
  Attempt,
  Challenge,
  EvaluationResult,
  Evidence,
  FailureCategory,
  HintUsage,
  Mission
} from '@ai-agent-rpg/domain'
import {
  evaluateTestCases,
  submissionFromTrace,
  type ErrorHandlingSubmission,
  type ToolCall
} from '@ai-agent-rpg/evaluator'
import { runAgentTracesInWorkspace } from '@ai-agent-rpg/runtime'
import {
  calculateSkillLevel,
  FilePlayerStateStore,
  type PlayerSkillState,
  type PlayerState,
  type SubmissionRecord
} from '@ai-agent-rpg/progression'

import {
  ensurePlayerState,
  loadGameContent,
  type GameContent
} from './state'

export interface SubmitOptions {
  workspaceDir: string
  challengeId?: string
  output?: string
  toolCalls?: ToolCall[]
  errorHandling?: ErrorHandlingSubmission
  traces?: AgentTrace[]
  hintUsages?: HintUsage[]
  explanation?: string
  submittedAt?: string
}

export interface SubmitResult {
  submissionId: string
  submissionPath: string
  statePath: string
  challengeId: string
  missionId: string
  passed: boolean
  score: number
  failureCategories: FailureCategory[]
  feedback: string[]
  unlockedChallengeId?: string
  unlockedMissionId?: string
  bossUnlocked: boolean
}

interface ResolvedChallenge {
  challenge: Challenge
  mission: Mission
}

function resolveChallenge(
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
    throw new Error(
      `No unlocked challenge to submit in ${mission.id}.`
    )
  }

  return { challenge: active.challenge, mission }
}

function evaluateChallenge(
  challenge: Challenge,
  options: SubmitOptions,
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

function upsertSkill(
  skills: PlayerSkillState[],
  skill: PlayerSkillState
): PlayerSkillState[] {
  const index = skills.findIndex((item) => item.skillId === skill.skillId)
  if (index === -1) {
    return [...skills, skill]
  }

  return skills.map((item, itemIndex) =>
    itemIndex === index ? skill : item
  )
}

function updateSkillStates(
  state: PlayerState,
  mission: Mission,
  newEvidence: Evidence[],
  updatedAt: string
): PlayerSkillState[] {
  const allEvidence = [...state.evidence, ...newEvidence]
  let skills = [...state.skills]

  for (const skillId of mission.skillTargets) {
    const relevant = allEvidence.filter(
      (evidence) => evidence.skillId === skillId
    )
    const passed = relevant.filter(
      (evidence) => evidence.result === 'pass'
    )
    const confidence =
      relevant.length === 0 ? 0 : passed.length / relevant.length
    const strengths = [
      ...new Set(passed.map((evidence) => `Passed ${evidence.taskId}`))
    ]
    const weaknesses = [
      ...new Set(relevant.flatMap((evidence) => evidence.failureCategories))
    ]

    skills = upsertSkill(skills, {
      skillId,
      level: calculateSkillLevel(relevant),
      confidence,
      strengths,
      weaknesses,
      updatedAt
    })
  }

  return skills
}

interface AppliedSubmission {
  state: PlayerState
  submissionRecord: SubmissionRecord
  unlockedChallengeId?: string
  unlockedMissionId?: string
  bossUnlocked: boolean
}

function applySubmission(params: {
  state: PlayerState
  content: GameContent
  resolved: ResolvedChallenge
  evaluation: EvaluationResult
  submissionId: string
  submissionPath: string
  hintUsages: HintUsage[]
  explanation: string
  submittedAt: string
}): AppliedSubmission {
  const {
    state,
    content,
    resolved,
    evaluation,
    submissionId,
    submissionPath,
    hintUsages,
    explanation,
    submittedAt
  } = params
  const { challenge, mission } = resolved
  const challengeState = state.challenges.find(
    (item) => item.id === challenge.id
  )

  if (!challengeState) {
    throw new Error(
      `Challenge ${challenge.id} is not part of the current player state.`
    )
  }

  const attemptNumber = challengeState.attempts + 1
  const hintsUsed = challengeState.hintsUsed + hintUsages.length
  const result = evaluation.passed ? 'pass' : 'fail'
  const newEvidence: Evidence[] = mission.skillTargets.map((skillId) => ({
    id: `evidence-${challenge.id}-${skillId}-${attemptNumber}`,
    playerId: state.playerId,
    skillId,
    taskId: challenge.id,
    taskType: challenge.type,
    result,
    score: evaluation.score,
    attempts: attemptNumber,
    hintsUsed,
    failureCategories: evaluation.failureCategories,
    createdAt: submittedAt
  }))
  const attempt: Attempt = {
    id: `attempt-${challenge.id}-${attemptNumber}`,
    playerId: state.playerId,
    challengeId: challenge.id,
    status: evaluation.passed ? 'passed' : 'failed',
    startedAt: submittedAt,
    finishedAt: submittedAt
  }

  let challenges = state.challenges.map((item) =>
    item.id === challenge.id
      ? {
          ...item,
          status: evaluation.passed ? ('passed' as const) : ('failed' as const),
          attempts: attemptNumber,
          hintsUsed,
          bestScore: Math.max(item.bestScore ?? 0, evaluation.score),
          failureCategories: evaluation.failureCategories,
          ...(evaluation.passed ? { completedAt: submittedAt } : {})
        }
      : item
  )
  let missions = state.missions
  let currentMissionId = state.currentMissionId
  let bossUnlocked = false
  let unlockedChallengeId: string | undefined
  let unlockedMissionId: string | undefined

  if (evaluation.passed) {
    const missionChallenges = content.challengesByMission[mission.id] ?? []
    const position = missionChallenges.findIndex(
      (item) => item.id === challenge.id
    )
    const nextChallenge = missionChallenges[position + 1]

    if (nextChallenge) {
      const nextState = state.challenges.find(
        (item) => item.id === nextChallenge.id
      )
      if (nextState?.status === 'locked') {
        unlockedChallengeId = nextChallenge.id
        challenges = challenges.map((item) =>
          item.id === nextChallenge.id
            ? { ...item, status: 'active' as const }
            : item
        )
      }
    } else {
      missions = missions.map((item) =>
        item.id === mission.id
          ? {
              ...item,
              status: 'passed' as const,
              completedAt: submittedAt
            }
          : item
      )
      const missionIndex = content.missions.findIndex(
        (item) => item.id === mission.id
      )
      const nextMission = content.missions[missionIndex + 1]

      if (nextMission) {
        const nextMissionState = state.missions.find(
          (item) => item.id === nextMission.id
        )
        if (nextMissionState?.status === 'locked') {
          unlockedMissionId = nextMission.id
          currentMissionId = nextMission.id
          missions = missions.map((item) =>
            item.id === nextMission.id
              ? {
                  ...item,
                  status: 'active' as const,
                  startedAt: submittedAt
                }
              : item
          )
          const firstChallenge =
            (content.challengesByMission[nextMission.id] ?? [])[0]
          if (firstChallenge) {
            unlockedChallengeId = firstChallenge.id
            challenges = challenges.map((item) =>
              item.id === firstChallenge.id
                ? { ...item, status: 'active' as const }
                : item
            )
          }
        }
      } else if (mission.bossId) {
        bossUnlocked = state.boss.status === 'locked'
      }
    }
  }

  const submissionRecord: SubmissionRecord = {
    id: submissionId,
    challengeId: challenge.id,
    submittedAt,
    testResult: `${evaluation.passed ? 'PASS' : 'FAIL'} (${Math.round(
      evaluation.score * 100
    )}%)`,
    explanation,
    submissionPath
  }
  const nextState: PlayerState = {
    ...state,
    updatedAt: submittedAt,
    currentMissionId,
    missions,
    challenges,
    skills: updateSkillStates(
      state,
      mission,
      newEvidence,
      submittedAt
    ),
    evidence: [...state.evidence, ...newEvidence],
    attempts: [...state.attempts, attempt],
    hintUsages: [...state.hintUsages, ...hintUsages],
    submissions: [...state.submissions, submissionRecord],
    boss:
      bossUnlocked && state.boss.status === 'locked'
        ? { ...state.boss, status: 'in-progress' }
        : state.boss
  }

  return {
    state: nextState,
    submissionRecord,
    unlockedChallengeId,
    unlockedMissionId,
    bossUnlocked
  }
}

async function readOptionalFile(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf8')
  } catch {
    return ''
  }
}

export async function submitWorkspace(
  options: SubmitOptions
): Promise<SubmitResult> {
  const workspaceDir = options.workspaceDir
  const submittedAt = options.submittedAt ?? new Date().toISOString()
  const submissionId = `submission-${submittedAt.replace(/[:.]/g, '-')}`
  const submissionsDir = join(workspaceDir, '.agent-rpg', 'submissions')
  const submissionPath = join(
    submissionsDir,
    `${submissionId}.json`
  )
  const store = new FilePlayerStateStore(workspaceDir)
  const state = await ensurePlayerState(store)
  const content = await loadGameContent()
  const resolved = resolveChallenge(content, state, options.challengeId)
  const needsRuntimeTrace = resolved.challenge.tests.some(
    (test) =>
      test.expectedBehavior.type === 'tool_called' ||
      test.expectedBehavior.type === 'tool_not_called' ||
      test.expectedBehavior.type === 'tool_sequence' ||
      test.expectedBehavior.type === 'error_handled'
  )
  const shouldRunRuntime =
    !options.traces && (!options.output || needsRuntimeTrace)
  const traceExecution =
    shouldRunRuntime
      ? await runAgentTracesInWorkspace(
          workspaceDir,
          resolved.challenge.tests.map((test) => test.input)
        )
      : undefined
  const traces = options.traces ?? traceExecution?.traces
  const evaluation = evaluateChallenge(
    resolved.challenge,
    options,
    traces
  )
  let applied: AppliedSubmission | undefined

  await store.update((current) => {
    const currentResolved = resolveChallenge(
      content,
      current,
      options.challengeId
    )
    const currentEvaluation = evaluateChallenge(
      currentResolved.challenge,
      options,
      traces
    )
    applied = applySubmission({
      state: current,
      content,
      resolved: currentResolved,
      evaluation: currentEvaluation,
      submissionId,
      submissionPath,
      hintUsages: options.hintUsages ?? [],
      explanation: options.explanation ?? '',
      submittedAt
    })
    return applied.state
  })

  if (!applied) {
    throw new Error('Submission was not applied.')
  }

  const sourceFiles = ['agent.py', 'tools.py', 'config.py']
  const sourceParts: string[] = []
  for (const file of sourceFiles) {
    const content = await readOptionalFile(join(workspaceDir, file))
    if (content) {
      sourceParts.push(`# --- ${file} ---\n${content}`)
    }
  }

  const artifact = {
    submissionId,
    challengeId: resolved.challenge.id,
    missionId: resolved.mission.id,
    output: options.output ?? '',
    traces: traces ?? [],
    toolCalls: options.toolCalls ?? [],
    errorHandling: options.errorHandling ?? null,
    hintUsages: options.hintUsages ?? [],
    explanation: options.explanation ?? '',
    submittedAt,
    evaluation: {
      passed: evaluation.passed,
      score: evaluation.score,
      failureCategories: evaluation.failureCategories,
      feedback: evaluation.feedback,
      testResults: evaluation.testResults
    },
    runtime: traceExecution
      ? {
          exitCode: traceExecution.execution.exitCode,
          stdout: traceExecution.execution.stdout,
          stderr: traceExecution.execution.stderr,
          timedOut: traceExecution.execution.timedOut,
          durationMs: traceExecution.execution.durationMs
        }
      : null,
    source: sourceParts.join('\n\n'),
    readme: await readOptionalFile(join(workspaceDir, 'README.md'))
  }

  await mkdir(submissionsDir, { recursive: true })
  await writeFile(
    submissionPath,
    JSON.stringify(artifact, null, 2),
    'utf8'
  )

  return {
    submissionId,
    submissionPath,
    statePath: store.filePath,
    challengeId: resolved.challenge.id,
    missionId: resolved.mission.id,
    passed: evaluation.passed,
    score: evaluation.score,
    failureCategories: evaluation.failureCategories,
    feedback: evaluation.feedback,
    unlockedChallengeId: applied.unlockedChallengeId,
    unlockedMissionId: applied.unlockedMissionId,
    bossUnlocked: applied.bossUnlocked
  }
}
