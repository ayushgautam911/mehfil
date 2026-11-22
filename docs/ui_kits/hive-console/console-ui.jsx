// Hive Console — shared UI primitives (desktop / web density)
const { useState: useCS, useRef: useCR, useEffect: useCE } = React;

// ── Monogram avatar ───────────────────────────────────────────
function CAvatar({ name = "", size = 32, glow = false, color = "var(--accent-primary)" }) {
  const initials = name.replace(/^@/, "").split(/[\s._]+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, flex: "none", background: "var(--surface-card)", border: `1px solid ${glow ? color : "var(--border-hairline)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: glow ? "var(--glow-green-sm)" : "none" }}>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: size * 0.34, letterSpacing: "0.5px", color }}>{initials}</span>
    </div>
  );
}

// ── Status readout [text] ─────────────────────────────────────
const C_TONE = {
  active: "var(--accent-primary)", published: "var(--accent-primary)", approved: "var(--accent-primary)", synced: "var(--accent-primary)",
  pending: "var(--accent-secondary)", draft: "var(--accent-secondary)", invited: "var(--accent-secondary)",
  blocked: "var(--text-secondary)", declined: "var(--text-secondary)",
};
function CStatus({ status, style }) {
  return <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: C_TONE[status] || "var(--text-secondary)", whiteSpace: "nowrap", ...style }}>[{status}]</span>;
}

// ── Buttons ───────────────────────────────────────────────────
function CBtn({ children, onClick, variant = "primary", size = "md", style }) {
  const pad = size === "sm" ? "6px 12px" : "10px 20px";
  const fs = size === "sm" ? "var(--fs-xs)" : "var(--fs-sm)";
  const base = {
    appearance: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)",
    fontSize: fs, letterSpacing: "var(--ls-wide)", textTransform: "uppercase", padding: pad, borderRadius: 0,
    transition: "background 120ms, color 120ms, box-shadow 120ms", whiteSpace: "nowrap", ...style,
  };
  const variants = {
    primary: { border: "1px solid var(--accent-primary)", background: "var(--accent-primary-wash)", color: "var(--accent-primary)" },
    solid: { border: "1px solid var(--accent-primary)", background: "var(--accent-primary)", color: "var(--on-accent)", boxShadow: "var(--glow-green-sm)" },
    ghost: { border: "1px solid var(--border-hairline)", background: "transparent", color: "var(--text-secondary)" },
    danger: { border: "1px solid var(--text-secondary)", background: "transparent", color: "var(--text-secondary)" },
  };
  return <button type="button" onClick={onClick} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

// ── Section label ─────────────────────────────────────────────
function CLabel({ children, tone = "green", style }) {
  return <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-extra-wide)", textTransform: "uppercase", color: tone === "cyan" ? "var(--accent-secondary)" : "var(--accent-primary)", margin: 0, ...style }}>// {children}</p>;
}

// ── Panel (bordered surface block) ────────────────────────────
function Panel({ title, action, children, style }) {
  return (
    <div style={{ border: "1px solid var(--border-hairline)", background: "var(--surface-card)", ...style }}>
      {title ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border-hairline)" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-primary)" }}>{title}</span>
          {action}
        </div>
      ) : null}
      <div style={{ padding: "18px" }}>{children}</div>
    </div>
  );
}

// ── Metric tile ───────────────────────────────────────────────
function Metric({ value, label, sub, accent = false }) {
  return (
    <div style={{ border: "1px solid var(--border-hairline)", background: "var(--surface-card)", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: accent ? "var(--accent-primary)" : "transparent" }} />
      <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xxl)", letterSpacing: "var(--ls-normal)", color: accent ? "var(--accent-primary)" : "var(--text-primary)", margin: 0 }}>{value}</p>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-secondary)", margin: "6px 0 0" }}>{label}</p>
      {sub ? <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", color: "var(--text-dim)", margin: "4px 0 0" }}>{sub}</p> : null}
    </div>
  );
}

// ── Table primitives ──────────────────────────────────────────
function Table({ cols, children }) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: cols.map((c) => c.w).join(" "), gap: "var(--sp-md)", padding: "0 0 10px", borderBottom: "1px solid var(--border-hairline)" }}>
        {cols.map((c) => <span key={c.label} style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-dim)", textAlign: c.align || "left" }}>{c.label}</span>)}
      </div>
      {children}
    </div>
  );
}
function Row({ cols, cells, onClick, dim }) {
  return (
    <div onClick={onClick} style={{ display: "grid", gridTemplateColumns: cols.map((c) => c.w).join(" "), gap: "var(--sp-md)", alignItems: "center", padding: "13px 0", borderBottom: "0.5px solid var(--border-hairline)", cursor: onClick ? "pointer" : "default", opacity: dim ? 0.5 : 1 }}>
      {cells.map((cell, i) => <div key={i} style={{ textAlign: cols[i].align || "left", minWidth: 0 }}>{cell}</div>)}
    </div>
  );
}
const cellText = (t, opts = {}) => <span style={{ fontFamily: "var(--font-sans)", fontSize: opts.size || "var(--fs-sm)", letterSpacing: "var(--ls-normal)", color: opts.color || "var(--text-primary)", textTransform: opts.upper ? "uppercase" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{t}</span>;

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ active, onNav, nav, badges = {} }) {
  const c = CONSOLE.collective;
  const [open, setOpen] = useCS(false);
  return (
    <div style={{ width: 232, flex: "none", height: "100%", background: "var(--surface-chrome)", borderRight: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* wordmark */}
      <div style={{ padding: "20px 18px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-lg)", letterSpacing: "var(--ls-extra-wide)", color: "var(--text-primary)", textShadow: "var(--text-glow-green)" }}>HIVE</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--text-secondary)" }}>CONSOLE</span>
        </div>
      </div>
      {/* collective switcher */}
      <div style={{ margin: "0 12px 14px", border: "1px solid var(--border-hairline)", position: "relative" }}>
        <button type="button" onClick={() => setOpen((v) => !v)} style={{ appearance: "none", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface-card)", border: "none" }}>
          <CAvatar name={c.name} size={28} glow />
          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)", margin: 0 }}>{c.name}</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "9px", letterSpacing: "var(--ls-wide)", color: "var(--text-secondary)", margin: "2px 0 0" }}>{c.members} MEMBERS</p>
          </div>
          <span style={{ color: "var(--text-dim)", fontSize: 10 }}>▾</span>
        </button>
        {open && (
          <div style={{ position: "absolute", top: "100%", left: -1, right: -1, background: "var(--surface-chrome)", border: "1px solid var(--border-hairline)", zIndex: 20 }}>
            {CONSOLE.otherCollectives.map((o) => (
              <div key={o.handle} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer", borderTop: "0.5px solid var(--border-hairline)" }}>
                <CAvatar name={o.name} size={24} />
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-wide)", color: "var(--text-secondary)" }}>{o.name}</span>
              </div>
            ))}
            <div style={{ padding: "10px 12px", borderTop: "0.5px solid var(--border-hairline)", cursor: "pointer" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--accent-primary)" }}>+ NEW COLLECTIVE</span>
            </div>
          </div>
        )}
      </div>
      {/* nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {nav.map((n) => {
          const on = n === active;
          return (
            <button key={n} type="button" onClick={() => onNav(n)} style={{ appearance: "none", cursor: "pointer", width: "100%", textAlign: "left", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", margin: "1px 0", border: "none", background: on ? "var(--accent-primary-wash)" : "transparent" }}>
              <span style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 2, background: on ? "var(--accent-primary)" : "transparent" }} />
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: on ? "var(--fw-bold)" : "var(--fw-regular)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: on ? "var(--accent-primary)" : "var(--text-secondary)" }}>{n}</span>
              {badges[n] ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "var(--accent-secondary)", border: "1px solid var(--accent-secondary)", padding: "0 5px", lineHeight: "15px" }}>{badges[n]}</span> : null}
            </button>
          );
        })}
      </div>
      {/* account */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--border-hairline)", display: "flex", alignItems: "center", gap: 10 }}>
        <CAvatar name="@admin" size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--text-primary)", margin: 0 }}>@void.admin</p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "9px", letterSpacing: "var(--ls-wide)", color: "var(--text-dim)", margin: "2px 0 0" }}>OWNER</p>
        </div>
      </div>
    </div>
  );
}

// ── Content header ────────────────────────────────────────────
function CHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "26px 32px 18px", borderBottom: "1px solid var(--border-hairline)" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-xxl)", letterSpacing: "var(--ls-extra-wide)", textTransform: "uppercase", color: "var(--text-primary)", margin: 0 }}>{title}</h1>
        {sub ? <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-sm)", letterSpacing: "var(--ls-normal)", color: "var(--text-secondary)", margin: "8px 0 0" }}>{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

// ── Scrollable content body ───────────────────────────────────
function Body({ children }) {
  return <div style={{ flex: 1, overflowY: "auto", padding: "26px 32px 48px" }}>{children}</div>;
}

Object.assign(window, { CAvatar, CStatus, CBtn, CLabel, Panel, Metric, Table, Row, cellText, Sidebar, CHeader, Body, CScanlines });

// ── Scanlines overlay (console) ───────────────────────────────
function CScanlines() {
  return <div className="hive-scanlines" style={{ zIndex: 60, mixBlendMode: "screen", opacity: 0.5 }} />;
}
// alias used by screens
var Scanlines = CScanlines;
window.Scanlines = CScanlines;
