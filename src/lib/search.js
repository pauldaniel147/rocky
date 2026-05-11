// Web search for company intelligence using Serper API (Google Search)
import { storage } from './storage'

const SERPER_API = 'https://google.serper.dev/search'

export async function searchCompanyInfo(companyName) {
  const apiKey = storage.getSearchApiKey()

  // If no API key, return null (search is optional)
  if (!apiKey) {
    return null
  }

  try {
    const query = `${companyName} news funding layoffs culture reviews 2025 2026`
    const response = await fetch(SERPER_API, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 5,
      }),
    })

    if (!response.ok) {
      console.error('Serper API error:', response.status)
      return null
    }

    const data = await response.json()

    // Extract relevant info from search results
    if (!data.organic || data.organic.length === 0) {
      return null
    }

    const results = data.organic.slice(0, 5).map(result => ({
      title: result.title,
      description: result.snippet,
      url: result.link,
      date: result.date, // Publication date if available
    }))

    // Format for Claude
    const summary = results.map((r, i) =>
      `${i + 1}. ${r.title}\n   ${r.description}\n   Source: ${r.url}${r.date ? ` (${r.date})` : ''}`
    ).join('\n\n')

    return {
      query,
      results,
      summary,
      searchedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Company search failed:', error)
    return null
  }
}
