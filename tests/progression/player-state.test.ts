import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  ChallengeType,
  FailureCategory,
  SkillLevel,
  type Evidence
} from '@ai-agent-rpg/domain'
import {
  createEmptyPlayerState,
  FileEvidenceRecorder,
  FilePlayerStateStore,
  parsePlayerState,
  PlayerStateValidationError,
  playerStateFilePath
} from '@ai-agent-rpg/progression'
import { describe, expect, it } from 'vitest'

function evidence(id: string, taskId = 'api-request'): Evidence {
  return {
    id,
    playerId: 'player-001',
    skillId: 'api.json',
    taskId,
    taskType: ChallengeType.CODE,
    result: 'pass',
    attempts: 1,
    hintsUsed: 0,
    failureCategories: [],
    createdAt: '2026-09-10T00:00:00.000Z'
  }
}

describe('FilePlayerStateStore', () => {
  it('returns a default state before the state file exists', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-state-'))

    try {
      const store = new FilePlayerStateStore(workspaceDir)

      expect(await store.read()).toBeUndefined()
      expect(await store.getOrCreate()).toMatchObject({
        ...createEmptyPlayerState(),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('persists missions, challenges, skills, and milestones', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-state-'))

    try {
      const store = new FilePlayerStateStore(workspaceDir)
      const state = {
        ...createEmptyPlayerState(),
        currentMissionId: 'mission-02',
        missions: [
          { id: 'mission-01', status: 'passed' as const },
          { id: 'mission-02', status: 'active' as const }
        ],
        challenges: [
          {
            id: 'api-request',
            missionId: 'mission-02',
            status: 'active' as const,
            attempts: 1,
            hintsUsed: 0,
            failureCategories: [FailureCategory.TOOL_SCHEMA]
          }
        ],
        skills: [
          {
            skillId: 'api.http',
            level: SkillLevel.AWARENESS,
            confidence: 1,
            strengths: ['Passed api-request'],
            weaknesses: [],
            updatedAt: '2026-09-10T00:00:00.000Z'
          }
        ],
        boss: {
          id: 'first-agent-boss',
          status: 'in-progress' as const
        }
      }

      await store.write(state)

      const reloaded = await new FilePlayerStateStore(workspaceDir).read()
      expect(reloaded?.currentMissionId).toBe('mission-02')
      expect(reloaded?.missions).toHaveLength(2)
      expect(reloaded?.challenges[0]?.status).toBe('active')
      expect(reloaded?.skills[0]?.skillId).toBe('api.http')
      expect(reloaded?.boss.status).toBe('in-progress')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('serializes concurrent updates without losing evidence', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-state-'))

    try {
      const store = new FilePlayerStateStore(workspaceDir)

      await Promise.all([
        store.update((state) => ({
          ...state,
          evidence: [...state.evidence, evidence('evidence-001')]
        })),
        store.update((state) => ({
          ...state,
          evidence: [
            ...state.evidence,
            evidence('evidence-002', 'json-parser')
          ]
        }))
      ])

      const reloaded = await store.read()
      expect(reloaded?.evidence).toHaveLength(2)
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })

  it('rejects invalid state files', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-state-'))

    try {
      await mkdir(join(workspaceDir, '.agent-rpg'), { recursive: true })

      await writeFile(
        playerStateFilePath(workspaceDir),
        JSON.stringify({ schemaVersion: 2 }),
        'utf8'
      )

      await expect(
        new FilePlayerStateStore(workspaceDir).read()
      ).rejects.toBeInstanceOf(PlayerStateValidationError)
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})

describe('FileEvidenceRecorder', () => {
  it('persists evidence across recorder instances', async () => {
    const workspaceDir = await mkdtemp(join(tmpdir(), 'agent-rpg-state-'))

    try {
      const store = new FilePlayerStateStore(workspaceDir)
      const recorder = new FileEvidenceRecorder(store)
      await recorder.recordEvidence(evidence('evidence-persisted'))

      const reloadedRecorder = new FileEvidenceRecorder(
        new FilePlayerStateStore(workspaceDir)
      )
      const saved = await reloadedRecorder.getEvidenceByPlayer('player-001')

      expect(saved).toHaveLength(1)
      expect(saved[0]?.id).toBe('evidence-persisted')
    } finally {
      await rm(workspaceDir, { recursive: true, force: true })
    }
  })
})

describe('parsePlayerState', () => {
  it('throws a validation error for malformed state', () => {
    expect(() => parsePlayerState({})).toThrow(
      PlayerStateValidationError
    )
  })
})
