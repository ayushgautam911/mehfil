// Hive Console — screens (dashboard, members & invitations, events)
const { useState: useD, useRef: useDR } = React;

// ══ DASHBOARD ═════════════════════════════════════════════════
function DashboardScreen({ onNav }) {
  const m = CONSOLE.metrics;
  return (
    <React.Fragment>
      <CHeader title="DASHBOARD" sub={`${CONSOLE.collective.handle} · ${CONSOLE.collective.location}`}
        action={<CBtn variant="solid" onClick={() => onNav("EVENTS")}>+ NEW EVENT</CBtn>} />
      <Body>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-md)", marginBottom: "var(--sp-xl)" }}>
          <Metric value={m.members} label="Members" sub={`+${m.newThisMonth} this month`} accent />
          <Metric value={m.pendingApplications} label="Pending applications" sub="awaiting screening" />
          <Metric value={m.passRequests} label="Pass requests" sub="across open events" />
          <Metric value={m.upcomingEvents} label="Upcoming events" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--sp-lg)" }}>
          <Panel title="Recent activity">
            {CONSOLE.activity.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", padding: "10px 0", borderBottom: i < CONSOLE.activity.length - 1 ? "0.5px solid var(--border-hairline)" : "none" }}>
                <span style={{ width: 6, height: 6, flex: "none", background: a.kind === "block" ? "var(--text-dim)" : a.kind === "application" ? "var(--accent-secondary)" : "var(--accent-primary)" }} />
                <span style={{ flex: 1, fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-normal)", color: "var(--text-primary)" }}>{a.text}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)" }}>{a.time}</span>
              </div>
            ))}
          </Panel>

          <Panel title="Audience" action={<span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", letterSpacing: "var(--ls-wide)", color: "var(--text-dim)" }}>AGGREGATED · ANONYMIZED</span>}>
            <Bar label="Returning" pct={m.returningRate} />
            <Bar label="New" pct={100 - m.returningRate} />
            <div style={{ height: 1, background: "var(--border-hairline)", margin: "14px 0" }} />
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-extra-wide)", color: "var(--accent-primary)", margin: "0 0 12px" }}>// TOP FREQUENCIES</p>
            <Bar label="hard techno" pct={45} />
            <Bar label="acid" pct={30} />
            <Bar label="industrial" pct={25} />
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", lineHeight: "var(--lh-body)", margin: "16px 0 0" }}>hive never exposes individual member data. you only ever see aggregated, anonymized signals.</p>
          </Panel>
        </div>
      </Body>
    </React.Fragment>
  );
}
function Bar({ label, pct }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", marginBottom: 10 }}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", textTransform: "uppercase", color: "var(--text-primary)", letterSpacing: "var(--ls-normal)", width: 92, flex: "none" }}>{label}</span>
      <span style={{ flex: 1, height: 2, background: "var(--border-hairline)" }}><span style={{ display: "block", height: 2, width: `${pct}%`, background: "var(--accent-primary)" }} /></span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--accent-primary)", width: 34, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

// ══ MEMBERS & INVITATIONS ═════════════════════════════════════
function MembersScreen() {
  const [tab, setTab] = useD("APPLICATIONS");
  const tabs = ["APPLICATIONS", "MEMBERS", "INVITATIONS"];
  return (
    <React.Fragment>
      <CHeader title="MEMBERSHIP" sub="screen applicants · manage members · control invitations" />
      <div style={{ display: "flex", gap: "var(--sp-xl)", padding: "0 32px", borderBottom: "1px solid var(--border-hairline)" }}>
        {tabs.map((t) => {
          const on = t === tab;
          const count = t === "APPLICATIONS" ? CONSOLE.applications.length : t === "MEMBERS" ? CONSOLE.members.length : null;
          return (
            <button key={t} type="button" onClick={() => setTab(t)} style={{ appearance: "none", background: "none", cursor: "pointer", border: "none", borderBottom: on ? "2px solid var(--accent-primary)" : "2px solid transparent", padding: "14px 0", fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: on ? "var(--accent-primary)" : "var(--text-secondary)" }}>
              {t}{count != null ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>
      <Body>
        {tab === "APPLICATIONS" && <Applications />}
        {tab === "MEMBERS" && <MembersTable />}
        {tab === "INVITATIONS" && <Invitations />}
      </Body>
    </React.Fragment>
  );
}

function Applications() {
  return (
    <React.Fragment>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", margin: "0 0 var(--sp-lg)", lineHeight: "var(--lh-body)" }}>each applicant traces back to a member who invited them. review the chain and shared taste before admitting.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-md)" }}>
        {CONSOLE.applications.map((a) => (
          <div key={a.id} style={{ border: "1px solid var(--border-hairline)", background: "var(--surface-card)", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", marginBottom: "var(--sp-md)" }}>
              <CAvatar name={a.handle} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-md)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)", margin: 0 }}>{a.handle}</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "3px 0 0" }}>invited by <span style={{ color: "var(--accent-primary)" }}>{a.invitedBy}</span> · {a.appliedDate}</p>
              </div>
              <div style={{ textAlign: "right", flex: "none" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-lg)", color: "var(--accent-primary)", margin: 0 }}>{a.sharedTaste}%</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "9px", letterSpacing: "var(--ls-wide)", color: "var(--accent-primary)", opacity: 0.6, margin: 0 }}>SHARED</p>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-xs)", marginBottom: a.note ? "var(--sp-md)" : "var(--sp-lg)" }}>
              {a.genres.map((g) => <span key={g} style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--accent-secondary)", border: "1px solid var(--border-hairline)", padding: "2px 7px" }}>{g}</span>)}
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--text-dim)", alignSelf: "center" }}>· {a.mutuals} mutuals</span>
            </div>
            {a.note ? <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", fontStyle: "italic", margin: "0 0 var(--sp-lg)" }}>“{a.note}”</p> : null}
            <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
              <CBtn variant="solid" size="sm" style={{ flex: 1 }}>ADMIT</CBtn>
              <CBtn variant="ghost" size="sm" style={{ flex: 1 }}>DECLINE</CBtn>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}

function MembersTable() {
  const cols = [
    { label: "Member", w: "1.6fr" }, { label: "Joined", w: "1fr" }, { label: "Events", w: "0.7fr", align: "right" },
    { label: "Rating", w: "0.9fr", align: "right" }, { label: "Invites", w: "0.8fr", align: "right" },
    { label: "Status", w: "0.9fr" }, { label: "", w: "1.3fr", align: "right" },
  ];
  return (
    <Table cols={cols}>
      {CONSOLE.members.map((m) => (
        <Row key={m.id} cols={cols} dim={m.status === "blocked"} cells={[
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><CAvatar name={m.handle} size={28} /><span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{m.handle}</span></div>,
          cellText(m.joined, { color: "var(--text-secondary)" }),
          cellText(m.events),
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", color: m.rating >= 70 ? "var(--accent-primary)" : "var(--text-secondary)" }}>{m.rating}%</span>,
          cellText(m.invites, { color: "var(--text-secondary)" }),
          <CStatus status={m.status} />,
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            {m.status === "blocked"
              ? <CBtn variant="ghost" size="sm">UNBLOCK</CBtn>
              : <React.Fragment><CBtn variant="ghost" size="sm">MESSAGE</CBtn><CBtn variant="danger" size="sm">BLOCK</CBtn></React.Fragment>}
          </div>,
        ]} />
      ))}
    </Table>
  );
}

function Invitations() {
  const s = CONSOLE.invitationSettings;
  const [enabled, setEnabled] = useD(s.invitationsEnabled);
  const [auto, setAuto] = useD(s.autoApprove);
  const [limit, setLimit] = useD(s.perMemberPerEvent);
  const Toggle = ({ on, set }) => (
    <button type="button" onClick={() => set(!on)} style={{ appearance: "none", cursor: "pointer", width: 44, height: 24, padding: 2, flex: "none", border: `1px solid ${on ? "var(--accent-primary)" : "var(--border-hairline)"}`, background: on ? "var(--accent-primary-wash)" : "transparent", display: "flex", justifyContent: on ? "flex-end" : "flex-start", alignItems: "center" }}>
      <span style={{ width: 16, height: 16, background: on ? "var(--accent-primary)" : "var(--text-dim)", boxShadow: on ? "var(--glow-green-sm)" : "none" }} />
    </button>
  );
  const SettingRow = ({ title, desc, right, last }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--sp-lg)", padding: "16px 0", borderBottom: last ? "none" : "0.5px solid var(--border-hairline)" }}>
      <div>
        <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-md)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-primary)", margin: 0 }}>{title}</p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", margin: "4px 0 0", maxWidth: 420, lineHeight: "var(--lh-body)" }}>{desc}</p>
      </div>
      {right}
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--sp-lg)", alignItems: "start" }}>
      <Panel title="Invitation controls">
        <SettingRow title="Invitations enabled" desc="when off, no member can invite anyone — the collective is sealed." right={<Toggle on={enabled} set={setEnabled} />} />
        <SettingRow title="Auto-approve invited members" desc="skip screening for people invited by trusted members. applications still queue when off." right={<Toggle on={auto} set={setAuto} />} />
        <SettingRow title="Invite limit · per member / event" desc="how many guests each member may bring to a single event." last
          right={<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setLimit(Math.max(0, limit - 1))} style={stepBtn}>−</button>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-lg)", color: "var(--accent-primary)", width: 24, textAlign: "center" }}>{limit}</span>
            <button onClick={() => setLimit(limit + 1)} style={stepBtn}>+</button>
          </div>} />
      </Panel>
      <Panel title="Invite a member" action={<span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", letterSpacing: "var(--ls-wide)", color: "var(--text-dim)" }}>DIRECT</span>}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-extra-wide)", textTransform: "uppercase", color: "var(--accent-secondary)", margin: "0 0 8px" }}>HANDLE OR EMAIL</p>
        <input placeholder="@handle" style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", borderBottom: "1px solid var(--border-hairline)", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-primary)", padding: "8px 0", marginBottom: "var(--sp-lg)" }} />
        <CBtn variant="primary" style={{ width: "100%" }}>SEND INVITE — AUTO APPROVE</CBtn>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", lineHeight: "var(--lh-body)", margin: "14px 0 0" }}>directly invited members bypass the application queue and join immediately.</p>
      </Panel>
    </div>
  );
}
const stepBtn = { appearance: "none", cursor: "pointer", width: 28, height: 28, border: "1px solid var(--border-hairline)", background: "transparent", color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: "var(--fs-lg)", lineHeight: 1 };

// ══ EVENTS ════════════════════════════════════════════════════
function EventsScreen() {
  const [creating, setCreating] = useD(false);
  if (creating) return <CreateEvent onBack={() => setCreating(false)} />;
  const cols = [
    { label: "Event", w: "1.8fr" }, { label: "Date", w: "1.1fr" }, { label: "Capacity", w: "0.9fr", align: "right" },
    { label: "Passes", w: "0.9fr", align: "right" }, { label: "Requests", w: "0.9fr", align: "right" }, { label: "Status", w: "0.9fr" },
  ];
  return (
    <React.Fragment>
      <CHeader title="EVENTS" sub={`${CONSOLE.events.length} total · ${CONSOLE.events.filter((e) => e.status === "published").length} live`}
        action={<CBtn variant="solid" onClick={() => setCreating(true)}>+ NEW EVENT</CBtn>} />
      <Body>
        <Table cols={cols}>
          {CONSOLE.events.map((e) => (
            <Row key={e.id} cols={cols} dim={e.status === "draft"} cells={[
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{e.name}</span>,
              cellText(`${e.date} · ${e.time}`, { color: "var(--text-secondary)" }),
              cellText(e.capacity),
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--accent-primary)" }}>{e.passesIssued}</span>,
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: e.requests ? "var(--accent-secondary)" : "var(--text-dim)" }}>{e.requests}</span>,
              <CStatus status={e.status} />,
            ]} />
          ))}
        </Table>
      </Body>
    </React.Fragment>
  );
}

function CreateEvent({ onBack }) {
  const Field = ({ label, placeholder, full }) => (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-extra-wide)", textTransform: "uppercase", color: "var(--accent-secondary)", margin: "0 0 8px" }}>{label}</p>
      <input placeholder={placeholder} style={{ width: "100%", boxSizing: "border-box", background: "transparent", border: "none", borderBottom: "1px solid var(--border-hairline)", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-primary)", padding: "8px 0" }} />
    </div>
  );
  return (
    <React.Fragment>
      <CHeader title="NEW EVENT" sub="draft — publish when ready"
        action={<div style={{ display: "flex", gap: "var(--sp-sm)" }}><CBtn variant="ghost" onClick={onBack}>CANCEL</CBtn><CBtn variant="solid" onClick={onBack}>PUBLISH</CBtn></div>} />
      <Body>
        <div style={{ maxWidth: 760 }}>
          <Panel title="Details">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-lg)" }}>
              <Field label="Event name" placeholder="void: warehouse session" full />
              <Field label="Date" placeholder="sat apr 26" />
              <Field label="Doors" placeholder="23:00" />
              <Field label="Venue (hidden until reveal)" placeholder="warehouse — district 2" full />
              <Field label="Capacity" placeholder="200" />
              <Field label="Address reveal" placeholder="3 hrs before doors" />
            </div>
          </Panel>
          <div style={{ height: "var(--sp-lg)" }} />
          <Panel title="Access & visibility">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-lg)" }}>
              <Field label="Lineup" placeholder="charlotte de witte, kobosil" full />
              <Field label="Genres" placeholder="hard techno, industrial" full />
            </div>
            <div style={{ display: "flex", gap: "var(--sp-lg)", marginTop: "var(--sp-lg)", flexWrap: "wrap" }}>
              <Pill label="PRIVATE — INVITE ONLY" on />
              <Pill label="REQUIRE PASS APPROVAL" on />
              <Pill label="OPEN TO ALL MEMBERS" />
            </div>
          </Panel>
        </div>
      </Body>
    </React.Fragment>
  );
}
function Pill({ label, on }) {
  return <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: on ? "var(--accent-primary)" : "var(--text-secondary)", border: `1px solid ${on ? "var(--accent-primary)" : "var(--border-hairline)"}`, background: on ? "var(--accent-primary-wash)" : "transparent", padding: "8px 14px", cursor: "pointer" }}>{label}</span>;
}

Object.assign(window, { DashboardScreen, MembersScreen, EventsScreen });
