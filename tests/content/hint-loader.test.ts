import { fileURLToPath } from 'node:url'

import { loadHints } from '@ai-agent-rpg/content'
import { describe, expect, it } from 'vitest'

const hintsFixtureDir = fileURLToPath(
  new URL('./fixtures/content/hints', import.meta.url)
)

describe('hint loader', () => {
  it('loads and validates Hint collections', async () => {
    const hints = await loadHints(hintsFixtureDir)

    expect(hints).toHaveLength(3)
    expect(hints[0]).toMatchObject({
      id: 'choose-tool-hint-1',
      level: 1
    })
  })
})
