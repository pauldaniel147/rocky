import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { usePipeline } from '../../hooks/useStorage'
import { useNavigate } from 'react-router-dom'
import { storage } from '../../lib/storage'
import { useAI } from '../../hooks/useAI'
import { resumeTailoringPrompt, prescreenPrompt } from '../../lib/prompts'
import { parseAIResponse } from '../../lib/json-utils'
import { ResumeTailoringModal } from './ResumeTailoringModal'
import { searchCompanyInfo } from '../../lib/search'

const STAGE_TASKS = {
  saved: [
    'Review job description thoroughly',
    'Research company culture and recent news',
    'Check salary range on Glassdoor',
    'Customize resume for this role',
    'Prepare cover letter',
  ],
  applied: [
    'Track application confirmation email',
    'Connect with recruiter on LinkedIn',
    'Set reminder to follow up in 1 week',
    'Research interview process for this company',
    'Prepare potential screening questions',
  ],
  screening: [
    'Prepare STAR stories for key experiences',
    'Research interviewer background',
    'Practice screening call questions',
    'Prepare questions about role/team',
    'Test video call setup',
  ],
  interview: [
    'Review company mission and recent news',
    'Prepare technical/domain questions',
    'Practice behavioral questions',
    'Prepare smart questions to ask',
    'Plan interview day logistics',
  ],
  offer: [
    'Review offer terms carefully',
    'Research market salary range',
    'List negotiation points',
    'Prepare counter-offer if needed',
    'Set decision deadline',
  ],
  rejected: [
    'Request feedback from recruiter',
    'Update job search strategy',
    'Note learnings for next time',
    'Stay connected on LinkedIn',
  ],
}

export function JobDetailPanel({ job, onClose, onArchive, onUnarchive, updateJob: parentUpdateJob }) {
  const { updateJob: localUpdateJob } = usePipeline()
  const navigate = useNavigate()
  const { generate, loading: aiLoading } = useAI()

  // Use parent's updateJob if provided, otherwise use local
  const updateJob = parentUpdateJob || localUpdateJob
  const [notes, setNotes] = useState(job.notes || '')
  const [checkedTasks, setCheckedTasks] = useState(job.checkedTasks || {})
  const [customTasks, setCustomTasks] = useState(job.customTasks || [])
  const [deletedDefaultTasks, setDeletedDefaultTasks] = useState(job.deletedDefaultTasks || [])
  const [newTaskInput, setNewTaskInput] = useState('')

  // Contact tracking
  const [contacts, setContacts] = useState(job.contacts || [])
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', role: '', email: '', linkedin: '' })

  // Salary tracking
  const [salary, setSalary] = useState(job.salary || { expectedMin: '', expectedMax: '', offerAmount: '', negotiationNotes: '' })

  // Interview rounds tracking
  const [interviewRounds, setInterviewRounds] = useState(job.interviewRounds || [])
  const [showAddRound, setShowAddRound] = useState(false)
  const [newRound, setNewRound] = useState({ date: '', round: '', interviewer: '', notes: '' })

  // Deadline tracking
  const [deadline, setDeadline] = useState(job.deadline || { date: '', note: '' })

  // Tags
  const [tags, setTags] = useState(job.tags || [])

  // Resume Tailoring
  const [showTailoring, setShowTailoring] = useState(false)
  const [tailoringData, setTailoringData] = useState(null)
  const [tailoringLoading, setTailoringLoading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const commonTags = ['Remote', 'Hybrid', 'Onsite', 'Senior', 'Mid-level', 'Junior', 'Startup', 'Enterprise', 'SaaS', 'Product', 'B2B', 'B2C']

  // Re-analyze
  const [reanalyzing, setReanalyzing] = useState(false)

  // Chat history
  const [chatHistory, setChatHistory] = useState([])
  const [showChatHistory, setShowChatHistory] = useState(false)

  useEffect(() => {
    const jobId = `${job.company}-${job.role}`.replace(/\s+/g, '-')
    const history = storage.getChatHistory(jobId)
    setChatHistory(history)
  }, [job.company, job.role])

  const defaultTasks = STAGE_TASKS[job.stage] || []
  // Filter out deleted default tasks
  const activeDefaultTasks = defaultTasks.filter((_, i) => !deletedDefaultTasks.includes(i))
  const allTasks = [...activeDefaultTasks.map((task, i) => ({ task, originalIndex: defaultTasks.indexOf(task), isDefault: true })),
                    ...customTasks.map(task => ({ task, isDefault: false }))]

  const handleSaveNotes = () => {
    updateJob(job.id, { notes })
  }

  const handleToggleTask = (taskIndex) => {
    const newChecked = { ...checkedTasks, [taskIndex]: !checkedTasks[taskIndex] }
    setCheckedTasks(newChecked)
    updateJob(job.id, { checkedTasks: newChecked })
  }

  const handleDeleteTask = (taskIndex, isDefault, originalIndex) => {
    if (isDefault) {
      // Mark default task as deleted
      const newDeletedDefaultTasks = [...deletedDefaultTasks, originalIndex]
      setDeletedDefaultTasks(newDeletedDefaultTasks)

      // Update checked tasks
      const newChecked = { ...checkedTasks }
      delete newChecked[taskIndex]

      setCheckedTasks(newChecked)
      updateJob(job.id, { deletedDefaultTasks: newDeletedDefaultTasks, checkedTasks: newChecked })
    } else {
      // Delete custom task
      const customIndex = taskIndex - activeDefaultTasks.length
      const newCustomTasks = customTasks.filter((_, i) => i !== customIndex)
      setCustomTasks(newCustomTasks)

      // Update checked tasks
      const newChecked = { ...checkedTasks }
      delete newChecked[taskIndex]

      setCheckedTasks(newChecked)
      updateJob(job.id, { customTasks: newCustomTasks, checkedTasks: newChecked })
    }
  }

  const handleAddCustomTask = () => {
    if (!newTaskInput.trim()) return

    const newCustomTasks = [...customTasks, newTaskInput.trim()]
    setCustomTasks(newCustomTasks)
    updateJob(job.id, { customTasks: newCustomTasks })
    setNewTaskInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomTask()
    }
  }

  const handleAddContact = () => {
    if (!newContact.name.trim()) return
    const updatedContacts = [...contacts, { ...newContact, id: Date.now().toString() }]
    setContacts(updatedContacts)
    updateJob(job.id, { contacts: updatedContacts })
    setNewContact({ name: '', role: '', email: '', linkedin: '' })
    setShowAddContact(false)
  }

  const handleDeleteContact = (contactId) => {
    const updatedContacts = contacts.filter(c => c.id !== contactId)
    setContacts(updatedContacts)
    updateJob(job.id, { contacts: updatedContacts })
  }

  const handleSaveSalary = (field, value) => {
    const updatedSalary = { ...salary, [field]: value }
    setSalary(updatedSalary)
    updateJob(job.id, { salary: updatedSalary })
  }

  const handleAddRound = () => {
    if (!newRound.round.trim()) return
    const updatedRounds = [...interviewRounds, { ...newRound, id: Date.now().toString() }]
    setInterviewRounds(updatedRounds)
    updateJob(job.id, { interviewRounds: updatedRounds })
    setNewRound({ date: '', round: '', interviewer: '', notes: '' })
    setShowAddRound(false)
  }

  const handleDeleteRound = (roundId) => {
    const updatedRounds = interviewRounds.filter(r => r.id !== roundId)
    setInterviewRounds(updatedRounds)
    updateJob(job.id, { interviewRounds: updatedRounds })
  }

  const handleSaveDeadline = (field, value) => {
    const updatedDeadline = { ...deadline, [field]: value }
    setDeadline(updatedDeadline)
    updateJob(job.id, { deadline: updatedDeadline })
  }

  const handleAddTag = (tag) => {
    if (tags.includes(tag)) return
    const updatedTags = [...tags, tag]
    setTags(updatedTags)
    updateJob(job.id, { tags: updatedTags })
    setNewTag('')
  }

  const handleRemoveTag = (tag) => {
    const updatedTags = tags.filter(t => t !== tag)
    setTags(updatedTags)
    updateJob(job.id, { tags: updatedTags })
  }

  const handleArchive = () => {
    if (onArchive) {
      // Pass to parent to handle
      onArchive(job.id)
    } else {
      // Fallback
      updateJob(job.id, { archived: true })
      onClose()
    }
  }

  const handleUnarchive = () => {
    if (onUnarchive) {
      // Pass the job ID to parent to handle
      onUnarchive(job.id)
    } else {
      // Fallback: update here and close
      updateJob(job.id, { archived: false, stage: 'applied' })
      onClose()
    }
  }

  const handleTailorResume = async () => {
    if (!job.jd) {
      alert('No job description available for this role. Add a JD first.')
      return
    }

    setShowTailoring(true)
    setTailoringLoading(true)
    setTailoringData(null)

    try {
      const profile = storage.getProfile()
      const careerStory = storage.getCareerStory()
      const systemPrompt = resumeTailoringPrompt(job.jd, job.company, job.role, profile, careerStory)
      const response = await generate(systemPrompt, 'Generate resume tailoring advice', 3000)
      console.log('Resume tailoring response:', response)
      const data = parseAIResponse(response)
      console.log('Parsed data:', data)
      setTailoringData(data)
    } catch (err) {
      console.error('Failed to generate tailoring advice:', err)
      setTailoringData({ error: err.message || 'Failed to generate advice' })
    } finally {
      setTailoringLoading(false)
    }
  }

  const handleReanalyze = async () => {
    if (!job.jd) {
      alert('No job description available. Add a JD to re-analyze.')
      return
    }

    setReanalyzing(true)

    try {
      const preferences = storage.getPreferences()
      const profile = storage.getProfile()

      // Search for recent company info
      const webSearchResults = await searchCompanyInfo(job.company)

      const systemPrompt = prescreenPrompt(preferences, profile, webSearchResults)

      const salaryText = job.salary?.expectedMin || job.salary?.expectedMax
        ? `\nSalary Range: ${job.salary.expectedMin || ''}${job.salary.expectedMin && job.salary.expectedMax ? ' - ' : ''}${job.salary.expectedMax || ''} LPA`
        : ''

      const userMessage = `Job URL: ${job.jobUrl || 'Not provided'}\n\nCompany: ${job.company}\nRole: ${job.role}${salaryText}\n\nJob Description:\n${job.jd}`

      const response = await generate(systemPrompt, userMessage, 2500)
      const analysisData = parseAIResponse(response)

      // Update job with fresh AI insights
      updateJob(job.id, {
        fitScore: analysisData.fitScore,
        verdict: analysisData.verdict,
        greenFlags: analysisData.greenFlags,
        redFlags: analysisData.redFlags,
        reasoning: analysisData.reasoning,
        companyInsights: analysisData.companyInsights || '',
        productInsights: analysisData.productInsights || '',
        reanalyzedAt: new Date().toISOString(),
      })

      // Refresh the panel (close and reopen would be ideal, but we'll just alert for now)
      alert('✓ Job re-analyzed with latest company intelligence!')
      onClose()
    } catch (err) {
      console.error('Re-analysis failed:', err)
      alert('Failed to re-analyze. Please try again.')
    } finally {
      setReanalyzing(false)
    }
  }

  const handlePrepWithCoach = () => {
    // Store full job context for Coach
    localStorage.setItem('rocky:coach_context', JSON.stringify({
      job: {
        company: job.company,
        role: job.role,
        jd: job.jd,
        jobUrl: job.jobUrl,
        stage: job.stage,
        notes: job.notes,
        fitScore: job.fitScore,
        greenFlags: job.greenFlags,
        redFlags: job.redFlags,
        companyInsights: job.companyInsights,
        productInsights: job.productInsights,
        reasoning: job.reasoning,
        checkedTasks: job.checkedTasks || {},
        customTasks: job.customTasks || [],
        deletedDefaultTasks: job.deletedDefaultTasks || [],
        contacts: job.contacts || [],
        salary: job.salary || {},
        interviewRounds: job.interviewRounds || [],
        tags: job.tags || [],
        deadline: job.deadline || {},
      },
      timestamp: new Date().toISOString(),
    }))
    navigate('/coach')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26, 23, 20, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
        }}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '560px',
            maxWidth: '100vw',
            background: '#fbf6ea',
            boxShadow: '-4px 0 24px rgba(26, 23, 20, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 28px',
            borderBottom: '1px solid #e6dcc8',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: '#fbf6ea',
            zIndex: 10,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#9a9082',
                fontWeight: 500,
                marginBottom: '8px',
              }}>
                {job.stage}
              </div>
              <h2 style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '28px',
                lineHeight: 1.2,
                margin: '0 0 6px',
                color: '#1a1714',
              }}>
                {job.company}
              </h2>
              <div style={{
                fontSize: '16px',
                color: '#6a6258',
                marginBottom: '12px',
              }}>
                {job.role}
              </div>
              {job.fitScore && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  background: job.fitScore >= 75 ? 'rgba(74, 124, 89, 0.15)' : 'rgba(196, 148, 74, 0.15)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: job.fitScore >= 75 ? '#4a7c59' : '#c4944a',
                }}>
                  {job.fitScore}% fit
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '12px',
                }}>
                  {tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: '#f1eadc',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#6a6258',
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#9a9082',
                          cursor: 'pointer',
                          fontSize: '14px',
                          lineHeight: 1,
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6a6258',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e6dcc8'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 28px', flex: 1 }}>
            {/* Archived notice */}
            {job.archived && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(154, 144, 130, 0.1)',
                border: '1px solid rgba(154, 144, 130, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', color: '#6a6258' }}>
                  This job is archived
                </span>
                <button
                  onClick={handleUnarchive}
                  style={{
                    padding: '6px 12px',
                    background: '#1a1714',
                    color: '#f1eadc',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Unarchive
                </button>
              </div>
            )}

            {/* Action buttons */}
            {!job.archived && (
              <>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <button
                    onClick={handlePrepWithCoach}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    <span style={{ fontFamily: 'var(--font-family-display)', fontSize: '16px', fontStyle: 'italic' }}>
                      Prep with Rocky →
                    </span>
                  </button>
                  <button
                    onClick={handleTailorResume}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      background: 'white',
                      border: '1px solid #d8cdb8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-family-display)',
                      color: '#1a1714',
                    }}
                  >
                    Tailor Resume
                  </button>
                </div>
                <button
                  onClick={handleReanalyze}
                  disabled={reanalyzing || !job.jd}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    marginBottom: '24px',
                    background: reanalyzing ? '#f9f6f0' : '#c4944a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: reanalyzing || !job.jd ? 'not-allowed' : 'pointer',
                    opacity: reanalyzing || !job.jd ? 0.5 : 1,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {reanalyzing ? '🔄 Re-analyzing...' : '🔄 Re-Analyze with Latest Intel'}
                </button>
              </>
            )}

            {/* Archive button */}
            {!job.archived && (
              <button
                onClick={handleArchive}
                style={{
                  width: '100%',
                  padding: '10px 20px',
                  marginBottom: '24px',
                  background: '#ffffff',
                  border: '1px solid #d8cdb8',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#6a6258',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9f6f0'
                  e.currentTarget.style.borderColor = '#9a9082'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.borderColor = '#d8cdb8'
                }}
              >
                Archive Job
              </button>
            )}

            {/* Deadline section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#1a1714',
                fontWeight: 600,
                marginBottom: '12px',
              }}>
                Deadline / Reminder
              </div>
              <div style={{
                padding: '12px',
                background: '#ffffff',
                border: '1px solid #e6dcc8',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#6a6258', display: 'block', marginBottom: '6px' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={deadline.date}
                    onChange={(e) => handleSaveDeadline('date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#f9f6f0',
                      border: '1px solid #e6dcc8',
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#6a6258', display: 'block', marginBottom: '6px' }}>
                    Note
                  </label>
                  <input
                    type="text"
                    value={deadline.note}
                    onChange={(e) => handleSaveDeadline('note', e.target.value)}
                    placeholder="e.g., Follow up with recruiter, Interview date, Decision deadline"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#f9f6f0',
                      border: '1px solid #e6dcc8',
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tags section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#1a1714',
                fontWeight: 600,
                marginBottom: '12px',
              }}>
                Tags
              </div>
              <div style={{
                padding: '12px',
                background: '#ffffff',
                border: '1px solid #e6dcc8',
                borderRadius: '8px',
              }}>
                {/* Common tags quick add */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: tags.length > 0 ? '10px' : '0',
                }}>
                  {commonTags.filter(tag => !tags.includes(tag)).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      style={{
                        padding: '4px 10px',
                        background: '#f9f6f0',
                        border: '1px solid #e6dcc8',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#6a6258',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1eadc'
                        e.currentTarget.style.borderColor = '#d8cdb8'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9f6f0'
                        e.currentTarget.style.borderColor = '#e6dcc8'
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                {/* Custom tag input */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        handleAddTag(newTag.trim())
                      }
                    }}
                    placeholder="Add custom tag..."
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      background: '#f9f6f0',
                      border: '1px solid #e6dcc8',
                      borderRadius: '6px',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => newTag.trim() && handleAddTag(newTag.trim())}
                    disabled={!newTag.trim()}
                    style={{
                      padding: '6px 12px',
                      background: newTag.trim() ? '#1a1714' : '#e6dcc8',
                      color: '#f1eadc',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: newTag.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Contacts section */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#1a1714',
                fontWeight: 600,
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span>Contacts</span>
                {!showAddContact && (
                  <button
                    onClick={() => setShowAddContact(true)}
                    style={{
                      padding: '4px 10px',
                      background: '#1a1714',
                      color: '#f1eadc',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textTransform: 'none',
                      letterSpacing: '0',
                    }}
                  >
                    + Add Contact
                  </button>
                )}
              </div>

              {/* Contact list */}
              {contacts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                  {contacts.map(contact => (
                    <div
                      key={contact.id}
                      style={{
                        padding: '12px',
                        background: '#ffffff',
                        border: '1px solid #e6dcc8',
                        borderRadius: '8px',
                        position: 'relative',
                      }}
                    >
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'transparent',
                          border: 'none',
                          color: '#9a9082',
                          cursor: 'pointer',
                          fontSize: '16px',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1714', marginBottom: '4px' }}>
                        {contact.name}
                      </div>
                      {contact.role && (
                        <div style={{ fontSize: '12px', color: '#6a6258', marginBottom: '6px' }}>
                          {contact.role}
                        </div>
                      )}
                      {contact.email && (
                        <div style={{ fontSize: '11px', color: '#9a9082', marginBottom: '2px' }}>
                          📧 {contact.email}
                        </div>
                      )}
                      {contact.linkedin && (
                        <a
                          href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '11px', color: '#c4784a', textDecoration: 'none' }}
                        >
                          🔗 LinkedIn
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add contact form */}
              {showAddContact && (
                <div style={{
                  padding: '14px',
                  background: '#f9f6f0',
                  border: '1px solid #e6dcc8',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Name *"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      marginBottom: '8px',
                      background: '#ffffff',
                      border: '1px solid #e6dcc8',
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    placeholder="Role (e.g., Recruiter, Hiring Manager)"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      marginBottom: '8px',
                      background: '#ffffff',
                      border: '1px solid #e6dcc8',
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="Email"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      marginBottom: '8px',
                      background: '#ffffff',
                      border: '1px solid #e6dcc8',
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={newContact.linkedin}
                    onChange={(e) => setNewContact({ ...newContact, linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      marginBottom: '10px',
                      background: '#ffffff',
                      border: '1px solid #e6dcc8',
                      borderRadius: '6px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleAddContact}
                      disabled={!newContact.name.trim()}
                      style={{
                        flex: 1,
                        padding: '8px 14px',
                        background: newContact.name.trim() ? '#1a1714' : '#e6dcc8',
                        color: '#f1eadc',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: newContact.name.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddContact(false)
                        setNewContact({ name: '', role: '', email: '', linkedin: '' })
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 14px',
                        background: '#ffffff',
                        color: '#1a1714',
                        border: '1px solid #d8cdb8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {contacts.length === 0 && !showAddContact && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#9a9082',
                  fontSize: '12px',
                  fontStyle: 'italic',
                }}>
                  No contacts added yet
                </div>
              )}
            </div>

            {/* Salary section */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#1a1714',
                fontWeight: 600,
                marginBottom: '12px',
              }}>
                Salary
              </div>
              <div style={{
                padding: '14px',
                background: '#ffffff',
                border: '1px solid #e6dcc8',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6a6258', display: 'block', marginBottom: '6px' }}>
                      Expected Min (LPA)
                    </label>
                    <input
                      type="text"
                      value={salary.expectedMin}
                      onChange={(e) => handleSaveSalary('expectedMin', e.target.value)}
                      placeholder="e.g., 25"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: '#f9f6f0',
                        border: '1px solid #e6dcc8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#6a6258', display: 'block', marginBottom: '6px' }}>
                      Expected Max (LPA)
                    </label>
                    <input
                      type="text"
                      value={salary.expectedMax}
                      onChange={(e) => handleSaveSalary('expectedMax', e.target.value)}
                      placeholder="e.g., 35"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: '#f9f6f0',
                        border: '1px solid #e6dcc8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                {job.stage === 'offer' && (
                  <div>
                    <label style={{ fontSize: '11px', color: '#6a6258', display: 'block', marginBottom: '6px' }}>
                      Offer Amount (LPA)
                    </label>
                    <input
                      type="text"
                      value={salary.offerAmount}
                      onChange={(e) => handleSaveSalary('offerAmount', e.target.value)}
                      placeholder="e.g., 30"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: '#f9f6f0',
                        border: '1px solid #e6dcc8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '11px', color: '#6a6258', display: 'block', marginBottom: '6px' }}>
                    Negotiation Notes
                  </label>
                  <textarea
                    value={salary.negotiationNotes}
                    onChange={(e) => handleSaveSalary('negotiationNotes', e.target.value)}
                    placeholder="Key points for negotiation..."
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px 10px',
                      background: '#f9f6f0',
                      border: '1px solid #e6dcc8',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'var(--font-family-body)',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Interview Rounds - only show if stage is screening, interview, or offer */}
            {['screening', 'interview', 'offer'].includes(job.stage) && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#1a1714',
                  fontWeight: 600,
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Interview Rounds</span>
                  {!showAddRound && (
                    <button
                      onClick={() => setShowAddRound(true)}
                      style={{
                        padding: '4px 10px',
                        background: '#1a1714',
                        color: '#f1eadc',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textTransform: 'none',
                        letterSpacing: '0',
                      }}
                    >
                      + Add Round
                    </button>
                  )}
                </div>

                {/* Round list */}
                {interviewRounds.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                    {interviewRounds.map(round => (
                      <div
                        key={round.id}
                        style={{
                          padding: '12px',
                          background: '#ffffff',
                          border: '1px solid #e6dcc8',
                          borderRadius: '8px',
                          position: 'relative',
                        }}
                      >
                        <button
                          onClick={() => handleDeleteRound(round.id)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#9a9082',
                            cursor: 'pointer',
                            fontSize: '16px',
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline', marginBottom: '6px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1714' }}>
                            {round.round}
                          </div>
                          {round.date && (
                            <div style={{ fontSize: '11px', color: '#9a9082' }}>
                              {new Date(round.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                        {round.interviewer && (
                          <div style={{ fontSize: '12px', color: '#6a6258', marginBottom: '6px' }}>
                            With: {round.interviewer}
                          </div>
                        )}
                        {round.notes && (
                          <div style={{
                            fontSize: '12px',
                            color: '#3a342d',
                            lineHeight: 1.5,
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid #f1eadc',
                            whiteSpace: 'pre-wrap',
                          }}>
                            {round.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add round form */}
                {showAddRound && (
                  <div style={{
                    padding: '14px',
                    background: '#f9f6f0',
                    border: '1px solid #e6dcc8',
                    borderRadius: '8px',
                    marginBottom: '12px',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#6a6258', display: 'block', marginBottom: '6px' }}>
                          Round Name *
                        </label>
                        <input
                          type="text"
                          value={newRound.round}
                          onChange={(e) => setNewRound({ ...newRound, round: e.target.value })}
                          placeholder="e.g., Technical Round 1"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: '#ffffff',
                            border: '1px solid #e6dcc8',
                            borderRadius: '6px',
                            fontSize: '13px',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#6a6258', display: 'block', marginBottom: '6px' }}>
                          Date
                        </label>
                        <input
                          type="date"
                          value={newRound.date}
                          onChange={(e) => setNewRound({ ...newRound, date: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: '#ffffff',
                            border: '1px solid #e6dcc8',
                            borderRadius: '6px',
                            fontSize: '13px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={newRound.interviewer}
                      onChange={(e) => setNewRound({ ...newRound, interviewer: e.target.value })}
                      placeholder="Interviewer name"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        marginBottom: '10px',
                        background: '#ffffff',
                        border: '1px solid #e6dcc8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                    <textarea
                      value={newRound.notes}
                      onChange={(e) => setNewRound({ ...newRound, notes: e.target.value })}
                      placeholder="Notes: questions asked, how it went, key points..."
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '8px 10px',
                        marginBottom: '10px',
                        background: '#ffffff',
                        border: '1px solid #e6dcc8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'var(--font-family-body)',
                        resize: 'vertical',
                        outline: 'none',
                      }}
                      rows={3}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleAddRound}
                        disabled={!newRound.round.trim()}
                        style={{
                          flex: 1,
                          padding: '8px 14px',
                          background: newRound.round.trim() ? '#1a1714' : '#e6dcc8',
                          color: '#f1eadc',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: newRound.round.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Add Round
                      </button>
                      <button
                        onClick={() => {
                          setShowAddRound(false)
                          setNewRound({ date: '', round: '', interviewer: '', notes: '' })
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 14px',
                          background: '#ffffff',
                          color: '#1a1714',
                          border: '1px solid #d8cdb8',
                          borderRadius: '6px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {interviewRounds.length === 0 && !showAddRound && (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#9a9082',
                    fontSize: '12px',
                    fontStyle: 'italic',
                  }}>
                    No interview rounds recorded yet
                  </div>
                )}
              </div>
            )}

            {/* Stage-specific tasks */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#1a1714',
                fontWeight: 600,
                marginBottom: '16px',
              }}>
                Tasks for {job.stage} stage
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allTasks.map((taskObj, i) => {
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px',
                        background: checkedTasks[i] ? '#f9f6f0' : '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid #e6dcc8',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checkedTasks[i] || false}
                        onChange={() => handleToggleTask(i)}
                        style={{
                          marginTop: '2px',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{
                        flex: 1,
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: checkedTasks[i] ? '#9a9082' : '#3a342d',
                        textDecoration: checkedTasks[i] ? 'line-through' : 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleToggleTask(i)}
                      >
                        {taskObj.task}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(i, taskObj.isDefault, taskObj.originalIndex)}
                        style={{
                          padding: '2px 6px',
                          background: 'transparent',
                          border: 'none',
                          color: '#9a9082',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#c4534a'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9a9082'}
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Add custom task */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add custom task..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: '#ffffff',
                    border: '1px solid #e6dcc8',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleAddCustomTask}
                  disabled={!newTaskInput.trim()}
                  style={{
                    padding: '10px 16px',
                    background: newTaskInput.trim() ? '#1a1714' : '#e6dcc8',
                    color: '#f1eadc',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: newTaskInput.trim() ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Notes section */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#1a1714',
                fontWeight: 600,
                marginBottom: '12px',
              }}>
                Notes
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Add notes about this opportunity..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '14px',
                  background: '#ffffff',
                  border: '1px solid #e6dcc8',
                  borderRadius: '10px',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: '#3a342d',
                  fontFamily: 'var(--font-family-body)',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
              <div style={{
                fontSize: '11px',
                color: '#9a9082',
                marginTop: '8px',
                fontStyle: 'italic',
              }}>
                These notes feed into your daily digest
              </div>
            </div>

            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#1a1714',
                  fontWeight: 600,
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Conversation History</span>
                  <button
                    onClick={() => setShowChatHistory(!showChatHistory)}
                    style={{
                      padding: '4px 10px',
                      background: 'transparent',
                      border: '1px solid #d8cdb8',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#6a6258',
                      cursor: 'pointer',
                      textTransform: 'none',
                      letterSpacing: '0',
                    }}
                  >
                    {showChatHistory ? 'Hide' : 'View'}
                  </button>
                </div>
                {showChatHistory && (
                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '14px',
                    background: '#ffffff',
                    border: '1px solid #e6dcc8',
                    borderRadius: '10px',
                  }}>
                    {chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: '12px',
                          paddingBottom: '12px',
                          borderBottom: i < chatHistory.length - 1 ? '1px solid #f1eadc' : 'none',
                        }}
                      >
                        <div style={{
                          fontSize: '10px',
                          color: msg.role === 'user' ? '#c4784a' : '#4a7c59',
                          fontWeight: 600,
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}>
                          {msg.role === 'user' ? 'You' : 'Rocky'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#3a342d',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                        }}>
                          {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{
                  fontSize: '11px',
                  color: '#9a9082',
                  marginTop: '8px',
                  fontStyle: 'italic',
                }}>
                  {chatHistory.length} message{chatHistory.length > 1 ? 's' : ''} · Click "Prep with Rocky" to continue
                </div>
              </div>
            )}

            {/* Job details */}
            {job.jobUrl && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#1a1714',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}>
                  Job Posting
                </div>
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: '#c4784a',
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                  }}
                >
                  {job.jobUrl}
                </a>
              </div>
            )}

            {/* Flags */}
            {job.greenFlags?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#4a7c59',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}>
                  Green flags
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', lineHeight: 1.7, color: '#3a342d' }}>
                  {job.greenFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.redFlags?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#c4534a',
                  fontWeight: 600,
                  marginBottom: '10px',
                }}>
                  Watch out for
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', lineHeight: 1.7, color: '#3a342d' }}>
                  {job.redFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Resume Tailoring Modal */}
      {showTailoring && (
        <ResumeTailoringModal
          job={job}
          onClose={() => setShowTailoring(false)}
          loading={tailoringLoading}
          tailoringData={tailoringData}
        />
      )}
    </AnimatePresence>
  )
}
