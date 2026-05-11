// Utility to parse JSON responses from AI that might be wrapped in markdown or text

export function parseAIResponse(response) {
  if (!response || typeof response !== 'string') {
    console.error('Invalid response type:', typeof response, response)
    throw new Error('Invalid response from AI')
  }

  let cleanResponse = response.trim()

  // Remove markdown code blocks
  if (cleanResponse.includes('```')) {
    cleanResponse = cleanResponse.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
  }

  // Extract JSON object from response (find first { to last })
  const firstBrace = cleanResponse.indexOf('{')
  const lastBrace = cleanResponse.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1)
  }

  try {
    return JSON.parse(cleanResponse)
  } catch (err) {
    console.error('JSON parse failed.')
    console.error('Full response:', response)
    console.error('Cleaned response:', cleanResponse)
    console.error('Parse error:', err.message)
    throw new Error(`Invalid JSON format from AI: ${err.message}`)
  }
}
