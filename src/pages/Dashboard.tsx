import type { CSSProperties } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Box,
  CheckCircle2,
  CircleAlert,
  CircleX,
  FileWarning,
  Leaf,
  Plus,
  QrCode,
  ShieldCheck,
  Truck,
  Upload,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { activities, products } from '../data'
import { KpiCard } from '../components/KpiCard'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import './dashboard.css'

const readinessScores = [
  { label: 'Completeness', value: 91, description: 'Required data collected', tone: 'teal' },
  { label: 'Data quality', value: 78, description: 'Validity, freshness & support', tone: 'blue' },
  { label: 'Regulatory ready', value: 64, description: 'Mandatory rules satisfied', tone: 'amber' },
]

const productIdForGap: Record<string, string> = {
  'Product identity': '3',
  Company: '3',
  BOM: '2',
  Materials: '2',
  Suppliers: '3',
  Environmental: '2',
  Repairability: '4',
  Circularity: '3',
  Evidence: '3',
}

const readinessAreas = [
  { label: 'Product identity', value: 100, to: '/products/3' },
  { label: 'Company', value: 100, to: '/companies' },
  { label: 'BOM', value: 95, to: `/materials?productId=${productIdForGap.BOM}` },
  { label: 'Materials', value: 80, to: `/materials?productId=${productIdForGap.Materials}` },
  { label: 'Suppliers', value: 62, to: '/suppliers' },
  { label: 'Environmental', value: 70, to: '/pcf' },
  { label: 'Repairability', value: 100, to: '/products/4' },
  { label: 'Circularity', value: 45, to: '/products/3' },
  { label: 'Evidence', value: 76, to: '/compliance' },
]

const registrationChecks = [
  { label: 'Required identifiers', status: 'complete', to: '/products' },
  { label: 'Required fields', status: 'complete', to: '/products' },
  { label: 'Semantic validation', status: 'complete', to: '/assessment' },
  { label: 'Evidence coverage', status: 'warning', to: '/compliance' },
  { label: 'Product-specific rules', status: 'blocked', to: '/assessment' },
]

const lifecycle = ['Draft', 'Validating', 'Validated', 'Approved', 'Published', 'Registered']

function scoreTone(value: number) {
  if (value >= 90) return 'complete'
  if (value >= 65) return 'warning'
  return 'blocked'
}

export function Dashboard() {
  const date = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  return (
    <div className="page dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DEMO WORKSPACE · SAMPLE DATA · {date.toUpperCase()}</span>
          <h1>Good morning, Jordan.</h1>
          <p>See what’s ready, what needs attention, and what to do next.</p>
        </div>
        <div className="heading-actions">
          <Link className="button secondary" to="/products"><Upload size={16} />Import data</Link>
          <Link className="button primary" to="/products/new"><Plus size={17} />Add product</Link>
        </div>
      </div>

      <section className="dashboard-readiness" aria-labelledby="readiness-title">
        <div className="dashboard-readiness-heading">
          <div>
            <span className="eyebrow">PROGRAM HEALTH</span>
            <h2 id="readiness-title">DPP readiness</h2>
            <p>Separate scores show data collection, data quality, and regulatory readiness.</p>
          </div>
          <Link className="dashboard-inline-link" to="/assessment">Review assessment <ArrowRight size={15} /></Link>
        </div>
        <div className="readiness-score-grid">
          {readinessScores.map((score) => (
            <article className="readiness-score" key={score.label}>
              <div className="readiness-score-copy">
                <span>{score.label}</span>
                <strong>{score.value}<small>%</small></strong>
                <small>{score.description}</small>
              </div>
              <div className={`dashboard-score-ring ${score.tone}`} style={{ '--score': `${score.value}%` } as CSSProperties} aria-label={`${score.label}: ${score.value}%`}>
                <span>{score.value}%</span>
              </div>
            </article>
          ))}
        </div>
        <p className="readiness-disclaimer"><ShieldCheck size={15} />A strong completeness score does not mean a product is ready for EU registration.</p>
      </section>

      <div className="kpi-grid dashboard-kpis">
        <KpiCard label="Total products" value="248" change="Across this workspace" icon={Box} tone="teal" />
        <KpiCard label="DPPs generated" value="186" change="75% of portfolio" icon={QrCode} tone="blue" />
        <KpiCard label="Open data gaps" value="32" change="Evidence and product data" icon={FileWarning} tone="amber" />
        <KpiCard label="Active suppliers" value="64" change="Supplier data coverage" icon={Truck} tone="coral" />
      </div>

      <div className="dashboard-insight-grid">
        <section className="panel readiness-breakdown">
          <SectionHeader title="Readiness by data area" eyebrow="CLICK A GAP TO TAKE ACTION" />
          <div className="readiness-area-list">
            {readinessAreas.map((area) => {
              const tone = scoreTone(area.value)
              return (
                <Link className="readiness-area" to={area.to} key={area.label}>
                  <span className="readiness-area-label">{area.label}</span>
                  <span className="readiness-track" aria-hidden="true"><i className={tone} style={{ width: `${area.value}%` }} /></span>
                  <strong>{area.value}%</strong>
                  {tone === 'complete' ? <CheckCircle2 className="area-status complete" size={16} /> : tone === 'warning' ? <CircleAlert className="area-status warning" size={16} /> : <CircleX className="area-status blocked" size={16} />}
                  <ArrowUpRight className="area-arrow" size={15} />
                </Link>
              )
            })}
          </div>
        </section>

        <section className="panel registration-panel">
          <SectionHeader title="EU registration readiness" eyebrow="MANDATORY CHECKS" />
          <p className="registration-intro">Registration depends on every applicable requirement—not the overall data score.</p>
          <div className="registration-check-list">
            {registrationChecks.map((check) => (
              <Link className={`registration-check ${check.status}`} to={check.to} key={check.label}>
                {check.status === 'complete' ? <CheckCircle2 size={17} /> : check.status === 'warning' ? <CircleAlert size={17} /> : <CircleX size={17} />}
                <span>{check.label}</span>
                <strong>{check.status === 'complete' ? 'Satisfied' : check.status === 'warning' ? 'Review' : 'Action needed'}</strong>
                <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>
          <Link className="registration-cta" to="/registry">Open registry workspace <ArrowRight size={15} /></Link>
        </section>
      </div>

      <section className="panel lifecycle-panel">
        <div className="dashboard-readiness-heading">
          <div>
            <span className="eyebrow">VERSIONED PASSPORT WORKFLOW</span>
            <h2>DPP lifecycle</h2>
            <p>Published passport versions stay immutable; changes should create a new draft version.</p>
          </div>
          <Link className="dashboard-inline-link" to="/passports">Manage passports <ArrowRight size={15} /></Link>
        </div>
        <ol className="lifecycle-steps">
          {lifecycle.map((step, index) => (
            <li className={index === 0 ? 'current' : ''} key={step}>
              <span className="lifecycle-node">{index === 0 ? <Box size={15} /> : index < 3 ? <CheckCircle2 size={15} /> : <BadgeCheck size={15} />}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="lifecycle-failures"><strong>Needs intervention:</strong><span>Validation failed</span><span>Registration failed</span><span>Registry rejected</span><span>Sync error</span></div>
      </section>

      <div className="lower-grid dashboard-lower-grid">
        <section className="panel activity-panel">
          <div className="section-header"><h2>Recent activity</h2><Link className="dashboard-inline-link" to="/assessment">View assessment <ArrowRight size={14} /></Link></div>
          <div className="activity-list">{activities.map((activity) => <div className="activity-row" key={activity.title}><div className={`activity-icon ${activity.tone}`}>{activity.tone === 'green' ? <CheckCircle2 size={16} /> : activity.tone === 'amber' ? <FileWarning size={16} /> : <Upload size={16} />}</div><div><strong>{activity.title}</strong><span>{activity.detail}</span></div><time>{activity.time}</time></div>)}</div>
        </section>
        <section className="panel products-panel">
          <div className="section-header"><h2>Latest products</h2><Link className="dashboard-inline-link" to="/products">View all <ArrowRight size={14} /></Link></div>
          <div className="product-list">{products.slice(0, 4).map((product) => <Link className="product-row" key={product.id} to={`/products/${product.id}`}><div className="product-thumb">{product.category === 'Powertrain' ? <Box size={18} /> : <Leaf size={18} />}</div><div className="product-name"><strong>{product.name}</strong><span>{product.number} · {product.category}</span></div><StatusBadge>{product.status}</StatusBadge><ArrowUpRight size={16} className="row-arrow" /></Link>)}</div>
        </section>
      </div>
    </div>
  )
}
