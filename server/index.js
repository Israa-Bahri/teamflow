const express = require('express')
const cors = require('cors')
require('dotenv').config()
const prisma = require('./db') // our shared database client

const app = express()

// ---------- Middleware ----------
app.use(cors())
app.use(express.json())

// ---------- Routes (all routes must be ABOVE the 404 handler) ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TeamFlow API is running' })
})

// Proves the server can talk to the database
app.get('/api/health/db', async (req, res, next) => {
  try {
    const userCount = await prisma.user.count()
    res.json({ status: 'ok', users: userCount })
  } catch (err) {
    next(err) // send the error to the central error handler below
  }
})

// ---------- 404 handler (runs only if no route above matched) ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ---------- Central error handler ----------
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Server error' })
})

// ---------- Start the server ----------
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})