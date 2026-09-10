'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'

export type Language = 'zh' | 'en'

const zh = {
  language: '语言',
  mainNavigation: '主导航',
  navDashboard: '仪表盘',
  navMissions: '任务路线',
  navProgress: '进度',
  currentMission: '当前 Mission',
  progressTitle: '学习进度',

  missionControl: '任务控制台',
  currentTaskAndEvidence: '当前任务与证据',
  dashboardSub:
    '从真实构建任务开始，用确定性测试证明你的 AI Agent 能力。',
  enterCurrentMission: '进入当前任务',
  routeCompletion: '路线完成度',
  milestones: '里程碑',
  missionRoute: '任务路线',
  skills: '技能',
  recentEvidence: '最近 Evidence',
  emptyEvidence: '完成第一个 Challenge 后，这里会出现证据。',
  bossSubmitMeta: '公开测试通过后提交',
  transferMeta: '新场景独立完成',
  bossLabel: 'BOSS',
  transferLabel: 'TRN',

  statusPassed: '已通过',
  statusActive: '进行中',
  statusFailed: '失败',
  statusGuided: '已引导',
  statusLocked: '未解锁',

  startCurrentChallenge: '开始当前 Challenge',
  missionProgress: 'Mission 进度',
  objectives: '目标',
  learningBlocks: '学习块',
  challenges: '挑战列表',
  skillTargets: '技能目标',
  conceptChallenge: '概念 Challenge',
  codeChallenge: '代码 Challenge',
  lockedMissionNote: '此 Mission 需要先通过前置 Mission，完成后自动解锁。',
  conceptTag: '概念',
  exampleTag: '示例',
  instructionTag: '操作',

  missionsTitle: '任务路线',
  missionsSub: '按路线推进：概念 → 代码 → Boss → Transfer。',
  missionsSection: 'Missions',
  finalMilestones: 'Final Milestones',

  backToMission: '返回 Mission',
  workspace: '工作区',
  output: '输出',
  testResult: '测试结果',
  run: '运行',
  checkAnswer: '确认答案',
  runTests: '运行测试',
  askHint: '查看提示',
  hintFallback: '先读题目与测试要求，再检查工具描述和参数。',
  failureCategory: '失败分类',
  waitingRun: '等待运行…',
  conceptRunHint: '已记录你的答案，点击“运行测试”进行判定。',
  conceptAnswerPlaceholder: '用中文写出你的判断与理由。',
  codeWorkspacePlaceholder: '实现 run_agent(input)，返回 output 与 tool_calls。',
  testWaiting: '先 Run，再运行 Tests。',
  runningTests: '运行测试…',
  hiddenHintGuided: '使用 Hint 后，此任务将按 Guided 记录。',
  lockedChallengeNote: '此 Challenge 尚未解锁，先完成前置任务后再回来。',

  backToMissions: '返回路线',
  bossEyebrow: 'Boss · 验收',
  submit: '提交',
  availableTools: '可用工具',
  constraints: '约束',
  publicTests: '公开测试',
  explanation: '结构化解释',
  explanationPlaceholder:
    '请用结构化问答说明：1) 你如何选择工具；2) 如何处理参数错误；3) 如何避免无限循环。',
  hiddenTestsNote: 'Hidden Tests 永远不会显示在页面上。',
  bossLockedNote: '先完成 Mission 04，Boss 才会开放提交。',
  emptyTestResult: '先运行本地公开测试，再把结果粘贴到这里。',

  transferEyebrow: 'Transfer · 迁移',
  transferObjectives: '迁移目标',
  transferIndependentNote:
    '新场景，独立解决；不展示 Boss 实现，也不复用 Boss 的答案。',
  viewTransferEvidence: '查看迁移证据',

  progressSub: '技能等级由 Evidence 推导，不因单一任务完成而跳级。',
  skillsTable: 'Skills',
  evidenceTable: 'Evidence',
  tableSkill: 'Skill',
  tableLevel: 'Level',
  tableConfidence: 'Confidence',
  tableStrength: 'Strength',
  tableWeakness: 'Weakness',
  tableId: 'ID',
  tableTask: 'Task',
  tableResult: 'Result',
  tableAttempts: 'Attempts',
  tableHints: 'Hints',
  resultPass: '通过',
  resultFail: '失败',

  assessmentTitle: '能力诊断',
  assessmentSub: '完成最小能力诊断，系统会给出推荐起点。',
  skillDashboard: '技能面板',
  abilityStatus: '能力状态',
  ability: '能力',
  status: '状态',
  pending: '待评测',

  hintShowCode: '提示 · 显示示例代码',
  hintShowAnswer: '提示 · 显示示例答案',
  collapseExample: '收起示例'
}

const en: Record<keyof typeof zh, string> = {
  language: 'Language',
  mainNavigation: 'Main navigation',
  navDashboard: 'Dashboard',
  navMissions: 'Missions',
  navProgress: 'Progress',
  currentMission: 'Current Mission',
  progressTitle: 'Progress',

  missionControl: 'Mission Control',
  currentTaskAndEvidence: 'Current Task & Evidence',
  dashboardSub:
    'Start from a real build task and prove your AI Agent skills with deterministic tests.',
  enterCurrentMission: 'Enter current mission',
  routeCompletion: 'Route completion',
  milestones: 'milestones',
  missionRoute: 'Mission Route',
  skills: 'Skills',
  recentEvidence: 'Recent Evidence',
  emptyEvidence:
    'Evidence will appear here after you finish your first Challenge.',
  bossSubmitMeta: 'Submit after public tests pass',
  transferMeta: 'Independent new scenario',
  bossLabel: 'BOSS',
  transferLabel: 'TRN',

  statusPassed: 'Passed',
  statusActive: 'In Progress',
  statusFailed: 'Failed',
  statusGuided: 'Guided',
  statusLocked: 'Locked',

  startCurrentChallenge: 'Start current Challenge',
  missionProgress: 'Mission Progress',
  objectives: 'Objectives',
  learningBlocks: 'Learning Blocks',
  challenges: 'Challenges',
  skillTargets: 'Skill Targets',
  conceptChallenge: 'Concept Challenge',
  codeChallenge: 'Code Challenge',
  lockedMissionNote:
    'This Mission unlocks after you pass its prerequisite Mission.',
  conceptTag: 'Concept',
  exampleTag: 'Example',
  instructionTag: 'Instruction',

  missionsTitle: 'Missions',
  missionsSub: 'Progress along the route: Concept → Code → Boss → Transfer.',
  missionsSection: 'Missions',
  finalMilestones: 'Final Milestones',

  backToMission: 'Back to Mission',
  workspace: 'Workspace',
  output: 'Output',
  testResult: 'Test Result',
  run: 'Run',
  checkAnswer: 'Check Answer',
  runTests: 'Run Tests',
  askHint: 'Ask Hint',
  hintFallback:
    'Read the prompt and tests first, then check tool descriptions and arguments.',
  failureCategory: 'Failure Category',
  waitingRun: 'Waiting to run…',
  conceptRunHint: 'Answer recorded. Use Run Tests to evaluate.',
  conceptAnswerPlaceholder: 'Write your reasoning here.',
  codeWorkspacePlaceholder:
    'Implement run_agent(input) returning output and tool_calls.',
  testWaiting: 'Run the code before running tests.',
  runningTests: 'Running tests…',
  hiddenHintGuided:
    'After using a hint, this task is recorded as Guided.',
  lockedChallengeNote:
    'This Challenge is locked. Complete the prerequisite tasks first.',

  backToMissions: 'Back to Missions',
  bossEyebrow: 'Boss · Acceptance',
  submit: 'Submit',
  availableTools: 'Available Tools',
  constraints: 'Constraints',
  publicTests: 'Public Tests',
  explanation: 'Explanation',
  explanationPlaceholder:
    'Answer in a structured way: 1) how you choose tools; 2) how you handle argument errors; 3) how you avoid infinite loops.',
  hiddenTestsNote: 'Hidden Tests are never shown on this page.',
  bossLockedNote:
    'Finish Mission 04 before the Boss accepts submissions.',
  emptyTestResult:
    'Run the local public tests first, then paste the results here.',

  transferEyebrow: 'Transfer · Migration',
  transferObjectives: 'Transfer Objectives',
  transferIndependentNote:
    'New scenario, solve it independently; no Boss implementation is shown.',
  viewTransferEvidence: 'View transfer evidence',

  progressSub:
    'Skill levels are derived from Evidence and never jump from a single task.',
  skillsTable: 'Skills',
  evidenceTable: 'Evidence',
  tableSkill: 'Skill',
  tableLevel: 'Level',
  tableConfidence: 'Confidence',
  tableStrength: 'Strength',
  tableWeakness: 'Weakness',
  tableId: 'ID',
  tableTask: 'Task',
  tableResult: 'Result',
  tableAttempts: 'Attempts',
  tableHints: 'Hints',
  resultPass: 'pass',
  resultFail: 'fail',

  assessmentTitle: 'Assessment',
  assessmentSub:
    'Complete a minimal capability diagnosis to receive a recommended starting point.',
  skillDashboard: 'Skill Dashboard',
  abilityStatus: 'Ability Status',
  ability: 'Ability',
  status: 'Status',
  pending: 'Pending',

  hintShowCode: 'Hint · Show example code',
  hintShowAnswer: 'Hint · Show example answer',
  collapseExample: 'Collapse example'
}

export type TranslationKey = keyof typeof zh

const messages: Record<Language, Record<TranslationKey, string>> = {
  zh,
  en
}

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const storageKey = 'ai-agent-rpg-language'

export function LanguageProvider({
  children
}: {
  children: ReactNode
}) {
  const [language, setLanguageState] = useState<Language>('zh')

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey)
    const next =
      stored === 'zh' || stored === 'en'
        ? stored
        : navigator.language.toLowerCase().startsWith('en')
          ? 'en'
          : 'zh'
    setLanguageState(next)
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
  }, [])

  useEffect(() => {
    window.localStorage.setItem(storageKey, language)
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => messages[language][key]
    }),
    [language, setLanguage]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return context
}
