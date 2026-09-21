import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Filter, MoreHorizontal, Plus, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { products } from '../data'
import { companyApi, productApi } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import { SectionHeader } from '../components/SectionHeader'

const content = {
  companies: { title: 'Companies', eyebrow: 'TENANT MANAGEMENT', description: 'Manage the companies and manufacturing organizations in your workspace.', columns: ['Company', 'Country', 'Industry', 'Employees', 'Status'], rows: [['Axiom Mobility', 'Germany', 'Automotive', '1,240', 'Ready']] },
  products: { title: 'Products', eyebrow: 'PRODUCT CATALOG', description: 'Manage product records and keep passport readiness moving.', columns: ['Product', 'Category', 'Weight', 'Status', 'Passport'], rows: products.map((p) => [p.name, p.category, p.weight, p.status, p.passport]) },
  materials: { title: 'Materials', eyebrow: 'BILL OF MATERIALS', description: 'Track material composition, origin, and recycled content.', columns: ['Material', 'Type', 'Weight', 'Recycled content', 'Origin'], rows: [['Aluminium 6061', 'Metal', '12.6 kg', '42%', 'Germany'], ['PA66 GF30', 'Polymer', '1.8 kg', '18%', 'Belgium'], ['Copper C110', 'Metal', '3.2 kg', '76%', 'Poland'], ['EPDM Rubber', 'Elastomer', '0.8 kg', '12%', 'Italy']] },
  suppliers: { title: 'Suppliers', eyebrow: 'SUPPLY NETWORK', description: 'Keep supplier relationships and data requests in one place.', columns: ['Supplier', 'Code', 'Country', 'Email', 'Status'], rows: [['NordWerk Components GmbH', 'NWC-044', 'Germany', 'data@nordwerk.de', 'Ready'], ['Valence Metals SAS', 'VMS-018', 'France', 'compliance@valence.fr', 'In review'], ['Kitec Polymers', 'KTP-102', 'Belgium', 'hello@kitec.eu', 'Ready'], ['Sanko Precision', 'SKP-087', 'Japan', 'dpp@sanko.jp', 'Needs attention']] },
  compliance: { title: 'Compliance documents', eyebrow: 'EVIDENCE LIBRARY', description: 'A clear view of evidence, expiry dates, and missing documents.', columns: ['Document', 'Product', 'Type', 'Expiry date', 'Status'], rows: [['REACH declaration 2026', 'Battery Cooling Plate', 'Declaration', '14 Apr 2027', 'Ready'], ['Conflict minerals report', 'E-Drive Housing', 'Report', '30 Nov 2026', 'In review'], ['RoHS certificate', 'Charge Port Assembly', 'Certificate', '08 Jan 2027', 'Ready'], ['LCA verification letter', 'Steering Module', 'Verification', 'Expired', 'Needs attention']] },
}

export function Operations({ type }: { type: keyof typeof content }) {
  const [search, setSearch] = useState('')
  const data = content[type]
  const productQuery = useQuery({ queryKey: ['products'], queryFn: async () => (await productApi.list()).data, enabled: type === 'products' })
  const companyQuery = useQuery({ queryKey: ['companies'], queryFn: async () => (await companyApi.list()).data, enabled: type === 'companies' })
  const apiRows = type === 'products' && Array.isArray(productQuery.data?.value)
    ? productQuery.data.value.map((product: Record<string, unknown>) => [
      String(product.name ?? product.productName ?? product.productNumber ?? 'Unnamed product'),
      String(product.category ?? 'Uncategorized'),
      String(product.weight ?? '—'),
      String(product.status ?? 'Draft'),
      String(product.passportStatus ?? 'Not started'),
    ])
    : []
  const companyRows = type === 'companies' && Array.isArray(companyQuery.data?.value)
    ? companyQuery.data.value.map((company: Record<string, unknown>) => [
      String(company.companyName ?? 'Unnamed company'),
      String(company.country ?? '—'),
      String(company.industry ?? '—'),
      String(company.employeeCount ?? '—'),
      'Ready',
    ])
    : []
  const rows: string[][] = apiRows.length > 0 ? apiRows : companyRows.length > 0 ? companyRows : data.rows.map((row) => row.map(String))
  const filtered = useMemo(() => rows.filter((row) => row.join(' ').toLowerCase().includes(search.toLowerCase())), [rows, search])
  return <div className="page"><div className="page-heading"><div><span className="eyebrow">{data.eyebrow}</span><h1>{data.title}</h1><p>{data.description}</p></div><div className="heading-actions"><button className="button secondary"><Download size={16} />Export</button><button className="button primary"><Plus size={17} />Add {type === 'compliance' ? 'document' : type === 'companies' ? 'company' : type.slice(0, -1)}</button></div></div><section className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Search size={17} /><input aria-label={`Search ${data.title}`} placeholder={`Search ${data.title.toLowerCase()}...`} value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="toolbar-actions"><button className="button ghost"><Filter size={16} />Filter</button><button className="icon-button"><SlidersHorizontal size={17} /></button></div></div><div className="table-scroll"><table><thead><tr>{data.columns.map((column) => <th key={column}>{column}</th>)}<th /></tr></thead><tbody>{filtered.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cellIndex === 0 ? <div className="table-primary"><div className="table-icon">{type === 'products' ? 'P' : type === 'suppliers' ? 'S' : type === 'materials' ? 'M' : type === 'companies' ? 'C' : 'D'}</div><strong>{cell}</strong></div> : cellIndex === row.length - 1 ? <StatusBadge>{cell}</StatusBadge> : cell}</td>)}<td><button className="icon-button"><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>{filtered.length === 0 && <div className="empty-state"><Sparkles size={20} />No matching records found.</div>}<div className="table-footer"><span>{productQuery.isFetching || companyQuery.isFetching ? `Loading ${data.title.toLowerCase()} from API...` : `Showing ${filtered.length} of ${rows.length} records`}</span><div><button className="page-button active">1</button><button className="page-button">2</button><button className="page-button">3</button></div></div></section></div>
}
