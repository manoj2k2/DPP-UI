import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Check, CircleAlert, Globe2, MapPin, Plus, Settings2, ShieldCheck, Users, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getApiItems, tenantApi, type TenantRequest, type TenantSettingRequest } from '../api/client'
import { useAppStore } from '../store/useAppStore'
import './tenant-management.css'

type TenantRecord = Record<string, unknown>
type SettingRecord = Record<string, unknown>

const emptyTenant: TenantRequest = { name: '', domain: '', address: '' }

function tenantId(tenant: TenantRecord) {
  const id = tenant.id ?? tenant.tenantId
  return typeof id === 'string' ? id : ''
}

function tenantName(tenant: TenantRecord) {
  return String(tenant.name ?? tenant.tenantName ?? 'Unnamed tenant')
}

function normalizeSettings(response: unknown): SettingRecord[] {
  if (Array.isArray(response)) return response.filter(isRecord)
  if (!isRecord(response)) return []
  for (const key of ['value', 'items', 'data']) {
    if (Array.isArray(response[key])) return (response[key] as unknown[]).filter(isRecord)
  }
  if (typeof response.key === 'string') return [response]
  return Object.entries(response).map(([key, value]) => ({ key, value }))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

export function TenantManagementPage() {
  const queryClient = useQueryClient()
  const { activeTenantId, setActiveTenant } = useAppStore()
  const [tenantFormOpen, setTenantFormOpen] = useState(false)
  const [tenantForm, setTenantForm] = useState<TenantRequest>(emptyTenant)
  const [tenantError, setTenantError] = useState('')
  const [settingForm, setSettingForm] = useState({ key: '', value: '' })
  const [settingError, setSettingError] = useState('')
  const tenantQuery = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => getApiItems((await tenantApi.list()).data),
  })
  const tenants = tenantQuery.data ?? []
  const activeTenant = tenants.find((tenant) => tenantId(tenant) === activeTenantId)
  const settingsQuery = useQuery({
    queryKey: ['tenant-settings', activeTenantId],
    queryFn: async () => (await tenantApi.settings(activeTenantId)).data,
    enabled: Boolean(activeTenantId),
  })
  const settings = useMemo(() => normalizeSettings(settingsQuery.data), [settingsQuery.data])
  const tenantMutation = useMutation({
    mutationFn: (payload: TenantRequest) => tenantApi.create(payload),
    onSuccess: async (response) => {
      const created = isRecord(response.data) ? response.data : {}
      const id = tenantId(created)
      if (id) setActiveTenant(id, tenantName(created))
      setTenantFormOpen(false)
      setTenantForm(emptyTenant)
      setTenantError('')
      await queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: () => setTenantError('The tenant could not be created. Check the tenant details and try again.'),
  })
  const settingMutation = useMutation({
    mutationFn: (payload: TenantSettingRequest) => tenantApi.saveSetting(activeTenantId, payload),
    onSuccess: async () => {
      setSettingForm({ key: '', value: '' })
      setSettingError('')
      await queryClient.invalidateQueries({ queryKey: ['tenant-settings', activeTenantId] })
    },
    onError: () => setSettingError('The tenant setting could not be saved. Check the key and value, then try again.'),
  })

  function submitTenant(event: FormEvent) {
    event.preventDefault()
    const name = tenantForm.name.trim()
    if (!name) {
      setTenantError('Tenant name is required.')
      return
    }
    tenantMutation.mutate({
      name,
      domain: tenantForm.domain?.trim() || undefined,
      address: tenantForm.address?.trim() || undefined,
    })
  }

  function submitSetting(event: FormEvent) {
    event.preventDefault()
    const key = settingForm.key.trim()
    if (!activeTenantId || !key) {
      setSettingError('Select a tenant and provide a setting key.')
      return
    }
    settingMutation.mutate({ tenantId: activeTenantId, key, value: settingForm.value.trim() })
  }

  return (
    <div className="page tenant-management-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PLATFORM ADMINISTRATION</span>
          <h1>Tenant management</h1>
          <p>Manage customer workspaces, tenant-scoped settings, and workspace access.</p>
        </div>
        <div className="heading-actions">
          <Link className="button secondary" to="/settings"><Users size={16} />Manage access</Link>
          <button className="button primary" onClick={() => { setTenantError(''); setTenantFormOpen(true) }}><Plus size={16} />Create tenant</button>
        </div>
      </div>

      <section className="tenant-summary-grid" aria-label="Tenant overview">
        <article className="panel tenant-summary-card"><span className="tenant-summary-icon"><Building2 size={18} /></span><div><span>Accessible tenants</span><strong>{tenantQuery.isLoading ? '—' : tenants.length}</strong></div></article>
        <article className="panel tenant-summary-card"><span className="tenant-summary-icon blue"><Users size={18} /></span><div><span>Selected workspace</span><strong>{activeTenant ? tenantName(activeTenant) : 'None selected'}</strong></div></article>
        <article className="panel tenant-summary-card"><span className="tenant-summary-icon amber"><ShieldCheck size={18} /></span><div><span>Configuration scope</span><strong>{activeTenant ? 'Tenant-scoped' : 'Select a tenant'}</strong></div></article>
      </section>

      {tenantQuery.isError && <div className="tenant-error" role="alert"><CircleAlert size={17} />Tenant workspaces could not be loaded. Check your access and try again.</div>}

      <div className="tenant-management-grid">
        <section className="panel tenant-list-panel">
          <div className="tenant-section-heading"><div><span className="eyebrow">CUSTOMER WORKSPACES</span><h2>Tenants</h2><p>Tenant data and configuration are kept in their own workspace scope.</p></div><span className="tenant-count">{tenants.length}</span></div>
          {tenantQuery.isLoading && <p className="tenant-query-state">Loading tenant workspaces...</p>}
          {!tenantQuery.isLoading && !tenantQuery.isError && tenants.length === 0 && <div className="tenant-empty"><Building2 size={23} /><strong>No tenants available</strong><span>Create a tenant to set up an isolated customer workspace.</span></div>}
          <div className="tenant-list">
            {tenants.map((tenant, index) => {
              const id = tenantId(tenant)
              const selected = id === activeTenantId
              return (
                <button className={`tenant-row${selected ? ' selected' : ''}`} key={id || index} onClick={() => id && setActiveTenant(id, tenantName(tenant))} disabled={!id} aria-pressed={selected}>
                  <span className="tenant-avatar">{tenantName(tenant).slice(0, 1).toUpperCase()}</span>
                  <span className="tenant-row-copy"><strong>{tenantName(tenant)}</strong><small>{String(tenant.domain ?? 'No domain configured')}</small></span>
                  {selected && <Check size={17} aria-label="Selected workspace" />}
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel tenant-settings-panel">
          <div className="tenant-section-heading">
            <div><span className="eyebrow">WORKSPACE CONFIGURATION</span><h2>{activeTenant ? tenantName(activeTenant) : 'Select a tenant'}</h2><p>Settings are fetched and saved for the selected tenant only.</p></div>
            <Settings2 size={19} className="tenant-heading-icon" />
          </div>
          {!activeTenant && <div className="tenant-empty compact"><Globe2 size={22} /><span>Choose an accessible tenant to view its profile and settings.</span></div>}
          {activeTenant && (
            <>
              <dl className="tenant-profile">
                <div><dt><Globe2 size={14} />Domain</dt><dd>{displayValue(activeTenant.domain)}</dd></div>
                <div><dt><MapPin size={14} />Address</dt><dd>{displayValue(activeTenant.address)}</dd></div>
                <div><dt><ShieldCheck size={14} />Tenant ID</dt><dd>{activeTenantId}</dd></div>
              </dl>
              <div className="tenant-settings-heading"><h3>Tenant settings</h3><span>{settings.length} configured</span></div>
              {settingsQuery.isLoading && <p className="tenant-query-state">Loading tenant settings...</p>}
              {settingsQuery.isError && <p className="form-error" role="alert">Tenant settings could not be loaded. Confirm the tenant ID and permissions.</p>}
              {settingsQuery.isSuccess && settings.length === 0 && <p className="tenant-empty-settings">No settings are configured for this tenant yet.</p>}
              {settings.length > 0 && <div className="tenant-setting-list">{settings.map((setting, index) => <div className="tenant-setting-row" key={String(setting.id ?? setting.key ?? index)}><strong>{displayValue(setting.key ?? setting.name)}</strong><span>{displayValue(setting.value)}</span></div>)}</div>}
              <form className="tenant-setting-form" onSubmit={submitSetting}>
                <label>Setting key<input required value={settingForm.key} onChange={(event) => setSettingForm((current) => ({ ...current, key: event.target.value }))} placeholder="branding.primaryColor" /></label>
                <label>Value<input value={settingForm.value} onChange={(event) => setSettingForm((current) => ({ ...current, value: event.target.value }))} placeholder="Setting value" /></label>
                {settingError && <p className="form-error" role="alert">{settingError}</p>}
                <button className="button secondary" type="submit" disabled={settingMutation.isPending}>{settingMutation.isPending ? 'Saving...' : 'Save tenant setting'}</button>
              </form>
              <p className="tenant-scope-note"><ShieldCheck size={14} />Tenant configuration can support workspace-specific branding, profiles, and API settings.</p>
            </>
          )}
        </section>
      </div>

      {tenantFormOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setTenantFormOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-tenant-title">
            <div className="modal-header"><div><span className="eyebrow">CUSTOMER WORKSPACE</span><h2 id="create-tenant-title">Create tenant</h2></div><button className="icon-button" title="Close" onClick={() => setTenantFormOpen(false)}><X size={18} /></button></div>
            <form className="company-form" onSubmit={submitTenant}>
              <label>Tenant name<input required autoFocus value={tenantForm.name} onChange={(event) => setTenantForm((current) => ({ ...current, name: event.target.value }))} /></label>
              <label>Domain<input value={tenantForm.domain} onChange={(event) => setTenantForm((current) => ({ ...current, domain: event.target.value }))} placeholder="example.com" /></label>
              <label>Address<textarea value={tenantForm.address} onChange={(event) => setTenantForm((current) => ({ ...current, address: event.target.value }))} rows={3} /></label>
              <p className="tenant-scope-note"><ShieldCheck size={14} />Tenant identity is created through the tenant API. Users, products, operators, suppliers, and integrations remain tenant-scoped.</p>
              {tenantError && <p className="form-error" role="alert">{tenantError}</p>}
              <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setTenantFormOpen(false)}>Cancel</button><button type="submit" className="button primary" disabled={tenantMutation.isPending}>{tenantMutation.isPending ? 'Creating...' : 'Create tenant'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
