import type { PlayerState } from '@/lib/player-data'

export function ProgressPage({ state }: { state: PlayerState }) {
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Progress</p>
          <h1>Progress</h1>
          <p className="page-sub">
            技能等级由 Evidence 推导，不因单一任务完成而跳级。
          </p>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">Skills</h2>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Level</th>
                <th>Confidence</th>
                <th>Strength</th>
                <th>Weakness</th>
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
                  <td>{skill.strengths.join('、') || '—'}</td>
                  <td>{skill.weaknesses.join('、') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Evidence</h2>
        {state.evidence.length > 0 ? (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Skill</th>
                  <th>Task</th>
                  <th>Result</th>
                  <th>Attempts</th>
                  <th>Hints</th>
                </tr>
              </thead>
              <tbody>
                {state.evidence.map((evidence) => (
                  <tr key={evidence.id}>
                    <td>{evidence.id}</td>
                    <td>
                      <code>{evidence.skill}</code>
                    </td>
                    <td>{evidence.task}</td>
                    <td>{evidence.result}</td>
                    <td>{evidence.attempts}</td>
                    <td>{evidence.hints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            完成第一个 Challenge 后，这里会出现证据。
          </div>
        )}
      </section>
    </>
  )
}
