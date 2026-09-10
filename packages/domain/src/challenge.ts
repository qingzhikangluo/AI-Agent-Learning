import type { TestCase } from './evaluation'

export interface ExplanationRubricItem {
  id: string
  question: string
  expectedAnswers: string[]
}

export enum ChallengeType {
  CONCEPT = 'concept',
  CODE = 'code',
  DEBUG = 'debug',
  BOSS = 'boss',
  TRANSFER = 'transfer'
}

export interface Challenge {
  id: string
  missionId: string
  type: ChallengeType
  title: string
  description: string
  objectives: string[]
  tests: TestCase[]
  explanationRubric?: ExplanationRubricItem[]
}
