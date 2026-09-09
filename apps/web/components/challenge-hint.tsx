'use client'

import { useState } from 'react'

import {
  getChallengeDetail,
  getChallengeHint
} from '@/lib/challenge-data'

export function ChallengeHint({
  challengeId
}: {
  challengeId: string
}) {
  const [open, setOpen] = useState(false)
  const challenge = getChallengeDetail(challengeId)
  const hint = getChallengeHint(challengeId)

  if (!challenge || !hint) return null

  const label = open
    ? '收起示例'
    : challenge.type === 'code'
      ? '提示 · 显示示例代码'
      : '提示 · 显示示例答案'

  return (
    <div className="challenge-node-hint">
      <button
        className="hint-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={`hint-${challenge.id}`}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open && (
        <div
          className="hint-sample"
          id={`hint-${challenge.id}`}
        >
          <p>{hint.hintText}</p>
          <pre>
            <code>{hint.exampleCode}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
