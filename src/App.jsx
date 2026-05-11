import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WelcomeGate } from './components/settings/WelcomeGate'
import { ResumeSetup } from './components/settings/ResumeSetup'
import { ProfileSetup } from './components/settings/ProfileSetup'
import { AppShell } from './components/layout/AppShell'
import { DigestPage } from './pages/DigestPage'
import { PipelinePage } from './pages/PipelinePage'
import { CoachPage } from './pages/CoachPage'
import { DashboardPage } from './pages/DashboardPage'
import { SettingsPage } from './pages/SettingsPage'
import { PreScreen } from './components/prescreen/PreScreen'
import { storage } from './lib/storage'

function App() {
  const [apiKey, setApiKey] = useState(null)
  const [profile, setProfile] = useState(null)
  const [resumeData, setResumeData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const key = storage.getApiKey()
    const prof = storage.getProfile()
    setApiKey(key)
    setProfile(prof.name ? prof : null)
    setLoading(false)

    if (!localStorage.getItem('rocky:search_start')) {
      storage.setSearchStart(new Date().toISOString())
    }
  }, [])

  const handleApiKeySubmit = (key) => {
    storage.setApiKey(key)
    setApiKey(key)
  }

  const handleResumeAnalysis = (data) => {
    setResumeData(data)
  }

  const handleSkipResume = () => {
    setResumeData({}) // Empty object to skip
  }

  const handleProfileSetup = (data) => {
    storage.setProfile(data.profile)
    storage.setPreferences(data.preferences)
    if (data.strengths && data.strengths.length > 0) {
      storage.setCareerStory(data.careerStory || '')
      // Store strengths as part of profile
      storage.setProfile({ ...data.profile, strengths: data.strengths })
    }
    setProfile(data.profile)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-pulse">
          <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-accent-black)' }}>Rocky</h1>
        </div>
      </div>
    )
  }

  // Step 1: API key gate
  if (!apiKey) {
    return <WelcomeGate onSubmit={handleApiKeySubmit} />
  }

  // Step 2: Resume upload & analysis
  if (!resumeData && !profile) {
    return <ResumeSetup onComplete={handleResumeAnalysis} onSkip={handleSkipResume} />
  }

  // Step 3: Profile setup (pre-filled if resume was analyzed)
  if (!profile) {
    return <ProfileSetup onComplete={handleProfileSetup} initialData={resumeData} />
  }

  // Step 3: Main app
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<DigestPage />} />
          <Route path="prescreen" element={<PreScreen />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="coach" element={<CoachPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
