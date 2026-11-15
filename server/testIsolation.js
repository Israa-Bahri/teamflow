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
function check(name, ok) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name)
}

async function main() {
  const ada = await login('ada@example.com')
  const bola = await login('bola.test@example.com')

  // Each user creates one project
  const a = await send('/projects', 'POST', { title: 'Isolation test A' }, ada)
  const b = await send('/projects', 'POST', { title: 'Isolation test B' }, bola)
  const aUrl = '/projects/' + a.data.id
  const bUrl = '/projects/' + b.data.id

  // Each user tries to touch the other one's project. All must be 403 (forbidden).
  let r = await send(aUrl, 'PATCH', { title: 'Hacked' }, bola)
  check('Bola cannot edit Ada project', r.status === 403)

  r = await send(aUrl, 'DELETE', null, bola)
  check('Bola cannot delete Ada project', r.status === 403)

  r = await send(bUrl, 'PATCH', { title: 'Hacked' }, ada)
  check('Ada cannot edit Bola project', r.status === 403)

  r = await send(bUrl, 'DELETE', null, ada)
  check('Ada cannot delete Bola project', r.status === 403)

  // The lists must not leak each other's projects
  const adaList = await send('/projects', 'GET', null, ada)
  const bolaList = await send('/projects', 'GET', null, bola)
  check('Ada list has no Bola project', !adaList.data.some((p) => p.id === b.data.id))
  check('Bola list has no Ada project', !bolaList.data.some((p) => p.id === a.data.id))

  // Ada's project must still have its original title (the hack failed)
  const still = adaList.data.find((p) => p.id === a.data.id)
  check('Ada project was not changed', still && still.title === 'Isolation test A')

  // Clean up: each user deletes their own test project
  await send(aUrl, 'DELETE', null, ada)
  await send(bUrl, 'DELETE', null, bola)
}

main().catch((err) => console.error('Request failed:', err.message))