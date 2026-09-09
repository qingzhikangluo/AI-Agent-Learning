import { AppShell } from '@/components/app-shell'
import { Dashboard } from '@/components/dashboard'
import { playerState } from '@/lib/player-data'

export default function Home() {
  return (
    <AppShell>
      <Dashboard state={playerState} />
    </AppShell>
  )
}
