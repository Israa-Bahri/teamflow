import { useState } from 'react'

// A form for creating a task. The parent page decides what "submit" does
// by passing in the onSubmit function.
function TaskForm({ onSubmit }) {
  // What the inputs look like when empty. The priority starts at MEDIUM.
  const empty = { title: '', description: '', priority: 'MEDIUM', dueDate: '' }

  const [values, setValues] = useState(empty)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Updates whichever input changed (controlled inputs)
  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault() // don't reload the page
    setError('')

    if (!values.title.trim()) {
      return setError('Title is required')
    }

    setSaving(true)
    try {
      await onSubmit(values) // the parent sends it to the server
      setValues(empty)       // clear the form after saving
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm">{error}</p>}

      <input
        name="title"
        placeholder="Task title"
        value={values.title}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
      />

      <textarea
        name="description"
        placeholder="Description (optional)"
        value={values.description}
        onChange={handleChange}
        rows={2}
        className="w-full border rounded px-3 py-2"
      />

      <div className="flex gap-3 flex-wrap">
        {/* A dropdown. The values match what the server accepts. */}
        <select
          name="priority"
          value={values.priority}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          <option value="LOW">Low priority</option>
          <option value="MEDIUM">Medium priority</option>
          <option value="HIGH">High priority</option>
        </select>

        {/* type="date" gives a calendar picker and sends text like 2026-12-01 */}
        <input
          type="date"
          name="dueDate"
          value={values.dueDate}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {saving ? 'Adding...' : 'Add task'}
      </button>
    </form>
  )
}

export default TaskForm