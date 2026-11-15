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
  const bola = await login('bola.test@example.com')

  // Setup: Ada creates a project with one task
  const p = await send('/projects', 'POST', { title: 'Task update test' }, ada)
  const t = await send('/projects/' + p.data.id + '/tasks', 'POST', { title: 'Task' }, ada)
  const url = '/tasks/' + t.data.id

  let r = await send(url, 'PATCH', { status: 'IN_PROGRESS' }, ada)
  check('Change status (200)', r.status === 200 && r.data.status === 'IN_PROGRESS', r.status)

  r = await send(url, 'PATCH', { priority: 'HIGH', dueDate: '2026-12-01' }, ada)
  check('Change priority and due date (200)', r.status === 200 && r.data.priority === 'HIGH', r.status)

  r = await send(url, 'PATCH', { dueDate: null }, ada)
  check('Clear due date (200)', r.status === 200 && r.data.dueDate === null, r.status)

  r = await send(url, 'PATCH', { status: 'FINISHED' }, ada)
  check('Bad status (400)', r.status === 400, r.status)

  r = await send(url, 'PATCH', { priority: 'URGENT' }, ada)
  check('Bad priority (400)', r.status === 400, r.status)

  r = await send(url, 'PATCH', { title: '   ' }, ada)
  check('Empty title (400)', r.status === 400, r.status)

  r = await send(url, 'PATCH', { status: 'DONE' }, bola)
  check('Bola cannot edit Ada task (403)', r.status === 403, r.status)

  r = await send(url, 'DELETE', null, bola)
  check('Bola cannot delete Ada task (403)', r.status === 403, r.status)

  r = await send('/tasks/999999', 'PATCH', { status: 'DONE' }, ada)
  check('Task does not exist (404)', r.status === 404, r.status)

  r = await send('/tasks/abc', 'PATCH', { status: 'DONE' }, ada)
  check('Bad id (400)', r.status === 400, r.status)

  r = await send(url, 'DELETE', null, ada)
  check('Ada deletes her task (200)', r.status === 200, r.status)

  r = await send(url, 'DELETE', null, ada)
  check('Delete again (404)', r.status === 404, r.status)

  // Clean up
  await send('/projects/' + p.data.id, 'DELETE', null, ada)
}

main().catch((err) => console.error('Request failed:', err.message))