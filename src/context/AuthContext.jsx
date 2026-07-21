import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem('siih_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser())
  const [token, setToken] = useState(localStorage.getItem('siih_token'))

  const login = useCallback(async (nombre_usuario, password) => {
    const data = await authApi.login(nombre_usuario, password)
    const nextUser = { id_usuario: data.id_usuario, id_rol: data.id_rol, rol: data.rol, nombre_usuario }
    localStorage.setItem('siih_token', data.access_token)
    localStorage.setItem('siih_user', JSON.stringify(nextUser))
    setToken(data.access_token)
    setUser(nextUser)
    return nextUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('siih_token')
    localStorage.removeItem('siih_user')
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback((...roles) => !!user && roles.includes(user.rol), [user])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
