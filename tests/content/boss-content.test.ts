import { fileURLToPath } from 'node:url'

import {
  challengeSchema,
  loadContentFiles,
  loadMissions
} from '@ai-agent-rpg/content'
import { describe, expect, it } from 'vitest'

const bossDir = fileURLToPath(
  new URL('../../packages/content/bosses/first-agent', import.meta.url)
)

describe('first agent boss content', () => {
  it('loads boss challenge with public and hidden tests', async () => {
    const [boss] = await loadContentFiles(bossDir, challengeSchema)

    expect(boss?.id).toBe('first-agent-boss')
    expect(boss?.type).toBe('boss')
    expect(boss?.tests.filter((test) => test.visibility === 'public')).toHaveLength(4)
    expect(boss?.tests.filter((test) => test.visibility === 'hidden')).toHaveLength(6)
    expect(boss?.tests).toHaveLength(10)
    expect(boss?.tests.map((test) => test.name)).toEqual(
      expect.arrayContaining([
        'Normal Weather',
        'Calculate Expense',
        'FAQ Search',
        'No Tool',
        'Wrong Tool',
        'Wrong Arguments',
        'Tool Failure',
        'Multiple Tool',
        'Malformed Input',
        'Unknown Request'
      ])
    )
  })

  it('links the boss from mission 04', async () => {
    const missions = await loadMissions()
    const mission04 = missions.find((mission) => mission.id === 'mission-04')

    expect(mission04?.bossId).toBe('first-agent-boss')
  })
})
