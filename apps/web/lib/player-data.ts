export type MissionStatus = 'passed' | 'active' | 'locked'
export type ChallengeStatus = 'passed' | 'active' | 'locked'
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

export const playerState: PlayerState = {
  currentMissionId: 'mission-02',
  missions: [
    {
      id: 'mission-01',
      title: 'AI Agent Mental Model',
      description: '建立对 AI Agent 的最小心智模型：Agent 是什么、由什么组成，以及何时该用它。',
      objectives: [
        '能区分固定 Workflow 与 Agent 决策的本质区别。',
        '能说出最小 Agent 的模型、工具、上下文与循环四个组成部分。',
        '能根据任务路径是否确定，选择 Agent 或固定流程。'
      ],
      skillTargets: ['agent.mental-model'],
      status: 'passed',
      challenges: [
        { id: 'workflow-vs-agent', title: 'Workflow vs Agent', type: 'concept', status: 'passed' },
        { id: 'agent-components', title: 'Agent Components', type: 'concept', status: 'passed' },
        { id: 'agent-when-to-use', title: 'When to Use an Agent', type: 'concept', status: 'passed' }
      ],
      learningBlocks: [
        {
          id: 'mental-model-what-is-an-agent',
          title: 'Agent 与固定流程的区别',
          type: 'concept',
          body: '固定 Workflow 按预设步骤运行；Agent 则由模型根据当前输入自行决定下一步动作，并通过循环观察结果、继续行动，直到完成任务。'
        },
        {
          id: 'mental-model-agent-components',
          title: 'Agent 的最小组成部分',
          type: 'concept',
          body: '一个最小 Agent 包含：模型（决定下一步）、可用工具（执行动作）、上下文（系统提示与历史）、循环（模型-工具-结果-再决策）。'
        },
        {
          id: 'mental-model-when-to-use',
          title: '何时选择 Agent',
          type: 'concept',
          body: '当任务路径不确定、需要根据中间结果选择不同动作、且允许模型推理时，Agent 才有价值；固定且可穷举的流程应优先使用 Workflow。'
        }
      ]
    },
    {
      id: 'mission-02',
      title: 'API & JSON',
      description: '学会发起 API 请求、解析 JSON 响应，并处理常见 API 错误。',
      objectives: [
        '能使用正确方法发起 API 请求，并读取响应状态与内容。',
        '能解析 JSON，并在字段缺失时给出清晰、可操作的错误。',
        '能识别非 2xx 响应、超时与格式错误，并返回可读信息。'
      ],
      skillTargets: ['api.http', 'api.json'],
      status: 'active',
      challenges: [
        { id: 'api-request', title: 'Make an API Request', type: 'code', status: 'active' },
        { id: 'json-parser', title: 'Parse JSON', type: 'code', status: 'locked' },
        { id: 'api-error', title: 'Handle an API Error', type: 'code', status: 'locked' }
      ],
      learningBlocks: [
        {
          id: 'api-request-basics',
          title: 'API 请求的基本结构',
          type: 'concept',
          body: '一次 HTTP 请求由方法（GET/POST）、URL、请求头与可选请求体组成。先确认端点与认证要求，再发起请求。'
        },
        {
          id: 'json-parsing-basics',
          title: '解析 JSON 响应',
          type: 'example',
          body: 'API 通常返回 JSON。解析时要先检查响应是否成功，再读取字段；不要盲目假定某个字段一定存在。'
        },
        {
          id: 'api-error-handling',
          title: '处理 API 错误',
          type: 'concept',
          body: '网络错误、非 2xx 状态码、超时与错误格式都可能出现。错误处理必须给出可读信息，并允许调用方重试或降级。'
        }
      ]
    },
    {
      id: 'mission-03',
      title: 'Tool Calling',
      description: '学会让 Agent 选择正确工具、生成合法参数，并在工具失败时恢复。',
      objectives: [
        '能根据用户意图选择最合适的工具，不匹配时不强行调用。',
        '能生成符合 Schema 的参数，并在缺失或类型错误时拒绝调用。',
        '能读取工具错误并决定重试、换工具或如实向用户说明。'
      ],
      skillTargets: ['tool.schema', 'tool.selection', 'tool.arguments'],
      status: 'locked',
      challenges: [
        { id: 'choose-tool', title: 'Choose the Right Tool', type: 'code', status: 'locked' },
        { id: 'validate-arguments', title: 'Validate Tool Arguments', type: 'code', status: 'locked' },
        { id: 'tool-error', title: 'Recover from Tool Errors', type: 'code', status: 'locked' }
      ],
      learningBlocks: [
        {
          id: 'tool-selection-basics',
          title: 'Tool Selection',
          type: 'concept',
          body: '给模型的每个工具都要有清晰名称与用途描述。模型根据用户意图在工具清单中选择最合适的一项，不匹配时不应强行调用。'
        },
        {
          id: 'tool-arguments-basics',
          title: 'Arguments',
          type: 'concept',
          body: '每个工具必须定义参数 Schema。模型生成参数后应先校验类型、必填项与取值范围，再真正执行工具。'
        },
        {
          id: 'tool-error-basics',
          title: 'Tool Error',
          type: 'concept',
          body: '工具执行可能失败：参数错误、服务不可用或数据不存在。Agent 必须读取错误、向模型反馈，并选择修复参数、换工具或如实告知用户。'
        }
      ]
    },
    {
      id: 'mission-04',
      title: 'Agent Loop',
      description: '理解 Agent 的决策循环，并能在工具失败后恢复。',
      objectives: [
        '能实现“模型决策 → 工具调用 → 结果回填”的最小循环，并设置终止条件。',
        '能在工具失败后把错误交回模型修正，并避免无限重试。'
      ],
      skillTargets: ['agent.loop', 'agent.error-recovery'],
      status: 'locked',
      challenges: [
        { id: 'basic-agent-loop', title: 'Build a Basic Agent Loop', type: 'code', status: 'locked' },
        { id: 'tool-failure-recovery', title: 'Recover from Tool Failure', type: 'code', status: 'locked' }
      ],
      learningBlocks: [
        {
          id: 'agent-loop-basics',
          title: 'Basic Agent Loop',
          type: 'concept',
          body: 'Agent Loop 是：接收用户请求 → 模型判断下一步 → 必要时调用工具 → 把结果交回模型 → 直到能回答用户。循环必须有终止条件，防止无限执行。'
        },
        {
          id: 'agent-error-recovery-basics',
          title: 'Error Recovery',
          type: 'concept',
          body: '当工具失败或模型输出非法时，Agent 应把错误作为新上下文再次交给模型，让它修正参数、换工具或请求补充信息；不要静默吞掉错误。'
        }
      ]
    }
  ],
  boss: {
    id: 'first-agent-boss',
    title: 'Internal Employee Assistant',
    description:
      '为公司内部员工助手实现一个最小 Tool-Calling Agent。可用工具：get_weather（天气）、calculate_expense（差旅报销）、search_faq（内部 FAQ）。需要自己决定 Agent Loop、工具选择、参数生成与错误处理。',
    status: 'locked',
    tools: ['get_weather', 'calculate_expense', 'search_faq'],
    constraints: [
      '不需要工具时直接回答。',
      '工具参数必须符合 Schema。',
      '工具失败后要读取错误并恢复。',
      'Hidden Test 不会显示在页面上。'
    ],
    publicTests: [
      { id: 'boss-public-weather', name: 'Normal Weather' },
      { id: 'boss-public-expense', name: 'Calculate Expense' },
      { id: 'boss-public-faq', name: 'FAQ Search' },
      { id: 'boss-public-no-tool', name: 'No Tool' }
    ]
  },
  transfer: {
    id: 'travel-expense-transfer',
    title: 'Travel Expense Assistant',
    description:
      '这是一个新场景：差旅费用助手。可用工具：calculate_distance（计算距离）、calculate_reimbursement（计算报销）、search_policy（差旅政策）。请独立解决，不要复用 Boss 的实现答案。',
    status: 'locked',
    objectives: [
      '能在新业务场景中选择正确工具。',
      '能把 Tool Calling 能力迁移到差旅报销任务。'
    ],
    tools: [
      'calculate_distance',
      'calculate_reimbursement',
      'search_policy'
    ]
  },
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
