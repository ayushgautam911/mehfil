import type { CSSProperties } from 'react';
import { CHeader, Body, CBtn, CAvatar, Panel } from '../components/primitives';
import { getStoredCollective } from '../api';

const fieldInput: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--border-hairline)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--fs-md)',
  color: 'var(--text-primary)',
  padding: '8px 0',
};

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>{label}</p>
      <input defaultValue={value} style={fieldInput} />
    </div>
  );
}

interface SettingsProps {
  onLogout: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const c = getStoredCollective() || { name: 'VOID', handle: '@void.collective', location: 'seattle', founded: '2026' };
  
  return (
    <>
      <CHeader
        title="SETTINGS"
        sub="collective profile"
        action={
          <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
            <CBtn variant="danger" onClick={onLogout}>LOG OUT</CBtn>
            <CBtn variant="solid">SAVE</CBtn>
          </div>
        }
      />
      <Body>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Panel title="Collective profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)', marginBottom: 'var(--sp-lg)' }}>
              <CAvatar name={c.name} size={56} glow />
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-xl)', letterSpacing: 'var(--ls-extra-wide)', color: 'var(--text-primary)', margin: 0 }}>{c.name}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>FOUNDED {c.founded} · {c.handle}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-lg)' }}>
              <Field label="Name" value={c.name} />
              <Field label="Handle" value={c.handle} />
              <Field label="City" value={c.location} />
              <Field label="Genres" value="hard techno, industrial" />
              <Field label="Bio" value="warehouse techno. no phones on the floor." full />
            </div>
          </Panel>
        </div>
      </Body>
    </>
  );
}
