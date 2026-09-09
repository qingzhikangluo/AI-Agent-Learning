import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'AI Agent RPG',
  description: '训练 AI Agent 工程能力的游戏化学习平台'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
