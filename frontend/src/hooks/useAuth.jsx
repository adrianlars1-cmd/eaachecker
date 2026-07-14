import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthAPI } from '../lib/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'eaachecker_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    AuthAPI.me()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await AuthAPI.login(email, password)
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (email, password) => {
    const data = await AuthAPI.register(email, password)
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    const data = await AuthAPI.me()
    setUser(data.user)
    return data.user
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
