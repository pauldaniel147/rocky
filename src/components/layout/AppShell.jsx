import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      height: '100vh',
      fontFamily: 'var(--font-family-sans)',
      color: 'var(--color-text-primary)',
    }}>
      <Sidebar />

      <main style={{
        position: 'relative',
        overflow: 'auto',
        background: '#f1eadc',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.92\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix values=\'0 0 0 0 0.10  0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0.045 0\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '240px 240px',
      }}>
        <div style={{ scrollbarWidth: 'none' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
