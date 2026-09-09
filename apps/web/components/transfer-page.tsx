import type { TransferSummary } from '@/lib/player-data'

import { StatusDot } from './status-dot'

export function TransferPage({
  transfer
}: {
  transfer: TransferSummary
}) {
  return (
    <>
      <p className="crumb">
        <a href="/missions">Missions</a>
        <span aria-hidden="true"> / </span>
        TRN
      </p>

      <div className="page-head">
        <div>
          <p className="eyebrow">Transfer · 迁移</p>
          <h1>{transfer.title}</h1>
          <p className="page-sub">{transfer.description}</p>
        </div>
        <div className="page-actions">
          <StatusDot status={transfer.status} />
          <a className="btn" href="/progress">
            查看迁移证据
          </a>
        </div>
      </div>

      <section className="section transfer-grid">
        <div>
          <h2 className="section-title">Objectives · 迁移目标</h2>
          <ul className="list">
            {transfer.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
          <div className="hint-box">
            新场景，独立解决；不展示 Boss 实现，也不复用 Boss 的答案。
          </div>
        </div>

        <div>
          <h2 className="section-title">Available Tools</h2>
          <ul className="list">
            {transfer.tools.map((tool) => (
              <li key={tool}>
                <code>{tool}</code>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
