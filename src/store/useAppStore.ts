import { create } from 'zustand'

type AppState = {
  dark: boolean
  activeTenantId: string
  activeTenantName: string
  notifications: number
  toggleTheme: () => void
  setActiveTenant: (id: string, name: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  dark: false,
  activeTenantId: '',
  activeTenantName: '',
  notifications: 4,
  toggleTheme: () => set((state) => ({ dark: !state.dark })),
  setActiveTenant: (activeTenantId, activeTenantName) => set({ activeTenantId, activeTenantName }),
  clearNotifications: () => set({ notifications: 0 }),
}))
