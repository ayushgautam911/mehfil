import { useState, type CSSProperties } from 'react';
import { CHeader, Body, CBtn, CStatus, CAvatar, Table, Row, cellText, Panel, type Col } from '../components/primitives';
import { api } from '../api';
import { newMemberSchema, firstError } from '../schemas';

interface Member {
  id: string;
  handle: string;
  joined: string;
  events: number;
  rating: number;
  invites: string;
  status: 'active' | 'blocked';
  role?: 'admin' | 'member';
  email?: string;
  phone?: string;
}

interface MembershipProps {
  members: Member[];
  setMembers: (m: Member[]) => void;
  collectiveId: string;
}

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

function AddMemberForm({
  onAdd,
  onCancel,
}: {
  onAdd: (name: string, email: string, phone: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const err = firstError(newMemberSchema, { name, email });
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');
    onAdd(name, email, phone);
  };

  return (
    <Panel title="Add New Member" action={<CBtn variant="ghost" size="sm" onClick={onCancel}>CANCEL</CBtn>}>
      {errorMsg && (
        <p style={{ color: 'var(--text-danger)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', margin: '0 0 var(--sp-md)' }}>
          {errorMsg}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-lg)', marginBottom: 'var(--sp-lg)' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>Name / Handle *</p>
            <input required placeholder="@handle or name" value={name} onChange={(e) => setName(e.target.value)} style={fieldInput} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>Email *</p>
            <input required type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldInput} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>Phone Number (Optional)</p>
            <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} style={fieldInput} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-sm)', justifyContent: 'flex-end' }}>
          <CBtn variant="ghost" onClick={onCancel}>CANCEL</CBtn>
          <CBtn variant="solid" onClick={() => handleSubmit()}>ADD MEMBER</CBtn>
        </div>
      </form>
    </Panel>
  );
}

export default function Membership({ members, setMembers, collectiveId }: MembershipProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMember = async (name: string, email: string, phone: string) => {
    try {
      const cleanName = name.trim();
      const newMember = await api.collectives.addMember(collectiveId, {
        displayName: cleanName,
        email: email.trim(),
        phone: phone.trim() || undefined,
      });

      const mappedNewMember: Member = {
        id: newMember.id,
        handle: newMember.displayName,
        joined: new Date(newMember.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase(),
        events: 0,
        rating: 100,
        invites: '0 / 5',
        status: newMember.status as 'active' | 'blocked',
        role: (newMember.role as 'admin' | 'member') || 'member',
        email: newMember.email,
        phone: newMember.phone || undefined,
      };

      setMembers([mappedNewMember, ...members]);
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add member');
    }
  };

  const toggleBlock = async (id: string, currentStatus: 'active' | 'blocked') => {
    try {
      const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await api.collectives.updateMemberStatus(collectiveId, id, nextStatus);

      setMembers(
        members.map((m) =>
          m.id === id ? { ...m, status: nextStatus } : m
        )
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update member status');
    }
  };

  const cols: Col[] = [
    { label: 'Member', w: '2fr' },
    { label: 'Joined', w: '1.2fr' },
    { label: 'Events', w: '1fr', align: 'right' },
    { label: 'Status', w: '1.2fr' },
    { label: '', w: '1.5fr', align: 'right' },
  ];

  // Active members first (in their existing order), blocked members last —
  // same ordering as the Events pass lists. Stable sort, so unblocking a
  // member moves them back up into the active group.
  const orderedMembers = [...members].sort(
    (a, b) => (a.status === 'blocked' ? 1 : 0) - (b.status === 'blocked' ? 1 : 0)
  );

  return (
    <>
      <CHeader
        title="MEMBERS"
        sub={`${members.length} registered members`}
        action={
          !showAddForm ? (
            <CBtn variant="solid" onClick={() => setShowAddForm(true)}>+ ADD MEMBER</CBtn>
          ) : undefined
        }
      />
      <Body>
        {showAddForm && (
          <div style={{ marginBottom: 'var(--sp-xl)' }}>
            <AddMemberForm onAdd={handleAddMember} onCancel={() => setShowAddForm(false)} />
          </div>
        )}
        <Table cols={cols}>
          {orderedMembers.map((m) => (
            <Row
              key={m.id}
              cols={cols}
              dim={m.status === 'blocked'}
              cells={[
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CAvatar name={m.handle} size={28} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-medium)' as unknown as number, fontSize: 'var(--fs-sm)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{m.handle}</span>
                </div>,
                cellText(m.joined, { color: 'var(--text-secondary)' }),
                cellText(m.events),
                // The collective owner/admin shows as 'admin' — never active/blocked.
                <CStatus status={m.role === 'admin' ? 'admin' : m.status} />,
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {m.role === 'admin' ? null : m.status === 'blocked' ? (
                    <CBtn variant="ghost" size="sm" onClick={() => toggleBlock(m.id, m.status)}>UNBLOCK</CBtn>
                  ) : (
                    <CBtn variant="danger" size="sm" onClick={() => toggleBlock(m.id, m.status)}>BLOCK</CBtn>
                  )}
                </div>,
              ]}
            />
          ))}
        </Table>
      </Body>
    </>
  );
}

