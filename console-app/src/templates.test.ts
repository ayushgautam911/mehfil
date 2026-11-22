import { describe, it, expect } from 'vitest';
import { applyTemplate, newTemplateId, DEFAULT_TEMPLATES, TEMPLATE_TOKENS, type EmailTemplate } from './templates';

describe('applyTemplate', () => {
  const tpl: EmailTemplate = {
    id: 't',
    name: 'T',
    subject: 'pass for {event}',
    body: '{event} on {date} at {time}, {venue}. — {collective}',
  };
  const vars = { event: 'Monolith', date: 'apr 04', time: '00:00', venue: 'undisclosed', collective: 'VOID' };

  it('substitutes all known tokens in subject and body', () => {
    const { subject, body } = applyTemplate(tpl, vars);
    expect(subject).toBe('pass for Monolith');
    expect(body).toBe('Monolith on apr 04 at 00:00, undisclosed. — VOID');
  });

  it('leaves unknown tokens untouched', () => {
    const { body } = applyTemplate({ ...tpl, body: 'hi {unknown}' }, vars);
    expect(body).toBe('hi {unknown}');
  });

  it('replaces every occurrence of a repeated token', () => {
    const { body } = applyTemplate({ ...tpl, body: '{event} {event} {event}' }, vars);
    expect(body).toBe('Monolith Monolith Monolith');
  });
});

describe('newTemplateId', () => {
  it('is prefixed and unique', () => {
    const a = newTemplateId();
    const b = newTemplateId();
    expect(a).toMatch(/^t_/);
    expect(a).not.toBe(b);
  });
});

describe('DEFAULT_TEMPLATES', () => {
  const known = new Set(TEMPLATE_TOKENS.map((t) => t.replace(/[{}]/g, '')));

  it('every template has id, name, subject and body', () => {
    for (const t of DEFAULT_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(typeof t.subject).toBe('string');
      expect(typeof t.body).toBe('string');
    }
  });

  it('templates only reference known tokens', () => {
    for (const t of DEFAULT_TEMPLATES) {
      const tokens = [...(t.subject + ' ' + t.body).matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      for (const tok of tokens) {
        expect(known.has(tok), `unknown token {${tok}} in template "${t.name}"`).toBe(true);
      }
    }
  });
});
