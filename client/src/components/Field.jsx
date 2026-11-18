import { useState, useId } from 'react'

// The look shared by every input. We keep it in one place.
const inputClass =
  'w-full rounded-xl border border-sand bg-paper px-4 py-3 transition-colors focus:border-clay'

// A normal input with a label above it. Any extra props (name, value, onChange,
// placeholder...) are passed straight to the <input> through {...props}.
export function Field({ label, ...props }) {
  const id = useId() // a unique id that links the label to its input
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
      </label>
      <input id={id} {...props} className={inputClass} />
    </div>
  )
}

// A password input with a Show / Hide button
export function PasswordField({ label, ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false) // is the password shown as text?

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          {...props}
          type={visible ? 'text' : 'password'}
          className={inputClass + ' pr-16'}
        />
        {/* type="button" so clicking it doesn't submit the form */}
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-clay"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}