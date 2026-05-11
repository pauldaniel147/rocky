import { motion } from 'framer-motion'
import { X, Loader } from 'lucide-react'

export function ResumeTailoringModal({ job, onClose, loading, tailoringData }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(26, 23, 20, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#f9f6f0',
          borderRadius: '16px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e6dcc8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '24px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '4px',
            }}>
              Resume Tailoring
            </h2>
            <p style={{ fontSize: '13px', color: '#6a6258', margin: 0 }}>
              {job.company} - {job.role}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#6a6258',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px 28px',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader style={{ width: '2rem', height: '2rem', color: '#c4944a', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '1rem', color: '#6a6258' }}>Analyzing job description...</p>
            </div>
          ) : tailoringData?.error ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#c4534a', marginBottom: '0.5rem' }}>
                {tailoringData.error}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9a9082' }}>
                Please check your API key in settings or try again.
              </p>
            </div>
          ) : tailoringData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Keywords */}
              <div>
                <h3 style={{
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#1a1714',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}>
                  Keywords to Include
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tailoringData.keywords?.map((keyword, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '6px 12px',
                        background: '#fbf6ea',
                        border: '1px solid #e6dcc8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'var(--font-family-mono)',
                        color: '#3a342d',
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience to Emphasize */}
              <div>
                <h3 style={{
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#1a1714',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}>
                  Experience to Emphasize
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tailoringData.emphasize?.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '16px',
                        background: 'white',
                        border: '1px solid #e6dcc8',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1a1714',
                        marginBottom: '6px',
                      }}>
                        {item.what}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#6a6258',
                        marginBottom: '8px',
                        fontStyle: 'italic',
                      }}>
                        Why: {item.why}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#3a342d',
                        fontFamily: 'var(--font-family-display)',
                      }}>
                        How to frame: {item.howToFrame}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 style={{
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#1a1714',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}>
                  Skills to Highlight
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tailoringData.skills?.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '6px 12px',
                        background: '#fffaf0',
                        border: '1px solid #e6dcc8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#3a342d',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accomplishments */}
              <div>
                <h3 style={{
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#1a1714',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}>
                  Accomplishments to Feature
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tailoringData.accomplishments?.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 14px',
                        background: 'white',
                        border: '1px solid #e6dcc8',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#9a9082',
                        marginBottom: '4px',
                      }}>
                        {item.area}
                      </div>
                      <div style={{ fontSize: '13px', color: '#3a342d' }}>
                        {item.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* De-emphasize */}
              {tailoringData.deEmphasize && tailoringData.deEmphasize.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#c4534a',
                    fontWeight: 600,
                    marginBottom: '12px',
                  }}>
                    What to De-emphasize or Remove
                  </h3>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: '#6a6258',
                    lineHeight: 1.6,
                  }}>
                    {tailoringData.deEmphasize.map((item, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#9a9082' }}>
              Failed to generate tailoring advice. Please try again.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
