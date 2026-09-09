import { AppShell } from '@/components/app-shell'
import { ProgressPage } from '@/components/progress-page'
import { playerState } from '@/lib/player-data'

export default function ProgressRoute() {
  return (
    <AppShell>
      <ProgressPage state={playerState} />
    </AppShell>
  )
}
