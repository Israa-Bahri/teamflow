import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// A "guard": it decides whether to show the page or send the visitor to login.
function ProtectedRoute() {
  const { token } = useAuth()

  // No token = not logged in -> redirect to /login.
  // "replace" removes this step from history, so Back doesn't loop.
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Logged in -> show the page that is inside this guard
  return <Outlet />
}

export default ProtectedRoute