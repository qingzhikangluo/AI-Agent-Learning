import { join } from 'node:path'

import {
  loadChallenges,
  loadMissions,
  missionsContentDir
} from '@ai-agent-rpg/content'
import type { Challenge, Mission } from '@ai-agent-rpg/domain'
import {
  createPlayerStateFromMissionSeeds,
  DEFAULT_PLAYER_ID,
  type MissionSeed,
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
  const seeds: MissionSeed[] = content.missions.map((mission) => ({
    id: mission.id,
    challengeIds: (
      content.challengesByMission[mission.id] ?? []
    ).map((challenge) => challenge.id),
    bossId: mission.bossId
  }))

  return createPlayerStateFromMissionSeeds(playerId, seeds, now)
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
