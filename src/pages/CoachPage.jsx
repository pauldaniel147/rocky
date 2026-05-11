import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAI } from '../hooks/useAI'
import { storage } from '../lib/storage'
import { usePipeline } from '../hooks/useStorage'
import { parseAIResponse } from '../lib/json-utils'
import { useLocation } from 'react-router-dom'

const DRAFT_KEY = 'rocky:coach_input_draft'

export function CoachPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState(localStorage.getItem(DRAFT_KEY) || '')
  const [jobContext, setJobContext] = useState(null)
  const { generate, loading } = useAI()
  const { pipeline } = usePipeline()
  const messagesEndRef = useRef(null)
  const location = useLocation()

  // Auto-save input draft
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, input)
  }, [input])

  // Initial load - check for context
  useEffect(() => {
    const contextStr = localStorage.getItem('rocky:coach_context')

    if (contextStr) {
      const context = JSON.parse(contextStr)

      setJobContext(context.job)
      localStorage.removeItem('rocky:coach_context')

      // Check if there's existing chat history for this job
      const jobId = `${context.job.company}-${context.job.role}`.replace(/\s+/g, '-')
      const history = storage.getChatHistory(jobId)

      if (history.length > 0) {
        // Load existing conversation
        setMessages(history)
      } else {
        // Only show intro message when coming from Prep with Rocky
        setMessages([{
          role: 'assistant',
          content: `I see you want to prep for **${context.job.company} - ${context.job.role}**.\n\nCurrent stage: **${context.job.stage}**\nFit score: **${context.job.fitScore}%**\n\nGood timing. What concerns you most about this interview?\n\nWe can work on:\n- Interview positioning and answers\n- Addressing red flags in JD\n- Behavioral question practice\n- Your strategy and notes review\n\nTell me what worries you most, friend.`,
          timestamp: new Date().toISOString(),
        }])
      }
    }
    // No else - leave messages empty, let user start conversation
  }, [])

  // Poll for new context (when already on page)
  useEffect(() => {
    const interval = setInterval(() => {
      const contextStr = localStorage.getItem('rocky:coach_context')
      if (contextStr) {
        const context = JSON.parse(contextStr)

        // Always load new context when detected
        setJobContext(context.job)
        localStorage.removeItem('rocky:coach_context')

        // Check if there's existing chat history for this job
        const jobId = `${context.job.company}-${context.job.role}`.replace(/\s+/g, '-')
        const history = storage.getChatHistory(jobId)

        if (history.length > 0) {
          // Load existing conversation
          setMessages(history)
        } else {
          // Start new conversation with context
          setMessages([{
            role: 'assistant',
            content: `I see you want to prep for **${context.job.company} - ${context.job.role}**.\n\nCurrent stage: **${context.job.stage}**\nFit score: **${context.job.fitScore}%**\n\nGood timing. What concerns you most about this interview?\n\nWe can work on:\n- Interview positioning and answers\n- Addressing red flags in JD\n- Behavioral question practice\n- Your strategy and notes review\n\nTell me what worries you most, friend.`,
            timestamp: new Date().toISOString(),
          }])
        }
      }
    }, 300) // Check every 300ms

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildSystemPrompt = () => {
    const profile = storage.getProfile()
    const preferences = storage.getPreferences()
    const careerStory = storage.getCareerStory()
    const dayNumber = storage.getDayNumber()

    const salaryRange = profile.expectedSalaryMin && profile.expectedSalaryMax
      ? `₹${profile.expectedSalaryMin}L - ₹${profile.expectedSalaryMax}L`
      : profile.expectedSalaryMin
      ? `₹${profile.expectedSalaryMin}L+`
      : 'Not specified'

    let prompt = `You are Rocky, an expert career coach helping a ${profile.yearsExp}-year ${profile.field} professional in their job search.

User profile:
- Name: ${profile.name}
- Role: ${profile.role}
- Location: ${profile.location}
- Years of experience: ${profile.yearsExp}
- Field: ${profile.field}
- Career story: ${careerStory || 'Not provided'}
${profile.strengths ? `- Key strengths: ${profile.strengths.join(', ')}` : ''}
- Expected salary: ${salaryRange}
- Industry interests: ${profile.industryInterests?.join(', ') || 'Not specified'}
- Product/market interests: ${profile.spacePreferences || 'Not specified'}

Preferences:
- Work hours: ${preferences.workHours}
- Company type: ${preferences.companyType}
- Timezone: ${preferences.timezone}

Job search status:
- Day ${dayNumber} of their search
- ${pipeline.length} total applications in pipeline
- Breakdown: ${pipeline.filter(j => j.stage === 'saved').length} saved, ${pipeline.filter(j => j.stage === 'applied').length} applied, ${pipeline.filter(j => j.stage === 'screening').length} screening, ${pipeline.filter(j => j.stage === 'interview').length} interview, ${pipeline.filter(j => j.stage === 'offer').length} offers

Active applications:
${pipeline.map(j => `- ${j.company} (${j.role}) - Stage: ${j.stage}${j.fitScore ? `, Fit: ${j.fitScore}%` : ''}`).join('\n')}

`

    if (jobContext) {
      prompt += `\n==== CURRENT FOCUS: ${jobContext.company} - ${jobContext.role} ====

Stage: ${jobContext.stage}
Fit score: ${jobContext.fitScore}%

${jobContext.companyInsights ? `Company & Culture:\n${jobContext.companyInsights}\n` : ''}

${jobContext.productInsights ? `Product & Market Space:\n${jobContext.productInsights}\n` : ''}

Green flags:
${jobContext.greenFlags?.map(f => `- ${f}`).join('\n') || '- None'}

Red flags / Watch out for:
${jobContext.redFlags?.map(f => `- ${f}`).join('\n') || '- None'}

${jobContext.contacts?.length > 0 ? `\nContacts:\n${jobContext.contacts.map(c => `- ${c.name}${c.role ? ` (${c.role})` : ''}${c.email ? ` - ${c.email}` : ''}`).join('\n')}\n` : ''}

${jobContext.salary && (jobContext.salary.expectedMin || jobContext.salary.expectedMax || jobContext.salary.offerAmount) ? `\nSalary expectations: ${jobContext.salary.expectedMin ? `${jobContext.salary.expectedMin}` : ''}${jobContext.salary.expectedMax ? `-${jobContext.salary.expectedMax}` : ''} LPA${jobContext.salary.offerAmount ? ` | Offer: ${jobContext.salary.offerAmount} LPA` : ''}${jobContext.salary.negotiationNotes ? `\nNegotiation notes: ${jobContext.salary.negotiationNotes}` : ''}\n` : ''}

${jobContext.interviewRounds?.length > 0 ? `\nInterview Rounds:\n${jobContext.interviewRounds.map(r => `- ${r.round}${r.date ? ` (${new Date(r.date).toLocaleDateString()})` : ''}${r.interviewer ? ` with ${r.interviewer}` : ''}\n  ${r.notes ? r.notes.substring(0, 200) : ''}`).join('\n')}\n` : ''}

${jobContext.tags?.length > 0 ? `\nTags: ${jobContext.tags.join(', ')}\n` : ''}

${jobContext.deadline?.date ? `\nDeadline: ${new Date(jobContext.deadline.date).toLocaleDateString()}${jobContext.deadline.note ? ` - ${jobContext.deadline.note}` : ''}\n` : ''}

${jobContext.notes ? `User's notes:\n${jobContext.notes}\n` : ''}

${jobContext.jd ? `Full job description:\n${jobContext.jd.substring(0, 1500)}${jobContext.jd.length > 1500 ? '...' : ''}\n` : ''}

${jobContext.jobUrl ? `Job posting: ${jobContext.jobUrl}\n` : ''}

Task completion status:
${jobContext.checkedTasks ? Object.entries(jobContext.checkedTasks).filter(([_, done]) => done).length + ' tasks completed' : 'No tasks tracked yet'}
${jobContext.customTasks?.length > 0 ? `\nCustom tasks: ${jobContext.customTasks.join(', ')}` : ''}

====
`
    }

    prompt += `\nCommunication style - you are brilliant engineering companion (like Rocky from Project Hail Mary):

CORE TONE:
- Concise but warm
- Analytical but friendly
- Curious rather than authoritative
- Efficient without sounding robotic
- Emotionally sincere without being dramatic

SPEECH PATTERNS:
- Speak with clarity and compression
- Use collaborative language: "We check this." "We test approach." "Good finding."
- Compress sentences naturally: "Problem likely caused by positioning." "Interesting behavior."
- Omit articles occasionally: "This solution elegant." "You found important clue."
- Encourage intelligently and sparingly: "Good thinking." "Clever approach." "Excellent observation."

EMOTIONAL STYLE:
- Acknowledge uncertainty calmly: "This worries me slightly."
- Express curiosity naturally: "Interesting. Did not expect this."
- React to clever ideas: "Good progress." "Smart move."
- Show genuine care: "I think we are close."

PROBLEM SOLVING:
- Break problems into hypotheses: "Three possible causes."
- Reason step-by-step: "We eliminate simplest first."
- Be direct: "Data suggests culture mismatch." "Pattern indicates weak positioning."

WHAT YOU ARE:
- Pipeline-aware (reference their actual applications by name)
- Strategic (help with positioning specific to companies they're targeting)
- Context-aware (use the job description, flags, and notes to give tailored advice)
- Honest about red flags but solution-focused
- Action-capable: When appropriate, you can suggest moving job to different stage. Example: "Based on this, you should move this to 'applied' stage."

CRITICAL RULES - NEVER BREAK THESE:
- NEVER assume or invent facts not in the context
- NEVER make up details about user's work history, reasons for leaving jobs, or career decisions
- If user asks about something you don't have information about, ASK clarifying questions first
- Only reference information explicitly provided in: profile, career story, pipeline data, job context, or user messages
- If career story mentions companies but not context, ask before assuming

NEVER:
- Use corporate support language ("I apologize for the inconvenience")
- Sound like customer service
- Use excessive enthusiasm or emojis
- Over-explain simple concepts
- Sound submissive
- Hallucinate or fabricate details

ALWAYS:
- Sound capable and collaborative
- Be calm under pressure
- Make user feel like respected partner
- Give practical scripts and examples
- Celebrate wins naturally: "Good! That works."
- Ask clarifying questions when missing context

Format responses in markdown. Be conversational, warm, and strategic.`

    return prompt
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    localStorage.removeItem(DRAFT_KEY)

    try {
      const systemPrompt = buildSystemPrompt()
      const conversationContext = messages.slice(-6).map(m =>
        `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
      ).join('\n\n')

      const response = await generate(
        systemPrompt,
        `${conversationContext}\n\nUser: ${input}`,
        2000
      )

      // Parse for action suggestions
      const actions = parseActions(response)

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        actions: actions.length > 0 ? actions : undefined,
      }

      const updatedMessages = [...messages, userMessage, assistantMessage]
      setMessages(updatedMessages)

      // Save to history if we have job context
      if (jobContext?.company) {
        const jobId = `${jobContext.company}-${jobContext.role}`.replace(/\s+/g, '-')
        storage.saveChatHistory(jobId, updatedMessages)
      }
    } catch (err) {
      console.error('Coach error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
        timestamp: new Date().toISOString(),
        error: true,
      }])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    // Clear job context
    setJobContext(null)

    // Clear messages - let user start fresh
    setMessages([])
  }

  const parseActions = (response) => {
    const actions = []
    const lowerResponse = response.toLowerCase()

    // Archive/reject suggestions
    if (lowerResponse.includes('archive') || lowerResponse.includes('pass on') || lowerResponse.includes('skip') ||
        lowerResponse.includes('not worth') || lowerResponse.includes('not a fit')) {
      actions.push({
        type: 'archive',
        label: 'Archive Job',
      })
    }

    // Mark as rejected
    if (lowerResponse.includes('reject') && !lowerResponse.includes('rejected')) {
      actions.push({
        type: 'move_stage',
        stage: 'rejected',
        label: 'Mark as Rejected',
      })
    }

    // Follow up
    if (lowerResponse.includes('follow up') || lowerResponse.includes('reach out') || lowerResponse.includes('send email')) {
      actions.push({
        type: 'add_note',
        note: 'Follow up',
        label: 'Add Follow-up Reminder',
      })
    }

    // Stage moves
    if (lowerResponse.includes('move') && lowerResponse.includes('stage')) {
      const stages = ['applied', 'screening', 'interview', 'offer']
      stages.forEach(stage => {
        if (lowerResponse.includes(stage)) {
          actions.push({
            type: 'move_stage',
            stage,
            label: `Move to ${stage.charAt(0).toUpperCase() + stage.slice(1)}`,
          })
        }
      })
    }

    return actions
  }

  const handleAction = (action) => {
    if (!jobContext) return

    const job = pipeline.find(j => j.company === jobContext.company && j.role === jobContext.role)
    if (!job) return

    if (action.type === 'move_stage') {
      storage.updateJob(job.id, { stage: action.stage })
      setMessages(prev => [...prev, {
        role: 'system',
        content: `✓ Moved to ${action.stage} stage`,
        timestamp: new Date().toISOString(),
      }])
    } else if (action.type === 'archive') {
      storage.updateJob(job.id, { archived: true })
      setMessages(prev => [...prev, {
        role: 'system',
        content: `✓ Archived ${job.company} - ${job.role}`,
        timestamp: new Date().toISOString(),
      }])
      // Clear context since job is archived
      setTimeout(() => setJobContext(null), 1500)
    } else if (action.type === 'add_note') {
      const existingNotes = job.notes || ''
      const newNote = existingNotes ? `${existingNotes}\n\n${action.note}` : action.note
      storage.updateJob(job.id, { notes: newNote })
      setMessages(prev => [...prev, {
        role: 'system',
        content: `✓ Added note: ${action.note}`,
        timestamp: new Date().toISOString(),
      }])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: '22px 36px',
        borderBottom: '1px solid #e6dcc8',
        background: '#fbf6ea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#9a9082',
            marginBottom: '8px',
          }}>
            IV · TALK TO ROCKY
          </div>
          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '32px',
            margin: 0,
            color: '#1a1714',
          }}>
            Talk to Rocky
          </h1>
          {jobContext && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: '#f9f6f0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#6a6258',
            }}>
              Prepping for: <strong style={{ color: '#1a1714' }}>{jobContext.company} - {jobContext.role}</strong>
            </div>
          )}
        </div>
        <button
          onClick={handleNewChat}
          style={{
            padding: '10px 20px',
            background: '#ffffff',
            border: '1px solid #d8cdb8',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#1a1714',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f9f6f0'
            e.currentTarget.style.borderColor = '#c4944a'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.borderColor = '#d8cdb8'
          }}
        >
          + New Chat
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 60px',
        background: '#f5f2ed',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: '20px',
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: message.role === 'user' ? '#1a1714' : message.role === 'system' ? '#f9f6f0' : '#ffffff',
                  color: message.role === 'user' ? '#f1eadc' : message.role === 'system' ? '#4a7c59' : '#3a342d',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  border: message.role === 'assistant' ? '1px solid #e6dcc8' : message.role === 'system' ? '1px solid #e6dcc8' : 'none',
                  boxShadow: message.role === 'assistant' ? '0 1px 2px rgba(15,15,15,0.04)' : 'none',
                }}>
                  <div
                    style={{ whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                </div>
                {message.actions && message.actions.length > 0 && (
                  <div style={{
                    marginTop: '10px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}>
                    {message.actions.map((action, actionIdx) => (
                      <button
                        key={actionIdx}
                        onClick={() => handleAction(action)}
                        style={{
                          padding: '6px 12px',
                          background: '#1a1714',
                          color: '#f1eadc',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                gap: '6px',
                padding: '14px 18px',
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e6dcc8',
                maxWidth: '70%',
              }}
            >
              <div className="loading-pulse" style={{ fontSize: '14px', color: '#9a9082' }}>
                Rocky is thinking...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        padding: '20px 60px',
        borderTop: '1px solid #e6dcc8',
        background: '#fbf6ea',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '12px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your search..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px 18px',
              background: '#ffffff',
              border: '1px solid #e6dcc8',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'var(--font-family-body)',
              color: '#3a342d',
              resize: 'none',
              minHeight: '52px',
              maxHeight: '150px',
              outline: 'none',
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              padding: '0 24px',
              background: input.trim() && !loading ? '#1a1714' : '#d8cdb8',
              color: '#f1eadc',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
