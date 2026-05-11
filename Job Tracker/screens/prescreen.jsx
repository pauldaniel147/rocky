// prescreen.jsx — Pre-Screen / Should I Apply?
// Two-column: pasted JD on left, AI verdict on right.

const SAMPLE_JD = `Senior Product Manager, Growth — Stitchpath (Series B, San Francisco)

We're looking for a hands-on PM to own activation and monetization for our self-serve product. You'll work directly with the founders and ship fast in a high-context, async-first team.

What you'll do
• Run weekly experiments across onboarding, pricing pages, and trial-to-paid
• Partner with eng + design (no product trio babysitting; we trust ICs)
• Own metrics end-to-end. We expect PMs to write SQL.

About the team
We move fast — most folks here are online from 9am to 8pm PT and weekends are flexible (in both directions). 
We're hiring our first PM outside the founding team. This is a player-coach role for someone who has been a senior IC or staff PM at a high-growth consumer startup.

Comp & details
$170–210k base + 0.05–0.12% equity. SF or remote in PT-overlapping timezones. We meet in person twice a year.`;

function PreScreen() {
  return (
    <AppShell active="prescreen" top={
      <TopUtility left="II · PRE-SCREEN · SHOULD I APPLY?" right={<span className="pill">3 left this week</span>} />
    }>
      <div style={{ padding: '36px 40px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
          <h1 className="serif" style={{ fontSize: 54, lineHeight: 1, margin: 0, letterSpacing: '-0.022em' }}>
            Should I <span style={{ fontStyle: 'italic' }}>apply</span>?
          </h1>
          <p className="serif-it" style={{ fontSize: 16, color: 'var(--ink-soft)', maxWidth: 380, textAlign: 'right', margin: 0, lineHeight: 1.4 }}>
            Paste it before you save it. The cost of the wrong "yes" is two weeks of your search energy.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 24 }}>
          {/* JD paste */}
          <div className="r-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow-ink">The job description</div>
              <div className="eyebrow">stitchpath.com/careers/spm-growth</div>
            </div>
            <div style={{ padding: '20px 24px', flex: 1, fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 540 }}>
              {SAMPLE_JD}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--ink-mute)' }}>
              <span>1,082 characters · pasted 14 sec ago</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--terra-deep)' }}>
                <Icon.spark /> Rocky read it twice
              </span>
            </div>
          </div>

          {/* verdict panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* fit ring */}
            <div className="r-card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 22, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <div className="ring" style={{ '--val': 64, '--c': 'var(--terra)', position: 'relative' }}>
                  <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
                    <div className="serif" style={{ fontSize: 42, lineHeight: 1, color: 'var(--ink)' }}>64</div>
                    <div className="eyebrow" style={{ marginTop: 4 }}>fit</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ color: 'var(--terra-deep)', marginBottom: 6 }}>Verdict</div>
                <div className="serif" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: 6, letterSpacing: '-0.015em' }}>
                  Apply — <span style={{ fontStyle: 'italic' }}>cautiously.</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  Real PM ownership and a comp band that respects you. But the working-hours signals are loud — read them honestly before you say yes.
                </div>
              </div>
            </div>

            {/* green flags */}
            <div className="r-card-flat" style={{ padding: 20 }}>
              <div className="eyebrow-ink" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--olive)' }}>
                <Icon.check /> Green flags · 3
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { h: 'Real IC trust', s: '"No product trio babysitting" — they hire PMs to ship, not to coordinate.' },
                  { h: 'Comp respects experience', s: '$170–210k base for a Series B is honest. Equity range is normal.' },
                  { h: 'Founders in the loop', s: 'You wanted shorter feedback loops than Meta. This delivers that.' },
                ].map((f, i) => (
                  <li key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--olive)', marginTop: 4 }}><Icon.check /></span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{f.h}</div>
                      <div className="serif-it" style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{f.s}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* red flags */}
            <div className="r-card-flat" style={{ padding: 20, borderColor: 'rgba(154,74,54,0.25)', background: 'rgba(154,74,54,0.04)' }}>
              <div className="eyebrow-ink" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--rust)' }}>
                <Icon.cross /> Read carefully · 2
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { h: 'Working-hours signal',  tag: 'WLB',     s: '"9am to 8pm PT, weekends flexible in both directions" — that\'s an 11-hour day, normalised. Your stated WLB ceiling is 9.' },
                  { h: 'Timezone reality',      tag: 'TIMEZONE', s: 'PT-overlapping required. From Bangalore that is 9:30pm–8:30am IST. Permanent night shift, not async.' },
                ].map((f, i) => (
                  <li key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--rust)', marginTop: 4 }}><Icon.cross /></span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{f.h}</span>
                        <span className="chip" style={{ fontSize: 9.5, padding: '2px 7px', color: 'var(--rust)', borderColor: 'rgba(154,74,54,0.4)', background: 'rgba(154,74,54,0.08)' }}>{f.tag}</span>
                      </div>
                      <div className="serif-it" style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{f.s}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10, marginTop: 4 }}>
              <button className="r-cta" style={{ padding: '14px 18px' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic' }}>Add to pipeline · Saved</span>
                <Icon.arrow />
              </button>
              <button className="r-cta-ghost">Skip this one</button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { PreScreen });
