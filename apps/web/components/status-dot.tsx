type Status = 'passed' | 'active' | 'failed' | 'hint' | 'locked'

const statusText: Record<Status, string> = {
  passed: 'Passed',
  active: 'In Progress',
  failed: 'Failed',
  hint: 'Guided',
  locked: 'Locked'
}

export function StatusDot({ status }: { status: Status }) {
  return (
    <span className="status">
      <span className={`status-dot is-${status}`} aria-hidden="true" />
      {statusText[status]}
    </span>
  )
}
