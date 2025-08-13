import React from 'react'

const Login = () => {
  const handleTestLogin = () => {
    // For development testing
    if (import.meta.env.DEV) {
      window.location.reload()
    }
  }

  return (
    <div className="app">
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
          <h2 style={{ marginBottom: '16px' }}>Kirish talab etiladi</h2>
          <p style={{ color: 'var(--tg-theme-hint-color, #666)' }}>
            Iltimos, Telegram orqali kiring
          </p>
          {import.meta.env.DEV && (
            <button 
              onClick={handleTestLogin}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Test Login (Dev Mode)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login