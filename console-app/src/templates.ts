// Email templates — token-based, persisted in localStorage.
// Tokens are substituted with event/collective data when a template is used
// from an event's "Manage Communications" section.

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const STORAGE_KEY = 'hive_email_templates';

// Available substitution tokens (shown as a hint in the editor).
export const TEMPLATE_TOKENS = ['{event}', '{date}', '{time}', '{venue}', '{collective}'];

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'announce',
    name: 'Announcement',
    subject: "you're on the list — {event}",
    body: "<p>{event} is happening.</p><p>{date} · {time}<br>{venue}</p><p>watch your inbox — your entry pass and the address drop closer to the date.</p><p>— {collective}</p>",
  },
  {
    id: 'pass',
    name: 'Pass Sent',
    subject: 'your pass for {event} is live',
    body: "<p>you're in for {event}.</p><p>{date} · {time}</p><p>your entry pass is now in the M3hfil app under PASSES. present the QR at the door — it's non-transferable and the code rotates.</p><p>— {collective}</p>",
  },
  {
    id: 'address',
    name: 'Address Reveal',
    subject: '{event}: the address',
    body: "<p>{event}.</p><p>{date} · {time}<br>{venue}</p><p>doors are tight — arrive early. no phones on the floor.</p><p>— {collective}</p>",
  },
  {
    id: 'reminder',
    name: 'Reminder',
    subject: 'tonight: {event}',
    body: "<p>quick reminder — {event} is tonight.</p><p>{date} · {time}<br>{venue}</p><p>bring your pass. see you on the floor.</p><p>— {collective}</p>",
  },
  {
    id: 'cancel',
    name: 'Cancellation',
    subject: '{event}: cancelled',
    body: "<p>{event} ({date} · {time}) has been cancelled.</p><p>any issued passes are now void. we'll be back soon — keep an eye on your inbox.</p><p>— {collective}</p>",
  },
];

export function loadTemplates(): EmailTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((t) => t && t.id && typeof t.name === 'string')) {
        return parsed as EmailTemplate[];
      }
    }
  } catch {
    /* fall through to defaults */
  }
  return DEFAULT_TEMPLATES;
}

export function saveTemplates(list: EmailTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function applyTemplate(tpl: EmailTemplate, vars: Record<string, string>): { subject: string; body: string } {
  const sub = (s: string) => s.replace(/\{(\w+)\}/g, (_, key: string) => (vars[key] != null ? vars[key] : `{${key}}`));
  return { subject: sub(tpl.subject), body: sub(tpl.body) };
}

export function newTemplateId(): string {
  return 't_' + Math.random().toString(36).slice(2, 9);
}
