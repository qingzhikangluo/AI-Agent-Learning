import { routeCompletion, type PlayerState } from '@/lib/player-data'

import { StatusDot } from './status-dot'

export function MissionsPage({ state }: { state: PlayerState }) {
  const completion = routeCompletion(state)

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Mission Map</p>
          <h1>Missions</h1>
          <p className="page-sub">
            按路线推进：概念 → 代码 → Boss → Transfer。
          </p>
        </div>
      </div>

      <div className="route-progress">
        <span className="route-progress-label">路线完成度</span>
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
          里程碑
        </span>
      </div>

      <section className="section">
        <h2 className="section-title">Missions</h2>
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

        <h2 className="section-title section-spaced">Final Milestones</h2>
        <div className="track">
          <a className="track-row" href={`/boss/${state.boss.id}`}>
            <span className="track-index">BOSS</span>
            <div className="track-main">
              <div className="track-title">{state.boss.title}</div>
              <div className="track-meta">公开测试通过后提交</div>
            </div>
            <StatusDot status={state.boss.status} />
          </a>
          <a className="track-row" href={`/transfer/${state.transfer.id}`}>
            <span className="track-index">TRN</span>
            <div className="track-main">
              <div className="track-title">{state.transfer.title}</div>
              <div className="track-meta">新场景独立完成</div>
            </div>
            <StatusDot status={state.transfer.status} />
          </a>
        </div>
      </section>
    </>
  )
}
