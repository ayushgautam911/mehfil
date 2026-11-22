import React from "react";

/**
 * Tag — a small, non-interactive bordered label for genres and venue
 * types on event cards. Cyan uppercase micro-text inside a hairline box.
 */
export function Tag({ label, color = "var(--accent-secondary)", style }) {
  const root = {
    display: "inline-block",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    color,
    border: "var(--border-w) solid var(--border-hairline)",
    borderRadius: "var(--radius-none)",
    padding: "2px var(--sp-sm)",
    ...style,
  };
  return <span style={root}>{label}</span>;
}
