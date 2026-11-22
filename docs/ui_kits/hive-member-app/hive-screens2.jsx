// Hive member-app — feature screens (passes, collectives, chat, history, preferences)
const { useState: useS2, useEffect: useE2, useRef: useR2 } = React;

const sec2 = { marginTop: "var(--sp-xl)", marginBottom: "var(--sp-md)" };
function H1Screen({ children }) {
  return <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xxl)", color: "var(--text-primary)", letterSpacing: "var(--ls-extra-wide)", margin: "var(--sp-md) 0 var(--sp-lg)" }}>{children}</h1>;
}
function Switch({ on, onToggle }) {
  return (
    <button type="button" onClick={onToggle} style={{
      appearance: "none", cursor: "pointer", width: 40, height: 22, padding: 2, flex: "none",
      border: `1px solid ${on ? "var(--accent-primary)" : "var(--border-hairline)"}`,
      background: on ? "var(--accent-primary-wash)" : "transparent", borderRadius: 0,
      display: "flex", justifyContent: on ? "flex-end" : "flex-start", alignItems: "center",
    }}>
      <span style={{ width: 14, height: 14, background: on ? "var(--accent-primary)" : "var(--text-dim)", boxShadow: on ? "var(--glow-green-sm)" : "none", transition: "all 120ms" }} />
    </button>
  );
}

// ══ PASSES ════════════════════════════════════════════════════
function PassesScreen({ onOpenPass }) {
  const active = HIVE.passes.filter((p) => p.status === "approved" && !p.isPast);
  const pending = HIVE.passes.filter((p) => p.status === "pending");
  const archive = HIVE.passes.filter((p) => p.isPast || p.status === "declined");
  const Row = ({ p, dim }) => (
    <ListRow dim={dim} onPress={p.status === "approved" && !p.isPast ? () => onOpenPass(p.id) : undefined}
      avatar={<Avatar name={p.collective} size={40} glow={p.status === "approved" && !p.isPast} />}
      title={p.eventName}
      subtitle={`${p.date} · ${p.time} · ${p.collective.toLowerCase()}`}
      right={<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <StatusBadge status={p.status} />
        {p.status === "approved" && !p.isPast ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--accent-primary)" }}>[QR] ›</span> : null}
      </div>} />
  );
  return (
    <Screen>
      <ScreenHeader label="HIVE / PASSES" sub={`${active.length} ACTIVE`} />
      {active.length ? <React.Fragment><SectionLabel style={{ ...sec2, marginTop: "var(--sp-lg)" }}>ACTIVE</SectionLabel>{active.map((p) => <Row key={p.id} p={p} />)}</React.Fragment> : null}
      {pending.length ? <React.Fragment><SectionLabel tone="cyan" style={sec2}>AWAITING APPROVAL</SectionLabel>{pending.map((p) => <Row key={p.id} p={p} />)}</React.Fragment> : null}
      {archive.length ? <React.Fragment><SectionLabel style={sec2}>ARCHIVE</SectionLabel>{archive.map((p) => <Row key={p.id} p={p} dim />)}</React.Fragment> : null}
    </Screen>
  );
}

function PassDetailScreen({ passId, onBack }) {
  const p = HIVE.passes.find((x) => x.id === passId) || HIVE.passes.find((x) => x.status === "approved");
  return (
    <Screen>
      <BackButton label="PASSES" onClick={onBack} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--accent-primary)", letterSpacing: "var(--ls-extra-wide)", margin: "0 0 var(--sp-sm)" }}>[ APPROVED PASS ]</p>
        <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xl)", lineHeight: "var(--lh-snug)", color: "var(--text-primary)", letterSpacing: "var(--ls-wide)", margin: "0 0 var(--sp-sm)", textTransform: "uppercase" }}>{p.eventName}</h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "0 0 var(--sp-xl)" }}>{p.date} · {p.time} · {p.collective.toLowerCase()}</p>

        <CornerFrame color="var(--accent-primary)" size={14} thickness={1.5} padding="var(--sp-lg)">
          <QRBlock code={p.code} size={176} />
        </CornerFrame>

        <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "var(--fs-lg)", color: "var(--accent-primary)", letterSpacing: "var(--ls-wide)", margin: "var(--sp-lg) 0 var(--sp-xs)" }}>{p.code}</p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-wide)", margin: 0, textTransform: "uppercase" }}>{p.entry}</p>
      </div>
      <div style={{ marginTop: "var(--sp-xxl)", borderTop: "0.5px solid var(--border-hairline)", paddingTop: "var(--sp-lg)" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-normal)", lineHeight: "var(--lh-body)", margin: 0 }}>present this code at the door. non-transferable. screenshots are voided — the code rotates.</p>
      </div>
    </Screen>
  );
}

// ══ COLLECTIVES ═══════════════════════════════════════════════
function CollectivesScreen({ onOpen }) {
  const inv = HIVE.pendingInvitations, mine = HIVE.myCollectives, app = HIVE.pendingApplications;
  return (
    <Screen>
      <ScreenHeader label="HIVE / COLLECTIVES" sub={`${mine.length} JOINED`} />
      {inv.length ? (
        <React.Fragment>
          <SectionLabel tone="cyan" style={{ ...sec2, marginTop: "var(--sp-lg)" }}>PENDING INVITATIONS</SectionLabel>
          {inv.map((c) => (
            <ListRow key={c.id} onPress={() => onOpen(c.id)} avatar={<Avatar name={c.name} size={40} glow color="var(--accent-secondary)" />}
              title={c.name} subtitle={`invited by ${c.invitedBy} · ${c.members} members`}
              right={<StatusBadge status="invited" />} />
          ))}
        </React.Fragment>
      ) : null}

      <SectionLabel style={sec2}>YOUR COLLECTIVES</SectionLabel>
      {mine.map((c) => (
        <ListRow key={c.id} onPress={() => onOpen(c.id)} avatar={<Avatar name={c.name} size={40} />}
          title={c.name} subtitle={`${c.handle} · ${c.members} members`}
          right={<span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)" }}>›</span>} />
      ))}

      {app.length ? (
        <React.Fragment>
          <SectionLabel style={sec2}>PENDING APPLICATIONS</SectionLabel>
          {app.map((c) => (
            <ListRow key={c.id} dim onPress={() => onOpen(c.id)} avatar={<Avatar name={c.name} size={40} />}
              title={c.name} subtitle={`applied ${c.appliedDate} · ${c.members} members`}
              right={<StatusBadge status="applied" />} />
          ))}
        </React.Fragment>
      ) : null}

      <div style={{ marginTop: "var(--sp-xxl)", borderTop: "0.5px solid var(--border-hairline)", paddingTop: "var(--sp-lg)" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-normal)", lineHeight: "var(--lh-body)", margin: 0 }}>hive is invite-only. you can't browse collectives — you only see one once a member invites you, or after you're approved.</p>
      </div>
    </Screen>
  );
}

function CollectiveDetailScreen({ collectiveId, onBack, onOpenChat }) {
  const all = [...HIVE.myCollectives, ...HIVE.pendingInvitations, ...HIVE.pendingApplications];
  const c = all.find((x) => x.id === collectiveId) || HIVE.myCollectives[0];
  const events = HIVE.events.filter((e) => e.collective === c.name);
  const isMember = c.status === "member";
  const isInvited = c.status === "invited";
  return (
    <Screen>
      <BackButton label="COLLECTIVES" onClick={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", marginBottom: "var(--sp-lg)" }}>
        <Avatar name={c.name} size={56} glow={isMember} />
        <div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xxl)", color: "var(--text-primary)", letterSpacing: "var(--ls-extra-wide)", margin: 0 }}>{c.name}</h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-wide)", margin: "4px 0 0" }}>{c.handle} · {c.members} MEMBERS · {(c.location || "").toUpperCase()}</p>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-xs)", marginBottom: "var(--sp-lg)" }}>
        {(c.genres || []).map((g) => <Tag key={g} label={g} />)}
        <StatusBadge status={c.status} style={{ alignSelf: "center", marginLeft: "var(--sp-xs)" }} />
      </div>
      {c.about ? <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", lineHeight: "var(--lh-body)", margin: 0 }}>{c.about}</p> : null}

      {isInvited ? (
        <div style={{ marginTop: "var(--sp-xl)" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--accent-secondary)", letterSpacing: "var(--ls-wide)", margin: "0 0 var(--sp-md)" }}>YOU'VE BEEN INVITED TO JOIN</p>
          <GlitchButton title="ACCEPT MEMBERSHIP" />
          <button onClick={onBack} style={{ appearance: "none", background: "none", border: "none", cursor: "pointer", display: "block", width: "100%", textAlign: "center", marginTop: "var(--sp-md)", fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-extra-wide)" }}>DECLINE</button>
        </div>
      ) : isMember ? (
        <React.Fragment>
          <div style={{ display: "flex", gap: "var(--sp-sm)", marginTop: "var(--sp-xl)" }}>
            <GlitchButton title="MESSAGE" onClick={() => onOpenChat(c.name)} />
          </div>
          <SectionLabel style={sec2}>UPCOMING</SectionLabel>
          {events.length ? events.map((e) => (
            <ListRow key={e.id} title={e.name} subtitle={`${e.date} · ${e.time} · ${e.venue}`}
              right={e.passStatus ? <StatusBadge status={e.passStatus} /> : <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)" }}>›</span>} />
          )) : <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-dim)" }}>no events scheduled.</p>}
          <div style={{ marginTop: "var(--sp-xxl)" }}>
            <button style={{ appearance: "none", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-extra-wide)", padding: 0 }}>LEAVE COLLECTIVE</button>
          </div>
        </React.Fragment>
      ) : (
        <div style={{ marginTop: "var(--sp-xl)", border: "1px solid var(--accent-secondary)", padding: "var(--sp-md) var(--sp-xxl)", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-ultra-wide)", color: "var(--accent-secondary)" }}>APPLICATION PENDING</span>
        </div>
      )}
    </Screen>
  );
}

// ══ CHAT ══════════════════════════════════════════════════════
function ChatListScreen({ onOpen }) {
  return (
    <Screen>
      <ScreenHeader label="HIVE / CHAT" sub={`${HIVE.chats.length} THREADS`} />
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-normal)", margin: "var(--sp-md) 0 var(--sp-sm)" }}>direct line to each collective you've joined.</p>
      {HIVE.chats.map((ch) => (
        <ListRow key={ch.id} onPress={() => onOpen(ch.id)} avatar={<Avatar name={ch.collective} size={44} glow={ch.unread > 0} />}
          title={ch.collective}
          subtitle={ch.lastMessage}
          right={<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)" }}>{ch.lastTime}</span>
            {ch.unread > 0 ? <span style={{ width: 7, height: 7, background: "var(--accent-primary)", boxShadow: "var(--glow-green-sm)" }} /> : null}
          </div>} />
      ))}
    </Screen>
  );
}

function ChatThreadScreen({ chatId, collectiveName, onBack }) {
  const ch = HIVE.chats.find((x) => x.id === chatId) || HIVE.chats.find((x) => x.collective === collectiveName) || HIVE.chats[0];
  const scroller = useR2(null);
  useE2(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, []);
  return (
    <div style={{ height: "100%", position: "relative", zIndex: 5, display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ padding: "56px var(--gutter) var(--sp-md)", borderBottom: "0.5px solid var(--border-hairline)", display: "flex", alignItems: "center", gap: "var(--sp-md)", background: "var(--surface-page)" }}>
        <button onClick={onBack} style={{ appearance: "none", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "var(--fs-lg)", padding: 0 }}>←</button>
        <Avatar name={ch.collective} size={36} />
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-md)", color: "var(--text-primary)", letterSpacing: "var(--ls-wide)", margin: 0 }}>{ch.collective}</p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "var(--accent-primary)", letterSpacing: "var(--ls-wide)", margin: "2px 0 0" }}>● COLLECTIVE · DIRECT</p>
        </div>
      </div>
      {/* messages */}
      <div ref={scroller} style={{ flex: 1, overflowY: "auto", padding: "var(--sp-lg) var(--gutter)" }}>
        {ch.messages.map((m, i) => <ChatBubble key={i} from={m.from} text={m.text} time={m.time} />)}
      </div>
      {/* input */}
      <div style={{ padding: "var(--sp-md) var(--gutter) var(--sp-xl)", borderTop: "0.5px solid var(--border-hairline)", display: "flex", alignItems: "center", gap: "var(--sp-md)", background: "var(--surface-page)" }}>
        <input placeholder="message..." style={{ flex: 1, background: "transparent", border: "none", borderBottom: "1px solid var(--border-hairline)", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-primary)", padding: "var(--sp-sm) 0" }} />
        <button style={{ appearance: "none", background: "var(--accent-primary-wash)", border: "1px solid var(--accent-primary)", color: "var(--accent-primary)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", padding: "var(--sp-sm) var(--sp-md)" }}>SEND</button>
      </div>
    </div>
  );
}

// ══ HISTORY ═══════════════════════════════════════════════════
function HistoryScreen({ onBack }) {
  const h = HIVE.history;
  return (
    <Screen>
      <BackButton label="PROFILE" onClick={onBack} />
      <H1Screen>HISTORY</H1Screen>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "0 0 var(--sp-lg)", lineHeight: "var(--lh-body)" }}>hive builds your taste graph from where you've actually been. sync your history to sharpen your feed.</p>

      <SectionLabel>SYNC SOURCES</SectionLabel>
      {h.sources.map((s) => (
        <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-md) 0", borderBottom: "0.5px solid var(--border-hairline)" }}>
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-md)", color: "var(--text-primary)", letterSpacing: "var(--ls-wide)", margin: 0, textTransform: "uppercase" }}>{s.name}</p>
            {s.count ? <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "2px 0 0" }}>{s.count} events imported</p> : null}
          </div>
          {s.status === "synced"
            ? <StatusBadge status="synced" />
            : <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--accent-secondary)", letterSpacing: "var(--ls-wide)", border: "1px solid var(--accent-secondary)", padding: "2px 6px", cursor: "pointer", textTransform: "uppercase" }}>CONNECT</span>}
        </div>
      ))}

      <GlitchButton title="UPLOAD HISTORIC DATA" style={{ marginTop: "var(--sp-lg)" }} />

      <SectionLabel style={sec2}>SYNCED TIMELINE</SectionLabel>
      {h.items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: "var(--sp-md)", padding: "var(--sp-md) 0", borderBottom: "0.5px solid var(--border-hairline)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)", width: 52, flex: "none", paddingTop: 2 }}>{it.date}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-md)", color: "var(--text-primary)", letterSpacing: "var(--ls-wide)", margin: 0, textTransform: "uppercase" }}>{it.name}</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "2px 0 0" }}>{it.collective === "external" ? it.genre : `${it.collective.toLowerCase()} · ${it.genre}`}</p>
          </div>
        </div>
      ))}
    </Screen>
  );
}

// ══ PREFERENCES ═══════════════════════════════════════════════
function PreferencesScreen({ onBack }) {
  const pr = HIVE.preferences;
  const [genres, setGenres] = useS2(pr.genres);
  const [notify, setNotify] = useS2(pr.notify);
  const [privacy, setPrivacy] = useS2(pr.privacy);
  const toggleGenre = (g) => setGenres((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);
  const Toggle = ({ label, val, onSet, desc }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-md) 0", borderBottom: "0.5px solid var(--border-hairline)", gap: "var(--sp-md)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-md)", color: "var(--text-primary)", letterSpacing: "var(--ls-wide)", lineHeight: "var(--lh-snug)", margin: 0, textTransform: "uppercase" }}>{label}</p>
        {desc ? <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "3px 0 0" }}>{desc}</p> : null}
      </div>
      <Switch on={val} onToggle={onSet} />
    </div>
  );
  return (
    <Screen>
      <BackButton label="PROFILE" onClick={onBack} />
      <H1Screen>PREFERENCES</H1Screen>

      <SectionLabel>FREQUENCIES</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-sm)", marginBottom: "var(--sp-sm)" }}>
        {HIVE.genres.map((g) => <GenreChip key={g} label={g} selected={genres.includes(g)} onPress={() => toggleGenre(g)} />)}
      </div>

      <SectionLabel style={sec2}>NOTIFICATIONS</SectionLabel>
      <Toggle label="New events" desc="from your collectives" val={notify.newEvents} onSet={() => setNotify({ ...notify, newEvents: !notify.newEvents })} />
      <Toggle label="Pass updates" desc="approvals & changes" val={notify.passUpdates} onSet={() => setNotify({ ...notify, passUpdates: !notify.passUpdates })} />
      <Toggle label="Chat" val={notify.chat} onSet={() => setNotify({ ...notify, chat: !notify.chat })} />
      <Toggle label="Recommendations" val={notify.recommendations} onSet={() => setNotify({ ...notify, recommendations: !notify.recommendations })} />

      <SectionLabel style={sec2}>PRIVACY</SectionLabel>
      <Toggle label="Discoverable" desc="let collectives find you to invite" val={privacy.discoverable} onSet={() => setPrivacy({ ...privacy, discoverable: !privacy.discoverable })} />
      <Toggle label="Share history" desc="improves your feed & match score" val={privacy.shareHistory} onSet={() => setPrivacy({ ...privacy, shareHistory: !privacy.shareHistory })} />

      <GlitchButton title="SAVE" onClick={onBack} style={{ marginTop: "var(--sp-xl)" }} />
    </Screen>
  );
}

Object.assign(window, {
  PassesScreen, PassDetailScreen, CollectivesScreen, CollectiveDetailScreen,
  ChatListScreen, ChatThreadScreen, HistoryScreen, PreferencesScreen,
});
