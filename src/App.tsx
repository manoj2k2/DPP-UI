import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { FeaturePage } from './pages/DetailPages'
import { ApiProductDetails } from './pages/ApiProductDetails'
import { Passports } from './pages/Passports'
import { PcfPage } from './pages/PcfPage'
import { AuthPage } from './pages/AuthPage'
import { Operations } from './pages/Operations'
import { FileCheck2, ClipboardCheck, BarChart3 } from 'lucide-react'

export default function App() { return <Routes><Route path="/login" element={<AuthPage />} /><Route element={<Layout />}><Route path="/" element={<Dashboard />} /><Route path="/companies" element={<Operations type="companies" />} /><Route path="/products" element={<Operations type="products" />} /><Route path="/products/:id" element={<ApiProductDetails />} /><Route path="/materials" element={<Operations type="materials" />} /><Route path="/suppliers" element={<Operations type="suppliers" />} /><Route path="/compliance" element={<Operations type="compliance" />} /><Route path="/pcf" element={<PcfPage />} /><Route path="/passports" element={<Passports />} /><Route path="/assessment" element={<FeaturePage title="Readiness assessment" eyebrow="PROGRAM READINESS" description="Measure your DPP readiness and turn gaps into next actions." icon={ClipboardCheck} />} /><Route path="/reports" element={<FeaturePage title="Reports" eyebrow="INSIGHTS & EXPORTS" description="Build clear reports for DPP, PCF, compliance, and readiness." icon={BarChart3} />} /><Route path="/settings" element={<FeaturePage title="Settings" eyebrow="WORKSPACE SETTINGS" description="Configure your workspace, members, and integrations." icon={FileCheck2} />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes> }
