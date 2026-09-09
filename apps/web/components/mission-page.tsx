import {
  missionProgress,
  type LearningBlockType,
  type MissionSummary
} from '@/lib/player-data'

import { StatusDot } from './status-dot'

const learningTypeLabels: Record<LearningBlockType, string> = {
  concept: 'Concept',
  example: 'Example',
  instruction: 'Instruction'
}

export function MissionPage({ mission }: { mission: MissionSummary }) {
  const progress = missionProgress(mission)
  const missionIndex = mission.id.replace('mission-', 'M')

  return (
    <>
      <p className="crumb">
        <a href="/">Dashboard</a>
        <span aria-hidden="true"> / </span>
        {missionIndex}
      </p>

      <div className="page-head">
        <div>
          <p className="eyebrow">{missionIndex} · Mission</p>
          <h1>{mission.title}</h1>
          <p className="page-sub">{mission.description}</p>
          <div className="skill-targets" aria-label="技能目标">
            {mission.skillTargets.map((skill) => (
              <code key={skill}>{skill}</code>
            ))}
          </div>
        </div>
        <div className="page-actions">
          <StatusDot status={mission.status} />
        </div>
      </div>

      <div
        className={`route-progress mission-progress is-${mission.status}`}
      >
        <span className="route-progress-label">Mission Progress</span>
        <div
          className="route-progress-track"
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Mission 进度 ${progress.percent}%`}
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
          <h2 className="section-title">Objectives · 目标</h2>
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
            Learning Blocks · 学习块
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
          <h2 className="section-title">Challenges · 挑战列表</h2>
          <div className="track">
            {mission.challenges.map((challenge) => (
              <div className="track-row" key={challenge.id}>
                <span className="track-index">
                  {challenge.type === 'concept' ? 'C' : 'CODE'}
                </span>
                <div className="track-main">
                  <div className="track-title">{challenge.title}</div>
                  <div className="track-meta">
                    {challenge.type === 'concept'
                      ? 'Concept Challenge'
                      : 'Code Challenge'}
                  </div>
                </div>
                <StatusDot status={challenge.status} />
              </div>
            ))}
          </div>

          {mission.status === 'locked' && (
            <p className="mission-note">
              此 Mission 需要先通过前置 Mission，完成后自动解锁。
            </p>
          )}
        </div>
      </section>
    </>
  )
}
