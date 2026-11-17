const express = require('express')
const prisma = require('../db')
const requireAuth = require('../middleware/auth')
const { LIMITS, checkRequiredText, checkOptionalText } = require('../validators')

// The router must be created BEFORE any router.get / router.post line
const router = express.Router()

// Every route in this file needs a logged-in user
router.use(requireAuth)

// The priorities our database accepts
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

// Helper used by PATCH, DELETE and the task routes:
// finds the project and checks that it belongs to the logged-in user.
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

// ---------- POST /api/projects ----------
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body || {}

    // Validate the text fields (required title, optional description)
    const problem =
      checkRequiredText(title, 'Title', LIMITS.title) ||
      checkOptionalText(description, 'Description', LIMITS.description)
    if (problem) {
      return res.status(400).json({ error: problem })
    }

    // ownerId comes from the token, NOT from req.body,
    // so a user can't create projects for someone else.
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
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
      where: { ownerId: req.userId }, // only the logged-in user's projects
      orderBy: { createdAt: 'desc' }, // newest first
    })

    res.json(projects)
  } catch (err) {
    next(err)
  }
})

// ---------- PATCH /api/projects/:id ----------
// Changes only the fields you send
router.patch('/:id', async (req, res, next) => {
  try {
    const project = await findOwnedProject(req, res)
    if (!project) return // the helper already replied (400, 404 or 403)

    const { title, description } = req.body || {}
    const data = {} // we collect only the fields to change

    if (title !== undefined) {
      const problem = checkRequiredText(title, 'Title', LIMITS.title)
      if (problem) return res.status(400).json({ error: problem })
      data.title = title.trim()
    }

    if (description !== undefined) {
      const problem = checkOptionalText(description, 'Description', LIMITS.description)
      if (problem) return res.status(400).json({ error: problem })
      // An empty description is saved as null (nothing)
      data.description = description ? description.trim() : null
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

// ---------- POST /api/projects/:id/tasks ----------
router.post('/:id/tasks', async (req, res, next) => {
  try {
    // Ownership is checked through the project
    const project = await findOwnedProject(req, res)
    if (!project) return

    const { title, description, priority, dueDate } = req.body || {}

    // Validate the text fields
    const problem =
      checkRequiredText(title, 'Title', LIMITS.title) ||
      checkOptionalText(description, 'Description', LIMITS.description)
    if (problem) {
      return res.status(400).json({ error: problem })
    }

    // Priority is optional, but if sent it must be one of the three allowed values
    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be LOW, MEDIUM or HIGH' })
    }

    // Due date is optional, but if sent it must be a real date
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
        description: description ? description.trim() : null,
        priority: priority, // if undefined, the database default (MEDIUM) is used
        dueDate: due,
        projectId: project.id, // links the task to the project
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
      orderBy: { createdAt: 'asc' }, // oldest first, so the board keeps a stable order
    })

    res.json(tasks)
  } catch (err) {
    next(err)
  }
})

// This must be the LAST line of the file
module.exports = router