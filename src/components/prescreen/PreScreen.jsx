import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAI } from '../../hooks/useAI'
import { prescreenPrompt } from '../../lib/prompts'
import { storage } from '../../lib/storage'
import { usePipeline } from '../../hooks/useStorage'
import { useNavigate } from 'react-router-dom'
import { parseAIResponse } from '../../lib/json-utils'
import { PreScreenForm } from './PreScreenForm'

const DRAFT_KEY = 'rocky:prescreen_draft'

export function PreScreen() {
  // Load draft from localStorage
  const savedDraft = localStorage.getItem(DRAFT_KEY)
  const draft = savedDraft ? JSON.parse(savedDraft) : {}

  const [jd, setJd] = useState(draft.jd || '')
  const [jobUrl, setJobUrl] = useState(draft.jobUrl || '')
  const [company, setCompany] = useState(draft.company || '')
  const [title, setTitle] = useState(draft.title || '')
  const [salaryMin, setSalaryMin] = useState(draft.salaryMin || '')
  const [salaryMax, setSalaryMax] = useState(draft.salaryMax || '')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const { generate, loading } = useAI()
  const { addJob } = usePipeline()
  const navigate = useNavigate()

  // Auto-save draft whenever form data changes
  useEffect(() => {
    const draft = { jd, jobUrl, company, title, salaryMin, salaryMax }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [jd, jobUrl, company, title, salaryMin, salaryMax])

  const handleUrlChange = async (newUrl) => {
    setJobUrl(newUrl)
    setFetchError(false)

    // Auto-fetch when URL looks valid and JD is empty
    if (newUrl.match(/^https?:\/\/.+/) && !jd.trim()) {
      setFetching(true)

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3003' : '')
        const response = await fetch(`${API_BASE_URL}/api/scrape-job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: newUrl }),
        })

        if (response.ok) {
          const data = await response.json()
          const fetchedText = data.text || ''
          if (fetchedText) {
            setJd(fetchedText)
            setFetchError(false)
          } else {
            setFetchError(true)
          }
        } else {
          setFetchError(true)
        }
      } catch (error) {
        console.error('Auto-fetch failed:', error)
        setFetchError(true)
      } finally {
        setFetching(false)
      }
    }
  }

  const analyze = async () => {
    setError(null)

    if (!jobUrl.trim()) {
      setError('Job URL is required')
      return
    }

    if (!jd.trim()) {
      setError('Job description is required')
      return
    }

    if (!company.trim()) {
      setError('Company name is required')
      return
    }

    if (!title.trim()) {
      setError('Job title is required')
      return
    }

    const preferences = storage.getPreferences()
    const profile = storage.getProfile()

    try {
      const systemPrompt = prescreenPrompt(preferences, profile)
      const userMessage = `Job URL: ${jobUrl}\n\nCompany: ${company}\nRole: ${title}\n${salaryMin || salaryMax ? `\nSalary Range: ${salaryMin || ''}${salaryMin && salaryMax ? ' - ' : ''}${salaryMax || ''} LPA` : ''}\n\nJob Description:\n${jd}`

      const response = await generate(systemPrompt, userMessage, 2500)
      const data = parseAIResponse(response)

      // Use user-provided data
      data.company = company
      data.role = title
      data.jobUrl = jobUrl
      data.jd = jd
      data.salary = salaryMin || salaryMax ? { expectedMin: salaryMin, expectedMax: salaryMax } : undefined

      setResult(data)
    } catch (err) {
      console.error('Analysis failed:', err)
      setError(err.message || 'Failed to analyze. Please try again.')
    }
  }

  const handleAddToPipeline = () => {
    if (!result) return

    const newJob = addJob({
      company: result.company || company,
      role: result.role || title,
      jd: jd,
      jobUrl: jobUrl,
      fitScore: result.fitScore,
      verdict: result.verdict,
      greenFlags: result.greenFlags,
      redFlags: result.redFlags,
      reasoning: result.reasoning,
      companyInsights: result.companyInsights || '',
      productInsights: result.productInsights || '',
      salary: result.salary,
      stage: 'saved',
    })

    // Clear draft after successful save
    localStorage.removeItem(DRAFT_KEY)

    navigate('/pipeline')
  }

  const handleClearDraft = () => {
    setJd('')
    setJobUrl('')
    setCompany('')
    setTitle('')
    setSalaryMin('')
    setSalaryMax('')
    setResult(null)
    setError(null)
    localStorage.removeItem(DRAFT_KEY)
  }

  const getFitColor = (score) => {
    if (score >= 75) return '#4a7c59'
    if (score >= 60) return '#c4944a'
    return '#c4534a'
  }

  return (
    <div>
      {/* Top utility */}
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
        <div>II · PRE-SCREEN · SHOULD I APPLY?</div>
        <div style={{
          padding: '5px 11px',
          borderRadius: '999px',
          border: '1px solid #d8cdb8',
        }}>
          3 left this week
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '36px 60px 60px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '54px',
            lineHeight: 1,
            margin: 0,
            letterSpacing: '-0.022em',
            color: '#1a1714',
          }}>
            Should I <span style={{ fontStyle: 'italic' }}>apply</span>?
          </h1>
          <p style={{
            fontFamily: 'var(--font-family-display)',
            fontStyle: 'italic',
            fontSize: '16px',
            color: '#6a6258',
            maxWidth: '380px',
            textAlign: 'right',
            margin: 0,
            lineHeight: 1.4,
          }}>
            Paste it before you save it. The cost of the wrong "yes" is two weeks of your search energy.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <PreScreenForm
              jobUrl={jobUrl}
              setJobUrl={handleUrlChange}
              company={company}
              setCompany={setCompany}
              title={title}
              setTitle={setTitle}
              salaryMin={salaryMin}
              setSalaryMin={setSalaryMin}
              salaryMax={salaryMax}
              setSalaryMax={setSalaryMax}
              jd={jd}
              setJd={setJd}
              onAnalyze={analyze}
              onClear={handleClearDraft}
              loading={loading}
              error={error}
              fetching={fetching}
              fetchError={fetchError}
            />
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '24px' }}
            >
              {/* JD preview */}
              <div style={{
                background: '#fbf6ea',
                borderRadius: '14px',
                border: '1px solid #e6dcc8',
                padding: '20px 24px',
                maxHeight: '600px',
                overflow: 'auto',
              }}>
                <div style={{
                  fontSize: '10px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#1a1714',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}>
                  Job description
                </div>
                <div style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#3a342d',
                  whiteSpace: 'pre-wrap',
                }}>
                  {jd.slice(0, 800)}...
                </div>
              </div>

              {/* Verdict panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Fit ring */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    background: '#fbf6ea',
                    borderRadius: '14px',
                    border: '1px solid #e6dcc8',
                    padding: '24px',
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr',
                    gap: '22px',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#e6dcc8" strokeWidth="8" />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke={getFitColor(result.fitScore)}
                        strokeWidth="8"
                        strokeDasharray={`${result.fitScore * 3.27} 327`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-family-display)',
                        fontSize: '42px',
                        lineHeight: 1,
                        color: '#1a1714',
                      }}>
                        {result.fitScore}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#9a9082',
                        fontWeight: 500,
                        marginTop: '4px',
                      }}>
                        fit
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: getFitColor(result.fitScore),
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}>
                      Verdict
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-family-display)',
                      fontSize: '30px',
                      lineHeight: 1.05,
                      marginBottom: '6px',
                      letterSpacing: '-0.015em',
                      color: '#1a1714',
                    }}>
                      {result.verdict === 'apply' && 'Apply'}
                      {result.verdict === 'caution' && <>Apply — <span style={{ fontStyle: 'italic' }}>cautiously.</span></>}
                      {result.verdict === 'avoid' && <>Skip <span style={{ fontStyle: 'italic' }}>this one.</span></>}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6a6258',
                      lineHeight: 1.5,
                    }}>
                      {result.reasoning}
                    </div>
                  </div>
                </motion.div>

                {/* Intelligence disclaimer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.14 }}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(196, 148, 74, 0.08)',
                    border: '1px solid rgba(196, 148, 74, 0.2)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#8d7c59',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                  }}
                >
                  ℹ️ Intelligence below is AI-generated from training data (Jan 2025 cutoff). Verify key facts independently.
                </motion.div>

                {/* Company Insights */}
                {result.companyInsights && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                      background: '#f9f6f0',
                      borderRadius: '14px',
                      border: '1px solid #e6dcc8',
                      padding: '20px',
                    }}
                  >
                    <div style={{
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#8d7c59',
                      fontWeight: 600,
                      marginBottom: '12px',
                    }}>
                      Company & Culture
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#3a342d',
                      lineHeight: 1.6,
                      fontFamily: 'var(--font-family-body)',
                    }}>
                      {result.companyInsights}
                    </div>
                  </motion.div>
                )}

                {/* Product Insights */}
                {result.productInsights && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.17 }}
                    style={{
                      background: '#f9f6f0',
                      borderRadius: '14px',
                      border: '1px solid #e6dcc8',
                      padding: '20px',
                    }}
                  >
                    <div style={{
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#c4784a',
                      fontWeight: 600,
                      marginBottom: '12px',
                    }}>
                      Product & Market Space
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#3a342d',
                      lineHeight: 1.6,
                      fontFamily: 'var(--font-family-body)',
                    }}>
                      {result.productInsights}
                    </div>
                  </motion.div>
                )}

                {/* Green flags */}
                {result.greenFlags?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      background: '#fbf6ea',
                      borderRadius: '14px',
                      border: '1px solid #e6dcc8',
                      padding: '20px',
                    }}
                  >
                    <div style={{
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#4a7c59',
                      fontWeight: 600,
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6.5l3 3 5-6"/>
                      </svg>
                      Green flags · {result.greenFlags.length}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.greenFlags.map((flag, i) => (
                        <li key={i} style={{ fontSize: '13px', color: '#3a342d', lineHeight: 1.5 }}>
                          • {flag}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Red flags */}
                {result.redFlags?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      background: 'rgba(196, 83, 74, 0.04)',
                      borderRadius: '14px',
                      border: '1px solid rgba(196, 83, 74, 0.25)',
                      padding: '20px',
                    }}
                  >
                    <div style={{
                      fontSize: '10px',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#c4534a',
                      fontWeight: 600,
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M2 2l6 6M8 2l-6 6"/>
                      </svg>
                      Read carefully · {result.redFlags.length}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {result.redFlags.map((flag, i) => (
                        <li key={i} style={{ fontSize: '13px', color: '#3a342d', lineHeight: 1.5 }}>
                          • {flag}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* CTAs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={handleAddToPipeline}
                    className="btn-primary"
                    style={{ padding: '14px 18px', fontSize: '18px' }}
                  >
                    <span style={{ fontFamily: 'var(--font-family-display)', fontStyle: 'italic' }}>
                      Add to pipeline · Saved
                    </span>
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="btn-secondary"
                    style={{ padding: '14px 18px' }}
                  >
                    Skip this one
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
