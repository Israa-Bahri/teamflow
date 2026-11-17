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

// Prints PASS or FAIL for one step
function check(name, ok, got) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  (got ' + got + ')')
}

async function main() {
  // A brand-new email each run, so the test always starts from nothing
  const email = 'journey' + Date.now() + '@example.com'
  const password = 'password123'

  // 1. Register
  let r = await send('/auth/register', 'POST', { name: 'Journey', email, password })
  check('1. Register (201)', r.status === 201, r.status)

  // 2. Login
  r = await send('/auth/login', 'POST', { email, password })
  check('2. Login (200 + token)', r.status === 200 && Boolean(r.data.token), r.status)
  let token = r.data.token

  // 3. Create a project
  r = await send('/projects', 'POST', { title: 'Journey project' }, token)
  check('3. Create project (201)', r.status === 201, r.status)
  const projectId = r.data.id

  // 4. Create a task in it
  r = await send('/projects/' + projectId + '/tasks', 'POST', { title: 'Journey task' }, token)
  check('4. Create task (201)', r.status === 201, r.status)
  const taskId = r.data.id

  // 5. Change its status to DONE
  r = await send('/tasks/' + taskId, 'PATCH', { status: 'DONE' }, token)
  check('5. Change status (DONE)', r.status === 200 && r.data.status === 'DONE', r.data.status)

  // 6. "Logout": the browser just forgets the token
  token = null
  r = await send('/projects', 'GET', null, token)
  check('6. After logout, projects are blocked (401)', r.status === 401, r.status)

  // 7. Login again: we get a NEW token
  r = await send('/auth/login', 'POST', { email, password })
  check('7. Login again (200)', r.status === 200, r.status)
  token = r.data.token

  // 8. Verify everything is still there
  r = await send('/projects', 'GET', null, token)
  const found = r.data.some((p) => p.id === projectId)
  check('8. Project still exists', found, r.data.length + ' project(s)')

  r = await send('/projects/' + projectId + '/tasks', 'GET', null, token)
  const task = r.data.find((t) => t.id === taskId)
  check('9. Task still exists with status DONE', task && task.status === 'DONE', task && task.status)

  // 9. The dashboard numbers agree
  r = await send('/stats', 'GET', null, token)
  const s = r.data
  const statsOk = s.projects === 1 && s.totalTasks === 1 && s.completedTasks === 1
  check('10. Stats are 1 / 1 / 1', statsOk, JSON.stringify(s))

  // Clean up the project (the test user stays, which is harmless)
  await send('/projects/' + projectId, 'DELETE', null, token)
}

main().catch((err) => console.error('Request failed:', err.message))