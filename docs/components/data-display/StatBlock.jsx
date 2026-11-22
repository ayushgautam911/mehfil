import React from "react";

/**
 * StatBlock — a single centered metric: a bold value over an uppercase
 * caption. Used in the profile stats row (EVENTS / REFERRED / SCORE).
 * Set `accent` to render the value in green (e.g. the Hive score).
 */
export function StatBlock({ value, label, accent = false, bracket = false, style }) {
  const root = { display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-xs)", ...style };
  const val = {
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fw-bold)",
    fontSize: "var(--fs-xl)",
    letterSpacing: "var(--ls-normal)",
    color: accent ? "var(--accent-primary)" : "var(--text-primary)",
  };
  const cap = {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
  };
  return (
    <div style={root}>
      <span style={val}>{bracket ? `[${value}]` : value}</span>
      <span style={cap}>{label}</span>
    </div>
  );
}
