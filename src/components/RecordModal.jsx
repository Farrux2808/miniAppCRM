import React, { useState, useEffect } from 'react'

const RecordModal = ({ student, record, type, onSave, onClose }) => {
  const [attendanceStatus, setAttendanceStatus] = useState(record?.attendanceStatus || 'present')
  const [grade, setGrade] = useState(record?.grade || '')
  const [comment, setComment] = useState(record?.comment || '')
  const [notifyParents, setNotifyParents] = useState(true)

  useEffect(() => {
    if (type === 'grade') {
      setAttendanceStatus('present')
    }
  }, [type])

  const handleSave = () => {
    const data = {
      attendanceStatus,
      comment: comment.trim(),
      notifyParents
    }

    // Add grade if student is present and grade is provided
    if (attendanceStatus === 'present' && grade !== '') {
      const gradeValue = parseInt(grade)
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
        alert('Baho 0 dan 100 gacha bo\'lishi kerak')
        return
      }
      data.grade = gradeValue
    }

    onSave(data)
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Darsda bor'
      case 'absent_excused': return 'Sababli yo\'qlik'
      case 'absent_unexcused': return 'Sababsiz yo\'qlik'
      default: return status
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">
          {student.firstName} {student.lastName}
        </h3>

        {type === 'attendance' && (
          <div className="modal-section">
            <h4>Yo'qlama</h4>
            <div className="modal-buttons">
              <div 
                className={`modal-btn ${attendanceStatus === 'present' ? 'selected' : ''}`}
                onClick={() => setAttendanceStatus('present')}
              >
                Darsda bor
              </div>
              <div 
                className={`modal-btn ${attendanceStatus === 'absent_excused' ? 'selected' : ''}`}
                onClick={() => setAttendanceStatus('absent_excused')}
              >
                Sababli yo'qlik
              </div>
              <div 
                className={`modal-btn ${attendanceStatus === 'absent_unexcused' ? 'selected' : ''}`}
                onClick={() => setAttendanceStatus('absent_unexcused')}
              >
                Sababsiz yo'qlik
              </div>
            </div>
          </div>
        )}

        {(type === 'grade' || attendanceStatus === 'present') && (
          <div className="modal-section">
            <h4>Baho</h4>
            <input
              type="number"
              className="grade-input"
              placeholder="Baho (0-100)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              min="0"
              max="100"
            />
          </div>
        )}

        <div className="modal-section">
          <h4>Izoh</h4>
          <textarea
            className="comment-input"
            placeholder="Izoh (ixtiyoriy)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="modal-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={notifyParents}
              onChange={(e) => setNotifyParents(e.target.checked)}
            />
            <span>Ota-onaga habar yuborish</span>
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Saqlash
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecordModal