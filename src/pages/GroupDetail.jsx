import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiCall } from '../utils/api'
import RecordModal from '../components/RecordModal'

const GroupDetail = ({ group, onBack }) => {
  const [tableData, setTableData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('attendance') // 'attendance' or 'grade'
  const { authToken } = useAuth()

  useEffect(() => {
    if (group && authToken) {
      loadTableData()
    }
  }, [group, authToken])

  const loadTableData = async () => {
    try {
      setLoading(true)
      const response = await apiCall(`/student-records/group/${group._id}/table`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Table data received:', data)
        setTableData(data)
      } else {
        setError('Ma\'lumotlarni yuklashda xatolik')
      }
    } catch (error) {
      console.error('Error loading table data:', error)
      setError('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleCellClick = (student, dateKey) => {
    const record = tableData.records[student._id]?.[dateKey]
    setSelectedStudent({
      student,
      dateKey,
      record: record || null
    })
    setShowModal(true)
  }

  const handleTodayAction = async (student) => {
    try {
      // Check if student has today's record
      const today = new Date().toISOString().split('T')[0]
      const todayRecord = tableData.records[student._id]?.[today]
      
      setSelectedStudent({
        student,
        dateKey: today,
        record: todayRecord || null
      })
      
      // If student is already marked as present, show grade modal
      if (todayRecord && todayRecord.attendanceStatus === 'present') {
        setModalType('grade')
      } else {
        setModalType('attendance')
      }
      
      setShowModal(true)
    } catch (error) {
      console.error('Error handling today action:', error)
      setError('Xatolik yuz berdi')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleModalSave = async (data) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const requestData = {
        groupId: group._id,
        userId: selectedStudent.student._id,
        date: today,
        attendanceStatus: data.attendanceStatus,
        comment: data.comment,
        notifyParents: data.notifyParents
      }

      if (data.grade !== undefined && data.grade !== null) {
        requestData.grade = data.grade
      }

      // Use create-or-update endpoint
      const response = await apiCall('/student-records/create-or-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        setSuccess('Ma\'lumot saqlandi')
        setTimeout(() => setSuccess(''), 3000)
        loadTableData() // Reload table data
        setShowModal(false)
        setSelectedStudent(null)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Saqlashda xatolik')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error saving record:', error)
      setError('Saqlashda xatolik')
      setTimeout(() => setError(''), 3000)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Bugun'
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Kecha'
    } else {
      return date.toLocaleDateString('uz-UZ', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }

  // Filter dates that have at least one record
  const getActiveDates = () => {
    if (!tableData) return []
    
    const today = new Date().toISOString().split('T')[0]
    
    // Return all dates except today (backend already filters dates with records)
    const activeDates = tableData.dates.filter(date => date !== today)
    
    return activeDates
  }

  const getCellContent = (student, dateKey) => {
    const record = tableData.records[student._id]?.[dateKey]
    if (!record) {
      return null // Don't show empty cells for past dates
    }
    
    switch (record.attendanceStatus) {
      case 'present':
        if (record.grade !== undefined && record.grade !== null) {
          return { text: record.grade, className: 'grade' }
        }
        return { text: '✓', className: 'present' }
      case 'absent_unexcused':
        return { text: 'Yo\'q', className: 'absent' }
      case 'absent_excused':
        return { text: 'Sab.', className: 'excused' }
      default:
        return null
    }
  }

  const getTodayButtonText = (student) => {
    const today = new Date().toISOString().split('T')[0]
    const todayRecord = tableData.records[student._id]?.[today]
    
    if (!todayRecord) {
      return 'Yo\'qlama'
    } else if (todayRecord.attendanceStatus === 'present') {
      if (todayRecord.grade !== undefined && todayRecord.grade !== null) {
        return `Baho: ${todayRecord.grade}`
      } else {
        return 'Baho'
      }
    } else {
      return 'O\'zgartirish'
    }
  }

  const getTodayButtonClass = (student) => {
    const today = new Date().toISOString().split('T')[0]
    const todayRecord = tableData.records[student._id]?.[today]
    
    if (!todayRecord) {
      return 'attendance-btn'
    } else if (todayRecord.attendanceStatus === 'present') {
      return 'grade-btn'
    } else {
      return 'edit-btn'
    }
  }

  if (loading) {
    return (
      <div>
        <div className="back-button" onClick={onBack}>
          ← Orqaga
        </div>
        <div className="loading">Ma'lumotlar yuklanmoqda...</div>
      </div>
    )
  }

  if (!tableData || tableData.students.length === 0) {
    return (
      <div>
        <div className="back-button" onClick={onBack}>
          ← Orqaga
        </div>
        <h1 className="page-title">{group.name}</h1>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>👥</div>
          <p style={{ color: 'var(--tg-theme-hint-color, #666)' }}>
            Bu guruhda faol o'quvchilar topilmadi
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="back-button" onClick={onBack}>
        ← Orqaga
      </div>

      <h1 className="page-title">{group.name}</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="grade-table">
        {(() => {
          const activeDates = getActiveDates()
          const columnCount = activeDates.length + 2 // student name + today action
          
          return (
            <>
        <div className="table-header">
          <div>O'quvchi</div>
              {activeDates.map(date => (
            <div key={date}>{formatDate(date)}</div>
          ))}
              <div>Bugun</div>
        </div>

        {tableData.students.map((student) => (
          <div key={student._id} className="table-row">
            <div className="student-name">
              {student.firstName} {student.lastName}
            </div>
            
                {activeDates.map(date => (
              <div key={date}>
                {(() => {
                  const cellContent = getCellContent(student, date)
                  if (!cellContent) {
                    return <div className="grade-cell empty">-</div>
                  }
                  return (
                    <div 
                      className={`grade-cell ${cellContent.className}`}
                      onClick={() => handleCellClick(student, date)}
                    >
                      {cellContent.text}
                    </div>
                  )
                })()}
              </div>
            ))}

            <div>
              <button 
                className={`action-btn ${getTodayButtonClass(student)}`}
                onClick={() => handleTodayAction(student)}
              >
                {getTodayButtonText(student)}
              </button>
            </div>
          </div>
        ))}
            </>
          )
        })()}
      </div>

      {showModal && selectedStudent && (
        <RecordModal
          student={selectedStudent.student}
          record={selectedStudent.record}
          type={modalType}
          onSave={handleModalSave}
          onClose={() => {
            setShowModal(false)
            setSelectedStudent(null)
            setModalType('attendance')
          }}
        />
      )}
    </div>
  )
}

export default GroupDetail