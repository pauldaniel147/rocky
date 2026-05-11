// shell.jsx — Rocky web app sidebar + shared chrome.
// Same layout used by every screen so the canvas reads as one product.

const NAV = [
  { id: 'today',     label: 'Today',         num: 'I' },
  { id: 'prescreen', label: 'Pre-Screen',    num: 'II' },
  { id: 'pipeline',  label: 'Pipeline',      num: 'III' },
  { id: 'coach',     label: 'Coach',         num: 'IV' },
  { id: 'dashboard', label: 'Dashboard',     num: 'V' },
];

function Sidebar({ active = 'today' }) {
  return (
    <aside className="sidebar">
      <div className="wordmark">
        Rocky<span className="dot" />
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        a quiet job&nbsp;tracker
      </div>

      <nav className="nav">
        {NAV.map(n => (
          <div key={n.id} className={`nav-item ${active === n.id ? 'active' : ''}`}>
            <span className="num">{n.num}</span>
            {n.label}
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 32, padding: '14px 12px', borderRadius: 10, background: 'rgba(177,90,58,0.08)', border: '1px solid rgba(177,90,58,0.18)' }}>
        <div className="eyebrow" style={{ color: 'var(--terra-deep)', marginBottom: 6 }}>Day 14 · Search</div>
        <div className="serif-it" style={{ fontSize: 16, lineHeight: 1.25, color: 'var(--ink-2)' }}>
          You're closer than the silence makes it feel.
        </div>
      </div>

      <div className="profile">
        <div className="avatar">M</div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>Maya Iyer</span>
          <span style={{ color: 'var(--ink-mute)', fontSize: 11 }}>Senior PM · ex-Meta</span>
        </div>
      </div>
    </aside>
  );
}

function TopUtility({ left = 'TUE · MAY 9 · DAY 14 OF SEARCH', right }) {
  return (
    <div className="top-utility">
      <div>{left}</div>
      <div className="right">
        {right}
      </div>
    </div>
  );
}

// Shared shell wrapper — sidebar + main; children fills .main
function AppShell({ active, top, children }) {
  return (
    <div className="app-shell">
      <Sidebar active={active} />
      <div className="main">
        {top}
        {children}
      </div>
    </div>
  );
}

// Tiny SVG icons reused across screens.
const Icon = {
  arrow: (p={}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
      <path d="M2 7h10M8 3l4 4-4 4"/>
    </svg>
  ),
  check: (p={}) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 6.5l3 3 5-6"/>
    </svg>
  ),
  cross: (p={}) => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M2 2l6 6M8 2l-6 6"/>
    </svg>
  ),
  flag: (p={}) => (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" {...p}>
      <path d="M1.5 1v10M1.5 1.5h7l-2 2 2 2h-7"/>
    </svg>
  ),
  spark: (p={}) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" {...p}>
      <path d="M6 0l1.2 4.8L12 6l-4.8 1.2L6 12l-1.2-4.8L0 6l4.8-1.2z"/>
    </svg>
  ),
  dot: (p={}) => (
    <svg width="6" height="6" viewBox="0 0 6 6" {...p}>
      <circle cx="3" cy="3" r="3" fill="currentColor"/>
    </svg>
  ),
  send: (p={}) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M13 1L1 6l5 2 2 5z"/>
    </svg>
  ),
};

Object.assign(window, { Sidebar, TopUtility, AppShell, Icon, NAV });
