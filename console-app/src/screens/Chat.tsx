import { useState } from 'react';
import { CHeader, CBtn, CAvatar } from '../components/primitives';
import { chats } from '../data';

export default function Chat() {
  const [active, setActive] = useState(chats[0].id);
  const ch = chats.find((c) => c.id === active) || chats[0];
  return (
    <>
      <CHeader title="CHAT" sub="direct line with your members" />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* thread list */}
        <div style={{ width: 280, flex: 'none', borderRight: '1px solid var(--border-hairline)', overflowY: 'auto' }}>
          {chats.map((c) => {
            const on = c.id === active;
            return (
              <div key={c.id} onClick={() => setActive(c.id)} className="c-clickable" style={{ display: 'flex', gap: 12, padding: '16px 18px', borderBottom: '0.5px solid var(--border-hairline)', background: on ? 'var(--accent-primary-wash)' : 'transparent', position: 'relative' }}>
                {on && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--accent-primary)' }} />}
                <CAvatar name={c.member} size={38} glow={c.unread > 0} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-sm)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-primary)' }}>{c.member}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--text-dim)' }}>{c.lastTime}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</p>
                </div>
                {c.unread > 0 ? <span style={{ width: 7, height: 7, flex: 'none', background: 'var(--accent-primary)', boxShadow: 'var(--glow-green-sm)', marginTop: 6 }} /> : null}
              </div>
            );
          })}
        </div>
        {/* thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: '1px solid var(--border-hairline)' }}>
            <CAvatar name={ch.member} size={34} />
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-md)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-primary)', margin: 0 }}>{ch.member}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: 'var(--ls-wide)', color: 'var(--accent-primary)', margin: '2px 0 0' }}>● MEMBER · VOID</p>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {ch.messages.map((m, i) => {
              const mine = m.from === 'me';
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: 'var(--sp-md)' }}>
                  <div style={{ maxWidth: '70%', padding: '10px 14px', border: mine ? '1px solid var(--accent-primary)' : '0.5px solid var(--border-hairline)', background: mine ? 'var(--accent-primary-wash)' : 'var(--surface-card)' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-md)', color: 'var(--text-primary)', lineHeight: 'var(--lh-body)', margin: 0 }}>{m.text}</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: 'var(--ls-wide)', marginTop: 4 }}>{m.time}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-md)', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border-hairline)' }}>
            <input placeholder="reply to member..." style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-hairline)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-md)', color: 'var(--text-primary)', padding: '8px 0' }} />
            <CBtn variant="primary" size="sm">SEND</CBtn>
          </div>
        </div>
      </div>
    </>
  );
}
