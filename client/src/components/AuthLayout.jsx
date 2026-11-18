// A small decorative task card for the left panel
function MiniCard({ title, tag, tagClass, className }) {
  return (
    <div
      className={
        'bg-paper text-ink rounded-2xl p-4 shadow-xl shadow-ink/20 w-64 ' +
        'transition-transform duration-300 hover:rotate-0 hover:-translate-y-1 ' +
        className
      }
    >
      <p className="font-medium">{title}</p>
      <span className={'inline-block mt-2 rounded-full px-3 py-0.5 text-xs font-medium ' + tagClass}>
        {tag}
      </span>
    </div>
  )
}

// The brand mark: a clay square with a check
function Brand({ light }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={
          'h-9 w-9 rounded-xl grid place-items-center ' +
          (light ? 'bg-paper text-clay' : 'bg-clay text-paper')
        }
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
             strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <span className="font-display text-xl font-semibold">TeamFlow</span>
    </div>
  )
}

// Props: title and subtitle (above the form), children (the form itself),
// footer (the "New here? Create an account" line)
function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ---------- Left panel: only on large screens ---------- */}
      <div className="hidden lg:flex flex-col justify-between bg-clay text-paper p-12 relative overflow-hidden">
        {/* Soft decorative circles in the background */}
        <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-clay-dark/60" />
        <div className="absolute top-24 -right-10 h-40 w-40 rounded-full bg-honey/40" />

        <div className="relative">
          <Brand light />
        </div>

        <div className="relative">
          <h2 className="font-display text-5xl font-semibold leading-tight">
            Small tasks,
            <br />
            steady progress.
          </h2>
          <p className="mt-4 max-w-sm text-paper/80">
            Plan your projects, break them into tasks, and watch them move
            from to-do to done.
          </p>
        </div>

        {/* Three tilted cards. Hover over one: it straightens and lifts. */}
        <div className="relative flex flex-col gap-3" aria-hidden="true">
          <MiniCard title="Design the landing page" tag="High" tagClass="bg-clay/15 text-clay-dark" className="-rotate-3" />
          <MiniCard title="Review the pull request" tag="Medium" tagClass="bg-honey/30 text-ink" className="rotate-2 ml-10" />
          <MiniCard title="Ship version 1.0" tag="Done" tagClass="bg-teal/15 text-teal" className="-rotate-1 ml-4" />
        </div>
      </div>

      {/* ---------- Right side: the form ---------- */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="page-enter w-full max-w-sm">
          {/* The brand only shows on small screens, where the left panel is hidden */}
          <div className="lg:hidden mb-8">
            <Brand />
          </div>

          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <p className="text-muted mt-1 mb-6">{subtitle}</p>

          {children}

          <div className="mt-6 text-sm text-muted">{footer}</div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout