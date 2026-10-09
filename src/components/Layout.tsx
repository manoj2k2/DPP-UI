import { useState, type ElementType } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { navItems } from '../data'
import { useAppStore } from '../store/useAppStore'
import { getApiItems, tenantApi } from '../api/client'
import { useQuery } from '@tanstack/react-query'

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark, activeTenantId, activeTenantName, notifications, toggleTheme, setActiveTenant, clearNotifications } = useAppStore()
  const tenantsQuery = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => getApiItems((await tenantApi.list()).data),
  })
  return <div className={dark ? 'app dark' : 'app'}>
    <aside className={mobileOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><div className="brand-mark">A</div><div><strong>ATLAS</strong><small>DPP COMMAND CENTER</small></div><button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)}><Icons.X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <label className="workspace-label" htmlFor="active-tenant">ACTIVE TENANT</label>
      <select id="active-tenant" className="company-select" value={activeTenantId} onChange={(event) => { if (!event.target.value) { setActiveTenant('', ''); return } const tenant = tenantsQuery.data?.find((item) => String(item.id ?? item.tenantId ?? '') === event.target.value); if (tenant) setActiveTenant(String(tenant.id ?? tenant.tenantId), String(tenant.name ?? tenant.tenantName ?? 'Tenant workspace')) }}><option value="">{tenantsQuery.isError ? 'Tenant list unavailable' : tenantsQuery.isLoading ? 'Loading tenants...' : 'Select a tenant'}</option>{activeTenantId && !tenantsQuery.data?.some((tenant) => String(tenant.id ?? tenant.tenantId ?? '') === activeTenantId) && <option value={activeTenantId}>{activeTenantName}</option>}{tenantsQuery.data?.map((tenant, index) => { const id = String(tenant.id ?? tenant.tenantId ?? ''); return id ? <option key={id} value={id}>{String(tenant.name ?? tenant.tenantName ?? `Tenant ${index + 1}`)}</option> : null })}</select>
      <nav>{navItems.map((item) => { const Icon = (Icons as unknown as Record<string, ElementType>)[item.icon]; return <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><Icon size={18} /><span>{item.label}</span>{item.label === 'Compliance' && <span className="nav-count">12</span>}</NavLink> })}</nav>
      <div className="sidebar-bottom"><NavLink to="/settings" className="nav-link"><Icons.Settings2 size={18} /><span>Settings</span></NavLink><div className="help-card"><div className="help-icon"><Icons.MessageCircle size={17} /></div><strong>Need a hand?</strong><p>Visit the Atlas resource hub.</p><Link to="/help">Open resource hub <Icons.ArrowUpRight size={14} /></Link></div><div className="user-mini"><div className="avatar">JD</div><div><strong>Jordan Davis</strong><span>Company admin</span></div><Icons.MoreHorizontal size={18} /></div></div>
    </aside>
    <main className="main"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)}><Icons.Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><Icons.ChevronRight size={14} /><strong>Overview</strong></div><div className="top-actions"><button className="icon-button" title="Toggle theme" onClick={toggleTheme}>{dark ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}</button><button className="icon-button notification-button" title="Notifications" onClick={clearNotifications}><Icons.Bell size={18} />{notifications > 0 && <i>{notifications}</i>}</button><div className="top-avatar">JD</div></div></header><section className="content"><Outlet /></section></main>
  </div>
}
