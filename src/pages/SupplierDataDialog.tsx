import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { getApiItems, supplierApi, type CreateSupplierCertificateDto, type CreateSupplierContactDto, type CreateSupplierMaterialDto, type CreateSupplierSiteDto } from '../api/client'

type SupplierMutationRequest =
  | { resource: 'site'; payload: CreateSupplierSiteDto }
  | { resource: 'contact'; payload: CreateSupplierContactDto }
  | { resource: 'material'; payload: CreateSupplierMaterialDto }
  | { resource: 'certificate'; payload: CreateSupplierCertificateDto }

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
const formField = (form: HTMLFormElement, name: string) => {
  const value = new FormData(form).get(name)
  return typeof value === 'string' ? value.trim() : ''
}

export function SupplierDataDialog({ open, supplierName, onClose }: { open: boolean; supplierName: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [supplierId, setSupplierId] = useState('')
  const [success, setSuccess] = useState('')
  const normalizedSupplierId = supplierId.trim()
  const validSupplierId = isUuid(normalizedSupplierId)
  const sitesQuery = useQuery({
    queryKey: ['supplier-sites', normalizedSupplierId],
    queryFn: async () => getApiItems((await supplierApi.listSites(normalizedSupplierId)).data),
    enabled: open && validSupplierId,
  })
  const mutation = useMutation({
    mutationFn: async (request: SupplierMutationRequest) => {
      switch (request.resource) {
        case 'site': return supplierApi.createSite(request.payload.supplierId, request.payload)
        case 'contact': return supplierApi.createContact(request.payload.supplierId, request.payload)
        case 'material': return supplierApi.createMaterial(request.payload.supplierId, request.payload)
        case 'certificate': return supplierApi.createCertificate(request.payload.supplierId, request.payload)
      }
    },
    onSuccess: async (_response, request) => {
      setSuccess(`${request.resource[0].toUpperCase()}${request.resource.slice(1)} saved.`)
      if (request.resource === 'site') await queryClient.invalidateQueries({ queryKey: ['supplier-sites', request.payload.supplierId] })
    },
    onError: () => setSuccess(''),
  })

  if (!open) return null

  function submit(event: FormEvent<HTMLFormElement>, resource: SupplierMutationRequest['resource']) {
    event.preventDefault()
    const form = event.currentTarget
    switch (resource) {
      case 'site':
        mutation.mutate({ resource, payload: { supplierId: normalizedSupplierId, siteName: formField(form, 'siteName'), address: { line1: formField(form, 'line1'), line2: formField(form, 'line2'), city: formField(form, 'city'), region: formField(form, 'region'), postalCode: formField(form, 'postalCode'), country: formField(form, 'country') } } })
        break
      case 'contact':
        mutation.mutate({ resource, payload: { supplierId: normalizedSupplierId, name: formField(form, 'name'), role: formField(form, 'role'), email: formField(form, 'email'), phone: formField(form, 'phone') } })
        break
      case 'material':
        mutation.mutate({ resource, payload: { supplierId: normalizedSupplierId, materialMasterId: formField(form, 'materialMasterId'), supplierMaterialCode: formField(form, 'supplierMaterialCode') } })
        break
      case 'certificate': {
        const issuedDate = formField(form, 'issuedDate')
        const expiryDate = formField(form, 'expiryDate')
        mutation.mutate({ resource, payload: { supplierId: normalizedSupplierId, certificateName: formField(form, 'certificateName'), blobUrl: formField(form, 'blobUrl'), issuedDate: issuedDate ? new Date(issuedDate).toISOString() : undefined, expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined } })
        break
      }
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal supplier-modal" role="dialog" aria-modal="true" aria-labelledby="supplier-modal-title">
        <div className="modal-header"><div><span className="eyebrow">SUPPLY NETWORK</span><h2 id="supplier-modal-title">{supplierName}</h2></div><button className="icon-button" title="Close" onClick={onClose}><X size={18} /></button></div>
        <div className="supplier-modal-body">
          <div className="company-form supplier-id-form">
            <label>Supplier ID<input required value={supplierId} onChange={(event) => { setSupplierId(event.target.value); setSuccess(''); mutation.reset() }} placeholder="00000000-0000-0000-0000-000000000000" aria-describedby="supplier-id-help" /></label>
            <span id="supplier-id-help" className="supplier-help">Enter the supplier UUID to load sites and submit related records.</span>
          </div>
          {supplierId && !validSupplierId && <p className="form-error supplier-feedback" role="alert">Enter a valid supplier UUID.</p>}
          {validSupplierId && <section className="supplier-sites" aria-live="polite">
            <h3>Sites</h3>
            {sitesQuery.isFetching && <p>Loading supplier sites...</p>}
            {sitesQuery.isError && <p className="form-error" role="alert">Supplier sites could not be loaded. Check the supplier ID and try again.</p>}
            {!sitesQuery.isFetching && !sitesQuery.isError && getApiItems(sitesQuery.data).length === 0 && <p>No sites are registered for this supplier.</p>}
            <ul className="supplier-site-list">{getApiItems(sitesQuery.data).map((site, index) => <li key={String(site.id ?? index)}><strong>{String(site.siteName ?? 'Supplier site')}</strong>{Boolean(site.city) && <span>{String(site.city)}</span>}</li>)}</ul>
          </section>}
          {mutation.isError && <p className="form-error supplier-feedback" role="alert">Supplier data could not be saved. Check the values and confirm the supplier ID.</p>}
          {success && <p className="supplier-success" role="status">{success}</p>}
          <details className="supplier-resource" open><summary>Add site</summary><form className="company-form" onSubmit={(event) => submit(event, 'site')}>
            <label>Site name<input name="siteName" /></label><div className="form-grid"><label>Address line 1<input name="line1" /></label><label>Address line 2<input name="line2" /></label></div>
            <div className="form-grid"><label>City<input name="city" /></label><label>Region<input name="region" /></label></div><div className="form-grid"><label>Postal code<input name="postalCode" /></label><label>Country<input name="country" /></label></div>
            <button className="button primary" type="submit" disabled={!validSupplierId || mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save site'}</button>
          </form></details>
          <details className="supplier-resource"><summary>Add contact</summary><form className="company-form" onSubmit={(event) => submit(event, 'contact')}>
            <div className="form-grid"><label>Name<input name="name" /></label><label>Role<input name="role" /></label></div><div className="form-grid"><label>Email<input name="email" type="email" /></label><label>Phone<input name="phone" type="tel" /></label></div>
            <button className="button primary" type="submit" disabled={!validSupplierId || mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save contact'}</button>
          </form></details>
          <details className="supplier-resource"><summary>Add material</summary><form className="company-form" onSubmit={(event) => submit(event, 'material')}>
            <label>Material master ID<input name="materialMasterId" required pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" /></label><label>Supplier material code<input name="supplierMaterialCode" /></label>
            <button className="button primary" type="submit" disabled={!validSupplierId || mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save material'}</button>
          </form></details>
          <details className="supplier-resource"><summary>Add certificate</summary><form className="company-form" onSubmit={(event) => submit(event, 'certificate')}>
            <label>Certificate name<input name="certificateName" /></label><label>Blob URL<input name="blobUrl" type="url" /></label><div className="form-grid"><label>Issued date<input name="issuedDate" type="date" /></label><label>Expiry date<input name="expiryDate" type="date" /></label></div>
            <button className="button primary" type="submit" disabled={!validSupplierId || mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save certificate'}</button>
          </form></details>
        </div>
      </div>
    </div>
  )
}
