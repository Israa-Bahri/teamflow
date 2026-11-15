import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client' // our shared Axios instance from Task 5 of Day 1

function Register() {
  // One state object holds all three input values.
  // These are "controlled inputs": React always knows what's typed in them.
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')       // message shown in red
  const [loading, setLoading] = useState(false) // true while waiting for the server

  const navigate = useNavigate() // lets us jump to another page from code

  // Runs on every keystroke. e.target.name is "name", "email" or "password",
  // so one function updates the right field for all three inputs.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Runs when the form is submitted
  async function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page
    setError('')

    // Quick checks in the browser. The server checks again, because it must never trust the browser.
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setError('Please fill in all fields')
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters')
    }

    setLoading(true)
    try {
      // Sends POST http://localhost:5000/api/auth/register with the form as JSON
      await api.post('/auth/register', form)
      navigate('/login') // success: go to the login page
    } catch (err) {
      // err.response.data.error is the message our server sent (e.g. "Email is already registered").
      // If there's no response at all, the server is probably off.
      setError(err.response?.data?.error || 'Cannot reach the server. Is it running?')
    } finally {
      setLoading(false) // runs whether it worked or failed
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>

        {/* Show the error box only when there is an error */}
        {error && <p className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm">{error}</p>}

        {/* value + onChange make each input "controlled" */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
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
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        {/* Disabled while loading, so it can't be clicked twice */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-sm">
          Already registered? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register