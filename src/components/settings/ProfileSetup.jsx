import { useState } from 'react'
import { motion } from 'framer-motion'

export function ProfileSetup({ onComplete, initialData = null }) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState(initialData?.profile || {
    name: '',
    role: '',
    yearsExp: 5,
    location: 'India',
    field: 'Product Management',
    expectedSalaryMin: '',
    expectedSalaryMax: '',
    industryInterests: [],
    spacePreferences: '',
  })
  const [preferences, setPreferences] = useState(initialData?.preferences || {
    workHours: 'standard',
    companyType: 'any',
    timezone: 'india-only',
  })
  const [strengths, setStrengths] = useState(initialData?.strengths || [])
  const [careerStory, setCareerStory] = useState(initialData?.careerStory || '')
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
    if (profile.industryInterests.includes(industry)) {
      setProfile({
        ...profile,
        industryInterests: profile.industryInterests.filter(i => i !== industry),
      })
    } else {
      setProfile({
        ...profile,
        industryInterests: [...profile.industryInterests, industry],
      })
    }
  }

  const addCustomIndustry = () => {
    if (customIndustry.trim() && !profile.industryInterests.includes(customIndustry.trim())) {
      setProfile({
        ...profile,
        industryInterests: [...profile.industryInterests, customIndustry.trim()],
      })
      setCustomIndustry('')
    }
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    if (profile.name.trim() && profile.role.trim()) {
      setStep(2)
    }
  }

  const handlePreferencesSubmit = (e) => {
    e.preventDefault()
    setStep(3)
  }

  const handleExpectationsSubmit = (e) => {
    e.preventDefault()
    onComplete({ profile, preferences, strengths, careerStory })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
    >
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '3rem', fontWeight: 700, color: 'var(--color-accent-black)', marginBottom: '0.75rem' }}>
            {step === 1 ? "Let's get to know you" : step === 2 ? 'Your preferences' : 'Your expectations'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
            {step === 1 ? 'This helps Rocky personalize your experience' : step === 2 ? 'These guide how Rocky analyzes job fits' : 'Tell Rocky what you are looking for'}
          </p>
        </motion.div>

        {step === 1 ? (
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleProfileSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
          <div>
            <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Maya Iyer"
              className="input"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="role" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Current/previous role
            </label>
            <input
              id="role"
              type="text"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              placeholder="Senior PM"
              className="input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="yearsExp" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Years of experience
              </label>
              <input
                id="yearsExp"
                type="number"
                value={profile.yearsExp}
                onChange={(e) => setProfile({ ...profile, yearsExp: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
                max="50"
              />
            </div>

            <div>
              <label htmlFor="location" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Location
              </label>
              <input
                id="location"
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="India"
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="field" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Field
            </label>
            <select
              id="field"
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

          <button
            type="submit"
            className="btn-primary"
            disabled={!profile.name.trim() || !profile.role.trim()}
          >
            Continue →
          </button>
        </motion.form>
        ) : step === 2 ? (
          <motion.form
            key="step2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handlePreferencesSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div>
              <label htmlFor="workHours" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Work hours preference
              </label>
              <select
                id="workHours"
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
              <label htmlFor="companyType" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Company type preference
              </label>
              <select
                id="companyType"
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
              <label htmlFor="timezone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Timezone / Work hours location
              </label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                className="input"
              >
                <option value="india-only">India hours only (9am-6pm IST)</option>
                <option value="flexible-overlap">Some overlap with US/EU is OK</option>
                <option value="fully-remote">Fully flexible timezone</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">
              Continue →
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="step3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleExpectationsSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Expected salary range (LPA)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  value={profile.expectedSalaryMin}
                  onChange={(e) => setProfile({ ...profile, expectedSalaryMin: e.target.value })}
                  placeholder="Min (e.g., 25)"
                  className="input"
                />
                <input
                  type="text"
                  value={profile.expectedSalaryMax}
                  onChange={(e) => setProfile({ ...profile, expectedSalaryMax: e.target.value })}
                  placeholder="Max (e.g., 35)"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Industry interests <span style={{ fontSize: '0.75rem', color: '#9a9082' }}>(select all that apply)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {industryOptions.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => toggleIndustry(industry)}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      borderRadius: '9999px',
                      border: '1px solid',
                      borderColor: profile.industryInterests.includes(industry) ? '#1a1714' : '#d8cdb8',
                      background: profile.industryInterests.includes(industry) ? '#1a1714' : 'transparent',
                      color: profile.industryInterests.includes(industry) ? '#f1eadc' : '#3a342d',
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
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d8cdb8',
                    background: 'transparent',
                    cursor: customIndustry.trim() ? 'pointer' : 'not-allowed',
                    opacity: customIndustry.trim() ? 1 : 0.5,
                  }}
                >
                  Add
                </button>
              </div>
              {profile.industryInterests.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile.industryInterests.map((industry) => (
                    <span
                      key={industry}
                      style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '9999px',
                        background: '#fbf6ea',
                        color: '#3a342d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {industry}
                      <button
                        type="button"
                        onClick={() => toggleIndustry(industry)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '1rem',
                          lineHeight: 1,
                          color: '#9a9082',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="spacePreferences" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                Product/market spaces you're excited about <span style={{ fontSize: '0.75rem', color: '#9a9082' }}>(optional)</span>
              </label>
              <textarea
                id="spacePreferences"
                value={profile.spacePreferences}
                onChange={(e) => setProfile({ ...profile, spacePreferences: e.target.value })}
                placeholder="e.g., Developer tools that improve productivity, fintech products democratizing investing, consumer apps with strong network effects..."
                className="input"
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-primary">
              Start using Rocky →
            </button>
          </motion.form>
        )}
      </div>
    </motion.div>
  )
}
