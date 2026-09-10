import { join } from 'node:path'

import {
  loadChallenges,
  loadMissions,
  missionsContentDir
} from '@ai-agent-rpg/content'
import type { Challenge, Mission } from '@ai-agent-rpg/domain'
import {
  createEmptyPlayerState,
  DEFAULT_PLAYER_ID,
  type PlayerChallengeState,
  type PlayerMissionState,
  type PlayerState,
  type PlayerStateStore
} from '@ai-agent-rpg/progression'

export interface GameContent {
  missions: Mission[]
  challenges: Challenge[]
  challengesByMission: Record<string, Challenge[]>
}

export async function loadGameContent(): Promise<GameContent> {
  const missions = (await loadMissions())
    .slice()
    .sort((left, right) => left.id.localeCompare(right.id))
  const challengesByMission: Record<string, Challenge[]> = {}
  const challenges: Challenge[] = []

  for (const mission of missions) {
    const loaded = await loadChallenges(
      join(missionsContentDir, mission.id, 'challenges')
    )
    const byId = new Map(loaded.map((challenge) => [challenge.id, challenge]))
    const ordered = mission.challenges
      .map((challengeId) => byId.get(challengeId))
      .filter((challenge): challenge is Challenge => Boolean(challenge))

    challengesByMission[mission.id] = ordered
    challenges.push(...ordered)
  }

  return { missions, challenges, challengesByMission }
}

export async function createSeededPlayerState(
  playerId: string = DEFAULT_PLAYER_ID,
  now: string = new Date().toISOString()
): Promise<PlayerState> {
  const content = await loadGameContent()
  const empty = createEmptyPlayerState(playerId, now)
  const firstMissionId = content.missions[0]?.id ?? empty.currentMissionId

  const missions: PlayerMissionState[] = content.missions.map(
    (mission, index) => ({
      id: mission.id,
      status: index === 0 ? 'active' : 'locked'
    })
  )
  const challenges: PlayerChallengeState[] = content.missions.flatMap(
    (mission, missionIndex) =>
      (content.challengesByMission[mission.id] ?? []).map(
        (challenge, challengeIndex) => ({
          id: challenge.id,
          missionId: mission.id,
          status:
            missionIndex === 0 && challengeIndex === 0
              ? 'active'
              : 'locked',
          attempts: 0,
          hintsUsed: 0,
          failureCategories: []
        })
      )
  )

  return {
    ...empty,
    currentMissionId: firstMissionId,
    missions,
    challenges
  }
}

export async function ensurePlayerState(
  store: PlayerStateStore
): Promise<PlayerState> {
  const existing = await store.read()

  if (existing && existing.missions.length > 0) {
    return existing
  }

  const seeded = await createSeededPlayerState(existing?.playerId)
  const merged: PlayerState = existing
    ? {
        ...seeded,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
        evidence: existing.evidence,
        attempts: existing.attempts,
        hintUsages: existing.hintUsages,
        skills: existing.skills,
        submissions: existing.submissions,
        boss: existing.boss,
        transfer: existing.transfer
      }
    : seeded

  await store.write(merged)
  return merged
}
