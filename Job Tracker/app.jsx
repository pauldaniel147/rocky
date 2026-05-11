// app.jsx — DesignCanvas wiring. Each screen sits inside a ChromeWindow
// inside a DCArtboard so the canvas reads as a developer-handoff sheet.

const FRAME_W = 1280;
const FRAME_H = 820;

function Frame({ url = 'rocky.app', tab = 'Rocky', children }) {
  return (
    <ChromeWindow
      width={FRAME_W} height={FRAME_H}
      tabs={[{ title: tab }]}
      activeIndex={0}
      url={url}
    >
      <div style={{ height: '100%' }}>{children}</div>
    </ChromeWindow>
  );
}

function App() {
  return (
    <DesignCanvas minScale={0.05} maxScale={2}>

      <DCSection id="daily" title="I · Daily Digest" subtitle="The emotional spine. Opens every morning, closes every night.">
        <DCArtboard id="daily-morning" label="Morning state · 7:42 AM" width={FRAME_W} height={FRAME_H}>
          <Frame url="rocky.app/today" tab="Rocky · Today">
            <DailyDigest />
          </Frame>
        </DCArtboard>
        <DCArtboard id="daily-evening" label="Evening check-in · 7:18 PM" width={FRAME_W} height={FRAME_H}>
          <Frame url="rocky.app/today" tab="Rocky · Today">
            <DailyDigest evening />
          </Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="prescreen" title="II · Pre-Screen" subtitle="Should I apply? AI verdict before the JD enters her pipeline.">
        <DCArtboard id="prescreen-1" label="Verdict · Apply with caution" width={FRAME_W} height={FRAME_H}>
          <Frame url="rocky.app/pre-screen" tab="Rocky · Pre-Screen">
            <PreScreen />
          </Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="pipeline" title="III · Pipeline Board" subtitle="Drag-and-drop kanban. Stale cards subtly flag themselves. Terminal columns visually separated.">
        <DCArtboard id="pipeline-1" label="Pipeline · drag to update" width={FRAME_W} height={FRAME_H}>
          <Frame url="rocky.app/pipeline" tab="Rocky · Pipeline">
            <Pipeline />
          </Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="application" title="IV · Application Card" subtitle="Expanded view. AI pre-populates positioning, ask script, follow-up draft, prep — she just edits.">
        <DCArtboard id="application-1" label="Razorpay · Sr. PM, Payments" width={FRAME_W} height={FRAME_H}>
          <Frame url="rocky.app/pipeline/razorpay" tab="Rocky · Razorpay">
            <ApplicationCard />
          </Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="coach" title="V · Coach Chat" subtitle="A briefed advisor — knows her pipeline, preferences, check-in history. Never generic.">
        <DCArtboard id="coach-1" label="Should I focus on Razorpay?" width={FRAME_W} height={FRAME_H}>
          <Frame url="rocky.app/coach" tab="Rocky · Coach">
            <Coach />
          </Frame>
        </DCArtboard>
      </DCSection>

      <DCSection id="dashboard" title="VI · Weekly Dashboard" subtitle="Honest read on the week. Not a wall of numbers — a paragraph, then the data.">
        <DCArtboard id="dashboard-1" label="Week of May 5" width={FRAME_W} height={FRAME_H}>
          <Frame url="rocky.app/dashboard" tab="Rocky · Dashboard">
            <Dashboard />
          </Frame>
        </DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
