import { Link } from 'react-router-dom'

// Shown while we wait for the server
export function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-muted">
      {/* A small spinning ring */}
      <div className="h-5 w-5 rounded-full border-2 border-sand border-t-clay animate-spin" />
      <span>{text}</span>
    </div>
  )
}

// Shown when a request fails. "Try again" reloads the page.
export function ErrorBox({ message }) {
  return (
    <div className="rounded-2xl bg-clay/10 px-5 py-4 text-clay-dark flex items-center justify-between gap-4">
      <span>{message}</span>
      <button
        onClick={() => window.location.reload()}
        className="shrink-0 rounded-full bg-paper px-4 py-1.5 text-sm font-medium shadow-sm hover:shadow transition-shadow"
      >
        Try again
      </button>
    </div>
  )
}

// Shown when there is nothing to display yet.
// For a button, give actionLabel plus EITHER actionTo (a link to another page)
// OR onAction (a function to run when the button is clicked).
export function EmptyState({ title, message, actionLabel, actionTo, onAction }) {
  const buttonClass =
    'inline-block mt-3 rounded-full bg-clay px-5 py-2 font-semibold text-paper transition hover:bg-clay-dark active:scale-95'

  return (
    <div className="rounded-2xl border-2 border-dashed border-sand bg-paper/60 p-10 text-center">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-muted">{message}</p>

      {actionLabel && actionTo && (
        <Link to={actionTo} className={buttonClass}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className={buttonClass}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}