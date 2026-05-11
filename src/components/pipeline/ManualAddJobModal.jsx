import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ManualAddJobModal({ isOpen, onClose, onAdd }) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [stage, setStage] = useState('applied')
  const [jobUrl, setJobUrl] = useState('')
  const [jd, setJd] = useState('')
  const [notes, setNotes] = useState('')
  const [deadline, setDeadline] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!company.trim() || !role.trim()) {
      return
    }

    const jobData = {
      company: company.trim(),
      role: role.trim(),
      stage,
      jobUrl: jobUrl.trim() || undefined,
      jd: jd.trim() || undefined,
      notes: notes.trim() || undefined,
      deadline: deadline ? { date: deadline, note: 'Deadline' } : undefined,
      salary: (salaryMin || salaryMax) ? {
        expectedMin: salaryMin,
        expectedMax: salaryMax
      } : undefined,
    }

    onAdd(jobData)
    handleClose()
  }

  const handleClose = () => {
    setCompany('')
    setRole('')
    setStage('applied')
    setJobUrl('')
    setJd('')
    setNotes('')
    setDeadline('')
    setSalaryMin('')
    setSalaryMax('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26, 23, 20, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fbf6ea',
            borderRadius: '16px',
            border: '1px solid #d8cdb8',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '32px',
              margin: 0,
              color: '#1a1714',
            }}>
              Add Job Manually
            </h2>
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                color: '#6a6258',
                cursor: 'pointer',
                padding: '4px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Required fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                  Company *
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Notion"
                  className="input"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                  Role *
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Product Manager"
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                Current Stage *
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="input"
                  style={{ appearance: 'none', paddingRight: '36px' }}
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                </select>
                <svg width="12" height="8" viewBox="0 0 12 8" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#6a6258" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Optional fields */}
            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                Job URL (optional - helps AI analyze)
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="input"
              />
            </div>

            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                Job Description (optional - enables AI insights)
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste job description for AI analysis..."
                className="input"
                rows={4}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                  Min Salary (LPA)
                </label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="e.g., 30"
                  className="input"
                />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                  Max Salary (LPA)
                </label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="e.g., 40"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                Application Deadline (optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label" style={{ display: 'block', marginBottom: '6px' }}>
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this application..."
                className="input"
                rows={2}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={!company.trim() || !role.trim()}
              >
                Add Job
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  background: 'transparent',
                  color: '#6a6258',
                  border: '1px solid #d8cdb8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#6a6258', margin: 0, lineHeight: 1.4 }}>
              💡 Tip: Add a job description to get AI-powered insights (fit score, company analysis, red/green flags)
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
