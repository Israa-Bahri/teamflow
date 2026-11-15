import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth() // the function that saves the session
  const navigate = useNavigate()

  // One handler updates whichever input changed
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault() // don't reload the page
    setError('')

    if (!form.email.trim() || !form.password) {
      return setError('Please enter your email and password')
    }

    setLoading(true)
    try {
      // Ask the server to log us in. It replies with { token, user }.
      const res = await api.post('/auth/login', form)

      // Save the session, then go to the dashboard
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      // Show the server's message (e.g. "Invalid email or password")
      setError(err.response?.data?.error || 'Cannot reach the server. Is it running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

        {error && <p className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-sm">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </div>
  )
}

export default Login