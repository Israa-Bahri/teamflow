const { PrismaClient } = require('@prisma/client')

// Create ONE database client and reuse it everywhere in the server.
const prisma = new PrismaClient()

module.exports = prisma