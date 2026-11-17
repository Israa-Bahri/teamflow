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

// Prints PASS or FAIL for one check
function check(name, ok, got) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  (got ' + got + ')')
}

// Makes a string of n letters, for testing "too long" values
function long(n) {
  return 'x'.repeat(n)
}

async function main() {
  // Log in as Ada to get a token
  const loginBody = { email: 'ada@example.com', password: 'password123' }
  const login = await send('/auth/login', 'POST', loginBody)
  const ada = login.data.token

  // ----- Register -----
  const ok = { name: 'Test', email: 'valid.format@example.com', password: 'password123' }

  let r = await send('/auth/register', 'POST', { ...ok, name: long(101) })
  check('Name too long', r.status === 400, r.status)

  r = await send('/auth/register', 'POST', { ...ok, email: 'not-an-email' })
  check('Bad email shape', r.status === 400, r.status)

  r = await send('/auth/register', 'POST', { ...ok, password: long(73) })
  check('Password too long', r.status === 400, r.status)

  r = await send('/auth/register', 'POST', { ...ok, name: 123 })
  check('Name is a number', r.status === 400, r.status)

  r = await send('/auth/register', 'POST', { ...ok, email: { a: 1 } })
  check('Email is an object', r.status === 400, r.status)

  // ----- Login -----
  r = await send('/auth/login', 'POST', { email: 123, password: 'password123' })
  check('Login with a number as email', r.status === 400, r.status)

  // ----- Projects -----
  r = await send('/projects', 'POST', { title: long(101) }, ada)
  check('Project title too long', r.status === 400, r.status)

  r = await send('/projects', 'POST', { title: 12345 }, ada)
  check('Project title is a number', r.status === 400, r.status)

  r = await send('/projects', 'POST', { title: '   ' }, ada)
  check('Project title is blank', r.status === 400, r.status)

  r = await send('/projects', 'POST', { title: 'Ok', description: long(1001) }, ada)
  check('Description too long', r.status === 400, r.status)

  // A title of exactly 100 characters is allowed
  r = await send('/projects', 'POST', { title: long(100) }, ada)
  check('Title of exactly 100 characters (201)', r.status === 201, r.status)
  const id = r.data.id

  r = await send('/projects/' + id, 'PATCH', { title: long(101) }, ada)
  check('Edit with a too-long title', r.status === 400, r.status)

  r = await send('/projects/abc', 'PATCH', { title: 'x' }, ada)
  check('Bad project id (abc)', r.status === 400, r.status)

  r = await send('/projects/1.5', 'PATCH', { title: 'x' }, ada)
  check('Bad project id (1.5)', r.status === 400, r.status)

  // ----- Tasks -----
  const tasksUrl = '/projects/' + id + '/tasks'

  r = await send(tasksUrl, 'POST', { title: long(101) }, ada)
  check('Task title too long', r.status === 400, r.status)

  r = await send(tasksUrl, 'POST', { title: 'T', dueDate: 'not-a-date' }, ada)
  check('Bad due date', r.status === 400, r.status)

  r = await send(tasksUrl, 'POST', { title: 'T', priority: 'URGENT' }, ada)
  check('Bad priority', r.status === 400, r.status)

  r = await send(tasksUrl, 'POST', { title: 'Good task' }, ada)
  const taskId = r.data.id

  r = await send('/tasks/' + taskId, 'PATCH', { status: 'FINISHED' }, ada)
  check('Bad status', r.status === 400, r.status)

  r = await send('/tasks/' + taskId, 'PATCH', { title: long(101) }, ada)
  check('Edit task with too-long title', r.status === 400, r.status)

  // ----- Broken JSON body -----
  const res = await fetch(BASE + '/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ada },
    body: '{this is not json',
  })
  check('Broken JSON body', res.status === 400, res.status)

  // Clean up: deleting the project also deletes its task
  await send('/projects/' + id, 'DELETE', null, ada)
}

main().catch((err) => console.error('Request failed:', err.message))