import { AppShell } from '@/components/app-shell'
import { ProgressPage } from '@/components/progress-page'
import { loadPlayerStateView } from '@/lib/server-data'

export const dynamic = 'force-dynamic'

export default async function ProgressRoute() {
  const state = await loadPlayerStateView()

  return (
    <AppShell>
      <ProgressPage state={state} />
    </AppShell>
  )
}
