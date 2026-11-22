// Hive Console — screens 2 (passes + scanner, chat, onboarding)
const { useState: useD2, useEffect: useDE2, useRef: useDR2 } = React;

// ══ PASSES (approval queue + scanner) ═════════════════════════
function PassesConsoleScreen() {
  const [mode, setMode] = useD2("QUEUE");
  return (
    <React.Fragment>
      <CHeader title="PASSES" sub="approve requests · scan at the door"
        action={<div style={{ display: "flex", border: "1px solid var(--border-hairline)" }}>
          {["QUEUE", "SCANNER"].map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} style={{ appearance: "none", cursor: "pointer", border: "none", background: m === mode ? "var(--accent-primary-wash)" : "transparent", color: m === mode ? "var(--accent-primary)" : "var(--text-secondary)", fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", padding: "10px 18px" }}>{m}</button>
          ))}
        </div>} />
      <Body>{mode === "QUEUE" ? <PassQueue /> : <Scanner />}</Body>
    </React.Fragment>
  );
}

function PassQueue() {
  const cols = [
    { label: "Member", w: "1.4fr" }, { label: "Event", w: "1.4fr" }, { label: "Rating", w: "0.8fr", align: "right" },
    { label: "Requested", w: "0.9fr", align: "right" }, { label: "", w: "1.6fr", align: "right" },
  ];
  return (
    <React.Fragment>
      <div style={{ display: "flex", gap: "var(--sp-md)", marginBottom: "var(--sp-lg)" }}>
        <CBtn variant="primary" size="sm">APPROVE ALL ≥ 70%</CBtn>
        <CBtn variant="ghost" size="sm">EXPORT</CBtn>
      </div>
      <Table cols={cols}>
        {CONSOLE.passRequests.map((r) => (
          <Row key={r.id} cols={cols} cells={[
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><CAvatar name={r.member} size={28} /><span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{r.member}</span></div>,
            cellText(r.event, { color: "var(--text-secondary)", upper: true }),
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", color: r.rating >= 70 ? "var(--accent-primary)" : "var(--text-secondary)" }}>{r.rating}%</span>,
            cellText(r.requestedAt, { color: "var(--text-dim)", size: "var(--fs-xs)" }),
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}><CBtn variant="solid" size="sm">APPROVE</CBtn><CBtn variant="ghost" size="sm">DECLINE</CBtn></div>,
          ]} />
        ))}
      </Table>
    </React.Fragment>
  );
}

function Scanner() {
  const [scanned, setScanned] = useD2(false);
  useDE2(() => { const t = setTimeout(() => setScanned(true), 1400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-xl)", alignItems: "center", maxWidth: 820, margin: "0 auto", paddingTop: "var(--sp-xl)" }}>
      {/* viewport */}
      <div style={{ position: "relative", aspectRatio: "1 / 1", border: "1px solid var(--border-hairline)", background: "var(--surface-card)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 24, border: "1px solid var(--border-glow)" }} />
        {/* bracket corners */}
        {[["tl", { top: 16, left: 16, borderTop: "2px solid", borderLeft: "2px solid" }], ["tr", { top: 16, right: 16, borderTop: "2px solid", borderRight: "2px solid" }], ["bl", { bottom: 16, left: 16, borderBottom: "2px solid", borderLeft: "2px solid" }], ["br", { bottom: 16, right: 16, borderBottom: "2px solid", borderRight: "2px solid" }]].map(([k, s]) => <span key={k} style={{ position: "absolute", width: 22, height: 22, borderColor: "var(--accent-primary)", ...s }} />)}
        <div style={{ position: "absolute", left: 24, right: 24, height: 2, background: "var(--accent-primary)", boxShadow: "var(--glow-green-md)", animation: "scan-line 1.6s linear infinite" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)", position: "absolute", bottom: 28 }}>CAM · DOOR_01</span>
      </div>
      {/* result */}
      <div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-extra-wide)", textTransform: "uppercase", color: "var(--text-secondary)", margin: "0 0 var(--sp-md)" }}>// LAST SCAN</p>
        {!scanned ? (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-md)", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)" }}>awaiting code…</p>
        ) : (
          <div className="hive-pop">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "var(--sp-md)" }}>
              <span style={{ width: 10, height: 10, background: "var(--accent-primary)", boxShadow: "var(--glow-green-md)" }} />
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xl)", letterSpacing: "var(--ls-wide)", color: "var(--accent-primary)" }}>ADMIT</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "var(--sp-md)", border: "1px solid var(--accent-primary)", background: "var(--accent-primary-wash)" }}>
              <CAvatar name="@cybernaut" size={40} glow />
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-md)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)", margin: 0 }}>@cybernaut</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-wide)", margin: "3px 0 0" }}>HIVE-2K7-X9F4 · 1 ENTRY</p>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "var(--sp-md) 0 0" }}>monolith · checked in 00:07</p>
            <div style={{ marginTop: "var(--sp-lg)" }}><CBtn variant="ghost" size="sm" onClick={() => setScanned(false)}>SCAN NEXT</CBtn></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══ CHAT (organizer side, 1:1 with members) ═══════════════════
function ChatConsoleScreen() {
  const [active, setActive] = useD2(CONSOLE.chats[0].id);
  const ch = CONSOLE.chats.find((c) => c.id === active);
  return (
    <React.Fragment>
      <CHeader title="CHAT" sub="direct line with your members" />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* thread list */}
        <div style={{ width: 280, flex: "none", borderRight: "1px solid var(--border-hairline)", overflowY: "auto" }}>
          {CONSOLE.chats.map((c) => {
            const on = c.id === active;
            return (
              <div key={c.id} onClick={() => setActive(c.id)} style={{ display: "flex", gap: 12, padding: "16px 18px", borderBottom: "0.5px solid var(--border-hairline)", cursor: "pointer", background: on ? "var(--accent-primary-wash)" : "transparent", position: "relative" }}>
                {on && <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--accent-primary)" }} />}
                <CAvatar name={c.member} size={38} glow={c.unread > 0} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)" }}>{c.member}</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "var(--text-dim)" }}>{c.lastTime}</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMessage}</p>
                </div>
                {c.unread > 0 ? <span style={{ width: 7, height: 7, flex: "none", background: "var(--accent-primary)", boxShadow: "var(--glow-green-sm)", marginTop: 6 }} /> : null}
              </div>
            );
          })}
        </div>
        {/* thread */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: "1px solid var(--border-hairline)" }}>
            <CAvatar name={ch.member} size={34} />
            <div>
              <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-md)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)", margin: 0 }}>{ch.member}</p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "9px", letterSpacing: "var(--ls-wide)", color: "var(--accent-primary)", margin: "2px 0 0" }}>● MEMBER · VOID</p>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {ch.messages.map((m, i) => {
              const mine = m.from === "me";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", marginBottom: "var(--sp-md)" }}>
                  <div style={{ maxWidth: "70%", padding: "10px 14px", border: mine ? "1px solid var(--accent-primary)" : "0.5px solid var(--border-hairline)", background: mine ? "var(--accent-primary-wash)" : "var(--surface-card)" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-primary)", lineHeight: "var(--lh-body)", margin: 0 }}>{m.text}</p>
                  </div>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)", marginTop: 4 }}>{m.time}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "var(--sp-md)", alignItems: "center", padding: "16px 24px", borderTop: "1px solid var(--border-hairline)" }}>
            <input placeholder="reply to member..." style={{ flex: 1, background: "transparent", border: "none", borderBottom: "1px solid var(--border-hairline)", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-primary)", padding: "8px 0" }} />
            <CBtn variant="primary" size="sm">SEND</CBtn>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

// ══ ONBOARDING — create collective ════════════════════════════
function OnboardingConsole({ onDone }) {
  const [step, setStep] = useD2(0);
  const steps = ["ACCOUNT", "COLLECTIVE", "IMPORT"];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", zIndex: 5 }}>
      <Scanlines />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: 460, maxWidth: "100%" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "center", marginBottom: "var(--sp-sm)" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xl)", letterSpacing: "var(--ls-extra-wide)", color: "var(--text-primary)", textShadow: "var(--text-glow-green)" }}>HIVE</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--text-secondary)" }}>CONSOLE</span>
          </div>
          {/* step indicator */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: "var(--sp-xl)" }}>
            {steps.map((s, i) => <span key={s} style={{ width: 28, height: 3, background: i <= step ? "var(--accent-primary)" : "var(--border-hairline)", boxShadow: i <= step ? "var(--glow-green-sm)" : "none" }} />)}
          </div>

          <div style={{ border: "1px solid var(--border-hairline)", background: "var(--surface-card)", padding: "28px" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-extra-wide)", textTransform: "uppercase", color: "var(--accent-primary)", margin: "0 0 var(--sp-lg)" }}>// {steps[step]} · {step + 1} OF 3</p>

            {step === 0 && <React.Fragment>
              <OField label="ORGANIZER EMAIL" placeholder="you@collective.xyz" />
              <OField label="PASSWORD" placeholder="••••••••" />
              <OField label="DISPLAY HANDLE" placeholder="@void.admin" />
            </React.Fragment>}
            {step === 1 && <React.Fragment>
              <OField label="COLLECTIVE NAME" placeholder="VOID" />
              <OField label="HANDLE" placeholder="@void.collective" />
              <OField label="CITY" placeholder="seattle" />
              <OField label="GENRES" placeholder="hard techno, industrial" />
            </React.Fragment>}
            {step === 2 && <React.Fragment>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", lineHeight: "var(--lh-body)", margin: "0 0 var(--sp-lg)" }}>seed your collective with existing members. upload historic attendee data — hive matches it to accounts and builds the taste graph. you can skip and do this later.</p>
              <div style={{ border: "1px dashed var(--border-hairline)", padding: "28px", textAlign: "center", marginBottom: "var(--sp-lg)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)", margin: 0 }}>DROP .CSV — handles, emails, history</p>
              </div>
            </React.Fragment>}

            <div style={{ display: "flex", gap: "var(--sp-sm)", marginTop: "var(--sp-xl)" }}>
              {step > 0 && <CBtn variant="ghost" onClick={() => setStep(step - 1)}>BACK</CBtn>}
              <CBtn variant="solid" style={{ flex: 1 }} onClick={() => (step < 2 ? setStep(step + 1) : onDone())}>{step < 2 ? "CONTINUE" : "ENTER CONSOLE"}</CBtn>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)", textAlign: "center", margin: "var(--sp-lg) 0 0" }}>invite-only platform · collectives are vetted before launch</p>
        </div>
      </div>
    </div>
  );
}
function OField({ label, placeholder }) {
  return (
    <div style={{ marginBottom: "var(--sp-lg)" }}>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-extra-wide)", textTransform: "uppercase", color: "var(--accent-secondary)", margin: "0 0 8px" }}>{label}</p>
      <input placeholder={placeholder} style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", borderBottom: "1px solid var(--border-hairline)", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-primary)", padding: "8px 0" }} />
    </div>
  );
}

Object.assign(window, { PassesConsoleScreen, ChatConsoleScreen, OnboardingConsole });
