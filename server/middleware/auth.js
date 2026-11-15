const jwt = require('jsonwebtoken')

// Put this function in front of any route that needs a logged-in user.
function requireAuth(req, res, next) {
  // The browser sends the token in a header that looks like: "Bearer <token>"
  const header = req.headers.authorization

  // No header, or not in the "Bearer ..." format -> 401 (unauthorized)
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // Take just the token part, after "Bearer "
  const token = header.split(' ')[1]

  try {
    // verify() checks the signature with our secret and that it hasn't expired.
    // If it's fake, changed or expired, it throws an error.
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    // Save the user's id on the request so the route can use it
    req.userId = payload.userId

    next() // everything is fine: continue to the route
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = requireAuth