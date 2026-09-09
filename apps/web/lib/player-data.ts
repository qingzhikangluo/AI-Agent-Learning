export type MissionStatus = 'passed' | 'active' | 'locked'
export type ChallengeStatus = 'passed' | 'active' | 'locked'

export interface ChallengeSummary {
  id: string
  title: string
  type: 'concept' | 'code'
  status: ChallengeStatus
}

export interface MissionSummary {
  id: string
  title: string
  description: string
  skillTargets: string[]
  status: MissionStatus
  challenges: ChallengeSummary[]
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
  evidence: EvidenceSummary[]
  skills: SkillSummary[]
}

export const playerState: PlayerState = {
  currentMissionId: 'mission-02',
  missions: [
    {
      id: 'mission-01',
      title: 'AI Agent Mental Model',
      description: '建立 Agent 最小心智模型。',
      skillTargets: ['agent.mental-model'],
      status: 'passed',
      challenges: [
        { id: 'workflow-vs-agent', title: 'Workflow vs Agent', type: 'concept', status: 'passed' },
        { id: 'agent-components', title: 'Agent Components', type: 'concept', status: 'passed' },
        { id: 'agent-when-to-use', title: 'When to Use an Agent', type: 'concept', status: 'passed' }
      ]
    },
    {
      id: 'mission-02',
      title: 'API & JSON',
      description: '发起 API 请求、解析 JSON、处理错误。',
      skillTargets: ['api.http', 'api.json'],
      status: 'active',
      challenges: [
        { id: 'api-request', title: 'Make an API Request', type: 'code', status: 'active' },
        { id: 'json-parser', title: 'Parse JSON', type: 'code', status: 'locked' },
        { id: 'api-error', title: 'Handle an API Error', type: 'code', status: 'locked' }
      ]
    },
    {
      id: 'mission-03',
      title: 'Tool Calling',
      description: '选择工具、生成合法参数、处理工具错误。',
      skillTargets: ['tool.selection', 'tool.arguments'],
      status: 'locked',
      challenges: [
        { id: 'choose-tool', title: 'Choose the Right Tool', type: 'code', status: 'locked' },
        { id: 'validate-arguments', title: 'Validate Tool Arguments', type: 'code', status: 'locked' },
        { id: 'tool-error', title: 'Recover from Tool Errors', type: 'code', status: 'locked' }
      ]
    },
    {
      id: 'mission-04',
      title: 'Agent Loop',
      description: '理解模型与工具的最小决策循环。',
      skillTargets: ['agent.loop', 'agent.error-recovery'],
      status: 'locked',
      challenges: [
        { id: 'basic-agent-loop', title: 'Build a Basic Agent Loop', type: 'code', status: 'locked' },
        { id: 'tool-failure-recovery', title: 'Recover from Tool Failure', type: 'code', status: 'locked' }
      ]
    }
  ],
  evidence: [
    {
      id: 'ev-1',
      skill: 'agent.mental-model',
      task: 'Workflow vs Agent',
      result: 'pass',
      attempts: 1,
      hints: 0
    },
    {
      id: 'ev-2',
      skill: 'agent.mental-model',
      task: 'Agent Components',
      result: 'pass',
      attempts: 1,
      hints: 0
    }
  ],
  skills: [
    {
      id: 'agent.mental-model',
      level: 2,
      confidence: 0.9,
      strengths: ['区分 Workflow 与 Agent'],
      weaknesses: []
    },
    {
      id: 'tool.calling',
      level: 0,
      confidence: 0,
      strengths: [],
      weaknesses: ['尚无证据']
    }
  ]
}

export function routeCompletion(state: PlayerState) {
  const totalMilestones = state.missions.length + 2
  const completed = state.missions.filter((mission) => mission.status === 'passed').length
  return {
    completed,
    total: totalMilestones,
    percent: Math.round((completed / totalMilestones) * 100)
  }
}
