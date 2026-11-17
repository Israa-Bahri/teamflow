import { Link } from 'react-router-dom'

// To add a menu item later, add one line here.
const links = [
  { label: 'Dashboard', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Kanban', to: '/kanban' },
]

function Sidebar() {
  return (
    // On phones it's a bar across the top; on desktop (md:) a column on the left
    <aside className="w-full md:w-56 bg-slate-800 text-white p-3 md:p-4">
      <h2 className="text-xl font-bold mb-2 md:mb-4">TeamFlow</h2>

      {/* flex-wrap lets the links wrap onto a second line on very narrow screens */}
      <nav className="flex flex-wrap md:flex-col gap-2">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="px-3 py-2 rounded hover:bg-slate-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar