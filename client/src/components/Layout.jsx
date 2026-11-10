import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function Layout() {
  return (
    // flex-col on phones (stacked), md:flex-row on desktop (sidebar beside content)
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* We pass the title prop into Navbar here */}
        <Navbar title="Welcome back" />

        {/* Outlet = the spot where the current page appears */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout