'use client'

import type { TransferSummary } from '@/lib/player-data'

import { useLanguage } from '@/lib/i18n'
import { StatusDot } from './status-dot'

export function TransferPage({
  transfer
}: {
  transfer: TransferSummary
}) {
  const { t } = useLanguage()

  return (
    <>
      <p className="crumb">
        <a href="/missions">{t('navMissions')}</a>
        <span aria-hidden="true"> / </span>
        TRN
      </p>

      <div className="page-head">
        <div>
          <p className="eyebrow">{t('transferEyebrow')}</p>
          <h1>{transfer.title}</h1>
          <p className="page-sub">{transfer.description}</p>
        </div>
        <div className="page-actions">
          <StatusDot status={transfer.status} />
          <a className="btn" href="/progress">
            {t('viewTransferEvidence')}
          </a>
        </div>
      </div>

      <section className="section transfer-grid">
        <div>
          <h2 className="section-title">{t('transferObjectives')}</h2>
          <ul className="list">
            {transfer.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
          <div className="hint-box">
            {t('transferIndependentNote')}
          </div>
        </div>

        <div>
          <h2 className="section-title">{t('availableTools')}</h2>
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
