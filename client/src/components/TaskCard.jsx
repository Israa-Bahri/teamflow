import Select from './Select'

// Colors and labels for each priority
const PRIORITY_STYLES = {
  LOW: 'bg-sand/70 text-muted',
  MEDIUM: 'bg-honey/30 text-ink',
  HIGH: 'bg-clay/15 text-clay-dark',
}
const PRIORITY_LABELS = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' }

// The options in the "move to" menu
const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
]

// Props:
//   task            the task to show
//   dragging        true while THIS card is being dragged (it fades out)
//   onStatusChange  called with (task id, new status) when the menu changes
//   onDragStart     called with the task id when a drag begins
//   onDragEnd       called when the drag finishes
function TaskCard({ task, dragging, onStatusChange, onDragStart, onDragEnd }) {
  // Today at midnight (UTC). A due date before it, on an unfinished task, is overdue.
  const todayUtc = new Date(new Date().toISOString().slice(0, 10))
  const overdue =
    task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < todayUtc

  return (
    <div
      draggable // lets the browser drag this element
      onDragStart={(e) => {
        // Store the task id in the drag, so the column we drop on can read it
        e.dataTransfer.setData('text/plain', String(task.id))
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(task.id)
      }}
      onDragEnd={onDragEnd}
      className={
        'cursor-grab active:cursor-grabbing rounded-xl border border-sand bg-paper p-3 shadow-sm ' +
        'transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-ink/10 ' +
        (dragging ? 'opacity-40' : '')
      }
    >
      {/* A finished task gets a line through its title */}
      <h3
        className={
          'font-medium break-words ' +
          (task.status === 'DONE' ? 'line-through text-muted' : '')
        }
      >
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-1 text-sm text-muted break-words line-clamp-3">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={'rounded-full px-2.5 py-0.5 font-medium ' + PRIORITY_STYLES[task.priority]}>
          {PRIORITY_LABELS[task.priority]}
        </span>

        {/* timeZone UTC keeps the date from shifting by one day */}
        {task.dueDate && (
          <span className={overdue ? 'font-medium text-clay' : 'text-muted'}>
            {overdue ? 'Overdue: ' : 'Due '}
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              timeZone: 'UTC',
            })}
          </span>
        )}
      </div>

      {/* The menu works on phones, where dragging doesn't, and for keyboard users */}
      <Select
        size="sm"
        className="mt-3"
        value={task.status}
        onChange={(newStatus) => onStatusChange(task.id, newStatus)}
        options={STATUS_OPTIONS}
        ariaLabel="Move task to another column"
      />
    </div>
  )
}

export default TaskCard