import React from "react";

/**
 * EventRow — the feed list item. A borderless row with a short green
 * accent bar on the left, the event name (uppercase) with an optional
 * PRIVATE flag, a right-aligned match score, a date/venue readout, and a
 * row of genre tags. Separated from siblings by a hairline bottom rule.
 *
 * Self-contained (does not import other components) so it bundles cleanly.
 */
export function EventRow({ event, onPress, style }) {
  const {
    name = "",
    date = "",
    time = "",
    venue = "",
    genres = [],
    matchScore,
    isPrivate = false,
  } = event || {};

  const card = {
    position: "relative",
    paddingTop: "var(--sp-lg)",
    paddingBottom: "var(--sp-lg)",
    paddingLeft: "var(--sp-md)",
    borderBottom: "var(--border-hair) solid var(--border-hairline)",
    cursor: onPress ? "pointer" : "default",
    background: "transparent",
    ...style,
  };
  const accent = {
    position: "absolute",
    left: 0,
    top: "var(--sp-lg)",
    bottom: "var(--sp-lg)",
    width: 1.5,
    background: "var(--accent-primary)",
    opacity: 0.5,
  };
  const header = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--sp-md)" };
  const titleRow = { display: "flex", alignItems: "center", gap: "var(--sp-sm)", flexWrap: "wrap", flex: 1 };
  const name_ = {
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fw-medium)",
    fontSize: "var(--fs-md)",
    letterSpacing: "var(--ls-wide)",
    color: "var(--text-primary)",
  };
  const priv = {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-wide)",
    color: "var(--accent-primary)",
    border: "var(--border-w) solid var(--accent-primary)",
    padding: "1px 5px",
    textTransform: "uppercase",
  };
  const matchWrap = { display: "flex", flexDirection: "column", alignItems: "flex-end", flex: "none" };
  const matchNum = { fontFamily: "var(--font-sans)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-lg)", color: "var(--accent-primary)" };
  const matchCap = { fontFamily: "var(--font-sans)", fontSize: "var(--fs-xs)", letterSpacing: "var(--ls-wide)", color: "var(--accent-primary)", opacity: 0.6 };
  const details = {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-sm)",
    letterSpacing: "var(--ls-normal)",
    color: "var(--text-secondary)",
    marginTop: "var(--sp-sm)",
  };
  const genreRow = { display: "flex", flexWrap: "wrap", gap: "var(--sp-xs)", marginTop: "var(--sp-sm)" };
  const tag = {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-wide)",
    textTransform: "uppercase",
    color: "var(--accent-secondary)",
    border: "var(--border-w) solid var(--border-hairline)",
    padding: "2px var(--sp-sm)",
  };

  return (
    <div style={card} onClick={onPress}>
      <span style={accent} />
      <div style={header}>
        <div style={titleRow}>
          <span style={name_}>{name.toUpperCase()}</span>
          {isPrivate ? <span style={priv}>PRIVATE</span> : null}
        </div>
        {matchScore != null ? (
          <div style={matchWrap}>
            <span style={matchNum}>{matchScore}%</span>
            <span style={matchCap}>MATCH</span>
          </div>
        ) : null}
      </div>
      <div style={details}>
        {[date, time, venue].filter(Boolean).join("  \u00B7  ")}
      </div>
      {genres.length ? (
        <div style={genreRow}>
          {genres.map((g) => (
            <span key={g} style={tag}>{g.toUpperCase()}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
