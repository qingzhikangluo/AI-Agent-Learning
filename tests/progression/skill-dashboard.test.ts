import {
  ChallengeType,
  FailureCategory,
  SkillLevel,
  type Evidence,
  type Skill
} from '@ai-agent-rpg/domain'
import {
  buildSkillDashboard,
  emptySkillDashboard
} from '@ai-agent-rpg/progression'
import { describe, expect, it } from 'vitest'

const toolCalling: Skill = {
  id: 'tool.calling',
  name: 'Tool Calling',
  description: 'Choose tools and pass valid arguments.',
  maxLevel: 5
}

function evidenceForToolCalling(
  taskId: string,
  options: {
    result?: 'pass' | 'fail'
    taskType?: ChallengeType
    failureCategories?: FailureCategory[]
  } = {}
): Evidence {
  return {
    id: `evidence-${taskId}`,
    playerId: 'player-001',
    skillId: 'tool.calling',
    taskId,
    taskType: options.taskType ?? ChallengeType.CODE,
    result: options.result ?? 'pass',
    attempts: 1,
    hintsUsed: 0,
    failureCategories: options.failureCategories ?? [],
    createdAt: '2026-09-09T00:00:00.000Z'
  }
}

describe('skill dashboard data', () => {
  it('returns unknown level and no evidence for an empty skill', () => {
    const dashboard = emptySkillDashboard(toolCalling)

    expect(dashboard.level).toBe(SkillLevel.UNKNOWN)
    expect(dashboard.confidence).toBe(0)
    expect(dashboard.weaknesses).toEqual([])
  })

  it('aggregates evidence into level, confidence, strengths, and weaknesses', () => {
    const dashboard = buildSkillDashboard(toolCalling, [
      evidenceForToolCalling('choose-tool', {
        result: 'fail',
        failureCategories: [FailureCategory.TOOL_SCHEMA]
      }),
      evidenceForToolCalling('choose-tool', { result: 'pass' }),
      evidenceForToolCalling('validate-arguments', { result: 'pass' })
    ])

    expect(dashboard.level).toBe(SkillLevel.INDEPENDENT)
    expect(dashboard.confidence).toBe(2 / 3)
    expect(dashboard.strengths).toEqual([
      'Passed choose-tool',
      'Passed validate-arguments'
    ])
    expect(dashboard.weaknesses).toEqual(['tool_schema'])
  })

  it('ignores evidence for other skills', () => {
    const dashboard = buildSkillDashboard(toolCalling, [
      {
        ...evidenceForToolCalling('choose-tool'),
        skillId: 'api.json',
        taskId: 'json-parser'
      }
    ])

    expect(dashboard.level).toBe(SkillLevel.UNKNOWN)
  })
})
