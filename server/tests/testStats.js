const BASE = 'http://localhost:5000/api'

// Sends a JSON request, with a token if given
async function send(path, method, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = 'Bearer ' + token

  const res = await fetch(BASE + path, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json() }
}

// Logs in and returns the token
async function login(email) {
  const body = { email: email, password: 'password123' }
  const r = await send('/auth/login', 'POST', body)
  return r.data.token
}

// Prints PASS or FAIL for one check
function check(name, ok, got) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  (got ' + got + ')')
}

async function main() {
  const ada = await login('ada@example.com')

  // Count everything the slow way: list the projects, then each project's tasks
  const list = await send('/projects', 'GET', null, ada)
  let total = 0
  let done = 0
  for (const p of list.data) {
    const t = await send('/projects/' + p.id + '/tasks', 'GET', null, ada)
    total += t.data.length
    done += t.data.filter((x) => x.status === 'DONE').length
  }

  // The stats endpoint must give the same numbers
  const s = await send('/stats', 'GET', null, ada)
  console.log('Stats reply:', s.data)
  check('Status 200', s.status === 200, s.status)
  check('Project count matches', s.data.projects === list.data.length, s.data.projects)
  check('Task count matches', s.data.totalTasks === total, s.data.totalTasks)
  check('Done count matches', s.data.completedTasks === done, s.data.completedTasks)

  // A brand-new user with no data must get zeros (not an error)
  const user = { name: 'Empty', email: 'empty.stats@example.com', password: 'password123' }
  await send('/auth/register', 'POST', user)
  const empty = await login('empty.stats@example.com')
  const z = await send('/stats', 'GET', null, empty)
  const zeros = z.data.projects === 0 && z.data.totalTasks === 0 && z.data.completedTasks === 0
  check('New user gets zeros', zeros, JSON.stringify(z.data))

  // No token
  const anon = await send('/stats', 'GET')
  check('No token (401)', anon.status === 401, anon.status)
}

main().catch((err) => console.error('Request failed:', err.message))