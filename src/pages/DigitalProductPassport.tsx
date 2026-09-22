import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, ChevronDown, Download, ExternalLink, LoaderCircle, QrCode, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { passportApi, productApi } from '../api/client'
import { products } from '../data'
import { createSamplePassport, type PassportDataset } from '../data/digitalPassport'
import { StatusBadge } from '../components/StatusBadge'
import './digital-product-passport.css'

function DatasetCard({ dataset, nested = false }: { dataset: PassportDataset; nested?: boolean }) {
  return <article className={nested ? 'passport-dataset nested-dataset' : 'passport-dataset'}>
    <div className="dataset-heading"><div><span className="dataset-type">{dataset.type}</span><h3>{dataset.title}</h3><p>{dataset.description}</p></div><ChevronDown size={17} /></div>
    <div className="dataset-fields">{dataset.fields.map((field) => <div key={field.label}><span>{field.label}</span><strong>{field.value}</strong></div>)}</div>
    {dataset.children?.length ? <div className="nested-datasets">{dataset.children.map((child) => <DatasetCard key={child.id} dataset={child} nested />)}</div> : null}
  </article>
}

export function DigitalProductPassport() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const fallback = products.find((item) => item.id === id) ?? products[0]
  const productQuery = useQuery({ queryKey: ['product', id], queryFn: async () => (await productApi.get(id)).data, enabled: Boolean(id) })
  const passportQuery = useQuery({ queryKey: ['passport', id], queryFn: async () => (await passportApi.get(id)).data, enabled: Boolean(id) })
  const generateMutation = useMutation({ mutationFn: () => passportApi.generate(), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['passport', id] }) })
  const product = productQuery.data ?? {}
  const number = String(product.productNumber ?? product.number ?? fallback.number)
  const name = String(product.productName ?? product.name ?? fallback.name)
  const category = String(product.productCategory ?? product.category ?? fallback.category)
  const passport = createSamplePassport(id, number, name, category)
  const generated = passportQuery.isSuccess

  return <div className="page dpp-page">
    <Link to="/passports" className="back-link"><ArrowLeft size={15} />Back to passports</Link>
    <div className="dpp-hero"><div><span className="eyebrow">ESPR DIGITAL PRODUCT PASSPORT</span><h1>{name}</h1><p>{number} · {category} · Schema {passport.schemaVersion}</p></div><div className="heading-actions"><button className="button secondary"><Download size={16} />Export JSON</button><button className="button primary" disabled={generateMutation.isPending || !id} onClick={() => generateMutation.mutate()}><Sparkles size={16} />{generateMutation.isPending ? 'Generating...' : generated ? 'Regenerate DPP' : 'Generate DPP'}</button></div></div>
    <section className="dpp-overview panel"><div className="dpp-identity"><div className="dpp-qr"><QrCode size={58} /><span>Scan to access</span></div><div><span className="dataset-type">PASSPORT IDENTIFIER</span><strong>{passport.passportId}</strong><p>{passport.regulation}</p></div></div><div className="dpp-meta"><div><span>Lifecycle status</span><StatusBadge>{passport.status}</StatusBadge></div><div><span>API passport</span><strong>{passportQuery.isFetching ? <LoaderCircle className="spin" size={16} /> : generated ? <><CheckCircle2 size={15} /> Available</> : 'Not generated'}</strong></div><div><span>Valid from</span><strong>{passport.validFrom}</strong></div></div></section>
    <div className="dpp-section-heading"><div><span className="eyebrow">LINKED DATASETS</span><h2>ESPR product information</h2></div><span className="dataset-count">{passport.datasets.length} linked datasets</span></div>
    <div className="passport-datasets">{passport.datasets.map((dataset) => <DatasetCard key={dataset.id} dataset={dataset} />)}</div>
    <div className="dpp-note"><ExternalLink size={15} /><span>Sample values are structured for the ESPR DPP experience and can be replaced by verified operator data before publication.</span></div>
  </div>
}
