import { NavLink, Link } from 'react-router-dom'
import { storage } from '../../lib/storage'
import { Settings } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'today', label: 'Today', num: 'I', path: '/' },
  { id: 'prescreen', label: 'Pre-Screen', num: 'II', path: '/prescreen' },
  { id: 'pipeline', label: 'Pipeline', num: 'III', path: '/pipeline' },
  { id: 'coach', label: 'Talk to Rocky', num: 'IV', path: '/coach' },
  { id: 'dashboard', label: 'Dashboard', num: 'V', path: '/dashboard' },
]

export function Sidebar() {
  const profile = storage.getProfile()
  const dayNumber = storage.getDayNumber()
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'

  return (
    <aside style={{
      width: '240px',
      borderRight: '1px solid var(--color-border)',
      padding: '28px 22px 24px',
      display: 'flex',
      flexDirection: 'column',
      background: '#ebe2d0',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.92\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix values=\'0 0 0 0 0.10  0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0.06 0\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
      backgroundSize: '240px 240px',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Wordmark */}
      <div style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: '32px',
        letterSpacing: '-0.02em',
        color: 'var(--color-text-primary)',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'baseline',
        gap: '6px',
      }}>
        Rocky
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: 'var(--color-accent-warm)',
          display: 'inline-block',
          transform: 'translateY(-3px)',
        }}></span>
      </div>

      <div style={{
        marginTop: '10px',
        fontSize: '11px',
        color: '#6a6258',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>
        Help Grace find job
      </div>

      {/* Navigation */}
      <nav style={{
        marginTop: '38px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '9px 10px',
              borderRadius: '8px',
              fontSize: '13.5px',
              color: isActive ? '#f1eadc' : '#6a6258',
              cursor: 'pointer',
              letterSpacing: '-0.005em',
              fontWeight: 450,
              textDecoration: 'none',
              background: isActive ? '#1a1714' : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  fontFamily: 'var(--font-family-display)',
                  fontStyle: 'italic',
                  fontSize: '13px',
                  color: isActive ? '#f1eadc' : '#9a9082',
                  width: '14px',
                  textAlign: 'right',
                  opacity: isActive ? 0.7 : 1,
                }}>
                  {item.num}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Day counter card */}
      <div style={{
        marginTop: '32px',
        padding: '14px 12px',
        borderRadius: '10px',
        background: 'rgba(177,90,58,0.08)',
        border: '1px solid rgba(177,90,58,0.18)',
      }}>
        <div style={{
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#8d4226',
          fontWeight: 500,
          marginBottom: '6px',
        }}>
          Day {dayNumber} · Search
        </div>
        <div style={{
          fontFamily: 'var(--font-family-display)',
          fontStyle: 'italic',
          fontSize: '16px',
          lineHeight: 1.25,
          color: '#3a342d',
        }}>
          You're closer than the silence makes it feel.
        </div>
      </div>

      {/* Profile (at bottom) */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '16px',
        borderTop: '1px solid #d8cdb8',
      }}>
        <Link
          to="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12.5px',
            textDecoration: 'none',
            color: 'inherit',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#1a1714',
            color: '#f1eadc',
            fontFamily: 'var(--font-family-display)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}>
            {initials}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1.2,
            flex: 1,
          }}>
            <span style={{ color: '#1a1714', fontWeight: 500 }}>{profile.name}</span>
            <span style={{ color: '#9a9082', fontSize: '11px' }}>{profile.role}</span>
          </div>
          <Settings style={{ width: '14px', height: '14px', color: '#9a9082' }} />
        </Link>
      </div>
    </aside>
  )
}
