import { routeCompletion } from '@/lib/player-data'
import type { PlayerState } from '@/lib/player-data'

import { StatusDot } from './status-dot'

export function Dashboard({ state }: { state: PlayerState }) {
  const completion = routeCompletion(state)

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Mission Control</p>
          <h1>当前任务与证据</h1>
          <p className="page-sub">
            从真实构建任务开始，用确定性测试证明你的 AI Agent 能力。
          </p>
        </div>
        <a className="btn" href={`/mission/${state.currentMissionId}`}>
          进入当前任务
        </a>
      </div>

      <div className="route-progress">
        <span className="route-progress-label">路线完成度</span>
        <div className="route-progress-track" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="route-progress-fill" style={{ width: `${completion.percent}%` }} />
        </div>
        <span className="route-progress-value">
          {completion.percent}% · {completion.completed}/{completion.total} 里程碑
        </span>
      </div>

      <section className="section dashboard-grid">
        <div>
          <h2 className="section-title">任务路线</h2>
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
            <div className="track-row">
              <span className="track-index">BOSS</span>
              <div className="track-main">
                <div className="track-title">Internal Employee Assistant</div>
                <div className="track-meta">公开测试通过后提交</div>
              </div>
              <StatusDot status="locked" />
            </div>
            <div className="track-row">
              <span className="track-index">TRN</span>
              <div className="track-main">
                <div className="track-title">Travel Expense Assistant</div>
                <div className="track-meta">新场景独立完成</div>
              </div>
              <StatusDot status="locked" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="section-title">技能</h2>
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

          <h2 className="section-title section-spaced">最近 Evidence</h2>
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
              完成第一个 Challenge 后，这里会出现证据。
            </div>
          )}
        </div>
      </section>
    </>
  )
}
