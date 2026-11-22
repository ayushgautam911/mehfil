import React from "react";

/**
 * MatchScore — the two-line right-aligned readout shown on event cards:
 * a large green percentage stacked over a small "MATCH" caption.
 */
export function MatchScore({ value = 92, caption = "MATCH", align = "flex-end", style }) {
  const root = { display: "flex", flexDirection: "column", alignItems: align, ...style };
  const num = {
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fw-bold)",
    fontSize: "var(--fs-lg)",
    letterSpacing: "var(--ls-normal)",
    color: "var(--accent-primary)",
    lineHeight: "var(--lh-tight)",
  };
  const cap = {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    color: "var(--accent-primary)",
    opacity: 0.6,
  };
  return (
    <div style={root}>
      <span style={num}>{value}%</span>
      <span style={cap}>{caption}</span>
    </div>
  );
}
