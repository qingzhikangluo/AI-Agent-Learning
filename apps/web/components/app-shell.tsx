export function AppShell({ children }: { children: React.ReactNode }) {
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
          <a className="nav-item is-active" href="/">
            Dashboard
          </a>
          <span className="nav-item is-disabled" aria-disabled="true">
            Missions
          </span>
          <span className="nav-item is-disabled" aria-disabled="true">
            Progress
          </span>
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
