import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function Layout() {
  return (
    // flex-col on phones (sidebar on top), md:flex-row on desktop (sidebar beside content)
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      <Sidebar />

      {/* min-w-0 lets this column shrink instead of pushing the page wider than the screen */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar title="Welcome back" />

        {/* Less padding on phones (p-4), more on desktop (md:p-6) */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout