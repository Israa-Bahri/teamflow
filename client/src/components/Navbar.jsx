import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()            // clear the saved token and user
    navigate('/login')  // go back to the login page
  }

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">{title}</h1>

      {user ? (
        <div className="flex items-center gap-4">
          <span className="font-semibold">Hi, {user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-slate-200 hover:bg-slate-300 rounded px-3 py-1"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
      )}
    </header>
  )
}

export default Navbar