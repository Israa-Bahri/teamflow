const express = require('express')
const prisma = require('../db')
const requireAuth = require('../middleware/auth')

const router = express.Router()

// Every route in this file needs a logged-in user.
// router.use() puts requireAuth in front of all of them.
router.use(requireAuth)

// ---------- POST /api/projects ----------
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body

    // Title is required and can't be just spaces (400 = bad request)
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }

    // Save the project. ownerId comes from the token (set by requireAuth),
    // NOT from req.body, so a user can't claim someone else's id.
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description ? String(description).trim() : null, // optional
        ownerId: req.userId,
      },
    })

    // 201 = created
    res.status(201).json(project)
  } catch (err) {
    next(err)
  }
})

// ---------- GET /api/projects ----------
router.get('/', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.userId },  // only projects owned by the logged-in user
      orderBy: { createdAt: 'desc' },  // newest first
    })

    res.json(projects)
  } catch (err) {
    next(err)
  }
})

// Helper used by PATCH and DELETE: finds the project and checks the owner.
// If something is wrong it sends the error reply itself and returns null.
async function findOwnedProject(req, res) {
  // req.params.id is text from the URL, so turn it into a number
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid project id' })
    return null
  }

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return null
  }

  // The owner saved in the database must match the logged-in user (from the token)
  if (project.ownerId !== req.userId) {
    res.status(403).json({ error: 'You do not own this project' })
    return null
  }

  return project
}

// ---------- PATCH /api/projects/:id ----------
// PATCH changes only the fields you send
router.patch('/:id', async (req, res, next) => {
  try {
    const project = await findOwnedProject(req, res)
    if (!project) return // the helper already replied

    const { title, description } = req.body
    const data = {} // we collect only the fields to change

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' })
      }
      data.title = title.trim()
    }

    if (description !== undefined) {
      // An empty description is saved as null (nothing)
      data.description = description ? String(description).trim() : null
    }

    // Nothing to change
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: data,
    })
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// ---------- DELETE /api/projects/:id ----------
router.delete('/:id', async (req, res, next) => {
  try {
    const project = await findOwnedProject(req, res)
    if (!project) return

    // Its tasks are deleted too, because of onDelete: Cascade in the schema
    await prisma.project.delete({ where: { id: project.id } })
    res.json({ message: 'Project deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router