import { NavLink } from 'react-router-dom'
import { Sun, Columns, Pen, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const tabs = [
  { path: '/', icon: Sun, label: 'Digest' },
  { path: '/pipeline', icon: Columns, label: 'Pipeline' },
  { path: '/studio', icon: Pen, label: 'Studio' },
  { path: '/coach', icon: Sparkles, label: 'Coach' },
]

export function BottomNav() {
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ maxWidth: 'var(--width-app)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '5rem' }}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              isActive ? 'active-tab' : 'inactive-tab'
            }
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.5rem 1.5rem', position: 'relative', textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <>
                <tab.icon style={{ width: '1.5rem', height: '1.5rem', color: isActive ? 'var(--color-accent-black)' : 'var(--color-text-muted)', strokeWidth: isActive ? 2.5 : 2 }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: isActive ? 'var(--color-accent-black)' : 'var(--color-text-muted)' }}>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    style={{ position: 'absolute', top: '-0.125rem', left: '50%', transform: 'translateX(-50%)', width: '3rem', height: '0.25rem', background: 'var(--color-accent-warm)', borderRadius: '9999px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
