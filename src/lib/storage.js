// Storage utility for Rocky
// All data persisted to localStorage with namespaced keys

const KEYS = {
  API_KEY: 'rocky:api_key',
  BRAVE_SEARCH_KEY: 'rocky:brave_search_key',
  PIPELINE: 'rocky:pipeline',
  PREFERENCES: 'rocky:preferences',
  CAREER_STORY: 'rocky:career_story',
  CHECKINS: 'rocky:checkins',
  SEARCH_START: 'rocky:search_start',
  PROFILE: 'rocky:profile',
  DIGEST_CACHE: 'rocky:digest_cache',
  CHAT_HISTORY: 'rocky:chat_history',
}

export const storage = {
  // API Key
  getApiKey: () => localStorage.getItem(KEYS.API_KEY),
  setApiKey: (key) => localStorage.setItem(KEYS.API_KEY, key),
  clearApiKey: () => localStorage.removeItem(KEYS.API_KEY),

  // Brave Search API Key (optional)
  getBraveSearchKey: () => localStorage.getItem(KEYS.BRAVE_SEARCH_KEY),
  setBraveSearchKey: (key) => localStorage.setItem(KEYS.BRAVE_SEARCH_KEY, key),
  clearBraveSearchKey: () => localStorage.removeItem(KEYS.BRAVE_SEARCH_KEY),

  // Pipeline
  getPipeline: () => {
    const data = localStorage.getItem(KEYS.PIPELINE)
    return data ? JSON.parse(data) : []
  },
  setPipeline: (pipeline) => {
    localStorage.setItem(KEYS.PIPELINE, JSON.stringify(pipeline))
  },
  addJob: (job) => {
    const pipeline = storage.getPipeline()
    const newJob = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      stage: 'saved',
      ...job,
    }
    pipeline.push(newJob)
    storage.setPipeline(pipeline)
    return newJob
  },
  updateJob: (id, updates) => {
    const pipeline = storage.getPipeline()
    const index = pipeline.findIndex(j => j.id === id)
    if (index !== -1) {
      pipeline[index] = { ...pipeline[index], ...updates, updatedAt: new Date().toISOString() }
      storage.setPipeline(pipeline)
      return pipeline[index]
    }
    return null
  },
  deleteJob: (id) => {
    const pipeline = storage.getPipeline().filter(j => j.id !== id)
    storage.setPipeline(pipeline)
  },

  // Preferences
  getPreferences: () => {
    const data = localStorage.getItem(KEYS.PREFERENCES)
    return data ? JSON.parse(data) : {
      workHours: 'standard',
      companyType: 'mnc',
      timezone: 'india-only',
    }
  },
  setPreferences: (prefs) => {
    localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs))
  },

  // Career Story
  getCareerStory: () => localStorage.getItem(KEYS.CAREER_STORY) || '',
  setCareerStory: (story) => localStorage.setItem(KEYS.CAREER_STORY, story),

  // Check-ins
  getCheckins: () => {
    const data = localStorage.getItem(KEYS.CHECKINS)
    return data ? JSON.parse(data) : []
  },
  addCheckin: (checkin) => {
    const checkins = storage.getCheckins()
    checkins.push({
      date: new Date().toISOString(),
      ...checkin,
    })
    localStorage.setItem(KEYS.CHECKINS, JSON.stringify(checkins))
  },

  // Search Start Date
  getSearchStart: () => {
    const date = localStorage.getItem(KEYS.SEARCH_START)
    return date || new Date().toISOString()
  },
  setSearchStart: (date) => {
    localStorage.setItem(KEYS.SEARCH_START, date)
  },
  getDayNumber: () => {
    const start = new Date(storage.getSearchStart())
    const now = new Date()
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24))
    return Math.max(1, diff + 1)
  },

  // Profile
  getProfile: () => {
    const data = localStorage.getItem(KEYS.PROFILE)
    return data ? JSON.parse(data) : {
      yearsExp: 10,
      location: 'India',
      field: 'Product Management',
      expectedSalaryMin: '',
      expectedSalaryMax: '',
      industryInterests: [],
      spacePreferences: '',
    }
  },
  setProfile: (profile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
  },

  // Digest Cache (cached per day, resets at 6:00 AM)
  getDigestCache: () => {
    const data = localStorage.getItem(KEYS.DIGEST_CACHE)
    if (!data) return null

    const cache = JSON.parse(data)
    const cacheTime = new Date(cache.generatedAt)
    const now = new Date()

    // Get today's 6 AM
    const today6AM = new Date()
    today6AM.setHours(6, 0, 0, 0)

    // If current time is before 6 AM, check against yesterday's 6 AM
    const cutoffTime = now < today6AM
      ? new Date(today6AM.getTime() - 24 * 60 * 60 * 1000)
      : today6AM

    // Return cached digest only if it was generated after the last 6 AM cutoff
    if (cacheTime >= cutoffTime) {
      return cache.digest
    }
    return null
  },
  setDigestCache: (digest) => {
    const cache = {
      date: new Date().toDateString(),
      digest: digest,
      generatedAt: new Date().toISOString(),
    }
    localStorage.setItem(KEYS.DIGEST_CACHE, JSON.stringify(cache))
  },
  clearDigestCache: () => {
    localStorage.removeItem(KEYS.DIGEST_CACHE)
  },

  // Chat history (per job)
  getChatHistory: (jobId) => {
    const data = localStorage.getItem(KEYS.CHAT_HISTORY)
    const allHistory = data ? JSON.parse(data) : {}
    return allHistory[jobId] || []
  },
  saveChatHistory: (jobId, messages) => {
    const data = localStorage.getItem(KEYS.CHAT_HISTORY)
    const allHistory = data ? JSON.parse(data) : {}
    allHistory[jobId] = messages
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(allHistory))
  },
  clearChatHistory: (jobId) => {
    const data = localStorage.getItem(KEYS.CHAT_HISTORY)
    const allHistory = data ? JSON.parse(data) : {}
    delete allHistory[jobId]
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(allHistory))
  },

  // Data export/import
  exportAll: () => {
    const data = {}
    Object.values(KEYS).forEach(key => {
      const value = localStorage.getItem(key)
      if (value) data[key] = value
    })
    return JSON.stringify(data, null, 2)
  },
  clearAll: () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key))
  },
}
