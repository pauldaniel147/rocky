// API client - sends user's API key to backend proxy
import { storage } from './storage'

export class APIError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'APIError'
    this.code = code
  }
}

// Use environment variable for API URL, or empty string for production (same domain)
// In development, defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:3003' : '')

export async function callClaude(systemPrompt, userMessage, maxTokens = 2000) {
  // Get user's API key from localStorage
  const apiKey = storage.getApiKey()

  if (!apiKey) {
    throw new APIError('NO_API_KEY', 'NO_API_KEY')
  }

  try {
    console.log('Calling API:', API_BASE_URL + '/api/claude')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90000) // 90 second timeout

    const response = await fetch(`${API_BASE_URL}/api/claude`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userMessage,
        maxTokens,
        apiKey // Send user's API key to backend
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))

      console.error('API Error:', {
        status: response.status,
        error: error.error,
        code: error.code
      })

      if (response.status === 401 || error.code === 'INVALID_KEY') {
        throw new APIError('Invalid API key. Please check your key in Settings.', 'INVALID_KEY')
      }

      throw new APIError(
        error.error || 'API request failed',
        error.code || 'API_ERROR'
      )
    }

    const data = await response.json()

    if (data.error) {
      throw new APIError(data.error, data.code || 'API_ERROR')
    }

    return data.text
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    console.error('Network error:', error)
    console.error('Error type:', error.name)
    console.error('Error message:', error.message)

    // Network error - backend not reachable
    throw new APIError(
      'Cannot reach backend server. Make sure it\'s running on ' + API_BASE_URL + ' (Error: ' + error.message + ')',
      'NETWORK_ERROR'
    )
  }
}
