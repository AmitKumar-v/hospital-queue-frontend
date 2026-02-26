import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const name = localStorage.getItem('name')
    const email = localStorage.getItem('email')

    if (token) {
      setUser({ token, role, name, email })
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('role', userData.role)
    localStorage.setItem('name', userData.name)
    localStorage.setItem('email', userData.email)
    setUser(userData)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)