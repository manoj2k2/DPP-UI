import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, CheckCircle2, ClipboardCheck, Download, FileText, Leaf, Printer, ShieldCheck, Target } from 'lucide-react'
import './assessment.css'

type Answer = 0 | 0.5 | 1
type Question = { id: string; text: string }
type AssessmentSection = { id: 'dpp' | 'pcf'; title: string; description: string; questions: Question[] }

const sections: AssessmentSection[] = [
  { id: 'dpp', title: 'DPP readiness', description: 'Evaluate product data, materials, suppliers, compliance, and traceability.', questions: [
    { id: 'productMaster', text: 'Is structured product master data maintained in a central system?' },
    { id: 'bom', text: 'Are bills of materials and product identifiers complete and version-controlled?' },
    { id: 'materials', text: 'Is product material composition available at component or material level?' },
    { id: 'recycled', text: 'Is recycled and renewable material content tracked?' },
    { id: 'suppliers', text: 'Are suppliers, manufacturing locations, and countries of origin recorded?' },
    { id: 'compliance', text: 'Are applicable declarations and certificates digitally available?' },
    { id: 'governance', text: 'Are compliance records assigned an owner, validity date, and approval status?' },
    { id: 'traceability', text: 'Can products be traced by batch, lot, or serial number where required?' },
    { id: 'lifecycle', text: 'Are repair, disassembly, recycling, and end-of-life instructions available?' },
  ] },
  { id: 'pcf', title: 'PCF readiness', description: 'Evaluate energy, material emissions, production data, and sustainability governance.', questions: [
    { id: 'energy', text: 'Is plant energy consumption measured by source and reporting period?' },
    { id: 'allocation', text: 'Can energy usage be allocated to products, processes, or production lines?' },
    { id: 'factors', text: 'Are material-specific emission factors or supplier PCF values available?' },
    { id: 'primaryData', text: 'Can primary supplier data be distinguished from secondary database values?' },
    { id: 'volume', text: 'Are production quantities and scrap rates available for the reporting period?' },
    { id: 'transport', text: 'Are inbound and outbound transport activities captured?' },
    { id: 'method', text: 'Is a documented PCF methodology and system boundary established?' },
    { id: 'owner', text: 'Is a responsible sustainability or PCF data owner assigned?' },
    { id: 'audit', text: 'Are data sources, assumptions, calculations, and versions auditable?' },
    { id: 'reporting', text: 'Can product-level carbon values be reported to customers digitally?' },
  ] },
]

const tabs = [
  { id: 'profile', label: 'Company profile', icon: ClipboardCheck },
  { id: 'dpp', label: 'DPP assessment', icon: FileText },
  { id: 'pcf', label: 'PCF assessment', icon: Leaf },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'roadmap', label: 'Roadmap', icon: Target },
  { id: 'report', label: 'Report', icon: Download },
] as const

type TabId = typeof tabs[number]['id']

export function AssessmentPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [profile, setProfile] = useState({ company: '', industry: 'Automotive components', country: 'Germany', employees: '50-200', erp: 'None / Spreadsheets' })
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const answeredCount = Object.keys(answers).length
  const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0)
  const scores = useMemo(() => sections.reduce<Record<string, number>>((result, section) => { const total = section.questions.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0); result[section.id] = Math.round(total / section.questions.length * 100); return result }, {}), [answers])
  const overall = Math.round(((scores.dpp ?? 0) + (scores.pcf ?? 0)) / 2)
  const gaps = sections.flatMap((section) => section.questions.filter((question) => (answers[question.id] ?? 0) < 1).map((question) => ({ ...question, category: section.title, priority: answers[question.id] === 0.5 ? 'Medium' : 'High' }))).slice(0, 6)
  const level = overall <= 25 ? 'Not ready' : overall <= 50 ? 'Early stage' : overall <= 75 ? 'Partially ready' : overall <= 90 ? 'Ready' : 'Highly ready'

  function go(tab: TabId) { setActiveTab(tab) }
  function setAnswer(id: string, value: Answer) { setAnswers((current) => ({ ...current, [id]: value })) }
  function reset() { setProfile({ company: '', industry: 'Automotive components', country: 'Germany', employees: '50-200', erp: 'None / Spreadsheets' }); setAnswers({}); setActiveTab('profile') }

  return <div className="assessment-page">
    <header className="assessment-hero"><div><span className="eyebrow">DPP & PCF READINESS</span><h1>Know your readiness.<br />Plan your next move.</h1><p>Evaluate your product passport and carbon-data capabilities, identify gaps, and create a practical implementation roadmap.</p></div><div className="assessment-hero-card"><strong>Assessment progress</strong><span>{answeredCount} of {totalQuestions} items answered</span><div className="assessment-progress"><i style={{ width: `${answeredCount / totalQuestions * 100}%` }} /></div><small>Results update as you answer.</small><Link className="assessment-secondary-link" to="/assessment/idas">Check IDAS funding eligibility</Link></div></header>
    <div className="assessment-shell"><nav className="assessment-nav" aria-label="Assessment sections">{tabs.map(({ id, label, icon: Icon }, index) => <button key={id} className={activeTab === id ? 'assessment-nav-item active' : 'assessment-nav-item'} onClick={() => go(id)}><span>{index + 1}</span><Icon size={16} />{label}</button>)}<button className="assessment-reset" onClick={reset}>Reset assessment</button></nav>
      <main className="assessment-content">
        {activeTab === 'profile' && <section className="assessment-card"><SectionHeading title="Company profile" description="Tell us about the organisation and its current technology landscape." tag="About 2 minutes" /><div className="assessment-form-grid"><Field label="Company name"><input value={profile.company} placeholder="Example Automotive GmbH" onChange={(event) => setProfile({ ...profile, company: event.target.value })} /></Field><Field label="Industry"><select value={profile.industry} onChange={(event) => setProfile({ ...profile, industry: event.target.value })}><option>Automotive components</option><option>Industrial manufacturing</option><option>Electronics</option><option>Batteries</option><option>Other</option></select></Field><Field label="Country"><select value={profile.country} onChange={(event) => setProfile({ ...profile, country: event.target.value })}><option>Germany</option><option>Austria</option><option>Czech Republic</option><option>Poland</option><option>Slovakia</option><option>Other</option></select></Field><Field label="Employees"><select value={profile.employees} onChange={(event) => setProfile({ ...profile, employees: event.target.value })}><option>1-49</option><option>50-200</option><option>201-500</option><option>501-1,000</option><option>1,000+</option></select></Field><Field label="ERP system"><select value={profile.erp} onChange={(event) => setProfile({ ...profile, erp: event.target.value })}><option>None / Spreadsheets</option><option>SAP Business One</option><option>SAP S/4HANA or ECC</option><option>Microsoft Dynamics</option><option>Oracle</option><option>Other</option></select></Field></div><ActionRow next={() => go('dpp')} /></section>}
        {(activeTab === 'dpp' || activeTab === 'pcf') && <section className="assessment-card"><SectionHeading title={sections.find((section) => section.id === activeTab)!.title} description={sections.find((section) => section.id === activeTab)!.description} tag={`${sections.find((section) => section.id === activeTab)!.questions.length} questions`} /><div className="assessment-questions">{sections.find((section) => section.id === activeTab)!.questions.map((question, index) => <div className="assessment-question" key={question.id}><div><span className="question-index">{index + 1}</span><strong>{question.text}</strong></div><div className="answer-set">{([['No', 0], ['Partial', 0.5], ['Yes', 1]] as const).map(([label, value]) => <label key={label}><input type="radio" name={question.id} checked={answers[question.id] === value} onChange={() => setAnswer(question.id, value)} /><span>{label}</span></label>)}</div></div>)}</div><ActionRow back={() => go(activeTab === 'dpp' ? 'profile' : 'dpp')} next={() => go(activeTab === 'dpp' ? 'pcf' : 'dashboard')} nextLabel={activeTab === 'dpp' ? 'Continue to PCF' : 'Calculate readiness'} /></section>}
        {activeTab === 'dashboard' && <Dashboard overall={overall} scores={scores} gaps={gaps} level={level} company={profile.company} go={go} />}
        {activeTab === 'roadmap' && <Roadmap scores={scores} go={go} />}
        {activeTab === 'report' && <Report overall={overall} scores={scores} gaps={gaps} level={level} profile={profile} go={go} />}
      </main>
    </div>
  </div>
}

function SectionHeading({ title, description, tag }: { title: string; description: string; tag: string }) { return <div className="assessment-section-heading"><div><h2>{title}</h2><p>{description}</p></div><span>{tag}</span></div> }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="assessment-field"><strong>{label}</strong>{children}</label> }
function ActionRow({ back, next, nextLabel = 'Continue' }: { back?: () => void; next: () => void; nextLabel?: string }) { return <div className="assessment-actions">{back ? <button className="button secondary" onClick={back}>Back</button> : <span />}{<button className="button primary" onClick={next}>{nextLabel}</button>}</div> }
function Dashboard({ overall, scores, gaps, level, company, go }: { overall: number; scores: Record<string, number>; gaps: { text: string; category: string; priority: string }[]; level: string; company: string; go: (tab: TabId) => void }) { return <section><div className="assessment-section-heading"><div><h2>Readiness dashboard</h2><p>Live results based on the answers provided.</p></div><span>{company || 'Company not specified'}</span></div><div className="readiness-metrics"><Metric label="Overall readiness" value={`${overall}%`} note={level} /><Metric label="DPP score" value={`${scores.dpp ?? 0}%`} note="Digital product data" /><Metric label="PCF score" value={`${scores.pcf ?? 0}%`} note="Carbon-data readiness" /><Metric label="Critical gaps" value={String(gaps.filter((gap) => gap.priority === 'High').length)} note="Priority actions" /></div><div className="assessment-card score-panel"><div className="score-ring-assessment" style={{ '--score': `${overall * 3.6}deg` } as CSSProperties}><strong>{overall}%</strong><span>Readiness</span></div><div><h3>{level}</h3><p>{overall ? `${company || 'Your organisation'} should focus first on the priority gaps shown below.` : 'Complete the DPP and PCF questions to calculate your result.'}</p><div className="score-bars"><ScoreBar label="DPP readiness" value={scores.dpp ?? 0} /><ScoreBar label="PCF readiness" value={scores.pcf ?? 0} /><ScoreBar label="Assessment coverage" value={Math.round((100 - gaps.length / 19 * 100))} /></div></div></div><div className="assessment-card"><h3>Priority gaps</h3>{gaps.length ? <ul className="gap-list-assessment">{gaps.map((gap) => <li key={gap.text}><ShieldCheck size={16} /><div><strong>{gap.text}</strong><span>{gap.category}</span></div><b>{gap.priority}</b></li>)}</ul> : <p className="assessment-muted">No open gaps identified.</p>}</div><div className="assessment-actions"><button className="button secondary" onClick={() => go('pcf')}>Review answers</button><button className="button primary" onClick={() => go('roadmap')}>View roadmap</button></div></section> }
function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <div className="readiness-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div> }
function ScoreBar({ label, value }: { label: string; value: number }) { return <div className="score-bar"><div><span>{label}</span><b>{value}%</b></div><i><em style={{ width: `${value}%` }} /></i></div> }
function Roadmap({ scores, go }: { scores: Record<string, number>; go: (tab: TabId) => void }) { return <section><div className="assessment-card"><SectionHeading title="Recommended implementation roadmap" description="A practical progression from data foundation to ecosystem integration." tag="Indicative plan" /><div className="roadmap-grid"><RoadmapPhase title="DPP foundation" period="0-90 days" items={['Establish product-data ownership', 'Consolidate product, BOM, and compliance data', 'Pilot passports for one product family']} /><RoadmapPhase title="PCF enablement" period="3-6 months" items={['Define PCF methodology and boundaries', 'Capture energy and production data', 'Establish supplier PCF workflow']} /><RoadmapPhase title="Scale and integrate" period="6-12 months" items={['Integrate ERP and automate data-quality checks', 'Roll out QR-based product passports', 'Add Catena-X connectivity where required']} /></div><div className="roadmap-callout"><CheckCircle2 size={18} /><span>Current scores: DPP {scores.dpp ?? 0}% and PCF {scores.pcf ?? 0}%. Prioritise the lower score first.</span></div><ActionRow back={() => go('dashboard')} next={() => go('report')} nextLabel="Generate report" /></div></section> }
function RoadmapPhase({ title, period, items }: { title: string; period: string; items: string[] }) { return <article className="roadmap-phase-assessment"><span>{period}</span><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article> }
function Report({ overall, scores, gaps, level, profile, go }: { overall: number; scores: Record<string, number>; gaps: { text: string; category: string; priority: string }[]; level: string; profile: { company: string; industry: string; country: string; employees: string; erp: string }; go: (tab: TabId) => void }) { return <section><div className="assessment-card report-card"><div className="report-heading"><div><span className="eyebrow">DIGITAL PRODUCT PASSPORT READINESS</span><h2>{profile.company || 'Company assessment'}</h2><p>{profile.industry} · {profile.country} · {profile.employees} employees · {profile.erp}</p></div><button className="button secondary" onClick={() => window.print()}><Printer size={16} />Print / save PDF</button></div><div className="report-summary"><strong>{level}</strong><p>{profile.company || 'Your organisation'} has an overall readiness score of {overall}%, with DPP at {scores.dpp ?? 0}% and PCF at {scores.pcf ?? 0}%.</p></div><div className="report-score-grid"><Metric label="Overall" value={`${overall}%`} note={level} /><Metric label="DPP" value={`${scores.dpp ?? 0}%`} note="Product data" /><Metric label="PCF" value={`${scores.pcf ?? 0}%`} note="Carbon data" /></div><h3>Priority findings</h3>{gaps.length ? <ul className="report-gaps">{gaps.slice(0, 5).map((gap) => <li key={gap.text}>{gap.category}: {gap.text}</li>)}</ul> : <p className="assessment-muted">No priority gaps identified.</p>}<h3>Recommended next steps</h3><ol className="report-steps"><li>Consolidate product, material, supplier, and compliance data for a pilot product family.</li><li>Define PCF methodology, system boundaries, data owners, and supplier-data collection.</li><li>Run a 90-day pilot and validate data quality before scaling.</li></ol></div><div className="assessment-actions"><button className="button secondary" onClick={() => go('roadmap')}>Back to roadmap</button></div></section> }
