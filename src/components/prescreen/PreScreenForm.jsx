import { motion } from 'framer-motion'

export function PreScreenForm({
  jobUrl,
  setJobUrl,
  company,
  setCompany,
  title,
  setTitle,
  salaryMin,
  setSalaryMin,
  salaryMax,
  setSalaryMax,
  jd,
  setJd,
  onAnalyze,
  onClear,
  loading,
  error,
  fetching,
  fetchError,
}) {
  return (
    <motion.div
      key="input"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
    >
      {/* Left column - URL and basic details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* URL field */}
        <div style={{
          background: '#fbf6ea',
          borderRadius: '12px',
          border: '1px solid #e6dcc8',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 18px',
            borderBottom: '1px solid #d8cdb8',
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#1a1714',
              fontWeight: 600,
            }}>
              Job URL {fetching && <span style={{ color: '#c4944a' }}>(Fetching...)</span>}
              {fetchError && <span style={{ color: '#c4534a', fontWeight: 400, textTransform: 'none', letterSpacing: '0.05em' }}> · Auto-fetch failed, paste JD manually</span>}
            </div>
          </div>
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://careers.example.com/job/123"
            style={{
              padding: '14px 18px',
              width: '100%',
              fontFamily: 'var(--font-family-mono)',
              fontSize: '13px',
              color: '#3a342d',
              border: 'none',
              background: 'transparent',
              outline: 'none',
            }}
          />
        </div>

        {/* Company field */}
        <div style={{
          background: '#fbf6ea',
          borderRadius: '12px',
          border: '1px solid #e6dcc8',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 18px',
            borderBottom: '1px solid #d8cdb8',
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#1a1714',
              fontWeight: 600,
            }}>
              Company Name
            </div>
          </div>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g., Stripe, Google, Airbnb"
            style={{
              padding: '14px 18px',
              width: '100%',
              fontSize: '14px',
              color: '#3a342d',
              border: 'none',
              background: 'transparent',
              outline: 'none',
            }}
          />
        </div>

        {/* Job Title field */}
        <div style={{
          background: '#fbf6ea',
          borderRadius: '12px',
          border: '1px solid #e6dcc8',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 18px',
            borderBottom: '1px solid #d8cdb8',
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#1a1714',
              fontWeight: 600,
            }}>
              Job Title
            </div>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Senior Product Manager"
            style={{
              padding: '14px 18px',
              width: '100%',
              fontSize: '14px',
              color: '#3a342d',
              border: 'none',
              background: 'transparent',
              outline: 'none',
            }}
          />
        </div>

        {/* Salary fields */}
        <div style={{
          background: '#fbf6ea',
          borderRadius: '12px',
          border: '1px solid #e6dcc8',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 18px',
            borderBottom: '1px solid #d8cdb8',
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#1a1714',
              fontWeight: 600,
            }}>
              Salary Range (LPA) <span style={{ color: '#9a9082', fontWeight: 400 }}>Optional</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderTop: '1px solid #d8cdb8' }}>
            <input
              type="text"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              placeholder="Min (e.g., 25)"
              style={{
                padding: '14px 18px',
                fontSize: '14px',
                color: '#3a342d',
                border: 'none',
                borderRight: '1px solid #d8cdb8',
                background: 'transparent',
                outline: 'none',
              }}
            />
            <input
              type="text"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="Max (e.g., 35)"
              style={{
                padding: '14px 18px',
                fontSize: '14px',
                color: '#3a342d',
                border: 'none',
                background: 'transparent',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Right column - JD */}
      <div style={{
        background: '#fbf6ea',
        borderRadius: '12px',
        border: '1px solid #e6dcc8',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid #d8cdb8',
        }}>
          <div style={{
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#1a1714',
            fontWeight: 600,
          }}>
            Job Description
          </div>
        </div>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here..."
          style={{
            padding: '18px',
            flex: 1,
            fontFamily: 'var(--font-family-display)',
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#3a342d',
            border: 'none',
            background: 'transparent',
            resize: 'none',
            outline: 'none',
          }}
        />
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid #d8cdb8',
          fontSize: '11px',
          color: '#9a9082',
        }}>
          {jd.length} characters
        </div>
      </div>

      {/* Analyze button - spans full width */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={onAnalyze}
          disabled={!jobUrl.trim() || !company.trim() || !title.trim() || !jd.trim() || loading}
          className="btn-primary"
          style={{ maxWidth: '320px' }}
        >
          {loading ? 'Analyzing...' : 'Analyze with Rocky →'}
        </button>
        {(jobUrl || company || title || jd) && (
          <button
            onClick={onClear}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              background: 'transparent',
              color: '#6a6258',
              border: '1px solid #d8cdb8',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Clear
          </button>
        )}
        {error && (
          <p style={{ color: '#c4534a', marginTop: '12px', fontSize: '13px' }}>
            {error}
          </p>
        )}
      </div>
    </motion.div>
  )
}
