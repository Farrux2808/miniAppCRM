import React from 'react'

const Login = () => {
  return (
    <div className="app">
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
          <h2 style={{ marginBottom: '16px' }}>Kirish talab etiladi</h2>
          <p style={{ color: 'var(--tg-theme-hint-color, #666)' }}>
            Iltimos, Telegram orqali kiring
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login