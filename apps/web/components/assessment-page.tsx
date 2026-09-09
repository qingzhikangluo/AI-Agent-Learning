'use client'

import { useLanguage } from '@/lib/i18n'

const categories = [
  'Python',
  'API',
  'LLM',
  'Agent',
  'Debugging'
]

export function AssessmentPage() {
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
        <h2 className="section-title">{t('abilityStatus')}</h2>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>{t('ability')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>
                    <span className="status">
                      <span className="status-dot" aria-hidden="true" />
                      {t('pending')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
