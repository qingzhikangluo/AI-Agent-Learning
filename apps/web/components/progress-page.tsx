'use client'

import type { PlayerState } from '@/lib/player-data'

import { useLanguage } from '@/lib/i18n'

export function ProgressPage({ state }: { state: PlayerState }) {
  const { t } = useLanguage()

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">{t('progressTitle')}</p>
          <h1>{t('progressTitle')}</h1>
          <p className="page-sub">{t('progressSub')}</p>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">{t('skillsTable')}</h2>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>{t('tableSkill')}</th>
                <th>{t('tableLevel')}</th>
                <th>{t('tableConfidence')}</th>
                <th>{t('tableStrength')}</th>
                <th>{t('tableWeakness')}</th>
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
        <h2 className="section-title">{t('evidenceTable')}</h2>
        {state.evidence.length > 0 ? (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>{t('tableId')}</th>
                  <th>{t('tableSkill')}</th>
                  <th>{t('tableTask')}</th>
                  <th>{t('tableResult')}</th>
                  <th>{t('tableAttempts')}</th>
                  <th>{t('tableHints')}</th>
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
                    <td>
                      {evidence.result === 'pass'
                        ? t('resultPass')
                        : t('resultFail')}
                    </td>
                    <td>{evidence.attempts}</td>
                    <td>{evidence.hints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">{t('emptyEvidence')}</div>
        )}
      </section>
    </>
  )
}
