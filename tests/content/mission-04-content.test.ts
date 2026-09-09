import { fileURLToPath } from 'node:url'

import {
  challengeSchema,
  loadContentFiles,
  loadMissions
} from '@ai-agent-rpg/content'
import { describe, expect, it } from 'vitest'

const missionDir = fileURLToPath(
  new URL('../../packages/content/missions/mission-04', import.meta.url)
)

describe('mission-04 content', () => {
  it('loads a mission with agent loop skills', async () => {
    const missions = await loadMissions()
    const mission = missions.find((item) => item.id === 'mission-04')

    expect(mission?.title).toBe('Agent Loop')
    expect(mission?.learningBlocks?.length).toBeGreaterThanOrEqual(2)
    expect(mission?.skillTargets).toContain('agent.error-recovery')
  })

  it('loads basic loop and error recovery challenges', async () => {
    const challenges = await loadContentFiles(
      `${missionDir}/challenges`,
      challengeSchema
    )

    expect(challenges).toHaveLength(2)
    expect(new Set(challenges.map((challenge) => challenge.id))).toEqual(
      new Set(['basic-agent-loop', 'tool-failure-recovery'])
    )
  })
})
