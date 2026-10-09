import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Pencil, Plus, Search } from 'lucide-react'
import { companyApi, getApiItems, type CompanyRequest } from '../api/client'
import { useAppStore } from '../store/useAppStore'
import './economic-operators.css'

type CompanyRecord = Record<string, unknown>

const emptyCompany: CompanyRequest = { companyName: '', vatNumber: '', country: '', industry: '', employeeCount: undefined }

function companyId(company: CompanyRecord) {
  const id = company.id ?? company.companyId
  return typeof id === 'string' ? id : ''
}

export function EconomicOperatorsPage() {
  const queryClient = useQueryClient()
  const { activeTenantName } = useAppStore()
  const [search, setSearch] = useState('')
  const [editingCompany, setEditingCompany] = useState<CompanyRecord | null>(null)
  const [form, setForm] = useState<CompanyRequest>(emptyCompany)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')
  const companyQuery = useQuery({
    queryKey: ['companies'],
    queryFn: async () => getApiItems((await companyApi.list()).data),
  })
  const companies = companyQuery.data ?? []
  const filteredCompanies = useMemo(() => companies.filter((company) => Object.values(company).join(' ').toLowerCase().includes(search.toLowerCase())), [companies, search])
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: CompanyRequest }) => id ? companyApi.update(id, payload) : companyApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
      closeModal()
    },
    onError: () => setError('The economic operator could not be saved. Check the organization details and try again.'),
  })

  function openModal(company?: CompanyRecord) {
    setEditingCompany(company ?? null)
    setForm({
      companyName: String(company?.companyName ?? ''),
      vatNumber: String(company?.vatNumber ?? ''),
      country: String(company?.country ?? ''),
      industry: String(company?.industry ?? ''),
      employeeCount: typeof company?.employeeCount === 'number' ? company.employeeCount : undefined,
    })
    setError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingCompany(null)
    setError('')
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const name = form.companyName.trim()
    if (!name) {
      setError('Company name is required.')
      return
    }
    saveMutation.mutate({
      id: editingCompany ? companyId(editingCompany) || undefined : undefined,
      payload: { ...form, companyName: name, vatNumber: form.vatNumber?.trim() || undefined, country: form.country?.trim() || undefined, industry: form.industry?.trim() || undefined },
    })
  }

  return (
    <div className="page economic-operators-page">
      <div className="page-heading">
        <div><span className="eyebrow">TENANT DATA · ECONOMIC OPERATORS</span><h1>Economic operators</h1><p>Manage manufacturers and responsible companies in this workspace{activeTenantName ? ` · ${activeTenantName}` : ''}.</p></div>
        <button className="button primary" onClick={() => openModal()}><Plus size={16} />Add operator</button>
      </div>
      <section className="panel operator-panel">
        <div className="operator-toolbar"><div><span className="eyebrow">ORGANIZATION DIRECTORY</span><h2>Companies</h2></div><label className="operator-search"><Search size={16} /><input aria-label="Search economic operators" placeholder="Search operators..." value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
        {companyQuery.isLoading && <p className="operator-query-state">Loading companies...</p>}
        {companyQuery.isError && <p className="form-error operator-query-state" role="alert">Economic operators could not be loaded. Check the API connection and your tenant access.</p>}
        {companyQuery.isSuccess && filteredCompanies.length > 0 && <div className="table-scroll"><table><thead><tr><th>Economic operator</th><th>Country</th><th>Industry</th><th>Employees</th><th>VAT number</th><th /></tr></thead><tbody>{filteredCompanies.map((company, index) => {
          const id = companyId(company)
          return <tr key={id || index}>
            <td><div className="table-primary"><span className="table-icon"><Building2 size={14} /></span><strong>{String(company.companyName ?? 'Unnamed company')}</strong></div></td>
            <td>{String(company.country ?? '—')}</td><td>{String(company.industry ?? '—')}</td><td>{String(company.employeeCount ?? '—')}</td><td>{String(company.vatNumber ?? '—')}</td>
            <td><button className="icon-button" title={`Edit ${String(company.companyName ?? 'company')}`} disabled={!id} onClick={() => openModal(company)}><Pencil size={15} /></button></td>
          </tr>
        })}</tbody></table></div>}
        {companyQuery.isSuccess && filteredCompanies.length === 0 && <div className="operator-empty"><Building2 size={22} /><strong>{companies.length ? 'No matching operators' : 'No economic operators yet'}</strong><span>{companies.length ? 'Try a different search.' : 'Add a company to manage product responsibility and manufacturing context.'}</span>{!companies.length && <button className="button secondary" onClick={() => openModal()}><Plus size={14} />Add first operator</button>}</div>}
        <div className="operator-footer"><span>{companyQuery.isFetching ? 'Refreshing companies...' : `Showing ${filteredCompanies.length} of ${companies.length} economic operators`}</span></div>
      </section>

      {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="operator-modal-title">
        <div className="modal-header"><div><span className="eyebrow">ECONOMIC OPERATOR</span><h2 id="operator-modal-title">{editingCompany ? 'Edit company' : 'Add company'}</h2></div><button className="icon-button" title="Close" onClick={closeModal}>×</button></div>
        <form className="company-form" onSubmit={submit}>
          <label>Company name<input required autoFocus value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} /></label>
          <label>VAT number<input value={form.vatNumber ?? ''} onChange={(event) => setForm((current) => ({ ...current, vatNumber: event.target.value }))} /></label>
          <div className="form-grid"><label>Country<input value={form.country ?? ''} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} /></label><label>Industry<input value={form.industry ?? ''} onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))} /></label></div>
          <label>Employees<input type="number" min="0" step="1" value={form.employeeCount ?? ''} onChange={(event) => setForm((current) => ({ ...current, employeeCount: event.target.value ? Number(event.target.value) : undefined }))} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button type="button" className="button secondary" onClick={closeModal}>Cancel</button><button type="submit" className="button primary" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : editingCompany ? 'Save changes' : 'Add company'}</button></div>
        </form>
      </div></div>}
    </div>
  )
}
