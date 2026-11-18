import { useState, useId } from 'react'
import { Field } from './Field'

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

// What the form looks like when creating a new task
const EMPTY = { title: '', description: '', priority: 'MEDIUM', dueDate: '' }

// Props:
//   initialValues  what the inputs start with (empty for new, the task for edit)
//   onSubmit       what saving does
//   onCancel       closes the pop-up
//   onDelete       optional: if given, a Delete task button appears (used when editing)
//   submitLabel    text on the save button
function TaskForm({
  initialValues = EMPTY,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = 'Add task',
}) {
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const descriptionId = useId()

  // Updates whichever input changed
  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page
    setError('')

    if (!values.title.trim()) {
      return setError('Please give your task a title')
    }

    setSaving(true)
    try {
      await onSubmit(values) // on success the parent closes the pop-up
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the task')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="page-enter rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {error}
        </p>
      )}

      <Field
        label="Title"
        name="title"
        placeholder="e.g. Write the intro section"
        value={values.title}
        onChange={handleChange}
        maxLength={100}
        autoFocus
      />

      <div>
        <label htmlFor={descriptionId} className="block text-sm font-medium mb-1.5">
          Description <span className="text-muted font-normal">(optional)</span>
        </label>
        <textarea
          id={descriptionId}
          name="description"
          rows={3}
          placeholder="Any details to remember?"
          value={values.description}
          onChange={handleChange}
          maxLength={1000}
          className="w-full rounded-xl border border-sand bg-paper px-4 py-3 transition-colors focus:border-clay"
        />
      </div>

      {/* Priority: three pill buttons. The selected one is filled in terracotta. */}
      <div>
        <span className="block text-sm font-medium mb-1.5">Priority</span>
        <div role="group" aria-label="Priority" className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              type="button"
              key={p.value}
              aria-pressed={values.priority === p.value}
              onClick={() => setValues({ ...values, priority: p.value })}
              className={
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ' +
                (values.priority === p.value
                  ? 'border-clay bg-clay text-paper'
                  : 'border-sand hover:border-ink')
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="Due date (optional)"
        type="date"
        name="dueDate"
        value={values.dueDate}
        onChange={handleChange}
      />

      {/* Footer: Delete on the left (only when editing), Cancel and Save on the right */}
      <div className="flex items-center justify-between gap-2 pt-2">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full px-4 py-2 text-sm font-medium text-clay transition-colors hover:bg-clay/10"
          >
            Delete task
          </button>
        ) : (
          <span />
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-sand px-5 py-2 font-medium transition-colors hover:border-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-clay px-5 py-2 font-semibold text-paper transition hover:bg-clay-dark active:scale-95 disabled:opacity-60"
          >
            {saving ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}

export default TaskForm