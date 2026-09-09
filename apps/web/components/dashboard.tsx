'use client'

import { routeCompletion } from '@/lib/player-data'
import type { PlayerState } from '@/lib/player-data'

import { useLanguage } from '@/lib/i18n'
import { StatusDot } from './status-dot'

export function Dashboard({ state }: { state: PlayerState }) {
  const { t } = useLanguage()
  const completion = routeCompletion(state)

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">{t('missionControl')}</p>
          <h1>{t('currentTaskAndEvidence')}</h1>
          <p className="page-sub">{t('dashboardSub')}</p>
        </div>
        <a className="btn" href={`/mission/${state.currentMissionId}`}>
          {t('enterCurrentMission')}
        </a>
      </div>

      <div className="route-progress">
        <span className="route-progress-label">
          {t('routeCompletion')}
        </span>
        <div className="route-progress-track" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="route-progress-fill" style={{ width: `${completion.percent}%` }} />
        </div>
        <span className="route-progress-value">
          {completion.percent}% · {completion.completed}/{completion.total}{' '}
          {t('milestones')}
        </span>
      </div>

      <section className="section dashboard-grid">
        <div>
          <h2 className="section-title">{t('missionRoute')}</h2>
          <div className="track">
            {state.missions.map((mission) => (
              <a className="track-row" href={`/mission/${mission.id}`} key={mission.id}>
                <span className="track-index">{mission.id.replace('mission-', 'M')}</span>
                <div className="track-main">
                  <div className="track-title">{mission.title}</div>
                  <div className="track-meta">{mission.skillTargets.join(' · ')}</div>
                </div>
                <StatusDot status={mission.status} />
              </a>
            ))}
            <a className="track-row" href={`/boss/${state.boss.id}`}>
              <span className="track-index">{t('bossLabel')}</span>
              <div className="track-main">
                <div className="track-title">{state.boss.title}</div>
                <div className="track-meta">{t('bossSubmitMeta')}</div>
              </div>
              <StatusDot status={state.boss.status} />
            </a>
            <a className="track-row" href={`/transfer/${state.transfer.id}`}>
              <span className="track-index">{t('transferLabel')}</span>
              <div className="track-main">
                <div className="track-title">{state.transfer.title}</div>
                <div className="track-meta">{t('transferMeta')}</div>
              </div>
              <StatusDot status={state.transfer.status} />
            </a>
          </div>
        </div>

        <div>
          <h2 className="section-title">{t('skills')}</h2>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Level</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {state.skills.map((skill) => (
                  <tr key={skill.id}>
                    <td>
                      <code>{skill.id}</code>
                    </td>
                    <td>L{skill.level}</td>
                    <td>{Math.round(skill.confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="section-title section-spaced">
            {t('recentEvidence')}
          </h2>
          {state.evidence.length > 0 ? (
            <ul className="list">
              {state.evidence.map((evidence) => (
                <li key={evidence.id}>
                  <strong>{evidence.task}</strong> · {evidence.skill} ·{' '}
                  {evidence.result === 'pass' ? 'PASS' : 'FAIL'}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              {t('emptyEvidence')}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
