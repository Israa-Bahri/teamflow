const priorityStyles = {
  LOW: 'bg-slate-200 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-700',
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
]

function TaskCard({ task, onStatusChange }) {
  return (
    <div className="bg-white rounded shadow p-3 space-y-2">
      {/* break-words wraps very long words instead of overflowing the card */}
      <h3 className="font-semibold break-words">{task.title}</h3>

      {task.description && (
        <p className="text-sm text-slate-500 break-words">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={'rounded px-2 py-0.5 ' + priorityStyles[task.priority]}>
          {task.priority}
        </span>

        {task.dueDate && (
          <span className="text-slate-400">
            Due {new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}
          </span>
        )}
      </div>

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