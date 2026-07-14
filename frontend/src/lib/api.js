import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eaachecker_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const AuthAPI = {
  register: (email, password) => api.post('/api/auth/register', { email, password }).then((r) => r.data),
  login: (email, password) => api.post('/api/auth/login', { email, password }).then((r) => r.data),
  me: () => api.get('/api/me').then((r) => r.data),
}

export const ScanAPI = {
  create: (url, language) => api.post('/api/scan', { url, language }).then((r) => r.data),
  get: (id) => api.get(`/api/scan/${id}`).then((r) => r.data),
  claim: (id) => api.patch(`/api/scan/${id}/claim`).then((r) => r.data),
  myScans: () => api.get('/api/me/scans').then((r) => r.data),
}

export const ReportAPI = {
  get: (id) => api.get(`/api/report/${id}`).then((r) => r.data),
}

export const BillingAPI = {
  checkoutSession: () => api.post('/api/billing/checkout-session').then((r) => r.data),
  portalSession: () => api.post('/api/billing/portal-session').then((r) => r.data),
}

export default api
