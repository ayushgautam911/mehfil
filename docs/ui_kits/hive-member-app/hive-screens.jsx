// Hive member-app — screens
const { useState: useS, useEffect: useE, useRef: useR } = React;

// ── WELCOME / BOOT ────────────────────────────────────────────
function WelcomeScreen({ onEnter }) {
  const [progress, setProgress] = useS(0);
  const [booted, setBooted] = useS(false);
  useE(() => {
    let cur = 0;
    const iv = setInterval(() => {
      cur += Math.floor(Math.random() * 25) + 5;
      if (cur >= 100) { cur = 100; clearInterval(iv); setTimeout(() => setBooted(true), 200); }
      setProgress(cur);
    }, 120);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 5, padding: "0 var(--gutter)" }}>
      {!booted ? (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)" }}>
          <div style={{ width: 60, height: 12, background: "var(--surface-card)" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent-primary)", boxShadow: "var(--glow-green-sm)" }} />
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-md)", color: "var(--accent-primary)", letterSpacing: "var(--ls-wide)" }}>-{progress}%</span>
        </div>
      ) : (
        <div className="hive-fade" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ marginBottom: "var(--sp-xxxl)", alignItems: "center", display: "flex", flexDirection: "column" }}>
            <CornerFrame color="var(--text-dim)" size={16} padding="var(--sp-lg) var(--sp-xl)" style={{ marginBottom: "var(--sp-lg)" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-hero)", color: "var(--text-primary)", letterSpacing: "var(--ls-wordmark)", textShadow: "var(--text-glow-green)", whiteSpace: "nowrap" }}>H I V E</span>
            </CornerFrame>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xl)", color: "var(--text-primary)", letterSpacing: "var(--ls-extra-wide)", whiteSpace: "nowrap" }}>FIND THE SOUND.</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-extra-wide)", marginTop: "var(--sp-sm)" }}>PRIVATE EVENTS. CURATED ACCESS.</span>
          </div>
          <GlitchButton title="ENTER" block={false} onClick={onEnter} />
        </div>
      )}
    </div>
  );
}

// ── ONBOARDING ────────────────────────────────────────────────
function OnboardingScreen({ onContinue }) {
  const [sel, setSel] = useS(["acid", "dub techno"]);
  const [q, setQ] = useS("");
  const toggle = (g) => setSel((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);
  return (
    <Screen bottom={40}>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", letterSpacing: "var(--ls-extra-wide)", textAlign: "center", marginTop: 0, marginBottom: "var(--sp-xl)" }}>hive</p>
      <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-xxl)", color: "var(--text-primary)", margin: "0 0 var(--sp-sm)" }}>what moves you?</h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--accent-secondary)", letterSpacing: "var(--ls-normal)", margin: "0 0 var(--sp-xl)" }}>select your frequencies</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-sm)", marginBottom: "var(--sp-xl)" }}>
        {HIVE.genres.map((g) => <GenreChip key={g} label={g} selected={sel.includes(g)} onPress={() => toggle(g)} />)}
      </div>
      <SectionLabel tone="cyan" slash={false} style={{ marginBottom: "var(--sp-md)" }}>ARTISTS</SectionLabel>
      <div style={{ borderBottom: "1px solid var(--border-hairline)", marginBottom: "var(--sp-lg)" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search..." style={{ background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-primary)", padding: "var(--sp-sm) 0", width: "100%" }} />
      </div>
      {HIVE.artists.slice(0, 3).map((a) => (
        <div key={a.name} style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", marginBottom: "var(--sp-md)" }}>
          <div style={{ width: 36, height: 36, background: "var(--surface-card)", border: "1px solid var(--border-hairline)" }} />
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-primary)", margin: 0 }}>{a.name}</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", margin: "2px 0 0" }}>{a.genres}</p>
          </div>
        </div>
      ))}
      <GlitchButton title="CONTINUE" onClick={onContinue} style={{ marginTop: "var(--sp-xl)" }} />
    </Screen>
  );
}

// ── FEED ──────────────────────────────────────────────────────
function FeedScreen({ onOpen, showMatch = true }) {
  return (
    <Screen>
      <ScreenHeader label="HIVE / FEED" sub={showMatch ? `${HIVE.events.length} EVENTS MATCHED` : `${HIVE.events.length} EVENTS`} />
      {HIVE.events.map((e) => <FeedRow key={e.id} event={e} showMatch={showMatch} onPress={() => onOpen(e.id)} />)}
    </Screen>
  );
}
function FeedRow({ event, onPress, showMatch = true }) {
  return (
    <div onClick={onPress} style={{ position: "relative", padding: "var(--sp-lg) 0 var(--sp-lg) var(--sp-md)", borderBottom: "0.5px solid var(--border-hairline)", cursor: "pointer" }}>
      <span style={{ position: "absolute", left: 0, top: "var(--sp-lg)", bottom: "var(--sp-lg)", width: 1.5, background: "var(--accent-primary)", opacity: 0.5 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--sp-md)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", flexWrap: "wrap", flex: 1 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-md)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)" }}>{event.name.toUpperCase()}</span>
          {event.isPrivate && <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--accent-primary)", border: "1px solid var(--accent-primary)", padding: "1px 5px" }}>PRIVATE</span>}
        </div>
        {showMatch && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-lg)", color: "var(--accent-primary)" }}>{event.matchScore}%</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--accent-primary)", opacity: 0.6 }}>MATCH</span>
        </div>
        )}
      </div>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "var(--sp-sm) 0 0" }}>{event.date} · {event.time} · {event.venue}</p>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "var(--sp-xs)", marginTop: "var(--sp-sm)" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--accent-primary)", marginRight: "var(--sp-xs)" }}>{event.collective}</span>
        {event.genres.map((g) => <Tag key={g} label={g} />)}
      </div>
    </div>
  );
}

// ── EVENT DETAIL ──────────────────────────────────────────────
function EventDetailScreen({ eventId, onBack, onRefer, onRequestPass, onOpenPass, showMatch = true }) {
  const event = HIVE.events.find((e) => e.id === eventId) || HIVE.events[0];
  const ps = event.passStatus; // null | 'pending' | 'approved'
  return (
    <Screen>
      <button onClick={onBack} style={backBtn}>← BACK</button>
      <CornerFrame bordered color="var(--border-hairline)" size={10} thickness={1} padding="var(--sp-lg)" style={{ marginBottom: "var(--sp-xl)" }}>
        {showMatch && <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--accent-primary)", letterSpacing: "var(--ls-wide)", margin: "0 0 var(--sp-sm)" }}>[{event.matchScore}% MATCH]</p>}
        <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xxl)", color: "var(--text-primary)", letterSpacing: "var(--ls-extra-wide)", margin: "0 0 var(--sp-sm)" }}>{event.name.toUpperCase()}</h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "0 0 var(--sp-sm)" }}>{event.date} · {event.time}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-xs)" }}>{event.genres.map((g) => <Tag key={g} label={g} />)}</div>
      </CornerFrame>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", marginTop: "calc(var(--sp-xl) * -0.5)", marginBottom: "var(--sp-xs)" }}>
        <Avatar name={event.collective} size={28} />
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--text-secondary)", textTransform: "uppercase" }}>hosted by <span style={{ color: "var(--accent-primary)" }}>{event.collective}</span></span>
      </div>

      <SectionLabel style={secLabel}>LINEUP</SectionLabel>
      {event.lineup.map((a) => <p key={a} style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xl)", color: "var(--text-primary)", letterSpacing: "var(--ls-wide)", margin: "0 0 var(--sp-sm)" }}>{a.toUpperCase()}</p>)}

      <SectionLabel style={secLabel}>LOCATION</SectionLabel>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: 0 }}>{event.address}</p>
      {!event.locationRevealed && <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--accent-primary)", letterSpacing: "var(--ls-wide)", marginTop: "var(--sp-xs)" }}>[LOCKED — PASS REQUIRED]</p>}

      <SectionLabel style={secLabel}>ACCESS</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-md) 0", borderBottom: "0.5px solid var(--border-hairline)" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-md)", color: "var(--text-primary)", letterSpacing: "var(--ls-wide)", margin: 0 }}>ENTRY PASS</p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "2px 0 0" }}>free · approved by {event.collective.toLowerCase()} · 1 entry</p>
        </div>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-lg)", color: "var(--accent-primary)" }}>[FREE]</span>
      </div>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-normal)", margin: "var(--sp-md) 0 0", lineHeight: "var(--lh-body)" }}>requests are reviewed by the collective. you'll get a chat message when your pass is approved.</p>

      {ps === "approved" ? (
        <GlitchButton title="VIEW PASS" onClick={onOpenPass} style={{ marginTop: "var(--sp-xl)" }} />
      ) : ps === "pending" ? (
        <div style={{ marginTop: "var(--sp-xl)", border: "1px solid var(--accent-secondary)", padding: "var(--sp-md) var(--sp-xxl)", textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-ultra-wide)", color: "var(--accent-secondary)" }}>PASS REQUESTED · AWAITING APPROVAL</span>
        </div>
      ) : (
        <GlitchButton title="REQUEST PASS" onClick={onRequestPass} style={{ marginTop: "var(--sp-xl)" }} />
      )}
      <button onClick={onRefer} style={{ ...backBtn, display: "block", width: "100%", textAlign: "center", color: "var(--accent-secondary)", marginTop: "var(--sp-md)", letterSpacing: "var(--ls-extra-wide)" }}>REFER A FRIEND ›</button>
    </Screen>
  );
}

// ── PROFILE ───────────────────────────────────────────────────
function ProfileScreen({ onOpenCollective, onManagePrefs, onViewHistory, onInvite }) {
  const p = HIVE.profile;
  const stat = (v, l, accent) => (
    <div style={{ flex: 1, textAlign: "center" }}>
      <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xl)", color: accent ? "var(--accent-primary)" : "var(--text-primary)", margin: 0 }}>{v}</p>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-wide)", margin: "var(--sp-xs) 0 0" }}>{l}</p>
    </div>
  );
  return (
    <Screen>
      <ScreenHeader label="HIVE / PROFILE" />
      <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xxl)", color: "var(--text-primary)", letterSpacing: "var(--ls-extra-wide)", margin: "var(--sp-lg) 0 var(--sp-xs)" }}>{p.username.toUpperCase()}</h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-wide)", margin: "0 0 var(--sp-xl)" }}>MEMBER SINCE {p.memberSince}</p>
      <div style={{ display: "flex", alignItems: "center" }}>
        {stat(p.eventsAttended, "EVENTS")}
        <div style={{ width: 1, height: 30, background: "var(--border-hairline)" }} />
        {stat(p.referrals, "REFERRED")}
        <div style={{ width: 1, height: 30, background: "var(--border-hairline)" }} />
        {stat(`[${p.score}]`, "SCORE", true)}
      </div>

      <SectionLabel style={secLabel}>FREQUENCIES</SectionLabel>
      {p.frequencies.map((f) => (
        <div key={f.genre} style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", marginBottom: "var(--sp-md)" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-primary)", letterSpacing: "var(--ls-normal)", textTransform: "uppercase", width: 90 }}>{f.genre}</span>
          <span style={{ flex: 1, height: 2, background: "var(--border-hairline)" }}><span style={{ display: "block", height: 2, width: `${f.percent}%`, background: "var(--accent-primary)" }} /></span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--accent-primary)", width: 36, textAlign: "right" }}>{f.percent}%</span>
        </div>
      ))}

      <SectionLabel style={secLabel}>MY COLLECTIVES</SectionLabel>
      {HIVE.myCollectives.map((c) => (
        <ListRow key={c.id} onPress={() => onOpenCollective && onOpenCollective(c.id)}
          avatar={<Avatar name={c.name} size={40} />}
          title={c.name} subtitle={`${c.handle} · ${c.members} members`}
          right={<span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)" }}>›</span>} />
      ))}

      <SectionLabel style={secLabel}>SETTINGS</SectionLabel>
      <ProfileLink label="MANAGE PREFERENCES" onPress={onManagePrefs} />
      <ProfileLink label="VIEW FULL HISTORY" onPress={onViewHistory} />
      <ProfileLink label="INVITE A FRIEND" onPress={onInvite} tone="cyan" />

      <div style={{ marginTop: "var(--sp-xxl)", borderTop: "0.5px solid var(--border-hairline)", paddingTop: "var(--sp-lg)", display: "flex", flexDirection: "column", gap: "var(--sp-xs)" }}>
        {["NODE_POSITION: SEATTLE", "JOIN_CHANNEL: INVITE", "SESSION: 0X8F71...A13"].map((m) => (
          <span key={m} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-wide)" }}>{m}</span>
        ))}
      </div>
    </Screen>
  );
}

// ── INVITE ────────────────────────────────────────────────────
function InviteScreen({ onBack }) {
  const inv = HIVE.invite;
  return (
    <Screen>
      <button onClick={onBack} style={backBtn}>← private_invite</button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--sp-xxxl) 0", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--accent-secondary)", letterSpacing: "var(--ls-extra-wide)", margin: "0 0 var(--sp-md)" }}>YOU'RE INVITED</p>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xxxl)", color: "var(--text-primary)", letterSpacing: "var(--ls-ultra-wide)", margin: 0, textShadow: "var(--text-glow-green-lg)" }}>{inv.eventName}</h1>
        <div style={{ width: 60, height: 1, background: "var(--accent-primary)", opacity: 0.3, margin: "var(--sp-lg) 0" }} />
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", margin: "0 0 var(--sp-xl)" }}>from {inv.from} · <span style={{ color: "var(--accent-primary)" }}>{inv.spotsRemaining} spots remaining</span></p>
        <GlitchButton title="ACCEPT" block={false} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-sm)" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--accent-secondary)", letterSpacing: "var(--ls-wide)", margin: 0 }}>YOUR REFERRAL CODE</p>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "var(--fs-xl)", color: "var(--accent-primary)", letterSpacing: "var(--ls-wide)" }}>{inv.referralCode}</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--accent-secondary)", textDecoration: "underline", cursor: "pointer" }}>copy</span>
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", letterSpacing: "var(--ls-normal)", margin: 0 }}>you can invite up to {inv.maxInvites} friends</p>
      </div>
    </Screen>
  );
}

const backBtn = { appearance: "none", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", letterSpacing: "var(--ls-extra-wide)", padding: 0, marginBottom: "var(--sp-xl)" };
const secLabel = { marginTop: "var(--sp-xl)", marginBottom: "var(--sp-md)" };

function ProfileLink({ label, onPress, tone = "primary" }) {
  return (
    <div onClick={onPress} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-md) 0", borderBottom: "0.5px solid var(--border-hairline)", cursor: "pointer" }}>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-md)", letterSpacing: "var(--ls-wide)", color: tone === "cyan" ? "var(--accent-secondary)" : "var(--text-primary)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-dim)" }}>›</span>
    </div>
  );
}

Object.assign(window, { WelcomeScreen, OnboardingScreen, FeedScreen, EventDetailScreen, ProfileScreen, InviteScreen });
