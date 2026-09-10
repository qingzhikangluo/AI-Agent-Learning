import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { FilePlayerStateStore } from '@ai-agent-rpg/progression'
import {
  ChallengeType,
  SkillLevel,
  type Evidence
} from '@ai-agent-rpg/domain'
import { afterEach, describe, expect, it } from 'vitest'

import { createSeededPlayerState } from '../../cli/agent-rpg/src/commands/state'
import {
  loadAssessmentView,
  loadPlayerStateView
} from '../../apps/web/lib/server-data'

const previousWorkspace = process.env.AGENT_RPG_WORKSPACE

afterEach(() => {
  if (previousWorkspace === undefined) {
    delete process.env.AGENT_RPG_WORKSPACE
  } else {
    process.env.AGENT_RPG_WORKSPACE = previousWorkspace
  }
})

describe('web server data', () => {
  it('loads missions and challenges from content when no state exists', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-web-'))
    process.env.AGENT_RPG_WORKSPACE = workspaceDir

    try {
      const view = await loadPlayerStateView()

      expect(view.missions).toHaveLength(4)
      expect(view.missions[0]?.title).toBe('AI Agent Mental Model')
      expect(view.missions[0]?.status).toBe('active')
      expect(view.missions[1]?.status).toBe('locked')
      expect(
        view.missions[0]?.challenges.map((challenge) => challenge.id)
      ).toEqual([
        'workflow-vs-agent',
        'agent-components',
        'agent-when-to-use'
      ])
      expect(view.missions[0]?.challenges[0]?.status).toBe('active')
      expect(view.boss.title).toBe('Internal Employee Assistant')
      expect(view.transfer.title).toBe('Travel Expense Assistant')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('reflects persisted player state', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-web-'))
    process.env.AGENT_RPG_WORKSPACE = workspaceDir

    try {
      const seeded = await createSeededPlayerState(
        'player-001',
        '2026-09-10T00:00:00.000Z'
      )
      const progressed = {
        ...seeded,
        currentMissionId: 'mission-02',
        missions: seeded.missions.map((mission) =>
          mission.id === 'mission-01'
            ? { ...mission, status: 'passed' as const }
            : mission.id === 'mission-02'
              ? { ...mission, status: 'active' as const }
              : mission
        ),
        challenges: seeded.challenges.map((challenge) =>
          challenge.id === 'api-request'
            ? { ...challenge, status: 'active' as const }
            : challenge
        )
      }
      await new FilePlayerStateStore(workspaceDir).write(progressed)

      const view = await loadPlayerStateView()

      expect(view.currentMissionId).toBe('mission-02')
      expect(view.missions[0]?.status).toBe('passed')
      expect(view.missions[1]?.status).toBe('active')
      expect(
        view.missions[1]?.challenges.find(
          (challenge) => challenge.id === 'api-request'
        )?.status
      ).toBe('active')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('builds assessment dashboards from evidence', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-web-'))
    process.env.AGENT_RPG_WORKSPACE = workspaceDir

    try {
      const seeded = await createSeededPlayerState(
        'player-001',
        '2026-09-10T00:00:00.000Z'
      )
      const evidence: Evidence = {
        id: 'evidence-001',
        playerId: 'player-001',
        skillId: 'agent.mental-model',
        taskId: 'workflow-vs-agent',
        taskType: ChallengeType.CONCEPT,
        result: 'pass',
        attempts: 1,
        hintsUsed: 0,
        failureCategories: [],
        createdAt: '2026-09-10T00:00:00.000Z'
      }
      await new FilePlayerStateStore(workspaceDir).write({
        ...seeded,
        evidence: [evidence]
      })

      const skills = await loadAssessmentView()
      const mentalModel = skills.find(
        (skill) => skill.id === 'agent.mental-model'
      )

      expect(mentalModel?.level).toBe(SkillLevel.AWARENESS)
      expect(mentalModel?.confidence).toBe(1)
      expect(mentalModel?.strengths).toEqual([
        'Passed workflow-vs-agent'
      ])
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})
