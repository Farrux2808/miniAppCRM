import React, { createContext, useContext, useState, useEffect } from 'react'

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
        console.log('Telegram WebApp not available - running in browser mode')
        // For development/testing, create a mock user
        if (import.meta.env.DEV) {
          setUser({
            id: '507f1f77bcf86cd799439011',
            firstName: 'Test',
            lastName: 'Teacher',
            role: 'teacher'
          })
          setAuthToken('mock-token')
        }
        setLoading(false)
        return
      }

      tg.ready()
      tg.expand()
      
      console.log('Telegram WebApp initialized:', {
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        user: tg.initDataUnsafe?.user
      })

      const initData = tg.initData
      if (!initData) {
        console.log('No Telegram init data available')
        // Try to get user from initDataUnsafe
        const user = tg.initDataUnsafe?.user
        if (user) {
          console.log('Using initDataUnsafe user data:', user)
          // Create mock auth for development
          setUser({
            id: '507f1f77bcf86cd799439011',
            firstName: user.first_name,
            lastName: user.last_name,
            role: 'teacher'
          })
          setAuthToken('mock-token')
        }
        setLoading(false)
        return
      }

      // Authenticate with backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      console.log('Authenticating with backend:', `${apiUrl}/auth/telegram-login`)
      
      const response = await fetch(`${apiUrl}/auth/telegram-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Authentication successful:', data)
        setAuthToken(data.access_token)
        setUser(data.user)
      } else {
        const errorData = await response.text()
        console.error('Authentication failed:', response.status, errorData)
        
        // For development, try mock authentication
        if (import.meta.env.DEV && tg.initDataUnsafe?.user) {
          const user = tg.initDataUnsafe.user
          console.log('Using mock authentication for development')
          setUser({
            id: '507f1f77bcf86cd799439011',
            firstName: user.first_name,
            lastName: user.last_name,
            role: 'teacher',
            telegramData: user
          })
          setAuthToken('mock-token')
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      
      // For development, provide fallback
      if (import.meta.env.DEV) {
        console.log('Using fallback authentication for development')
        setUser({
          id: '507f1f77bcf86cd799439011',
          firstName: 'Dev',
          lastName: 'Teacher',
          role: 'teacher',
          telegramData: {
            id: 120,
            first_name: 'Farrukh',
            last_name: 'Kholikulov',
            username: 'Mr_Farruh',
            photo_url: 'https://t.me/i/userpic/320/Mr_Farruh.jpg'
          }
        })
        setAuthToken('mock-token')
      }
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