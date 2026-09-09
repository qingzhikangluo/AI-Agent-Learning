import {
  type Evidence,
  type Skill,
  type SkillAssessment,
  SkillLevel
} from '@ai-agent-rpg/domain'

import { calculateSkillLevel } from './skill-level-calculator'

export interface SkillDashboardData extends SkillAssessment {
  skill: Skill
}

export function buildSkillDashboard(
  skill: Skill,
  evidenceList: Evidence[]
): SkillDashboardData {
  const relevantEvidence = evidenceList.filter(
    (evidence) => evidence.skillId === skill.id
  )
  const level = calculateSkillLevel(relevantEvidence)
  const passedCount = relevantEvidence.filter(
    (evidence) => evidence.result === 'pass'
  ).length
  const confidence =
    relevantEvidence.length === 0
      ? 0
      : passedCount / relevantEvidence.length
  const strengths = [
    ...new Set(
      relevantEvidence
        .filter((evidence) => evidence.result === 'pass')
        .map((evidence) => `Passed ${evidence.taskId}`)
    )
  ]
  const weaknesses = [
    ...new Set(
      relevantEvidence.flatMap((evidence) =>
        evidence.failureCategories.map((category) => category)
      )
    )
  ]

  return {
    skillId: skill.id,
    skill,
    level,
    confidence,
    strengths,
    weaknesses
  }
}

export function emptySkillDashboard(skill: Skill): SkillDashboardData {
  return {
    skillId: skill.id,
    skill,
    level: SkillLevel.UNKNOWN,
    confidence: 0,
    strengths: [],
    weaknesses: []
  }
}
