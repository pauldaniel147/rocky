// Web search for company intelligence using Brave Search API
import { storage } from './storage'

const BRAVE_SEARCH_API = 'https://api.search.brave.com/res/v1/web/search'

export async function searchCompanyInfo(companyName) {
  const apiKey = storage.getBraveSearchKey()

  // If no API key, return null (search is optional)
  if (!apiKey) {
    return null
  }

  try {
    const query = `${companyName} news funding layoffs culture reviews 2025 2026`
    const response = await fetch(`${BRAVE_SEARCH_API}?q=${encodeURIComponent(query)}&count=5`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
    })

    if (!response.ok) {
      console.error('Brave Search API error:', response.status)
      return null
    }

    const data = await response.json()

    // Extract relevant info from search results
    if (!data.web?.results || data.web.results.length === 0) {
      return null
    }

    const results = data.web.results.slice(0, 5).map(result => ({
      title: result.title,
      description: result.description,
      url: result.url,
      age: result.age, // How recent the result is
    }))

    // Format for Claude
    const summary = results.map((r, i) =>
      `${i + 1}. ${r.title}\n   ${r.description}\n   Source: ${r.url}${r.age ? ` (${r.age})` : ''}`
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
