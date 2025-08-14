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
  const [needsPhoneLogin, setNeedsPhoneLogin] = useState(false)
  const [telegramDataForLinking, setTelegramDataForLinking] = useState(null)

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
        
        // If user not found, show phone login
        if (response.status === 401) {
          console.log('User not found, showing phone login')
          setTelegramDataForLinking(userData)
          setNeedsPhoneLogin(true)
          setLoading(false)
          return
        }
        
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

  const phoneLogin = async (phone, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      
      const response = await fetch(`${apiUrl}/auth/phone-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Phone login successful:', data)
        
        // Link Telegram data to user
        if (telegramDataForLinking) {
          await linkTelegramData(data.user.id, data.access_token)
        }
        
        setAuthToken(data.access_token)
        setUser(data.user)
        setNeedsPhoneLogin(false)
        setTelegramDataForLinking(null)
        
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Phone login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const linkTelegramData = async (userId, token) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      
      await fetch(`${apiUrl}/users/${userId}/telegram`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          telegramData: telegramDataForLinking.user,
          lastTelegramLogin: new Date()
        })
      })
      
      console.log('Telegram data linked successfully')
    } catch (error) {
      console.error('Error linking Telegram data:', error)
    }
  }
  const logout = () => {
    setUser(null)
    setAuthToken(null)
    setNeedsPhoneLogin(false)
    setTelegramDataForLinking(null)
  }

  const value = {
    user,
    authToken,
    loading,
    needsPhoneLogin,
    phoneLogin,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}