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

  // Ada creates a project to hold tasks
  const p = await send('/projects', 'POST', { title: 'Task test project' }, ada)
  const url = '/projects/' + p.data.id + '/tasks'

  let r = await send(url, 'POST', { title: 'First task', priority: 'HIGH' }, ada)
  check('Create task (201)', r.status === 201, r.status)
  check('Task starts as TODO', r.data.status === 'TODO', r.data.status)

  r = await send(url, 'POST', { title: 'Second task' }, ada)
  check('Default priority is MEDIUM', r.data.priority === 'MEDIUM', r.data.priority)

  r = await send(url, 'POST', { description: 'no title' }, ada)
  check('Missing title (400)', r.status === 400, r.status)

  r = await send(url, 'POST', { title: 'Bad', priority: 'URGENT' }, ada)
  check('Bad priority (400)', r.status === 400, r.status)

  r = await send(url, 'POST', { title: 'Sneaky' }, bola)
  check('Bola cannot add to Ada project (403)', r.status === 403, r.status)

  r = await send(url, 'GET', null, bola)
  check('Bola cannot list Ada tasks (403)', r.status === 403, r.status)

  r = await send('/projects/999999/tasks', 'GET', null, ada)
  check('Project does not exist (404)', r.status === 404, r.status)

  r = await send(url, 'GET', null, ada)
  check('Ada lists 2 tasks (200)', r.status === 200 && r.data.length === 2, r.status)

  // Clean up: deleting the project also deletes its tasks
  await send('/projects/' + p.data.id, 'DELETE', null, ada)
}

main().catch((err) => console.error('Request failed:', err.message))