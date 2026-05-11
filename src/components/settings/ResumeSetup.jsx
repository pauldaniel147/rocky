import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAI } from '../../hooks/useAI'
import { parseAIResponse } from '../../lib/json-utils'

export function ResumeSetup({ onComplete, onSkip }) {
  const [resumeText, setResumeText] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const { generate, loading, error } = useAI()

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return

    try {
      const systemPrompt = `You are Rocky, an AI job search assistant. Analyze this resume and extract structured information.

Extract:
1. Name (full name)
2. Current/most recent role
3. Years of total experience (estimate from work history)
4. Location (city/country)
5. Primary field (Product Management, Engineering, Design, Sales, Marketing, etc.)
6. Key strengths (3-5 bullet points of their strongest skills/achievements)
7. Work preferences based on resume signals

Additional context from user: ${additionalContext || 'None provided'}

IMPORTANT: Return ONLY valid JSON, no other text. Do not include markdown code blocks or explanations.

JSON format:
{
  "profile": {
    "name": "...",
    "role": "...",
    "yearsExp": 10,
    "location": "...",
    "field": "..."
  },
  "preferences": {
    "workHours": "standard",
    "companyType": "any",
    "timezone": "india-only"
  },
  "strengths": ["...", "...", "..."],
  "careerStory": "2-3 sentence summary of their career trajectory and what they're known for"
}`

      const userMessage = `Resume:\n\n${resumeText}`

      const response = await generate(systemPrompt, userMessage, 3000)
      const data = parseAIResponse(response)
      onComplete(data)
    } catch (err) {
      console.error('Failed to analyze resume:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
    >
      <div style={{ width: '100%', maxWidth: '48rem' }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '3rem',
            fontWeight: 700,
            color: 'var(--color-accent-black)',
            marginBottom: '0.75rem'
          }}>
            Let Rocky read your resume
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem', maxWidth: '38rem', margin: '0 auto' }}>
            Paste your resume below and I'll auto-fill your profile, preferences, and strengths.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* Resume text area */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Your resume (paste as text)
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here...

Example:
John Doe
Senior Product Manager | 8 years experience
Mumbai, India

EXPERIENCE
- Product Manager at Company X (2020-present)
- Associate PM at Company Y (2018-2020)
..."
              className="input"
              style={{
                minHeight: '300px',
                fontFamily: 'var(--font-family-mono)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                resize: 'vertical',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#9a9082', marginTop: '0.5rem' }}>
              {resumeText.length} characters
            </p>
          </div>

          {/* Additional context */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Additional preferences (optional)
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Tell me what matters to you in your next role...

Example:
- Looking for better work-life balance (no more than 45 hrs/week)
- Prefer established companies over early-stage startups
- Want to stay in India timezone, no US hours
- Interested in B2B SaaS products"
              className="input"
              style={{
                minHeight: '140px',
                fontFamily: 'var(--font-family-body)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                resize: 'vertical',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              background: 'rgba(196, 83, 74, 0.1)',
              border: '1px solid rgba(196, 83, 74, 0.3)',
              borderRadius: '8px',
              color: '#c4534a',
              fontSize: '0.875rem',
            }}>
              {error.message || 'Failed to analyze resume. Please try again.'}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={handleAnalyze}
              disabled={!resumeText.trim() || loading}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? 'Analyzing your resume...' : 'Analyze & continue →'}
            </button>
            <button
              onClick={onSkip}
              className="btn-secondary"
              style={{ flex: 0, minWidth: '120px' }}
            >
              Skip this
            </button>
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: '#9a9082',
            textAlign: 'center',
            marginTop: '0.5rem'
          }}>
            Your resume is analyzed locally. Nothing is stored on any server.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
