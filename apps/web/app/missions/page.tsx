import { AppShell } from '@/components/app-shell'
import { MissionsPage } from '@/components/missions-page'
import { loadPlayerStateView } from '@/lib/server-data'

export const dynamic = 'force-dynamic'

export default async function MissionsRoute() {
  const state = await loadPlayerStateView()

  return (
    <AppShell>
      <MissionsPage state={state} />
    </AppShell>
  )
}
