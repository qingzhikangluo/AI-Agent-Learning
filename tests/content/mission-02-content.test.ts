import { fileURLToPath } from 'node:url'

import {
  challengeSchema,
  loadContentFiles,
  loadMissions
} from '@ai-agent-rpg/content'
import { describe, expect, it } from 'vitest'

const missionDir = fileURLToPath(
  new URL('../../packages/content/missions/mission-02', import.meta.url)
)

describe('mission-02 content', () => {
  it('loads a mission with API and JSON skills', async () => {
    const missions = await loadMissions()
    const mission = missions.find((item) => item.id === 'mission-02')

    expect(mission?.title).toBe('API & JSON')
    expect(mission?.learningBlocks?.length).toBeGreaterThanOrEqual(3)
    expect(mission?.skillTargets).toContain('api.json')
  })

  it('loads API request, JSON parsing, and API error challenges', async () => {
    const challenges = await loadContentFiles(
      `${missionDir}/challenges`,
      challengeSchema
    )

    expect(challenges).toHaveLength(3)
    expect(new Set(challenges.map((challenge) => challenge.id))).toEqual(
      new Set(['api-request', 'json-parser', 'api-error'])
    )
  })
})
