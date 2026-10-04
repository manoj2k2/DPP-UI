import type { Activity, Product } from './models/types'

export const products: Product[] = [
  { id: '1', number: 'AX-4401', name: 'E-Drive Housing', category: 'Powertrain', weight: '18.4 kg', status: 'Ready', passport: 'Generated', updated: 'Today, 09:42' },
  { id: '2', number: 'AX-3910', name: 'Battery Cooling Plate', category: 'Thermal', weight: '6.8 kg', status: 'In review', passport: 'Pending', updated: 'Yesterday' },
  { id: '3', number: 'AX-2284', name: 'Steering Module', category: 'Chassis', weight: '4.2 kg', status: 'Needs attention', passport: 'Not started', updated: '18 Sep 2026' },
  { id: '4', number: 'AX-1702', name: 'Charge Port Assembly', category: 'Electrical', weight: '1.9 kg', status: 'Ready', passport: 'Generated', updated: '16 Sep 2026' },
  { id: '5', number: 'AX-1055', name: 'Rear Suspension Arm', category: 'Chassis', weight: '9.1 kg', status: 'Draft', passport: 'Not started', updated: '11 Sep 2026' },
]

export const activities: Activity[] = [
  { title: 'DPP generated', detail: 'E-Drive Housing · AX-4401', time: '12 min ago', tone: 'green' },
  { title: 'Document uploaded', detail: 'REACH declaration · Battery Cooling Plate', time: '1 hr ago', tone: 'blue' },
  { title: 'Assessment needs review', detail: 'Q3 readiness assessment', time: '3 hrs ago', tone: 'amber' },
  { title: 'Supplier invited', detail: 'NordWerk Components GmbH', time: 'Yesterday', tone: 'blue' },
]

export const navItems = [
  { label: 'Overview', icon: 'LayoutDashboard', path: '/' },
  { label: 'Companies', icon: 'Building2', path: '/companies' },
  { label: 'Products', icon: 'Box', path: '/products' },
  { label: 'Materials', icon: 'Layers3', path: '/materials' },
  { label: 'Suppliers', icon: 'Truck', path: '/suppliers' },
  { label: 'PCF data', icon: 'Leaf', path: '/pcf' },
  { label: 'Compliance', icon: 'FileCheck2', path: '/compliance' },
  { label: 'Passports', icon: 'QrCode', path: '/passports' },
  { label: 'Assessment', icon: 'ClipboardCheck', path: '/assessment' },
  { label: 'Reports', icon: 'BarChart3', path: '/reports' },
  { label: 'Catena-X', icon: 'Network', path: '/integrations/catena-x' },
  { label: 'EU Registry', icon: 'Landmark', path: '/registry' },
  { label: 'Help', icon: 'CircleHelp', path: '/help' },
]
