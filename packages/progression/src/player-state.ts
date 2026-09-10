import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

import {
  ChallengeType,
  FailureCategory,
  SkillLevel,
  type Attempt,
  type Evidence,
  type HintUsage
} from '@ai-agent-rpg/domain'
import { z } from 'zod'

export const PLAYER_STATE_SCHEMA_VERSION = 1
export const PLAYER_STATE_DIR = '.agent-rpg'
export const PLAYER_STATE_FILE = 'state.json'
export const DEFAULT_PLAYER_ID = 'player-001'
export const DEFAULT_MISSION_ID = 'mission-01'
export const FIRST_BOSS_ID = 'first-agent-boss'
export const TRANSFER_ID = 'travel-expense-transfer'

export type MissionProgressStatus = 'locked' | 'active' | 'passed'
export type ChallengeProgressStatus =
  | 'locked'
  | 'active'
  | 'passed'
  | 'failed'
export type MilestoneProgressStatus = 'locked' | 'in-progress' | 'passed'

export interface PlayerMissionState {
  id: string
  status: MissionProgressStatus
  startedAt?: string
  completedAt?: string
}

export interface PlayerChallengeState {
  id: string
  missionId: string
  status: ChallengeProgressStatus
  attempts: number
  hintsUsed: number
  bestScore?: number
  failureCategories: FailureCategory[]
  completedAt?: string
}

export interface PlayerSkillState {
  skillId: string
  level: SkillLevel
  confidence: number
  strengths: string[]
  weaknesses: string[]
  updatedAt: string
}

export interface PlayerMilestoneState {
  id: string
  status: MilestoneProgressStatus
}

export interface SubmissionRecord {
  id: string
  challengeId: string
  submittedAt: string
  testResult: string
  explanation: string
  submissionPath: string
}

export interface PlayerState {
  schemaVersion: typeof PLAYER_STATE_SCHEMA_VERSION
  playerId: string
  createdAt: string
  updatedAt: string
  currentMissionId: string
  missions: PlayerMissionState[]
  challenges: PlayerChallengeState[]
  skills: PlayerSkillState[]
  evidence: Evidence[]
  attempts: Attempt[]
  hintUsages: HintUsage[]
  submissions: SubmissionRecord[]
  boss: PlayerMilestoneState
  transfer: PlayerMilestoneState
}

const evidenceSchema = z.object({
  id: z.string().min(1),
  playerId: z.string().min(1),
  skillId: z.string().min(1),
  taskId: z.string().min(1),
  taskType: z.nativeEnum(ChallengeType),
  result: z.enum(['pass', 'fail']),
  score: z.number().optional(),
  attempts: z.number().int().min(0),
  hintsUsed: z.number().int().min(0),
  failureCategories: z.array(z.nativeEnum(FailureCategory)),
  createdAt: z.string().min(1)
})

const attemptSchema = z.object({
  id: z.string().min(1),
  playerId: z.string().min(1),
  challengeId: z.string().min(1),
  status: z.enum(['running', 'passed', 'failed']),
  startedAt: z.string().min(1),
  finishedAt: z.string().optional()
})

const hintUsageSchema = z.object({
  id: z.string().min(1),
  playerId: z.string().min(1),
  attemptId: z.string().min(1),
  challengeId: z.string().min(1),
  hintId: z.string().min(1),
  hintLevel: z.number().int().min(0),
  requestedAt: z.string().min(1)
})

const missionStateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['locked', 'active', 'passed']),
  startedAt: z.string().optional(),
  completedAt: z.string().optional()
})

const challengeStateSchema = z.object({
  id: z.string().min(1),
  missionId: z.string().min(1),
  status: z.enum(['locked', 'active', 'passed', 'failed']),
  attempts: z.number().int().min(0),
  hintsUsed: z.number().int().min(0),
  bestScore: z.number().optional(),
  failureCategories: z.array(z.nativeEnum(FailureCategory)),
  completedAt: z.string().optional()
})

const skillStateSchema = z.object({
  skillId: z.string().min(1),
  level: z.nativeEnum(SkillLevel),
  confidence: z.number().min(0).max(1),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  updatedAt: z.string().min(1)
})

const milestoneStateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['locked', 'in-progress', 'passed'])
})

const submissionRecordSchema = z.object({
  id: z.string().min(1),
  challengeId: z.string().min(1),
  submittedAt: z.string().min(1),
  testResult: z.string(),
  explanation: z.string(),
  submissionPath: z.string().min(1)
})

export const playerStateSchema = z.object({
  schemaVersion: z.literal(PLAYER_STATE_SCHEMA_VERSION),
  playerId: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  currentMissionId: z.string().min(1),
  missions: z.array(missionStateSchema),
  challenges: z.array(challengeStateSchema),
  skills: z.array(skillStateSchema),
  evidence: z.array(evidenceSchema),
  attempts: z.array(attemptSchema),
  hintUsages: z.array(hintUsageSchema),
  submissions: z.array(submissionRecordSchema),
  boss: milestoneStateSchema,
  transfer: milestoneStateSchema
})

export class PlayerStateValidationError extends Error {}

export function parsePlayerState(value: unknown): PlayerState {
  const result = playerStateSchema.safeParse(value)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const path = issue.path.join('.') || '(root)'
        return `${path}: ${issue.message}`
      })
      .join('; ')
    throw new PlayerStateValidationError(
      `Invalid player state: ${issues}`
    )
  }

  return result.data as PlayerState
}

export function createEmptyPlayerState(
  playerId: string = DEFAULT_PLAYER_ID,
  now: string = new Date().toISOString()
): PlayerState {
  return {
    schemaVersion: PLAYER_STATE_SCHEMA_VERSION,
    playerId,
    createdAt: now,
    updatedAt: now,
    currentMissionId: DEFAULT_MISSION_ID,
    missions: [],
    challenges: [],
    skills: [],
    evidence: [],
    attempts: [],
    hintUsages: [],
    submissions: [],
    boss: { id: FIRST_BOSS_ID, status: 'locked' },
    transfer: { id: TRANSFER_ID, status: 'locked' }
  }
}

export interface MissionSeed {
  id: string
  challengeIds: string[]
  bossId?: string
}

export function createPlayerStateFromMissionSeeds(
  playerId: string = DEFAULT_PLAYER_ID,
  missionSeeds: MissionSeed[],
  now: string = new Date().toISOString()
): PlayerState {
  const empty = createEmptyPlayerState(playerId, now)
  const firstMissionId = missionSeeds[0]?.id ?? empty.currentMissionId
  const finalMission = missionSeeds[missionSeeds.length - 1]

  return {
    ...empty,
    currentMissionId: firstMissionId,
    missions: missionSeeds.map((mission, index) => ({
      id: mission.id,
      status: index === 0 ? 'active' : 'locked'
    })),
    challenges: missionSeeds.flatMap((mission, missionIndex) =>
      mission.challengeIds.map((challengeId, challengeIndex) => ({
        id: challengeId,
        missionId: mission.id,
        status:
          missionIndex === 0 && challengeIndex === 0
            ? ('active' as const)
            : ('locked' as const),
        attempts: 0,
        hintsUsed: 0,
        failureCategories: []
      }))
    ),
    boss: {
      id: finalMission?.bossId ?? empty.boss.id,
      status: 'locked'
    }
  }
}

export interface PlayerStateStore {
  read(): Promise<PlayerState | undefined>
  write(state: PlayerState): Promise<void>
  getOrCreate(): Promise<PlayerState>
  update(mutator: (state: PlayerState) => PlayerState): Promise<PlayerState>
}

export function playerStateFilePath(workspaceDir: string): string {
  return join(resolve(workspaceDir), PLAYER_STATE_DIR, PLAYER_STATE_FILE)
}

export class FilePlayerStateStore implements PlayerStateStore {
  readonly filePath: string
  private readonly playerId: string
  private queue: Promise<unknown> = Promise.resolve()

  constructor(
    workspaceDir: string,
    playerId: string = DEFAULT_PLAYER_ID
  ) {
    this.filePath = playerStateFilePath(workspaceDir)
    this.playerId = playerId
  }

  async read(): Promise<PlayerState | undefined> {
    let raw: string

    try {
      raw = await readFile(this.filePath, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return undefined
      }
      throw error
    }

    return parsePlayerState(JSON.parse(raw))
  }

  async write(state: PlayerState): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    const tempPath = `${this.filePath}.tmp`
    await writeFile(tempPath, JSON.stringify(state, null, 2), 'utf8')
    await rename(tempPath, this.filePath)
  }

  async getOrCreate(): Promise<PlayerState> {
    return (await this.read()) ?? createEmptyPlayerState(this.playerId)
  }

  async update(
    mutator: (state: PlayerState) => PlayerState
  ): Promise<PlayerState> {
    const next = this.queue.then(async () => {
      const state = await this.getOrCreate()
      const updated = mutator(state)
      await this.write(updated)
      return updated
    })

    this.queue = next.then(
      () => undefined,
      () => undefined
    )

    return next
  }
}

export class FileEvidenceRecorder {
  constructor(private readonly store: PlayerStateStore) {}

  async recordEvidence(evidence: Evidence): Promise<void> {
    await this.store.update((state) => ({
      ...state,
      evidence: [...state.evidence, evidence],
      updatedAt: evidence.createdAt
    }))
  }

  async recordAttempt(attempt: Attempt): Promise<void> {
    await this.store.update((state) => ({
      ...state,
      attempts: [...state.attempts, attempt],
      updatedAt: attempt.finishedAt ?? attempt.startedAt
    }))
  }

  async recordHintUsage(usage: HintUsage): Promise<void> {
    await this.store.update((state) => ({
      ...state,
      hintUsages: [...state.hintUsages, usage],
      updatedAt: usage.requestedAt
    }))
  }

  async getEvidenceByPlayer(playerId: string): Promise<Evidence[]> {
    const state = await this.store.getOrCreate()
    return state.evidence.filter((evidence) => evidence.playerId === playerId)
  }

  async getAttemptsByPlayer(playerId: string): Promise<Attempt[]> {
    const state = await this.store.getOrCreate()
    return state.attempts.filter((attempt) => attempt.playerId === playerId)
  }

  async getHintUsagesByPlayer(playerId: string): Promise<HintUsage[]> {
    const state = await this.store.getOrCreate()
    return state.hintUsages.filter((usage) => usage.playerId === playerId)
  }
}
