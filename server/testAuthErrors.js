require('dotenv').config()
const jwt = require('jsonwebtoken')

const BASE = 'http://localhost:5000/api/auth'

// Helper: builds the options for a JSON POST request
const postJson = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

// Helper: sends a request and returns only the status number
async function status(path, options) {
  const res = await fetch(BASE + path, options)
  return res.status
}

async function main() {
  // Make a token that already expired 10 seconds ago.
  // "exp" is the expiry time, in seconds since 1970.
  const expiredToken = jwt.sign(
    { userId: 1, exp: Math.floor(Date.now() / 1000) - 10 },
    process.env.JWT_SECRET
  )

  // Each test: a name, the status we EXPECT, and the request to send
  const tests = [
    {
      name: 'Duplicate email',
      expected: 409,
      run: () => status('/register', postJson({ name: 'Ada', email: 'ada@example.com', password: 'password123' })),
    },
    {
      name: 'Password too short',
      expected: 400,
      run: () => status('/register', postJson({ name: 'Short', email: 'short@example.com', password: '123' })),
    },
    {
      name: 'Wrong password',
      expected: 401,
      run: () => status('/login', postJson({ email: 'ada@example.com', password: 'wrongpassword' })),
    },
    {
      name: 'Unknown email',
      expected: 401,
      run: () => status('/login', postJson({ email: 'nobody@example.com', password: 'password123' })),
    },
    {
      name: 'Missing token',
      expected: 401,
      run: () => status('/me', {}),
    },
    {
      name: 'Fake token',
      expected: 401,
      run: () => status('/me', { headers: { Authorization: 'Bearer not-a-real-token' } }),
    },
    {
      name: 'Expired token',
      expected: 401,
      run: () => status('/me', { headers: { Authorization: `Bearer ${expiredToken}` } }),
    },
  ]

  // Run each test and print PASS or FAIL
  for (const t of tests) {
    const got = await t.run()
    const result = got === t.expected ? 'PASS' : 'FAIL'
    console.log(`${result}  ${t.name}  (expected ${t.expected}, got ${got})`)
  }
}

main().catch((err) => console.error('Request failed:', err.message))