'use client'

import { usePathname } from 'next/navigation'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
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
        <nav className="nav" aria-label="主导航">
          <a
            className={`nav-item${isDashboard ? ' is-active' : ''}`}
            href="/"
          >
            Dashboard
          </a>
          <a
            className={`nav-item${isMissions ? ' is-active' : ''}`}
            href="/missions"
          >
            Missions
          </a>
          <a
            className={`nav-item${isProgress ? ' is-active' : ''}`}
            href="/progress"
          >
            Progress
          </a>
        </nav>
        <div className="rail-status">
          <span className="status-dot is-active" aria-hidden="true" />
          MISSION 02
        </div>
      </aside>
      <main className="view">{children}</main>
    </div>
  )
}
