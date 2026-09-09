import {
  ChallengeType,
  SkillLevel,
  type Evidence
} from '@ai-agent-rpg/domain'
import {
  hasTransferPassForSkill,
  skillLevelAfterTransfer
} from '@ai-agent-rpg/progression'
import { describe, expect, it } from 'vitest'

function evidence(result: 'pass' | 'fail', taskType: ChallengeType): Evidence {
  return {
    id: 'evidence-transfer',
    playerId: 'player-001',
    skillId: 'tool.calling',
    taskId: 'travel-expense-transfer',
    taskType,
    result,
    attempts: 1,
    hintsUsed: 0,
    failureCategories: [],
    createdAt: '2026-09-09T00:00:00.000Z'
  }
}

describe('transfer evidence', () => {
  it('promotes tool calling to TRANSFER after a transfer pass', () => {
    const list = [evidence('pass', ChallengeType.TRANSFER)]

    expect(hasTransferPassForSkill('tool.calling', list)).toBe(true)
    expect(skillLevelAfterTransfer(list)).toBe(SkillLevel.TRANSFER)
  })

  it('does not promote when transfer failed', () => {
    const list = [evidence('fail', ChallengeType.TRANSFER)]

    expect(hasTransferPassForSkill('tool.calling', list)).toBe(false)
    expect(skillLevelAfterTransfer(list)).toBe(SkillLevel.UNKNOWN)
  })
})
