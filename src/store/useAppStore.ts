import { create } from 'zustand'

type AppState = {
  dark: boolean
  company: string
  notifications: number
  toggleTheme: () => void
  setCompany: (company: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  dark: false,
  company: 'Axiom Mobility',
  notifications: 4,
  toggleTheme: () => set((state) => ({ dark: !state.dark })),
  setCompany: (company) => set({ company }),
  clearNotifications: () => set({ notifications: 0 }),
}))
