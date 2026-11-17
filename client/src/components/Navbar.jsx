import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow px-4 md:px-6 py-3 md:py-4 flex justify-between items-center gap-3">
      <h1 className="text-lg font-semibold">{title}</h1>

      {user ? (
        <div className="flex items-center gap-3 min-w-0">
          {/* truncate cuts a long name with "..." instead of overflowing */}
          <span className="font-semibold truncate max-w-[7rem] sm:max-w-xs">
            Hi, {user.name}
          </span>
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