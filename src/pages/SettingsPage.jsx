import { useState } from 'react'
import { storage } from '../lib/storage'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function SettingsPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(storage.getProfile())
  const [preferences, setPreferences] = useState(storage.getPreferences())
  const [showApiKeyUpdate, setShowApiKeyUpdate] = useState(false)
  const [newApiKey, setNewApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState('')
  const [apiKeySuccess, setApiKeySuccess] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingPreferences, setEditingPreferences] = useState(false)
  const [editingExpectations, setEditingExpectations] = useState(false)
  const [customIndustry, setCustomIndustry] = useState('')

  const industryOptions = [
    'SaaS',
    'Fintech',
    'E-commerce',
    'Healthcare',
    'EdTech',
    'AI/ML',
    'Enterprise Software',
    'Consumer Apps',
    'Developer Tools',
    'Infrastructure',
  ]

  const toggleIndustry = (industry) => {
    const newInterests = profile.industryInterests?.includes(industry)
      ? profile.industryInterests.filter(i => i !== industry)
      : [...(profile.industryInterests || []), industry]
    setProfile({ ...profile, industryInterests: newInterests })
  }

  const addCustomIndustry = () => {
    if (customIndustry.trim() && !profile.industryInterests?.includes(customIndustry.trim())) {
      setProfile({
        ...profile,
        industryInterests: [...(profile.industryInterests || []), customIndustry.trim()],
      })
      setCustomIndustry('')
    }
  }

  const handleSaveProfile = () => {
    storage.setProfile(profile)
    setEditingProfile(false)
  }

  const handleSavePreferences = () => {
    storage.setPreferences(preferences)
    setEditingPreferences(false)
  }

  const handleSaveExpectations = () => {
    storage.setProfile(profile)
    setEditingExpectations(false)
  }

  const handleClearData = () => {
    if (confirm('This will clear all your data. Are you sure?')) {
      storage.clearAll()
      window.location.reload()
    }
  }

  const handleExport = () => {
    const data = storage.exportAll()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rocky-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUpdateApiKey = () => {
    setApiKeyError('')
    setApiKeySuccess(false)

    if (!newApiKey.trim()) {
      setApiKeyError('API key is required')
      return
    }

    if (!newApiKey.startsWith('sk-ant-')) {
      setApiKeyError('Invalid API key format. Must start with sk-ant-')
      return
    }

    storage.setApiKey(newApiKey)
    setApiKeySuccess(true)
    setNewApiKey('')

    // Hide form after 2 seconds
    setTimeout(() => {
      setShowApiKeyUpdate(false)
      setApiKeySuccess(false)
    }, 2000)
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '2rem', fontWeight: 700, margin: 0 }}>
            Settings
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Profile Section */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Profile
              </h3>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid #d8cdb8',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#1a1714',
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            {!editingProfile ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#9a9082' }}>Name:</span>
                <span>{profile.name}</span>
                <span style={{ color: '#9a9082' }}>Role:</span>
                <span>{profile.role}</span>
                <span style={{ color: '#9a9082' }}>Experience:</span>
                <span>{profile.yearsExp} years</span>
                <span style={{ color: '#9a9082' }}>Location:</span>
                <span>{profile.location}</span>
                <span style={{ color: '#9a9082' }}>Field:</span>
                <span>{profile.field}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                    Role
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                      Years of experience
                    </label>
                    <input
                      type="number"
                      value={profile.yearsExp}
                      onChange={(e) => setProfile({ ...profile, yearsExp: parseInt(e.target.value) || 0 })}
                      className="input"
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                    Field
                  </label>
                  <select
                    value={profile.field}
                    onChange={(e) => setProfile({ ...profile, field: e.target.value })}
                    className="input"
                  >
                    <option value="Product Management">Product Management</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      padding: '10px 16px',
                      background: '#1a1714',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#f1eadc',
                      fontWeight: 500,
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setProfile(storage.getProfile())
                      setEditingProfile(false)
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      border: '1px solid #d8cdb8',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#6a6258',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preferences Section */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Preferences
              </h3>
              {!editingPreferences && (
                <button
                  onClick={() => setEditingPreferences(true)}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid #d8cdb8',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#1a1714',
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            {!editingPreferences ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#9a9082' }}>Work hours:</span>
                <span>{preferences.workHours === 'standard' ? 'Standard (9-6, max 40-45 hrs/week)' : preferences.workHours === 'flexible' ? 'Flexible (long hours OK)' : 'Strict 40 hours'}</span>
                <span style={{ color: '#9a9082' }}>Company type:</span>
                <span>{preferences.companyType === 'any' ? 'Open to all types' : preferences.companyType === 'mnc' ? 'Prefer MNCs / Large companies' : preferences.companyType === 'startup' ? 'Prefer startups' : 'Avoid early-stage startups'}</span>
                <span style={{ color: '#9a9082' }}>Timezone:</span>
                <span>{preferences.timezone === 'india-only' ? 'India hours only (9am-6pm IST)' : preferences.timezone === 'flexible-overlap' ? 'Some overlap with US/EU is OK' : 'Fully flexible timezone'}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                    Work hours preference
                  </label>
                  <select
                    value={preferences.workHours}
                    onChange={(e) => setPreferences({ ...preferences, workHours: e.target.value })}
                    className="input"
                  >
                    <option value="standard">Standard (9-6, max 40-45 hrs/week)</option>
                    <option value="flexible">Flexible (I don't mind long hours occasionally)</option>
                    <option value="strict">Strict 40 hours (No overtime)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                    Company type preference
                  </label>
                  <select
                    value={preferences.companyType}
                    onChange={(e) => setPreferences({ ...preferences, companyType: e.target.value })}
                    className="input"
                  >
                    <option value="any">Open to all types</option>
                    <option value="mnc">Prefer MNCs / Large companies</option>
                    <option value="startup">Prefer startups</option>
                    <option value="avoid-startup">Avoid early-stage startups</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                    Timezone / Work hours location
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    className="input"
                  >
                    <option value="india-only">India hours only (9am-6pm IST)</option>
                    <option value="flexible-overlap">Some overlap with US/EU is OK</option>
                    <option value="fully-remote">Fully flexible timezone</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleSavePreferences}
                    style={{
                      padding: '10px 16px',
                      background: '#1a1714',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#f1eadc',
                      fontWeight: 500,
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setPreferences(storage.getPreferences())
                      setEditingPreferences(false)
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      border: '1px solid #d8cdb8',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#6a6258',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Expectations Section */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Expectations
              </h3>
              {!editingExpectations && (
                <button
                  onClick={() => setEditingExpectations(true)}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid #d8cdb8',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#1a1714',
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            {!editingExpectations ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: '#9a9082', display: 'block', marginBottom: '0.25rem' }}>Expected salary range (LPA):</span>
                  <span>
                    {profile.expectedSalaryMin && profile.expectedSalaryMax
                      ? `₹${profile.expectedSalaryMin}L - ₹${profile.expectedSalaryMax}L`
                      : profile.expectedSalaryMin
                      ? `₹${profile.expectedSalaryMin}L+`
                      : 'Not set'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#9a9082', display: 'block', marginBottom: '0.25rem' }}>Industry interests:</span>
                  <span>
                    {profile.industryInterests && profile.industryInterests.length > 0
                      ? profile.industryInterests.join(', ')
                      : 'Not set'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#9a9082', display: 'block', marginBottom: '0.25rem' }}>Product/market spaces:</span>
                  <span style={{ whiteSpace: 'pre-wrap' }}>
                    {profile.spacePreferences || 'Not set'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                    Expected salary range (LPA)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                      type="text"
                      value={profile.expectedSalaryMin || ''}
                      onChange={(e) => setProfile({ ...profile, expectedSalaryMin: e.target.value })}
                      placeholder="Min (e.g., 25)"
                      className="input"
                    />
                    <input
                      type="text"
                      value={profile.expectedSalaryMax || ''}
                      onChange={(e) => setProfile({ ...profile, expectedSalaryMax: e.target.value })}
                      placeholder="Max (e.g., 35)"
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                    Industry interests
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {industryOptions.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => toggleIndustry(industry)}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.75rem',
                          borderRadius: '9999px',
                          border: '1px solid',
                          borderColor: profile.industryInterests?.includes(industry) ? '#1a1714' : '#d8cdb8',
                          background: profile.industryInterests?.includes(industry) ? '#1a1714' : 'transparent',
                          color: profile.industryInterests?.includes(industry) ? '#f1eadc' : '#3a342d',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomIndustry())}
                      placeholder="Add custom industry..."
                      className="input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={addCustomIndustry}
                      disabled={!customIndustry.trim()}
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        borderRadius: '8px',
                        border: '1px solid #d8cdb8',
                        background: 'transparent',
                        cursor: customIndustry.trim() ? 'pointer' : 'not-allowed',
                        opacity: customIndustry.trim() ? 1 : 0.5,
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#9a9082', marginBottom: '0.5rem' }}>
                    Product/market spaces you're excited about
                  </label>
                  <textarea
                    value={profile.spacePreferences || ''}
                    onChange={(e) => setProfile({ ...profile, spacePreferences: e.target.value })}
                    placeholder="e.g., Developer tools that improve productivity, fintech products democratizing investing..."
                    className="input"
                    rows={4}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleSaveExpectations}
                    style={{
                      padding: '10px 16px',
                      background: '#1a1714',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#f1eadc',
                      fontWeight: 500,
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setProfile(storage.getProfile())
                      setEditingExpectations(false)
                      setCustomIndustry('')
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      border: '1px solid #d8cdb8',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#6a6258',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* API Key Section */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#1a1714' }}>
              Anthropic API Key
            </h3>

            {!showApiKeyUpdate ? (
              <div>
                <p style={{ fontSize: '13px', color: '#6a6258', marginBottom: '16px', fontFamily: 'var(--font-family-body)', lineHeight: 1.6 }}>
                  Your API key is stored locally in your browser. All AI features use your personal Anthropic API key.
                </p>
                <button
                  onClick={() => setShowApiKeyUpdate(true)}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: '1px solid #d8cdb8',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: '#1a1714',
                    fontWeight: 500,
                  }}
                >
                  Update API key
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="password"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="input"
                  style={{ marginBottom: '12px', fontFamily: 'var(--font-family-mono)', fontSize: '13px' }}
                />

                {apiKeyError && (
                  <p style={{ fontSize: '12px', color: '#c4534a', marginBottom: '12px' }}>
                    {apiKeyError}
                  </p>
                )}

                {apiKeySuccess && (
                  <p style={{ fontSize: '12px', color: '#4a7c59', marginBottom: '12px' }}>
                    ✓ API key updated successfully
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleUpdateApiKey}
                    disabled={!newApiKey.trim()}
                    style={{
                      padding: '10px 16px',
                      background: '#1a1714',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: newApiKey.trim() ? 'pointer' : 'not-allowed',
                      color: '#f1eadc',
                      fontWeight: 500,
                      opacity: newApiKey.trim() ? 1 : 0.5,
                    }}
                  >
                    Save new key
                  </button>
                  <button
                    onClick={() => {
                      setShowApiKeyUpdate(false)
                      setNewApiKey('')
                      setApiKeyError('')
                      setApiKeySuccess(false)
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'transparent',
                      border: '1px solid #d8cdb8',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#6a6258',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Browser Sync Info */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#1a1714' }}>
              Cross-Device Sync
            </h3>
            <p style={{ fontSize: '13px', color: '#3a342d', lineHeight: 1.6, marginBottom: '12px', fontFamily: 'var(--font-family-body)' }}>
              Your data automatically syncs across devices when you're signed into your browser:
            </p>
            <div style={{ fontSize: '13px', color: '#6a6258', lineHeight: 1.7, fontFamily: 'var(--font-family-body)' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#1a1714' }}>Chrome:</strong> Enable sync in Settings → Sync and Google services
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#1a1714' }}>Firefox:</strong> Sign in to Firefox Account (sync enabled by default)
              </div>
              <div>
                <strong style={{ color: '#1a1714' }}>Safari:</strong> iCloud automatically syncs across Apple devices
              </div>
            </div>
            <p style={{ fontSize: '11px', color: '#9a9082', marginTop: '14px', fontStyle: 'italic' }}>
              All your pipeline, tasks, and preferences sync automatically — no backend needed.
            </p>
          </div>

          {/* Data Section */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Data Management
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleExport}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: '1px solid #d8cdb8',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Export my data (JSON)
              </button>
              <button
                onClick={handleClearData}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: '1px solid #c4534a',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#c4534a',
                }}
              >
                Clear all data (destructive)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
