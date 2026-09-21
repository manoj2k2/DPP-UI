import type { LucideIcon } from 'lucide-react'

export function KpiCard({ label, value, change, icon: Icon, tone }: { label: string; value: string; change: string; icon: LucideIcon; tone: string }) { return <article className="kpi-card"><div className={`kpi-icon ${tone}`}><Icon size={19} /></div><div className="kpi-meta"><span>{label}</span><strong>{value}</strong><small className={change.startsWith('+') ? 'positive' : change.includes('attention') ? 'warning' : ''}>{change}</small></div></article> }
