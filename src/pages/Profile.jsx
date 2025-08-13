import React from 'react'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  return (
    <div>
      <h1 className="page-title">Profil</h1>
      
      <div className="profile-card">
        <div className="profile-avatar">
          {getInitials(user.firstName, user.lastName)}
        </div>
        <div className="profile-name">
          {user.firstName} {user.lastName}
        </div>
        <div className="profile-role">
          {user.role === 'teacher' ? 'O\'qituvchi' : user.role}
        </div>
      </div>

      <div style={{ background: 'var(--secondary-bg)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '16px' }}>Ma'lumotlar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--tg-theme-hint-color, #666)' }}>Email:</span>
            <span>{user.email || 'Kiritilmagan'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--tg-theme-hint-color, #666)' }}>Rol:</span>
            <span>{user.role === 'teacher' ? 'O\'qituvchi' : user.role}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile