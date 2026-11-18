import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import ProjectForm from '../components/ProjectForm'
import { Loading, ErrorBox, EmptyState } from '../components/StatusMessages'

// Each card gets a colored initial badge. The colors take turns.
const BADGES = [
  'bg-clay/15 text-clay-dark',
  'bg-teal/15 text-teal',
  'bg-honey/30 text-ink',
]

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  // Which pop-up is open: null (none), { type: 'create' },
  // { type: 'edit', project } or { type: 'delete', project }
  const [modal, setModal] = useState(null)

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

  // Each handler below sends the request, reloads the list, closes the pop-up
  // and shows a toast. If the request fails, the form shows the error itself.
  async function handleCreate(values) {
    await api.post('/projects', values)
    await loadProjects()
    setModal(null)
    toast.success('Project created')
  }

  async function handleUpdate(id, values) {
    await api.patch('/projects/' + id, values)
    await loadProjects()
    setModal(null)
    toast.success('Changes saved')
  }

  async function handleDelete(project) {
    setDeleting(true)
    try {
      await api.delete('/projects/' + project.id)
      await loadProjects()
      setModal(null)
      toast.success('"' + project.title + '" was deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete the project')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Loading text="Loading projects..." />
  if (error) return <ErrorBox message={error} />

  return (
    <div className="space-y-8">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Projects</h1>
          <p className="text-muted">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        <button
          onClick={() => setModal({ type: 'create' })}
          className="rounded-full bg-clay px-5 py-2.5 font-semibold text-paper transition hover:bg-clay-dark active:scale-95"
        >
          + New project
        </button>
      </div>

      {/* ---------- Cards or empty state ---------- */}
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          message="A project is a home for related tasks. Start with your first one."
          actionLabel="Create a project"
          onAction={() => setModal({ type: 'create' })}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p, index) => (
            // "group" lets the buttons inside react when the whole card is hovered
            <li
              key={p.id}
              className="group flex flex-col rounded-2xl border border-sand bg-paper p-5 transition duration-200 hover:-translate-y-1 hover:border-clay/40 hover:shadow-lg hover:shadow-ink/10"
            >
              {/* Colored initial badge. index % 3 cycles through the three colors. */}
              <div
                className={
                  'mb-4 grid h-10 w-10 place-items-center rounded-xl font-display text-lg font-semibold ' +
                  BADGES[index % BADGES.length]
                }
              >
                {p.title[0].toUpperCase()}
              </div>

              {/* break-words stops long words from stretching the card;
                  line-clamp-3 cuts long descriptions after three lines */}
              <h2 className="font-display text-xl font-semibold break-words">{p.title}</h2>
              {p.description && (
                <p className="mt-1 text-muted break-words line-clamp-3">{p.description}</p>
              )}

              <p className="mt-3 text-xs text-muted">
                Created{' '}
                {new Date(p.createdAt).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>

              {/* On desktop these fade in when you hover the card or tab to them.
                  On phones they're always visible (no hover on touch screens). */}
              <div className="mt-auto flex gap-2 pt-4 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <button
                  onClick={() => setModal({ type: 'edit', project: p })}
                  className="rounded-full border border-sand px-4 py-1.5 text-sm font-medium transition-colors hover:border-ink"
                >
                  Edit
                </button>
                <button
                  onClick={() => setModal({ type: 'delete', project: p })}
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-clay transition-colors hover:bg-clay/10"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ---------- Pop-ups ---------- */}
      {modal?.type === 'create' && (
        <Modal title="New project" onClose={() => setModal(null)}>
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setModal(null)}
            submitLabel="Create project"
          />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Edit project" onClose={() => setModal(null)}>
          <ProjectForm
            initialValues={{
              title: modal.project.title,
              description: modal.project.description || '',
            }}
            onSubmit={(values) => handleUpdate(modal.project.id, values)}
            onCancel={() => setModal(null)}
            submitLabel="Save changes"
          />
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Delete this project?" onClose={() => setModal(null)}>
          <p className="text-muted break-words">
            <span className="font-medium text-ink">"{modal.project.title}"</span> and all of
            its tasks will be permanently deleted. This can't be undone.
          </p>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setModal(null)}
              className="rounded-full border border-sand px-5 py-2 font-medium transition-colors hover:border-ink"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(modal.project)}
              disabled={deleting}
              className="rounded-full bg-clay px-5 py-2 font-semibold text-paper transition hover:bg-clay-dark active:scale-95 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Projects