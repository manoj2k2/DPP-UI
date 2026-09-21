import { ArrowUpRight } from 'lucide-react'
export function SectionHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: string }) { return <div className="section-header"> <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action && <button className="text-button">{action}<ArrowUpRight size={15} /></button>}</div> }
