import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import Select from '../components/Select'
import TaskForm from '../components/TaskForm'
import TaskCard from '../components/TaskCard'
import { Loading, ErrorBox, EmptyState } from '../components/StatusMessages'

// The three columns. "status" must match the values stored in the database.
// "dot" is the small colored circle next to the column name.
const COLUMNS = [
  { status: 'TODO', label: 'To Do', dot: 'bg-muted' },
  { status: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-honey' },
  { status: 'DONE', label: 'Done', dot: 'bg-teal' },
]

function Kanban() {
  const [projects, setProjects] = useState([])
  const [projectId, setProjectId] = useState('')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false) // is the "New task" pop-up open?
  const [draggingId, setDraggingId] = useState(null) // id of the card being dragged
  const [overColumn, setOverColumn] = useState(null) // column the card is hovering over
  const toast = useToast()

  // When the page opens, load the projects and select the first one
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

  // Whenever the selected project changes, load its tasks
  useEffect(() => {
    if (projectId) loadTasks(projectId)
  }, [projectId])

  async function handleCreate(values) {
    await api.post('/projects/' + projectId + '/tasks', values)
    await loadTasks(projectId)
    setShowForm(false)
    toast.success('Task added')
  }

  // Moves a task to another column. Used by BOTH the drop and the card menu.
  async function handleStatusChange(taskId, newStatus) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return // nothing to do

    const previous = tasks // remember the old list, in case we need to undo

    // 1. Move the card on screen immediately, so the board feels instant
    setTasks((old) => old.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))

    try {
      // 2. Save it on the server
      await api.patch('/tasks/' + taskId, { status: newStatus })
      if (newStatus === 'DONE') toast.success('Task completed')
    } catch (err) {
      // 3. It failed: put the card back and tell the user
      setTasks(previous)
      toast.error(err.response?.data?.error || 'Could not move the task')
    }
  }

  // Runs when a card is dropped on a column
  function handleDrop(e, status) {
    e.preventDefault()
    const id = Number(e.dataTransfer.getData('text/plain')) // the id stored at drag start
    setOverColumn(null)
    setDraggingId(null)
    handleStatusChange(id, status)
  }

  if (loading) return <Loading text="Loading board..." />
  if (error) return <ErrorBox message={error} />

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        message="Tasks live inside projects, so create a project first."
        actionLabel="Create a project"
        actionTo="/projects"
      />
    )
  }

  const currentProject = projects.find((p) => String(p.id) === projectId)

  return (
    <div className="space-y-8">
      {/* ---------- Header: title, project picker, new task button ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Kanban</h1>
          <p className="text-muted">Drag cards between columns, or use the menu on each card.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Our own dropdown, so the highlight is orange and not the browser's blue */}
          <Select
            className="max-w-full sm:max-w-xs"
            value={projectId}
            onChange={setProjectId}
            options={projects.map((p) => ({ value: String(p.id), label: p.title }))}
            ariaLabel="Project"
          />

          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-clay px-5 py-2.5 font-semibold text-paper transition hover:bg-clay-dark active:scale-95"
          >
            + New task
          </button>
        </div>
      </div>

      {/* ---------- The board ---------- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          // Keep only the tasks that belong in this column
          const columnTasks = tasks.filter((t) => t.status === col.status)

          return (
            <div
              key={col.status}
              // A column only accepts a drop if we cancel the browser's default in dragover
              onDragOver={(e) => {
                e.preventDefault()
                setOverColumn(col.status)
              }}
              // Clear the highlight when the card leaves this column
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOverColumn(null)
              }}
              onDrop={(e) => handleDrop(e, col.status)}
              className={
                'min-w-0 rounded-2xl border p-3 transition-colors ' +
                (overColumn === col.status
                  ? 'border-clay bg-clay/5'
                  : 'border-sand bg-paper/60')
              }
            >
              {/* Column header: colored dot, name, and a count badge */}
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={'h-2.5 w-2.5 rounded-full ' + col.dot} />
                <h2 className="font-display text-lg font-semibold">{col.label}</h2>
                <span className="ml-auto rounded-full bg-sand/70 px-2.5 py-0.5 text-xs font-medium text-muted">
                  {columnTasks.length}
                </span>
              </div>

              <div className="min-h-24 space-y-3">
                {columnTasks.length === 0 ? (
                  <p className="rounded-xl border-2 border-dashed border-sand px-3 py-6 text-center text-sm text-muted">
                    Drop a task here
                  </p>
                ) : (
                  columnTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      dragging={draggingId === t.id}
                      onStatusChange={handleStatusChange}
                      onDragStart={setDraggingId}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setOverColumn(null)
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ---------- "New task" pop-up ---------- */}
      {showForm && (
        <Modal
          title={'New task in ' + (currentProject ? currentProject.title : 'project')}
          onClose={() => setShowForm(false)}
        >
          <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  )
}

export default Kanban