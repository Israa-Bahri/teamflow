import { useState, useEffect } from 'react'
import api from '../api/client'
import ProjectForm from '../components/ProjectForm'
import { Loading, ErrorBox, EmptyState } from '../components/StatusMessages'

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }

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

    const ok = window.confirm(
      'Delete "' + project.title + '"? Its tasks will be deleted too. This cannot be undone.'
    )
    if (!ok) return

    try {
      await api.delete('/projects/' + project.id)
      setNotice({ type: 'success', text: '"' + project.title + '" was deleted' })
      await loadProjects()
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.response?.data?.error || 'Could not delete the project',
      })
    }
  }

  if (loading) return <Loading text="Loading projects..." />
  if (error) return <ErrorBox message={error} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>

      {notice && (
        <p
          className={
            'rounded px-3 py-2 text-sm break-words ' +
            (notice.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700')
          }
        >
          {notice.text}
        </p>
      )}

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3">New project</h2>
        <ProjectForm onSubmit={handleCreate} submitLabel="Create project" resetOnSuccess />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          message="Create your first one using the form above."
        />
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
                // On phones the buttons go BELOW the text (flex-col);
                // from the "sm" size up they sit beside it (sm:flex-row).
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  {/* min-w-0 + break-words stop a long title from stretching the card */}
                  <div className="min-w-0 break-words">
                    <h2 className="font-semibold">{p.title}</h2>
                    {p.description && <p className="text-slate-500">{p.description}</p>}
                    <p className="text-xs text-slate-400 mt-2">
                      Created {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* shrink-0 keeps the buttons from being squashed */}
                  <div className="flex gap-2 shrink-0">
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