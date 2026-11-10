import axios from 'axios'

// One shared Axios instance, so every request uses the same settings.
const api = axios.create({
  // Backend address. In production we set VITE_API_URL; locally we use port 5000.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Later (Day 3) we'll add the login token here.
export default api