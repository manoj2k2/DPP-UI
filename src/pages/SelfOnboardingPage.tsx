import { useState, type FormEvent } from 'react'
import { Building2, CheckCircle2, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { authApi, companyApi, type CompanyRequest, type RegisterRequest } from '../api/client'
import './self-onboarding.css'

type OnboardingForm = CompanyRequest & { firstName: string; lastName: string; email: string; password: string; terms: boolean }

type Completion = { companyId: string; email: string }

export function SelfOnboardingPage() {
  const [form, setForm] = useState<OnboardingForm>({ companyName: '', vatNumber: '', country: '', industry: '', employeeCount: undefined, firstName: '', lastName: '', email: '', password: '', terms: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [completion, setCompletion] = useState<Completion | null>(null)

  function update<K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) { setForm((current) => ({ ...current, [key]: value })) }
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const companyResponse = await companyApi.create({ companyName: form.companyName.trim(), vatNumber: form.vatNumber?.trim() || undefined, country: form.country, industry: form.industry, employeeCount: form.employeeCount })
      const company = companyResponse.data as Record<string, unknown>
      const companyId = String(company.id ?? company.companyId ?? '')
      if (!companyId) throw new Error('The company was created without an ID.')
      const user: RegisterRequest = { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password, companyId, role: 'CompanyAdmin' }
      await authApi.register(user)
      setCompletion({ companyId, email: form.email.trim() })
    } catch { setError('Registration could not be completed. The company may already exist or the API rejected the submitted details.') } finally { setLoading(false) }
  }

  if (completion) return <main className="onboarding-screen"><section className="onboarding-success"><div className="success-icon"><CheckCircle2 size={30} /></div><span className="eyebrow">WORKSPACE CREATED</span><h1>Welcome to Atlas.</h1><p>Your company tenant and administrator account were created successfully.</p><div className="onboarding-status-list"><Status icon={CheckCircle2} title="Company tenant" detail={`Created: ${completion.companyId}`} tone="success" /><Status icon={CheckCircle2} title="Administrator account" detail={completion.email} tone="success" /><Status icon={Mail} title="Confirmation email" detail="Email delivery requires a backend mail service." tone="pending" /><Status icon={ShieldCheck} title="Trial subscription" detail="Trial assignment requires a backend subscription endpoint." tone="pending" /></div><Link className="button primary" to="/login">Continue to sign in</Link></section></main>

  return <main className="onboarding-screen"><section className="onboarding-panel"><Link className="onboarding-brand" to="/login"><span className="brand-mark">A</span><span><strong>ATLAS</strong><small>DPP COMMAND CENTER</small></span></Link><div className="onboarding-copy"><span className="eyebrow">COMPANY SELF-ONBOARDING</span><h1>Create your DPP workspace.</h1><p>Register your company and administrator account to start a product passport trial.</p></div><form className="onboarding-form" onSubmit={submit}><div className="onboarding-section"><h2><Building2 size={17} />Company details</h2><div className="onboarding-grid"><label>Company name<input required value={form.companyName} onChange={(event) => update('companyName', event.target.value)} placeholder="Axiom Mobility GmbH" /></label><label>VAT number<input value={form.vatNumber} onChange={(event) => update('vatNumber', event.target.value)} placeholder="DE123456789" /></label><label>Country<select required value={form.country} onChange={(event) => update('country', event.target.value)}><option value="">Select country</option><option>Germany</option><option>Austria</option><option>Belgium</option><option>France</option><option>Italy</option><option>Spain</option><option>Other</option></select></label><label>Industry<select required value={form.industry} onChange={(event) => update('industry', event.target.value)}><option value="">Select industry</option><option>Automotive</option><option>Manufacturing</option><option>Logistics</option><option>Electronics</option><option>Other</option></select></label><label>Employee count<input required type="number" min="1" value={form.employeeCount ?? ''} onChange={(event) => update('employeeCount', event.target.value ? Number(event.target.value) : undefined)} /></label></div></div><div className="onboarding-section"><h2><UserRound size={17} />Administrator account</h2><div className="onboarding-grid"><label>First name<input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} /></label><label>Last name<input required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} /></label><label className="field-wide">Administrator email<input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="admin@company.com" /></label><label className="field-wide">Password<input required minLength={8} type="password" value={form.password} onChange={(event) => update('password', event.target.value)} /></label></div></div><label className="terms-check"><input required type="checkbox" checked={form.terms} onChange={(event) => update('terms', event.target.checked)} /><span>I accept the Atlas terms and conditions and confirm that I am authorised to register this company.</span></label>{error && <p className="onboarding-error">{error}</p>}<button className="button primary onboarding-submit" disabled={loading}>{loading ? 'Creating workspace...' : 'Register company'}<Building2 size={16} /></button></form><div className="onboarding-foot"><LockKeyhole size={14} />Your information is protected with secure API authentication.<span>Already registered? <Link to="/login">Sign in</Link></span></div></section><aside className="onboarding-aside"><span className="eyebrow">DPP SAAS PLATFORM</span><h2>One workspace for every product story.</h2><p>Bring company, product, PCF, supplier, and compliance data together from the first day.</p><div className="onboarding-benefits"><span><CheckCircle2 size={15} />Company tenant</span><span><CheckCircle2 size={15} />Administrator access</span><span><CheckCircle2 size={15} />DPP trial workspace</span></div></aside></main>
}

function Status({ icon: Icon, title, detail, tone }: { icon: typeof CheckCircle2; title: string; detail: string; tone: 'success' | 'pending' }) { return <div className={`onboarding-status ${tone}`}><Icon size={17} /><div><strong>{title}</strong><span>{detail}</span></div></div> }
