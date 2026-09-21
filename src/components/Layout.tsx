import { useState, type ElementType } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { navItems } from '../data'
import { useAppStore } from '../store/useAppStore'

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark, company, notifications, toggleTheme, setCompany, clearNotifications } = useAppStore()
  return <div className={dark ? 'app dark' : 'app'}>
    <aside className={mobileOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><div className="brand-mark">A</div><div><strong>ATLAS</strong><small>DPP COMMAND CENTER</small></div><button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)}><Icons.X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <select className="company-select" value={company} onChange={(event) => setCompany(event.target.value)}><option>Axiom Mobility</option><option>Northstar Motors</option></select>
      <nav>{navItems.map((item) => { const Icon = (Icons as unknown as Record<string, ElementType>)[item.icon]; return <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><Icon size={18} /><span>{item.label}</span>{item.label === 'Compliance' && <span className="nav-count">12</span>}</NavLink> })}</nav>
      <div className="sidebar-bottom"><NavLink to="/settings" className="nav-link"><Icons.Settings2 size={18} /><span>Settings</span></NavLink><div className="help-card"><div className="help-icon"><Icons.MessageCircle size={17} /></div><strong>Need a hand?</strong><p>Visit the Atlas resource hub.</p><button>Open resource hub <Icons.ArrowUpRight size={14} /></button></div><div className="user-mini"><div className="avatar">JD</div><div><strong>Jordan Davis</strong><span>Company admin</span></div><Icons.MoreHorizontal size={18} /></div></div>
    </aside>
    <main className="main"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)}><Icons.Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><Icons.ChevronRight size={14} /><strong>Overview</strong></div><div className="top-actions"><button className="icon-button" title="Toggle theme" onClick={toggleTheme}>{dark ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}</button><button className="icon-button notification-button" title="Notifications" onClick={clearNotifications}><Icons.Bell size={18} />{notifications > 0 && <i>{notifications}</i>}</button><div className="top-avatar">JD</div></div></header><section className="content"><Outlet /></section></main>
  </div>
}
