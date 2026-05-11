import { useState } from 'react'
import { usePipeline } from '../hooks/useStorage'
import { motion } from 'framer-motion'
import { JobDetailPanel } from '../components/pipeline/JobDetailPanel'
import { ManualAddJobModal } from '../components/pipeline/ManualAddJobModal'
import { useAI } from '../hooks/useAI'
import { prescreenPrompt } from '../lib/prompts'
import { storage } from '../lib/storage'
import { parseAIResponse } from '../lib/json-utils'
import { searchCompanyInfo } from '../lib/search'

const STAGES = [
  { id: 'saved', label: 'Saved', color: '#9a9082' },
  { id: 'applied', label: 'Applied', color: '#c4944a' },
  { id: 'screening', label: 'Screening', color: '#8d7c59' },
  { id: 'interview', label: 'Interview', color: '#c4784a' },
  { id: 'offer', label: 'Offer', color: '#4a7c59' },
  { id: 'rejected', label: 'Rejected', color: '#c4534a' },
]

export function PipelinePage() {
  const { pipeline, updateJob, deleteJob, addJob } = usePipeline()
  const [draggedJob, setDraggedJob] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [fitFilter, setFitFilter] = useState('all') // all, high (75+), medium (50-74), low (<50)
  const [sortBy, setSortBy] = useState('date-desc') // date-desc, date-asc, fit-desc, fit-asc, company-asc
  const [showArchived, setShowArchived] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedJobs, setSelectedJobs] = useState([])
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [analyzingJobId, setAnalyzingJobId] = useState(null)
  const { generate } = useAI()

  const handleDelete = (jobId, e) => {
    e.stopPropagation()
    if (confirm('Delete this job from your pipeline?')) {
      deleteJob(jobId)
    }
  }

  const handleCardClick = (job, e) => {
    // Don't open panel if clicking delete button or checkbox
    if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) return

    if (bulkMode) {
      toggleJobSelection(job.id)
    } else {
      setSelectedJob(job)
    }
  }

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    )
  }

  const handleBulkArchive = () => {
    selectedJobs.forEach(jobId => updateJob(jobId, { archived: true }))
    setSelectedJobs([])
    setBulkMode(false)
  }

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedJobs.length} jobs permanently?`)) {
      selectedJobs.forEach(jobId => deleteJob(jobId))
      setSelectedJobs([])
      setBulkMode(false)
    }
  }

  const handleBulkMoveStage = (stage) => {
    selectedJobs.forEach(jobId => updateJob(jobId, { stage }))
    setSelectedJobs([])
    setBulkMode(false)
  }

  const handleManualAddJob = async (jobData) => {
    // Add job to pipeline immediately
    const newJob = addJob(jobData)

    // If JD is provided, enrich with AI insights in the background
    if (jobData.jd && jobData.jd.trim()) {
      setAnalyzingJobId(newJob.id)

      try {
        const preferences = storage.getPreferences()
        const profile = storage.getProfile()

        // Search for recent company info
        const webSearchResults = await searchCompanyInfo(jobData.company)

        const systemPrompt = prescreenPrompt(preferences, profile, webSearchResults)

        const salaryText = jobData.salary
          ? `\nSalary Range: ${jobData.salary.expectedMin || ''}${jobData.salary.expectedMin && jobData.salary.expectedMax ? ' - ' : ''}${jobData.salary.expectedMax || ''} LPA`
          : ''

        const userMessage = `Job URL: ${jobData.jobUrl || 'Not provided'}\n\nCompany: ${jobData.company}\nRole: ${jobData.role}${salaryText}\n\nJob Description:\n${jobData.jd}`

        const response = await generate(systemPrompt, userMessage, 2500)
        const analysisData = parseAIResponse(response)

        // Update job with AI insights
        updateJob(newJob.id, {
          fitScore: analysisData.fitScore,
          verdict: analysisData.verdict,
          greenFlags: analysisData.greenFlags,
          redFlags: analysisData.redFlags,
          reasoning: analysisData.reasoning,
          companyInsights: analysisData.companyInsights || '',
          productInsights: analysisData.productInsights || '',
        })
      } catch (err) {
        console.error('AI enrichment failed:', err)
        // Job is already added, just skip enrichment
      } finally {
        setAnalyzingJobId(null)
      }
    }
  }

  const handleDragStart = (job) => {
    setDraggedJob(job)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (stageId) => {
    if (draggedJob && draggedJob.stage !== stageId) {
      updateJob(draggedJob.id, { stage: stageId })
    }
    setDraggedJob(null)
  }

  const getJobsByStage = (stageId) => {
    let jobs = pipeline.filter(job => {
      // Filter by stage and archived status
      if (showArchived) {
        return job.stage === stageId && job.archived
      }
      return job.stage === stageId && !job.archived
    })

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      jobs = jobs.filter(job =>
        job.company.toLowerCase().includes(query) ||
        job.role.toLowerCase().includes(query) ||
        job.notes?.toLowerCase().includes(query)
      )
    }

    // Apply fit score filter
    if (fitFilter !== 'all') {
      jobs = jobs.filter(job => {
        const score = job.fitScore || 0
        if (fitFilter === 'high') return score >= 75
        if (fitFilter === 'medium') return score >= 50 && score < 75
        if (fitFilter === 'low') return score < 50
        return true
      })
    }

    // Apply sorting
    jobs.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'fit-desc':
          return (b.fitScore || 0) - (a.fitScore || 0)
        case 'fit-asc':
          return (a.fitScore || 0) - (b.fitScore || 0)
        case 'company-asc':
          return a.company.localeCompare(b.company)
        case 'updated-desc':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        default:
          return 0
      }
    })

    return jobs
  }

  // Calculate stats
  const activePipeline = pipeline.filter(j => !j.archived)
  const archivedCount = pipeline.filter(j => j.archived).length

  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const deadlinesThisWeek = activePipeline.filter(j =>
    j.deadline?.date &&
    new Date(j.deadline.date) >= now &&
    new Date(j.deadline.date) <= sevenDaysFromNow
  ).length

  const urgentDeadlines = activePipeline.filter(j =>
    j.deadline?.date &&
    new Date(j.deadline.date) >= now &&
    new Date(j.deadline.date) <= threeDaysFromNow
  ).length

  return (
    <div>
      {/* Top utility bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px 36px 0',
        fontSize: '11px',
        color: '#9a9082',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>III · PIPELINE · {showArchived ? `${archivedCount} ARCHIVED` : `${activePipeline.length} ACTIVE`}</span>
          {!showArchived && !bulkMode && (
            <>
              <button
                onClick={() => setShowManualAdd(true)}
                style={{
                  padding: '4px 10px',
                  background: '#1a1714',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '10px',
                  color: '#f1eadc',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                + Add Job
              </button>
              <button
                onClick={() => setBulkMode(true)}
                style={{
                  padding: '4px 10px',
                  background: 'transparent',
                  border: '1px solid #d8cdb8',
                  borderRadius: '6px',
                  fontSize: '10px',
                  color: '#6a6258',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Bulk Actions
              </button>
            </>
          )}
          {bulkMode && (
            <button
              onClick={() => {
                setBulkMode(false)
                setSelectedJobs([])
              }}
              style={{
                padding: '4px 10px',
                background: '#1a1714',
                border: 'none',
                borderRadius: '6px',
                fontSize: '10px',
                color: '#f1eadc',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Exit Bulk Mode
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {archivedCount > 0 && !bulkMode && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              style={{
                padding: '5px 11px',
                borderRadius: '999px',
                border: '1px solid #d8cdb8',
                background: showArchived ? '#1a1714' : 'transparent',
                letterSpacing: '0.08em',
                fontSize: '10px',
                color: showArchived ? '#f1eadc' : '#6a6258',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {showArchived ? '← Back to Active' : `View Archive (${archivedCount})`}
            </button>
          )}
          {!showArchived && (
            <span style={{
              padding: '5px 11px',
              borderRadius: '999px',
              border: '1px solid #d8cdb8',
              letterSpacing: '0.08em',
              fontSize: '10px',
              color: '#6a6258',
            }}>
              {activePipeline.filter(j => j.stage === 'interview').length} in interview
            </span>
          )}
          {urgentDeadlines > 0 && (
            <span style={{
              padding: '5px 11px',
              borderRadius: '999px',
              border: '1px solid rgba(196, 83, 74, 0.3)',
              background: 'rgba(196, 83, 74, 0.1)',
              letterSpacing: '0.08em',
              fontSize: '10px',
              color: '#c4534a',
              fontWeight: 600,
            }}>
              {urgentDeadlines} urgent deadline{urgentDeadlines > 1 ? 's' : ''}
            </span>
          )}
          {deadlinesThisWeek > 0 && urgentDeadlines === 0 && (
            <span style={{
              padding: '5px 11px',
              borderRadius: '999px',
              border: '1px solid rgba(196, 148, 74, 0.3)',
              background: 'rgba(196, 148, 74, 0.1)',
              letterSpacing: '0.08em',
              fontSize: '10px',
              color: '#c4944a',
            }}>
              {deadlinesThisWeek} deadline{deadlinesThisWeek > 1 ? 's' : ''} this week
            </span>
          )}
        </div>
      </div>

      {/* Bulk actions toolbar */}
      {bulkMode && selectedJobs.length > 0 && (
        <div style={{
          padding: '16px 60px',
          background: '#f9f6f0',
          borderTop: '1px solid #e6dcc8',
          borderBottom: '1px solid #e6dcc8',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '13px', color: '#3a342d', fontWeight: 500 }}>
            {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
          </span>
          <div style={{ flex: 1 }} />
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleBulkMoveStage(e.target.value)
                e.target.value = ''
              }
            }}
            defaultValue=""
            style={{
              padding: '8px 12px',
              background: '#ffffff',
              border: '1px solid #e6dcc8',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="">Move to stage...</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={handleBulkArchive}
            style={{
              padding: '8px 16px',
              background: '#ffffff',
              border: '1px solid #d8cdb8',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#6a6258',
              cursor: 'pointer',
            }}
          >
            Archive
          </button>
          <button
            onClick={handleBulkDelete}
            style={{
              padding: '8px 16px',
              background: '#ffffff',
              border: '1px solid rgba(196, 83, 74, 0.3)',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#c4534a',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Search and Filter bar */}
      <div style={{
        padding: '20px 60px 0',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by company, role, or notes..."
          style={{
            flex: 1,
            padding: '10px 16px',
            background: '#ffffff',
            border: '1px solid #e6dcc8',
            borderRadius: '10px',
            fontSize: '13px',
            fontFamily: 'var(--font-family-body)',
            color: '#3a342d',
            outline: 'none',
          }}
        />
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={fitFilter}
            onChange={(e) => setFitFilter(e.target.value)}
            style={{
              padding: '10px 36px 10px 16px',
              background: '#ffffff',
              border: '1px solid #e6dcc8',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'var(--font-family-body)',
              color: '#3a342d',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            <option value="all">All Fit Scores</option>
            <option value="high">High Fit (75%+)</option>
            <option value="medium">Medium Fit (50-74%)</option>
            <option value="low">Low Fit (&lt;50%)</option>
          </select>
          <svg
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              color: '#9a9082',
              pointerEvents: 'none',
            }}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4.5l3 3 3-3" />
          </svg>
        </div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 36px 10px 16px',
              background: '#ffffff',
              border: '1px solid #e6dcc8',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'var(--font-family-body)',
              color: '#3a342d',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="updated-desc">Recently Updated</option>
            <option value="fit-desc">Highest Fit</option>
            <option value="fit-asc">Lowest Fit</option>
            <option value="company-asc">Company A-Z</option>
          </select>
          <svg
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              color: '#9a9082',
              pointerEvents: 'none',
            }}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 4.5l3 3 3-3" />
          </svg>
        </div>
        {(searchQuery || fitFilter !== 'all' || sortBy !== 'date-desc') && (
          <button
            onClick={() => {
              setSearchQuery('')
              setFitFilter('all')
              setSortBy('date-desc')
            }}
            style={{
              padding: '10px 16px',
              background: '#f9f6f0',
              border: '1px solid #e6dcc8',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#6a6258',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Kanban board or Archive list */}
      {showArchived ? (
        // Archive list view
        <div style={{
          padding: '36px 60px 60px',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            {pipeline.filter(j => j.archived).length === 0 ? (
              <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#9a9082',
                fontSize: '14px',
              }}>
                No archived jobs
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}>
                {pipeline.filter(j => j.archived).map(job => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={(e) => handleCardClick(job, e)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e6dcc8',
                      borderRadius: '12px',
                      padding: '18px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(15,15,15,0.04)',
                      transition: 'all 0.2s',
                    }}
                    whileHover={{
                      boxShadow: '0 2px 8px rgba(15,15,15,0.1)',
                      y: -2,
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1a1714',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                    }}>
                      {job.company}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6a6258',
                      marginBottom: '12px',
                    }}>
                      {job.role}
                    </div>
                    {job.fitScore && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        background: 'rgba(154, 144, 130, 0.15)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#6a6258',
                        marginBottom: '8px',
                      }}>
                        {job.fitScore}% fit
                      </div>
                    )}
                    <div style={{
                      fontSize: '11px',
                      color: '#9a9082',
                      marginTop: '10px',
                    }}>
                      Archived on {new Date(job.updatedAt || job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Kanban board
        <div style={{
          padding: '36px 60px 60px',
          overflowX: 'auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(260px, 1fr))',
            gap: '16px',
            minWidth: 'fit-content',
          }}>
            {STAGES.map(stage => {
              const jobs = getJobsByStage(stage.id)
              return (
                <div
                  key={stage.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.id)}
                  style={{
                    background: '#fbf6ea',
                    borderRadius: '12px',
                    border: '1px solid #e6dcc8',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                {/* Column header */}
                <div style={{
                  padding: '16px 18px',
                  borderBottom: '1px solid #e6dcc8',
                }}>
                  <div style={{
                    fontSize: '10px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: stage.color,
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}>
                    {stage.label}
                  </div>
                  <div style={{
                    fontSize: '22px',
                    fontFamily: 'var(--font-family-display)',
                    fontWeight: 600,
                    color: '#1a1714',
                  }}>
                    {jobs.length}
                  </div>
                </div>

                {/* Cards */}
                <div style={{
                  padding: '12px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  {jobs.map(job => (
                    <motion.div
                      key={job.id}
                      draggable={!bulkMode}
                      onDragStart={() => !bulkMode && handleDragStart(job)}
                      onClick={(e) => handleCardClick(job, e)}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: bulkMode && selectedJobs.includes(job.id) ? '#f9f6f0' : '#ffffff',
                        border: bulkMode && selectedJobs.includes(job.id) ? '2px solid #c4944a' : '1px solid #e6dcc8',
                        borderRadius: '10px',
                        padding: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(15,15,15,0.04)',
                        position: 'relative',
                      }}
                      whileHover={{
                        boxShadow: '0 2px 8px rgba(15,15,15,0.1)',
                        y: -2,
                      }}
                    >
                      {/* AI analyzing indicator */}
                      {analyzingJobId === job.id && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          padding: '4px 8px',
                          background: '#c4944a',
                          color: '#fff',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}>
                          Analyzing...
                        </div>
                      )}

                      {/* Bulk select checkbox */}
                      {bulkMode && (
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={() => toggleJobSelection(job.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                          }}
                        />
                      )}

                      {/* Delete button */}
                      {!bulkMode && (
                        <button
                        onClick={(e) => handleDelete(job.id, e)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'transparent',
                          color: '#9a9082',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(196, 83, 74, 0.1)'
                          e.currentTarget.style.color = '#c4534a'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#9a9082'
                        }}
                      >
                        ×
                      </button>
                      )}

                      <div style={{
                        fontFamily: 'var(--font-family-display)',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#1a1714',
                        marginBottom: '6px',
                        lineHeight: 1.3,
                        paddingRight: '24px',
                        paddingLeft: bulkMode ? '28px' : '0',
                      }}>
                        {job.company}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6a6258',
                        marginBottom: '10px',
                      }}>
                        {job.role}
                      </div>

                      {/* Fit score if available */}
                      {job.fitScore && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          background: job.fitScore >= 75 ? 'rgba(74, 124, 89, 0.1)' : 'rgba(196, 148, 74, 0.1)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: job.fitScore >= 75 ? '#4a7c59' : '#c4944a',
                        }}>
                          {job.fitScore}% fit
                        </div>
                      )}

                      {/* Tags */}
                      {job.tags && job.tags.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginTop: '8px',
                        }}>
                          {job.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              style={{
                                padding: '2px 6px',
                                background: '#f1eadc',
                                borderRadius: '4px',
                                fontSize: '9px',
                                color: '#6a6258',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {job.tags.length > 3 && (
                            <span style={{
                              padding: '2px 6px',
                              fontSize: '9px',
                              color: '#9a9082',
                            }}>
                              +{job.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Date */}
                      <div style={{
                        fontSize: '10px',
                        color: '#9a9082',
                        marginTop: '10px',
                        letterSpacing: '0.05em',
                      }}>
                        {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
          </div>
        </div>
      )}

      {/* Job detail panel */}
      {selectedJob && (
        <JobDetailPanel
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          updateJob={updateJob}
          onArchive={(jobId) => {
            // Update the job directly here
            updateJob(jobId, { archived: true })
            // Close panel
            setSelectedJob(null)
          }}
          onUnarchive={(jobId) => {
            // Update the job directly here
            updateJob(jobId, { archived: false, stage: 'applied' })
            // Close panel
            setSelectedJob(null)
            // Switch to active view
            setShowArchived(false)
          }}
        />
      )}

      <ManualAddJobModal
        isOpen={showManualAdd}
        onClose={() => setShowManualAdd(false)}
        onAdd={handleManualAddJob}
      />
    </div>
  )
}
