import { AppShell } from '@/components/app-shell'
import { TransferPage } from '@/components/transfer-page'
import { playerState } from '@/lib/player-data'
import { notFound } from 'next/navigation'

type TransferRouteProps = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return [{ id: playerState.transfer.id }]
}

export default async function TransferRoute({
  params
}: TransferRouteProps) {
  const { id } = await params

  if (id !== playerState.transfer.id) {
    notFound()
  }

  return (
    <AppShell>
      <TransferPage transfer={playerState.transfer} />
    </AppShell>
  )
}
