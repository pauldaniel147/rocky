// Vercel serverless function for Claude API proxy
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
      const error = await response.json()
      return res.status(response.status).json({
        error: error.error?.message || 'API request failed',
        code: response.status === 401 ? 'INVALID_KEY' : 'API_ERROR'
      })
    }

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
    console.error('Claude API error:', error)
    res.status(500).json({
      error: error.message,
      code: 'NETWORK_ERROR'
    })
  }
}
