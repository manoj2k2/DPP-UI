export type Status = 'Ready' | 'Needs attention' | 'In review' | 'Draft'

export type Product = {
  id: string
  number: string
  name: string
  category: string
  weight: string
  status: Status
  passport: 'Generated' | 'Pending' | 'Not started'
  updated: string
}

export type Activity = { title: string; detail: string; time: string; tone: 'green' | 'blue' | 'amber' }
