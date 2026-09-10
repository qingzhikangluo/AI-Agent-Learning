export type MissionStatus = 'passed' | 'active' | 'locked'
export type ChallengeStatus =
  | 'passed'
  | 'active'
  | 'failed'
  | 'locked'
export type LearningBlockType = 'concept' | 'example' | 'instruction'

export interface ChallengeSummary {
  id: string
  title: string
  type: 'concept' | 'code'
  status: ChallengeStatus
}

export interface LearningBlockSummary {
  id: string
  title: string
  type: LearningBlockType
  body: string
}

export interface MissionSummary {
  id: string
  title: string
  description: string
  objectives: string[]
  skillTargets: string[]
  status: MissionStatus
  challenges: ChallengeSummary[]
  learningBlocks: LearningBlockSummary[]
}

export interface PublicTestSummary {
  id: string
  name: string
}

export interface BossSummary {
  id: string
  title: string
  description: string
  status: MissionStatus
  tools: string[]
  constraints: string[]
  publicTests: PublicTestSummary[]
}

export interface TransferSummary {
  id: string
  title: string
  description: string
  status: MissionStatus
  objectives: string[]
  tools: string[]
}

export interface EvidenceSummary {
  id: string
  skill: string
  task: string
  result: 'pass' | 'fail'
  attempts: number
  hints: number
}

export interface SkillSummary {
  id: string
  level: number
  confidence: number
  strengths: string[]
  weaknesses: string[]
}

export interface PlayerState {
  currentMissionId: string
  missions: MissionSummary[]
  boss: BossSummary
  transfer: TransferSummary
  evidence: EvidenceSummary[]
  skills: SkillSummary[]
}

export interface ChallengeDetail {
  id: string
  missionId: string
  missionTitle: string
  type: 'concept' | 'code'
  title: string
  description: string
  objectives: string[]
  publicTests: PublicTestSummary[]
  workspace: string
  status: ChallengeStatus
  locked: boolean
}

export function routeCompletion(state: PlayerState) {
  const totalMilestones = state.missions.length + 2
  const completed = state.missions.filter(
    (mission) => mission.status === 'passed'
  ).length
  return {
    completed,
    total: totalMilestones,
    percent:
      totalMilestones === 0
        ? 0
        : Math.round((completed / totalMilestones) * 100)
  }
}

export function missionProgress(mission: MissionSummary) {
  const total = mission.challenges.length
  const completed = mission.challenges.filter(
    (challenge) => challenge.status === 'passed'
  ).length

  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100)
  }
}
