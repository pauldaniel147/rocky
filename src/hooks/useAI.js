import { useState } from 'react'
import { callClaude, APIError } from '../lib/anthropic'

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generate = async (systemPrompt, userMessage, maxTokens) => {
    setLoading(true)
    setError(null)

    try {
      const result = await callClaude(systemPrompt, userMessage, maxTokens)
      setLoading(false)
      return result
    } catch (err) {
      setLoading(false)
      setError(err)
      throw err
    }
  }

  return {
    generate,
    loading,
    error,
  }
}
