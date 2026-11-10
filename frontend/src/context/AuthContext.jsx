import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const response = await authService.getMe()
      setUser(response.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials)
    setUser(response.user)
    return response.user
  }, [])

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload)
    setUser(response.user)
    return response.user
  }, [])

  const registerAdmin = useCallback(async (payload) => {
    const response = await authService.registerAdmin(payload)
    setUser(response.user)
    return response.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      registerAdmin,
      logout,
      refresh,
    }),
    [user, loading, login, register, registerAdmin, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
