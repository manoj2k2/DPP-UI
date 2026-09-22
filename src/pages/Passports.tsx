import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ExternalLink, LoaderCircle, QrCode, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getApiItems, passportApi, productApi } from '../api/client'
import { products as sampleProducts } from '../data'
import { StatusBadge } from '../components/StatusBadge'
import './passports.css'

type ProductRecord = Record<string, unknown>

export function Passports() {
  const [search, setSearch] = useState('')
  const [generatedIds, setGeneratedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: async () => (await productApi.list()).data })
  const generateMutation = useMutation({
    mutationFn: (productId: string) => passportApi.generate(),
    onSuccess: (_, productId) => {
      setGeneratedIds((current) => new Set(current).add(productId))
      setError('')
    },
    onError: () => setError('The passport could not be generated. Check the API and try again.'),
  })
  const apiProducts = getApiItems(productsQuery.data) as ProductRecord[]
  const products = apiProducts.length > 0 ? apiProducts : sampleProducts.map((product) => ({
    id: product.id,
    productNumber: product.number,
    productName: product.name,
    productCategory: product.category,
    weight: Number.parseFloat(product.weight),
    passportStatus: product.passport === 'Generated' ? 'Generated' : 'Not started',
    isSample: true,
  }))
  const usingSampleData = apiProducts.length === 0
  const filteredProducts = products.filter((product) => Object.values(product).join(' ').toLowerCase().includes(search.toLowerCase()))

  function productId(product: ProductRecord) { return String(product.id ?? '') }
  function productName(product: ProductRecord) { return String(product.productName ?? product.name ?? product.productNumber ?? 'Unnamed product') }
  function passportStatus(product: ProductRecord) {
    const id = productId(product)
    return generatedIds.has(id) || product.passportStatus === 'Generated' || product.passportGenerated === true ? 'Generated' : 'Not started'
  }

  return <div className="page">
    <div className="page-heading">
      <div><span className="eyebrow">PRODUCT PASSPORTS</span><h1>Digital passports</h1><p>Generate, review, and share passport records for products in your catalog.</p></div>
    </div>
    <section className="panel table-panel passport-list-panel">
      <div className="table-toolbar"><div className="search-box"><Search size={17} /><input aria-label="Search digital passports" placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>{usingSampleData && !productsQuery.isLoading && <span className="sample-data-label">Sample passport data</span>}</div>
      {error && <div className="passport-error">{error}</div>}
      {productsQuery.isLoading ? <div className="empty-state"><LoaderCircle className="spin" size={20} />Loading products from API...</div> : filteredProducts.length === 0 ? <div className="empty-state"><QrCode size={20} />No products available for passports.</div> : <div className="table-scroll"><table><thead><tr><th>Product</th><th>Category</th><th>Product number</th><th>Passport</th><th /></tr></thead><tbody>{filteredProducts.map((product) => { const record = product as ProductRecord; const id = productId(record); const status = passportStatus(record); const isSample = record.isSample === true; const isGenerating = generateMutation.isPending && generateMutation.variables === id; return <tr key={id}><td><div className="table-primary"><div className="table-icon">P</div><strong>{productName(record)}</strong></div></td><td>{String(record.productCategory ?? record.category ?? '—')}</td><td>{String(record.productNumber ?? '—')}</td><td><StatusBadge>{status}</StatusBadge></td><td><div className="passport-actions"><Link className="icon-button" title="Open digital passport" to={`/products/${id}/passport`}><ExternalLink size={16} /></Link>{status === 'Generated' ? <span className="passport-ready">Available</span> : <button className="button primary small-button" disabled={isSample || !id || isGenerating} onClick={() => generateMutation.mutate(id)}><Sparkles size={14} />{isSample ? 'Sample DPP' : isGenerating ? 'Generating...' : 'Generate DPP'}</button>}</div></td></tr> })}</tbody></table></div>}
      <div className="table-footer"><span>{productsQuery.isFetching ? 'Refreshing passport records...' : `Showing ${filteredProducts.length} of ${products.length} products`}</span></div>
    </section>
  </div>
}
