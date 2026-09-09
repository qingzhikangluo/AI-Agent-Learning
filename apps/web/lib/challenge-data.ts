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

export interface ChallengeHint {
  hintText: string
  exampleCode: string
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

export const challengeHints: Record<string, ChallengeHint> = {
  'workflow-vs-agent': {
    hintText: '看路径是否预先固定：由模型根据当前输入决定下一步的就是 Agent。',
    exampleCode: `固定路径 → Workflow
根据用户问题自行决定调用哪个工具 → Agent

示例判断：
“按固定顺序先调用 A 再调用 B” → Workflow
“根据问题决定调用 A 或 B” → Agent`
  },
  'agent-components': {
    hintText: '四个部分缺一不可：决定者、执行者、背景信息、循环。',
    exampleCode: `最小 Agent = 模型 + 可用工具 + 上下文 + 循环

模型：决定下一步动作
工具：执行实际动作
上下文：系统提示与对话历史
循环：模型 → 工具 → 结果 → 再决策`
  },
  'agent-when-to-use': {
    hintText: '路径固定且可穷举用 Workflow；路径不确定、需要根据结果判断用 Agent。',
    exampleCode: `每次调用同一个 API 并按固定格式保存 → Workflow
问题可能涉及多个不同工具、需要先判断再调用 → Agent`
  },
  'api-request': {
    hintText: '先确认端点与认证，再发起请求；成功与否由状态码决定。',
    exampleCode: `import json
import urllib.request

def fetch_user():
    with urllib.request.urlopen(
        "https://api.example.com/user"
    ) as response:
        status = response.status
        payload = json.loads(response.read().decode("utf-8"))
        if status == 200 and "name" in payload:
            return payload["name"]
    return "读取失败"`
  },
  'json-parser': {
    hintText: '解析后不要直接假定字段存在：先检查类型，再读取嵌套字段。',
    exampleCode: `import json

def read_name(raw: str) -> str:
    data = json.loads(raw)
    user = data.get("user")
    if not isinstance(user, dict) or "name" not in user:
        raise ValueError("字段缺失: user.name")
    return user["name"]`
  },
  'api-error': {
    hintText: '超时、非 2xx、非法 JSON 都要返回可读、可操作的信息。',
    exampleCode: `def handle_response(response, timeout=False):
    if timeout:
        raise ApiError("请求超时，请稍后重试")
    if response.status >= 400:
        raise ApiError(f"请求失败: {response.status}")
    try:
        return response.json()
    except ValueError:
        raise ApiError("响应不是合法 JSON")`
  },
  'choose-tool': {
    hintText: '先读工具 description 与用户意图；没有匹配工具时不要强行调用。',
    exampleCode: `def choose_tool(user_message: str) -> str | None:
    if "天气" in user_message:
        return "get_weather"
    if "报销" in user_message:
        return "calculate_expense"
    return None  # 无匹配时不硬调用`
  },
  'validate-arguments': {
    hintText: '调用前先对照 Schema：缺少必填参数或类型错误都要拒绝。',
    exampleCode: `def validate_arguments(arguments, schema):
    missing = [
        key for key in schema["required"]
        if key not in arguments
    ]
    if missing:
        raise ValueError(
            "缺少必填参数: " + ", ".join(missing)
        )
    if not isinstance(arguments.get("city"), str):
        raise TypeError("city 必须是字符串")`
  },
  'tool-error': {
    hintText: '工具失败时把错误反馈给模型，让它修正参数、换工具或如实说明。',
    exampleCode: `def recover(tool_error, model):
    if tool_error:
        # 把错误作为新上下文交给模型
        model.feedback(f"工具失败: {tool_error}")
        return "retry_or_switch"
    return "ok"`
  },
  'basic-agent-loop': {
    hintText: '循环四步：决策 → 调用 → 结果回填 → 再决策；必须有最大步数。',
    exampleCode: `def run_agent(user_message, model, tools, max_steps=5):
    messages = [{"role": "user", "content": user_message}]
    for step in range(max_steps):
        action = model.decide(messages)
        if not action.tool:
            return action.answer
        result = tools.call(action.tool, action.arguments)
        messages.append({"role": "tool", "content": result})
    raise RuntimeError("超过最大步数")`
  },
  'tool-failure-recovery': {
    hintText: '失败后把错误交回模型修正参数，但必须限制重试次数。',
    exampleCode: `for attempt in range(max_retries):
    try:
        result = call_tool(arguments)
        break
    except ToolError as error:
        arguments = repair_arguments(error, arguments)
else:
    return "工具持续失败，已停止重试"`
  }
}

export function getChallengeHint(id: string): ChallengeHint | undefined {
  return challengeHints[id]
}
