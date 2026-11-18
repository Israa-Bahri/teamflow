import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function Layout() {
  const location = useLocation() // the current address, like "/projects"

  return (
    // On phones everything stacks. From the "md" size up, the sidebar sits on the left.
    <div className="min-h-screen md:flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        {/* key={location.pathname} makes React rebuild this box on every page change,
            so the "page-enter" animation plays each time you open a page */}
        <main
          key={location.pathname}
          className="page-enter px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout