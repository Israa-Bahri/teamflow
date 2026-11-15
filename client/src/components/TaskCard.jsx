const priorityStyles = {
  LOW: 'bg-slate-200 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-700',
}

// The statuses shown in the dropdown (values match the database)
const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
]

// Props: task = the task to show, onStatusChange = function the parent gives us.
// We call it with (task id, new status) when the dropdown changes.
function TaskCard({ task, onStatusChange }) {
  return (
    <div className="bg-white rounded shadow p-3 space-y-2">
      <h3 className="font-semibold">{task.title}</h3>

      {task.description && <p className="text-sm text-slate-500">{task.description}</p>}

      <div className="flex items-center gap-2 text-xs">
        <span className={'rounded px-2 py-0.5 ' + priorityStyles[task.priority]}>
          {task.priority}
        </span>

        {task.dueDate && (
          <span className="text-slate-400">
            Due {new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}
          </span>
        )}
      </div>

      {/* The dropdown shows the current status. Changing it tells the parent. */}
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default TaskCard