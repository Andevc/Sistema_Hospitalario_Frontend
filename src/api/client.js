import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const client = axios.create({ baseURL })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('siih_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('siih_token')
      localStorage.removeItem('siih_user')
      if (!location.pathname.startsWith('/login')) {
        location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// Extrae un mensaje de error legible desde una respuesta de FastAPI.
export function apiError(err) {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(' · ')
  }
  return err?.message || 'Ocurrió un error inesperado.'
}
