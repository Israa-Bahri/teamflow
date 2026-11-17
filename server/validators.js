// The longest text we accept for each field
const LIMITS = {
  name: 100,
  email: 254,
  password: 72, // bcrypt only uses the first 72 characters anyway
  title: 100,
  description: 1000,
}

// Required text: must be a string, not blank, and not too long.
// Returns an error message, or null when the value is fine.
function checkRequiredText(value, label, max) {
  if (typeof value !== 'string' || !value.trim()) {
    return label + ' is required'
  }
  if (value.trim().length > max) {
    return label + ' must be at most ' + max + ' characters'
  }
  return null
}

// Optional text: may be missing or empty, but if present it must be a short string.
function checkOptionalText(value, label, max) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') {
    return label + ' must be text'
  }
  if (value.trim().length > max) {
    return label + ' must be at most ' + max + ' characters'
  }
  return null
}

// Email: required text plus a simple shape check
function checkEmail(email) {
  const problem = checkRequiredText(email, 'Email', LIMITS.email)
  if (problem) return problem

  // Must look like something@something.something, with no spaces
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Please enter a valid email'
  }
  return null
}

// Password: at least 8 and at most 72 characters
function checkPassword(password) {
  if (typeof password !== 'string' || !password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (password.length > LIMITS.password) return 'Password must be at most 72 characters'
  return null
}

module.exports = {
  LIMITS,
  checkRequiredText,
  checkOptionalText,
  checkEmail,
  checkPassword,
}