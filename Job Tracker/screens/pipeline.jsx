// pipeline.jsx — Pipeline Board (Kanban). 5 active columns + terminal pair.
// Drag-and-drop between columns. Stale cards subtly flagged.

const COLUMNS = [
  { id: 'saved',     name: 'Saved',     sub: '4' },
  { id: 'applied',   name: 'Applied',   sub: '6' },
  { id: 'screening', name: 'Screening', sub: '3' },
  { id: 'interview', name: 'Interview', sub: '2' },
];

const TERMINAL = [
  { id: 'offer',    name: 'Offer',    sub: '1' },
  { id: 'rejected', name: 'Rejected', sub: '11' },
];

const SEED_CARDS = [
  // saved
  { id: 'c01', col: 'saved',     company: 'Vercel',     role: 'PM, DevEx',                  fit: null,  days: 4, stale: true,  next: 'Pre-screen' },
  { id: 'c02', col: 'saved',     company: 'Stripe',     role: 'Sr. PM, Issuing',            fit: 81,    days: 1, next: 'Apply by Fri' },
  { id: 'c03', col: 'saved',     company: 'Posthog',    role: 'PM, Session Replay',         fit: 76,    days: 2, next: 'Pre-screen' },
  { id: 'c04', col: 'saved',     company: 'Clay',       role: 'PM, Workflows',              fit: 69,    days: 9, stale: true, next: 'Decide' },
  // applied
  { id: 'c05', col: 'applied',   company: 'Linear',     role: 'Product Lead, Mobile',       fit: 72,    days: 8, stale: true, next: 'Follow-up' },
  { id: 'c06', col: 'applied',   company: 'Vercel·UX',  role: 'PM, Cloud Console',          fit: 74,    days: 5, next: 'Wait' },
  { id: 'c07', col: 'applied',   company: 'Replit',     role: 'PM, Agents',                 fit: 70,    days: 3, next: 'Wait' },
  { id: 'c08', col: 'applied',   company: 'Loom',       role: 'PM, Async Video',            fit: 65,    days: 12, stale: true, next: 'Follow-up' },
  { id: 'c09', col: 'applied',   company: 'Cursor',     role: 'PM, Editor',                 fit: 79,    days: 2, next: 'Wait' },
  { id: 'c10', col: 'applied',   company: 'Retool',     role: 'PM, AI',                     fit: 71,    days: 6, next: 'Follow-up' },
  // screening
  { id: 'c11', col: 'screening', company: 'Razorpay',   role: 'Sr. PM, Payments',           fit: 84,    days: 6, next: 'Reply today' },
  { id: 'c12', col: 'screening', company: 'Notion',     role: 'Group PM, AI Surfaces',      fit: 78,    days: 4, next: 'Prep · Thu' },
  { id: 'c13', col: 'screening', company: 'Ramp',       role: 'PM, Bill Pay',               fit: 73,    days: 7, next: 'Schedule' },
  // interview
  { id: 'c14', col: 'interview', company: 'Anthropic',  role: 'PM, Claude API',             fit: 88,    days: 11, next: 'Onsite · May 14' },
  { id: 'c15', col: 'interview', company: 'Figma',      role: 'PM, FigJam',                 fit: 82,    days: 9, next: 'Loop · May 12' },
  // terminal
  { id: 'c16', col: 'offer',     company: 'Plaid',      role: 'PM, Identity',               fit: 80,    days: 3, next: 'Decide by 5/16' },
  { id: 'c17', col: 'rejected',  company: 'OpenAI',     role: 'PM, Platform',               fit: 67,    days: 20, next: null },
  { id: 'c18', col: 'rejected',  company: 'Airtable',   role: 'PM, AI',                     fit: 63,    days: 16, next: null },
];

function fitColor(v) {
  if (v == null) return 'var(--ink-mute)';
  if (v >= 80) return 'var(--olive)';
  if (v >= 70) return 'var(--terra)';
  return 'var(--rust)';
}

function PipelineCard({ card, onDragStart, terminal = false }) {
  const dim = card.col === 'rejected';
  return (
    <div
      draggable
      onDragStart={(e) => { onDragStart(card.id); e.dataTransfer.effectAllowed = 'move'; }}
      className="r-card"
      style={{
        padding: '13px 14px',
        marginBottom: 10,
        cursor: 'grab',
        opacity: dim ? 0.55 : 1,
        background: terminal ? 'var(--paper-deep)' : 'var(--card)',
        border: card.stale ? '1px dashed var(--rule)' : 'none',
        position: 'relative',
      }}
    >
      {card.stale && (
        <div style={{
          position: 'absolute', top: 8, right: 10,
          fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--rust)', fontWeight: 600,
        }}>stale {card.days}d</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <span className="fit-dot" style={{ background: fitColor(card.fit) }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-mute)' }}>
          {card.fit ?? '—'} fit
        </span>
      </div>
      <div className="serif" style={{ fontSize: 18, lineHeight: 1.15, color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: 2 }}>
        {card.company}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 12 }}>{card.role}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--rule-soft)', paddingTop: 9 }}>
        <span style={{ fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.04em' }}>
          {card.days}d {card.col === 'saved' ? 'saved' : 'in stage'}
        </span>
        {card.next && (
          <span className="chip" style={{ fontSize: 10, padding: '2px 8px',
              background: card.next.includes('today') || card.next.includes('Reply') ? 'var(--ink)' : 'transparent',
              color: card.next.includes('today') || card.next.includes('Reply') ? 'var(--paper)' : 'var(--ink-2)',
              borderColor: card.next.includes('today') || card.next.includes('Reply') ? 'var(--ink)' : 'var(--rule)' }}>
            {card.next}
          </span>
        )}
      </div>
    </div>
  );
}

function Column({ col, cards, onDragStart, onDrop, dragOver, setDragOver, terminal = false }) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
      onDragLeave={() => setDragOver(null)}
      onDrop={() => { onDrop(col.id); setDragOver(null); }}
      style={{
        flex: '0 0 220px',
        padding: '10px 10px 12px',
        borderRadius: 12,
        background: dragOver === col.id ? 'rgba(177,90,58,0.07)' : 'transparent',
        border: dragOver === col.id ? '1px dashed var(--terra)' : '1px dashed transparent',
        transition: 'background .15s, border-color .15s',
        minHeight: 520,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 4px 14px', borderBottom: '1px solid var(--ink)', marginBottom: 12 }}>
        <span className="serif" style={{ fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.01em', fontStyle: terminal ? 'italic' : 'normal' }}>
          {col.name}
        </span>
        <span className="eyebrow">{cards.length}</span>
      </div>
      {cards.map(c => <PipelineCard key={c.id} card={c} onDragStart={onDragStart} terminal={terminal} />)}
      {cards.length === 0 && (
        <div className="serif-it" style={{ fontSize: 13, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 30, padding: '0 12px', lineHeight: 1.4 }}>
          {terminal ? '—' : 'Drag a card here.'}
        </div>
      )}
    </div>
  );
}

function Pipeline() {
  const [cards, setCards] = React.useState(SEED_CARDS);
  const [drag, setDrag] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);

  const move = (toCol) => {
    if (!drag) return;
    setCards(prev => prev.map(c => c.id === drag ? { ...c, col: toCol, days: 0, stale: false } : c));
    setDrag(null);
  };

  const inCol = (id) => cards.filter(c => c.col === id);

  return (
    <AppShell active="pipeline" top={
      <TopUtility left="III · PIPELINE" right={
        <>
          <span className="pill">15 active</span>
          <span className="pill" style={{ background: 'rgba(177,90,58,0.1)', borderColor: 'rgba(177,90,58,0.3)', color: 'var(--terra-deep)' }}>
            3 stale
          </span>
          <span className="pill" style={{ background: 'var(--ink)', borderColor: 'var(--ink)', color: 'var(--paper)' }}>+ Add</span>
        </>
      } />
    }>
      <div style={{ padding: '28px 36px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 26 }}>
          <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, margin: 0, letterSpacing: '-0.02em' }}>
            The <span style={{ fontStyle: 'italic' }}>pipeline.</span>
          </h1>
          <p className="serif-it" style={{ fontSize: 15, color: 'var(--ink-soft)', maxWidth: 360, textAlign: 'right', margin: 0, lineHeight: 1.4 }}>
            Drag to update. Cards over five days dim themselves so you don't have to count.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {COLUMNS.map(col => (
            <Column key={col.id} col={col} cards={inCol(col.id)} onDragStart={setDrag}
              onDrop={move} dragOver={dragOver} setDragOver={setDragOver} />
          ))}

          {/* terminal divider */}
          <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--rule)', margin: '40px 6px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translate(-50%, 0) rotate(-90deg)', whiteSpace: 'nowrap' }}
              className="eyebrow">Terminal</div>
          </div>

          {TERMINAL.map(col => (
            <Column key={col.id} col={col} cards={inCol(col.id)} onDragStart={setDrag}
              onDrop={move} dragOver={dragOver} setDragOver={setDragOver} terminal />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Pipeline });
