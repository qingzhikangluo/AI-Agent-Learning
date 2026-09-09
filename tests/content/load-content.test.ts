import { fileURLToPath } from 'node:url'

import {
  ContentValidationError,
  challengeSchema,
  loadContentFiles,
  loadValidatedFile,
  missionSchema
} from '@ai-agent-rpg/content'
import { describe, expect, it } from 'vitest'

const fixtureRoot = fileURLToPath(
  new URL('./fixtures/content', import.meta.url)
)

describe('content loader', () => {
  it('loads and validates JSON mission files', async () => {
    const missions = await loadContentFiles(
      `${fixtureRoot}/missions`,
      missionSchema
    )

    expect(missions).toHaveLength(1)
    expect(missions[0]?.id).toBe('mission-alpha')
  })

  it('loads and validates YAML challenge files', async () => {
    const challenges = await loadContentFiles(
      `${fixtureRoot}/challenges`,
      challengeSchema
    )

    expect(challenges).toHaveLength(1)
    expect(challenges[0]?.id).toBe('code-challenge')
    expect(challenges[0]?.tests[0]?.expectedBehavior.type).toBe('contains')
  })

  it('rejects content that violates the schema', async () => {
    const invalidPath = fileURLToPath(
      new URL('./fixtures/invalid/mission.json', import.meta.url)
    )

    await expect(
      loadValidatedFile(invalidPath, missionSchema)
    ).rejects.toThrow(ContentValidationError)
  })
})
