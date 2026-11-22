import { useState, type CSSProperties } from 'react';
import { CHeader, Body, CBtn, Table, Row, CStatus, cellText, Panel, CAvatar, type Col } from '../components/primitives';
import { api } from '../api';
import { type EmailTemplate, applyTemplate } from '../templates';

export interface ConsoleEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  endTime?: string | null;
  venue: string;
  venueAddress?: string | null;
  status: 'published' | 'draft';
  capacity: number;
  passesIssued: number;
  requests: number;
  description?: string | null;
  imageUrl?: string | null;
  addressRevealAt?: string | null;
  lineup?: string[] | null;
  genres?: string[] | null;
  passHolders: string[];
  passes?: {
    eventId: string;
    userId: string;
    qrToken: string;
    qrSignature: string;
    status?: string;
    usedAt?: string | null;
  }[];
}

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

interface EventsProps {
  events: ConsoleEvent[];
  members: Member[];
  collectiveId: string;
  collectiveName: string;
  templates: EmailTemplate[];
  triggerReload: () => void;
}

function Field({
  label,
  placeholder,
  full,
  value,
  onChange,
  type = 'text',
  min,
  max,
}: {
  label: string;
  placeholder: string;
  full?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>{label}</p>
      <input type={type} min={min} max={max} placeholder={placeholder} value={value} onChange={onChange} style={fieldInput} />
    </div>
  );
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
  // Makes native date/time/datetime pickers render their icons + popups in
  // dark mode — without this they're dark-on-dark and look broken.
  colorScheme: 'dark',
};

// Tag/bubble input — type a value, press Enter or comma to add it as a chip.
// Backspace on an empty input removes the last chip. Dupes/empties are skipped.
function ChipInput({
  label,
  placeholder,
  value,
  onChange,
  draft,
  onDraftChange,
}: {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (v: string[]) => void;
  draft: string;
  onDraftChange: (v: string) => void;
}) {
  const commit = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    onDraftChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', borderBottom: '1px solid var(--border-hairline)', padding: '6px 0' }}>
        {value.map((chip, i) => (
          <span key={chip} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', background: 'var(--accent-primary-wash)', padding: '4px 8px' }}>
            {chip}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              style={{ appearance: 'none', background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: 'var(--fs-sm)', lineHeight: 1, padding: 0 }}
              aria-label={`Remove ${chip}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length ? '' : placeholder}
          style={{ flex: 1, minWidth: 120, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-md)', color: 'var(--text-primary)', padding: '4px 0' }}
        />
      </div>
    </div>
  );
}

export interface NewEventPayload {
  name: string;
  date: string;
  time: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  capacity: number;
  description: string;
  imageUrl: string;
  addressRevealAt: string;
  lineup: string[];
  genres: string[];
}

const MAX_IMAGE_MB = 5;

function EventForm({
  mode,
  initial,
  onSubmit,
  onBack,
}: {
  mode: 'create' | 'edit';
  initial?: ConsoleEvent;
  onSubmit: (payload: NewEventPayload) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [time, setTime] = useState(initial?.time ?? '');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '');
  const [venue, setVenue] = useState(initial?.venue ?? 'warehouse');
  const [venueAddress, setVenueAddress] = useState(initial?.venueAddress ?? '');
  const [capacity, setCapacity] = useState(initial ? String(initial.capacity) : '500');
  const [description, setDescription] = useState(initial?.description ?? '');
  // Image: a newly picked file (with a local preview), or the already-stored
  // URL when editing. Picking a file replaces the stored one on save.
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initial?.imageUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [lineup, setLineup] = useState<string[]>(initial?.lineup ?? []);
  const [genres, setGenres] = useState<string[]>(initial?.genres ?? []);
  const [lineupDraft, setLineupDraft] = useState('');
  const [genresDraft, setGenresDraft] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setErrorMsg('Event image must be an image file');
      return;
    }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrorMsg(`Event image must be under ${MAX_IMAGE_MB} MB`);
      return;
    }
    setErrorMsg('');
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handlePublish = async () => {
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Event name is required');
      return;
    }
    if (!date.trim()) {
      setErrorMsg('Event date is required');
      return;
    }
    if (!time.trim()) {
      setErrorMsg('Doors opening time is required');
      return;
    }
    // End time is required going forward, but editing an older event (created
    // before end times existed) shouldn't be blocked on it.
    if (mode === 'create' && !endTime.trim()) {
      setErrorMsg('End time is required');
      return;
    }
    const capNum = parseInt(capacity);
    if (isNaN(capNum) || capNum <= 0) {
      setErrorMsg('Capacity must be a positive integer');
      return;
    }
    if (capNum > 500) {
      setErrorMsg('Capacity cannot exceed 500');
      return;
    }
    if (mode === 'edit' && initial && capNum < initial.passesIssued) {
      setErrorMsg(`Capacity cannot be below passes already issued (${initial.passesIssued})`);
      return;
    }
    if (!venue.trim()) {
      setErrorMsg('Venue name is required');
      return;
    }
    // "Not in the past" rules only apply when creating — editing an existing
    // (possibly near-term) event shouldn't be blocked by them.
    if (mode === 'create') {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      const eventDay = new Date(`${date}T00:00`);
      if (eventDay < todayMidnight) {
        setErrorMsg('Event date must be today or in the future');
        return;
      }
    }

    const finalLineup = [...lineup];
    if (lineupDraft.trim() && !finalLineup.includes(lineupDraft.trim())) {
      finalLineup.push(lineupDraft.trim());
    }
    const finalGenres = [...genres];
    if (genresDraft.trim() && !finalGenres.includes(genresDraft.trim())) {
      finalGenres.push(genresDraft.trim());
    }

    // Upload a newly picked image first. With no new file, keep the stored
    // URL only while its preview is still showing — REMOVE clears it.
    let imageUrl = imagePreview ? initial?.imageUrl ?? '' : '';
    if (imageFile) {
      setSaving(true);
      try {
        imageUrl = await api.uploads.eventImage(imageFile);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to upload event image');
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    onSubmit({
      name,
      date,
      time,
      endTime: endTime.trim(),
      venue,
      venueAddress: venueAddress.trim(),
      capacity: capNum,
      description,
      imageUrl,
      // Reveal has no FE controls yet — pass any stored value through untouched
      // so editing an event doesn't wipe it on the server.
      addressRevealAt: initial?.addressRevealAt ?? '',
      lineup: finalLineup,
      genres: finalGenres,
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  // In edit mode, don't clamp the date picker to "today" — an existing event
  // may already have a past date we shouldn't invalidate.
  const dateMin = mode === 'create' ? todayStr : undefined;
  const capMin = mode === 'edit' && initial ? String(initial.passesIssued) : '1';

  return (
    <>
      <CHeader
        title={mode === 'edit' ? 'EDIT EVENT' : 'NEW EVENT'}
        sub={mode === 'edit' ? 'update event details' : 'draft — publish when ready'}
        action={
          <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
            <CBtn variant="ghost" onClick={onBack}>CANCEL</CBtn>
            <CBtn variant="solid" onClick={handlePublish} disabled={saving}>{saving ? 'UPLOADING…' : mode === 'edit' ? 'SAVE' : 'PUBLISH'}</CBtn>
          </div>
        }
      />
      <Body>
        <div style={{ maxWidth: 760 }}>
          {errorMsg && (
            <div style={{ padding: '10px 14px', border: '1px solid var(--accent-danger, #ff3333)', background: 'rgba(255, 51, 51, 0.05)', color: 'var(--accent-danger, #ff3333)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-md)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)' }}>
              {errorMsg}
            </div>
          )}
          <Panel title="Details">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-lg)' }}>
              <Field label="Event name" placeholder="void: warehouse session" full value={name} onChange={(e) => setName(e.target.value)} />
              <Field label="Date" placeholder="sat apr 26" type="date" min={dateMin} value={date} onChange={(e) => setDate(e.target.value)} />
              <Field label="Capacity (max 500)" placeholder="500" type="number" min={capMin} max="500" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              <Field label="Doors" placeholder="23:00" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <Field label="Ends" placeholder="04:00" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              <Field label="Venue name" placeholder="warehouse" value={venue} onChange={(e) => setVenue(e.target.value)} />
              <Field label="Venue address" placeholder="unit 4, district 2" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} />
            </div>
            <div style={{ marginTop: 'var(--sp-lg)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>Event image (flyer)</p>
              {imagePreview && (
                <img src={imagePreview} alt="Event flyer preview" style={{ display: 'block', maxWidth: 240, maxHeight: 240, objectFit: 'cover', border: '1px solid var(--border-hairline)', marginBottom: 8 }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)' }}>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImagePick} style={{ ...fieldInput, borderBottom: 'none', padding: 0, fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', width: 'auto' }} />
                {imagePreview && (
                  <CBtn variant="ghost" size="sm" onClick={() => { setImageFile(null); setImagePreview(''); }}>REMOVE</CBtn>
                )}
              </div>
            </div>
            <div style={{ marginTop: 'var(--sp-lg)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>Description</p>
              <textarea
                placeholder="what to expect, floor rules, anything attendees should know…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ ...fieldInput, resize: 'vertical', lineHeight: 'var(--lh-body)' }}
              />
            </div>
          </Panel>
          <div style={{ height: 'var(--sp-lg)' }} />
          <Panel title="Access & visibility">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-lg)' }}>
              <ChipInput label="Lineup" placeholder="add an artist, press enter" value={lineup} onChange={setLineup} draft={lineupDraft} onDraftChange={setLineupDraft} />
              <ChipInput label="Genres" placeholder="add a genre, press enter" value={genres} onChange={setGenres} draft={genresDraft} onDraftChange={setGenresDraft} />
            </div>
          </Panel>
        </div>
      </Body>
    </>
  );
}

const searchInputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--surface-chrome)',
  border: '1px solid var(--border-hairline)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--fs-sm)',
  color: 'var(--text-primary)',
  padding: '10px 12px',
  marginBottom: 'var(--sp-md)',
};

const bracket = (s: CSSProperties): CSSProperties => ({ position: 'absolute', width: 22, height: 22, borderColor: 'var(--accent-primary)', ...s });

const scannerInputStyle: CSSProperties = {
  width: '80%',
  boxSizing: 'border-box',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid var(--border-glow)',
  outline: 'none',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-xs)',
  color: 'var(--accent-primary)',
  textAlign: 'center',
  padding: '10px',
  marginBottom: 'var(--sp-md)',
  boxShadow: 'var(--glow-green-sm)',
  zIndex: 10,
};

function Scanner({ triggerReload }: { triggerReload: () => void }) {
  const [qrPayload, setQrPayload] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrPayload.trim()) return;
    setStatus('scanning');
    setErrorMsg('');
    try {
      const data = await api.passes.scan(qrPayload.trim());
      setResult(data);
      setStatus('success');
      setQrPayload('');
      triggerReload();
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    setQrPayload('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 'var(--sp-lg)', alignItems: 'center', paddingTop: 'var(--sp-xs)' }}>
      {/* viewport */}
      <div style={{ position: 'relative', aspectRatio: '1 / 1', border: '1px solid var(--border-hairline)', background: 'var(--surface-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 20 }}>
        <div style={{ position: 'absolute', inset: 24, border: '1px solid var(--border-glow)' }} />
        <span style={bracket({ top: 16, left: 16, borderTop: '2px solid', borderLeft: '2px solid' })} />
        <span style={bracket({ top: 16, right: 16, borderTop: '2px solid', borderRight: '2px solid' })} />
        <span style={bracket({ bottom: 16, left: 16, borderBottom: '2px solid', borderLeft: '2px solid' })} />
        <span style={bracket({ bottom: 16, right: 16, borderBottom: '2px solid', borderRight: '2px solid' })} />
        <div className="hive-scan-line" style={{ position: 'absolute', left: 24, right: 24, height: 2, background: 'var(--accent-primary)', boxShadow: 'var(--glow-green-md)', animation: 'scan-line 1.6s linear infinite' }} />
        
        {/* Form container inside viewport */}
        <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 10 }}>
          <input
            placeholder="PASTE QR PAYLOAD..."
            value={qrPayload}
            onChange={(e) => setQrPayload(e.target.value)}
            style={scannerInputStyle}
            disabled={status === 'scanning'}
          />
          <CBtn variant="solid" size="sm" type="submit" disabled={status === 'scanning' || !qrPayload.trim()}>
            {status === 'scanning' ? 'VALIDATING...' : 'SUBMIT SCAN'}
          </CBtn>
        </form>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', letterSpacing: 'var(--ls-wide)', position: 'absolute', bottom: 28 }}>CAM · DOOR_01</span>
      </div>
      {/* result */}
      <div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 var(--sp-md)' }}>// LAST SCAN</p>
        {status === 'idle' && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-md)', color: 'var(--text-dim)', letterSpacing: 'var(--ls-wide)' }}>awaiting code…</p>
        )}
        {status === 'scanning' && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-md)', color: 'var(--text-dim)', letterSpacing: 'var(--ls-wide)' }}>validating signature…</p>
        )}
        {status === 'success' && result && (
          <div className="hive-pop">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-md)' }}>
              <span style={{ width: 10, height: 10, background: 'var(--accent-primary)', boxShadow: 'var(--glow-green-md)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-xl)', letterSpacing: 'var(--ls-wide)', color: 'var(--accent-primary)' }}>ADMIT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--sp-md)', border: '1px solid var(--accent-primary)', background: 'var(--accent-primary-wash)' }}>
              <CAvatar name={result.memberName} size={40} glow />
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-md)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-primary)', margin: 0 }}>{result.memberName}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', letterSpacing: 'var(--ls-wide)', margin: '3px 0 0' }}>PASS VALID · 1 ENTRY</p>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', letterSpacing: 'var(--ls-normal)', margin: 'var(--sp-md) 0 0' }}>
              checked in {new Date(result.scannedAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </p>
            <div style={{ marginTop: 'var(--sp-lg)' }}>
              <CBtn variant="ghost" size="sm" onClick={handleReset}>SCAN NEXT</CBtn>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="hive-pop">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-md)' }}>
              <span style={{ width: 10, height: 10, background: 'var(--accent-danger, #ff3333)', boxShadow: '0 0 8px var(--accent-danger, #ff3333)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-xl)', letterSpacing: 'var(--ls-wide)', color: 'var(--accent-danger, #ff3333)' }}>DENIED</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 'var(--sp-md)', border: '1px solid var(--accent-danger, #ff3333)', background: 'rgba(255, 51, 51, 0.05)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' as unknown as number, fontSize: 'var(--fs-sm)', letterSpacing: 'var(--ls-wide)', color: 'var(--text-primary)', margin: 0 }}>{errorMsg.toUpperCase()}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', letterSpacing: 'var(--ls-wide)', margin: 0 }}>check signature/validity</p>
            </div>
            <div style={{ marginTop: 'var(--sp-lg)' }}>
              <CBtn variant="ghost" size="sm" onClick={handleReset}>SCAN NEXT</CBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Communications: pick a managed template, preview, open in system mail client ──
const RECIPIENT_LABELS: Record<'ALL' | 'SENT' | 'NOT_SENT', string> = {
  ALL: 'all members',
  SENT: 'pass holders',
  NOT_SENT: 'members without a pass',
};

function CommsPill({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-xs)',
        fontWeight: (active ? 'var(--fw-bold)' : 'var(--fw-regular)') as unknown as number,
        letterSpacing: 'var(--ls-wide)',
        textTransform: 'uppercase',
        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-hairline)'}`,
        background: active ? 'var(--accent-primary-wash)' : 'transparent',
        padding: '6px 12px',
      }}
    >
      {label}{count != null ? ` · ${count}` : ''}
    </button>
  );
}

function CommsLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-primary)', margin: '0 0 var(--sp-sm)' }}>
      // {children}
    </p>
  );
}

function Communications({
  event,
  members,
  collectiveId,
  collectiveName,
  templates,
}: {
  event: ConsoleEvent;
  members: Member[];
  collectiveId: string;
  collectiveName: string;
  templates: EmailTemplate[];
}) {
  const passHolders = (event.passHolders || []).filter((id) =>
    members.some((m) => m.id === id)
  );

  const [recipientGroup, setRecipientGroup] = useState<'ALL' | 'SENT' | 'NOT_SENT'>('ALL');
  const [templateId, setTemplateId] = useState<string | null>(templates[0]?.id ?? null);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');

  const template = templates.find((t) => t.id === templateId) || templates[0] || null;

  const vars: Record<string, string> = {
    event: event.name,
    date: event.date,
    time: event.time,
    venue: event.venue,
    collective: collectiveName,
  };
  const preview = template ? applyTemplate(template, vars) : { subject: '', body: '' };

  const activeMembers = members.filter((m) => m.status !== 'blocked');
  const groups: Record<typeof recipientGroup, Member[]> = {
    ALL: activeMembers,
    SENT: activeMembers.filter((m) => passHolders.includes(m.id)),
    NOT_SENT: activeMembers.filter((m) => !passHolders.includes(m.id)),
  };
  const recipients = groups[recipientGroup].filter((m) => !!m.email);
  const missingEmail = groups[recipientGroup].length - recipients.length;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const sendMail = async () => {
    if (recipients.length === 0 || !template) return;
    setConfirming(false);
    setSending(true);
    try {
      const res = await api.email.send(collectiveId, {
        subject: template.subject,
        bodyHtml: template.body,
        recipientGroup,
        eventId: event.id,
      });
      if (res.errorCount > 0) {
        flash(`Sent ${res.sentCount} emails. ${res.errorCount} failed: ${res.lastError || 'Unknown error'}`);
      } else {
        flash(`Successfully sent to ${res.sentCount} recipients!`);
      }
    } catch (err: any) {
      console.error(err);
      flash(`Failed to send email: ${err?.message || err}`);
    } finally {
      setSending(false);
    }
  };

  if (templates.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-dim)', lineHeight: 'var(--lh-body)', margin: 0 }}>
        no email templates yet. create one in the EMAIL TEMPLATES section.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>
      {toast && (
        <div style={{ padding: '10px 14px', border: '1px solid var(--accent-primary)', background: 'var(--accent-primary-wash)', color: 'var(--accent-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-md)' }}>
          {toast}
        </div>
      )}

      <div>
        <CommsLabel>Recipients</CommsLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-sm)' }}>
          <CommsPill label="All members" count={groups.ALL.length} active={recipientGroup === 'ALL'} onClick={() => setRecipientGroup('ALL')} />
          <CommsPill label="Pass holders" count={groups.SENT.length} active={recipientGroup === 'SENT'} onClick={() => setRecipientGroup('SENT')} />
          <CommsPill label="Not sent" count={groups.NOT_SENT.length} active={recipientGroup === 'NOT_SENT'} onClick={() => setRecipientGroup('NOT_SENT')} />
        </div>
      </div>

      <div>
        <CommsLabel>Template</CommsLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-sm)' }}>
          {templates.map((t) => (
            <CommsPill key={t.id} label={t.name} active={t.id === (template?.id ?? null)} onClick={() => setTemplateId(t.id)} />
          ))}
        </div>
      </div>

      {/* Email preview */}
      <div>
        <CommsLabel>Preview</CommsLabel>
        <div style={{ border: '1px solid var(--border-hairline)', background: 'var(--surface-chrome)' }}>
          <div style={{ display: 'flex', gap: 'var(--sp-md)', padding: '12px 14px', borderBottom: '1px solid var(--border-hairline)' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-dim)', flex: 'none', paddingTop: 1 }}>Subject</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>{preview.subject || '—'}</span>
          </div>
          <div
            style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-body)', margin: 0, padding: '14px' }}
            dangerouslySetInnerHTML={{ __html: preview.body || '—' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--sp-md)', flexWrap: 'wrap' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', letterSpacing: 'var(--ls-normal)', lineHeight: 'var(--lh-body)', margin: 0, maxWidth: 360 }}>
          sends rich text email directly from the server to {recipients.length} recipient{recipients.length === 1 ? '' : 's'}.
          {missingEmail > 0 ? ` ${missingEmail} skipped (no email on file).` : ''}
        </p>
        <CBtn variant="solid" onClick={() => setConfirming(true)} disabled={recipients.length === 0 || !template || sending}>
          {sending ? 'SENDING...' : 'SEND EMAIL'}
        </CBtn>
      </div>

      {confirming && template && (
        <ConfirmSend
          templateName={template.name}
          recipientLabel={RECIPIENT_LABELS[recipientGroup]}
          count={recipients.length}
          onCancel={() => setConfirming(false)}
          onConfirm={sendMail}
        />
      )}
    </div>
  );
}

function ConfirmSend({
  templateName,
  recipientLabel,
  count,
  onCancel,
  onConfirm,
}: {
  templateName: string;
  recipientLabel: string;
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="hive-pop"
        style={{ width: 460, maxWidth: '100%', background: 'var(--surface-card)', border: '1px solid var(--border-glow)', boxShadow: 'var(--glow-green-md)', padding: '24px' }}
      >
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-primary)', margin: '0 0 var(--sp-md)' }}>// CONFIRM SEND</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-md)', color: 'var(--text-primary)', lineHeight: 'var(--lh-body)', margin: '0 0 var(--sp-sm)' }}>
          Sending “<span style={{ color: 'var(--accent-primary)' }}>{templateName}</span>” email to <span style={{ color: 'var(--accent-primary)' }}>{recipientLabel}</span> — {count} recipient{count === 1 ? '' : 's'}.
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', margin: '0 0 var(--sp-xl)' }}>
          This action is irreversible.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-sm)' }}>
          <CBtn variant="ghost" onClick={onCancel}>CANCEL</CBtn>
          <CBtn variant="solid" onClick={onConfirm}>CONFIRM &amp; SEND</CBtn>
        </div>
      </div>
    </div>
  );
}


function EventStat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ minWidth: 120 }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-md)', color: accent ? 'var(--accent-primary)' : 'var(--text-primary)', margin: 0 }}>{value}</p>
    </div>
  );
}

// Read-only labelled block in the Event Details panel.
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 'var(--sp-lg)', paddingTop: 'var(--sp-lg)', borderTop: '1px solid var(--border-hairline)' }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', margin: '0 0 8px' }}>{label}</p>
      {children}
    </div>
  );
}

// Read-only chip list (lineup / genres display).
function MetaChips({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((c) => (
        <span key={c} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', background: 'var(--accent-primary-wash)', padding: '4px 8px' }}>{c}</span>
      ))}
    </div>
  );
}

function EventDetail({
  event,
  members,
  collectiveId,
  collectiveName,
  templates,
  onBack,
  onEdit,
  onSendPass,
  triggerReload,
}: {
  event: ConsoleEvent;
  members: Member[];
  collectiveId: string;
  collectiveName: string;
  templates: EmailTemplate[];
  onBack: () => void;
  onEdit: () => void;
  onSendPass: (memberId: string) => Promise<any>;
  triggerReload: () => void;
}) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'NOT_SENT' | 'SENT' | 'SCAN'>('NOT_SENT');
  const [toastMsg, setToastMsg] = useState('');

  const passHolders = (event.passHolders || []).filter((id) =>
    members.some((m) => m.id === id)
  );

  const searchFiltered = members.filter((m) =>
    m.handle.toLowerCase().includes(search.toLowerCase())
  );

  // Same ordering as the Members list: active members first (in their
  // existing order), blocked members last. Stable sort, so unblocking a
  // member returns them to their earlier position.
  const list = (tab === 'SENT'
    ? searchFiltered.filter((m) => passHolders.includes(m.id))
    : searchFiltered.filter((m) => !passHolders.includes(m.id))
  ).sort((a, b) => (a.status === 'blocked' ? 1 : 0) - (b.status === 'blocked' ? 1 : 0));

  const handleSend = async (memberId: string, handle: string) => {
    try {
      const res = await onSendPass(memberId);
      const email = res?.email;
      if (email?.sent) {
        setToastMsg(`Pass sent to ${handle} — emailed to ${email.to}`);
      } else if (email && email.configured === false) {
        setToastMsg(`Pass created for ${handle}. Email not configured (set SMTP on the server) — no email sent.`);
      } else if (email?.to) {
        setToastMsg(`Pass created for ${handle}, but the email to ${email.to} failed to send.`);
      } else {
        setToastMsg(`Pass created for ${handle}, but no email address is on file.`);
      }
      setTimeout(() => setToastMsg(''), 4500);
    } catch (err: any) {
      setToastMsg(`Error: ${err.message || 'Failed to send pass'}`);
      setTimeout(() => setToastMsg(''), 5000);
    }
  };

  const memberCols: Col[] = [
    { label: 'Member', w: '2fr' },
    { label: 'Status', w: '1fr' },
    { label: '', w: '2fr', align: 'right' },
  ];

  return (
    <>
      <CHeader
        title={event.name}
        sub={`${event.date} · ${event.time}${event.endTime ? `–${event.endTime}` : ''} · ${event.venue}`}
        action={<CBtn variant="ghost" onClick={onBack}>BACK TO EVENTS</CBtn>}
      />
      <Body>
        {toastMsg && (
          <div style={{ padding: '10px 14px', border: '1px solid var(--accent-primary)', background: 'var(--accent-primary-wash)', color: 'var(--accent-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-md)' }}>
            {toastMsg}
          </div>
        )}
        {/* Event details — full width, on top */}
        <Panel title="Event Details" action={<CBtn variant="ghost" size="sm" onClick={onEdit}>EDIT</CBtn>}>
          {event.imageUrl && (
            <img src={event.imageUrl} alt={`${event.name} flyer`} style={{ display: 'block', maxWidth: 320, maxHeight: 320, objectFit: 'cover', border: '1px solid var(--border-hairline)', marginBottom: 'var(--sp-lg)' }} />
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-xxl)' }}>
            <EventStat label="Venue" value={event.venue} />
            <EventStat label="Venue address" value={event.venueAddress || '—'} />
            <EventStat label="Capacity" value={event.capacity} />
            <EventStat label="Passes Issued" value={event.passesIssued} accent />
            <EventStat label="Remaining Capacity" value={event.capacity - event.passesIssued} />
          </div>
          {event.description && (
            <DetailRow label="Description">
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-body)', whiteSpace: 'pre-wrap', margin: 0 }}>{event.description}</p>
            </DetailRow>
          )}
          {event.lineup && event.lineup.length > 0 && (
            <DetailRow label="Lineup"><MetaChips items={event.lineup} /></DetailRow>
          )}
          {event.genres && event.genres.length > 0 && (
            <DetailRow label="Genres"><MetaChips items={event.genres} /></DetailRow>
          )}
        </Panel>

        <div style={{ height: 'var(--sp-xl)' }} />

        {/* Manage Passes (left) + Manage Communications (right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-xl)', alignItems: 'start' }}>
          {/* Members & Passes Panel */}
          <Panel title="Manage Passes">
            {tab !== 'SCAN' && (
              <input
                placeholder="Search members by handle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
              />
            )}
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-hairline)', marginBottom: 'var(--sp-md)' }}>
              {(['NOT_SENT', 'SENT', 'SCAN'] as const).map((t) => {
                const active = t === tab;
                let label = '';
                if (t === 'NOT_SENT') label = `NOT SENT (${members.length - passHolders.length})`;
                else if (t === 'SENT') label = `SENT (${passHolders.length})`;
                else label = 'SCAN PASS';

                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    style={{
                      appearance: 'none',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      borderBottom: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      padding: '10px 16px',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: (active ? 'var(--fw-bold)' : 'var(--fw-regular)') as unknown as number,
                      fontSize: 'var(--fs-xs)',
                      letterSpacing: 'var(--ls-wide)',
                      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* List or Scanner */}
            {tab === 'SCAN' ? (
              <Scanner triggerReload={triggerReload} />
            ) : list.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>
                No members found.
              </p>
            ) : (
              <Table cols={memberCols}>
                {list.map((m) => {
                  const isBlocked = m.status === 'blocked';
                  return (
                    <Row
                      key={m.id}
                      cols={memberCols}
                      dim={isBlocked}
                      cells={[
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CAvatar name={m.handle} size={24} />
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>{m.handle}</span>
                        </div>,
                        <CStatus status={m.status} />,
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
                          {tab === 'NOT_SENT' ? (
                            <CBtn
                              variant="solid"
                              size="sm"
                              disabled={isBlocked}
                              onClick={() => handleSend(m.id, m.handle)}
                            >
                              {isBlocked ? 'BLOCKED' : 'SEND PASS'}
                            </CBtn>
                          ) : (() => {
                            const pass = (event.passes || []).find((p) => p.userId === m.id);
                            const qrPayload = pass ? `${pass.qrToken}:${pass.qrSignature}` : '';
                            const used = pass?.status === 'used';
                            return (
                              <>
                                <span style={{ color: used ? 'var(--text-dim)' : 'var(--accent-primary)', fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wide)', fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)' }}>
                                  {used ? '[ Checked in ]' : '[ Sent ]'}
                                </span>
                                {qrPayload && !used && (
                                  <CBtn
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      navigator.clipboard.writeText(qrPayload);
                                      setToastMsg(`Copied QR payload for ${m.handle}!`);
                                      setTimeout(() => setToastMsg(''), 3000);
                                    }}
                                  >
                                    COPY QR
                                  </CBtn>
                                )}
                              </>
                            );
                          })()}
                        </div>,
                      ]}
                    />
                  );
                })}
              </Table>
            )}
          </Panel>

          {/* Communications Panel */}
          <Panel title="Manage Communications">
            <Communications event={event} members={members} collectiveId={collectiveId} collectiveName={collectiveName} templates={templates} />
          </Panel>
        </div>
      </Body>
    </>
  );
}

export default function Events({ events, members, collectiveId, collectiveName, templates, triggerReload }: EventsProps) {
  const [creating, setCreating] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // Admins are organizers, not attendees — they don't receive passes or event
  // comms, so exclude them from every member list on the Events screen.
  const attendeeMembers = members.filter((m) => m.role !== 'admin');

  const handlePublish = async (payload: NewEventPayload) => {
    try {
      await api.events.create(collectiveId, {
        ...payload,
        status: 'published',
      });
      triggerReload();
      setCreating(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    }
  };

  const handleUpdate = async (payload: NewEventPayload) => {
    if (!activeEventId) return;
    try {
      await api.events.update(collectiveId, activeEventId, payload);
      triggerReload();
      setEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update event');
    }
  };

  const handleSendPass = async (memberId: string) => {
    if (!activeEventId) return;
    const data = await api.passes.send(activeEventId, memberId);
    triggerReload();
    return data;
  };

  if (creating) {
    return <EventForm mode="create" onSubmit={handlePublish} onBack={() => setCreating(false)} />;
  }

  const activeEvent = events.find((e) => e.id === activeEventId);
  if (activeEvent && editing) {
    return <EventForm mode="edit" initial={activeEvent} onSubmit={handleUpdate} onBack={() => setEditing(false)} />;
  }
  if (activeEvent) {
    return (
      <EventDetail
        event={activeEvent}
        members={attendeeMembers}
        collectiveId={collectiveId}
        collectiveName={collectiveName}
        templates={templates}
        onBack={() => setActiveEventId(null)}
        onEdit={() => setEditing(true)}
        onSendPass={handleSendPass}
        triggerReload={triggerReload}
      />
    );
  }

  const cols: Col[] = [
    { label: 'Event', w: '1.8fr' },
    { label: 'Date', w: '1.1fr' },
    { label: 'Capacity', w: '0.9fr', align: 'right' },
    { label: 'Passes', w: '0.9fr', align: 'right' },
    { label: 'Status', w: '0.9fr' },
  ];

  return (
    <>
      <CHeader
        title="EVENTS"
        sub={`${events.length} total · ${events.filter((e) => e.status === 'published').length} live`}
        action={<CBtn variant="solid" onClick={() => setCreating(true)}>+ NEW EVENT</CBtn>}
      />
      <Body>
        <Table cols={cols}>
          {events.map((e) => (
            <Row
              key={e.id}
              cols={cols}
              dim={e.status === 'draft'}
              onClick={() => setActiveEventId(e.id)}
              cells={[
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-medium)' as unknown as number, fontSize: 'var(--fs-sm)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{e.name}</span>,
                cellText(`${e.date} · ${e.time}`, { color: 'var(--text-secondary)' }),
                cellText(e.capacity),
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--accent-primary)' }}>{e.passesIssued}</span>,
                <CStatus status={e.status} />,
              ]}
            />
          ))}
        </Table>
      </Body>
    </>
  );
}


