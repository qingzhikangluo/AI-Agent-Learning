import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

import {
  loadChallenges,
  loadMissions
} from '@ai-agent-rpg/content'
import {
  ChallengeType,
  type Challenge,
  type Mission,
  type TestCase
} from '@ai-agent-rpg/domain'
import {
  buildSkillDashboard,
  createPlayerStateFromMissionSeeds,
  FilePlayerStateStore,
  type MissionSeed,
  type PlayerState as StoredPlayerState
} from '@ai-agent-rpg/progression'
import type { Skill } from '@ai-agent-rpg/domain'

import type {
  BossSummary,
  ChallengeDetail,
  ChallengeStatus,
  LearningBlockSummary,
  MissionStatus,
  MissionSummary,
  PlayerState,
  PublicTestSummary,
  TransferSummary
} from './player-data'

type LearningBlockType = 'concept' | 'example' | 'instruction'

interface ContentLearningBlock {
  id: string
  title: string
  type?: LearningBlockType
  body: string
}

type ContentMission = Mission & {
  learningBlocks?: ContentLearningBlock[]
}

interface LoadedGameContent {
  missions: ContentMission[]
  challenges: Challenge[]
  challengesByMission: Record<string, Challenge[]>
  boss?: Challenge
  transfer?: Challenge
}

let contentPromise: Promise<LoadedGameContent> | undefined

function findRepositoryRoot(startDir: string): string {
  let current = startDir

  for (let depth = 0; depth < 8; depth += 1) {
    if (existsSync(join(current, 'player-workspace'))) {
      return current
    }

    const parent = dirname(current)
    if (parent === current) {
      break
    }
    current = parent
  }

  return startDir
}

export function playerWorkspaceDir(): string {
  return (
    process.env.AGENT_RPG_WORKSPACE ??
    join(repositoryRoot(), 'player-workspace')
  )
}

export function repositoryRoot(): string {
  return findRepositoryRoot(process.cwd())
}

export function contentDirectory(...segments: string[]): string {
  return join(repositoryRoot(), 'packages', 'content', ...segments)
}

async function loadGameContentUncached(): Promise<LoadedGameContent> {
  const missions = (await loadMissions(contentDirectory('missions')))
    .slice()
    .sort((left, right) => left.id.localeCompare(right.id)) as ContentMission[]
  const challengesByMission: Record<string, Challenge[]> = {}
  const challenges: Challenge[] = []

  for (const mission of missions) {
    const loaded = await loadChallenges(
      contentDirectory('missions', mission.id, 'challenges')
    )
    const byId = new Map(loaded.map((challenge) => [challenge.id, challenge]))
    const ordered = mission.challenges
      .map((challengeId) => byId.get(challengeId))
      .filter((challenge): challenge is Challenge => Boolean(challenge))

    challengesByMission[mission.id] = ordered
    challenges.push(...ordered)
  }

  const bosses = await loadChallenges(contentDirectory('bosses'))
  const transfers = await loadChallenges(contentDirectory('transfers'))

  return {
    missions,
    challenges,
    challengesByMission,
    boss: bosses[0],
    transfer: transfers[0]
  }
}

export function loadGameContent(): Promise<LoadedGameContent> {
  contentPromise ??= loadGameContentUncached()
  return contentPromise
}

function missionSeeds(content: LoadedGameContent): MissionSeed[] {
  return content.missions.map((mission) => ({
    id: mission.id,
    challengeIds: (
      content.challengesByMission[mission.id] ?? []
    ).map((challenge) => challenge.id),
    bossId: mission.bossId
  }))
}

async function readStoredState(): Promise<StoredPlayerState | undefined> {
  const store = new FilePlayerStateStore(playerWorkspaceDir())
  return store.read()
}

async function loadState(
  content: LoadedGameContent
): Promise<StoredPlayerState> {
  const stored = await readStoredState()

  if (stored && stored.missions.length > 0) {
    return stored
  }

  return createPlayerStateFromMissionSeeds(
    stored?.playerId ?? 'player-001',
    missionSeeds(content)
  )
}

function toViewType(type: ChallengeType): 'concept' | 'code' {
  return type === ChallengeType.CONCEPT ? 'concept' : 'code'
}

function toMissionStatus(status: string): MissionStatus {
  return status === 'passed' ? 'passed' : status === 'active' ? 'active' : 'locked'
}

function toChallengeStatus(status: string): ChallengeStatus {
  if (status === 'passed' || status === 'active' || status === 'failed') {
    return status
  }
  return 'locked'
}

function toMilestoneStatus(status: string): MissionStatus {
  return status === 'passed'
    ? 'passed'
    : status === 'in-progress'
      ? 'active'
      : 'locked'
}

function resolveMissionStatus(
  missionId: string,
  missionIndex: number,
  state: StoredPlayerState
): MissionStatus {
  const stored = state.missions.find((mission) => mission.id === missionId)
  if (stored) {
    return toMissionStatus(stored.status)
  }
  return missionIndex === 0 ? 'active' : 'locked'
}

function resolveChallengeStatus(
  challengeId: string,
  missionIndex: number,
  challengeIndex: number,
  state: StoredPlayerState
): ChallengeStatus {
  const stored = state.challenges.find(
    (challenge) => challenge.id === challengeId
  )
  if (stored) {
    return toChallengeStatus(stored.status)
  }
  return missionIndex === 0 && challengeIndex === 0 ? 'active' : 'locked'
}

function toLearningBlockType(
  type: LearningBlockType | undefined
): LearningBlockType {
  return type ?? 'concept'
}

function buildMissionSummaries(
  content: LoadedGameContent,
  state: StoredPlayerState
): MissionSummary[] {
  return content.missions.map((mission, missionIndex) => {
    const challenges = content.challengesByMission[mission.id] ?? []
    const learningBlocks: LearningBlockSummary[] = (
      mission.learningBlocks ?? []
    ).map((block) => ({
      id: block.id,
      title: block.title,
      type: toLearningBlockType(block.type),
      body: block.body
    }))
    const objectives = [
      ...new Set(challenges.flatMap((challenge) => challenge.objectives))
    ]

    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      objectives,
      skillTargets: mission.skillTargets,
      status: resolveMissionStatus(mission.id, missionIndex, state),
      challenges: challenges.map((challenge, challengeIndex) => ({
        id: challenge.id,
        title: challenge.title,
        type: toViewType(challenge.type),
        status: resolveChallengeStatus(
          challenge.id,
          missionIndex,
          challengeIndex,
          state
        )
      })),
      learningBlocks
    }
  })
}

function parseToolsFromDescription(description: string): string[] {
  const match = description.match(/可用工具[:：]\s*([^。]+)/)
  if (!match) return []

  return [...match[1].matchAll(/([a-z_]+)（/g)].map(
    (toolMatch) => toolMatch[1]
  )
}

function toolsFromTests(tests: Challenge['tests']): string[] {
  return [
    ...new Set(
      tests
        .filter(
          (test) =>
            test.expectedBehavior.type === 'tool_called' &&
            typeof test.expectedBehavior.value === 'string'
        )
        .map((test) => test.expectedBehavior.value as string)
    )
  ]
}

function resolveTools(
  description: string,
  tests: Challenge['tests']
): string[] {
  const parsed = parseToolsFromDescription(description)
  return parsed.length > 0 ? parsed : toolsFromTests(tests)
}

function publicTests(
  challenge: Challenge
): PublicTestSummary[] {
  return challenge.tests
    .filter((test) => test.visibility === 'public')
    .map((test) => ({ id: test.id, name: test.name }))
}

function buildBossSummary(
  content: LoadedGameContent,
  state: StoredPlayerState
): BossSummary {
  if (!content.boss) {
    throw new Error('Boss content is missing.')
  }

  return {
    id: content.boss.id,
    title: content.boss.title,
    description: content.boss.description,
    status: toMilestoneStatus(state.boss.status),
    tools: resolveTools(content.boss.description, content.boss.tests),
    constraints: content.boss.objectives,
    publicTests: publicTests(content.boss)
  }
}

function buildTransferSummary(
  content: LoadedGameContent,
  state: StoredPlayerState
): TransferSummary {
  if (!content.transfer) {
    throw new Error('Transfer content is missing.')
  }

  return {
    id: content.transfer.id,
    title: content.transfer.title,
    description: content.transfer.description,
    status: toMilestoneStatus(state.transfer.status),
    objectives: content.transfer.objectives,
    tools: resolveTools(
      content.transfer.description,
      content.transfer.tests
    )
  }
}

export async function loadPlayerStateView(): Promise<PlayerState> {
  const content = await loadGameContent()
  const state = await loadState(content)
  const challengeById = new Map(
    content.challenges.map((challenge) => [challenge.id, challenge])
  )

  return {
    currentMissionId:
      state.currentMissionId ?? content.missions[0]?.id ?? 'mission-01',
    missions: buildMissionSummaries(content, state),
    boss: buildBossSummary(content, state),
    transfer: buildTransferSummary(content, state),
    evidence: state.evidence.map((evidence) => ({
      id: evidence.id,
      skill: evidence.skillId,
      task: challengeById.get(evidence.taskId)?.title ?? evidence.taskId,
      result: evidence.result,
      attempts: evidence.attempts,
      hints: evidence.hintsUsed
    })),
    skills: state.skills.map((skill) => ({
      id: skill.skillId,
      level: skill.level,
      confidence: skill.confidence,
      strengths: skill.strengths,
      weaknesses: skill.weaknesses
    }))
  }
}

export async function loadMissionView(
  missionId: string
): Promise<MissionSummary | undefined> {
  const state = await loadPlayerStateView()
  return state.missions.find((mission) => mission.id === missionId)
}

export async function loadChallengeView(
  challengeId: string
): Promise<ChallengeDetail | undefined> {
  const content = await loadGameContent()
  const state = await loadState(content)
  const challenge = content.challenges.find(
    (item) => item.id === challengeId
  )
  if (!challenge) return undefined

  const missionIndex = content.missions.findIndex(
    (mission) => mission.id === challenge.missionId
  )
  const missionChallenges =
    content.challengesByMission[challenge.missionId] ?? []
  const challengeIndex = missionChallenges.findIndex(
    (item) => item.id === challenge.id
  )
  const type = toViewType(challenge.type)
  const status = resolveChallengeStatus(
    challenge.id,
    missionIndex,
    challengeIndex,
    state
  )
  const missionStatus = resolveMissionStatus(
    challenge.missionId,
    missionIndex,
    state
  )

  return {
    id: challenge.id,
    missionId: challenge.missionId,
    missionTitle:
      content.missions.find((mission) => mission.id === challenge.missionId)
        ?.title ?? challenge.missionId,
    type,
    title: challenge.title,
    description: challenge.description,
    objectives: challenge.objectives,
    publicTests: publicTests(challenge),
    workspace:
      type === 'code'
        ? `def handle(user_message):
    # 在这里实现你的 Agent 逻辑
    return user_message
`
        : '# 用中文写出你的判断与理由\n',
    status,
    locked: missionStatus === 'locked' || status === 'locked'
  }
}

export async function loadBossView(
  bossId: string
): Promise<BossSummary | undefined> {
  const state = await loadPlayerStateView()
  return state.boss.id === bossId ? state.boss : undefined
}

export async function loadTransferView(
  transferId: string
): Promise<TransferSummary | undefined> {
  const state = await loadPlayerStateView()
  return state.transfer.id === transferId ? state.transfer : undefined
}

export async function loadChallengeRuntime(
  challengeId: string
): Promise<{ tests: TestCase[]; locked: boolean } | undefined> {
  const content = await loadGameContent()
  const state = await loadState(content)
  const challenge = content.challenges.find(
    (item) => item.id === challengeId
  )

  if (!challenge) return undefined

  const missionIndex = content.missions.findIndex(
    (mission) => mission.id === challenge.missionId
  )
  const missionChallenges =
    content.challengesByMission[challenge.missionId] ?? []
  const challengeIndex = missionChallenges.findIndex(
    (item) => item.id === challenge.id
  )
  const status = resolveChallengeStatus(
    challenge.id,
    missionIndex,
    challengeIndex,
    state
  )
  const missionStatus = resolveMissionStatus(
    challenge.missionId,
    missionIndex,
    state
  )

  return {
    tests: challenge.tests,
    locked: missionStatus === 'locked' || status === 'locked'
  }
}

export async function loadAssessmentView(): Promise<
  PlayerState['skills']
> {
  const content = await loadGameContent()
  const state = await loadState(content)
  const skillIds = [
    ...new Set([
      ...content.missions.flatMap((mission) => mission.skillTargets),
      ...state.skills.map((skill) => skill.skillId)
    ])
  ].sort()

  return skillIds.map((skillId) => {
    const skill: Skill = {
      id: skillId,
      name: skillId,
      description: '',
      maxLevel: 5
    }
    const dashboard = buildSkillDashboard(skill, state.evidence)

    return {
      id: skillId,
      level: dashboard.level,
      confidence: dashboard.confidence,
      strengths: dashboard.strengths,
      weaknesses: dashboard.weaknesses
    }
  })
}

export async function listMissionIds(): Promise<string[]> {
  const content = await loadGameContent()
  return content.missions.map((mission) => mission.id)
}

export async function listChallengeIds(): Promise<string[]> {
  const content = await loadGameContent()
  return content.challenges.map((challenge) => challenge.id)
}

export async function listBossIds(): Promise<string[]> {
  const content = await loadGameContent()
  return content.boss ? [content.boss.id] : []
}

export async function listTransferIds(): Promise<string[]> {
  const content = await loadGameContent()
  return content.transfer ? [content.transfer.id] : []
}
