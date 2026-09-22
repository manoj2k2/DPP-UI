import { FormEvent, useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'

export function AuthPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await authApi.login({ email, password })
      const body = response.data as { token?: string; accessToken?: string } | string
      const token = typeof body === 'string' ? body : body.token ?? body.accessToken
      if (token) localStorage.setItem('dpp_token', token)
      navigate('/', { replace: true })
    } catch {
      setError('Unable to sign in. Check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="auth-screen"><section className="auth-panel"><div className="brand auth-brand"><div className="brand-mark">A</div><div><strong>ATLAS</strong><small>DPP COMMAND CENTER</small></div></div><div className="auth-copy"><span className="eyebrow">SECURE WORKSPACE</span><h1>Welcome back.</h1><p>Sign in to manage your digital product passport program.</p></div><form onSubmit={submit}><label>Email address<div className="auth-input"><Mail size={16} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></div></label><label>Password<div className="auth-input"><LockKeyhole size={16} /><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></div></label>{error && <p className="auth-error">{error}</p>}<button className="button primary auth-submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}<ArrowRight size={16} /></button></form><div className="auth-foot"><ShieldCheck size={15} />Your workspace is protected with JWT authentication.<span>New company? <Link to="/register">Start self-onboarding</Link></span></div></section><aside className="auth-aside"><span className="eyebrow">ATLAS DIGITAL PRODUCT PASSPORTS</span><h2>Turn product data into trusted proof.</h2><p>Bring materials, suppliers, carbon data, and compliance evidence into one verifiable product story.</p><div className="auth-stat"><strong>78%</strong><span>average readiness across active programs</span></div></aside></main>
}
