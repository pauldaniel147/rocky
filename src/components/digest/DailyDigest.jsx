import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAI } from '../../hooks/useAI'
import { digestPrompt, eveningDigestPrompt } from '../../lib/prompts'
import { storage } from '../../lib/storage'
import { parseAIResponse } from '../../lib/json-utils'

export function DailyDigest() {
  const navigate = useNavigate()

  // Ensure profile exists before proceeding
  const profile = storage.getProfile()
  if (!profile || !profile.name) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Please complete your profile setup first.</p>
      </div>
    )
  }

  // Detect time of day
  const currentHour = new Date().getHours()
  const isEvening = currentHour >= 17 // 5 PM or later
  const timeOfDay = isEvening ? 'evening' : 'morning'

  // Check cache synchronously before render (separate caches for morning/evening)
  const cacheKey = `rocky:digest_cache_${timeOfDay}`
  const cachedDigest = (() => {
    const data = localStorage.getItem(cacheKey)
    if (!data) return null
    const cache = JSON.parse(data)
    const cacheTime = new Date(cache.generatedAt)
    const now = new Date()
    const cutoffTime = new Date()
    cutoffTime.setHours(isEvening ? 17 : 6, 0, 0, 0)
    if (isEvening && now < cutoffTime) {
      cutoffTime.setDate(cutoffTime.getDate() - 1)
    }
    return cacheTime >= cutoffTime ? cache.digest : null
  })()

  const savedTasks = localStorage.getItem(`rocky:digest_tasks_${timeOfDay}`)
  const initialTaskState = savedTasks ? JSON.parse(savedTasks) : {}

  const [digestData, setDigestData] = useState(cachedDigest)
  const [tasks, setTasks] = useState(
    cachedDigest?.tasks?.map((t, i) => ({ ...t, done: initialTaskState[i] || false })) ||
    cachedDigest?.tomorrowPreview?.map((t, i) => ({ ...t, done: initialTaskState[i] || false })) || []
  )
  const { generate, loading, error } = useAI()

  useEffect(() => {
    // Only generate if no cache exists
    if (!cachedDigest) {
      loadDigest()
    }
  }, [])

  const loadDigest = async () => {
    const pipeline = storage.getPipeline()
    const checkins = storage.getCheckins()
    const preferences = storage.getPreferences()
    const profile = storage.getProfile()

    try {
      const systemPrompt = isEvening
        ? eveningDigestPrompt(pipeline, checkins, preferences, profile)
        : digestPrompt(pipeline, checkins, preferences, profile)

      const response = await generate(
        systemPrompt,
        isEvening ? 'Generate evening digest' : 'Generate morning digest',
        2000
      )

      const data = parseAIResponse(response)

      // Cache it with time-specific key
      const cache = {
        date: new Date().toDateString(),
        digest: data,
        generatedAt: new Date().toISOString(),
      }
      localStorage.setItem(`rocky:digest_cache_${timeOfDay}`, JSON.stringify(cache))

      setDigestData(data)
      setTasks((isEvening ? data.tomorrowPreview : data.tasks)?.map(t => ({ ...t, done: false })) || [])

      // Clear old task state for new digest
      localStorage.removeItem(`rocky:digest_tasks_${timeOfDay}`)
    } catch (err) {
      console.error('Failed to generate digest:', err)
    }
  }

  const toggleTask = (index) => {
    const newTasks = tasks.map((t, i) => i === index ? { ...t, done: !t.done } : t)
    setTasks(newTasks)

    // Persist task completion state
    const taskState = {}
    newTasks.forEach((t, i) => {
      taskState[i] = t.done
    })
    localStorage.setItem(`rocky:digest_tasks_${timeOfDay}`, JSON.stringify(taskState))
  }

  const handleStartDay = () => {
    // Mark check-in as done for today
    storage.addCheckin({ status: 'done', note: 'Started day from digest' })

    // Navigate to pipeline
    navigate('/pipeline')
  }

  const handleCheckIn = (status) => {
    // Save check-in
    storage.addCheckin({ status, note: 'Evening check-in' })

    // Navigate to pipeline or home
    navigate('/pipeline')
  }

  const dayNumber = storage.getDayNumber()
  const profile = storage.getProfile()

  // Get upcoming deadlines (next 7 days)
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingDeadlines = storage.getPipeline()
    .filter(j => j.deadline?.date && new Date(j.deadline.date) <= sevenDaysFromNow && new Date(j.deadline.date) >= now)
    .map(j => ({
      company: j.company,
      role: j.role,
      date: new Date(j.deadline.date),
      note: j.deadline.note || 'Deadline',
      daysUntil: Math.ceil((new Date(j.deadline.date) - now) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.date - b.date)

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="loading-pulse" style={{ fontSize: '1.125rem', color: '#6a6258' }}>
          Preparing your digest...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: '#c4534a', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>
          {error.code === 'NO_API_KEY' ? 'API key missing' :
           error.code === 'INVALID_KEY' ? 'Invalid API Key' :
           'Failed to load digest'}
        </p>
        <p style={{ color: '#6a6258', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error.message || 'Please try again or check your settings'}
        </p>
        <button
          onClick={loadDigest}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#1a1714',
            color: '#f1eadc',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Try again
        </button>
      </div>
    )
  }

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
        <div>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()} · DAY {dayNumber} OF SEARCH
        </div>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <span style={{
            padding: '5px 11px',
            borderRadius: '999px',
            border: '1px solid #d8cdb8',
            letterSpacing: '0.08em',
            fontSize: '10px',
            color: '#6a6258',
          }}>{isEvening ? 'Evening' : 'Morning'}</span>
          <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '38px 60px 80px',
      }}>
        {/* Hero */}
        <div style={{
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#9a9082',
          fontWeight: 500,
          marginBottom: '14px',
        }}>
          {isEvening ? 'The evening brief' : 'The morning brief'}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '88px',
            lineHeight: 0.95,
            margin: '0 0 20px',
            letterSpacing: '-0.025em',
            color: '#1a1714',
          }}
        >
          {isEvening ? 'Evening,' : 'Morning,'}<br />
          <span style={{ fontStyle: 'italic' }}>{profile.name?.split(' ')[0] || 'friend'}.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-family-display)',
            fontStyle: 'italic',
            fontSize: '22px',
            lineHeight: 1.4,
            color: '#3a342d',
            maxWidth: '560px',
            margin: '0 0 32px',
          }}
        >
          {isEvening
            ? (digestData?.reflection || 'Loading your reflection...')
            : (digestData?.motivational || 'Loading your personalized message...')}
        </motion.p>

        {/* Urgent Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              background: '#fff5f5',
              padding: '20px 22px',
              borderRadius: '14px',
              border: '1px solid #f4d1cd',
              boxShadow: '0 1px 3px rgba(15,15,15,0.06)',
              marginBottom: '20px',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c4534a" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="6.5"/>
                <path d="M8 5v3l2 2"/>
              </svg>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#c4534a',
                fontWeight: 600,
              }}>
                Urgent deadlines · Next {upcomingDeadlines.length === 1 ? '1 deadline' : `${upcomingDeadlines.length} deadlines`}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingDeadlines.map((deadline, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #f4d1cd',
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: '16px',
                      color: '#1a1714',
                      fontWeight: 500,
                      marginBottom: '2px',
                    }}>
                      {deadline.company} - {deadline.note}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6a6258',
                      fontStyle: 'italic',
                    }}>
                      {deadline.role}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '2px',
                  }}>
                    <div style={{
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: deadline.daysUntil <= 2 ? '#c4534a' : '#8d4226',
                      fontWeight: 600,
                    }}>
                      {deadline.daysUntil === 0 ? 'Today' : deadline.daysUntil === 1 ? 'Tomorrow' : `${deadline.daysUntil} days`}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#9a9082',
                    }}>
                      {deadline.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Scorecard + Reflection/Fit check + Personal task cards */}
        {digestData && (
          <>
            {isEvening && digestData.scorecard && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: '#fbf6ea',
                  padding: '22px',
                  borderRadius: '14px',
                  border: '1px solid #e6dcc8',
                  boxShadow: '0 1px 3px rgba(15,15,15,0.06)',
                  marginBottom: '20px',
                }}
              >
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#9a9082',
                  fontWeight: 500,
                  marginBottom: '10px',
                }}>
                  Today's scorecard
                </div>
                <div style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: '18px',
                  lineHeight: 1.4,
                  color: '#3a342d',
                }}>
                  {digestData.scorecard}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isEvening ? 0.3 : 0.2 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '46px' }}
            >
              {/* Fit check (morning) or Reflection question (evening) */}
              <div style={{
                background: '#fbf6ea',
                padding: '22px',
                borderRadius: '14px',
                border: '1px solid #e6dcc8',
                boxShadow: '0 1px 3px rgba(15,15,15,0.06)',
                position: 'relative',
              }}>
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#8d4226',
                  fontWeight: 500,
                  marginBottom: '10px',
                }}>
                  {isEvening ? 'Reflection' : 'Fit check'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: '20px',
                  lineHeight: 1.3,
                  color: '#1a1714',
                }}>
                  {isEvening ? digestData.reflectionQuestion : digestData.fitCheck}
                </div>
              </div>

              {/* Personal task */}
              <div style={{
                background: '#fffaf0',
                padding: '22px',
                borderRadius: '14px',
                border: '1px solid #e6dcc8',
                boxShadow: '0 1px 3px rgba(15,15,15,0.06)',
              }}>
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#9a9082',
                  fontWeight: 500,
                  marginBottom: '10px',
                }}>
                  For you
                </div>
                <div style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: '20px',
                  lineHeight: 1.3,
                  color: '#1a1714',
                }}>
                  {digestData.personalTask}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Tasks section */}
        {tasks.length > 0 && (
          <div style={{ marginTop: '46px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#1a1714',
                fontWeight: 600,
              }}>
                {isEvening ? 'Tomorrow' : 'Today'} · {tasks.length} things
              </div>
              <hr style={{ flex: 1, height: '1px', background: '#d8cdb8', border: 0 }} />
              <div style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#9a9082',
                fontWeight: 500,
              }}>
                ≈ {tasks.reduce((sum, t) => sum + (parseInt(t.context?.match(/\d+/)?.[0]) || 10), 0)} min total
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '54px 1fr auto',
                    gap: '18px',
                    alignItems: 'baseline',
                    padding: '18px 0',
                    borderTop: i === 0 ? '1px solid #1a1714' : '1px solid #d8cdb8',
                    opacity: task.done ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-family-display)',
                    fontStyle: 'italic',
                    fontSize: '30px',
                    color: '#9a9082',
                    letterSpacing: '-0.02em',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                      <span style={{
                        fontFamily: 'var(--font-family-display)',
                        fontSize: '22px',
                        color: '#1a1714',
                        letterSpacing: '-0.01em',
                        textDecoration: task.done ? 'line-through' : 'none',
                      }}>
                        {task.label}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6a6258',
                      lineHeight: 1.45,
                      fontStyle: 'italic',
                      fontFamily: 'var(--font-family-display)',
                    }}>
                      {task.context}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => toggleTask(i)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '999px',
                        border: task.done ? 'none' : '1px solid #d8cdb8',
                        background: task.done ? '#1a1714' : 'transparent',
                        color: task.done ? '#f1eadc' : '#3a342d',
                        fontSize: '11px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {task.done ? '✓ Done' : 'Mark done'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {isEvening ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: '36px' }}
          >
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#9a9082',
              fontWeight: 500,
              marginBottom: '14px',
            }}>
              How did today go?
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleCheckIn('done')}
                style={{
                  flex: 1,
                  padding: '18px',
                  background: '#1a1714',
                  color: '#f1eadc',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                ✓ Done
              </button>
              <button
                onClick={() => handleCheckIn('partial')}
                style={{
                  flex: 1,
                  padding: '18px',
                  background: 'transparent',
                  color: '#3a342d',
                  border: '1px solid #d8cdb8',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Partial
              </button>
              <button
                onClick={() => handleCheckIn('not')}
                style={{
                  flex: 1,
                  padding: '18px',
                  background: 'transparent',
                  color: '#3a342d',
                  border: '1px solid #d8cdb8',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Not today
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={handleStartDay}
            className="btn-primary"
            style={{ marginTop: '36px' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                <span style={{ fontFamily: 'var(--font-family-display)', fontSize: '22px', fontStyle: 'italic' }}>
                  Start my day
                </span>
                <span style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '3px' }}>
                  {tasks[0]?.label || 'Go to pipeline'} first
                </span>
              </span>
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 7h10M8 3l4 4-4 4"/>
              </svg>
            </span>
          </motion.button>
        )}
      </div>
    </div>
  )
}
