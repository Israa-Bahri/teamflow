import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthLayout from '../components/AuthLayout'
import { Field, PasswordField } from '../components/Field'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { token, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  // Already logged in? Skip this page and go to the dashboard.
  if (token) {
    return <Navigate to="/" replace />
  }

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
      // The server replies with { token, user }
      const res = await api.post('/auth/login', form)

      login(res.data.token, res.data.user) // save the session
      toast.success('Welcome back, ' + res.data.user.name + '!')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Cannot reach the server. Is it running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-clay hover:text-clay-dark">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="page-enter rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">
            {error}
          </p>
        )}

        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@gmail.com"
          value={form.email}
          onChange={handleChange}
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-clay px-4 py-3 font-semibold text-paper transition hover:bg-clay-dark active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login