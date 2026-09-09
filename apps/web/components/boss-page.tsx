import type { BossSummary } from '@/lib/player-data'

import { StatusDot } from './status-dot'

export function BossPage({ boss }: { boss: BossSummary }) {
  const isLocked = boss.status === 'locked'

  return (
    <>
      <p className="crumb">
        <a href="/missions">Missions</a>
        <span aria-hidden="true"> / </span>
        BOSS
      </p>

      <div className="page-head">
        <div>
          <p className="eyebrow">Boss · 验收</p>
          <h1>{boss.title}</h1>
          <p className="page-sub">{boss.description}</p>
        </div>
        <div className="page-actions">
          <StatusDot status={boss.status} />
          <button className="btn" type="button" disabled={isLocked}>
            Submit
          </button>
        </div>
      </div>

      <section className="section boss-grid">
        <div>
          <h2 className="section-title">Available Tools</h2>
          <ul className="list">
            {boss.tools.map((tool) => (
              <li key={tool}>
                <code>{tool}</code>
              </li>
            ))}
          </ul>

          <h2 className="section-title section-spaced">Constraints</h2>
          <ul className="list">
            {boss.constraints.map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>

          <h2 className="section-title section-spaced">Public Tests</h2>
          <ul className="list">
            {boss.publicTests.map((test) => (
              <li key={test.id}>{test.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="section-title">Test Result</h2>
          <div className="empty">
            先运行本地公开测试，再把结果粘贴到这里。
          </div>

          <h2 className="section-title section-spaced">Explanation</h2>
          <textarea
            className="code-editor"
            aria-label="结构化解释"
            defaultValue="请用结构化问答说明：1) 你如何选择工具；2) 如何处理参数错误；3) 如何避免无限循环。"
          />
          <div className="hint-box">Hidden Tests 永远不会显示在页面上。</div>

          {isLocked && (
            <p className="mission-note">
              先完成 Mission 04，Boss 才会开放提交。
            </p>
          )}
        </div>
      </section>
    </>
  )
}
