import { useState, useEffect } from 'react'
import api from '../api/client'
import ProjectForm from '../components/ProjectForm'

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)

  // A feedback message shown above the list: { type: 'success' | 'error', text: '...' }
  // It's separate from "error" so a failed delete doesn't replace the whole page.
  const [notice, setNotice] = useState(null)

  async function loadProjects() {
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  async function handleCreate(values) {
    setNotice(null)
    await api.post('/projects', values)
    await loadProjects()
  }

  async function handleUpdate(id, values) {
    setNotice(null)
    await api.patch('/projects/' + id, values)
    setEditingId(null)
    await loadProjects()
  }

  async function handleDelete(project) {
    setNotice(null)

    // confirm() shows the browser's OK / Cancel box. Cancel returns false.
    const ok = window.confirm(
      'Delete "' + project.title + '"? Its tasks will be deleted too. This cannot be undone.'
    )
    if (!ok) return // the user changed their mind, so do nothing

    try {
      await api.delete('/projects/' + project.id)
      setNotice({ type: 'success', text: '"' + project.title + '" was deleted' })
      await loadProjects() // refresh the list so it disappears
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.response?.data?.error || 'Could not delete the project',
      })
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading projects...</p>
  }

  if (error) {
    return <p className="bg-red-100 text-red-700 rounded px-3 py-2">{error}</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>

      {/* Feedback message: green for success, red for error */}
      {notice && (
        <p
          className={
            'rounded px-3 py-2 text-sm ' +
            (notice.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700')
          }
        >
          {notice.text}
        </p>
      )}

      {/* Create form */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3">New project</h2>
        <ProjectForm onSubmit={handleCreate} submitLabel="Create project" resetOnSuccess />
      </div>

      {/* List */}
      {projects.length === 0 ? (
        <p className="text-slate-500">No projects yet. Create your first one above!</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id} className="bg-white rounded shadow p-4">
              {editingId === p.id ? (
                <ProjectForm
                  initialValues={{ title: p.title, description: p.description || '' }}
                  onSubmit={(values) => handleUpdate(p.id, values)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save changes"
                />
              ) : (
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-semibold">{p.title}</h2>
                    {p.description && <p className="text-slate-500">{p.description}</p>}
                    <p className="text-xs text-slate-400 mt-2">
                      Created {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(p.id)}
                      className="text-sm bg-slate-200 hover:bg-slate-300 rounded px-3 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded px-3 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Projects