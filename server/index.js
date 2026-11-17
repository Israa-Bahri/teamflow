const express = require('express')
const cors = require('cors')
require('dotenv').config()
const prisma = require('./db')
const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const taskRoutes = require('./routes/tasks')
const statsRoutes = require('./routes/stats')
const app = express()

// ---------- Middleware ----------
app.use(cors())
app.use(express.json())

// ---------- Routes (all ABOVE the 404 handler) ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TeamFlow API is running' })
})

app.get('/api/health/db', async (req, res, next) => {
  try {
    const userCount = await prisma.user.count()
    res.json({ status: 'ok', users: userCount })
  } catch (err) {
    next(err)
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
// Every route in stats.js now starts with /api/stats
app.use('/api/stats', statsRoutes)

// ---------- 404 handler ----------
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