import { fileURLToPath } from 'node:url'

import {
  challengeSchema,
  loadContentFiles,
  loadMissions
} from '@ai-agent-rpg/content'
import { describe, expect, it } from 'vitest'

const missionDir = fileURLToPath(
  new URL('../../packages/content/missions/mission-01', import.meta.url)
)

describe('mission-01 content', () => {
  it('loads a mission with at least three learning blocks', async () => {
    const missions = await loadMissions()

    const mission = missions.find((item) => item.id === 'mission-01')
    expect(mission).toBeDefined()
    expect(mission?.title).toBe('AI Agent Mental Model')
    expect(mission?.learningBlocks?.length).toBeGreaterThanOrEqual(3)
  })

  it('loads at least three challenges', async () => {
    const challenges = await loadContentFiles(
      `${missionDir}/challenges`,
      challengeSchema
    )

    expect(challenges).toHaveLength(3)
    expect(new Set(challenges.map((challenge) => challenge.id))).toEqual(
      new Set(['workflow-vs-agent', 'agent-components', 'agent-when-to-use'])
    )
    const workflow = challenges.find(
      (challenge) => challenge.id === 'workflow-vs-agent'
    )
    expect(workflow?.tests[0]?.expectedBehavior.value).toEqual({
      zh: '根据用户问题自行决定调用哪个工具',
      en: "decides which tool to call based on the user's question"
    })
  })
})
