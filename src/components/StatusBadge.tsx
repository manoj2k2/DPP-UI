import type { Status } from '../models/types'

export function StatusBadge({ children }: { children: Status | string }) {
  const tone = children === 'Ready' || children === 'Generated' ? 'ready' : children === 'Needs attention' || children === 'Not started' ? 'attention' : children === 'In review' || children === 'Pending' ? 'review' : 'draft'
  return <span className={`status-badge ${tone}`}><span className="status-dot" />{children}</span>
}
