// Hive member-app — shared UI primitives (web recreations of the RN components)
const { useState, useRef, useEffect } = React;

// ── Animated CRT scanlines + flicker overlay ──────────────────
function Scanlines({ corners = false }) {
  return (
    <React.Fragment>
      <div
        className="hive-scanlines"
        style={{ zIndex: 30, mixBlendMode: "screen" }}
      />
      {corners && (
        <React.Fragment>
          <span style={cornerStyle({ top: 20, left: 16 })}>N-SEA</span>
          <span style={cornerStyle({ top: 20, right: 16 })}>0X-88</span>
          <span style={cornerStyle({ bottom: 44, left: 16 })}>T-MINUS_0</span>
          <span style={cornerStyle({ bottom: 44, right: 16 })}>V0.9</span>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
function cornerStyle(pos) {
  return {
    position: "absolute", zIndex: 31, fontFamily: "var(--font-sans)",
    fontSize: 9, letterSpacing: "var(--ls-wide)", color: "var(--text-dim)",
    pointerEvents: "none", ...pos,
  };
}

// ── Section label "// LABEL" ──────────────────────────────────
function SectionLabel({ children, tone = "green", slash = true, style }) {
  return (
    <p style={{
      fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)",
      letterSpacing: "var(--ls-extra-wide)", textTransform: "uppercase",
      color: tone === "cyan" ? "var(--accent-secondary)" : "var(--accent-primary)",
      margin: 0, ...style,
    }}>{slash ? "// " : ""}{children}</p>
  );
}

// ── Screen header (HIVE / FEED · sub) ─────────────────────────
function ScreenHeader({ label, sub }) {
  return (
    <React.Fragment>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "var(--sp-sm)" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-extra-wide)", color: "var(--text-primary)" }}>{label}</span>
        {sub ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--accent-primary)" }}>{sub}</span> : null}
      </div>
      <div style={{ height: 0.5, background: "var(--border-hairline)", marginBottom: "var(--sp-sm)" }} />
    </React.Fragment>
  );
}

// ── Glitch button ─────────────────────────────────────────────
function GlitchButton({ title = "ENTER", onClick, block = true, style }) {
  const [hot, setHot] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHot(true)} onMouseLeave={() => setHot(false)}
      onMouseDown={() => setHot(true)} onMouseUp={() => setHot(false)}
      style={{
        appearance: "none", cursor: "pointer", width: block ? "100%" : "auto",
        fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)",
        letterSpacing: "var(--ls-ultra-wide)", textTransform: "uppercase",
        padding: "var(--sp-md) var(--sp-xxl)", border: "var(--border-accent)", borderRadius: 0,
        background: hot ? "var(--accent-primary)" : "var(--accent-primary-wash)",
        color: hot ? "var(--on-accent)" : "var(--accent-primary)",
        boxShadow: hot ? "var(--glow-green-md)" : "none",
        transform: hot ? "translateX(-2px)" : "none",
        transition: "transform 60ms steps(2), box-shadow 150ms", ...style,
      }}
    >{hot ? `! ${title} !` : `${title} \u203A`}</button>
  );
}

// ── Genre chip (toggle) ───────────────────────────────────────
function GenreChip({ label, selected, onPress }) {
  return (
    <button type="button" onClick={onPress} style={{
      appearance: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-normal)",
      padding: "calc(var(--sp-sm) + 2px) var(--sp-md)", borderRadius: 0,
      border: selected ? "1px solid var(--accent-primary)" : "1px solid var(--border-hairline)",
      background: selected ? "var(--accent-primary-wash)" : "transparent",
      color: selected ? "var(--accent-primary)" : "var(--text-secondary)",
    }}>{label}</button>
  );
}

// ── Genre tag (read-only) ─────────────────────────────────────
function Tag({ label, color = "var(--accent-secondary)" }) {
  return (
    <span style={{
      display: "inline-block", fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)",
      letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color,
      border: "1px solid var(--border-hairline)", padding: "2px var(--sp-sm)",
    }}>{label}</span>
  );
}

// ── Corner-bracket frame ──────────────────────────────────────
function CornerFrame({ children, color = "var(--accent-primary)", size = 12, thickness = 1.5, bordered = false, padding = "var(--sp-lg)", style }) {
  const c = (extra) => ({ position: "absolute", width: size, height: size, borderColor: color, borderStyle: "solid", borderWidth: 0, ...extra });
  return (
    <div style={{ position: "relative", padding, border: bordered ? "0.5px solid var(--border-hairline)" : "none", ...style }}>
      <span style={c({ top: 0, left: 0, borderTopWidth: thickness, borderLeftWidth: thickness })} />
      <span style={c({ top: 0, right: 0, borderTopWidth: thickness, borderRightWidth: thickness })} />
      <span style={c({ bottom: 0, left: 0, borderBottomWidth: thickness, borderLeftWidth: thickness })} />
      <span style={c({ bottom: 0, right: 0, borderBottomWidth: thickness, borderRightWidth: thickness })} />
      {children}
    </div>
  );
}

// ── Floating pill tab bar (adaptive to tab count) ─────────────
function TabBar({ active, onChange, tabs = ["FEED", "PASSES", "PROFILE"], badges = {} }) {
  const idx = Math.max(0, tabs.indexOf(active));
  const many = tabs.length >= 4;
  return (
    <div style={{
      position: "absolute", bottom: 28, left: many ? 16 : 40, right: many ? 16 : 40, height: 54,
      borderRadius: "var(--radius-pill)", background: "var(--surface-chrome)",
      border: "1px solid var(--border-glow)", display: "flex", alignItems: "center",
      boxShadow: "var(--shadow-float)", zIndex: 40,
    }}>
      <div style={{
        position: "absolute", top: 0, bottom: 0, width: `${100 / tabs.length}%`,
        left: `${(idx * 100) / tabs.length}%`, padding: 5, boxSizing: "border-box",
        transition: "left 260ms cubic-bezier(0.2,0.9,0.2,1)", zIndex: 0,
      }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 22, background: "var(--accent-primary-wash)", border: "1px solid var(--border-glow)" }} />
      </div>
      {tabs.map((t) => {
        const on = t === active;
        return (
          <button key={t} type="button" onClick={() => onChange(t)} style={{
            position: "relative", appearance: "none", background: "none", border: "none", cursor: "pointer",
            flex: 1, height: "100%", zIndex: 1, fontFamily: "var(--font-sans)",
            fontWeight: "var(--fw-bold)", fontSize: many ? 9 : "var(--fs-xs)",
            letterSpacing: many ? "0.5px" : "var(--ls-wide)",
            color: on ? "var(--accent-primary)" : "var(--text-secondary)",
            textShadow: on ? "var(--text-glow-green)" : "none",
          }}>
            {t}
            {badges[t] ? <span style={{ position: "absolute", top: 11, right: many ? 10 : 18, width: 5, height: 5, background: "var(--accent-primary)", boxShadow: "var(--glow-green-sm)" }} /> : null}
          </button>
        );
      })}
    </div>
  );
}

// ── Avatar — square monogram tile (collective / member) ───────
function Avatar({ name = "", size = 40, glow = false, color = "var(--accent-primary)" }) {
  const initials = name.replace(/^@/, "").split(/[\s.]+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, flex: "none", background: "var(--surface-card)",
      border: `1px solid ${glow ? color : "var(--border-hairline)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: glow ? "var(--glow-green-sm)" : "none",
    }}>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: size * 0.34, letterSpacing: "0.5px", color }}>{initials}</span>
    </div>
  );
}

// ── StatusBadge — bracketed state readout ─────────────────────
const STATUS_TONE = {
  member: "var(--accent-primary)", approved: "var(--accent-primary)", synced: "var(--accent-primary)", active: "var(--accent-primary)", used: "var(--text-dim)",
  invited: "var(--accent-secondary)", pending: "var(--accent-secondary)", applied: "var(--accent-secondary)",
  declined: "var(--text-secondary)", blocked: "var(--text-secondary)", "not connected": "var(--text-dim)",
};
function StatusBadge({ status, style }) {
  const color = STATUS_TONE[status] || "var(--text-secondary)";
  return (
    <span style={{
      fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase", color, whiteSpace: "nowrap", ...style,
    }}>[{status}]</span>
  );
}

// ── ListRow — generic tappable row with hairline ──────────────
function ListRow({ avatar, title, subtitle, right, onPress, accent = false, dim = false, style }) {
  return (
    <div onClick={onPress} style={{
      position: "relative", display: "flex", alignItems: "center", gap: "var(--sp-md)",
      padding: "var(--sp-md) 0 var(--sp-md) " + (accent ? "var(--sp-md)" : "0"),
      borderBottom: "0.5px solid var(--border-hairline)", cursor: onPress ? "pointer" : "default",
      opacity: dim ? 0.45 : 1, ...style,
    }}>
      {accent && <span style={{ position: "absolute", left: 0, top: "var(--sp-md)", bottom: "var(--sp-md)", width: 1.5, background: "var(--accent-primary)", opacity: 0.5 }} />}
      {avatar}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-medium)", fontSize: "var(--fs-md)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)", margin: 0, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
        {subtitle ? <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", color: "var(--text-secondary)", letterSpacing: "var(--ls-normal)", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</p> : null}
      </div>
      {right ? <div style={{ flex: "none", textAlign: "right" }}>{right}</div> : null}
    </div>
  );
}

// ── BackButton ────────────────────────────────────────────────
function BackButton({ label = "BACK", onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      appearance: "none", background: "none", border: "none", cursor: "pointer", padding: 0,
      fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-secondary)",
      letterSpacing: "var(--ls-extra-wide)", marginBottom: "var(--sp-xl)", whiteSpace: "nowrap",
    }}>← {label}</button>
  );
}

// ── QRBlock — deterministic faux-QR rendered as a module grid ──
function QRBlock({ code = "HIVE", size = 168 }) {
  const N = 21;
  // deterministic PRNG seeded from the code
  let seed = 0;
  for (let i = 0; i < code.length; i++) seed = (seed * 31 + code.charCodeAt(i)) >>> 0;
  const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const cells = [];
  const isFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    let on;
    if (isFinder(r, c)) {
      const rr = r >= N - 7 ? r - (N - 7) : r, cc = c >= N - 7 ? c - (N - 7) : c;
      on = rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
    } else { on = rng() > 0.52; }
    cells.push(on);
  }
  return (
    <div style={{ width: size, height: size, display: "grid", gridTemplateColumns: `repeat(${N},1fr)`, gridTemplateRows: `repeat(${N},1fr)`, background: "var(--surface-page)", padding: 6, boxSizing: "border-box" }}>
      {cells.map((on, i) => <span key={i} style={{ background: on ? "var(--accent-primary)" : "transparent" }} />)}
    </div>
  );
}

// ── ChatBubble ────────────────────────────────────────────────
function ChatBubble({ from, text, time }) {
  const mine = from === "me";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", marginBottom: "var(--sp-md)" }}>
      <div style={{
        maxWidth: "78%", padding: "var(--sp-sm) var(--sp-md)",
        border: mine ? "1px solid var(--accent-primary)" : "0.5px solid var(--border-hairline)",
        background: mine ? "var(--accent-primary-wash)" : "var(--surface-card)",
        color: mine ? "var(--text-primary)" : "var(--text-primary)",
      }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", letterSpacing: "var(--ls-normal)", lineHeight: "var(--lh-body)", margin: 0 }}>{text}</p>
      </div>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", letterSpacing: "var(--ls-wide)", color: "var(--text-dim)", marginTop: 4 }}>{time}</span>
    </div>
  );
}

// Standard scroll container for a screen (clears status bar + tab bar)
function Screen({ children, pad = true, bottom = 120 }) {
  return (
    <div style={{
      height: "100%", overflowY: "auto", position: "relative", zIndex: 5,
      padding: pad ? `24px var(--gutter) ${bottom}px` : 0, boxSizing: "border-box",
    }}>{children}</div>
  );
}

Object.assign(window, {
  Scanlines, SectionLabel, ScreenHeader, GlitchButton, GenreChip, Tag, CornerFrame, TabBar, Screen,
  Avatar, StatusBadge, ListRow, BackButton, QRBlock, ChatBubble,
});
