import axios from 'axios'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api', timeout: 10_000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dpp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export type ApiList<T> = T[] | { value?: T[]; items?: T[]; data?: T[]; count?: number }
export function getApiItems<T>(response: ApiList<T> | undefined): T[] {
  if (Array.isArray(response)) return response
  return response?.value ?? response?.items ?? response?.data ?? []
}
export type LoginRequest = { email: string; password: string }
export type RegisterRequest = { firstName: string; lastName: string; email: string; password: string; companyId?: string; role?: string }
export type CompanyRequest = { companyName: string; vatNumber?: string; country?: string; industry?: string; employeeCount?: number }
export type ProductRequest = { companyId: string; productNumber: string; productName: string; productCategory?: string; description?: string; weight?: number }
export const demoProducts: ProductRequest[] = [
  { companyId: '00000000-0000-0000-0000-000000000001', productNumber: 'AM-BCP-001', productName: 'Battery Cooling Plate', productCategory: 'Thermal management', description: 'Aluminium cooling plate for EV battery systems.', weight: 12.6 },
  { companyId: '00000000-0000-0000-0000-000000000001', productNumber: 'AM-EDH-002', productName: 'E-Drive Housing', productCategory: 'Powertrain', description: 'Lightweight housing for electric drive units.', weight: 18.4 },
  { companyId: '00000000-0000-0000-0000-000000000001', productNumber: 'AM-CPA-003', productName: 'Charge Port Assembly', productCategory: 'Electrical', description: 'Charge port assembly for passenger vehicles.', weight: 2.8 },
]

export const authApi = {
  login: (payload: LoginRequest) => api.post('/auth/login', payload),
  register: (payload: RegisterRequest) => api.post('/auth/register', payload),
}
export const companyApi = {
  list: () => api.get<ApiList<Record<string, unknown>>>('/companies'),
  create: (payload: CompanyRequest) => api.post('/companies', payload),
  update: (id: string, payload: CompanyRequest) => api.put(`/companies/${id}`, payload),
}
export const productApi = {
  list: () => api.get<ApiList<Record<string, unknown>>>('/products'),
  get: (id: string) => api.get<Record<string, unknown>>(`/products/${id}`),
  create: (payload: ProductRequest) => api.post('/products', payload),
}
export const passportApi = {
  get: (productId: string) => api.get(`/passports/${productId}`),
  generate: (productId: string) => api.post('/passports/generate', productId, { headers: { 'Content-Type': 'application/json' } }),
}
export const healthApi = { get: () => api.get('/health') }
