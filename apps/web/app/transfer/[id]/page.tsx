import { AppShell } from '@/components/app-shell'
import { TransferPage } from '@/components/transfer-page'
import { loadTransferView } from '@/lib/server-data'
import { notFound } from 'next/navigation'

type TransferRouteProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function TransferRoute({
  params
}: TransferRouteProps) {
  const { id } = await params
  const transfer = await loadTransferView(id)

  if (!transfer) {
    notFound()
  }

  return (
    <AppShell>
      <TransferPage transfer={transfer} />
    </AppShell>
  )
}
