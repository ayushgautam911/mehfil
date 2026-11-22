import React from "react";

/**
 * CornerFrame — wraps content in the signature four-corner brackets.
 * Used to mark focal blocks (the wordmark, event title block, hero
 * readouts). Optionally adds a faint hairline border behind the brackets.
 */
export function CornerFrame({
  children,
  color = "var(--accent-primary)",
  size = 12,
  thickness = 1.5,
  bordered = false,
  padding = "var(--sp-lg)",
  style,
}) {
  const root = {
    position: "relative",
    padding,
    border: bordered ? "var(--border-hair) solid var(--border-hairline)" : "none",
    ...style,
  };
  const c = { position: "absolute", width: size, height: size, borderColor: color, borderStyle: "solid", borderWidth: 0 };
  return (
    <div style={root}>
      <span style={{ ...c, top: 0, left: 0, borderTopWidth: thickness, borderLeftWidth: thickness }} />
      <span style={{ ...c, top: 0, right: 0, borderTopWidth: thickness, borderRightWidth: thickness }} />
      <span style={{ ...c, bottom: 0, left: 0, borderBottomWidth: thickness, borderLeftWidth: thickness }} />
      <span style={{ ...c, bottom: 0, right: 0, borderBottomWidth: thickness, borderRightWidth: thickness }} />
      {children}
    </div>
  );
}
