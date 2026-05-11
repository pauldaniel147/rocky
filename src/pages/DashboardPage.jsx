import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { storage } from '../lib/storage'
import { useAI } from '../hooks/useAI'
import { dashboardPrompt, rejectionPatternsPrompt } from '../lib/prompts'
import { parseAIResponse } from '../lib/json-utils'

export function DashboardPage() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState('this-week') // this-week, last-week, last-30, last-90, custom
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [assessment, setAssessment] = useState(null)
  const [rejectionAnalysis, setRejectionAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const { generate, loading } = useAI()

  // Calculate date range
  const getDateRange = () => {
    const now = new Date()
    let start, end

    switch (dateRange) {
      case 'this-week':
        start = new Date(now)
        start.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
        start.setHours(0, 0, 0, 0)
        end = new Date(now)
        end.setHours(23, 59, 59, 999)
        break
      case 'last-week':
        end = new Date(now)
        end.setDate(now.getDate() - now.getDay() - 1) // End of last week (Saturday)
        end.setHours(23, 59, 59, 999)
        start = new Date(end)
        start.setDate(end.getDate() - 6) // Start of last week (Sunday)
        start.setHours(0, 0, 0, 0)
        break
      case 'last-30':
        end = new Date(now)
        end.setHours(23, 59, 59, 999)
        start = new Date(now)
        start.setDate(now.getDate() - 30)
        start.setHours(0, 0, 0, 0)
        break
      case 'last-90':
        end = new Date(now)
        end.setHours(23, 59, 59, 999)
        start = new Date(now)
        start.setDate(now.getDate() - 90)
        start.setHours(0, 0, 0, 0)
        break
      case 'custom':
        start = customStart ? new Date(customStart) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        end = customEnd ? new Date(customEnd) : new Date(now)
        break
      default:
        start = new Date(now)
        end = new Date(now)
    }

    return { start, end }
  }

  const { start: rangeStart, end: rangeEnd } = getDateRange()

  // Filter data by date range
  const pipeline = storage.getPipeline()
  const checkins = storage.getCheckins()
  const preferences = storage.getPreferences()

  const pipelineInRange = pipeline.filter(j => {
    const created = new Date(j.createdAt)
    const updated = new Date(j.updatedAt || j.createdAt)
    return (created >= rangeStart && created <= rangeEnd) || (updated >= rangeStart && updated <= rangeEnd)
  })

  const checkinsInRange = checkins.filter(c => {
    const date = new Date(c.date)
    return date >= rangeStart && date <= rangeEnd
  })

  // Calculate metrics
  const applications = pipelineInRange.filter(j => {
    const created = new Date(j.createdAt)
    return created >= rangeStart && created <= rangeEnd
  }).length

  const interviews = pipelineInRange.filter(j => j.stage === 'interview').length
  const screening = pipelineInRange.filter(j => j.stage === 'screening').length
  const offers = pipelineInRange.filter(j => j.stage === 'offer').length

  const checkInStats = {
    done: checkinsInRange.filter(c => c.status === 'done').length,
    partial: checkinsInRange.filter(c => c.status === 'partial').length,
    not: checkinsInRange.filter(c => c.status === 'not').length,
  }

  const staleApplications = pipeline.filter(j => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(j.updatedAt || j.createdAt)) / (1000 * 60 * 60 * 24))
    return daysSinceUpdate > 7 && !['rejected', 'offer', 'archived'].includes(j.stage)
  }).length

  const lowFitActive = pipeline.filter(j => j.fitScore && j.fitScore < 70 && !['rejected', 'archived'].includes(j.stage)).length

  // Rejections data
  const rejectedJobs = pipeline.filter(j => j.stage === 'rejected')
  const hasRejections = rejectedJobs.length > 0

  // Top movers - jobs that changed stage in this period
  const topMovers = pipelineInRange.filter(j => {
    const updated = new Date(j.updatedAt || j.createdAt)
    return updated >= rangeStart && updated <= rangeEnd && j.stage !== 'saved'
  }).slice(0, 5)

  // Generate AI assessment
  useEffect(() => {
    if (dateRange === 'this-week' || dateRange === 'last-week') {
      loadAssessment()
    } else {
      setAssessment(null)
    }
  }, [dateRange])

  const loadAssessment = async () => {
    try {
      const profile = storage.getProfile()
      const systemPrompt = dashboardPrompt(pipelineInRange, checkinsInRange, preferences)
      const response = await generate(systemPrompt, 'Generate dashboard assessment', 500)
      setAssessment(response)
    } catch (err) {
      console.error('Failed to generate assessment:', err)
    }
  }

  const loadRejectionAnalysis = async () => {
    if (rejectedJobs.length === 0) return

    setAnalysisLoading(true)
    try {
      const profile = storage.getProfile()
      const systemPrompt = rejectionPatternsPrompt(rejectedJobs, profile)
      const response = await generate(systemPrompt, 'Analyze rejection patterns', 800)
      setRejectionAnalysis(response)
    } catch (err) {
      console.error('Failed to generate rejection analysis:', err)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const dayNumber = storage.getDayNumber()

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
            <div>
              <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                Dashboard
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#9a9082', marginTop: '0.25rem' }}>
                Day {dayNumber} of search
              </p>
            </div>
          </div>

          {/* Date range filter */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: '10px 36px 10px 40px',
                fontSize: '13px',
                border: '1px solid #e6dcc8',
                borderRadius: '10px',
                background: 'white',
                cursor: 'pointer',
                fontFamily: 'var(--font-family-body)',
                appearance: 'none',
                minWidth: '200px',
                color: '#3a342d',
                outline: 'none',
              }}
            >
              <option value="this-week">This Week</option>
              <option value="last-week">Last Week</option>
              <option value="last-30">Last 30 Days</option>
              <option value="last-90">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            <Calendar style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#9a9082',
              pointerEvents: 'none',
            }} />
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
        </div>

        {/* Custom date range inputs */}
        {dateRange === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}
          >
            <div>
              <label style={{ fontSize: '0.75rem', color: '#9a9082', display: 'block', marginBottom: '0.25rem' }}>From</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d8cdb8',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#9a9082', display: 'block', marginBottom: '0.25rem' }}>To</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d8cdb8',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Period label */}
        <div style={{
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#9a9082',
          marginBottom: '1.5rem',
        }}>
          {rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#9a9082', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Applications
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)' }}>
              {applications}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#9a9082', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interviews
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)' }}>
              {interviews}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#9a9082', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Screening
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)' }}>
              {screening}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#9a9082', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Offers
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-family-display)', color: '#4a7c59' }}>
              {offers}
            </div>
          </div>
        </div>

        {/* Check-in Streak (only for week views) */}
        {(dateRange === 'this-week' || dateRange === 'last-week') && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Check-in Streak
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const dayDate = new Date(rangeStart)
                dayDate.setDate(rangeStart.getDate() + i)
                const dayCheckin = checkins.find(c => new Date(c.date).toDateString() === dayDate.toDateString())
                const status = dayCheckin?.status

                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '4rem',
                      borderRadius: '8px',
                      background: status === 'done' ? '#1a1714' : status === 'partial' ? '#f4d1cd' : status === 'not' ? '#f5f5f0' : '#fbf6ea',
                      border: '1px solid',
                      borderColor: status === 'done' ? '#1a1714' : status === 'partial' ? '#f4d1cd' : '#e6dcc8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.5rem',
                    }}>
                      {status === 'done' && <span style={{ fontSize: '1.5rem', color: '#f1eadc' }}>✓</span>}
                      {status === 'partial' && <span style={{ fontSize: '1.5rem', color: '#8d4226' }}>−</span>}
                      {status === 'not' && <span style={{ fontSize: '1.5rem', color: '#d8cdb8' }}>×</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9a9082' }}>
                      {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.75rem', color: '#6a6258' }}>
              <span>✓ Done: {checkInStats.done}</span>
              <span>− Partial: {checkInStats.partial}</span>
              <span>× Not today: {checkInStats.not}</span>
            </div>
          </div>
        )}

        {/* AI Assessment (only for week views) */}
        {(dateRange === 'this-week' || dateRange === 'last-week') && assessment && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: '#fbf6ea' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Rocky's Assessment
            </h3>
            <p style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#3a342d',
              whiteSpace: 'pre-wrap',
            }}>
              {assessment}
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Top Movers */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Top Movers
            </h3>
            {topMovers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topMovers.map((job, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.75rem',
                      background: '#fbf6ea',
                      borderRadius: '8px',
                      border: '1px solid #e6dcc8',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                      {job.company}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6a6258' }}>
                      {job.role} · {job.stage}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#9a9082' }}>No activity in this period</p>
            )}
          </div>

          {/* Needs Attention */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Needs Attention
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {staleApplications > 0 && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fff5f5',
                  borderRadius: '8px',
                  border: '1px solid #f4d1cd',
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#c4534a' }}>
                    {staleApplications} stale application{staleApplications !== 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8d4226', marginTop: '0.25rem' }}>
                    No updates in 7+ days
                  </div>
                </div>
              )}
              {lowFitActive > 0 && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fff5f5',
                  borderRadius: '8px',
                  border: '1px solid #f4d1cd',
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#c4534a' }}>
                    {lowFitActive} low-fit role{lowFitActive !== 1 ? 's' : ''} still active
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8d4226', marginTop: '0.25rem' }}>
                    Below 70% fit score
                  </div>
                </div>
              )}
              {staleApplications === 0 && lowFitActive === 0 && (
                <p style={{ fontSize: '0.875rem', color: '#4a7c59' }}>
                  ✓ Pipeline looks healthy
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rejection Patterns Analysis */}
        {hasRejections && (
          <div className="card" style={{ padding: '1.5rem', marginTop: '2rem', background: '#fff5f5', border: '1px solid #f4d1cd' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c4534a', margin: 0 }}>
                Rejection Patterns ({rejectedJobs.length} rejections)
              </h3>
              {!rejectionAnalysis && !analysisLoading && (
                <button
                  onClick={loadRejectionAnalysis}
                  style={{
                    padding: '8px 14px',
                    background: 'white',
                    border: '1px solid #f4d1cd',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: '#8d4226',
                    fontWeight: 500,
                  }}
                >
                  Analyze Patterns
                </button>
              )}
            </div>

            {analysisLoading ? (
              <p style={{ fontSize: '0.875rem', color: '#8d4226', fontStyle: 'italic' }}>
                Analyzing rejection patterns...
              </p>
            ) : rejectionAnalysis ? (
              <div style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                color: '#3a342d',
                whiteSpace: 'pre-wrap',
              }}>
                {rejectionAnalysis}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#8d4226' }}>
                Click "Analyze Patterns" to get Rocky's insights on your rejections
              </p>
            )}

            {/* Quick rejection stats */}
            {!analysisLoading && !rejectionAnalysis && (
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.75rem', color: '#8d4226' }}>
                <span>Applied: {rejectedJobs.filter(j => !j.rejectedAt || j.rejectedAt === 'applied').length}</span>
                <span>Screening: {rejectedJobs.filter(j => j.rejectedAt === 'screening').length}</span>
                <span>Interview: {rejectedJobs.filter(j => j.rejectedAt === 'interview').length}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
