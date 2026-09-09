export interface ChallengePublicTest {
  id: string
  name: string
}

export interface ChallengeDetail {
  id: string
  missionId: string
  type: 'concept' | 'code'
  title: string
  description: string
  objectives: string[]
  publicTests: ChallengePublicTest[]
  workspace: string
}

const conceptWorkspace = '# 用中文写出你的判断与理由\n'

const codeWorkspace = `def handle(user_message):
    # 在这里实现你的 Agent 逻辑
    return user_message
`

export const challengeDetails: Record<string, ChallengeDetail> = {
  'workflow-vs-agent': {
    id: 'workflow-vs-agent',
    missionId: 'mission-01',
    type: 'concept',
    title: 'Workflow vs Agent',
    description: '判断一个场景应该使用固定 Workflow 还是 Agent。',
    objectives: ['能区分固定流程与 Agent 决策的区别。'],
    publicTests: [
      {
        id: 'workflow-vs-agent-001',
        name: '识别 Agent 的典型特征'
      }
    ],
    workspace: conceptWorkspace
  },
  'agent-components': {
    id: 'agent-components',
    missionId: 'mission-01',
    type: 'concept',
    title: 'Agent Components',
    description: '列出最小 Agent 的必要组成部分。',
    objectives: ['能说出模型、工具、上下文与循环四个组成部分。'],
    publicTests: [
      {
        id: 'agent-components-001',
        name: '包含核心组件'
      }
    ],
    workspace: conceptWorkspace
  },
  'agent-when-to-use': {
    id: 'agent-when-to-use',
    missionId: 'mission-01',
    type: 'concept',
    title: 'When to Use an Agent',
    description: '判断何时应该使用 Agent，何时应该使用固定流程。',
    objectives: [
      '能为不确定路径的任务选择 Agent。',
      '能为固定路径的任务选择 Workflow。'
    ],
    publicTests: [
      { id: 'agent-when-to-use-001', name: '固定任务选 Workflow' },
      { id: 'agent-when-to-use-002', name: '不确定任务选 Agent' }
    ],
    workspace: conceptWorkspace
  },
  'api-request': {
    id: 'api-request',
    missionId: 'mission-02',
    type: 'code',
    title: 'Make an API Request',
    description: '编写最小代码向公开 API 发起请求并读取响应。',
    objectives: [
      '能使用正确方法发起 API 请求。',
      '能读取响应状态与内容。'
    ],
    publicTests: [
      {
        id: 'api-request-001',
        name: '请求后读取响应'
      }
    ],
    workspace: codeWorkspace
  },
  'json-parser': {
    id: 'json-parser',
    missionId: 'mission-02',
    type: 'code',
    title: 'Parse JSON',
    description: '从 API 响应中提取嵌套 JSON 字段。',
    objectives: [
      '能解析 JSON 字符串。',
      '能在字段缺失时给出清晰错误。'
    ],
    publicTests: [
      {
        id: 'json-parser-001',
        name: '提取字段'
      }
    ],
    workspace: codeWorkspace
  },
  'api-error': {
    id: 'api-error',
    missionId: 'mission-02',
    type: 'code',
    title: 'Handle an API Error',
    description: '处理非 2xx 响应、超时与格式错误。',
    objectives: [
      '能识别常见 API 失败原因。',
      '能返回可操作的错误消息。'
    ],
    publicTests: [
      {
        id: 'api-error-001',
        name: '识别超时'
      }
    ],
    workspace: codeWorkspace
  },
  'choose-tool': {
    id: 'choose-tool',
    missionId: 'mission-03',
    type: 'code',
    title: 'Choose the Right Tool',
    description: '根据用户请求选择正确的工具。',
    objectives: [
      '能根据意图匹配工具用途。',
      '无匹配工具时不强行调用。'
    ],
    publicTests: [
      {
        id: 'choose-tool-001',
        name: '天气问题选天气工具'
      }
    ],
    workspace: codeWorkspace
  },
  'validate-arguments': {
    id: 'validate-arguments',
    missionId: 'mission-03',
    type: 'code',
    title: 'Validate Tool Arguments',
    description: '生成并校验工具调用参数。',
    objectives: [
      '能生成符合 Schema 的参数。',
      '能在参数缺失或类型错误时拒绝调用。'
    ],
    publicTests: [
      {
        id: 'validate-arguments-001',
        name: '缺少必填参数'
      }
    ],
    workspace: codeWorkspace
  },
  'tool-error': {
    id: 'tool-error',
    missionId: 'mission-03',
    type: 'code',
    title: 'Recover from Tool Errors',
    description: '处理工具返回的错误并让 Agent 继续正确行动。',
    objectives: [
      '能识别工具错误原因。',
      '能决定重试、换工具或向用户说明。'
    ],
    publicTests: [
      {
        id: 'tool-error-001',
        name: '工具返回错误后反馈给模型'
      }
    ],
    workspace: codeWorkspace
  },
  'basic-agent-loop': {
    id: 'basic-agent-loop',
    missionId: 'mission-04',
    type: 'code',
    title: 'Build a Basic Agent Loop',
    description: '实现模型与工具之间的最小循环。',
    objectives: [
      '能实现“模型决策 → 工具调用 → 结果回填”的循环。',
      '能设置最大步数作为终止条件。'
    ],
    publicTests: [
      {
        id: 'basic-agent-loop-001',
        name: '循环包含工具结果回填'
      }
    ],
    workspace: codeWorkspace
  },
  'tool-failure-recovery': {
    id: 'tool-failure-recovery',
    missionId: 'mission-04',
    type: 'code',
    title: 'Recover from Tool Failure',
    description: '在工具失败时让 Agent 继续完成用户请求。',
    objectives: [
      '能识别工具失败并重新决策。',
      '不会无限重试。'
    ],
    publicTests: [
      {
        id: 'tool-failure-recovery-001',
        name: '失败后修正参数重试'
      }
    ],
    workspace: codeWorkspace
  }
}

export function getChallengeDetail(id: string): ChallengeDetail | undefined {
  return challengeDetails[id]
}
