import { Loading, ErrorBox } from '../components/StatusMessages'
import { useState, useEffect } from 'react'
import api from '../api/client'

// A small reusable card. "label" and "value" are props.
function KpiCard({ label, value }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <p className="text-slate-500">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null) // null until the server answers
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Runs once when the page opens: ask the server for the numbers
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/stats')
        setStats(res.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Could not reach the server')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

    if (loading) return <Loading text="Loading dashboard..." />
    if (error) return <ErrorBox message={error} />

  // Completion percent. If there are no tasks, dividing by zero would give NaN,
  // so we check first and show 0 in that case.
  const percent =
    stats.totalTasks === 0 ? 0 : Math.round((stats.completedTasks / stats.totalTasks) * 100)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* 1 column on phones, 2 on small screens, 4 on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Projects" value={stats.projects} />
        <KpiCard label="Tasks" value={stats.totalTasks} />
        <KpiCard label="Done" value={stats.completedTasks} />
        <KpiCard label="Completion" value={percent + '%'} />
      </div>

      {/* A progress bar: its filled width is the percentage */}
      <div className="bg-white rounded shadow p-4">
        <p className="text-slate-500 mb-2">Overall progress</p>
        <div className="w-full bg-slate-200 rounded h-3">
          <div className="bg-blue-600 h-3 rounded" style={{ width: percent + '%' }} />
        </div>
      </div>

      {/* A friendly hint when there's nothing yet */}
      {stats.totalTasks === 0 && (
        <p className="text-slate-500">No tasks yet. Add some on the Kanban page.</p>
      )}
    </div>
  )
}

export default Dashboard