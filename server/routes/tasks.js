const express = require('express')
const prisma = require('../db')
const requireAuth = require('../middleware/auth')
const { LIMITS, checkRequiredText, checkOptionalText } = require('../validators')

const router = express.Router()

// Every route in this file needs a logged-in user
router.use(requireAuth)

// The only values the database accepts
const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

// Finds the task and checks that its PROJECT belongs to the logged-in user.
// If something is wrong it sends the error reply itself and returns null.
async function findOwnedTask(req, res) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid task id' })
    return null
  }

  // include: { project: true } also loads the project, so we can see its owner
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: true },
  })
  if (!task) {
    res.status(404).json({ error: 'Task not found' })
    return null
  }

  if (task.project.ownerId !== req.userId) {
    res.status(403).json({ error: 'You do not own this task' })
    return null
  }

  return task
}

// ---------- PATCH /api/tasks/:id ----------
// Changes only the fields you send
router.patch('/:id', async (req, res, next) => {
  try {
    const task = await findOwnedTask(req, res)
    if (!task) return // the helper already replied

    const { title, description, status, priority, dueDate } = req.body || {}
    const data = {} // we collect only the fields to change

    if (title !== undefined) {
      const problem = checkRequiredText(title, 'Title', LIMITS.title)
      if (problem) return res.status(400).json({ error: problem })
      data.title = title.trim()
    }

    if (description !== undefined) {
      const problem = checkOptionalText(description, 'Description', LIMITS.description)
      if (problem) return res.status(400).json({ error: problem })
      data.description = description ? description.trim() : null
    }

    if (status !== undefined) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Status must be TODO, IN_PROGRESS or DONE' })
      }
      data.status = status
    }

    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: 'Priority must be LOW, MEDIUM or HIGH' })
      }
      data.priority = priority
    }

    if (dueDate !== undefined) {
      if (!dueDate) {
        data.dueDate = null // sending an empty value clears the due date
      } else {
        const d = new Date(dueDate)
        if (isNaN(d.getTime())) {
          return res.status(400).json({ error: 'Invalid due date' })
        }
        data.dueDate = d
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: data,
    })
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// ---------- DELETE /api/tasks/:id ----------
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await findOwnedTask(req, res)
    if (!task) return

    await prisma.task.delete({ where: { id: task.id } })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router