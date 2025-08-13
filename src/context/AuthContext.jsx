import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiCall } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authToken, setAuthToken] = useState(null)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const tg = window.Telegram?.WebApp
      if (!tg) {
        console.error('Telegram WebApp not available')
        setLoading(false)
        return
      }

      tg.ready()
      tg.expand()

      const initData = tg.initData
      if (!initData) {
        console.error('No Telegram init data')
        setLoading(false)
        return
      }

      // Authenticate with backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/telegram-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData })
      })

      if (response.ok) {
        const data = await response.json()
        setAuthToken(data.access_token)
        setUser(data.user)
      } else {
        console.error('Authentication failed')
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setAuthToken(null)
  }

  const value = {
    user,
    authToken,
    loading,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}