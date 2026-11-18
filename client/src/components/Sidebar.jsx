import { NavLink } from 'react-router-dom'

// Small line icons drawn with SVG. "currentColor" makes them follow the text color.
function Icon({ path }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d={path} />
    </svg>
  )
}

// To add a menu item later, add one line here.
const links = [
  { label: 'Dashboard', to: '/', end: true, icon: 'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z' },
  { label: 'Projects', to: '/projects', icon: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { label: 'Kanban', to: '/kanban', icon: 'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v13h-4z' },
]

function Sidebar() {
  return (
    <aside className="bg-paper border-b md:border-b-0 md:border-r border-sand md:w-60 md:h-screen md:sticky md:top-0 p-3 md:p-5 flex md:flex-col gap-3 md:gap-8 items-center md:items-stretch">
      {/* Brand: a clay square with a check mark, and the name */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-clay text-paper grid place-items-center">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <span className="font-display text-xl font-semibold">TeamFlow</span>
      </div>

      {/* On phones the links scroll sideways if they don't fit */}
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {links.map((item) => (
          // NavLink knows if it matches the current page, so we can highlight it
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ' +
              (isActive
                ? 'bg-clay text-paper'
                : 'text-muted hover:bg-cream hover:text-ink')
            }
          >
            <Icon path={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar