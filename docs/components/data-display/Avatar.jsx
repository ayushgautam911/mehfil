import React from "react";

/**
 * Avatar — square monogram tile for collectives and members.
 * Hive has no uploaded avatars in the source; identity is a bold
 * 1–2 letter monogram on a dark surface inside a hairline box.
 * `glow` switches the border to the accent + adds a phosphor glow
 * (used to flag unread / active / approved).
 */
export function Avatar({ name = "", size = 40, glow = false, color = "var(--accent-primary)", style }) {
  const initials = name.replace(/^@/, "").split(/[\s._]+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, flex: "none", background: "var(--surface-card)",
      border: `1px solid ${glow ? color : "var(--border-hairline)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: glow ? "var(--glow-green-sm)" : "none", ...style,
    }}>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: size * 0.34, letterSpacing: "0.5px", color }}>{initials}</span>
    </div>
  );
}
