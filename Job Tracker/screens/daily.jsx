// daily.jsx — Daily Digest (Today). Morning state by default; evening state
// shows the check-in + win-capture form. Component receives `evening` flag.

function DailyDigest({ evening = false }) {
  if (evening) return <DailyEvening />;
  return <DailyMorning />;
}

// ─── tasks (shared between states; come from her real pipeline) ────
const TODAYS_TASKS = [
{
  n: '01',
  company: 'Razorpay',
  role: 'Sr. PM, Payments',
  action: 'Reply to recruiter',
  why: 'Asked about TC band yesterday — keep momentum',
  chip: 'Reply · 10 min',
  fit: 84
},
{
  n: '02',
  company: 'Linear',
  role: 'Product Lead, Mobile',
  action: 'Send follow-up note',
  why: '8 days since last touch — past her own 5-day rule',
  chip: 'Follow-up · 12 min',
  fit: 72
},
{
  n: '03',
  company: 'Notion',
  role: 'Group PM, AI Surfaces',
  action: 'Prep for Thursday\u2019s screen',
  why: 'Review hiring manager\u2019s last 3 talks',
  chip: 'Interview prep · 35 min',
  fit: 78
},
{
  n: '04',
  company: 'Vercel',
  role: 'PM, Developer Experience',
  action: 'Decide: apply or skip',
  why: 'Saved 4 days ago. JD is sitting cold.',
  chip: 'Pre-screen · 8 min',
  fit: null
}];


function FitMark({ value }) {
  if (value == null) return <span className="eyebrow" style={{ color: 'var(--ink-mute)' }}>UNRATED</span>;
  const c = value >= 80 ? 'var(--olive)' : value >= 70 ? 'var(--terra)' : 'var(--rust)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)', letterSpacing: 0 }}>
      <span className="fit-dot" style={{ background: c }} />
      {value} fit
    </span>);

}

function DailyMorning() {
  return (
    <AppShell active="today" top={
    <TopUtility right={
    <>
          <span className="pill">Morning</span>
          <span>7:42 AM</span>
        </>
    } />
    }>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '38px 36px 80px' }}>
        {/* hero */}
        <div className="eyebrow" style={{ marginBottom: 14 }}>The morning brief</div>
        <h1 className="serif" style={{ fontSize: 88, lineHeight: 0.95, margin: '0 0 20px', letterSpacing: '-0.025em' }}>
          Morning,<br />
          <span style={{ fontStyle: 'italic' }}>Rasika.</span>
        </h1>
        <p className="serif-it" style={{ fontSize: 22, lineHeight: 1.4, color: 'var(--ink-2)', maxWidth: 560, margin: '0 0 6px' }}>
          You showed up yesterday — three follow-ups out, one screen booked.
          That's a real day, even when the inbox is quiet.
        </p>

        {/* divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '46px 0 22px' }}>
          <div className="eyebrow-ink">Today · 4 things</div>
          <hr className="rule-h" style={{ flex: 1 }} />
          <div className="eyebrow">≈ 65 min total</div>
        </div>

        {/* tasks */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TODAYS_TASKS.map((t, i) =>
          <div key={t.n} style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr auto',
            gap: 18,
            alignItems: 'baseline',
            padding: '18px 0',
            borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule)'
          }}>
              <div className="serif-it" style={{ fontSize: 30, color: 'var(--ink-mute)', letterSpacing: '-0.02em' }}>
                {t.n}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                  <span className="serif" style={{ fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                    {t.action}
                  </span>
                  <span style={{ color: 'var(--ink-mute)', fontSize: 12 }}>
                    · {t.company} · {t.role}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.45, fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
                  {t.why}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span className="chip">{t.chip}</span>
                <FitMark value={t.fit} />
              </div>
            </div>
          )}
        </div>

        {/* fit-check prompt + personal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 30 }}>
          <div className="r-card" style={{ padding: 22, position: 'relative' }}>
            <div className="eyebrow" style={{ color: 'var(--terra-deep)', marginBottom: 10 }}>Fit check</div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.15, marginBottom: 8 }}>
              Got a JD you're<br />not sure about?
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: '0 0 14px' }}>
              Paste it. I'll flag startup-culture and timezone tells before you spend the energy.
            </p>
            <button className="r-cta-ghost" style={{ width: 'auto' }}>
              Pre-screen a JD <Icon.arrow style={{ marginLeft: 8 }} />
            </button>
          </div>

          <div className="r-card" style={{ padding: 22, background: 'var(--card-raised)' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>For you</div>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.15, marginBottom: 8 }}>
              Walk before<br />
              <span style={{ fontStyle: 'italic' }}>screens.</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: '0 0 14px' }}>
              20 minutes outside, no podcast.
              You said this helps you think more honestly about offers.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="chip ink">Mark done</button>
              <button className="chip">Not today</button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="r-cta" style={{ marginTop: 36 }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic' }}>Start my day</span>
            <span style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>
              Razorpay reply first · 10 min
            </span>
          </span>
          <Icon.arrow width="18" height="18" />
        </button>
      </div>
    </AppShell>);

}

function DailyEvening() {
  const [pick, setPick] = React.useState(null);
  const [win, setWin] = React.useState('Recruiter at Razorpay said the TC band is workable. First green flag in two weeks.');
  return (
    <AppShell active="today" top={
    <TopUtility right={
    <>
          <span className="pill" style={{ background: 'var(--ink)', color: 'var(--paper)', borderColor: 'var(--ink)' }}>Evening</span>
          <span>7:18 PM</span>
        </>
    } />
    }>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '38px 36px 80px' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>The evening check-in</div>
        <h1 className="serif" style={{ fontSize: 88, lineHeight: 0.95, margin: '0 0 18px', letterSpacing: '-0.025em' }}>
          Evening,<br />
          <span style={{ fontStyle: 'italic' }}>Maya.</span>
        </h1>
        <p className="serif-it" style={{ fontSize: 22, lineHeight: 1.4, color: 'var(--ink-2)', maxWidth: 540, margin: '0 0 6px' }}>
          Three taps. No judgment. Tomorrow gets easier when tonight is honest.
        </p>

        {/* check-in */}
        <div style={{ marginTop: 50 }}>
          <div className="eyebrow-ink" style={{ marginBottom: 16 }}>How was today?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
            { id: 'done', title: 'Done', sub: 'All four · clean run', glyph: '✓' },
            { id: 'partial', title: 'Partial', sub: 'Some moved · some didn\u2019t', glyph: '◐' },
            { id: 'not', title: 'Not today', sub: 'Tired · resting counts', glyph: '·' }].
            map((o) =>
            <button key={o.id} onClick={() => setPick(o.id)} className="r-card" style={{
              padding: '22px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              background: pick === o.id ? 'var(--ink)' : 'var(--card)',
              color: pick === o.id ? 'var(--paper)' : 'var(--ink)',
              border: 'none',
              fontFamily: 'var(--sans)'
            }}>
                <div className="serif" style={{ fontSize: 38, lineHeight: 1, marginBottom: 12, opacity: pick === o.id ? 0.85 : 0.55 }}>
                  {o.glyph}
                </div>
                <div className="serif" style={{ fontSize: 24, marginBottom: 4, fontStyle: 'italic' }}>{o.title}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{o.sub}</div>
              </button>
            )}
          </div>
        </div>

        {/* win capture */}
        <div style={{ marginTop: 44 }}>
          <div className="eyebrow-ink" style={{ marginBottom: 16 }}>What went right?</div>
          <div className="r-card" style={{ padding: 22 }}>
            <textarea
              value={win}
              onChange={(e) => setWin(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 22,
                lineHeight: 1.35,
                color: 'var(--ink)',
                resize: 'none',
                outline: 'none',
                letterSpacing: '-0.005em'
              }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 14, borderTop: '1px solid var(--rule)' }}>
              <div className="eyebrow" style={{ color: 'var(--terra-deep)' }}>
                <Icon.spark style={{ marginRight: 6, verticalAlign: '-2px' }} /> Win 7 of 14
              </div>
              <div className="eyebrow">May 9 · 7:18 pm</div>
            </div>
          </div>
        </div>

        {/* quote */}
        <div style={{ marginTop: 40, padding: '24px 28px', borderLeft: '2px solid var(--terra)', background: 'rgba(177,90,58,0.05)', borderRadius: '0 8px 8px 0' }}>
          <p className="serif-it" style={{ fontSize: 19, lineHeight: 1.4, color: 'var(--ink-2)', margin: 0 }}>
            "Eight rejections this week. One screen booked. The math of the search is brutal — you are not."
          </p>
          <div className="eyebrow" style={{ marginTop: 10 }}>— Rocky, reading your week</div>
        </div>

        <button className="r-cta" style={{ marginTop: 36 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic' }}>Capture &amp; rest</span>
          <Icon.arrow width="18" height="18" />
        </button>
      </div>
    </AppShell>);

}

Object.assign(window, { DailyDigest, DailyMorning, DailyEvening, FitMark });