import { fileURLToPath } from 'node:url'

import {
  challengeSchema,
  loadContentFiles,
  loadMissions
} from '@ai-agent-rpg/content'
import { describe, expect, it } from 'vitest'

const missionDir = fileURLToPath(
  new URL('../../packages/content/missions/mission-03', import.meta.url)
)

describe('mission-03 content', () => {
  it('loads a mission with tool calling skills', async () => {
    const missions = await loadMissions()
    const mission = missions.find((item) => item.id === 'mission-03')

    expect(mission?.title).toBe('Tool Calling')
    expect(mission?.learningBlocks?.length).toBeGreaterThanOrEqual(3)
    expect(mission?.skillTargets).toContain('tool.arguments')
  })

  it('loads tool selection, argument, and error challenges', async () => {
    const challenges = await loadContentFiles(
      `${missionDir}/challenges`,
      challengeSchema
    )

    expect(challenges).toHaveLength(3)
    expect(new Set(challenges.map((challenge) => challenge.id))).toEqual(
      new Set(['choose-tool', 'validate-arguments', 'tool-error'])
    )
  })
})
