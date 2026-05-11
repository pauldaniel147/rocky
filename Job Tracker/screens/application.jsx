// application.jsx — Application Card (expanded). Shown as a full page; the
// pipeline column it came from is hinted at the top as a breadcrumb so the
// user knows tapping the X returns there.

const APP_TABS = [
  { id: 'positioning', label: 'Positioning angle' },
  { id: 'ask',         label: 'WLB ask script' },
  { id: 'followup',    label: 'Follow-up draft' },
  { id: 'prep',        label: 'Interview prep' },
  { id: 'notes',       label: 'My notes' },
];

function ApplicationCard() {
  const [tab, setTab] = React.useState('positioning');

  return (
    <AppShell active="pipeline" top={
      <TopUtility left={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--ink-soft)' }}>Pipeline</span>
          <span>›</span>
          <span>Screening</span>
          <span>›</span>
          <span style={{ color: 'var(--ink)' }}>Razorpay · Sr. PM, Payments</span>
        </span>
      } right={
        <>
          <span className="pill">6 days in stage</span>
          <span className="pill" style={{ background: 'var(--ink)', color: 'var(--paper)', borderColor: 'var(--ink)' }}>Close ✕</span>
        </>
      } />
    }>
      <div style={{ padding: '28px 40px 60px' }}>
        {/* hero */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 36, alignItems: 'start', marginBottom: 30, paddingBottom: 26, borderBottom: '1px solid var(--ink)' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Bangalore · 600+ employees · Series F · Fintech</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--ink)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 28, fontStyle: 'italic' }}>R</div>
              <div className="serif" style={{ fontSize: 56, lineHeight: 0.95, letterSpacing: '-0.025em' }}>
                Razorpay
              </div>
            </div>
            <div className="serif-it" style={{ fontSize: 32, color: 'var(--ink-2)', letterSpacing: '-0.01em', marginLeft: 70, lineHeight: 1.1 }}>
              Senior PM, Payments
            </div>
            <div style={{ marginTop: 18, marginLeft: 70, display: 'flex', gap: 10 }}>
              <span className="chip">Applied · Apr 28</span>
              <span className="chip">Recruiter screen · today</span>
              <span className="chip terra">Reply due in 3 hrs</span>
            </div>
          </div>

          {/* fit panel */}
          <div className="r-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 86, height: 86 }}>
                <div className="ring" style={{ '--val': 84, '--c': 'var(--olive)', position: 'relative' }}>
                  <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
                    <div className="serif" style={{ fontSize: 30, lineHeight: 1, color: 'var(--ink)' }}>84</div>
                    <div className="eyebrow" style={{ marginTop: 2, fontSize: 9 }}>fit</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ color: 'var(--olive)', marginBottom: 4 }}>Fit · strong</div>
                <div className="serif" style={{ fontSize: 18, lineHeight: 1.2 }}>
                  Your story&nbsp;✕&nbsp;their need lines up cleanly.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { k: 'Domain match',    v: 92, n: 'Payments + India' },
                { k: 'Timezone',        v: 100, n: 'IST native' },
                { k: 'Working hours',   v: 78, n: 'Sustainable for you' },
                { k: 'Stage match',     v: 70, n: 'Big-co → late-stage' },
              ].map(b => (
                <div key={b.k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px', alignItems: 'center', gap: 10, fontSize: 11.5, color: 'var(--ink-soft)' }}>
                  <span>{b.k}</span>
                  <div style={{ height: 4, background: 'var(--rule-soft)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${b.v}%`, height: '100%', background: b.v >= 80 ? 'var(--olive)' : 'var(--terra)' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink-mute)', textAlign: 'right' }}>{b.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--rule)', marginBottom: 28, position: 'sticky', top: 0, background: 'var(--paper)', zIndex: 2 }}>
          {APP_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '14px 16px',
                fontFamily: 'var(--sans)', fontSize: 13,
                color: tab === t.id ? 'var(--ink)' : 'var(--ink-mute)',
                fontWeight: tab === t.id ? 600 : 450,
                borderBottom: tab === t.id ? '2px solid var(--ink)' : '2px solid transparent',
                marginBottom: -1,
                letterSpacing: '-0.005em',
              }}>
              {t.label}
              {t.id !== 'notes' && <Icon.spark style={{ marginLeft: 6, color: tab === t.id ? 'var(--terra)' : 'var(--ink-mute)', verticalAlign: '-1px', width: 9, height: 9 }} />}
            </button>
          ))}
        </div>

        {/* body — two-column reading layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
          {tab === 'positioning' && <Positioning />}
          {tab === 'ask'         && <AskScript />}
          {tab === 'followup'    && <FollowUp />}
          {tab === 'prep'        && <InterviewPrep />}
          {tab === 'notes'       && <Notes />}
        </div>
      </div>
    </AppShell>
  );
}

function AIBadge({ children = 'Pre-filled by Rocky' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terra-deep)', fontWeight: 600 }}>
      <Icon.spark /> {children}
    </span>
  );
}

function Positioning() {
  return (
    <>
      <div>
        <AIBadge />
        <h2 className="serif" style={{ fontSize: 36, lineHeight: 1.05, margin: '12px 0 18px', letterSpacing: '-0.018em' }}>
          Lead with the <span style={{ fontStyle: 'italic' }}>UPI-rails</span> work, not the Meta scale.
        </h2>
        <p className="serif" style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 14px' }}>
          Razorpay's growth is bottlenecked on merchant retention through the UPI 2.0 transition. You shipped recurring-mandate flows at Meta Pay India that survived the same regulator changes — that's the story they will recognise immediately.
        </p>
        <p className="serif" style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 14px' }}>
          Don't lead with org size. They've heard "I managed 12 PMs at FAANG" twice this week, per their LinkedIn. <em>Lead with the regulator-proof shipping rhythm.</em>
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="r-card-flat" style={{ padding: 18 }}>
          <div className="eyebrow-ink" style={{ marginBottom: 8 }}>Three lines to use</div>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-2)', fontFamily: 'var(--serif)' }}>
            <li style={{ marginBottom: 8 }}>"I shipped the recurring-mandate flow that kept Meta Pay merchants live through the 2023 RBI changes."</li>
            <li style={{ marginBottom: 8 }}>"My instinct is to design for the regulator's next move, not the last one."</li>
            <li>"I want to be closer to the merchant, which is why I'm looking at platforms, not surfaces."</li>
          </ol>
        </div>
        <div className="r-card-flat" style={{ padding: 18, background: 'var(--terra-wash)', borderColor: 'var(--terra-soft)' }}>
          <div className="eyebrow-ink" style={{ color: 'var(--terra-deep)', marginBottom: 8 }}>Don't say</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            <li>"I'm open to anything" — they read this as no conviction.</li>
            <li>"I led a team of 12" — comes across as Meta-shaped.</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function AskScript() {
  return (
    <>
      <div>
        <AIBadge>WLB ask · written for Razorpay</AIBadge>
        <h2 className="serif" style={{ fontSize: 36, lineHeight: 1.05, margin: '12px 0 18px', letterSpacing: '-0.018em' }}>
          Ask about hours <span style={{ fontStyle: 'italic' }}>like a senior person</span> — not like a candidate.
        </h2>
        <p className="serif" style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)', margin: '0 0 16px' }}>
          Indian late-stage fintech defaults to "always on." You said your boundary is 9 hours, evenings off. The script below makes that an operating question, not a personal one.
        </p>
        <div className="r-card" style={{ padding: 22, background: 'var(--card-raised)' }}>
          <p className="serif-it" style={{ fontSize: 19, lineHeight: 1.55, color: 'var(--ink)', margin: '0 0 14px' }}>
            "How does the team think about the merchant escalation rotation? My read is that on-call expectations vary a lot across Razorpay's product lines — what does it look like for Payments specifically, and how senior is the rotation?"
          </p>
          <hr className="rule-h" style={{ margin: '14px 0' }} />
          <p className="serif-it" style={{ fontSize: 19, lineHeight: 1.55, color: 'var(--ink)', margin: 0 }}>
            "What's the cadence on Slack and decisions after 8pm IST? I'm trying to understand the actual rhythm, not the policy."
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="r-card-flat" style={{ padding: 18 }}>
          <div className="eyebrow-ink" style={{ marginBottom: 8 }}>Listen for</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            <li>"It depends on the launch" → ask what % of weeks are launch weeks</li>
            <li>"We have an on-call rotation" → ask how often, who, and for how long</li>
            <li>"We're a high-ownership culture" → that's a deflection. Press once.</li>
          </ul>
        </div>
        <div className="r-card-flat" style={{ padding: 18 }}>
          <div className="eyebrow-ink" style={{ marginBottom: 8 }}>Why this works for you</div>
          <p className="serif-it" style={{ margin: 0, fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
            You said in your Tuesday check-in that you can't go back to Slack-after-9. This script gets the answer in interview, not in your second month.
          </p>
        </div>
      </div>
    </>
  );
}

function FollowUp() {
  return (
    <>
      <div>
        <AIBadge>Email draft · ready to send</AIBadge>
        <h2 className="serif" style={{ fontSize: 36, lineHeight: 1.05, margin: '12px 0 18px', letterSpacing: '-0.018em' }}>
          A follow-up that <span style={{ fontStyle: 'italic' }}>moves the screen along.</span>
        </h2>
        <div className="r-card" style={{ padding: 24, fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}>
          <div style={{ paddingBottom: 12, marginBottom: 14, borderBottom: '1px solid var(--rule)', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-mute)', display: 'grid', gridTemplateColumns: '70px 1fr', gap: 8 }}>
            <span>To</span><span style={{ color: 'var(--ink-2)' }}>priya.s@razorpay.com</span>
            <span>Subject</span><span style={{ color: 'var(--ink-2)' }}>Quick follow-up — Sr. PM, Payments</span>
          </div>
          <p style={{ margin: '0 0 12px' }}>Hi Priya,</p>
          <p style={{ margin: '0 0 12px' }}>Thanks for the conversation Tuesday. I went back over the recurring-mandates work afterwards and put together a one-pager on what I'd want to dig into in the first 90 days — happy to share it ahead of the next round if that'd be useful.</p>
          <p style={{ margin: '0 0 12px' }}>One quick question on logistics: you mentioned the hiring manager is travelling next week. Should I plan around the 21st, or is there a slot earlier?</p>
          <p style={{ margin: '0 0 4px' }}>Best,<br/>Maya</p>
        </div>
      </div>
      <div>
        <div className="r-card-flat" style={{ padding: 18, marginBottom: 14 }}>
          <div className="eyebrow-ink" style={{ marginBottom: 8 }}>Why this works</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            <li>Offers value (the one-pager) without begging</li>
            <li>Makes it easy to say yes to scheduling</li>
            <li>Doesn't ask "any update?" — that's why follow-ups die</li>
          </ul>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="r-cta" style={{ padding: '13px 18px' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 17, fontStyle: 'italic' }}>Open in Gmail</span>
            <Icon.send />
          </button>
          <button className="r-cta-ghost">Edit draft</button>
        </div>
      </div>
    </>
  );
}

function InterviewPrep() {
  return (
    <>
      <div>
        <AIBadge>For Thursday's screen · Razorpay</AIBadge>
        <h2 className="serif" style={{ fontSize: 36, lineHeight: 1.05, margin: '12px 0 18px', letterSpacing: '-0.018em' }}>
          Likely <span style={{ fontStyle: 'italic' }}>questions.</span>
        </h2>
        <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {[
            { q: 'How do you think about merchant retention vs. acquisition spend in a market that\'s already saturated on UPI?', why: 'It\'s the question Priya opened her last all-hands with.' },
            { q: 'Tell me about a regulator-driven pivot. What did you ship, what did you cut?', why: 'They want to hear "RBI" within 30 seconds.' },
            { q: 'Describe how you\'d structure the first 90 days here.', why: 'They\'re testing whether you\'ve done the homework.' },
            { q: 'How do you handle a launch where eng wants two more weeks and the BD team has already committed?', why: 'Classic Razorpay tension. They\'ll watch your tone, not the answer.' },
          ].map((r, i) => (
            <li key={i} style={{ borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule)', padding: '16px 0' }}>
              <div className="serif" style={{ fontSize: 19, lineHeight: 1.3, color: 'var(--ink)', marginBottom: 6 }}>
                <span className="serif-it" style={{ color: 'var(--ink-mute)', marginRight: 10 }}>0{i+1}.</span>
                {r.q}
              </div>
              <div className="serif-it" style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, marginLeft: 30 }}>{r.why}</div>
            </li>
          ))}
        </ol>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="r-card-flat" style={{ padding: 18 }}>
          <div className="eyebrow-ink" style={{ marginBottom: 10 }}>Research checklist</div>
          {[
            { t: 'Q4 earnings call · merchant churn slide',     done: true },
            { t: 'Priya\'s talk at MoneyConf 2024',              done: true },
            { t: 'Read 2 recent Razorpay blog posts on UPI 2.0', done: false },
            { t: 'Skim G2 reviews · reasons merchants leave',    done: false },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--rule-soft)', fontSize: 13 }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, border: '1px solid var(--ink)', background: c.done ? 'var(--ink)' : 'transparent', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {c.done && <Icon.check />}
              </span>
              <span style={{ color: c.done ? 'var(--ink-mute)' : 'var(--ink-2)', textDecoration: c.done ? 'line-through' : 'none' }}>{c.t}</span>
            </div>
          ))}
        </div>
        <div className="r-card-flat" style={{ padding: 18, background: 'var(--terra-wash)', borderColor: 'var(--terra-soft)' }}>
          <div className="eyebrow-ink" style={{ color: 'var(--terra-deep)', marginBottom: 8 }}>Ask them</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.65, color: 'var(--ink-2)' }}>
            <li>"What's the merchant story you wish more candidates asked about?"</li>
            <li>"How does the Payments PM team disagree well?"</li>
            <li>"What does success look like at month nine, not month one?"</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function Notes() {
  const [val, setVal] = React.useState('Priya was direct. Liked that. She seemed to want me to push back on the "scale" question — next time, do.');
  return (
    <>
      <div>
        <h2 className="serif" style={{ fontSize: 36, lineHeight: 1.05, margin: '0 0 6px', letterSpacing: '-0.018em' }}>
          My <span style={{ fontStyle: 'italic' }}>notes.</span>
        </h2>
        <div className="eyebrow" style={{ marginBottom: 18 }}>Just yours · never sent to them · plain text</div>
        <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={10}
          style={{
            width: '100%', border: 'none', background: 'var(--card-raised)',
            padding: 22, borderRadius: 12,
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 18, lineHeight: 1.55, color: 'var(--ink-2)',
            resize: 'none', outline: 'none', boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(60,40,20,0.04)',
          }} />
      </div>
      <div className="r-card-flat" style={{ padding: 18, alignSelf: 'start' }}>
        <div className="eyebrow-ink" style={{ marginBottom: 8 }}>Earlier notes</div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li style={{ paddingBottom: 10, borderBottom: '1px solid var(--rule-soft)' }}>
            <div className="eyebrow">May 2 · pre-screen</div>
            <p className="serif-it" style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '4px 0 0', lineHeight: 1.5 }}>
              "Recruiter said TC band is 65–80L. Workable. They were the first this month not to flinch at the number."
            </p>
          </li>
          <li>
            <div className="eyebrow">Apr 28 · application</div>
            <p className="serif-it" style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '4px 0 0', lineHeight: 1.5 }}>
              "Applied at 9pm. Tailored the cover paragraph around UPI 2.0. Don't apply tired again."
            </p>
          </li>
        </ul>
      </div>
    </>
  );
}

Object.assign(window, { ApplicationCard });
