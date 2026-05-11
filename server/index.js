import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Rocky backend is running' })
})

// Claude API proxy - uses user-provided API key
app.post('/api/claude', async (req, res) => {
  console.log('📥 Received request to /api/claude')
  const { systemPrompt, userMessage, maxTokens = 2000, apiKey } = req.body

  if (!apiKey) {
    return res.status(400).json({
      error: 'API key required',
      code: 'NO_API_KEY'
    })
  }

  if (!apiKey.startsWith('sk-ant-')) {
    return res.status(400).json({
      error: 'Invalid API key format',
      code: 'INVALID_KEY_FORMAT'
    })
  }

  try {
    console.log('🔄 Calling Anthropic API with model: claude-sonnet-4-6')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    })

    if (!response.ok) {
      console.error('❌ Anthropic API error:', response.status)
      const error = await response.json()
      console.error('Error details:', error)
      return res.status(response.status).json({
        error: error.error?.message || 'API request failed',
        code: response.status === 401 ? 'INVALID_KEY' : 'API_ERROR'
      })
    }

    console.log('✅ Got response from Anthropic')

    const data = await response.json()

    if (data.error) {
      return res.status(400).json({
        error: data.error.message,
        code: 'API_ERROR'
      })
    }

    res.json({
      text: data.content[0].text
    })

  } catch (error) {
    console.error('❌ Claude API error:', error.message)
    console.error('Full error:', error)
    res.status(500).json({
      error: error.message,
      code: 'NETWORK_ERROR'
    })
  }
})

// Job scraper endpoint
app.post('/api/scrape-job', async (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL required' })
  }

  try {
    // Fetch the job page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch URL' })
    }

    const html = await response.text()

    // Extract text content - remove HTML tags
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    // Limit to reasonable size (Claude can handle it but let's be efficient)
    const truncated = text.substring(0, 15000)

    res.json({ text: truncated })

  } catch (error) {
    console.error('Scrape error:', error)
    res.status(500).json({ error: 'Failed to scrape URL' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Rocky backend running on http://localhost:${PORT}`)
  console.log(`   API proxy: POST /api/claude`)
  console.log(`   Health check: GET /api/health`)
})

export default app
