import React from "react";

/**
 * Badge — a terse status flag. Two shapes:
 *  - "outline" (default): green-outlined green text, e.g. PRIVATE.
 *  - "bracket": bracketed dim/accent text with no border, e.g. [LOCKED],
 *    [QR], [92% MATCH] — the readout style used throughout Hive.
 */
export function Badge({ label, variant = "outline", tone = "green", style }) {
  const color =
    tone === "green"
      ? "var(--accent-primary)"
      : tone === "cyan"
      ? "var(--accent-secondary)"
      : tone === "dim"
      ? "var(--text-dim)"
      : "var(--text-secondary)";

  if (variant === "bracket") {
    const root = {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-xs)",
      letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase",
      color,
      ...style,
    };
    return <span style={root}>{`[${label}]`}</span>;
  }

  const root = {
    display: "inline-block",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    color,
    border: `var(--border-w) solid ${color}`,
    borderRadius: "var(--radius-none)",
    padding: "1px 5px",
    ...style,
  };
  return <span style={root}>{label}</span>;
}
