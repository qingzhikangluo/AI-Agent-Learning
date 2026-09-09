import { fileURLToPath } from 'node:url'

import {
  challengeSchema,
  loadContentFiles
} from '@ai-agent-rpg/content'
import { describe, expect, it } from 'vitest'

const transferDir = fileURLToPath(
  new URL('../../packages/content/transfers/travel-expense', import.meta.url)
)

describe('travel expense transfer content', () => {
  it('loads a transfer scenario with travel tools', async () => {
    const [challenge] = await loadContentFiles(transferDir, challengeSchema)

    expect(challenge?.id).toBe('travel-expense-transfer')
    expect(challenge?.type).toBe('transfer')
    expect(challenge?.description).toContain('calculate_distance')
    expect(challenge?.description).toContain('calculate_reimbursement')
    expect(challenge?.description).toContain('search_policy')
  })

  it('defines transfer evaluation tests', async () => {
    const [challenge] = await loadContentFiles(transferDir, challengeSchema)

    expect(challenge?.tests).toHaveLength(5)
    expect(challenge?.tests.map((test) => test.name)).toEqual(
      expect.arrayContaining([
        'Correct Tool',
        'Wrong Tool',
        'Multiple Tool',
        'Tool Failure',
        'No Tool'
      ])
    )
  })
})
