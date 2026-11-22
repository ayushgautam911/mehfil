import React from "react";

/**
 * QRPass — the deterministic faux-QR used on an approved entry pass.
 * Real QR is dark modules on white; Hive inverts it to phosphor-green
 * modules on black to stay in-brand. The module pattern is generated
 * deterministically from `code` (same code → same pattern), with three
 * finder squares like a real QR. Decorative — not a scannable code.
 */
export function QRPass({ code = "HIVE", size = 176, style }) {
  const N = 21;
  let seed = 0;
  for (let i = 0; i < code.length; i++) seed = (seed * 31 + code.charCodeAt(i)) >>> 0;
  const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const isFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
  const cells = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    let on;
    if (isFinder(r, c)) {
      const rr = r >= N - 7 ? r - (N - 7) : r, cc = c >= N - 7 ? c - (N - 7) : c;
      on = rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
    } else { on = rng() > 0.52; }
    cells.push(on);
  }
  return (
    <div style={{ width: size, height: size, display: "grid", gridTemplateColumns: `repeat(${N},1fr)`, gridTemplateRows: `repeat(${N},1fr)`, background: "var(--surface-page)", padding: 6, boxSizing: "border-box", ...style }}>
      {cells.map((on, i) => <span key={i} style={{ background: on ? "var(--accent-primary)" : "transparent" }} />)}
    </div>
  );
}
