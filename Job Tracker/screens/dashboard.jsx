// dashboard.jsx — Weekly view. AI paragraph at top, then four metric cards
// arranged like a magazine layout (asymmetric grid, editorial weight).

function Dashboard() {
  return (
    <AppShell active="dashboard" top={
      <TopUtility left="V · WEEKLY DASHBOARD" right={
        <>
          <span className="pill">‹ Apr 28</span>
          <span className="pill" style={{ background: 'var(--ink)', borderColor: 'var(--ink)', color: 'var(--paper)' }}>This week</span>
          <span className="pill">May 12 ›</span>
        </>
      } />
    }>
      <div style={{ padding: '32px 40px 60px', maxWidth: 1180, margin: '0 auto' }}>
        {/* hero: AI read */}
        <div className="eyebrow" style={{ marginBottom: 14 }}>The week of May 5 · honest read</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, alignItems: 'start', paddingBottom: 32, borderBottom: '1px solid var(--ink)', marginBottom: 32 }}>
          <h1 className="serif" style={{ fontSize: 56, lineHeight: 1.05, margin: 0, letterSpacing: '-0.022em' }}>
            Quietly, this was<br/>
            <span style={{ fontStyle: 'italic' }}>your best week so far.</span>
          </h1>
          <div>
            <p className="serif" style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', margin: '0 0 14px' }}>
              You sent <strong>4 follow-ups</strong> (your weekly target is 3), booked <strong>2 screens</strong>, and didn't apply to anything you'd previously flagged as a stretch on hours. The Razorpay momentum is real — Priya replied within a day, and that almost never happens for cold-recruited senior PMs in fintech.
            </p>
            <p className="serif" style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
              The miss is the same as last week: Tuesday was a "not today." Two in a row means something is heavy, not lazy. Worth talking to me about on Sunday.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 18, fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <span><Icon.spark style={{ verticalAlign: '-1px', color: 'var(--terra)' }}/> Written by Rocky · 9 min read of your week</span>
            </div>
          </div>
        </div>

        {/* metric grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: 22, marginBottom: 22 }}>
          {/* pipeline health */}
          <div className="r-card" style={{ padding: 28, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
              <span className="eyebrow-ink">Pipeline health</span>
              <span className="eyebrow" style={{ color: 'var(--olive)' }}>↗ +12 vs last wk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
              <span className="serif" style={{ fontSize: 110, lineHeight: 0.85, letterSpacing: '-0.04em', color: 'var(--ink)' }}>72</span>
              <span className="serif-it" style={{ fontSize: 22, color: 'var(--ink-mute)' }}>/ 100</span>
            </div>
            <p className="serif" style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-soft)', margin: '0 0 18px' }}>
              Healthy. Three things lifted you: <em>4 follow-ups out</em>, <em>2 active screens</em>, and the Anthropic onsite landing on the calendar.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { n: '15', l: 'active' },
                { n: '4',  l: 'this wk' },
                { n: '3',  l: 'stale' },
                { n: '67%', l: 'on time' },
              ].map(s => (
                <div key={s.l}>
                  <div className="serif" style={{ fontSize: 24, lineHeight: 1, color: 'var(--ink)' }}>{s.n}</div>
                  <div className="eyebrow">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* callback rate by company type — bar chart */}
          <div className="r-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
              <span className="eyebrow-ink">Callback rate · by company type</span>
              <span className="eyebrow">last 30 days · 23 apps</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { type: 'Late-stage fintech', rate: 38, n: '3 / 8',  c: 'var(--olive)',  note: 'your strongest segment' },
                { type: 'AI/ML platform',     rate: 33, n: '2 / 6',  c: 'var(--terra)',  note: 'Anthropic carrying it' },
                { type: 'Series B startup',   rate: 14, n: '1 / 7',  c: 'var(--rust)',   note: 'hours signals filter you out' },
                { type: 'Big-tech (FAANG)',   rate: 50, n: '1 / 2',  c: 'var(--sand)',   note: 'small sample · skip for now' },
              ].map(b => (
                <div key={b.type} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 70px', alignItems: 'center', gap: 14, fontSize: 13 }}>
                  <span style={{ color: 'var(--ink-2)' }}>{b.type}</span>
                  <div style={{ position: 'relative', height: 28, background: 'var(--paper-deep)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${b.rate * 1.8}%`, height: '100%', background: b.c, opacity: 0.85 }} />
                    <span style={{ position: 'absolute', left: 12, top: 0, lineHeight: '28px', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--paper)' }}>
                      {b.note}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-2)', textAlign: 'right' }}>
                    <strong style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, fontWeight: 400 }}>{b.rate}%</strong>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>{b.n}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 22 }}>
          {/* fit alignment */}
          <div className="r-card" style={{ padding: 28 }}>
            <div className="eyebrow-ink" style={{ marginBottom: 16 }}>Fit alignment · WLB</div>
            <p className="serif" style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-soft)', margin: '0 0 22px' }}>
              How much of your active pipeline matches your stated working-hours boundary.
            </p>

            {/* horizontal stacked bar */}
            <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 18, border: '1px solid var(--rule)' }}>
              <div style={{ width: '60%', background: 'var(--olive)' }} title="Aligned" />
              <div style={{ width: '27%', background: 'var(--terra)' }} title="Stretch" />
              <div style={{ width: '13%', background: 'var(--rust)' }} title="Mismatch" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              {[
                { c: 'var(--olive)', l: 'Aligned with your boundary',          n: '9 jobs · 60%',  it: 'great' },
                { c: 'var(--terra)', l: 'Stretch · sustainable for one year',  n: '4 jobs · 27%',  it: 'fine' },
                { c: 'var(--rust)',  l: 'Likely mismatch · old habits',        n: '2 jobs · 13%',  it: 'audit' },
              ].map(r => (
                <div key={r.l} style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: 12, alignItems: 'center' }}>
                  <span className="fit-dot" style={{ background: r.c }} />
                  <span style={{ color: 'var(--ink-2)' }}>{r.l}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-mute)' }}>{r.n}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--rule)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              Better than last week (was 41% aligned). The two mismatches are Loom and Stitchpath — flagged for an honest look.
            </div>
          </div>

          {/* strategy audit */}
          <div className="r-card" style={{
            padding: 28,
            background: 'linear-gradient(135deg, var(--terra-wash) 0%, var(--card) 70%)',
            border: '1px solid var(--terra-soft)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--terra-deep)', marginBottom: 6 }}>Bi-weekly strategy audit · due now</div>
                <h2 className="serif" style={{ fontSize: 36, lineHeight: 1.05, margin: 0, letterSpacing: '-0.018em' }}>
                  Three quiet patterns I want to <span style={{ fontStyle: 'italic' }}>name with you.</span>
                </h2>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--terra)', color: 'var(--paper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon.spark />
              </div>
            </div>

            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { n: '01', t: 'You apply at night. Your night-applications get callbacks 11% of the time. Your morning ones, 38%.', a: 'Move applying to mornings · Mon/Thu' },
                { n: '02', t: 'You\u2019ve saved 4 jobs in the "Series B startup" bucket. Your callback rate there is 14%. The data is asking you a question.', a: 'Audit the 4 saved · 12 min' },
                { n: '03', t: 'You haven\u2019t taken a real Saturday in three weeks. Two "not today"s landed on Mondays.', a: 'Block Saturday · no Rocky · no apply' },
              ].map(p => (
                <li key={p.n} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 14 }}>
                  <span className="serif-it" style={{ fontSize: 24, color: 'var(--terra-deep)', lineHeight: 1 }}>{p.n}</span>
                  <div>
                    <p className="serif" style={{ fontSize: 16, lineHeight: 1.45, color: 'var(--ink-2)', margin: '0 0 6px' }}>{p.t}</p>
                    <button className="chip terra" style={{ cursor: 'pointer' }}>
                      <Icon.arrow style={{ width: 9, height: 9, marginRight: 4 }} /> {p.a}
                    </button>
                  </div>
                </li>
              ))}
            </ol>

            <button className="r-cta" style={{ marginTop: 22, padding: '14px 20px', background: 'var(--terra-deep)' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic' }}>Talk it through with Rocky</span>
              <Icon.arrow />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Dashboard });
