import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type {
  AgentTrace,
  Attempt,
  Challenge,
  EvaluationResult,
  Evidence,
  FailureCategory,
  HintUsage
} from '@ai-agent-rpg/domain'
import {
  scoreBoss,
  scoreStructuredAnswers,
  type EvaluationLanguage,
  type ErrorHandlingSubmission,
  type ToolCall
} from '@ai-agent-rpg/evaluator'
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
import {
  evaluateChallenge,
  resolveChallenge,
  runChallenge,
  type ResolvedChallenge
} from './challenge-runner'

const BOSS_PASS_THRESHOLD = 0.8

function applyBossScore(
  challenge: Challenge,
  options: SubmitOptions,
  evaluation: EvaluationResult
): EvaluationResult {
  const rubric = challenge.explanationRubric ?? []
  const answers = options.explanationAnswers ?? []
  const explanationAnswerScores = rubric.map((item, index) =>
    scoreStructuredAnswers(item.expectedAnswers, [
      answers[index] ?? ''
    ].filter(Boolean))
  )
  const bossScore = scoreBoss({
    deterministicScore: evaluation.score,
    explanationAnswerScores
  })
  const passed =
    evaluation.passed && bossScore.total >= BOSS_PASS_THRESHOLD

  return {
    ...evaluation,
    passed,
    score: bossScore.total,
    feedback: [
      ...evaluation.feedback,
      `Deterministic score: ${Math.round(
        bossScore.deterministicScore * 100
      )}%`,
      `Explanation score: ${Math.round(
        bossScore.explanationScore * 100
      )}%`,
      `Total score: ${Math.round(bossScore.total * 100)}%`
    ]
  }
}

export interface SubmitOptions {
  workspaceDir: string
  challengeId?: string
  output?: string
  toolCalls?: ToolCall[]
  errorHandling?: ErrorHandlingSubmission
  traces?: AgentTrace[]
  explanationAnswers?: string[]
  language?: EvaluationLanguage
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
  bossPassed: boolean
  transferUnlocked: boolean
  transferPassed: boolean
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
  skillTargets: string[],
  newEvidence: Evidence[],
  updatedAt: string
): PlayerSkillState[] {
  const allEvidence = [...state.evidence, ...newEvidence]
  let skills = [...state.skills]

  for (const skillId of skillTargets) {
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
  bossPassed: boolean
  transferUnlocked: boolean
  transferPassed: boolean
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
  const { challenge, mission, kind } = resolved
  const challengeState =
    kind === 'mission'
      ? state.challenges.find((item) => item.id === challenge.id)
      : undefined

  if (kind === 'mission' && !challengeState) {
    throw new Error(
      `Challenge ${challenge.id} is not part of the current player state.`
    )
  }

  const attemptNumber = (challengeState?.attempts ?? 0) + 1
  const hintsUsed = (challengeState?.hintsUsed ?? 0) + hintUsages.length
  const result = evaluation.passed ? 'pass' : 'fail'
  const newEvidence: Evidence[] = resolved.skillTargets.map((skillId) => ({
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
  let bossPassed = false
  let transferUnlocked = false
  let transferPassed = false
  let unlockedChallengeId: string | undefined
  let unlockedMissionId: string | undefined

  if (evaluation.passed && kind === 'mission' && mission) {
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

  if (kind === 'boss') {
    if (evaluation.passed) {
      bossPassed = true
      transferUnlocked = state.transfer.status === 'locked'
    }
  }

  if (kind === 'transfer') {
    transferPassed = evaluation.passed
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
    currentMissionId:
      kind === 'mission' ? currentMissionId : state.currentMissionId,
    missions: kind === 'mission' ? missions : state.missions,
    challenges: kind === 'mission' ? challenges : state.challenges,
    skills: updateSkillStates(
      state,
      resolved.skillTargets,
      newEvidence,
      submittedAt
    ),
    evidence: [...state.evidence, ...newEvidence],
    attempts: [...state.attempts, attempt],
    hintUsages: [...state.hintUsages, ...hintUsages],
    submissions: [...state.submissions, submissionRecord],
    boss:
      kind === 'boss'
        ? {
            ...state.boss,
            status: evaluation.passed ? 'passed' : 'in-progress'
          }
        : bossUnlocked && state.boss.status === 'locked'
          ? { ...state.boss, status: 'in-progress' }
          : state.boss,
    transfer:
      kind === 'transfer'
        ? {
            ...state.transfer,
            status: evaluation.passed ? 'passed' : 'in-progress'
          }
        : transferUnlocked && state.transfer.status === 'locked'
          ? { ...state.transfer, status: 'in-progress' }
          : state.transfer
  }

  return {
    state: nextState,
    submissionRecord,
    unlockedChallengeId,
    unlockedMissionId,
    bossUnlocked,
    bossPassed,
    transferUnlocked,
    transferPassed
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
  const run = await runChallenge({
    ...options,
    content,
    state
  })
  const { resolved, evaluation, traces, traceExecution } = run
  const effectiveEvaluation =
    resolved.challenge.type === 'boss'
      ? applyBossScore(resolved.challenge, options, evaluation)
      : evaluation
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
    const currentEffectiveEvaluation =
      currentResolved.challenge.type === 'boss'
        ? applyBossScore(
            currentResolved.challenge,
            options,
            currentEvaluation
          )
        : currentEvaluation
    applied = applySubmission({
      state: current,
      content,
      resolved: currentResolved,
      evaluation: currentEffectiveEvaluation,
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
    const fileContent = await readOptionalFile(join(workspaceDir, file))
    if (fileContent) {
      sourceParts.push(`# --- ${file} ---\n${fileContent}`)
    }
  }

  const artifact = {
    submissionId,
    challengeId: resolved.challenge.id,
    missionId: resolved.mission?.id ?? resolved.challenge.missionId,
    output: options.output ?? '',
    traces: traces ?? [],
    toolCalls: options.toolCalls ?? [],
    errorHandling: options.errorHandling ?? null,
    hintUsages: options.hintUsages ?? [],
    explanation: options.explanation ?? '',
    submittedAt,
    evaluation: {
      passed: effectiveEvaluation.passed,
      score: effectiveEvaluation.score,
      failureCategories: effectiveEvaluation.failureCategories,
      feedback: effectiveEvaluation.feedback,
      testResults: effectiveEvaluation.testResults
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
    missionId: resolved.mission?.id ?? resolved.challenge.missionId,
    passed: effectiveEvaluation.passed,
    score: effectiveEvaluation.score,
    failureCategories: effectiveEvaluation.failureCategories,
    feedback: effectiveEvaluation.feedback,
    unlockedChallengeId: applied.unlockedChallengeId,
    unlockedMissionId: applied.unlockedMissionId,
    bossUnlocked: applied.bossUnlocked,
    bossPassed: applied.bossPassed,
    transferUnlocked: applied.transferUnlocked,
    transferPassed: applied.transferPassed
  }
}
