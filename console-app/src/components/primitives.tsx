import { type CSSProperties, type ReactNode } from 'react';

// ── Monogram avatar ───────────────────────────────────────────
export function CAvatar({
  name = '',
  size = 32,
  glow = false,
  color = 'var(--accent-primary)',
}: {
  name?: string;
  size?: number;
  glow?: boolean;
  color?: string;
}) {
  const initials = name
    .replace(/^@/, '')
    .split(/[\s._]+/)
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: 'none',
        background: 'var(--surface-card)',
        border: `1px solid ${glow ? color : 'var(--border-hairline)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: glow ? 'var(--glow-green-sm)' : 'none',
      }}
    >
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: size * 0.34, letterSpacing: '0.5px', color }}>
        {initials}
      </span>
    </div>
  );
}

// ── Status readout [text] — no red; declined/blocked stay grey ─
const C_TONE: Record<string, string> = {
  admin: 'var(--accent-secondary)',
  active: 'var(--accent-primary)',
  published: 'var(--accent-primary)',
  approved: 'var(--accent-primary)',
  synced: 'var(--accent-primary)',
  pending: 'var(--accent-secondary)',
  draft: 'var(--accent-secondary)',
  invited: 'var(--accent-secondary)',
  blocked: 'var(--text-secondary)',
  declined: 'var(--text-secondary)',
};
export function CStatus({ status, style }: { status: string; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-xs)',
        letterSpacing: 'var(--ls-wide)',
        textTransform: 'uppercase',
        color: C_TONE[status] || 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      [{status}]
    </span>
  );
}

// ── Buttons ───────────────────────────────────────────────────
type Variant = 'primary' | 'solid' | 'ghost' | 'danger';
export function CBtn({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  style,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: 'sm' | 'md';
  style?: CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const base: CSSProperties = {
    appearance: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--fw-bold)' as unknown as number,
    fontSize: size === 'sm' ? 'var(--fs-xs)' : 'var(--fs-sm)',
    letterSpacing: 'var(--ls-wide)',
    textTransform: 'uppercase',
    padding: size === 'sm' ? '6px 12px' : '10px 20px',
    borderRadius: 0,
    whiteSpace: 'nowrap',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
  const variants: Record<Variant, CSSProperties> = {
    primary: { border: '1px solid var(--accent-primary)', background: 'var(--accent-primary-wash)', color: 'var(--accent-primary)' },
    solid: { border: '1px solid var(--accent-primary)', background: 'var(--accent-primary)', color: 'var(--on-accent)', boxShadow: 'var(--glow-green-sm)' },
    ghost: { border: '1px solid var(--border-hairline)', background: 'transparent', color: 'var(--text-secondary)' },
    danger: { border: '1px solid var(--text-secondary)', background: 'transparent', color: 'var(--text-secondary)' },
  };
  const glows = (variant === 'primary' || variant === 'solid') && !disabled;
  return (
    <button type={type} onClick={disabled ? undefined : onClick} disabled={disabled} className={glows ? 'c-btn' : undefined} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────
export function CLabel({ children, tone = 'green', style }: { children: ReactNode; tone?: 'green' | 'cyan'; style?: CSSProperties }) {
  return (
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: tone === 'cyan' ? 'var(--accent-secondary)' : 'var(--accent-primary)', margin: 0, ...style }}>
      // {children}
    </p>
  );
}

// ── Panel (bordered surface block) ────────────────────────────
export function Panel({ title, action, children, style }: { title?: string; action?: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ border: '1px solid var(--border-hairline)', background: 'var(--surface-card)', ...style }}>
      {title ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border-hairline)' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-sm)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{title}</span>
          {action}
        </div>
      ) : null}
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  );
}

// ── Metric tile ───────────────────────────────────────────────
export function Metric({ value, label, sub, accent = false }: { value: ReactNode; label: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ border: '1px solid var(--border-hairline)', background: 'var(--surface-card)', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: accent ? 'var(--accent-primary)' : 'transparent' }} />
      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-xxl)', letterSpacing: 'var(--ls-normal)', color: accent ? 'var(--accent-primary)' : 'var(--text-primary)', margin: 0 }}>{value}</p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '6px 0 0' }}>{label}</p>
      {sub ? <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', margin: '4px 0 0' }}>{sub}</p> : null}
    </div>
  );
}

// ── Table primitives ──────────────────────────────────────────
export interface Col {
  label: string;
  w: string;
  align?: 'left' | 'right' | 'center';
}
export function Table({ cols, children }: { cols: Col[]; children: ReactNode }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols.map((c) => c.w).join(' '), gap: 'var(--sp-md)', padding: '0 0 10px', borderBottom: '1px solid var(--border-hairline)' }}>
        {cols.map((c) => (
          <span key={c.label} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-dim)', textAlign: c.align || 'left' }}>{c.label}</span>
        ))}
      </div>
      {children}
    </div>
  );
}
export function Row({ cols, cells, onClick, dim }: { cols: Col[]; cells: ReactNode[]; onClick?: () => void; dim?: boolean }) {
  return (
    <div
      onClick={onClick}
      className="c-row"
      style={{ display: 'grid', gridTemplateColumns: cols.map((c) => c.w).join(' '), gap: 'var(--sp-md)', alignItems: 'center', padding: '13px 0', borderBottom: '0.5px solid var(--border-hairline)', cursor: onClick ? 'pointer' : 'default', opacity: dim ? 0.5 : 1 }}
    >
      {cells.map((cell, i) => (
        <div key={i} style={{ textAlign: cols[i].align || 'left', minWidth: 0 }}>{cell}</div>
      ))}
    </div>
  );
}
export function cellText(t: ReactNode, opts: { size?: string; color?: string; upper?: boolean } = {}) {
  return (
    <span style={{ fontFamily: 'var(--font-sans)', fontSize: opts.size || 'var(--fs-sm)', letterSpacing: 'var(--ls-normal)', color: opts.color || 'var(--text-primary)', textTransform: opts.upper ? 'uppercase' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
      {t}
    </span>
  );
}

// ── Sidebar ───────────────────────────────────────────────────
export function Sidebar({
  active,
  onNav,
  nav,
  badges = {},
  collective,
  membersCount,
}: {
  active: string;
  onNav: (n: string) => void;
  nav: string[];
  badges?: Record<string, number | null>;
  collective: { name: string; handle?: string } | null;
  membersCount: number;
}) {
  const name = collective?.name || '—';
  return (
    <div style={{ width: 232, flex: 'none', height: '100%', background: 'var(--surface-chrome)', borderRight: '1px solid var(--border-hairline)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ padding: '20px 18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-lg)', letterSpacing: 'var(--ls-extra-wide)', color: 'var(--text-primary)', textShadow: 'var(--text-glow-green)' }}>M<span style={{ color: 'var(--accent-primary)' }}>3</span>HFIL</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-secondary)' }}>CONSOLE</span>
        </div>
      </div>

      <div style={{ margin: '0 12px 14px', border: '1px solid var(--border-hairline)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-card)' }}>
          <CAvatar name={name} size={28} glow />
          <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-sm)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-primary)', margin: 0 }}>{name}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: 'var(--ls-wide)', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{membersCount} {membersCount === 1 ? 'MEMBER' : 'MEMBERS'}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {nav.map((n) => {
          const on = n === active;
          return (
            <button key={n} type="button" onClick={() => onNav(n)} className="c-navitem" style={{ appearance: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', margin: '1px 0', border: 'none', background: on ? 'var(--accent-primary-wash)' : 'transparent' }}>
              <span style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: on ? 'var(--accent-primary)' : 'transparent' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: (on ? 'var(--fw-bold)' : 'var(--fw-regular)') as unknown as number, fontSize: 'var(--fs-sm)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: on ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{n}</span>
              {badges[n] ? <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--accent-secondary)', border: '1px solid var(--accent-secondary)', padding: '0 5px', lineHeight: '15px' }}>{badges[n]}</span> : null}
            </button>
          );
        })}
      </div>

    </div>
  );
}

// ── Content header ────────────────────────────────────────────
export function CHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '26px 32px 18px', borderBottom: '1px solid var(--border-hairline)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-xxl)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
        {sub ? <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', letterSpacing: 'var(--ls-normal)', color: 'var(--text-secondary)', margin: '8px 0 0' }}>{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

// ── Scrollable content body ───────────────────────────────────
export function Body({ children }: { children: ReactNode }) {
  return <div style={{ flex: 1, overflowY: 'auto', padding: '26px 32px 48px' }}>{children}</div>;
}

// ── Scanlines overlay ─────────────────────────────────────────
export function Scanlines() {
  return <div className="hive-scanlines" />;
}
