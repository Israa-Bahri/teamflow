import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Kanban from './pages/Kanban'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Routes>
      {/* Private pages: the guard checks login first, then the Layout is shown */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/kanban" element={<Kanban />} />
        </Route>
      </Route>

      {/* Public pages: anyone can open these */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* "*" matches any other URL. We send the visitor to the home page.
          The guard then sends them to /login if they aren't logged in. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App