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
  const [telegramInitData, setTelegramInitData] = useState(null)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const tg = window.Telegram?.WebApp
      if (!tg) {
        console.log('Telegram WebApp not available - running in browser mode')
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
        setLoading(false)
        return
      }

      // Store initData for potential phone login
      setTelegramInitData(initData)

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
        if (response.status === 401 && errorData.includes('USER_NOT_FOUND_NEED_PHONE_LOGIN')) {
          console.log('User not found, showing phone login')
          setNeedsPhoneLogin(true)
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setLoading(false)
    }
  }

  const phoneLogin = async (phone, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      
      // Parse telegram data from initData if available
      let telegramData = null
      if (telegramInitData) {
        try {
          const urlParams = new URLSearchParams(telegramInitData)
          const userParam = urlParams.get('user')
          if (userParam) {
            telegramData = JSON.parse(userParam)
          }
        } catch (error) {
          console.error('Error parsing telegram data:', error)
        }
      }

      const response = await fetch(`${apiUrl}/auth/phone-login-with-telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone, 
          password,
          telegramData 
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Phone login successful:', data)
        setAuthToken(data.access_token)
        setUser(data.user)
        setNeedsPhoneLogin(false)
        setTelegramInitData(null)
        
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
  const logout = () => {
    setUser(null)
    setAuthToken(null)
    setNeedsPhoneLogin(false)
    setTelegramInitData(null)
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