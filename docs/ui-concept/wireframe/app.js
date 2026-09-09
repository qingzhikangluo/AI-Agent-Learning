const missions = [
  {
    id: 'mission-01',
    title: 'AI Agent Mental Model',
    skillTargets: ['agent.mental-model'],
    status: 'active',
    description: '建立 Agent 最小心智模型，判断 Agent 与固定流程的边界。',
    challenges: [
      { id: 'workflow-vs-agent', title: 'Workflow vs Agent', type: 'concept', status: 'passed' },
      { id: 'agent-components', title: 'Agent Components', type: 'concept', status: 'passed' },
      { id: 'agent-when-to-use', title: 'When to Use an Agent', type: 'concept', status: 'locked' }
    ]
  },
  {
    id: 'mission-02',
    title: 'API & JSON',
    skillTargets: ['api.http', 'api.json'],
    status: 'locked',
    description: '发起 API 请求、解析 JSON、处理错误。',
    challenges: [
      { id: 'api-request', title: 'Make an API Request', type: 'code', status: 'locked' },
      { id: 'json-parser', title: 'Parse JSON', type: 'code', status: 'locked' },
      { id: 'api-error', title: 'Handle an API Error', type: 'code', status: 'locked' }
    ]
  },
  {
    id: 'mission-03',
    title: 'Tool Calling',
    skillTargets: ['tool.selection', 'tool.arguments'],
    status: 'locked',
    description: '选择工具、生成合法参数、处理工具错误。',
    challenges: [
      { id: 'choose-tool', title: 'Choose the Right Tool', type: 'code', status: 'locked' },
      { id: 'validate-arguments', title: 'Validate Tool Arguments', type: 'code', status: 'locked' },
      { id: 'tool-error', title: 'Recover from Tool Errors', type: 'code', status: 'locked' }
    ]
  }
]

const boss = {
  id: 'first-agent-boss',
  title: 'Internal Employee Assistant',
  tools: ['get_weather', 'calculate_expense', 'search_faq'],
  publicTests: ['Normal Weather', 'Calculate Expense', 'FAQ Search', 'No Tool']
}

const transfer = {
  id: 'travel-expense-transfer',
  title: 'Travel Expense Assistant',
  tools: ['calculate_distance', 'calculate_reimbursement', 'search_policy']
}

const state = {
  view: 'dashboard',
  selectedMission: 'mission-01',
  selectedChallenge: 'workflow-vs-agent',
  evidence: [
    { id: 'ev-1', skill: 'agent.mental-model', task: 'Workflow vs Agent', result: 'pass', attempts: 1, hints: 0 },
    { id: 'ev-2', skill: 'agent.mental-model', task: 'Agent Components', result: 'pass', attempts: 1, hints: 0 }
  ],
  skills: [
    { id: 'agent.mental-model', level: 2, confidence: 0.9, strengths: ['区分 Workflow 与 Agent'], weaknesses: [] },
    { id: 'tool.calling', level: 0, confidence: 0, strengths: [], weaknesses: ['尚无证据'] }
  ]
}

const el = (html) => {
  const template = document.createElement('template')
  template.innerHTML = html.trim()
  return template.content.firstElementChild
}

function statusLabel(item) {
  const labels = {
    passed: ['is-passed', 'Passed'],
    active: ['is-active', 'In Progress'],
    failed: ['is-failed', 'Failed'],
    hint: ['is-hint', 'Guided'],
    locked: ['', 'Locked']
  }
  const [modifier, label] = labels[item.status] ?? labels.locked
  return `<span class="status"><span class="status-dot ${modifier}"></span>${label}</span>`
}

function header(title, sub, actions = '') {
  return `<div class="page-head"><div><h1>${title}</h1><p class="page-sub">${sub}</p></div>${actions ? `<div class="action-row">${actions}</div>` : ''}</div>`
}

function viewDashboard() {
  const evidenceHtml = state.evidence.length
    ? state.evidence.map((ev) => `<li><strong>${ev.task}</strong> · ${ev.skill} · ${ev.result === 'pass' ? 'PASS' : 'FAIL'}</li>`).join('')
    : '<li class="empty">完成第一个 Challenge 后，这里会出现证据。</li>'

  return header(
    'Mission Control',
    '从一个真实构建任务开始，用测试证明你的 AI Agent 能力。',
    '<button class="btn" data-open-mission="mission-01">进入当前任务</button>'
  ) +
  `<section class="section grid-2">
    <div>
      <h2 class="section-title">任务路线</h2>
      <div class="track">
        ${missions.map((m) => `<div class="track-row" data-open-mission="${m.id}">
          <span class="track-index">${m.id.replace('mission-', 'M')}</span>
          <div class="track-main"><div class="track-title">${m.title}</div><div class="track-meta">${m.skillTargets.join(' · ')}</div></div>
          ${statusLabel(m)}
        </div>`).join('')}
        <div class="track-row" data-open-boss><span class="track-index">BOSS</span><div class="track-main"><div class="track-title">${boss.title}</div><div class="track-meta">公开测试通过后提交</div></div>${statusLabel({ status: state.skills.some((s) => s.level >= 3) ? 'active' : 'locked' })}</div>
        <div class="track-row" data-open-transfer><span class="track-index">TRN</span><div class="track-main"><div class="track-title">${transfer.title}</div><div class="track-meta">新场景独立完成</div></div>${statusLabel({ status: 'locked' })}</div>
      </div>
    </div>
    <div>
      <h2 class="section-title">技能与证据</h2>
      <div class="table">
        <table><thead><tr><th>Skill</th><th>Level</th></tr></thead><tbody>
        ${state.skills.map((s) => `<tr><td>${s.id}</td><td>L${s.level}</td></tr>`).join('')}
        </tbody></table>
      </div>
      <h2 class="section-title" style="margin-top:28px">最近 Evidence</h2>
      <ul class="list">${evidenceHtml}</ul>
    </div>
  </section>`
}

function viewMissions() {
  return header('Missions', '按路线推进：概念 → 代码 → Boss → Transfer。') +
  `<section class="section"><div class="track">
    ${missions.map((m) => `<div class="track-row" data-open-mission="${m.id}">
      <span class="track-index">${m.id.replace('mission-', 'M')}</span>
      <div class="track-main"><div class="track-title">${m.title}</div><div class="track-meta">${m.description}</div></div>
      ${statusLabel(m)}
    </div>`).join('')}
  </div></section>`
}

function challengeRows(mission) {
  return mission.challenges.map((c) => `<div class="track-row" data-open-challenge="${mission.id}:${c.id}">
    <span class="track-index">${c.type === 'concept' ? 'C' : 'CODE'}</span>
    <div class="track-main"><div class="track-title">${c.title}</div></div>
    ${statusLabel(c)}
  </div>`).join('')
}

function viewMission(id) {
  const mission = missions.find((m) => m.id === id) ?? missions[0]
  state.selectedMission = mission.id
  return header(
    mission.title,
    mission.description,
    '<button class="btn" data-open-challenge="' + mission.id + ':' + mission.challenges.find((c) => c.status !== 'locked')?.id + '">开始 Challenge</button>'
  ) +
  `<section class="section grid-2">
    <div><h2 class="section-title">技能目标</h2><ul class="list">${mission.skillTargets.map((s) => `<li>${s}</li>`).join('')}</ul></div>
    <div><h2 class="section-title">任务进度</h2><div class="track">${challengeRows(mission)}</div></div>
  </section>`
}

function viewProgress() {
  const rows = state.skills.map((s) => `<tr><td><code>${s.id}</code></td><td>L${s.level}</td><td>${Math.round(s.confidence * 100)}%</td><td>${s.strengths.join('、') || '—'}</td><td>${s.weaknesses.join('、') || '—'}</td></tr>`).join('')
  const evidenceRows = state.evidence.length ? state.evidence.map((ev) => `<tr><td>${ev.id}</td><td>${ev.skill}</td><td>${ev.task}</td><td>${ev.result}</td><td>${ev.attempts}</td><td>${ev.hints}</td></tr>`).join('') : '<tr><td colspan="6">暂无 Evidence</td></tr>'
  return header('Progress', '技能等级由 Evidence 推导，不因单一任务完成而跳级。') +
  `<section class="section"><h2 class="section-title">Skills</h2><div class="table"><table><thead><tr><th>Skill</th><th>Level</th><th>Confidence</th><th>Strength</th><th>Weakness</th></tr></thead><tbody>${rows}</tbody></table></div></section>
  <section class="section"><h2 class="section-title">Evidence</h2><div class="table"><table><thead><tr><th>ID</th><th>Skill</th><th>Task</th><th>Result</th><th>Attempts</th><th>Hints</th></tr></thead><tbody>${evidenceRows}</tbody></table></div></section>`
}

function viewChallenge(missionId, challengeId) {
  const mission = missions.find((m) => m.id === missionId)
  const challenge = mission?.challenges.find((c) => c.id === challengeId)
  if (!challenge) return viewMission(missionId)
  state.selectedChallenge = challengeId
  return header(
    challenge.title,
    `${mission.title} · ${challenge.type === 'concept' ? 'Concept' : 'Code'} Challenge`,
    '<button class="btn ghost" data-view="missions">返回任务</button>'
  ) +
  `<section class="section grid-2">
    <div>
      <h2 class="section-title">Objective</h2>
      <p>${challenge.type === 'concept' ? '用你自己的话判断正确行为，并在测试中证明理解。' : '在下方工作区编写最小实现，然后运行与测试。'}</p>
      <h2 class="section-title" style="margin-top:24px">Workspace</h2>
      <textarea class="code-editor" aria-label="代码工作区">${challenge.type === 'concept' ? '# 输入你的答案或推理\n' : 'def handle(user_message):\n    # your agent logic\n    return user_message'}</textarea>
      <div class="action-row">
        <button class="btn" id="run-btn">Run</button>
        <button class="btn secondary" id="test-btn" disabled>Run Tests</button>
        <button class="btn ghost" id="hint-btn">Ask Hint</button>
      </div>
      <div id="hint-area" class="hint-box" hidden>Level 1 · 先读工具的 description，再看用户意图；使用 Hint 后此任务按 Guided 记录。</div>
    </div>
    <div>
      <h2 class="section-title">Output</h2>
      <div id="terminal" class="terminal">等待运行…</div>
      <h2 class="section-title" style="margin-top:22px">Test Result</h2>
      <div id="test-result" class="empty">运行测试后显示 PASS / FAIL 与 Failure Category。</div>
      <div id="failure-hint" class="hint-box" hidden>Diagnosis：Tool Schema · 建议进入 Remediation Quest：Tool Schema Repair。</div>
    </div>
  </section>`
}

function viewBoss() {
  return header(
    boss.title,
    '业务背景：内部员工助手。请独立构建最小 Tool-Calling Agent；不要泄露 Hidden Test。',
    '<button class="btn" id="boss-submit">Submit</button>'
  ) +
  `<section class="section grid-2">
    <div>
      <h2 class="section-title">Available Tools</h2>
      <ul class="list">${boss.tools.map((t) => `<li><code>${t}</code></li>`).join('')}</ul>
      <h2 class="section-title" style="margin-top:24px">Constraints</h2>
      <ul class="list"><li>不需要工具时直接回答</li><li>参数必须符合 Schema</li><li>工具失败后要恢复</li></ul>
      <h2 class="section-title" style="margin-top:24px">Public Tests</h2>
      <ul class="list">${boss.publicTests.map((t) => `<li>${t}</li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="section-title">Test Result</h2>
      <div class="empty">先运行 agent-rpg test，再把结果粘贴到这里。</div>
      <h2 class="section-title" style="margin-top:24px">Explanation</h2>
      <textarea class="code-editor" style="min-height:130px" aria-label="结构化解释">请用结构化问答说明：1) 你如何选择工具；2) 如何处理参数错误；3) 如何避免无限循环。</textarea>
      <div class="hint-box" style="margin-top:12px">Hidden Tests 永远不会显示在页面上。</div>
    </div>
  </section>`
}

function viewTransfer() {
  return header(
    transfer.title,
    '这是一个新场景，请独立解决，不要复用 Boss 的实现答案。',
    '<button class="btn" data-view="progress">查看迁移证据</button>'
  ) +
  `<section class="section grid-2">
    <div><h2 class="section-title">场景要求</h2><p>用差旅助手场景再次证明 Tool Calling 迁移能力：先计算距离，再按政策计算报销。</p></div>
    <div><h2 class="section-title">Available Tools</h2><ul class="list">${transfer.tools.map((t) => `<li><code>${t}</code></li>`).join('')}</ul></div>
  </section>`
}

function viewAssessment() {
  const categories = ['Python', 'API', 'LLM', 'Agent', 'Debugging']
  return header('Assessment', '完成最小能力诊断，系统会给出推荐起点。') +
  `<section class="section"><div class="table"><table><thead><tr><th>能力</th><th>状态</th></tr></thead><tbody>${categories.map((c) => `<tr><td>${c}</td><td><span class="status"><span class="status-dot"></span>待评测</span></td></tr>`).join('')}</tbody></table></div></section>`
}

function render() {
  const view = document.getElementById('view')
  const pages = {
    dashboard: viewDashboard,
    missions: viewMissions,
    progress: viewProgress,
    boss: viewBoss,
    transfer: viewTransfer,
    assessment: viewAssessment
  }
  if (pages[state.view]) {
    view.replaceChildren(el(pages[state.view]()))
  } else if (state.view === 'mission') {
    view.replaceChildren(el(viewMission(state.selectedMission)))
  } else if (state.view === 'challenge') {
    view.replaceChildren(el(viewChallenge(state.selectedMission, state.selectedChallenge)))
  }
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.view === state.view)
  })
}

function showToast(message) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.classList.add('is-visible')
  clearTimeout(showToast.timer)
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2400)
}

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]')
  if (viewButton) {
    state.view = viewButton.dataset.view
    render()
    return
  }

  const missionButton = event.target.closest('[data-open-mission]')
  if (missionButton) {
    state.selectedMission = missionButton.dataset.openMission
    state.view = 'mission'
    render()
    return
  }

  const challengeButton = event.target.closest('[data-open-challenge]')
  if (challengeButton) {
    const [missionId, challengeId] = challengeButton.dataset.openChallenge.split(':')
    state.selectedMission = missionId
    state.selectedChallenge = challengeId
    state.view = 'challenge'
    render()
    return
  }

  if (event.target.closest('[data-open-boss]')) {
    state.view = 'boss'
    render()
    return
  }

  if (event.target.closest('[data-open-transfer]')) {
    state.view = 'transfer'
    render()
  }
})

document.addEventListener('click', (event) => {
  const runButton = event.target.closest('#run-btn')
  if (!runButton) return
  const terminal = document.getElementById('terminal')
  terminal.textContent = 'Running python main.py …\n'
  setTimeout(() => {
    terminal.textContent = 'Running python main.py …\nexit code: 0\nstdout: result received\nstderr: (empty)'
    document.getElementById('test-btn').disabled = false
  }, 500)
})

document.addEventListener('click', (event) => {
  const testButton = event.target.closest('#test-btn')
  if (!testButton) return
  const panel = document.getElementById('test-result')
  panel.className = 'test-ledger'
  const resultIsFail = state.selectedChallenge === 'choose-tool' || state.selectedChallenge === 'tool-error'
  panel.innerHTML = resultIsFail
    ? '<div class="test-row"><span><strong>PASS</strong> 0 · <strong>FAIL</strong> 1</span><span class="status"><span class="status-dot is-failed"></span>Fail</span></div><div class="test-row"><span>Failure Category</span><span>tool_schema</span></div>'
    : '<div class="test-row"><span><strong>PASS</strong> 1 · <strong>FAIL</strong> 0</span><span class="status"><span class="status-dot is-passed"></span>Pass</span></div>'
  if (resultIsFail) {
    document.getElementById('failure-hint').hidden = false
    showToast('失败已分类：Tool Schema')
  } else {
    document.getElementById('failure-hint').hidden = true
    state.skills = state.skills.map((s) => s.id === 'agent.mental-model' ? { ...s, confidence: 1, strengths: ['区分 Workflow 与 Agent', '说明 Agent Components'], weaknesses: [] } : s)
    if (!state.evidence.some((ev) => ev.task === state.selectedChallenge)) {
      state.evidence.push({ id: 'ev-' + state.evidence.length, skill: 'agent.mental-model', task: state.selectedChallenge, result: 'pass', attempts: 1, hints: 0 })
    }
    showToast('Evidence 已记录')
  }
})

document.addEventListener('click', (event) => {
  if (!event.target.closest('#hint-btn')) return
  document.getElementById('hint-area').hidden = false
  showToast('Hint 已记录：Level 1')
})

document.addEventListener('click', (event) => {
  if (!event.target.closest('#boss-submit')) return
  showToast('提交已保存（线框演示）')
})

render()
