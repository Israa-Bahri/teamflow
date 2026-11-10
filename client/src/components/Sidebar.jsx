import { Link } from 'react-router-dom'

// A plain array of links. To add a menu item later, add one line here.
const links = [
  { label: 'Dashboard', to: '/' },
  { label: 'Projects', to: '/projects' }, // page comes in Task 7
  { label: 'Kanban', to: '/kanban' },     // page comes in Task 7
]

function Sidebar() {
  return (
    // w-full on phones (sits on top), md:w-56 on bigger screens (side column)
    <aside className="w-full md:w-56 bg-slate-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">TeamFlow</h2>

      <nav className="flex md:flex-col gap-2">
        {/* .map() turns each item in the array into a <Link> */}
        {links.map((item) => (
          <Link
            key={item.to} // React needs a unique key for list items
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