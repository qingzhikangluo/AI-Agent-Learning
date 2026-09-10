'use client'

import { useLanguage } from '@/lib/i18n'
import type { SkillSummary } from '@/lib/player-data'

export function AssessmentPage({ skills }: { skills: SkillSummary[] }) {
  const { t } = useLanguage()

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">{t('assessmentTitle')}</p>
          <h1>{t('assessmentTitle')}</h1>
          <p className="page-sub">{t('assessmentSub')}</p>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">{t('skillDashboard')}</h2>
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
              {skills.map((skill) => (
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
    </>
  )
}
