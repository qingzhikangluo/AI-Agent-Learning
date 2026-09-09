import {
  SkillLevel,
  type Skill,
  type SkillAssessment
} from '@ai-agent-rpg/domain'
import { describe, expect, it } from 'vitest'

describe('SkillLevel', () => {
  it('orders levels from UNKNOWN to MASTERY', () => {
    expect(SkillLevel.UNKNOWN).toBe(0)
    expect(SkillLevel.AWARENESS).toBe(1)
    expect(SkillLevel.GUIDED).toBe(2)
    expect(SkillLevel.INDEPENDENT).toBe(3)
    expect(SkillLevel.TRANSFER).toBe(4)
    expect(SkillLevel.MASTERY).toBe(5)
  })
})

describe('Skill', () => {
  it('carries id, name, description, and max level', () => {
    const skill = {
      id: 'tool.calling',
      name: 'Tool Calling',
      description: 'Select tools and pass valid arguments.',
      maxLevel: SkillLevel.MASTERY
    } satisfies Skill

    expect(skill).toEqual({
      id: 'tool.calling',
      name: 'Tool Calling',
      description: 'Select tools and pass valid arguments.',
      maxLevel: 5
    })
  })
})

describe('SkillAssessment', () => {
  it('carries skill id, level, confidence, strengths, and weaknesses', () => {
    const assessment = {
      skillId: 'tool.calling',
      level: SkillLevel.INDEPENDENT,
      confidence: 0.8,
      strengths: ['chooses the correct tool'],
      weaknesses: ['edge-case arguments']
    } satisfies SkillAssessment

    expect(assessment).toEqual({
      skillId: 'tool.calling',
      level: 3,
      confidence: 0.8,
      strengths: ['chooses the correct tool'],
      weaknesses: ['edge-case arguments']
    })
  })
})
