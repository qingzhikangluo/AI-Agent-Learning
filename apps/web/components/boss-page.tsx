'use client'

import type { BossSummary } from '@/lib/player-data'

import { useLanguage } from '@/lib/i18n'
import { StatusDot } from './status-dot'

export function BossPage({ boss }: { boss: BossSummary }) {
  const { t } = useLanguage()
  const isLocked = boss.status === 'locked'

  return (
    <>
      <p className="crumb">
        <a href="/missions">{t('navMissions')}</a>
        <span aria-hidden="true"> / </span>
        BOSS
      </p>

      <div className="page-head">
        <div>
          <p className="eyebrow">{t('bossEyebrow')}</p>
          <h1>{boss.title}</h1>
          <p className="page-sub">{boss.description}</p>
        </div>
        <div className="page-actions">
          <StatusDot status={boss.status} />
          <button className="btn" type="button" disabled={isLocked}>
            {t('submit')}
          </button>
        </div>
      </div>

      <section className="section boss-grid">
        <div>
          <h2 className="section-title">{t('availableTools')}</h2>
          <ul className="list">
            {boss.tools.map((tool) => (
              <li key={tool}>
                <code>{tool}</code>
              </li>
            ))}
          </ul>

          <h2 className="section-title section-spaced">
            {t('constraints')}
          </h2>
          <ul className="list">
            {boss.constraints.map((constraint) => (
              <li key={constraint}>{constraint}</li>
            ))}
          </ul>

          <h2 className="section-title section-spaced">
            {t('publicTests')}
          </h2>
          <ul className="list">
            {boss.publicTests.map((test) => (
              <li key={test.id}>{test.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="section-title">{t('testResult')}</h2>
          <div className="empty">{t('emptyTestResult')}</div>

          <h2 className="section-title section-spaced">
            {t('explanation')}
          </h2>
          <textarea
            className="code-editor"
            aria-label={t('explanation')}
            defaultValue={t('explanationPlaceholder')}
          />
          <div className="hint-box">{t('hiddenTestsNote')}</div>

          {isLocked && (
            <p className="mission-note">
              {t('bossLockedNote')}
            </p>
          )}
        </div>
      </section>
    </>
  )
}
