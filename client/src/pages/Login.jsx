import { Link } from 'react-router-dom'

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      {/* A white card centered on the page */}
      <form className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

        {/* Inputs do nothing yet. We make them work on Day 3. */}
        <input type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input type="password" placeholder="Password" className="w-full border rounded px-3 py-2" />

        <button type="button" className="w-full bg-blue-600 text-white rounded py-2">
          Login
        </button>

        <p className="text-sm">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </form>
    </div>
  )
}

export default Login