'use client'

import { useState } from 'react'

import {
  getChallengeHint,
  type ChallengeDetail
} from '@/lib/challenge-data'
import type { ChallengeStatus } from '@/lib/player-data'

import { useLanguage } from '@/lib/i18n'
import { StatusDot } from './status-dot'

const failureChallengeIds = new Set(['choose-tool', 'tool-error'])

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
    'idle' | 'running' | 'passed' | 'failed'
  >('idle')
  const [hintOpen, setHintOpen] = useState(false)
  const hint = getChallengeHint(challenge.id)

  function handleRun() {
    if (locked || runPhase === 'running') return
    setRunPhase('running')
    setTestPhase('idle')
    window.setTimeout(() => setRunPhase('done'), 600)
  }

  function handleTest() {
    if (locked || runPhase !== 'done' || testPhase === 'running') return
    setTestPhase('running')
    window.setTimeout(() => {
      setTestPhase(failureChallengeIds.has(challenge.id) ? 'failed' : 'passed')
    }, 600)
  }

  const output =
    runPhase === 'running'
      ? 'Running python main.py …\n'
      : runPhase === 'done'
      ? 'Running python main.py …\nexit code: 0\nstdout: result received\nstderr: (empty)'
        : t('waitingRun')

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
                locked ||
                runPhase !== 'done' ||
                testPhase === 'running'
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
          {testPhase === 'idle' || testPhase === 'running' ? (
            <div className="empty">
              {testPhase === 'running'
                ? t('runningTests')
                : t('testWaiting')}
            </div>
          ) : (
            <div className="test-ledger">
              <div className="test-row">
                <span>
                  <strong>PASS</strong>{' '}
                  {testPhase === 'passed'
                    ? challenge.publicTests.length
                    : 0}{' '}
                  · <strong>FAIL</strong>{' '}
                  {testPhase === 'failed' ? 1 : 0}
                </span>
                <StatusDot
                  status={testPhase === 'passed' ? 'passed' : 'failed'}
                />
              </div>
              {testPhase === 'passed' ? (
                challenge.publicTests.map((test) => (
                  <div className="test-row" key={test.id}>
                    <span>{test.name}</span>
                    <span>PASS</span>
                  </div>
                ))
              ) : (
                <div className="test-row">
                  <span>
                    {challenge.publicTests[0]?.name ?? 'Public Test'}
                  </span>
                  <span>FAIL</span>
                </div>
              )}
              {testPhase === 'failed' && (
                <div className="test-row">
                  <span>{t('failureCategory')}</span>
                  <span>tool_schema</span>
                </div>
              )}
            </div>
          )}

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
            <p className="mission-note">
              {t('lockedChallengeNote')}
            </p>
          )}
        </div>
      </section>
    </>
  )
}
