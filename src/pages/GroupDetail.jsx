import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiCall } from '../utils/api'
import GradeModal from '../components/GradeModal'

const GroupDetail = ({ group, onBack }) => {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const { authToken } = useAuth()

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/lesson-records/teacher/lessons', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const lessonsData = await response.json()
        // Filter lessons for current group and get last 2 lessons + prepare for new one
        const groupLessons = lessonsData
          .filter(lesson => lesson.groupId._id === group._id)
          .slice(0, 2) // Get last 2 lessons
        
        setLessons(groupLessons)
      } else {
        setError('Darslarni yuklashda xatolik')
      }
    } catch (error) {
      console.error('Error loading lessons:', error)
      setError('Darslarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const createNewLesson = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const response = await apiCall('/lesson-records/create-daily', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupId: group._id,
          lessonDate: today
        })
      })

      if (response.ok) {
        setSuccess('Yangi dars muvaffaqiyatli yaratildi')
        loadLessons()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Dars yaratishda xatolik')
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      setError('Dars yaratishda xatolik')
    }
  }

  const handleCellClick = (record, lessonIndex) => {
    setSelectedRecord({ ...record, lessonIndex })
    setShowModal(true)
  }

  const handleModalSave = async (data) => {
    try {
      const response = await apiCall(`/lesson-records/${selectedRecord._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setSuccess('Ma\'lumot saqlandi')
        loadLessons()
        setShowModal(false)
        setSelectedRecord(null)
      } else {
        setError('Saqlashda xatolik')
      }
    } catch (error) {
      console.error('Error saving record:', error)
      setError('Saqlashda xatolik')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('uz-UZ', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  const getCellContent = (record) => {
    if (!record) return { text: '-', className: 'empty' }
    
    switch (record.type) {
      case 'grade':
        return { text: record.grade, className: 'grade' }
      case 'absent_unexcused':
        return { text: 'Yo\'q', className: 'absent' }
      case 'absent_excused':
        return { text: 'Sab.', className: 'excused' }
      default:
        return { text: '-', className: 'empty' }
    }
  }

  // Get unique students from all lessons
  const getAllStudents = () => {
    const studentMap = new Map()
    
    lessons.forEach(lesson => {
      lesson.records.forEach(record => {
        const student = record.studentId
        if (student && !studentMap.has(student._id)) {
          studentMap.set(student._id, student)
        }
      })
    })
    
    return Array.from(studentMap.values())
  }

  const getStudentRecord = (studentId, lessonIndex) => {
    if (lessonIndex >= lessons.length) return null
    const lesson = lessons[lessonIndex]
    return lesson.records.find(record => record.studentId._id === studentId)
  }

  if (loading) {
    return (
      <div>
        <div className="back-button" onClick={onBack}>
          ← Orqaga
        </div>
        <div className="loading">Darslar yuklanmoqda...</div>
      </div>
    )
  }

  const students = getAllStudents()

  return (
    <div>
      <div className="back-button" onClick={onBack}>
        ← Orqaga
      </div>

      <h1 className="page-title">{group.name}</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="grade-table">
        <div className="table-header">
          <div>O'quvchi</div>
          <div>{lessons[1] ? formatDate(lessons[1].lessonDate) : 'Dars 1'}</div>
          <div>{lessons[0] ? formatDate(lessons[0].lessonDate) : 'Dars 2'}</div>
          <div>Yangi</div>
        </div>

        {students.map((student) => (
          <div key={student._id} className="table-row">
            <div className="student-name">
              {student.firstName} {student.lastName}
            </div>
            
            {/* Previous lesson 1 */}
            <div 
              className={`grade-cell ${getCellContent(getStudentRecord(student._id, 1)).className}`}
              onClick={() => {
                const record = getStudentRecord(student._id, 1)
                if (record) handleCellClick(record, 1)
              }}
            >
              {getCellContent(getStudentRecord(student._id, 1)).text}
            </div>

            {/* Previous lesson 2 */}
            <div 
              className={`grade-cell ${getCellContent(getStudentRecord(student._id, 0)).className}`}
              onClick={() => {
                const record = getStudentRecord(student._id, 0)
                if (record) handleCellClick(record, 0)
              }}
            >
              {getCellContent(getStudentRecord(student._id, 0)).text}
            </div>

            {/* Add new lesson button */}
            <div>
              <button 
                className="add-lesson-btn"
                onClick={createNewLesson}
                title="Yangi dars qo'shish"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedRecord && (
        <GradeModal
          record={selectedRecord}
          onSave={handleModalSave}
          onClose={() => {
            setShowModal(false)
            setSelectedRecord(null)
          }}
        />
      )}
    </div>
  )
}

export default GroupDetail