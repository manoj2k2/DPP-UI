import { useMemo, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { Leaf, LoaderCircle, Search } from 'lucide-react'
import { getApiItems, pcfApi, productApi, type PcfRequest } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import './pcf.css'

type ProductRecord = Record<string, unknown>

export function PcfPage() {
  const [search, setSearch] = useState('')
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: async () => (await productApi.list()).data })
  const products = getApiItems(productsQuery.data) as ProductRecord[]
  const pcfQueries = useQueries({ queries: products.map((product) => {
    const productId = String(product.id ?? '')
    return { queryKey: ['pcf', productId], queryFn: async () => (await pcfApi.get(productId)).data, enabled: Boolean(productId), retry: false }
  }) })
  const pcfByProductId = new Map(products.map((product, index) => [String(product.id ?? ''), pcfQueries[index]?.data as PcfRequest | undefined]))
  const filteredProducts = useMemo(() => products.filter((product) => Object.values(product).join(' ').toLowerCase().includes(search.toLowerCase())), [products, search])
  const measuredProducts = products.filter((product) => pcfByProductId.get(String(product.id ?? ''))?.valueKgCo2e !== undefined)
  const totalCarbon = measuredProducts.reduce((total, product) => total + (pcfByProductId.get(String(product.id ?? ''))?.valueKgCo2e ?? 0), 0)
  const pcfLoading = pcfQueries.some((query) => query.isFetching)

  return <div className="page">
    <div className="page-heading"><div><span className="eyebrow">CARBON FOOTPRINT</span><h1>PCF data</h1><p>Track product carbon footprints, methods, and verification status from your product records.</p></div></div>
    <div className="pcf-summary"><div className="kpi-card"><div className="kpi-icon teal"><Leaf size={18} /></div><div className="kpi-meta"><span>Products in catalog</span><strong>{products.length}</strong><small>Loaded from API</small></div></div><div className="kpi-card"><div className="kpi-icon blue"><Leaf size={18} /></div><div className="kpi-meta"><span>PCF records</span><strong>{measuredProducts.length}</strong><small>Products with carbon data</small></div></div><div className="kpi-card"><div className="kpi-icon amber"><Leaf size={18} /></div><div className="kpi-meta"><span>Total reported impact</span><strong>{measuredProducts.length ? `${totalCarbon.toFixed(1)} kg` : '—'}</strong><small>CO2e where provided</small></div></div></div>
    <section className="panel table-panel pcf-panel"><div className="table-toolbar"><div className="search-box"><Search size={17} /><input aria-label="Search PCF data" placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div>{productsQuery.isLoading ? <div className="empty-state"><LoaderCircle className="spin" size={20} />Loading products from API...</div> : filteredProducts.length === 0 ? <div className="empty-state"><Leaf size={20} />No products available for PCF data.</div> : <div className="table-scroll"><table><thead><tr><th>Product</th><th>Category</th><th>Product number</th><th>PCF impact</th><th>Status</th></tr></thead><tbody>{filteredProducts.map((product) => { const pcf = pcfByProductId.get(String(product.id ?? '')); return <tr key={String(product.id ?? product.productNumber)}><td><div className="table-primary"><div className="table-icon">P</div><strong>{String(product.productName ?? product.name ?? product.productNumber ?? 'Unnamed product')}</strong></div></td><td>{String(product.productCategory ?? product.category ?? '—')}</td><td>{String(product.productNumber ?? '—')}</td><td>{pcf?.valueKgCo2e === undefined ? 'Not provided' : `${pcf.valueKgCo2e.toFixed(1)} kg CO2e`}</td><td><StatusBadge>{pcf ? String(pcf.verificationStatus ?? 'InReview') : 'Not started'}</StatusBadge></td></tr> })}</tbody></table></div>}<div className="table-footer"><span>{productsQuery.isFetching || pcfLoading ? 'Refreshing PCF records...' : `Showing ${filteredProducts.length} of ${products.length} products`}</span></div></section>
  </div>
}
