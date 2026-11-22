import React from "react";

/**
 * SectionLabel — the "// LABEL" header that introduces a block of
 * content. Green uppercase micro-text with wide tracking and a leading
 * double-slash. The workhorse divider of every Hive screen.
 */
export function SectionLabel({ children, tone = "green", slash = true, style }) {
  const color = tone === "cyan" ? "var(--accent-secondary)" : "var(--accent-primary)";
  const root = {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-extra-wide)",
    textTransform: "uppercase",
    color,
    margin: 0,
    ...style,
  };
  return <p style={root}>{slash ? "// " : ""}{children}</p>;
}
