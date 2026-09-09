'use client'

import {
  missionProgress,
  type LearningBlockType,
  type MissionSummary
} from '@/lib/player-data'

import { useLanguage } from '@/lib/i18n'
import { StatusDot } from './status-dot'
import { ChallengeHint } from './challenge-hint'

export function MissionPage({ mission }: { mission: MissionSummary }) {
  const { t } = useLanguage()
  const progress = missionProgress(mission)
  const missionIndex = mission.id.replace('mission-', 'M')
  const learningTypeLabels: Record<LearningBlockType, string> = {
    concept: t('conceptTag'),
    example: t('exampleTag'),
    instruction: t('instructionTag')
  }
  const activeChallenge =
    mission.status === 'active'
      ? mission.challenges.find((challenge) => challenge.status === 'active')
      : undefined
  const challengeRows = mission.challenges.map((challenge) => {
    const isLocked =
      mission.status === 'locked' || challenge.status === 'locked'
    const content = (
      <>
        <span className="track-index">
          {challenge.type === 'concept' ? 'C' : 'CODE'}
        </span>
        <div className="track-main">
          <div className="track-title">{challenge.title}</div>
          <div className="track-meta">
            {challenge.type === 'concept'
              ? t('conceptChallenge')
              : t('codeChallenge')}
          </div>
        </div>
        <StatusDot status={challenge.status} />
      </>
    )

    return (
      <div className="challenge-node" key={challenge.id}>
        {isLocked ? (
          <div className="track-row">{content}</div>
        ) : (
          <a className="track-row" href={`/challenge/${challenge.id}`}>
            {content}
          </a>
        )}
        <ChallengeHint challengeId={challenge.id} />
      </div>
    )
  })

  return (
    <>
      <p className="crumb">
        <a href="/">{t('navDashboard')}</a>
        <span aria-hidden="true"> / </span>
        {missionIndex}
      </p>

      <div className="page-head">
        <div>
          <p className="eyebrow">{missionIndex} · Mission</p>
          <h1>{mission.title}</h1>
          <p className="page-sub">{mission.description}</p>
          <div className="skill-targets" aria-label={t('skillTargets')}>
            {mission.skillTargets.map((skill) => (
              <code key={skill}>{skill}</code>
            ))}
          </div>
        </div>
        <div className="page-actions">
          <StatusDot status={mission.status} />
          {activeChallenge && (
            <a
              className="btn"
              href={`/challenge/${activeChallenge.id}`}
            >
              {t('startCurrentChallenge')}
            </a>
          )}
        </div>
      </div>

      <div
        className={`route-progress mission-progress is-${mission.status}`}
      >
        <span className="route-progress-label">
          {t('missionProgress')}
        </span>
        <div
          className="route-progress-track"
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${t('missionProgress')} ${progress.percent}%`}
        >
          <div
            className="route-progress-fill"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <span className="route-progress-value">
          {progress.completed}/{progress.total} · {progress.percent}%
        </span>
      </div>

      <section className="section mission-grid">
        <div>
          <h2 className="section-title">{t('objectives')}</h2>
          <ol className="objective-list">
            {mission.objectives.map((objective, index) => (
              <li key={objective}>
                <span className="objective-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{objective}</span>
              </li>
            ))}
          </ol>

          <h2 className="section-title section-spaced">
            {t('learningBlocks')}
          </h2>
          <div className="learning-list">
            {mission.learningBlocks.map((block) => (
              <div className="learning-block" key={block.id}>
                <div className="learning-block-head">
                  <span className="tag">
                    {learningTypeLabels[block.type]}
                  </span>
                  <h3>{block.title}</h3>
                </div>
                <p>{block.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="section-title">{t('challenges')}</h2>
          <div className="track">{challengeRows}</div>

          {mission.status === 'locked' && (
            <p className="mission-note">
              {t('lockedMissionNote')}
            </p>
          )}
        </div>
      </section>
    </>
  )
}
