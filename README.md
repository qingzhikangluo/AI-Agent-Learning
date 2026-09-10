# AI Agent RPG

通过游戏化任务、真实代码实践、确定性评测和能力证据，训练 AI Agent 工程能力的平台。

当前阶段目标：

> Build the First Agent Vertical Slice。

当前进度：**EPIC 1 至 EPIC 10 完成；EPIC 11 Web UI 完成；EPIC 12 — 垂直切片闭合（P0/P1/P2 完成）**。

## Repository Structure

```text
apps/                Web UI（定向 Web 页面，后续任务建立）
packages/
  domain/            Domain Model
  content/           Content Engine / 数据驱动内容
  evaluator/         Evaluation Engine
  progression/       Progression / Evidence / Skill
  runtime/           Player Runtime
  shared/            共享类型与工具
cli/
  agent-rpg/         agent-rpg CLI
player-workspace/    玩家本地工作区
tests/               集成 / 端到端测试
docs/                架构与开发文档
scripts/             仓库脚本（构建校验等）
```

## Commands

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

运行 Web UI：

```bash
npm run dev --workspace @ai-agent-rpg/web
```

访问 http://localhost:3000 查看 Dashboard。
访问 http://localhost:3000/mission/mission-02 查看当前 Mission。
访问 http://localhost:3000/challenge/api-request 查看当前 Challenge。
访问 http://localhost:3000/missions 查看 Mission Map。
访问 http://localhost:3000/progress 查看 Progress。
界面语言可在侧栏底部切换中文 / English。

CLI 运行状态保存在 `player-workspace/.agent-rpg/state.json`（由 `agent-rpg init` 创建，`submit` 更新）。
Web UI 在服务端读取 `packages/content` 与这份状态文件；未初始化时显示默认进度，不写入玩家状态。

提交当前 Challenge：

```bash
agent-rpg submit --challenge <challenge-id> "<answer>"
```

测试当前 Challenge（只判定，不改状态）：

```bash
agent-rpg test --challenge <challenge-id> "<answer>"
```

输出题可直接传入 `<answer>`；不传时执行 `agent.py` 的 `run_agent`。

Boss 与 Transfer 同样通过 `--challenge` 提交：

```bash
agent-rpg submit --challenge first-agent-boss --answers "答案1|答案2|答案3"
agent-rpg submit --challenge travel-expense-transfer
```

`submit` 会为每个测试用例执行一次玩家 `agent.py`。玩家代码实现
`run_agent(input)`，返回 `output` / `tool_calls` / `steps` / `error_handling`，
由 evaluator 做确定性判定；仅在显式传入 `<answer>` 时，输出题使用该文本。
Web 的 Challenge 页通过 `/api/run` 与 `/api/test` 在服务端真实执行同一份代码；
隐藏测试只返回聚合结果，不显示名称、输入或反馈。
答案题按当前界面语言判定：中文界面使用 `value.zh`，English 界面使用 `value.en`
（英文匹配不区分大小写）。

TASK-001 阶段使用 Node.js 内置能力作为最小可运行基线：

- `build`：校验 Monorepo 结构完整性。

TASK-002 已建立 TypeScript / Python 工具链：

- TypeScript 严格模式 + `tsc` Type Check。
- Vitest（TypeScript Hello World 测试）。
- Pytest（Python Hello World 测试）。
- ESLint（TS / JS Lint）。
- Ruff（Python Lint）。

TASK-003 已建立 CI：

- GitHub Actions 在 push 到 main 或 pull request 时自动运行 Lint、Type Check、Test、Build。

运行 Python 测试前先安装开发依赖：

```bash
python -m pip install -r requirements-dev.txt
```

## MVP 边界

MVP 禁止实现 Multi-Agent、RAG、Long-term Memory、Online Code Sandbox、AI Mentor、
AI Judge、Payment、Social、Leaderboard、Cloud Deployment 等超出 Vertical Slice 的能力。

详见后续 `docs/` 中维护的架构文档与 Task Backlog。
