import React from "react";

/**
 * FreqBar — a thin horizontal meter for the profile "frequencies"
 * (genre breakdown). Label on the left, 2px track, green fill, percent
 * on the right. Pure data readout, no rounding.
 */
export function FreqBar({ label, percent = 0, style }) {
  const row = { display: "flex", alignItems: "center", gap: "var(--sp-md)", ...style };
  const lbl = {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-normal)",
    textTransform: "uppercase",
    color: "var(--text-primary)",
    width: 90,
    flex: "none",
  };
  const track = { flex: 1, height: 2, background: "var(--border-hairline)" };
  const fill = { height: 2, width: `${percent}%`, background: "var(--accent-primary)" };
  const pct = {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-normal)",
    color: "var(--accent-primary)",
    width: 36,
    textAlign: "right",
    flex: "none",
  };
  return (
    <div style={row}>
      <span style={lbl}>{label}</span>
      <span style={track}><span style={fill} /></span>
      <span style={pct}>{percent}%</span>
    </div>
  );
}
