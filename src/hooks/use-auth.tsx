import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getAccessToken, clearTokens, decodeJwtPayload, getRefreshToken, tryRefresh, getFullName } from '@/lib/api'

type AuthContextType = {
  isAuthenticated: boolean
  fullName?: string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, logout: () => {} })

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [fullName, setFullName] = useState<string | null>(null)

  useEffect(() => {
  const init = async () => {
      const token = getAccessToken()
      if (!token) {
        setIsAuthenticated(false)
        return
      }
      // If token exists, check expiry and try to refresh proactively if expired or about to expire
      try {
        const payload: any = decodeJwtPayload(token)
        const exp = payload?.exp ? Number(payload.exp) * 1000 : null
        const now = Date.now()
        // If expired or will expire in next 30 seconds, attempt refresh
        if (!exp || exp <= now + 30000) {
          const userId = payload?.nameid || payload?.userId || payload?.sub || null
          const refreshed = await tryRefresh(userId)
          if (refreshed) {
            setIsAuthenticated(Boolean(getAccessToken()))
            return
          }
          // failed to refresh, clear tokens
          clearTokens()
          setIsAuthenticated(false)
          return
        }
  setIsAuthenticated(true)
  setFullName(getFullName())
      } catch {
        setIsAuthenticated(Boolean(getAccessToken()))
      }
    }
    init()
  }, [])

  useEffect(() => {
    const onAuthChange = () => {
      setIsAuthenticated(Boolean(getAccessToken()))
      setFullName(getFullName())
    }
    window.addEventListener('auth:change', onAuthChange as EventListener)
    return () => window.removeEventListener('auth:change', onAuthChange as EventListener)
  }, [])

  const logout = () => {
    clearTokens()
    setIsAuthenticated(false)
    // full page reload will reset app state and route; navigation handled in UI
    window.location.href = '/login'
  }

  const value = useMemo(() => ({ isAuthenticated, logout, fullName }), [isAuthenticated, fullName])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
