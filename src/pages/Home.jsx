import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiCall } from '../utils/api'

const Home = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, authToken } = useAuth()

  useEffect(() => {
    if (user && authToken) {
      loadGroups()
    }
  }, [user, authToken])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const response = await apiCall(`/groups/teacher/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const groupsData = await response.json()
        setGroups(groupsData)
      } else {
        setError('Guruhlarni yuklashda xatolik')
      }
    } catch (error) {
      console.error('Error loading groups:', error)
      setError('Guruhlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Mening Guruhlarim</h1>
        <div className="loading">Guruhlar yuklanmoqda...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Mening Guruhlarim</h1>
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Mening Guruhlarim</h1>
      
      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
          <p style={{ color: 'var(--tg-theme-hint-color, #666)' }}>
            Sizga biriktirilgan guruhlar topilmadi
          </p>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <div 
              key={group._id} 
              className="group-card"
              onClick={() => onGroupSelect(group)}
            >
              <div className="group-name">{group.name}</div>
              <div className="group-info">
                <span>👥 {group.studentCount || 0} o'quvchi</span>
                <span>📖 {group.courseId?.name || 'Kurs nomi'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home