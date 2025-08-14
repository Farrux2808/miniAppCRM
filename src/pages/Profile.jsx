import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { apiCall } from '../utils/api'

const Profile = () => {
  const { user, logout, authToken } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && authToken) {
      loadUserProfile()
    }
  }, [user, authToken])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/users/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const profileData = await response.json()
        setUserProfile(profileData)
      } else {
        setError('Profil ma\'lumotlarini yuklashda xatolik')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Profil ma\'lumotlarini yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Profil</h1>
        <div className="loading">Profil yuklanmoqda...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Profil</h1>
        <div className="error">{error}</div>
      </div>
    )
  }

  const profile = userProfile || user
  const telegramData = profile.telegramData || user.telegramData

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getProfileImage = () => {
    if (telegramData?.photo_url) {
      return telegramData.photo_url
    }
    return null
  }

  const getRoleName = (role) => {
    const roleNames = {
      'teacher': 'O\'qituvchi',
      'admin': 'Administrator',
      'student': 'O\'quvchi',
      'parent': 'Ota-ona'
    }
    return roleNames[role] || role
  }
  return (
    <div>
      <h1 className="page-title">Profil</h1>
      
      <div className="profile-card">
        {getProfileImage() ? (
          <img 
            src={getProfileImage()} 
            alt="Profile" 
            className="profile-image"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className="profile-avatar" 
          style={{ display: getProfileImage() ? 'none' : 'flex' }}
        >
          {getInitials(profile.firstName, profile.lastName)}
        </div>
        <div className="profile-name">
          {profile.firstName} {profile.lastName}
        </div>
        <div className="profile-role">
          {getRoleName(profile.role)}
        </div>
        {telegramData?.username && (
          <div className="profile-username">
            @{telegramData.username}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--secondary-bg)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '16px' }}>Ma'lumotlar</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--tg-theme-hint-color, #666)' }}>Email:</span>
            <span>{profile.email || 'Kiritilmagan'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--tg-theme-hint-color, #666)' }}>Rol:</span>
            <span>{getRoleName(profile.role)}</span>
          </div>
          {profile.phone && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--tg-theme-hint-color, #666)' }}>Telefon:</span>
              <span>{profile.phone}</span>
            </div>
          )}
          {telegramData?.language_code && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--tg-theme-hint-color, #666)' }}>Til:</span>
              <span>{telegramData.language_code.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      {telegramData && (
        <div style={{ background: 'var(--secondary-bg)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-color)', marginTop: '16px' }}>
          <h3 style={{ marginBottom: '16px' }}>Telegram Ma'lumotlari</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--tg-theme-hint-color, #666)' }}>Telegram ID:</span>
              <span>{telegramData.id}</span>
            </div>
            {telegramData.username && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--tg-theme-hint-color, #666)' }}>Username:</span>
                <span>@{telegramData.username}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--tg-theme-hint-color, #666)' }}>Ism:</span>
              <span>{telegramData.first_name} {telegramData.last_name || ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile