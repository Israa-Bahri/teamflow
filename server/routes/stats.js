const express = require('express')
const prisma = require('../db')
const requireAuth = require('../middleware/auth')

const router = express.Router()

// Only logged-in users can see statistics
router.use(requireAuth)

// ---------- GET /api/stats ----------
router.get('/', async (req, res, next) => {
  try {
    // Promise.all runs the three database questions at the same time,
    // which is faster than asking them one after the other.
    const [projects, totalTasks, completedTasks] = await Promise.all([
      // How many projects does this user own?
      prisma.project.count({ where: { ownerId: req.userId } }),

      // How many tasks are inside this user's projects?
      // We reach the owner through the task's project.
      prisma.task.count({ where: { project: { ownerId: req.userId } } }),

      // Same, but only tasks with status DONE
      prisma.task.count({
        where: { project: { ownerId: req.userId }, status: 'DONE' },
      }),
    ])

    res.json({ projects, totalTasks, completedTasks })
  } catch (err) {
    next(err)
  }
})

module.exports = router