import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Download, LoaderCircle, QrCode, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { passportApi, productApi } from '../api/client'
import { products } from '../data'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'

export function ApiProductDetails() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const fallback = products.find((item) => item.id === id) ?? products[0]
  const productQuery = useQuery({ queryKey: ['product', id], queryFn: async () => (await productApi.get(id)).data, enabled: Boolean(id) })
  const passportQuery = useQuery({ queryKey: ['passport', id], queryFn: async () => (await passportApi.get(id)).data, enabled: Boolean(id) })
  const generateMutation = useMutation({ mutationFn: () => passportApi.generate(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['passport', id] }) })
  const product = productQuery.data ?? {}
  const name = String(product.productName ?? product.name ?? fallback.name)
  const number = String(product.productNumber ?? product.number ?? fallback.number)
  const category = String(product.productCategory ?? product.category ?? fallback.category)
  const weight = String(product.weight ?? fallback.weight)
  const generated = passportQuery.isSuccess

  return <div className="page detail-page"><Link to="/products" className="back-link"><ArrowLeft size={15} />Back to products</Link><div className="detail-hero"><div><span className="eyebrow">PRODUCT PASSPORT · {number}</span><h1>{name}</h1><p>{category} · {weight}</p></div><div className="heading-actions"><button className="button secondary"><Download size={16} />Export passport</button><button className="button primary" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending || !id}><Sparkles size={16} />{generateMutation.isPending ? 'Generating...' : 'Generate DPP'}</button></div></div><div className="detail-grid"><section className="panel"><SectionHeader title="Product information" eyebrow="LIVE API RECORD" /><div className="info-grid"><div><span>Product number</span><strong>{number}</strong></div><div><span>Category</span><strong>{category}</strong></div><div><span>Mass</span><strong>{weight}</strong></div><div><span>API status</span><strong>{productQuery.isFetching ? <LoaderCircle className="spin" size={16} /> : <StatusBadge>Ready</StatusBadge>}</strong></div></div></section><section className="panel passport-preview"><SectionHeader title="Digital passport" eyebrow="PASSPORT ENDPOINT" /><div className="passport-card"><div className="passport-header"><div className="brand-mark small">A</div><span>ATLAS DIGITAL PASSPORT</span></div><h3>{name}</h3><p>{number}</p><div className="passport-qr"><QrCode size={46} /><span>{generated ? 'Passport available' : 'No passport yet'}</span></div><div className="passport-footer"><span>{passportQuery.isFetching ? 'Checking API...' : generated ? 'Loaded from API' : 'Ready to generate'}</span><span className="verified"><CheckCircle2 size={13} />{generated ? 'Verified' : 'Pending'}</span></div></div></section></div></div>
}
