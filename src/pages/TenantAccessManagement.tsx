import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Plus, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { getApiItems, roleApi, tenantApi, type AssignRoleRequest, type TenantUserRequest } from '../api/client'
import { useAppStore } from '../store/useAppStore'
import './tenant-access.css'

type RecordValue = Record<string, unknown>

const emptyUser: Omit<TenantUserRequest, 'companyId'> = { firstName: '', lastName: '', email: '', password: '' }

function recordId(record: RecordValue) {
  const id = record.id ?? record.userId ?? record.roleId
  return typeof id === 'string' ? id : ''
}

function roleLabel(role: RecordValue) {
  return String(role.name ?? role.roleName ?? role.displayName ?? 'Unnamed role')
}

function memberName(member: RecordValue) {
  const fullName = [member.firstName, member.lastName].filter((part) => typeof part === 'string' && part.trim()).join(' ')
  return fullName || String(member.name ?? member.userName ?? member.email ?? 'Workspace member')
}

function memberRoles(member: RecordValue, knownRoles: RecordValue[]) {
  const value = member.roles ?? member.role ?? member.roleName
  const roles = Array.isArray(value) ? value : value ? [value] : []
  return roles.map((role) => {
    if (typeof role === 'string') return { id: role, name: role }
    if (typeof role !== 'object' || role === null) return undefined
    const record = role as RecordValue
    const id = recordId(record)
    const name = roleLabel(record)
    const known = knownRoles.find((candidate) => recordId(candidate) === id || roleLabel(candidate) === name)
    return { id: id || (known ? recordId(known) : ''), name }
  }).filter((role): role is { id: string; name: string } => Boolean(role))
}

function responseId(data: unknown) {
  if (typeof data === 'string') return data
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return ''
  return recordId(data as RecordValue)
}

export function TenantAccessManagement() {
  const queryClient = useQueryClient()
  const { activeTenantId, activeTenantName, setActiveTenant } = useAppStore()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [invite, setInvite] = useState(emptyUser)
  const [rowRole, setRowRole] = useState<Record<string, string>>({})
  const [roleError, setRoleError] = useState('')
  const tenantQuery = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => getApiItems((await tenantApi.list()).data),
    enabled: !activeTenantId,
  })
  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async () => getApiItems((await roleApi.list()).data),
  })
  const membersQuery = useQuery({
    queryKey: ['tenant-users', activeTenantId],
    queryFn: async () => getApiItems((await tenantApi.users(activeTenantId)).data),
    enabled: Boolean(activeTenantId),
  })
  const roles = rolesQuery.data ?? []
  const members = membersQuery.data ?? []
  const knownRoles = useMemo(() => roles, [roles])
  const tenantCreateMutation = useMutation({
    mutationFn: async (payload: TenantUserRequest) => {
      const created = await tenantApi.createUser(activeTenantId, payload)
      const userId = responseId(created.data)
      if (selectedRole && userId) {
        await tenantApi.assignRole(activeTenantId, { userId, roleId: selectedRole })
      } else if (selectedRole) {
        throw new Error('The member was created, but the API did not return a user ID to assign the selected role.')
      }
      return created
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tenant-users', activeTenantId] })
      setInviteOpen(false)
      setInvite(emptyUser)
      setSelectedRole('')
      setInviteError('')
    },
    onError: async (error) => {
      await queryClient.invalidateQueries({ queryKey: ['tenant-users', activeTenantId] })
      setInviteError(error instanceof Error ? error.message : 'The member could not be created. Check the details and try again.')
    },
  })
  const roleMutation = useMutation({
    mutationFn: ({ userId, roleId, action }: AssignRoleRequest & { action: 'assign' | 'remove' }) => {
      const payload = { userId, roleId }
      return action === 'assign'
        ? tenantApi.assignRole(activeTenantId, payload)
        : tenantApi.removeRole(activeTenantId, payload)
    },
    onSuccess: async () => {
      setRoleError('')
      await queryClient.invalidateQueries({ queryKey: ['tenant-users', activeTenantId] })
    },
    onError: () => setRoleError('The role change could not be saved. Confirm the member and role belong to this tenant.'),
  })

  function submitInvite(event: FormEvent) {
    event.preventDefault()
    const payload = {
      companyId: activeTenantId,
      firstName: invite.firstName.trim(),
      lastName: invite.lastName.trim(),
      email: invite.email.trim(),
      password: invite.password,
    }
    if (!payload.companyId || !payload.firstName || !payload.lastName || !payload.email || !payload.password) {
      setInviteError('First name, last name, email, and password are required for tenant user creation.')
      return
    }
    tenantCreateMutation.mutate(payload)
  }

  return (
    <div className="page tenant-access-page">
      <div className="page-heading">
        <div><span className="eyebrow">TENANT MANAGEMENT</span><h1>Access management</h1><p>Manage members and roles in the selected tenant workspace.</p></div>
        {activeTenantId && <button className="button primary" onClick={() => { setInviteError(''); setInviteOpen(true) }}><UserPlus size={16} />Add member</button>}
      </div>

      <section className="tenant-access-context panel">
        <span className="tenant-access-context-icon"><ShieldCheck size={18} /></span>
        <div><span className="eyebrow">ACTIVE TENANT</span><strong>{activeTenantName || 'No tenant selected'}</strong><small>{activeTenantId || 'Select a tenant workspace before managing members.'}</small></div>
        <KeyRound size={17} className="tenant-access-key" />
      </section>

      {!activeTenantId && (
        <section className="panel tenant-select-panel">
          <div className="tenant-access-section-heading"><div><h2>Select a tenant</h2><p>Member lists are scoped to one tenant at a time.</p></div></div>
          {tenantQuery.isLoading && <p className="tenant-access-state">Loading accessible tenants...</p>}
          {tenantQuery.isError && <p className="form-error" role="alert">Accessible tenants could not be loaded. Check your access and try again.</p>}
          {tenantQuery.isSuccess && tenantQuery.data.length === 0 && <p className="tenant-access-state">No tenant workspaces are available to your account.</p>}
          {tenantQuery.data && tenantQuery.data.length > 0 && <div className="tenant-access-tenant-list">{tenantQuery.data.map((tenant, index) => {
            const id = String(tenant.id ?? tenant.tenantId ?? '')
            const name = String(tenant.name ?? tenant.tenantName ?? 'Unnamed tenant')
            return <button key={id || index} className="tenant-access-tenant" disabled={!id} onClick={() => setActiveTenant(id, name)}><span>{name}</span><small>{String(tenant.domain ?? 'Tenant workspace')}</small></button>
          })}</div>}
        </section>
      )}

      {activeTenantId && (
        <>
          <section className="tenant-access-stats">
            <article className="kpi-card"><div className="kpi-icon teal"><Users size={18} /></div><div className="kpi-meta"><span>Tenant members</span><strong>{membersQuery.isLoading ? '—' : members.length}</strong><small>Loaded from the tenant user API</small></div></article>
            <article className="kpi-card"><div className="kpi-icon blue"><KeyRound size={18} /></div><div className="kpi-meta"><span>Available roles</span><strong>{rolesQuery.isLoading ? '—' : roles.length}</strong><small>Roles returned by the API</small></div></article>
            <article className="kpi-card"><div className="kpi-icon amber"><ShieldCheck size={18} /></div><div className="kpi-meta"><span>Access scope</span><strong>Tenant</strong><small>Role changes apply only to this tenant</small></div></article>
          </section>

          <section className="panel tenant-members-panel">
            <div className="tenant-access-section-heading"><div><span className="eyebrow">WORKSPACE USERS</span><h2>Members</h2><p>Add tenant users and assign only roles available from the role service.</p></div></div>
            {membersQuery.isLoading && <p className="tenant-access-state">Loading tenant members...</p>}
            {membersQuery.isError && <p className="form-error" role="alert">Tenant members could not be loaded. Check the tenant ID and your permissions.</p>}
            {rolesQuery.isError && <p className="form-error" role="alert">Available roles could not be loaded. Member list remains available; role changes are disabled.</p>}
            {roleError && <p className="form-error" role="alert">{roleError}</p>}
            {membersQuery.isSuccess && members.length === 0 && <div className="tenant-access-empty"><Users size={22} /><strong>No tenant members found</strong><span>Add a member to give someone access to this workspace.</span></div>}
            {members.length > 0 && (
              <div className="tenant-members-table-wrap">
                <table className="tenant-members-table">
                  <thead><tr><th>Member</th><th>Current roles</th><th>Change role</th><th /></tr></thead>
                  <tbody>{members.map((member, index) => {
                    const id = recordId(member)
                    const currentRoles = memberRoles(member, knownRoles)
                    const selected = rowRole[id] ?? ''
                    return <tr key={id || String(member.email ?? index)}>
                      <td><strong>{memberName(member)}</strong><small>{String(member.email ?? 'Email not provided')}</small></td>
                      <td>{currentRoles.length ? currentRoles.map((role) => <span className="tenant-role-pill" key={role.id || role.name}>{role.name}</span>) : <span className="tenant-role-empty">No role assigned</span>}</td>
                      <td><select aria-label={`Select role for ${memberName(member)}`} value={selected} onChange={(event) => setRowRole((current) => ({ ...current, [id]: event.target.value }))} disabled={!id || rolesQuery.isError || roles.length === 0}><option value="">Select role</option>{roles.map((role, roleIndex) => <option key={recordId(role) || roleIndex} value={recordId(role)} disabled={!recordId(role)}>{roleLabel(role)}</option>)}</select></td>
                      <td className="tenant-role-actions">
                        <button className="button secondary" disabled={!id || !selected || roleMutation.isPending} onClick={() => roleMutation.mutate({ userId: id, roleId: selected, action: 'assign' })}>Assign</button>
                        {currentRoles.some((role) => role.id === selected) && <button className="button ghost" disabled={!id || !selected || roleMutation.isPending} onClick={() => roleMutation.mutate({ userId: id, roleId: selected, action: 'remove' })}>Remove</button>}
                      </td>
                    </tr>
                  })}</tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {inviteOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setInviteOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="tenant-member-title">
            <div className="modal-header"><div><span className="eyebrow">TENANT USER</span><h2 id="tenant-member-title">Add workspace member</h2></div><button className="icon-button" title="Close" onClick={() => setInviteOpen(false)}>×</button></div>
            <form className="company-form" onSubmit={submitInvite}>
              <div className="form-grid"><label>First name<input required autoFocus value={invite.firstName} onChange={(event) => setInvite((current) => ({ ...current, firstName: event.target.value }))} /></label><label>Last name<input required value={invite.lastName} onChange={(event) => setInvite((current) => ({ ...current, lastName: event.target.value }))} /></label></div>
              <label>Email<input required type="email" value={invite.email} onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))} /></label>
              <label>Temporary password<input required type="password" minLength={8} value={invite.password} onChange={(event) => setInvite((current) => ({ ...current, password: event.target.value }))} /></label>
              <label>Initial role<select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}><option value="">Create without assigning a role</option>{roles.map((role, index) => <option key={recordId(role) || index} value={recordId(role)} disabled={!recordId(role)}>{roleLabel(role)}</option>)}</select></label>
              {rolesQuery.isError && <p className="form-error" role="alert">Role options could not be loaded. You may create the member without a role and assign one later.</p>}
              {inviteError && <p className="form-error" role="alert">{inviteError}</p>}
              <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setInviteOpen(false)}>Cancel</button><button type="submit" className="button primary" disabled={tenantCreateMutation.isPending}>{tenantCreateMutation.isPending ? 'Adding member...' : 'Add member'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
