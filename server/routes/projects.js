const express = require('express')
const prisma = require('../db')
const requireAuth = require('../middleware/auth')

// 1. The router must be created BEFORE any router.get / router.post line
const router = express.Router()

// Every route in this file needs a logged-in user
router.use(requireAuth)

// The priorities our database accepts
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

// Helper used by PATCH, DELETE and the task routes:
// finds the project and checks the owner.
// If something is wrong it sends the error reply itself and returns null.
async function findOwnedProject(req, res) {
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

  if (project.ownerId !== req.userId) {
    res.status(403).json({ error: 'You do not own this project' })
    return null
  }

  return project
}

// ---------- POST /api/projects ----------
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description ? String(description).trim() : null,
        ownerId: req.userId,
      },
    })

    res.status(201).json(project)
  } catch (err) {
    next(err)
  }
})

// ---------- GET /api/projects ----------
router.get('/', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.userId },
      orderBy: { createdAt: 'desc' },
    })

    res.json(projects)
  } catch (err) {
    next(err)
  }
})

// ---------- PATCH /api/projects/:id ----------
router.patch('/:id', async (req, res, next) => {
  try {
    const project = await findOwnedProject(req, res)
    if (!project) return

    const { title, description } = req.body
    const data = {}

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' })
      }
      data.title = title.trim()
    }

    if (description !== undefined) {
      data.description = description ? String(description).trim() : null
    }

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

// ---------- POST /api/projects/:id/tasks ----------
router.post('/:id/tasks', async (req, res, next) => {
  try {
    const project = await findOwnedProject(req, res)
    if (!project) return

    const { title, description, priority, dueDate } = req.body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }

    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be LOW, MEDIUM or HIGH' })
    }

    let due = null
    if (dueDate) {
      due = new Date(dueDate)
      if (isNaN(due.getTime())) {
        return res.status(400).json({ error: 'Invalid due date' })
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? String(description).trim() : null,
        priority: priority,
        dueDate: due,
        projectId: project.id,
      },
    })

    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
})

// ---------- GET /api/projects/:id/tasks ----------
router.get('/:id/tasks', async (req, res, next) => {
  try {
    const project = await findOwnedProject(req, res)
    if (!project) return

    const tasks = await prisma.task.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
    })

    res.json(tasks)
  } catch (err) {
    next(err)
  }
})

// This must be the LAST line of the file
module.exports = router