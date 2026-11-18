import { useState, useId } from 'react'
import { Field } from './Field'

// The form inside the pop-up, used for both creating and editing.
// Props: initialValues (empty for create, the project for edit),
// onSubmit (what saving does), onCancel, submitLabel (text on the save button).
function ProjectForm({
  initialValues = { title: '', description: '' },
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) {
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const descriptionId = useId() // links the description label to its textarea

  // Updates whichever input changed
  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault() // don't reload the page
    setError('')

    if (!values.title.trim()) {
      return setError('Please give your project a title')
    }

    setSaving(true)
    try {
      await onSubmit(values) // on success the parent closes the pop-up
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the project')
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

      {/* autoFocus puts the cursor in the title as soon as the pop-up opens.
          maxLength matches the limits our server enforces. */}
      <Field
        label="Title"
        name="title"
        placeholder="e.g. Website redesign"
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
          placeholder="What is this project about?"
          value={values.description}
          onChange={handleChange}
          maxLength={1000}
          className="w-full rounded-xl border border-sand bg-paper px-4 py-3 transition-colors focus:border-clay"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
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
    </form>
  )
}

export default ProjectForm