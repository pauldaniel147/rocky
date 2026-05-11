// coach.jsx — Rocky chat. Two-pane: thread list left, conversation right.
// Sample thread shows a pipeline-aware answer to "Should I focus on
// Razorpay?" — the AI cites her own data, doesn't generic-platitude.

const THREADS = [
  { id: 't1', title: 'Should I focus on Razorpay?',  when: 'Today · 7:48',  active: true,  preview: 'Looking at your fit map, the honest answer is…' },
  { id: 't2', title: 'How do I tell my partner I\u2019m feeling stuck?', when: 'Yesterday',     preview: 'Three weeks of silence is not a referendum on you.' },
  { id: 't3', title: 'Is the Stripe TC band a stretch?', when: 'Mon',          preview: 'Pull up your Q2 number. Now sit with it for a sec.' },
  { id: 't4', title: 'Audit me · the last 14 days',    when: 'Sun',          preview: 'You\u2019ve been consistent on the volume side. The miss is…' },
  { id: 't5', title: 'Recruiter ghosted Linear',      when: 'Apr 30',       preview: 'Eight days. You\u2019re right to follow up. Try this draft.' },
  { id: 't6', title: 'I\u2019m embarrassed it\u2019s taking this long', when: 'Apr 26',  preview: 'You\u2019re 14 days in. The market is 90 to 120. Your timeline…' },
];

const CONVO = [
  { who: 'me', text: 'Should I focus on this Razorpay role? It\'s the most live thing in my pipeline but I keep second-guessing whether late-stage fintech is what I actually want.' },
  {
    who: 'rocky',
    text: 'Looking at your fit map, the honest answer is yes — but not because it\'s the most live. It\'s the most live because it fits.',
    cites: [
      { label: 'Domain match', val: '92', tone: 'good' },
      { label: 'Working hours', val: '78 — sustainable for you', tone: 'good' },
      { label: 'Stage match', val: '70 — your soft spot', tone: 'mid' },
    ],
  },
  {
    who: 'rocky',
    text: 'Three things you said in your last four check-ins are pointing here:',
    bullets: [
      '"I want to be closer to the merchant" — May 4 win capture',
      '"I don\'t want to manage 12 PMs again" — Apr 30 audit notes',
      '"Boundaries are the deal-breaker, not comp" — your stated WLB ceiling',
    ],
  },
  {
    who: 'rocky',
    text: 'The second-guessing is probably about late-stage fintech as a category, not Razorpay specifically. You\'ve been there before — your Meta Pay India loop was the part of Meta you talk about with energy. That\'s a tell.',
  },
  {
    who: 'rocky',
    text: 'For this week: keep Razorpay at the top, prep hard for Thursday. If Anthropic also moves, we re-rank then. Not now.',
    actions: [
      { label: 'Open Razorpay card', primary: true },
      { label: 'See my pipeline' },
      { label: 'Add to today' },
    ],
  },
  { who: 'me', text: 'And if I bomb the Razorpay screen?' },
  {
    who: 'rocky',
    text: 'Then we\'ll have data. You\'ve had two screens since the layoff. Two is a sample size of two — not a verdict. Either way, you\'ll know more on Friday than you do tonight, and that\'s the only metric that matters this week.',
  },
];

function Bubble({ msg }) {
  const me = msg.who === 'me';
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: 18 }}>
      {!me && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', color: 'var(--paper)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 12,
            fontFamily: 'var(--serif)', fontSize: 17, fontStyle: 'italic' }}>
          R
        </div>
      )}
      <div style={{ maxWidth: 540 }}>
        <div style={{
          background: me ? 'var(--ink)' : 'var(--card)',
          color: me ? 'var(--paper)' : 'var(--ink-2)',
          padding: me ? '12px 18px' : '16px 20px',
          borderRadius: me ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
          fontFamily: me ? 'var(--sans)' : 'var(--serif)',
          fontSize: me ? 14.5 : 16,
          lineHeight: me ? 1.45 : 1.6,
          letterSpacing: me ? 0 : '-0.005em',
          boxShadow: me ? 'none' : '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(60,40,20,0.04), 0 8px 24px -16px rgba(60,40,20,0.18)',
        }}>
          {msg.text}
          {msg.cites && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {msg.cites.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontFamily: 'var(--sans)' }}>
                  <span className="fit-dot" style={{ background: c.tone === 'good' ? 'var(--olive)' : 'var(--terra)' }} />
                  <span style={{ color: 'var(--ink-mute)', minWidth: 110 }}>{c.label}</span>
                  <span style={{ color: 'var(--ink-2)', fontFamily: 'var(--mono)' }}>{c.val}</span>
                </div>
              ))}
            </div>
          )}
          {msg.bullets && (
            <ul style={{ margin: '12px 0 0', paddingLeft: 22, fontSize: 14.5, fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-2)', lineHeight: 1.55 }}>
              {msg.bullets.map((b, i) => <li key={i} style={{ marginBottom: 4 }}>{b}</li>)}
            </ul>
          )}
          {msg.actions && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {msg.actions.map((a, i) => (
                <button key={i} className={a.primary ? 'chip ink' : 'chip'} style={{ fontSize: 11.5, padding: '5px 11px', cursor: 'pointer' }}>
                  {a.label} {a.primary && <Icon.arrow style={{ marginLeft: 4, width: 10, height: 10 }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Coach() {
  const [draft, setDraft] = React.useState('');
  return (
    <AppShell active="coach" top={
      <TopUtility left="IV · COACH" right={
        <>
          <span className="pill">Briefed on 17 jobs</span>
          <span className="pill">Read 14 check-ins</span>
        </>
      } />
    }>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100% - 38px)' }}>
        {/* threads list */}
        <aside style={{ borderRight: '1px solid var(--rule)', padding: '24px 18px 24px 28px', overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <span className="serif" style={{ fontSize: 26, letterSpacing: '-0.015em' }}>
              <span style={{ fontStyle: 'italic' }}>Rocky</span>
            </span>
            <span className="eyebrow">+ new</span>
          </div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Threads</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {THREADS.map(t => (
              <div key={t.id} style={{
                padding: '12px 12px',
                marginLeft: -12, marginRight: -12,
                borderRadius: 8,
                background: t.active ? 'rgba(177,90,58,0.08)' : 'transparent',
                cursor: 'pointer',
                position: 'relative',
              }}>
                {t.active && <div style={{ position: 'absolute', left: -12, top: 14, bottom: 14, width: 2, background: 'var(--terra)' }} />}
                <div className="serif" style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.25, marginBottom: 4 }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-mute)', marginBottom: 4 }}>{t.when}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--serif)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                  {t.preview}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* conversation */}
        <section style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '20px 32px 16px', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Today's thread</div>
              <h2 className="serif" style={{ fontSize: 28, margin: 0, lineHeight: 1.1, letterSpacing: '-0.015em' }}>
                Should I focus on <span style={{ fontStyle: 'italic' }}>Razorpay?</span>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="chip">Pin to Today</span>
              <span className="chip">Export</span>
            </div>
          </div>

          <div style={{ flex: 1, padding: '24px 32px', overflow: 'auto' }}>
            {CONVO.map((m, i) => <Bubble key={i} msg={m} />)}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-mute)', fontSize: 12, marginLeft: 44 }}>
              <span style={{ display: 'inline-flex', gap: 3 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink-mute)', opacity: 0.4, animation: `dot 1.2s ${i*0.15}s infinite` }} />)}
              </span>
              <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>Rocky is reading your last screen notes…</span>
            </div>
          </div>

          {/* compose */}
          <div style={{ padding: '14px 32px 26px' }}>
            <div className="r-card" style={{ padding: '6px 6px 6px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Ask Rocky · he's read your pipeline this morning"
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: 'var(--serif)', fontStyle: 'italic',
                  fontSize: 17, color: 'var(--ink-2)',
                  letterSpacing: '-0.005em',
                  padding: '12px 0',
                }}
              />
              <button style={{
                height: 40, padding: '0 18px', border: 'none', borderRadius: 999,
                background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--sans)', fontSize: 13,
              }}>
                Send <Icon.send />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, fontSize: 11, color: 'var(--ink-mute)' }}>
              <span>Suggested:</span>
              <span style={{ cursor: 'pointer' }}>"Audit my last 7 days"</span>
              <span>·</span>
              <span style={{ cursor: 'pointer' }}>"Compare Razorpay vs Anthropic for me"</span>
              <span>·</span>
              <span style={{ cursor: 'pointer' }}>"What am I avoiding?"</span>
            </div>
          </div>
        </section>
      </div>
      <style>{`@keyframes dot { 0%,80%,100% { opacity: 0.3 } 40% { opacity: 1 } }`}</style>
    </AppShell>
  );
}

Object.assign(window, { Coach });
