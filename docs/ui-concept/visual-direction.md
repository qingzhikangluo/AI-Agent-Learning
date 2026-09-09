# AI Agent RPG — Web UI 视觉方向 v0.1

> 状态：文字方向 + 可交互线框，供 EPIC 11 视觉确认。
> 本阶段不使用位图概念；后续若改为图像视觉，只需替换视觉元素，不改变页面结构与交互模型。

## 1. 产品与用户

- 产品：训练 AI Agent 工程能力的游戏化学习平台。
- 用户：已经了解基础编程、希望通过真实任务学会构建 Tool-Calling Agent 的学习者。
- 任务闭环：看任务 → 学习 → 尝试 → 失败 → 诊断 → Hint → 重试 → 通过 → Evidence → Skill 更新。

## 2. 页面范围

本方向覆盖 Web UI 所需的全部 MVP 页面：

| 路径 | 页面 | 核心任务 |
| --- | --- | --- |
| `/` | Dashboard | 当前任务、路线完成百分比、技能、Evidence、Boss 状态、推荐下一步 |
| `/assessment` | Assessment | 最小能力诊断 |
| `/missions` | Mission Map | 任务路线 |
| `/mission/:id` | Mission | 目标、学习块、挑战列表、进度 |
| `/challenge/:id` | Challenge | 任务、运行、测试、Hint |
| `/boss/:id` | Boss | 业务背景、工具、约束、公开测试、提交 |
| `/transfer/:id` | Transfer | 新场景独立解决 |
| `/progress` | Progress | Skills / Evidence |

## 3. 信息架构

- 全局左侧导航保持安静：Dashboard、Missions、Progress；Assessment 作为低强度入口。
- Mission 是“路线”，Challenge 是“任务”，Boss 是“验收”，Transfer 是“迁移”。
- 页面正文按“任务陈述 → 可操作区域 → 结果与证据”的顺序阅读。

## 4. 视觉方向

名称：**Mission Deck（任务台）**

- 中心想法：像一个严谨的工程任务台，而不是营销网站或花哨游戏大厅。
- 背景性格：暖白纸面 + 细线分区，让内容保持呼吸感。
- 字体性格：正文清晰中性，代码/测试输出使用等宽字体，控制元素有明确字重与尺寸。
- 主导航：品牌标记 + 三个主要入口 + 当前状态，不做图标堆叠。
- 页面节奏：任务路线用“轨道”表现；技能和 Evidence 用表格/清单表现；不强制使用卡片堆。
- 状态语言：未开始=灰，进行中=蓝，通过=绿，失败=红，Hint=琥珀。
- 组件母题：进度轨道、状态行、测试记录表、Hint 递进披露。
- 动效：状态切换与结果出现使用短促淡化/位移；尊重 `prefers-reduced-motion`。

## 5. 设计令牌

颜色（线框阶段可直接使用，后续图像视觉若引入仍以这里为基准）：

```text
--canvas:        #F7F7F5
--surface:       #FFFFFF
--ink:           #1E2432
--muted:         #667085
--line:          #E4E7EC
--accent:        #2F6FED
--pass:          #1F9D65
--fail:          #C3423F
--hint:          #D97706
--locked:        #98A2B3
```

字体：

```text
--font-sans: Inter, "Noto Sans SC", "PingFang SC", system-ui, sans-serif
--font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace
```

字号：标题 24–32、小节 18、正文 14–15、辅助 12–13；按钮/输入统一不依赖浏览器默认尺寸。

间距与圆角：使用 4px 基准；页面留白 24–48px；控制元素圆角 6px；避免大圆角卡片套娃。

## 6. 布局规则

- 左栏固定 220–240px，主区自适应；窄屏（<900px）左栏折叠为顶部导航。
- 内容页顶部：页面标题 + 当前状态 + 主要操作。
- Dashboard 的 Mission Map 与 Evidence 不强制放卡片；使用分栏或表格。
- Boss/Transfer 页面强调“场景文字”与“可操作测试/提交区”的分离。
- Challenge 页面使用“任务说明 + 工作台 + 测试记录”三段结构。
- Dashboard 顶部显示路线完成百分比；其定义为已通过里程碑数 / 总里程碑数（4 个 Mission + Boss + Transfer），不与技能等级换算成课程完成率混淆。

## 7. 组件规范

- 按钮：实心主操作；次级操作使用描边；危险/失败相关使用语义红。
- 状态点：未开始、进行中、通过、失败、锁定。
- 测试结果：等宽字体展示 stdout/stderr/exit code；失败显示 Failure Category 与对应 Hint。
- Hint：按 level 1→5 渐进显示，只显示当前建议级别，不默认给答案。
- 表格：Skills、Evidence 使用清晰表头与分割线，不转成卡片。
- 空状态：无 Evidence 时提示“完成第一个 Challenge 后，这里会出现证据”。
- 错误状态：显示可读、可操作的信息，不出现原始异常堆栈。

## 8. 交互状态

- Challenge Run：运行中 → 完成/超时；输出与错误分开。
- Challenge Test：只显示该 Challenge 对应测试；Boss 页面永远不显示 Hidden Test。
- Boss Submit：提交前要求 Public Test 结果与结构化解释。
- Hint：每次请求都会记录；UI 提示“使用 Hint 后该任务视为 Guided”。
- Transfer：明确文案“新场景，独立解决”，不展示 Boss 实现。

## 9. 负向约束

- 显示路线完成百分比，但只按里程碑完成率计算，不把技能等级当作课程完成率。
- 不使用无意义图标行、假数据、装饰徽章。
- 不为 Hero 增加 eyebrow/kicker/pill。
- 不把 Hidden Test 写进 UI。
- 不为本地 JSON/内存存储强行设计 SQLite 抽象。
- 不因图像化改造重构信息架构；图像仅替换视觉表达。

## 10. 后续切换图像视觉

- 页面结构、复制与交互已经由本规范和线框锁定。
- 若后续引入图像视觉，只替换：背景氛围图/插图、空状态插画、Hero 图形与品牌氛围，不改变导航、数据字段与交互路径。
- 图像将作为独立资源放置，并集中引用，避免散落在页面逻辑中。
