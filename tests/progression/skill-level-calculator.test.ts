import {
  ChallengeType,
  SkillLevel,
  type Evidence
} from '@ai-agent-rpg/domain'
import { calculateSkillLevel } from '@ai-agent-rpg/progression'
import { describe, expect, it } from 'vitest'

function evidence(
  taskId: string,
  taskType: ChallengeType,
  options: { attempts?: number; hintsUsed?: number; result?: 'pass' | 'fail' } = {}
): Evidence {
  return {
    id: `evidence-${taskId}`,
    playerId: 'player-001',
    skillId: 'agent.loop',
    taskId,
    taskType,
    result: options.result ?? 'pass',
    attempts: options.attempts ?? 1,
    hintsUsed: options.hintsUsed ?? 0,
    failureCategories: [],
    createdAt: '2026-09-09T00:00:00.000Z'
  }
}

describe('skill level calculator', () => {
  it('returns UNKNOWN without evidence', () => {
    expect(calculateSkillLevel([])).toBe(SkillLevel.UNKNOWN)
  })

  it('returns AWARENESS for a concept pass', () => {
    const level = calculateSkillLevel([
      evidence('workflow-vs-agent', ChallengeType.CONCEPT)
    ])

    expect(level).toBe(SkillLevel.AWARENESS)
  })

  it('returns GUIDED when hints or retries were used', () => {
    const level = calculateSkillLevel([
      evidence('choose-tool', ChallengeType.CODE, { hintsUsed: 1 })
    ])

    expect(level).toBe(SkillLevel.GUIDED)
  })

  it('returns INDEPENDENT after two independent passes', () => {
    const level = calculateSkillLevel([
      evidence('choose-tool', ChallengeType.CODE),
      evidence('validate-arguments', ChallengeType.CODE)
    ])

    expect(level).toBe(SkillLevel.INDEPENDENT)
  })

  it('returns TRANSFER after a transfer pass', () => {
    const level = calculateSkillLevel([
      evidence('travel-expense-transfer', ChallengeType.TRANSFER)
    ])

    expect(level).toBe(SkillLevel.TRANSFER)
  })
})
