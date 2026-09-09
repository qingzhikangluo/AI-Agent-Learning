'use client'

import { routeCompletion, type PlayerState } from '@/lib/player-data'

import { useLanguage } from '@/lib/i18n'
import { StatusDot } from './status-dot'

export function MissionsPage({ state }: { state: PlayerState }) {
  const { t } = useLanguage()
  const completion = routeCompletion(state)

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Mission Map</p>
          <h1>{t('missionsTitle')}</h1>
          <p className="page-sub">{t('missionsSub')}</p>
        </div>
      </div>

      <div className="route-progress">
        <span className="route-progress-label">
          {t('routeCompletion')}
        </span>
        <div
          className="route-progress-track"
          role="progressbar"
          aria-valuenow={completion.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="route-progress-fill"
            style={{ width: `${completion.percent}%` }}
          />
        </div>
        <span className="route-progress-value">
          {completion.percent}% · {completion.completed}/{completion.total}{' '}
          {t('milestones')}
        </span>
      </div>

      <section className="section">
        <h2 className="section-title">{t('missionsSection')}</h2>
        <div className="track">
          {state.missions.map((mission) => (
            <a
              className="track-row"
              href={`/mission/${mission.id}`}
              key={mission.id}
            >
              <span className="track-index">
                {mission.id.replace('mission-', 'M')}
              </span>
              <div className="track-main">
                <div className="track-title">{mission.title}</div>
                <div className="track-meta">{mission.description}</div>
              </div>
              <StatusDot status={mission.status} />
            </a>
          ))}
        </div>

        <h2 className="section-title section-spaced">
          {t('finalMilestones')}
        </h2>
        <div className="track">
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
      </section>
    </>
  )
}
