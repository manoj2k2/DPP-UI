import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Building2,
  ClipboardCheck,
  Factory,
  Leaf,
  LoaderCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { passportApi, productApi } from '../api/client'
import { products } from '../data'
import { SectionHeader } from '../components/SectionHeader'
import './api-product-details.css'

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  return value as Record<string, unknown>
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not provided'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(', ') : 'None'
  return JSON.stringify(value) ?? 'Not provided'
}

function fieldValue(product: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (product[key] !== null && product[key] !== undefined && product[key] !== '') {
      return formatValue(product[key])
    }
  }
  return 'Not provided'
}

function readableLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())
}

function errorMessage(error: Error): string {
  return error.message || 'The request failed.'
}

const productFields = [
  ['Product number', ['productNumber', 'number']],
  ['Brand', ['brand']],
  ['Model', ['model']],
  ['Category', ['productCategory', 'category']],
  ['Product type', ['productType']],
  ['SKU', ['sku']],
  ['GTIN', ['gtin']],
  ['Batch / lot', ['batch']],
  ['Serial number', ['serialNumber']],
  ['Production date', ['productionDate']],
  ['Country of manufacture', ['countryOfManufacture']],
  ['Product version', ['productVersion']],
  ['Weight', ['weight']],
] as const

const relatedWorkspaces = [
  { label: 'BOM & materials', description: 'Composition, origin and material records', icon: Boxes, to: 'materials' },
  { label: 'Suppliers', description: 'Supplier records and supporting data', icon: Truck, to: 'suppliers' },
  { label: 'Environmental data', description: 'PCF and supporting metrics', icon: Leaf, to: 'pcf' },
  { label: 'Evidence & compliance', description: 'Documents and compliance records', icon: ClipboardCheck, to: 'compliance' },
]

export function ApiProductDetails() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const fallback = products.find((item) => item.id === id)
  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await productApi.get(id)).data,
    enabled: Boolean(id),
  })
  const readinessQuery = useQuery({
    queryKey: ['product-readiness', id],
    queryFn: async () => (await productApi.readiness(id)).data,
    enabled: Boolean(id),
  })
  const passportQuery = useQuery({
    queryKey: ['passport', id],
    queryFn: async () => (await passportApi.get(id)).data,
    enabled: Boolean(id),
  })
  const generateMutation = useMutation({
    mutationFn: () => passportApi.generate(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['passport', id] }),
  })

  const product = productQuery.data ?? {}
  const showingSample = Boolean(fallback && !productQuery.data)
  const sample = showingSample ? fallback : undefined
  const name = fieldValue(product, 'productName', 'name') !== 'Not provided'
    ? fieldValue(product, 'productName', 'name')
    : sample?.name ?? 'Product details'
  const category = fieldValue(product, 'productCategory', 'category') !== 'Not provided'
    ? fieldValue(product, 'productCategory', 'category')
    : sample?.category ?? 'Category not provided'
  const number = fieldValue(product, 'productNumber', 'number') !== 'Not provided'
    ? fieldValue(product, 'productNumber', 'number')
    : sample?.number ?? id
  const passport = asRecord(passportQuery.data)
  const readiness = asRecord(readinessQuery.data)
  const readinessEntries = readiness ? Object.entries(readiness) : []
  const passportAvailable = passportQuery.isSuccess && passportQuery.data !== null && passportQuery.data !== undefined

  return (
    <div className="page api-product-page">
      <Link to="/products" className="back-link"><ArrowLeft size={15} />Back to products</Link>

      <div className="detail-hero api-product-hero">
        <div>
          <span className="eyebrow">PRODUCT WORKSPACE · {number}</span>
          <h1>{name}</h1>
          <p>{category}{fieldValue(product, 'model') !== 'Not provided' ? ` · ${fieldValue(product, 'model')}` : ''}</p>
        </div>
        <div className="heading-actions">
          <Link className="button secondary" to={`/products/${id}/passport`}><QrCode size={16} />Open passport</Link>
          <button
            className="button primary"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !id}
          >
            <Sparkles size={16} />
            {generateMutation.isPending ? 'Generating...' : 'Generate DPP'}
          </button>
        </div>
      </div>

      {showingSample && (
        <div className="product-notice" role="status">
          Using local sample catalog details because no live product record is available.
        </div>
      )}
      {productQuery.isError && (
        <div className="product-error" role="alert">
          <strong>Couldn’t load this product from the API.</strong>
          <span>{errorMessage(productQuery.error)}</span>
        </div>
      )}
      {generateMutation.isError && (
        <div className="product-error" role="alert">
          <strong>Couldn’t generate the digital passport.</strong>
          <span>{errorMessage(generateMutation.error)}</span>
        </div>
      )}

      <div className="product-detail-grid">
        <section className="panel product-identity-panel">
          <SectionHeader title="Product identity" eyebrow="PRODUCT MASTER" />
          {productQuery.isLoading && <p className="product-query-state"><LoaderCircle className="spin" size={16} />Loading product record...</p>}
          <dl className="product-field-grid">
            {productFields.map(([label, keys]) => {
              const value = fieldValue(product, ...keys)
              const sampleValue = label === 'Product number'
                ? sample?.number
                : label === 'Category'
                  ? sample?.category
                  : label === 'Weight'
                    ? sample?.weight
                    : undefined
              return (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value !== 'Not provided' ? value : sampleValue ?? 'Not provided'}</dd>
                </div>
              )
            })}
            <div className="product-description">
              <dt>Description</dt>
              <dd>{fieldValue(product, 'description')}</dd>
            </div>
            <div>
              <dt>Company</dt>
              <dd>{fieldValue(product, 'companyName', 'company')}</dd>
            </div>
          </dl>
        </section>

        <section className="panel product-passport-panel">
          <SectionHeader title="Digital passport" eyebrow="PASSPORT STATUS" />
          <div className="product-passport-status">
            <div className="product-passport-icon"><QrCode size={27} /></div>
            <div>
              <strong>{passportQuery.isLoading ? 'Checking passport...' : passportAvailable ? 'Passport available' : passportQuery.isError ? 'Status unavailable' : 'Not generated'}</strong>
              <span>{passportQuery.isLoading ? 'Checking the passport endpoint' : passportAvailable ? 'Passport data loaded from the API' : passportQuery.isError ? errorMessage(passportQuery.error) : 'Generate a DPP when the product data is ready.'}</span>
            </div>
            {passportQuery.isLoading && <LoaderCircle className="spin" size={17} />}
          </div>
          {passportAvailable && passport && (
            <dl className="passport-meta">
              {Object.entries(passport).slice(0, 4).map(([key, value]) => (
                <div key={key}><dt>{readableLabel(key)}</dt><dd>{formatValue(value)}</dd></div>
              ))}
            </dl>
          )}
          <Link className="product-inline-link" to={`/products/${id}/passport`}>View passport details <BadgeCheck size={15} /></Link>
        </section>
      </div>

      <section className="panel product-readiness-panel">
        <SectionHeader title="DPP readiness" eyebrow="PRODUCT VALIDATION" />
        <p className="product-section-description">Readiness is evaluated by the product API. A high completeness score alone does not imply EU Registry registration readiness.</p>
        {readinessQuery.isLoading && <p className="product-query-state"><LoaderCircle className="spin" size={16} />Loading readiness...</p>}
        {readinessQuery.isError && (
          <div className="product-inline-error" role="alert">
            <strong>Readiness data couldn’t be loaded.</strong>
            <span>{errorMessage(readinessQuery.error)}</span>
          </div>
        )}
        {readinessQuery.isSuccess && readinessEntries.length > 0 && (
          <dl className="readiness-values">
            {readinessEntries.map(([key, value]) => (
              <div key={key}>
                <dt>{readableLabel(key)}</dt>
                <dd>{formatValue(value)}</dd>
              </div>
            ))}
          </dl>
        )}
        {readinessQuery.isSuccess && readinessEntries.length === 0 && (
          <p className="product-query-state">The readiness endpoint returned no readiness fields.</p>
        )}
      </section>

      <section className="product-workspaces-section">
        <div className="dpp-section-heading">
          <div><span className="eyebrow">PRODUCT DATA</span><h2>Related workspaces</h2></div>
          <span className="dataset-count">Manage product-linked records</span>
        </div>
        <div className="product-workspaces">
          {relatedWorkspaces.map(({ label, description, icon: Icon, to }) => (
            <Link
              className="panel product-workspace-card"
              key={label}
              to={to === 'materials' ? `/materials?productId=${encodeURIComponent(id)}` : `/${to}`}
            >
              <span className="product-workspace-icon"><Icon size={19} /></span>
              <span className="product-workspace-copy"><strong>{label}</strong><small>{description}</small></span>
              <ArrowLeft className="product-workspace-arrow" size={16} />
            </Link>
          ))}
          <Link className="panel product-workspace-card" to="/registry">
            <span className="product-workspace-icon"><Building2 size={19} /></span>
            <span className="product-workspace-copy"><strong>EU Registry</strong><small>Review registry enrolment and registration</small></span>
            <ArrowLeft className="product-workspace-arrow" size={16} />
          </Link>
          <Link className="panel product-workspace-card" to={`/products/${id}/passport`}>
            <span className="product-workspace-icon"><QrCode size={19} /></span>
            <span className="product-workspace-copy"><strong>Passport data</strong><small>Review passport datasets for this product</small></span>
            <ArrowLeft className="product-workspace-arrow" size={16} />
          </Link>
          <Link className="panel product-workspace-card" to="/assessment">
            <span className="product-workspace-icon"><ShieldCheck size={19} /></span>
            <span className="product-workspace-copy"><strong>Readiness assessment</strong><small>Review requirements and product gaps</small></span>
            <ArrowLeft className="product-workspace-arrow" size={16} />
          </Link>
          <Link className="panel product-workspace-card" to="/companies">
            <span className="product-workspace-icon"><Factory size={19} /></span>
            <span className="product-workspace-copy"><strong>Manufacturing</strong><small>Review company and production context</small></span>
            <ArrowLeft className="product-workspace-arrow" size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
