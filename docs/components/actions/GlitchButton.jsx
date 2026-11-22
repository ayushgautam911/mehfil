import React, { useState } from "react";

/**
 * GlitchButton — Hive's primary action control.
 * Hard-edged, green-outlined, uppercase with ultra-wide tracking.
 * On hover/press it "glitches": flips to a solid-green fill with black
 * text, the label gains bracketing bangs (! LABEL !), and the whole
 * control jitters horizontally for a frame.
 */
export function GlitchButton({
  title = "ENTER",
  onClick,
  disabled = false,
  block = false,
  style,
}) {
  const [hot, setHot] = useState(false);

  const base = {
    appearance: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fw-bold)",
    fontSize: "var(--fs-sm)",
    letterSpacing: "var(--ls-ultra-wide)",
    textTransform: "uppercase",
    padding: "var(--sp-md) var(--sp-xxl)",
    border: "var(--border-accent)",
    borderRadius: "var(--radius-none)",
    background: hot ? "var(--accent-primary)" : "var(--accent-primary-wash)",
    color: hot ? "var(--on-accent)" : "var(--accent-primary)",
    boxShadow: hot ? "var(--glow-green-md)" : "none",
    transform: hot ? "translateX(-2px)" : "translateX(0)",
    transition: "transform 60ms steps(2), box-shadow var(--dur-fast)",
    width: block ? "100%" : "auto",
    opacity: disabled ? 0.35 : 1,
    ...style,
  };

  return (
    <button
      type="button"
      style={base}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => !disabled && setHot(true)}
      onMouseLeave={() => setHot(false)}
      onMouseDown={() => !disabled && setHot(true)}
      onMouseUp={() => setHot(false)}
    >
      {hot ? `! ${title} !` : `${title} \u203A`}
    </button>
  );
}
