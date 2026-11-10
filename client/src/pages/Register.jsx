import { Link } from 'react-router-dom'

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>

        <input type="text" placeholder="Name" className="w-full border rounded px-3 py-2" />
        <input type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input type="password" placeholder="Password" className="w-full border rounded px-3 py-2" />

        <button type="button" className="w-full bg-blue-600 text-white rounded py-2">
          Create account
        </button>

        <p className="text-sm">
          Already registered? <Link to="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register