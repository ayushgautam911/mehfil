import { useState, type CSSProperties, useRef, useEffect } from 'react';
import { CHeader, Body, CBtn, Panel } from '../components/primitives';
import { type EmailTemplate, TEMPLATE_TOKENS, newTemplateId } from '../templates';
import { api } from '../api';

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--surface-chrome)',
  border: '1px solid var(--border-hairline)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--fs-sm)',
  color: 'var(--text-primary)',
  padding: '10px 12px',
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', margin: '0 0 8px' }}>
      {children}
    </p>
  );
}

function ToolbarBtn({
  onClick,
  title,
  children,
  style,
  active = false,
}: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
  style?: CSSProperties;
  active?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        appearance: 'none',
        background: active
          ? 'var(--accent-primary)'
          : hovered
          ? 'var(--accent-primary-wash)'
          : 'transparent',
        border: `1px solid ${active || hovered ? 'var(--accent-primary)' : 'var(--border-hairline)'}`,
        color: active
          ? 'var(--surface-card)'
          : hovered
          ? 'var(--accent-primary)'
          : 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-xs)',
        fontWeight: 'bold',
        padding: '4px 10px',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.15s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [states, setStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    list: false,
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const updateToolbarStates = () => {
    setStates({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      list: document.queryCommandState('insertUnorderedList'),
    });
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement && editorRef.current?.contains(document.activeElement)) {
        updateToolbarStates();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (cmd: string, arg: string = '') => {
    document.execCommand(cmd, false, arg);
    handleInput();
    updateToolbarStates();
  };

  const insertLink = () => {
    const url = prompt('Enter link URL (e.g. https://example.com):');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCmd('insertImage', url);
    }
  };

  return (
    <div style={{ border: '1px solid var(--border-hairline)', background: 'var(--surface-chrome)' }}>
      {/* Editor Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 8, borderBottom: '1px solid var(--border-hairline)', background: 'rgba(255,255,255,0.02)' }}>
        <ToolbarBtn onClick={() => execCmd('bold')} title="Bold" active={states.bold}>B</ToolbarBtn>
        <ToolbarBtn onClick={() => execCmd('italic')} title="Italic" active={states.italic} style={{ fontStyle: 'italic' }}>I</ToolbarBtn>
        <ToolbarBtn onClick={() => execCmd('underline')} title="Underline" active={states.underline} style={{ textDecoration: 'underline' }}>U</ToolbarBtn>
        <div style={{ width: 1, background: 'var(--border-hairline)', margin: '0 2px' }} />
        <ToolbarBtn onClick={() => execCmd('insertUnorderedList')} title="Bullet List" active={states.list}>• List</ToolbarBtn>
        <ToolbarBtn onClick={() => execCmd('formatBlock', '<p>')} title="Paragraph">P</ToolbarBtn>
        <div style={{ width: 1, background: 'var(--border-hairline)', margin: '0 2px' }} />
        <ToolbarBtn onClick={insertLink} title="Insert Link">Link</ToolbarBtn>
        <ToolbarBtn onClick={insertImage} title="Insert Image">Image</ToolbarBtn>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight: 240,
          padding: '12px 14px',
          outline: 'none',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-sm)',
          lineHeight: 'var(--lh-body)',
          overflowY: 'auto',
          background: 'transparent',
        }}
      />
    </div>
  );
}

export default function EmailTemplates({
  templates,
  collectiveId,
  onReload,
}: {
  templates: EmailTemplate[];
  collectiveId: string;
  onReload: () => void;
}) {
  const [list, setList] = useState<EmailTemplate[]>(templates);
  const [selectedId, setSelectedId] = useState<string | null>(templates[0]?.id ?? null);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  // Keep list synchronized when database refetches templates prop
  useEffect(() => {
    setList(templates);
    if (!selectedId && templates[0]) {
      setSelectedId(templates[0].id);
    }
  }, [templates]);

  const selected = list.find((t) => t.id === selectedId) || null;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const updateSelected = (patch: Partial<EmailTemplate>) => {
    if (!selected) return;
    setList((prev) => prev.map((t) => (t.id === selected.id ? { ...t, ...patch } : t)));
  };

  const addTemplate = () => {
    const t: EmailTemplate = { id: newTemplateId(), name: 'New template', subject: '', body: '<p>write your template message...</p>' };
    setList((prev) => [...prev, t]);
    setSelectedId(t.id);
  };

  const deleteSelected = () => {
    if (!selected) return;
    setList((prev) => {
      const next = prev.filter((t) => t.id !== selected.id);
      setSelectedId(next[0]?.id ?? null);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      // Find deleted templates
      const deleted = templates.filter(t => !list.some(l => l.id === t.id));
      for (const t of deleted) {
        if (!t.id.startsWith('t_')) {
          await api.templates.delete(collectiveId, t.id);
        }
      }

      // Save/Update remaining templates
      for (const t of list) {
        if (t.id.startsWith('t_')) {
          // New template
          await api.templates.create(collectiveId, {
            name: t.name,
            subject: t.subject,
            body: t.body,
          });
        } else {
          // Check if it actually changed
          const original = templates.find(orig => orig.id === t.id);
          if (!original || original.name !== t.name || original.subject !== t.subject || original.body !== t.body) {
            await api.templates.update(collectiveId, t.id, {
              name: t.name,
              subject: t.subject,
              body: t.body,
            });
          }
        }
      }

      onReload();
      flash('Templates saved.');
    } catch (err: any) {
      console.error(err);
      flash(`Error saving templates: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CHeader
        title="EMAIL TEMPLATES"
        sub="reusable email templates · used from each event's communications"
        action={<CBtn variant="solid" onClick={save} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</CBtn>}
      />
      <Body>
        {toast && (
          <div style={{ padding: '10px 14px', border: '1px solid var(--accent-primary)', background: 'var(--accent-primary-wash)', color: 'var(--accent-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-md)' }}>
            {toast}
          </div>
        )}
        {/* Persistence status notice */}
        <div style={{ display: 'flex', gap: 'var(--sp-md)', padding: '12px 14px', border: '1px solid var(--accent-secondary)', background: 'var(--accent-secondary-wash, rgba(10,189,198,0.06))', marginBottom: 'var(--sp-lg)' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--accent-secondary)', flex: 'none', paddingTop: 1 }}>Status</span>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-body)', margin: 0 }}>
            Templates are stored <strong style={{ color: 'var(--text-primary)' }}>server-side</strong> and shared across all administrators of this collective. Images are rendered using public URL references.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.6fr', gap: 'var(--sp-xl)', alignItems: 'start' }}>
          {/* Template list */}
          <Panel title="Templates" action={<CBtn variant="ghost" size="sm" onClick={addTemplate}>+ NEW</CBtn>}>
            {list.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-dim)' }}>No templates yet. Create one.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {list.map((t) => {
                  const active = t.id === selectedId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className="c-navitem"
                      style={{
                        appearance: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        position: 'relative',
                        border: 'none',
                        borderBottom: '0.5px solid var(--border-hairline)',
                        background: active ? 'var(--accent-primary-wash)' : 'transparent',
                        padding: '12px 12px',
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: active ? 'var(--accent-primary)' : 'transparent' }} />
                      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: (active ? 'var(--fw-bold)' : 'var(--fw-medium)') as unknown as number, fontSize: 'var(--fs-sm)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: active ? 'var(--accent-primary)' : 'var(--text-primary)', margin: 0 }}>{t.name || 'untitled'}</p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject || 'no subject'}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Editor */}
          <Panel title="Edit template" action={selected ? <CBtn variant="danger" size="sm" onClick={deleteSelected}>DELETE</CBtn> : undefined}>
            {!selected ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-dim)' }}>Select or create a template to edit.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-lg)' }}>
                <div>
                  <FieldLabel>Template name</FieldLabel>
                  <input value={selected.name} onChange={(e) => updateSelected({ name: e.target.value })} placeholder="e.g. Announcement" style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Subject</FieldLabel>
                  <input value={selected.subject} onChange={(e) => updateSelected({ subject: e.target.value })} placeholder="subject line..." style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>Body (Rich Text)</FieldLabel>
                  <RichTextEditor value={selected.body} onChange={(body) => updateSelected({ body })} />
                </div>
                <div style={{ border: '1px solid var(--border-hairline)', background: 'var(--surface-chrome)', padding: '12px 14px' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', letterSpacing: 'var(--ls-extra-wide)', textTransform: 'uppercase', color: 'var(--accent-primary)', margin: '0 0 8px' }}>// AVAILABLE TOKENS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-sm)' }}>
                    {TEMPLATE_TOKENS.map((tok) => (
                      <span key={tok} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', color: 'var(--accent-secondary)', border: '1px solid var(--border-hairline)', padding: '3px 7px', letterSpacing: 'var(--ls-normal)' }}>{tok}</span>
                    ))}
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-xs)', color: 'var(--text-dim)', margin: '10px 0 0', lineHeight: 'var(--lh-body)' }}>
                    tokens are replaced with the event's details when you send from an event.
                  </p>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </Body>
    </>
  );
}

