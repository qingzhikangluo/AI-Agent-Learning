'use client'

import { useState } from 'react'

import { getChallengeHint } from '@/lib/challenge-examples'
import type {
  ChallengeDetail,
  ChallengeStatus
} from '@/lib/player-data'

import { useLanguage } from '@/lib/i18n'
import { StatusDot } from './status-dot'

interface ExecutionSummary {
  exitCode: number
  stdout: string
  stderr: string
  timedOut: boolean
  durationMs: number
}

interface PublicTestResult {
  testId: string
  name: string
  passed: boolean
  failureCategory?: string
  message?: string
}

interface TestSummary {
  passed: boolean
  score: number
  publicResults: PublicTestResult[]
  hiddenSummary: { total: number; passed: number }
  failureCategories: string[]
}

function formatExecution(execution: ExecutionSummary): string {
  return [
    `exit code: ${execution.exitCode}`,
    `duration: ${execution.durationMs}ms`,
    `stdout: ${execution.stdout.trim() || '(empty)'}`,
    `stderr: ${execution.stderr.trim() || '(empty)'}`
  ].join('\n')
}

export function ChallengePage({
  challenge,
  missionTitle,
  status,
  locked
}: {
  challenge: ChallengeDetail
  missionTitle: string
  status: ChallengeStatus
  locked: boolean
}) {
  const { t } = useLanguage()
  const [code, setCode] = useState(challenge.workspace)
  const [runPhase, setRunPhase] = useState<'idle' | 'running' | 'done'>(
    'idle'
  )
  const [testPhase, setTestPhase] = useState<
    'idle' | 'running' | 'done'
  >('idle')
  const [output, setOutput] = useState(t('waitingRun'))
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hintOpen, setHintOpen] = useState(false)
  const hint = getChallengeHint(challenge.id)

  async function handleRun() {
    if (locked || runPhase === 'running') return
    setRunPhase('running')
    setTestPhase('idle')
    setTestSummary(null)
    setError(null)
    setOutput(`${t('run')}…`)

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, source: code })
      })
      const data = (await response.json()) as {
        error?: string
        execution?: ExecutionSummary
      }

      if (!response.ok || !data.execution) {
        throw new Error(data.error ?? 'Run failed.')
      }

      setOutput(formatExecution(data.execution))
      setRunPhase('done')
    } catch (runError) {
      const message =
        runError instanceof Error ? runError.message : String(runError)
      setError(message)
      setOutput(message)
      setRunPhase('idle')
    }
  }

  async function handleTest() {
    if (locked || runPhase !== 'done' || testPhase === 'running') return
    setTestPhase('running')
    setError(null)

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, source: code })
      })
      const data = (await response.json()) as TestSummary & {
        error?: string
      }

      if (!response.ok || data.error) {
        throw new Error(data.error ?? 'Tests failed to run.')
      }

      setTestSummary(data)
      setTestPhase('done')
    } catch (testError) {
      const message =
        testError instanceof Error ? testError.message : String(testError)
      setError(message)
      setTestPhase('idle')
    }
  }

  const publicPassed =
    testSummary?.publicResults.filter((result) => result.passed).length ?? 0
  const publicFailed =
    (testSummary?.publicResults.length ?? 0) - publicPassed

  return (
    <>
      <p className="crumb">
        <a href="/">{t('navDashboard')}</a>
        <span aria-hidden="true"> / </span>
        <a href={`/mission/${challenge.missionId}`}>{missionTitle}</a>
        <span aria-hidden="true"> / </span>
        {challenge.id}
      </p>

      <div className="page-head">
        <div>
          <p className="eyebrow">{missionTitle} · Challenge</p>
          <h1>{challenge.title}</h1>
          <p className="page-sub">{challenge.description}</p>
        </div>
        <div className="page-actions">
          <StatusDot status={status} />
          <a
            className="btn btn-secondary"
            href={`/mission/${challenge.missionId}`}
          >
            {t('backToMission')}
          </a>
        </div>
      </div>

      <section className="section challenge-grid">
        <div>
          <h2 className="section-title">{t('objectives')}</h2>
          <ul className="list">
            {challenge.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>

          <h2 className="section-title section-spaced">
            {t('workspace')}
          </h2>
          <textarea
            className="code-editor"
            aria-label={t('workspace')}
            disabled={locked}
            onChange={(event) => setCode(event.target.value)}
            value={code}
          />

          <div className="action-row">
            <button
              className="btn"
              type="button"
              disabled={locked || runPhase === 'running'}
              onClick={handleRun}
            >
              {t('run')}
            </button>
            <button
              className="btn secondary"
              type="button"
              disabled={
                locked || runPhase !== 'done' || testPhase === 'running'
              }
              onClick={handleTest}
            >
              {t('runTests')}
            </button>
            <button
              className="btn ghost"
              type="button"
              disabled={locked}
              onClick={() => setHintOpen((current) => !current)}
            >
              {t('askHint')}
            </button>
          </div>
        </div>

        <div>
          <h2 className="section-title">{t('output')}</h2>
          <div className="terminal">{output}</div>

          <h2 className="section-title section-spaced">
            {t('testResult')}
          </h2>
          {testPhase === 'running' ? (
            <div className="empty">{t('runningTests')}</div>
          ) : testSummary ? (
            <div className="test-ledger">
              <div className="test-row">
                <span>
                  <strong>PASS</strong> {publicPassed} ·{' '}
                  <strong>FAIL</strong> {publicFailed}
                </span>
                <StatusDot
                  status={testSummary.passed ? 'passed' : 'failed'}
                />
              </div>
              {testSummary.publicResults.map((result) => (
                <div className="test-row" key={result.testId}>
                  <span>{result.name}</span>
                  <span>{result.passed ? 'PASS' : 'FAIL'}</span>
                </div>
              ))}
              {testSummary.hiddenSummary.total > 0 && (
                <div className="test-row">
                  <span>Hidden Tests</span>
                  <span>
                    {testSummary.hiddenSummary.passed}/
                    {testSummary.hiddenSummary.total}
                  </span>
                </div>
              )}
              {testSummary.failureCategories.length > 0 && (
                <div className="test-row">
                  <span>{t('failureCategory')}</span>
                  <span>{testSummary.failureCategories.join(', ')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="empty">{t('testWaiting')}</div>
          )}

          {error && <div className="hint-box">{error}</div>}

          {hintOpen && (
            <>
              <div className="hint-box">
                {hint?.hintText ?? t('hintFallback')}
                <span className="hint-guided">
                  {t('hiddenHintGuided')}
                </span>
              </div>
              {hint && (
                <pre className="code-sample">
                  <code>{hint.exampleCode}</code>
                </pre>
              )}
            </>
          )}

          {locked && (
            <p className="mission-note">{t('lockedChallengeNote')}</p>
          )}
        </div>
      </section>
    </>
  )
}
