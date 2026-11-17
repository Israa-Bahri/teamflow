const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken') // creates the login tokens
const prisma = require('../db')
const requireAuth = require('../middleware/auth')
const { LIMITS, checkRequiredText, checkEmail, checkPassword } = require('../validators')

const router = express.Router()

// ---------- POST /api/auth/register ----------
router.post('/register', async (req, res, next) => {
  try {
    // "|| {}" means: if no body was sent at all, use an empty object
    const { name, email, password } = req.body || {}

    // Check every field. "||" gives the first problem found, or null if none.
    const problem =
      checkRequiredText(name, 'Name', LIMITS.name) ||
      checkEmail(email) ||
      checkPassword(password)
    if (problem) {
      return res.status(400).json({ error: problem }) // 400 = bad request
    }

    // Clean the email so capital letters and spaces don't matter
    const cleanEmail = email.trim().toLowerCase()

    // Reject duplicates (409 = conflict)
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' })
    }

    // Scramble the password. We never save the real one.
    const passwordHash = await bcrypt.hash(password, 10)

    // Save the user
    const user = await prisma.user.create({
      data: { name: name.trim(), email: cleanEmail, passwordHash },
    })

    // 201 = created. Never send passwordHash back.
    res.status(201).json({ id: user.id, name: user.name, email: user.email })
  } catch (err) {
    next(err) // any unexpected error goes to the central error handler
  }
})

// ---------- POST /api/auth/login ----------
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {}

    // Both must be non-empty text (a number or object would crash .trim() below)
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find the user by email (cleaned the same way as in register)
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    // Compare the typed password with the saved hash.
    // Same message for "no such user" and "wrong password",
    // so nobody can learn which emails are registered.
    const passwordOk = user && (await bcrypt.compare(password, user.passwordHash))
    if (!passwordOk) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Create the token: it holds the user's id, is signed with our secret,
    // and stops working after 1 day.
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })

    // Send back the token and basic user info (never the hash)
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err) {
    next(err)
  }
})

// ---------- GET /api/auth/me (private) ----------
// requireAuth runs first. If the token is bad, the code below never runs.
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    // req.userId was set by the middleware
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true }, // only these fields, never the hash
    })
    res.json(user)
  } catch (err) {
    next(err)
  }
})

module.exports = router