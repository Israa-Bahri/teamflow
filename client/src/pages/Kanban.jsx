import { useState } from 'react'

function Kanban() {
  // Mock tasks. Each has a status: TODO, IN_PROGRESS or DONE.
  const [tasks] = useState([
    { id: 1, title: 'Design logo', status: 'TODO' },
    { id: 2, title: 'Build navbar', status: 'IN_PROGRESS' },
    { id: 3, title: 'Set up repo', status: 'DONE' },
    { id: 4, title: 'Write README', status: 'TODO' },
  ])

  // The three columns we want to show
  const columns = [
    { status: 'TODO', label: 'To Do' },
    { status: 'IN_PROGRESS', label: 'In Progress' },
    { status: 'DONE', label: 'Done' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kanban</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.status} className="bg-slate-200 rounded p-3">
            <h2 className="font-semibold mb-2">{col.label}</h2>

            {/* filter() keeps only tasks matching this column, map() draws them */}
            {tasks
              .filter((t) => t.status === col.status)
              .map((t) => (
                <div key={t.id} className="bg-white rounded shadow p-3 mb-2">
                  {t.title}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Kanban