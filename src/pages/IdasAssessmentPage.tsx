import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, CircleAlert, Euro, Link as LinkIcon, Target, Users, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import './assessment.css'
import './idas-assessment.css'

const euCountries = ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden']
const preferredIndustries = ['automotive', 'manufacturing', 'logistics']

type IdasForm = { company: string; country: string; employees: string; revenue: string; industry: string; interest: string; budget: string }
type Check = { title: string; requirement: string; value: string; pass: boolean; warning?: boolean; critical?: boolean }

export function IdasAssessmentPage() {
  const [form, setForm] = useState<IdasForm>({ company: '', country: '', employees: '', revenue: '', industry: '', interest: '', budget: '' })
  const [submitted, setSubmitted] = useState(false)
  const update = (key: keyof IdasForm, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const checks = useMemo<Check[]>(() => {
    const employees = Number(form.employees)
    const revenue = Number(form.revenue)
    const budget = Number(form.budget)
    const countryPass = euCountries.includes(form.country)
    const employeePass = employees >= 50 && employees <= 250
    const revenuePass = !form.revenue || revenue < 50
    const industryPass = preferredIndustries.includes(form.industry)
    const interestPass = form.interest === 'high' || form.interest === 'medium'
    const budgetPass = !form.budget || (budget >= 50000 && budget <= 500000)
    return [
      { title: 'EU-based company', requirement: 'Registered in an EU member state', value: form.country || 'Not provided', pass: countryPass, critical: true },
      { title: 'SME size validation', requirement: 'Between 50 and 250 employees', value: form.employees ? `${form.employees} employees` : 'Not provided', pass: employeePass, critical: true },
      { title: 'Revenue limit', requirement: 'Less than EUR 50M annual revenue', value: form.revenue ? `EUR ${form.revenue}M` : 'Not provided', pass: revenuePass, warning: !form.revenue },
      { title: 'Target industry', requirement: 'Automotive, manufacturing, or logistics preferred', value: form.industry || 'Not provided', pass: industryPass, warning: Boolean(form.industry) && !industryPass },
      { title: 'Catena-X commitment', requirement: 'Committed to the data-sharing ecosystem', value: form.interest || 'Not provided', pass: interestPass, warning: form.interest === 'low' },
      { title: 'Transformation budget', requirement: 'EUR 50k to EUR 500k, or not specified', value: form.budget ? `EUR ${Math.round(budget / 1000)}k` : 'Not specified', pass: budgetPass, warning: !form.budget },
    ]
  }, [form])
  const criticalPass = checks.filter((check) => check.critical).every((check) => check.pass)
  const allPass = checks.every((check) => check.pass)
  const passedCount = checks.filter((check) => check.pass).length
  const status = !submitted ? null : criticalPass && allPass ? 'eligible' : criticalPass ? 'partial' : 'not-eligible'

  function validate(event: FormEvent) { event.preventDefault(); setSubmitted(true) }

  return <div className="idas-page">
    <div className="idas-topline"><Link to="/assessment"><ArrowLeft size={15} />Back to assessments</Link><span>IDAS ACCELERATOR PROGRAM</span></div>
    <header className="idas-hero"><div><span className="eyebrow">FUNDING ELIGIBILITY</span><h1>Check your IDAS eligibility.</h1><p>Validate whether your organisation meets the baseline requirements for the IDAS accelerator programme and prepare the next application steps.</p></div><div className="idas-badge">SME qualification validator</div></header>
    <main className="idas-grid"><section className="assessment-card"><div className="assessment-section-heading"><div><h2>Validation form</h2><p>Complete the organisation details to run the eligibility checks.</p></div><span>6 criteria</span></div><form className="idas-form" onSubmit={validate}><label className="assessment-field">Company name<input required value={form.company} onChange={(event) => update('company', event.target.value)} /></label><label className="assessment-field">Country / region<select required value={form.country} onChange={(event) => update('country', event.target.value)}><option value="">Select country</option>{euCountries.map((country) => <option key={country}>{country}</option>)}<option>Other</option></select><small>Must be EU-based for IDAS eligibility.</small></label><div className="idas-form-grid"><label className="assessment-field">Employees<input required type="number" min="1" value={form.employees} onChange={(event) => update('employees', event.target.value)} /><small>SME range: 50-250 employees.</small></label><label className="assessment-field">Annual revenue (EUR millions)<input type="number" min="0" step="0.1" value={form.revenue} onChange={(event) => update('revenue', event.target.value)} /><small>Optional; below EUR 50M.</small></label></div><label className="assessment-field">Industry<select required value={form.industry} onChange={(event) => update('industry', event.target.value)}><option value="">Select industry</option><option value="automotive">Automotive</option><option value="manufacturing">Manufacturing</option><option value="logistics">Logistics & supply chain</option><option value="electronics">Electronics</option><option value="chemicals">Chemicals & materials</option><option value="other">Other</option></select></label><label className="assessment-field">Catena-X adoption interest<select required value={form.interest} onChange={(event) => update('interest', event.target.value)}><option value="">Select interest level</option><option value="high">High - ready to commit</option><option value="medium">Medium - exploring options</option><option value="low">Low - just learning</option></select></label><label className="assessment-field">Transformation budget needed (EUR)<input type="number" min="0" value={form.budget} onChange={(event) => update('budget', event.target.value)} /><small>IDAS programmes: EUR 50k-500k.</small></label><button className="button primary idas-submit" type="submit">Validate eligibility</button></form></section>
      <aside className="assessment-card idas-criteria"><h2>IDAS criteria</h2><Criteria icon={Users} title="Company size" text="50-250 employees" /><Criteria icon={CheckCircle2} title="EU-based" text="Registered in an EU member state" /><Criteria icon={Euro} title="Revenue limit" text="Below EUR 50M annual revenue" /><Criteria icon={Target} title="Target industries" text="Automotive, manufacturing, logistics preferred" /><Criteria icon={LinkIcon} title="Data sharing commitment" text="Commitment to the Catena-X ecosystem" /><Criteria icon={Euro} title="Budget range" text="EUR 50k-500k transformation budget" /><div className="idas-note"><CircleAlert size={16} />All critical criteria must pass for full eligibility. Partial matches may qualify for alternative programmes.</div></aside></main>
    {submitted && <section className={`assessment-card idas-results ${status}`}><div className="idas-result-heading"><div className="idas-result-icon">{status === 'eligible' ? <CheckCircle2 /> : <CircleAlert />}</div><div><span className="eyebrow">VALIDATION RESULT</span><h2>{status === 'eligible' ? 'Fully eligible' : status === 'partial' ? 'Eligible with notes' : 'Not currently eligible'}</h2><p>{status === 'eligible' ? 'Your company meets all IDAS accelerator programme criteria.' : status === 'partial' ? 'Critical criteria pass, but some non-critical items need attention.' : 'Review the failed critical criteria before applying.'}</p></div></div><div className="idas-checks">{checks.map((check) => <div className="idas-check" key={check.title}><span className={check.pass ? 'check-pass' : check.warning ? 'check-warning' : 'check-fail'}>{check.pass ? '✓' : check.warning ? '!' : '×'}</span><div><strong>{check.title}</strong><span>Requirement: {check.requirement}</span><span>Your status: {check.value}</span></div></div>)}</div><div className="idas-summary"><strong>Eligibility summary</strong><p>{form.company} · {form.country} · {form.employees} employees</p><p>Criteria met: {passedCount}/{checks.length}</p>{criticalPass ? <b className="check-pass-text">You are eligible to apply for IDAS funding.</b> : <b className="check-fail-text">Critical eligibility gaps remain.</b>}</div><div className="idas-next"><strong>Next steps</strong><ol><li>Complete the full application form.</li><li>Prepare company and financial documentation.</li><li>Submit to the IDAS programme office.</li><li>Expect feedback within 4-8 weeks.</li></ol></div></section>}
  </div>
}

function Criteria({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) { return <div className="idas-criterion"><Icon size={17} /><div><strong>{title}</strong><span>{text}</span></div></div> }
