import { AppShell } from '@/components/app-shell'
import { MissionsPage } from '@/components/missions-page'
import { playerState } from '@/lib/player-data'

export default function MissionsRoute() {
  return (
    <AppShell>
      <MissionsPage state={playerState} />
    </AppShell>
  )
}
