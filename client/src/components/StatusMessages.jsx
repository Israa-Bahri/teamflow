import { Link } from 'react-router-dom'

// Shown while we wait for the server (slow API)
export function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-slate-500">
      {/* A small spinning circle made with Tailwind classes */}
      <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-blue-600 animate-spin" />
      <span>{text}</span>
    </div>
  )
}

// Shown when a request fails. "Try again" reloads the page.
export function ErrorBox({ message }) {
  return (
    <div className="bg-red-100 text-red-700 rounded px-4 py-3 flex items-center justify-between gap-4">
      <span>{message}</span>
      <button
        onClick={() => window.location.reload()}
        className="text-sm bg-white text-red-700 rounded px-3 py-1 shadow"
      >
        Try again
      </button>
    </div>
  )
}

// Shown when there is nothing to display yet (empty database).
// actionLabel + actionTo are optional: they add a button that links somewhere.
export function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="bg-white rounded shadow p-8 text-center space-y-2">
      <h2 className="font-semibold text-lg">{title}</h2>
      <p className="text-slate-500">{message}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-block mt-2 bg-blue-600 text-white rounded px-4 py-2"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}