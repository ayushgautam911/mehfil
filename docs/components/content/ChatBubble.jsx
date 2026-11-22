import React from "react";

/**
 * ChatBubble — a single message in a 1:1 thread (member ↔ collective).
 * Mine: right-aligned, green outline on a faint green wash.
 * Theirs: left-aligned, surface fill with a hairline border.
 * Hard-edged; timestamp sits dim beneath the bubble.
 */
export function ChatBubble({ from = "them", text, time, style }) {
  const mine = from === "me";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", marginBottom: "var(--sp-md)", ...style }}>
      <div style={{
        maxWidth: "78%", padding: "var(--sp-sm) var(--sp-md)",
        border: mine ? "1px solid var(--accent-primary)" : "0.5px solid var(--border-hairline)",
        background: mine ? "var(--accent-primary-wash)" : "var(--surface-card)",
      }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-md)", letterSpacing: "var(--ls-normal)", lineHeight: "var(--lh-body)", color: "var(--text-primary)", margin: 0 }}>{text}</p>
      </div>
      {time ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "9px", letterSpacing: "var(--ls-wide)", color: "var(--text-dim)", marginTop: 4 }}>{time}</span> : null}
    </div>
  );
}
