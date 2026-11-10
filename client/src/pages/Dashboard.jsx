// Mock numbers. Later these come from the stats API (Day 6).
const stats = [
  { label: 'Projects', value: 3 },
  { label: 'Total tasks', value: 12 },
  { label: 'Completed', value: 5 },
]

function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Grid: 1 column on phones, 3 columns on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* map() creates one card for each item in stats */}
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded shadow p-4">
            <p className="text-slate-500">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard