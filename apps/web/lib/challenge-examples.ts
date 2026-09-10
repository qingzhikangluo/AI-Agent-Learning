export interface ChallengeHint {
  hintText: string
  exampleCode: string
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
