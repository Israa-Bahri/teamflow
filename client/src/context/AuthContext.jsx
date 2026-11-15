import { createContext, useContext, useState } from 'react'

// A "context" is a shared box of data any component can read,
// so we don't have to pass the user down through every component.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Start from whatever the browser saved last time (or null if nothing)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  // Called after a successful login: save in the browser AND in React state
  function login(newToken, newUser) {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  // Forget everything (we'll use this for the Logout button in Task 6)
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// A shortcut so components can write: const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}