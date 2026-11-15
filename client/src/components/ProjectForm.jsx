import { useState } from 'react'

// Props (inputs from the parent page):
//   initialValues  = what the inputs start with (empty for create, the project for edit)
//   onSubmit       = function to run with the values when the form is saved
//   onCancel       = optional: shows a Cancel button
//   submitLabel    = text on the save button
//   resetOnSuccess = clear the inputs after saving (used for create)
function ProjectForm({
  initialValues = { title: '', description: '' },
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  resetOnSuccess = false,
}) {
  const [values, setValues] = useState(initialValues)
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
      await onSubmit(values) // the parent decides what saving means
      if (resetOnSuccess) setValues({ title: '', description: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm">{error}</p>}

      <input
        name="title"
        placeholder="Project title"
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

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>

        {/* Cancel button appears only when a parent gives us onCancel */}
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-slate-200 rounded px-4 py-2">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default ProjectForm