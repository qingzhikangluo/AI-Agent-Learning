export enum SkillLevel {
  UNKNOWN = 0,
  AWARENESS = 1,
  GUIDED = 2,
  INDEPENDENT = 3,
  TRANSFER = 4,
  MASTERY = 5
}

export interface Skill {
  id: string
  name: string
  description: string
  maxLevel: number
}

export interface SkillAssessment {
  skillId: string
  level: SkillLevel
  confidence: number
  strengths: string[]
  weaknesses: string[]
}
