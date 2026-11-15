import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import TaskForm from '../components/TaskForm'
import TaskCard from '../components/TaskCard'

const COLUMNS = [
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'DONE', label: 'Done' },
]

function Kanban() {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // A message for a failed status change. It's separate from "error"
  // so the board stays on screen when one change fails.
  const [notice, setNotice] = useState('')

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.get('/projects')
        setProjects(res.data)
        if (res.data.length > 0) {
          setProjectId(String(res.data[0].id))
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Could not reach the server')
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  async function loadTasks(id) {
    try {
      const res = await api.get('/projects/' + id + '/tasks')
      setTasks(res.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load tasks')
    }
  }

  useEffect(() => {
    if (projectId) loadTasks(projectId)
  }, [projectId])

  async function handleCreate(values) {
    await api.post('/projects/' + projectId + '/tasks', values)
    await loadTasks(projectId)
  }

  // Called by a TaskCard when its dropdown changes
  async function handleStatusChange(taskId, newStatus) {
    setNotice('')
    try {
      // Save the new status on the server. The server replies with the updated task.
      const res = await api.patch('/tasks/' + taskId, { status: newStatus })

      // Update the list in React state WITHOUT changing the old array:
      // map() builds a new array where only the changed task is replaced.
      setTasks((oldTasks) => oldTasks.map((t) => (t.id === taskId ? res.data : t)))
    } catch (err) {
      setNotice(err.response?.data?.error || 'Could not change the status')
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading...</p>
  }

  if (error) {
    return <p className="bg-red-100 text-red-700 rounded px-3 py-2">{error}</p>
  }

  if (projects.length === 0) {
    return (
      <p className="text-slate-500">
        You need a project first. <Link to="/projects" className="text-blue-600">Create one</Link>
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kanban</h1>

      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="border rounded px-3 py-2 bg-white"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3">New task</h2>
        <TaskForm onSubmit={handleCreate} />
      </div>

      {notice && <p className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm">{notice}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status)

          return (
            <div key={col.status} className="bg-slate-200 rounded p-3 space-y-3">
              <h2 className="font-semibold">
                {col.label} ({columnTasks.length})
              </h2>

              {columnTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks</p>
              ) : (
                columnTasks.map((t) => (
                  <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} />
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Kanban