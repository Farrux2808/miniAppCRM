import React, { useState, useEffect } from 'react'
import Home from './pages/Home'
import Profile from './pages/Profile'
import GroupDetail from './pages/GroupDetail'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app">
        <div className="main-content">
          <div className="loading">Yuklanmoqda...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const renderPage = () => {
    if (selectedGroup) {
      return (
        <GroupDetail 
          group={selectedGroup} 
          onBack={() => setSelectedGroup(null)} 
        />
      )
    }

    switch (currentPage) {
      case 'home':
        return <Home onGroupSelect={setSelectedGroup} />
      case 'profile':
        return <Profile />
      default:
        return <Home onGroupSelect={setSelectedGroup} />
    }
  }

  return (
    <div className="app">
      <div className="main-content">
        {renderPage()}
      </div>
      
      {!selectedGroup && (
        <nav className="navbar">
          <div 
            className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            <div className="nav-icon">🏠</div>
            <div className="nav-label">Bosh sahifa</div>
          </div>
          <div 
            className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentPage('profile')}
          >
            <div className="nav-icon">👤</div>
            <div className="nav-label">Profil</div>
          </div>
        </nav>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App