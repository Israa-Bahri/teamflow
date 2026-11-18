import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthLayout from '../components/AuthLayout'
import { Field, PasswordField } from '../components/Field'

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  // Already logged in? No need to register again.
  if (token) {
    return <Navigate to="/" replace />
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Quick checks in the browser. The server checks again, because it never trusts the browser.
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setError('Please fill in all fields')
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters')
    }

    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast.success('Account created! You can log in now.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Cannot reach the server. Is it running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-clay hover:text-clay-dark">
            Log in
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
          label="Name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
        />

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
          label="Password (at least 8 characters)"
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-clay px-4 py-3 font-semibold text-paper transition hover:bg-clay-dark active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register