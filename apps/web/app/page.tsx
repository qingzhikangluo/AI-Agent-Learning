import { AppShell } from '@/components/app-shell'
import { Dashboard } from '@/components/dashboard'
import { loadPlayerStateView } from '@/lib/server-data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const state = await loadPlayerStateView()

  return (
    <AppShell>
      <Dashboard state={state} />
    </AppShell>
  )
}
