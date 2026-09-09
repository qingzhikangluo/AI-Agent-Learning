import { fileURLToPath } from 'node:url'

import {
  challengeSchema,
  loadContentFiles
} from '@ai-agent-rpg/content'
import { describe, expect, it } from 'vitest'

const remediationDir = fileURLToPath(
  new URL('../../packages/content/remediation/tool-schema-repair', import.meta.url)
)

describe('remediation content', () => {
  it('loads the tool schema repair quest', async () => {
    const [quest] = await loadContentFiles(remediationDir, challengeSchema)

    expect(quest?.id).toBe('tool-schema-repair')
    expect(quest?.tests.length).toBeGreaterThanOrEqual(1)
  })
})
