# AI Agent RPG

通过游戏化任务、真实代码实践、确定性评测和能力证据，训练 AI Agent 工程能力的平台。

当前阶段目标：

> Build the First Agent Vertical Slice。

当前进度：**EPIC 1 — Domain Model 完成；EPIC 2 — Content Engine（TASK-009 / TASK-010 完成）**。

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
