import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// Picks a greeting from the current hour of the day
function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function Navbar() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
    toast.success('Logged out. See you soon!')
  }

  // Today's date, like "Tuesday, 17 November"
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    // sticky + blur: the bar stays at the top and softly blurs what scrolls under it
    <header className="sticky top-0 z-10 bg-cream/85 backdrop-blur border-b border-sand px-4 md:px-8 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-muted">{today}</p>
        <h1 className="font-display text-lg md:text-xl font-semibold truncate">
          {greeting()}, {user?.name}
        </h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* An avatar circle with the first letter of the name */}
        <div className="h-9 w-9 rounded-full bg-honey text-ink font-semibold grid place-items-center">
          {user?.name?.[0]?.toUpperCase()}
        </div>

        <button
          onClick={handleLogout}
          className="text-sm rounded-full border border-sand bg-paper px-4 py-1.5 font-medium hover:border-clay hover:text-clay transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar