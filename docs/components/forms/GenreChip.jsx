import React from "react";

/**
 * GenreChip — a toggleable filter chip used in onboarding and audience
 * filters. Hard-edged box; selected state switches the outline to green
 * with a faint green wash and green text.
 */
export function GenreChip({ label, selected = false, onPress, style }) {
  const root = {
    appearance: "none",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-sm)",
    letterSpacing: "var(--ls-normal)",
    padding: "calc(var(--sp-sm) + 2px) var(--sp-md)",
    border: selected
      ? "var(--border-w) solid var(--accent-primary)"
      : "var(--border-w) solid var(--border-hairline)",
    borderRadius: "var(--radius-none)",
    background: selected ? "var(--accent-primary-wash)" : "transparent",
    color: selected ? "var(--accent-primary)" : "var(--text-secondary)",
    transition: "color var(--dur-fast), border-color var(--dur-fast)",
    ...style,
  };
  return (
    <button type="button" style={root} onClick={onPress} aria-pressed={selected}>
      {label}
    </button>
  );
}
