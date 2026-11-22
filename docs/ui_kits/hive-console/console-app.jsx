// Hive Console — app shell, settings/profile screen, nav, viewport scaler
const { useState: useA, useEffect: useAE } = React;

// ══ SETTINGS / COLLECTIVE PROFILE (incl. history import) ══════
function SettingsScreen() {
  const c = CONSOLE.collective;
  const Field = ({ label, value, full }) => (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-extra-wide)", textTransform: "uppercase", color: "var(--accent-secondary)", margin: "0 0 8px" }}>{label}</p>
      <input defaultValue={value} style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", borderBottom: "1px solid var(--border-hairline)", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-primary)", padding: "8px 0" }} />
    </div>
  );
  return (
    <React.Fragment>
      <CHeader title="SETTINGS" sub="collective profile · data · members"
        action={<CBtn variant="solid">SAVE</CBtn>} />
      <Body>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--sp-lg)", alignItems: "start", maxWidth: 980 }}>
          <Panel title="Collective profile">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", marginBottom: "var(--sp-lg)" }}>
              <CAvatar name={c.name} size={56} glow />
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xl)", letterSpacing: "var(--ls-extra-wide)", color: "var(--text-primary)", margin: 0 }}>{c.name}</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--text-secondary)", margin: "4px 0 0" }}>FOUNDED {c.founded} · {c.members} MEMBERS</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-lg)" }}>
              <Field label="Name" value={c.name} />
              <Field label="Handle" value={c.handle} />
              <Field label="City" value={c.location} />
              <Field label="Genres" value="hard techno, industrial" />
              <Field label="Bio" value="warehouse techno. no phones on the floor." full />
            </div>
          </Panel>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
            <Panel title="History data">
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", lineHeight: "var(--lh-body)", margin: "0 0 var(--sp-md)" }}>upload historic attendee data to seed members and sharpen matching.</p>
              <div style={{ border: "1px dashed var(--border-hairline)", padding: "22px", textAlign: "center", marginBottom: "var(--sp-md)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)", margin: 0 }}>DROP .CSV</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-wide)" }}>LAST IMPORT · 240 ROWS</span>
                <CStatus status="synced" />
              </div>
            </Panel>
            <Panel title="Danger zone">
              <CBtn variant="danger" style={{ width: "100%" }}>DISABLE ALL INVITATIONS</CBtn>
              <div style={{ height: "var(--sp-sm)" }} />
              <CBtn variant="danger" style={{ width: "100%" }}>ARCHIVE COLLECTIVE</CBtn>
            </Panel>
          </div>
        </div>
      </Body>
    </React.Fragment>
  );
}

// ══ APP SHELL ═════════════════════════════════════════════════
const NAV = ["DASHBOARD", "EVENTS", "MEMBERSHIP", "PASSES", "CHAT", "SETTINGS"];

function ConsoleApp() {
  const [onboarded, setOnboarded] = useA(true); // set false to see create-collective flow
  const [active, setActive] = useA("DASHBOARD");

  const badges = {
    MEMBERSHIP: CONSOLE.applications.length,
    PASSES: CONSOLE.passRequests.length,
    CHAT: CONSOLE.chats.filter((c) => c.unread > 0).length || null,
  };

  if (!onboarded) {
    return <div style={{ height: "100%", background: "var(--surface-page)", position: "relative", overflow: "hidden" }}><OnboardingConsole onDone={() => setOnboarded(true)} /></div>;
  }

  let screen;
  if (active === "DASHBOARD") screen = <DashboardScreen onNav={setActive} />;
  else if (active === "EVENTS") screen = <EventsScreen />;
  else if (active === "MEMBERSHIP") screen = <MembersScreen />;
  else if (active === "PASSES") screen = <PassesConsoleScreen />;
  else if (active === "CHAT") screen = <ChatConsoleScreen />;
  else screen = <SettingsScreen />;

  return (
    <div style={{ height: "100%", display: "flex", background: "var(--surface-page)", position: "relative", overflow: "hidden" }}>
      <Sidebar active={active} onNav={setActive} nav={NAV} badges={badges} />
      <div key={active} className="hive-fade" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {screen}
      </div>
    </div>
  );
}

// ── Viewport scaler: fixed-size ChromeWindow letterboxed to fit ──
const CANVAS_W = 1320, CANVAS_H = 856;
function Root() {
  const [scale, setScale] = useA(1);
  useAE(() => {
    const fit = () => {
      const pad = 32;
      setScale(Math.min((window.innerWidth - pad) / CANVAS_W, (window.innerHeight - pad) / CANVAS_H, 1));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#08080a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})`, transformOrigin: "center" }}>
        <ChromeWindow width={CANVAS_W} height={CANVAS_H} url="console.hive.xyz/void" tabs={[{ title: "HIVE CONSOLE — VOID" }]}>
          <div style={{ width: "100%", height: "100%", background: "var(--surface-page)" }}>
            <ConsoleApp />
          </div>
        </ChromeWindow>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
