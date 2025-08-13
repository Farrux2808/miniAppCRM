import React, { useState, useEffect } from 'react'

const GradeModal = ({ record, onSave, onClose }) => {
  const [type, setType] = useState(record.type || 'empty')
  const [grade, setGrade] = useState(record.grade || '')
  const [comment, setComment] = useState(record.comment || '')

  const handleSave = () => {
    const data = {
      type,
      comment: comment.trim()
    }

    if (type === 'grade') {
      const gradeValue = parseInt(grade)
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
        alert('Baho 0 dan 100 gacha bo\'lishi kerak')
        return
      }
      data.grade = gradeValue
    }

    onSave(data)
  }

  const getTypeLabel = (typeValue) => {
    switch (typeValue) {
      case 'grade': return 'Baho'
      case 'absent_unexcused': return 'Sababsiz yo\'qlik'
      case 'absent_excused': return 'Sababli yo\'qlik'
      default: return 'Bo\'sh'
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">
          {record.studentId.firstName} {record.studentId.lastName}
        </h3>

        <div className="modal-buttons">
          <div 
            className={`modal-btn ${type === 'empty' ? 'selected' : ''}`}
            onClick={() => setType('empty')}
          >
            Bo'sh
          </div>
          <div 
            className={`modal-btn ${type === 'grade' ? 'selected' : ''}`}
            onClick={() => setType('grade')}
          >
            Baho
          </div>
          <div 
            className={`modal-btn ${type === 'absent_unexcused' ? 'selected' : ''}`}
            onClick={() => setType('absent_unexcused')}
          >
            Sababsiz yo'qlik
          </div>
          <div 
            className={`modal-btn ${type === 'absent_excused' ? 'selected' : ''}`}
            onClick={() => setType('absent_excused')}
          >
            Sababli yo'qlik
          </div>
        </div>

        {type === 'grade' && (
          <input
            type="number"
            className="grade-input"
            placeholder="Baho (0-100)"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            min="0"
            max="100"
          />
        )}

        <textarea
          className="comment-input"
          placeholder="Izoh (ixtiyoriy)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

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

export default GradeModal