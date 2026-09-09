'use client'

import { usePathname } from 'next/navigation'

import { useLanguage } from '@/lib/i18n'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const isDashboard = pathname === '/'
  const isMissions = pathname === '/missions'
  const isProgress = pathname === '/progress'

  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            AR
          </span>
          <span className="brand-name">AI Agent RPG</span>
        </div>
        <nav className="nav" aria-label={t('mainNavigation')}>
          <a
            className={`nav-item${isDashboard ? ' is-active' : ''}`}
            href="/"
          >
            {t('navDashboard')}
          </a>
          <a
            className={`nav-item${isMissions ? ' is-active' : ''}`}
            href="/missions"
          >
            {t('navMissions')}
          </a>
          <a
            className={`nav-item${isProgress ? ' is-active' : ''}`}
            href="/progress"
          >
            {t('navProgress')}
          </a>
        </nav>
        <footer className="rail-footer">
          <div className="rail-status">
            <span className="status-dot is-active" aria-hidden="true" />
            {t('currentMission')} 02
          </div>
          <div className="rail-settings">
            <span className="rail-settings-label">{t('language')}</span>
            <div className="lang-switch" role="group" aria-label={t('language')}>
              <button
                type="button"
                className={language === 'zh' ? 'is-active' : ''}
                aria-pressed={language === 'zh'}
                onClick={() => setLanguage('zh')}
              >
                中文
              </button>
              <button
                type="button"
                className={language === 'en' ? 'is-active' : ''}
                aria-pressed={language === 'en'}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
            </div>
          </div>
        </footer>
      </aside>
      <main className="view">{children}</main>
    </div>
  )
}
