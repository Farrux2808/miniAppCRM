import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const PhoneLogin = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { phoneLogin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!phone.trim() || !password.trim()) {
      setError('Telefon raqami va parolni kiriting')
      return
    }

    setLoading(true)
    setError('')

    const result = await phoneLogin(phone.trim(), password)
    
    if (!result.success) {
      setError(result.error || 'Login xatosi')
    }
    
    setLoading(false)
  }

  return (
    <div className="app">
      <div className="main-content">
        <div className="login-container">
          <div className="login-header">
            <div className="login-icon">📱</div>
            <h2>Kirish</h2>
            <p>Telegram akkauntingiz tizimda topilmadi. Telefon raqami va parol orqali kirib, Telegram akkauntingizni bog'lang.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="phone">Telefon raqami</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Parol</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolingizni kiriting"
                className="form-input"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>

          <div className="login-footer">
            <p>Muvaffaqiyatli kirgandan keyin Telegram akkauntingiz avtomatik bog'lanadi.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhoneLogin