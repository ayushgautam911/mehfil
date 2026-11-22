import React from "react";

/**
 * StatusBadge — bracketed state readout used across membership, passes,
 * applications and events. Colour is derived from the status word:
 * positive/active states read green, in-progress states cyan, and
 * negative/inactive states dim grey (the palette has no red).
 */
const STATUS_TONE = {
  member: "var(--accent-primary)", approved: "var(--accent-primary)", synced: "var(--accent-primary)",
  active: "var(--accent-primary)", published: "var(--accent-primary)",
  invited: "var(--accent-secondary)", pending: "var(--accent-secondary)", applied: "var(--accent-secondary)", draft: "var(--accent-secondary)",
  used: "var(--text-dim)", declined: "var(--text-secondary)", blocked: "var(--text-secondary)",
};
export function StatusBadge({ status, style }) {
  const color = STATUS_TONE[status] || "var(--text-secondary)";
  return (
    <span style={{
      fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)",
      textTransform: "uppercase", color, whiteSpace: "nowrap", ...style,
    }}>[{status}]</span>
  );
}
