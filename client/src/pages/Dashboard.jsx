import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Loading, ErrorBox } from '../components/StatusMessages'

// Counts from 0 up to "target" in a smooth animation (fast at first, slow at the end)
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    // People who prefer less motion get the final number almost instantly
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const length = reduced ? 1 : duration
    const startTime = performance.now()
    let frame

    function tick(now) {
      // progress goes from 0 to 1 over "length" milliseconds
      const progress = Math.min(Math.max((now - startTime) / length, 0), 1)
      const eased = 1 - Math.pow(1 - progress, 3) // the slow-down at the end
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick) // draw the next frame
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame) // stop if the page closes mid-animation
  }, [target, duration])

  return value
}

// One statistic card. Props: label, value (a number), suffix (like "%"),
// icon (an SVG path), tone (the color classes for the icon badge).
function KpiCard({ label, value, suffix = '', icon, tone }) {
  const shown = useCountUp(value) // the number currently displayed while counting

  return (
    <div className="rounded-2xl border border-sand bg-paper p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/10">
      <div className={'mb-4 grid h-10 w-10 place-items-center rounded-xl ' + tone}>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={icon} />
        </svg>
      </div>
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-4xl font-semibold">
        {shown}
        {suffix}
      </p>
    </div>
  )
}

// The progress bar panel
function ProgressPanel({ percent, total, completed }) {
  // The bar starts empty and fills a moment after the page opens,
  // so the CSS transition animates it.
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setWidth(percent), 150)
    return () => clearTimeout(id)
  }, [percent])

  // A short message that fits the progress
  let message
  if (total === 0) message = 'No tasks yet. Add some on the Kanban page.'
  else if (percent === 100) message = 'Everything is done. Nice work!'
  else if (percent >= 67) message = 'Almost there.'
  else if (percent >= 34) message = 'Good progress. Keep going.'
  else message = 'Just getting started.'

  const finished = total > 0 && percent === 100

  return (
    <div className="rounded-2xl border border-sand bg-paper p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Overall progress</h2>
        <p className="text-sm text-muted">
          {completed} of {total} {total === 1 ? 'task' : 'tasks'} done
        </p>
      </div>

      {/* The track (light) and the fill (orange, or teal when everything is done) */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-sand/70">
        <div
          className={
            'h-full rounded-full transition-all duration-1000 ease-out ' +
            (finished ? 'bg-teal' : 'bg-clay')
          }
          style={{ width: width + '%' }}
        />
      </div>

      <p className="mt-3 text-sm text-muted">{message}</p>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null) // null until the server answers
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Runs once when the page opens: ask the server for the numbers
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/stats')
        setStats(res.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Could not reach the server')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) return <Loading text="Loading overview..." />
  if (error) return <ErrorBox message={error} />

  // Completion percent. With no tasks, dividing by zero would give NaN,
  // so we check first and show 0 in that case.
  const percent =
    stats.totalTasks === 0 ? 0 : Math.round((stats.completedTasks / stats.totalTasks) * 100)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Overview</h1>
        <p className="text-muted">Here is where your work stands today.</p>
      </div>

      {/* 2 cards per row on phones, 4 on large screens */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Projects"
          value={stats.projects}
          tone="bg-clay/15 text-clay-dark"
          icon="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        />
        <KpiCard
          label="Tasks"
          value={stats.totalTasks}
          tone="bg-honey/30 text-ink"
          icon="M9 5h6M9 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4"
        />
        <KpiCard
          label="Done"
          value={stats.completedTasks}
          tone="bg-teal/15 text-teal"
          icon="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l2.7 2.7L16 9.5"
        />
        <KpiCard
          label="Completion"
          value={percent}
          suffix="%"
          tone="bg-ink/10 text-ink"
          icon="M4 19V5M4 19h16M8 15l3-4 3 2 5-6"
        />
      </div>

      <ProgressPanel
        percent={percent}
        total={stats.totalTasks}
        completed={stats.completedTasks}
      />

      <div className="flex flex-wrap gap-3">
        <Link
          to="/projects"
          className="rounded-full bg-clay px-5 py-2.5 font-semibold text-paper transition hover:bg-clay-dark active:scale-95"
        >
          Manage projects
        </Link>
        <Link
          to="/kanban"
          className="rounded-full border border-sand px-5 py-2.5 font-medium transition-colors hover:border-ink"
        >
          Open the board
        </Link>
      </div>
    </div>
  )
}

export default Dashboard