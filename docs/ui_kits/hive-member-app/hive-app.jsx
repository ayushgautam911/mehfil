// Hive member-app — app shell + navigation (+ Tweaks)
const { useState: useState_, useCallback } = React;

// ── Tweak defaults (edit-mode reads/writes these) ─────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#00ff41",
  "glow": "intense",
  "scanlines": true,
  "tracking": "signature",
  "matchScores": true
}/*EDITMODE-END*/;

// ── Tweak → CSS-variable plumbing ─────────────────────────────
function hexToRgb(hex) {
  const h = String(hex).replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(",");
}
function glowVars(rgb, accent, level) {
  if (level === "off")
    return { "--glow-green-sm": "none", "--glow-green-md": "none", "--shadow-float": "none", "--text-glow-green": "none", "--text-glow-green-lg": "none" };
  if (level === "subtle")
    return { "--glow-green-sm": `0 0 5px rgba(${rgb},0.35)`, "--glow-green-md": `0 0 9px rgba(${rgb},0.28)`, "--shadow-float": `0 3px 8px rgba(${rgb},0.06)`, "--text-glow-green": `0 0 5px rgba(${rgb},0.6)`, "--text-glow-green-lg": `0 0 9px rgba(${rgb},0.5)` };
  return { "--glow-green-sm": `0 0 10px rgba(${rgb},0.7)`, "--glow-green-md": `0 0 20px rgba(${rgb},0.6)`, "--shadow-float": `0 4px 14px rgba(${rgb},0.12)`, "--text-glow-green": `0 0 10px ${accent}`, "--text-glow-green-lg": `0 0 18px ${accent}` };
}
function tweakVars(t) {
  const rgb = hexToRgb(t.accent);
  const scale = { tight: 0.45, signature: 1, wide: 1.7 }[t.tracking] ?? 1;
  const lsBase = { "--ls-tight": 0.5, "--ls-normal": 1, "--ls-wide": 2, "--ls-extra-wide": 4, "--ls-ultra-wide": 8, "--ls-wordmark": 16 };
  const ls = {};
  Object.keys(lsBase).forEach((k) => { ls[k] = `${(lsBase[k] * scale).toFixed(2)}px`; });
  return {
    "--accent-primary": t.accent,
    "--accent-primary-wash": `rgba(${rgb},0.06)`,
    "--hive-green-line": `rgba(${rgb},0.30)`,
    "--border-glow": `rgba(${rgb},0.30)`,
    ...glowVars(rgb, t.accent, t.glow),
    ...ls,
  };
}

function HiveApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // stage: "welcome" | "onboarding" | "app"
  const [stage, setStage] = useState_("welcome");
  const [tab, setTab] = useState_("FEED");
  // overlay: null | { type: "event", id } | { type: "invite" }
  const [overlay, setOverlay] = useState_(null);

  const showTabBar = stage === "app" && !overlay;
  const showMatch = t.matchScores;
  const TABS = ["FEED", "COLLECTIVES", "PASSES", "CHAT", "PROFILE"];
  const badges = {
    CHAT: HIVE.chats.some((c) => c.unread > 0),
    COLLECTIVES: HIVE.pendingInvitations.length > 0,
  };
  const openPassForEvent = (ev) => {
    const p = HIVE.passes.find((x) => x.eventName === ev.name && x.status === "approved");
    if (p) setOverlay({ type: "pass", id: p.id });
  };

  let screen;
  let fadeKey;
  if (stage === "welcome") {
    screen = <WelcomeScreen onEnter={() => setStage("onboarding")} />;
    fadeKey = "welcome";
  } else if (stage === "onboarding") {
    screen = <OnboardingScreen onContinue={() => setStage("app")} />;
    fadeKey = "onboarding";
  } else if (overlay && overlay.type === "event") {
    const ev = HIVE.events.find((e) => e.id === overlay.id) || HIVE.events[0];
    screen = <EventDetailScreen eventId={overlay.id} showMatch={showMatch}
      onBack={() => setOverlay(null)}
      onRefer={() => setOverlay({ type: "invite" })}
      onRequestPass={() => { setOverlay(null); setTab("PASSES"); }}
      onOpenPass={() => openPassForEvent(ev)} />;
    fadeKey = "event-" + overlay.id;
  } else if (overlay && overlay.type === "invite") {
    screen = <InviteScreen onBack={() => setOverlay(null)} />;
    fadeKey = "invite";
  } else if (overlay && overlay.type === "collective") {
    screen = <CollectiveDetailScreen collectiveId={overlay.id}
      onBack={() => setOverlay(null)}
      onOpenChat={(name) => setOverlay({ type: "chat", collective: name })} />;
    fadeKey = "collective-" + overlay.id;
  } else if (overlay && overlay.type === "chat") {
    screen = <ChatThreadScreen chatId={overlay.id} collectiveName={overlay.collective} onBack={() => { setOverlay(null); setTab("CHAT"); }} />;
    fadeKey = "chat-" + (overlay.id || overlay.collective);
  } else if (overlay && overlay.type === "pass") {
    screen = <PassDetailScreen passId={overlay.id} onBack={() => { setOverlay(null); setTab("PASSES"); }} />;
    fadeKey = "pass-" + overlay.id;
  } else if (overlay && overlay.type === "history") {
    screen = <HistoryScreen onBack={() => setOverlay(null)} />;
    fadeKey = "history";
  } else if (overlay && overlay.type === "prefs") {
    screen = <PreferencesScreen onBack={() => setOverlay(null)} />;
    fadeKey = "prefs";
  } else if (tab === "FEED") {
    screen = <FeedScreen showMatch={showMatch} onOpen={(id) => setOverlay({ type: "event", id })} />;
    fadeKey = "feed";
  } else if (tab === "COLLECTIVES") {
    screen = <CollectivesScreen onOpen={(id) => setOverlay({ type: "collective", id })} />;
    fadeKey = "collectives";
  } else if (tab === "PASSES") {
    screen = <PassesScreen onOpenPass={(id) => setOverlay({ type: "pass", id })} />;
    fadeKey = "passes";
  } else if (tab === "CHAT") {
    screen = <ChatListScreen onOpen={(id) => setOverlay({ type: "chat", id })} />;
    fadeKey = "chat-list";
  } else {
    screen = <ProfileScreen
      onOpenCollective={(id) => setOverlay({ type: "collective", id })}
      onManagePrefs={() => setOverlay({ type: "prefs" })}
      onViewHistory={() => setOverlay({ type: "history" })}
      onInvite={() => setOverlay({ type: "invite" })} />;
    fadeKey = "profile";
  }

  return (
    <div style={{ position: "relative", height: "100%", width: "100%", background: "var(--surface-page)", overflow: "hidden", ...tweakVars(t) }}>
      {t.scanlines && <Scanlines corners={stage === "welcome"} />}
      <div key={fadeKey} className="hive-fade" style={{ height: "100%" }}>{screen}</div>
      {showTabBar && <TabBar active={tab} tabs={TABS} badges={badges} onChange={(tb) => { setOverlay(null); setTab(tb); }} />}

      <TweaksPanel>
        <TweakSection label="Signal" />
        <TweakColor label="Accent" value={t.accent}
          options={["#00ff41", "#0abdc6", "#ffb000", "#ff2e88"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakRadio label="Glow" value={t.glow}
          options={["off", "subtle", "intense"]}
          onChange={(v) => setTweak("glow", v)} />
        <TweakSection label="Texture" />
        <TweakToggle label="Scanlines" value={t.scanlines}
          onChange={(v) => setTweak("scanlines", v)} />
        <TweakRadio label="Tracking" value={t.tracking}
          options={["tight", "signature", "wide"]}
          onChange={(v) => setTweak("tracking", v)} />
        <TweakSection label="Content" />
        <TweakToggle label="Match scores" value={t.matchScores}
          onChange={(v) => setTweak("matchScores", v)} />
      </TweaksPanel>
    </div>
  );
}

function Root() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#08080a", padding: 32, boxSizing: "border-box" }}>
      <IOSDevice dark>
        <HiveApp />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
