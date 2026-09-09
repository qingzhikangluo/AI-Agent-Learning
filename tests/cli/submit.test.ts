import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { initWorkspace } from '../../cli/agent-rpg/src/commands/init'
import { submitWorkspace } from '../../cli/agent-rpg/src/commands/submit'
import { describe, expect, it } from 'vitest'

describe('agent-rpg submit', () => {
  it('writes a boss submission with source, readme, test result, and explanation', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-submit-'))

    try {
      await initWorkspace({ workspaceDir })
      const result = await submitWorkspace({
        workspaceDir,
        testResult: '4/4 public tests passed',
        explanation: 'I selected get_weather and handled errors.',
        submittedAt: '2026-09-09T00:00:00.000Z'
      })

      const saved = JSON.parse(
        await readFile(result.submissionPath, 'utf8')
      ) as {
        source: string
        readme: string
        testResult: string
        explanation: string
      }

      expect(saved.source).toContain('def handle')
      expect(saved.readme).toContain('agent-rpg test')
      expect(saved.testResult).toBe('4/4 public tests passed')
      expect(saved.explanation).toContain('get_weather')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})
