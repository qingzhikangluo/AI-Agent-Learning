import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { initWorkspace } from '../../cli/agent-rpg/src/commands/init'
import { runWorkspace } from '../../cli/agent-rpg/src/commands/run'
import { describe, expect, it } from 'vitest'

describe('agent-rpg run', () => {
  it('runs the player workspace main.py', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-run-'))

    try {
      await initWorkspace({ workspaceDir })
      const result = await runWorkspace({ workspaceDir })

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('test')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})
