import React from "react";

/**
 * Input — a single-line text field. No box: just a hairline bottom rule
 * that turns green on focus. Placeholder is dim; value text is primary.
 * Matches the search / form fields in onboarding.
 */
export function Input({
  value,
  onChange,
  placeholder = "search...",
  label,
  type = "text",
  style,
}) {
  const [focused, setFocused] = React.useState(false);
  const wrap = { display: "flex", flexDirection: "column", gap: "var(--sp-sm)", ...style };
  const labelStyle = {
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-xs)",
    letterSpacing: "var(--ls-extra-wide)",
    textTransform: "uppercase",
    color: "var(--accent-secondary)",
  };
  const field = {
    appearance: "none",
    background: "transparent",
    border: "none",
    borderBottom: `var(--border-w) solid ${focused ? "var(--accent-primary)" : "var(--border-hairline)"}`,
    borderRadius: 0,
    outline: "none",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--fs-md)",
    letterSpacing: "var(--ls-normal)",
    color: "var(--text-primary)",
    padding: "var(--sp-sm) 0",
    width: "100%",
    transition: "border-color var(--dur-fast)",
  };
  return (
    <label style={wrap}>
      {label ? <span style={labelStyle}>{label}</span> : null}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={field}
      />
    </label>
  );
}
