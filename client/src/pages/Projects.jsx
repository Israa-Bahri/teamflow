import { useState } from 'react'

function Projects() {
  // useState keeps data that can change. React redraws the page when it changes.
  // [value, functionToChangeIt] = useState(startingValue)
  const [projects] = useState([
    { id: 1, title: 'Website redesign', description: 'New landing page' },
    { id: 2, title: 'Mobile app', description: 'First prototype' },
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>

      <ul className="space-y-3">
        {projects.map((p) => (
          <li key={p.id} className="bg-white rounded shadow p-4">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-slate-500">{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Projects