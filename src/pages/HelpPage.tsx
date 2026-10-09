import { Building2, CheckCircle2, KeyRound, Landmark, LockKeyhole, UserPlus } from 'lucide-react'
import './help-page.css'

const onboardingSteps = [
  { label: 'Customer signs up', icon: UserPlus },
  { label: 'Identify legal entity', icon: Building2 },
  { label: 'EU Registry enrolment / verification', icon: Landmark },
  { label: 'Authorisation to use Registry', icon: CheckCircle2 },
  { label: 'Configure Registry credentials/API access', icon: KeyRound },
  { label: 'Your SaaS stores connection securely', icon: LockKeyhole },
  { label: 'Customer can register DPPs', icon: CheckCircle2 },
]

export function HelpPage() {
  return (
    <div className="page help-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ATLAS RESOURCE HUB</span>
          <h1>Help</h1>
          <p>Guidance for onboarding customers to digital product passport registration.</p>
        </div>
      </div>

      <section className="help-hint panel" aria-labelledby="onboarding-hint-title">
        <div className="help-hint-heading">
          <span className="help-hint-icon"><Landmark size={19} /></span>
          <div>
            <span className="eyebrow">USER HINT</span>
            <h2 id="onboarding-hint-title">SaaS onboarding workflow</h2>
          </div>
        </div>
        <p className="help-hint-intro">SaaS should therefore have an onboarding workflow like:</p>
        <ol className="onboarding-flow">
          {onboardingSteps.map(({ label, icon: Icon }, index) => (
            <li key={label} className="onboarding-step">
              <span className="onboarding-step-number">{String(index + 1).padStart(2, '0')}</span>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
