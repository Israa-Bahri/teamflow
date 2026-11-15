import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Before every request: attach the token if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// After every response: if the server says 401 (token expired or fake),
// clear the session and send the visitor to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Wrong password on the login/register forms also returns 401 or similar,
    // so we skip those. Their pages show their own error message.
    const url = error.config?.url || ''
    const isAuthForm = url.startsWith('/auth/login') || url.startsWith('/auth/register')

    if (error.response?.status === 401 && !isAuthForm) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api