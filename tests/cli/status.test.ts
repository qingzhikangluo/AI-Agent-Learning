import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  defaultStatus,
  formatStatus,
  readStatus
} from '../../cli/agent-rpg/src/commands/status'
import type { PlayerStatus } from '../../cli/agent-rpg/src/commands/status'
import { describe, expect, it } from 'vitest'

describe('agent-rpg status', () => {
  it('returns default status without a state file', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-status-'))

    try {
      const status = await readStatus(workspaceDir)
      expect(status).toEqual(defaultStatus())
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('formats current mission, skills, boss, and transfer', async () => {
    const status = {
      currentMission: 'mission-03',
      skills: ['tool.selection'],
      boss: 'in-progress',
      transfer: 'locked'
    } satisfies PlayerStatus

    const output = formatStatus(status)
    expect(output).toContain('Current Mission: mission-03')
    expect(output).toContain('Skills: tool.selection')
    expect(output).toContain('Boss: in-progress')
    expect(output).toContain('Transfer: locked')
  })

  it('reads a local state file when present', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-status-'))

    try {
      await writeFile(
        join(workspaceDir, '.agent-rpg-status.json'),
        JSON.stringify({ currentMission: 'mission-04', skills: [], boss: 'locked', transfer: 'locked' }),
        'utf8'
      )

      const status = await readStatus(workspaceDir)
      expect(status.currentMission).toBe('mission-04')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})
