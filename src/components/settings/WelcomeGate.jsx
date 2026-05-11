import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function WelcomeGate({ onSubmit }) {
  const [apiKey, setApiKey] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const isValid = apiKey.trim().startsWith('sk-ant-')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValid) {
      onSubmit(apiKey.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full" style={{ maxWidth: '28rem' }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '3.75rem', fontWeight: 700, color: 'var(--color-accent-black)', marginBottom: '0.75rem' }}>
            Rocky
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>
            Your AI-powered job search coach
          </p>
        </motion.div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div>
            <label htmlFor="apiKey" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Enter your Anthropic API key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="input"
              style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.875rem' }}
              autoFocus
            />
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span>How to get your API key</span>
              {showInstructions ? (
                <ChevronUp style={{ width: '1rem', height: '1rem', color: 'var(--color-text-muted)' }} />
              ) : (
                <ChevronDown style={{ width: '1rem', height: '1rem', color: 'var(--color-text-muted)' }} />
              )}
            </button>

            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', overflow: 'hidden' }}
                >
                  <ol style={{ listStyle: 'decimal', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Go to <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.75rem', background: 'var(--color-bg-base)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>console.anthropic.com</span></li>
                    <li>Sign in or create a free account</li>
                    <li>Click "API Keys" in the left sidebar</li>
                    <li>Click "Create Key", give it a name like "Rocky"</li>
                    <li>Copy the key — it starts with <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.75rem' }}>sk-ant-</span></li>
                    <li>Paste it here</li>
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Your key is stored only on this device. Rocky never sends it anywhere except directly to Anthropic.
          </p>

          <button
            type="submit"
            disabled={!isValid}
            className="btn-primary"
          >
            Let's go →
          </button>
        </motion.form>
      </div>
    </motion.div>
  )
}
