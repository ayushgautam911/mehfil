import { useState } from 'react';
import { CBtn, Scanlines } from '../components/primitives';
import { api } from '../api';
import { loginSchema, firstError } from '../schemas';

// Console access is login-only: collectives are provisioned by the platform
// (invite-only), so there is no self-serve signup here. The backend signup
// endpoint still exists for provisioning.

function OField({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div style={{ marginBottom: 'var(--sp-lg)' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>{label}</p>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-hairline)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-md)', color: 'var(--text-primary)', padding: '8px 0' }}
      />
    </div>
  );
}

export default function Onboarding({ onDone }: { onDone: (collective: any) => void }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const err = firstError(loginSchema, { email: loginEmail, password: loginPassword });
    if (err) {
      setErrorMsg(err);
      return;
    }

    try {
      const data = await api.auth.login({ email: loginEmail, password: loginPassword });
      onDone(data.collective);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 5, background: 'var(--surface-page)', overflow: 'hidden' }}>
      <Scanlines />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 460, maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'center', marginBottom: 'var(--sp-sm)' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-xl)', letterSpacing: 'var(--ls-extra-wide)', color: 'var(--text-primary)', textShadow: 'var(--text-glow-green)' }}>M<span style={{ color: 'var(--accent-primary)' }}>3</span>HFIL</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-secondary)' }}>CONSOLE</span>
          </div>

          <div style={{ border: '1px solid var(--border-hairline)', background: 'var(--surface-card)', padding: '28px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-primary)', margin: '0 0 var(--sp-lg)' }}>// LOG IN</p>

            {errorMsg && (
              <p style={{ color: 'var(--text-danger)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-md)' }}>
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleLogin}>
              <OField label="ORGANIZER EMAIL" placeholder="you@collective.xyz" type="email" value={loginEmail} onChange={setLoginEmail} />
              <OField label="PASSWORD" placeholder="••••••••" type="password" value={loginPassword} onChange={setLoginPassword} />

              <div style={{ marginTop: 'var(--sp-xl)' }}>
                <CBtn variant="solid" type="submit" style={{ width: '100%' }}>
                  ENTER CONSOLE
                </CBtn>
              </div>
            </form>
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', letterSpacing: 'var(--ls-wide)', textAlign: 'center', margin: 'var(--sp-lg) 0 0' }}>invite-only platform · collectives are provisioned by m3hfil</p>
        </div>
      </div>
    </div>
  );
}
